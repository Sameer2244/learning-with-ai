const express = require('express');
const cors = require('cors');
const path = require('path');
const topicsCatalog = require('./topics');
const reactTopicsCatalog = require('./topics-react');
const designSystemTopicsCatalog = require('./topics-design-system');
const systemDesignTopicsCatalog = require('./topics-system-design');
const { searchWeb } = require('./search');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:7b-instruct';

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Check Ollama connection & available models
app.get('/api/health', async (req, res) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const resp = await fetch(`${OLLAMA_HOST}/api/tags`, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!resp.ok) {
      return res.json({ status: 'warning', message: 'Ollama is running but returned error', model: OLLAMA_MODEL });
    }
    const data = await resp.json();
    const hasModel = data.models?.some(m => m.name.includes('qwen2.5') || m.name === OLLAMA_MODEL);
    return res.json({
      status: 'ok',
      connected: true,
      model: OLLAMA_MODEL,
      modelReady: hasModel,
      availableModels: data.models?.map(m => m.name) || []
    });
  } catch (err) {
    return res.json({
      status: 'offline',
      connected: false,
      message: 'Could not connect to Ollama at ' + OLLAMA_HOST + '. Ensure Ollama is running.',
      model: OLLAMA_MODEL
    });
  }
});

// Dedicated route for React.js Mastery view
app.get('/react', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'react.html'));
});

// Dedicated route for Design System Mastery view
app.get('/design-system', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'design-system.html'));
});

// Dedicated route for System Design & Web Architecture view
app.get('/system-design', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'system-design.html'));
});

// Get topics catalog (supports track=javascript, track=react, track=design-system, track=system-design)
app.get('/api/topics', (req, res) => {
  const track = (req.query.track || 'javascript').toLowerCase();
  if (track === 'system-design' || track === 'systemdesign' || track === 'system_design') {
    return res.json({ categories: systemDesignTopicsCatalog, track: 'system-design' });
  }
  if (track === 'design-system' || track === 'designsystem' || track === 'design_system') {
    return res.json({ categories: designSystemTopicsCatalog, track: 'design-system' });
  }
  if (track === 'react' || track === 'reactjs') {
    return res.json({ categories: reactTopicsCatalog, track: 'react' });
  }
  res.json({ categories: topicsCatalog, track: 'javascript' });
});

// Helper to call Ollama chat/generate
async function callOllama(prompt, systemPrompt, formatJson = false, customOptions = {}) {
  const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      system: systemPrompt,
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.2,
        top_p: 0.9,
        num_ctx: 4096,
        ...customOptions
      },
      format: formatJson ? 'json' : undefined
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama generation failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.response;
}

// Helper to strip accidental markdown block wrapper if LLM returned ```markdown ... ```
function sanitizeMarkdown(text) {
  if (!text) return '';
  let str = text.trim();
  if (/^```markdown/i.test(str)) {
    str = str.replace(/^```markdown\s*/i, '').replace(/\s*```$/, '');
  } else if (/^```[a-zA-Z]*/.test(str) && str.endsWith('```')) {
    // Only strip if the entire text is wrapped in a single code block
    const firstLineEnd = str.indexOf('\n');
    if (firstLineEnd !== -1) {
      str = str.slice(firstLineEnd + 1).replace(/\s*```$/, '');
    }
  }
  return str.trim();
}

// Generate new coding question for a topic
app.post('/api/generate-question', async (req, res) => {
  try {
    const { topicId, topicTitle, difficulty = 'Tricky', customFocus = '' } = req.body;

    const systemPrompt = `You are an elite Senior Staff JavaScript & React Architect and Technical Interviewer at top-tier tech companies.
Your mission is to teach candidates to deeply master JavaScript and React internals (V8 engine, call stack, execution context, event loop, memory leaks, closures, fiber reconciliation) so they NEVER have to guess tricky interview questions.

Rules:
1. Always generate a realistic, tricky, conceptual coding challenge tailored to the specified topic.
2. The challenge must test understanding of internal engine mechanics or subtle runtime traps.
3. Output MUST be strictly valid JSON matching this schema:
{
  "title": "String - compelling title",
  "difficulty": "Basic" | "Medium" | "Hard",
  "concept": "String - the exact underlying mechanism tested",
  "description": "String - markdown description of problem requirements with examples",
  "interviewTrap": "String - what candidates usually get wrong and why interviewers ask this",
  "starterCode": "String - JavaScript or React boilerplate code with comments",
  "testCases": [
    {
      "id": 1,
      "name": "String - test case description",
      "input": "String - human readable input",
      "expected": "any primitive, array, or object",
      "testFn": "String - JavaScript statement that runs the test and returns the value, e.g. return solution(1, 2);"
    }
  ],
  "hints": ["String - progressive hints without giving away the full answer"]
}`;

    const prompt = `Topic: "${topicTitle}" (ID: ${topicId})
Target Difficulty: ${difficulty}
${customFocus ? `Specific focus or tweak: ${customFocus}` : ''}

Generate a fresh, insightful coding question that targets genuine interview traps for this topic. Do not produce boilerplate trivia; generate a hands-on problem where understanding the engine mechanics is necessary to solve it.`;

    const rawOutput = await callOllama(prompt, systemPrompt, true);
    
    // Parse JSON safely
    let parsed;
    try {
      parsed = JSON.parse(rawOutput);
    } catch (parseErr) {
      // Attempt extraction if wrapped in markdown
      const match = rawOutput.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error('Failed to parse model output into JSON: ' + rawOutput.slice(0, 200));
      }
    }

    res.json({ success: true, question: parsed });
  } catch (error) {
    console.error('Error generating question:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Evaluate user's code submission
app.post('/api/evaluate-solution', async (req, res) => {
  try {
    const { track = 'javascript', topicTitle, questionTitle, problemDescription, concept, userCode, executionOutput } = req.body;
    const isReact = track === 'react' || /react|hook|fiber|state|jsx/i.test(`${topicTitle} ${questionTitle} ${concept}`);

    const systemPrompt = `You are an elite, concise technical interviewer evaluating a candidate's code submission.
Your response MUST be very small, brief, and straight to the point (strictly under 100-140 words total).
Do NOT write essays, lectures, long explanations, or generic filler.

Structure your feedback strictly using this compact markdown format:
### 🎯 Result: [PASS | PARTIAL | FAIL] (Score: X/10)
- **Verdict**: 1 direct sentence on correctness and test results.
- **Key Insight**: 1-2 concise bullet points highlighting bugs/edge cases missed or clean logic.
- **Tip**: 1 short actionable line on how to fix (if flawed) or optimize (if correct).
- **Complexity**: Time: O(...), Space: O(...)`;

    const prompt = `Track: ${isReact ? 'React.js' : 'JavaScript'}
Problem: ${questionTitle}
Concept: ${concept}

Problem Description:
${problemDescription}

Candidate's Code:
\`\`\`${isReact ? 'jsx' : 'javascript'}
${userCode}
\`\`\`

Test Run / Console Output:
\`\`\`
${executionOutput || '(No test output / not executed yet)'}
\`\`\`

Give a very small, short, on-point evaluation now (under 120 words).`;

    const rawEvaluation = await callOllama(prompt, systemPrompt, false, { num_predict: 250, temperature: 0.2 });
    const evaluation = sanitizeMarkdown(rawEvaluation);
    res.json({ success: true, evaluation });
  } catch (error) {
    console.error('Error evaluating solution:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Explain Topic & Generate Deep Knowledge Base (with optional Online Search)
app.post('/api/explain-topic', async (req, res) => {
  try {
    const { track = 'javascript', topicTitle, questionTitle, concept, problemDescription, useOnlineSearch = true } = req.body;
    const isSystemDesign = track === 'system-design' || track === 'systemdesign' || /server|deploy|docker|k8s|kubernetes|database|caching|redis|nginx|ci\/cd|observability/i.test(`${track} ${topicTitle} ${concept}`);
    const isDesignSystem = !isSystemDesign && (track === 'design-system' || track === 'designsystem' || /design\s*system|token|wcag|theming|slot|headless/i.test(`${track} ${topicTitle} ${concept}`));
    const isReact = !isSystemDesign && !isDesignSystem && (track === 'react' || /react|hook|fiber|state|jsx/i.test(`${track} ${topicTitle} ${concept} ${problemDescription}`));

    let webSearchResults = [];
    if (useOnlineSearch) {
      let searchQuery;
      if (isSystemDesign) {
        searchQuery = `System Design Web Architecture ${topicTitle} ${concept} distributed systems`;
      } else if (isDesignSystem) {
        searchQuery = `Design System ${topicTitle} ${concept} W3C Design Tokens WCAG component architecture`;
      } else if (isReact) {
        searchQuery = `React.js ${topicTitle} ${concept} react.dev explanation`;
      } else {
        searchQuery = `JavaScript ${topicTitle} ${concept} MDN explanation`;
      }
      console.log(`[WebSearch] Searching online for: "${searchQuery}"`);
      webSearchResults = await searchWeb(searchQuery, 4);
      console.log(`[WebSearch] Retrieved ${webSearchResults.length} online snippets`);
    }

    const searchContext = webSearchResults.length > 0
      ? `\n\nAUTHORITATIVE ONLINE SEARCH FINDINGS (from ${isSystemDesign ? 'Cloudflare Learning / AWS Architecture / MDN / Distributed Systems Specs' : (isDesignSystem ? 'W3C Design Tokens / WCAG / Component Architecture Specs' : (isReact ? 'React.dev / React RFCs' : 'MDN / Web Specs'))}):\n` +
        webSearchResults.map((r, i) => `[Source ${i + 1}]: ${r.snippet}`).join('\n\n')
      : '';

    let systemPrompt;
    if (isSystemDesign) {
      systemPrompt = `You are a Principal Systems Architect, Infrastructure Director, and Senior Technical Interview Coach at top-tier tech companies.
Your mission is to equip the engineer with deep, production-grade architectural understanding of this specific System Design, Server & Deployment topic so they master it at a Senior/Staff level.

Provide a comprehensive, authoritative Senior Masterclass Knowledge Guide covering:
1. 🏛️ Core Mental Model & Systems Architecture: Explain the architectural philosophy, data flow, protocols, and how it scales across distributed clusters.
2. ⚙️ Real-World Engineering Implementation: Production configuration, deployment models, algorithms, and infrastructure components (Nginx, Docker, Kubernetes, Redis, PostgreSQL, etc.).
3. 🏎️ Performance, Scaling & Bottlenecks: Latency, throughput, connection pooling, caching strategies, and horizontal vs vertical scaling.
4. 🛡️ Failure Modes, Resilience & Security: Cascading failures, circuit breakers, fallback strategies, and security hardening (OWASP, TLS, auth).
5. ⚠️ Production Traps & Anti-Patterns: Common architectural mistakes engineers make and why interviewers test for this.
6. 🗣️ How to Pitch & Defend This in a Senior/Staff System Design Interview: Exact talking points, architectural trade-offs, and design rationale to articulate clearly in an interview.
7. 💡 Minimal Production Reference Snippet or Configuration: A clean code snippet, Dockerfile, Nginx config, or architecture diagram illustrating the production pattern.

Format your entire response in clear, beautifully structured GitHub Flavored Markdown with alerts, tables, code blocks, and bullet points.`;
    } else if (isDesignSystem) {
      systemPrompt = `You are a Principal Frontend Architect, Head of Design Systems, and Staff Technical Interview Coach at top-tier tech companies.
Your mission is to equip the senior frontend engineer with deep, production-grade architectural understanding of this specific Design System topic so they master it at a Senior/Staff level.

Provide a comprehensive, authoritative Senior Masterclass Knowledge Guide covering:
1. 🏛️ Core Mental Model & Enterprise Architecture: Explain the architectural philosophy, system tiering (e.g. 3-tier tokens: global, semantic/alias, component tokens), design-to-code pipeline, and multi-brand / multi-platform scalability.
2. 📐 Production-Grade Patterns & Component API Design: Best practice patterns (compound components, slot architecture, polymorphic 'as'/'asChild' APIs, headless vs styled primitives, controlled vs uncontrolled state, composition vs configuration).
3. ♿ Accessibility (a11y) & WCAG 2.2 AAA Compliance: Keyboard navigability, APG patterns, focus management (traps, roving tabindex, focus-visible), high-contrast modes, color contrast ratios, screen reader testing.
4. ⚙️ Engineering Implementation, Performance & Tooling: Token engines (Style Dictionary, Tokens Studio), CSS architecture (CSS variables, CSS-in-JS zero-runtime, Tailwind v4 / Panda CSS / Vanilla Extract), tree-shaking, package publishing/monorepo, visual regression testing (Chromatic/Playwright), and DOM performance considerations.
5. ⚠️ Production Traps & Anti-Patterns: Common architectural mistakes senior developers make (e.g., token proliferation, prop drilling, inflexible compound APIs, leaky abstractions, accessibility oversights) and why interviewers test for this.
6. 🗣️ How to Pitch & Defend This in a Staff/Senior Interview: Exact talking points, architectural trade-offs, and design rationale to articulate clearly in a senior frontend system design interview.
7. 💡 Minimal Production Reference Snippet: A clear code snippet or token specification illustrating the clean, scalable pattern vs the flawed anti-pattern.

Format your entire response in clear, beautifully structured GitHub Flavored Markdown with alerts, tables, code blocks, and bullet points.`;
    } else if (isReact) {
      systemPrompt = `You are a Principal React Core Architect and Staff Technical Interview Coach.
Your mission is to equip the candidate with deep, Fiber-level understanding of this specific React topic so they NEVER have to guess tricky interview questions.

Provide a comprehensive, authoritative Masterclass Knowledge Guide covering:
1. 🧠 Core Mental Model & Fiber Architecture: Explain the exact underlying mechanics (e.g., Fiber workInProgress tree, Render vs Commit phases, Hook linked-list memoizedState, or Scheduler priorities).
2. ⚙️ Step-by-Step Execution Lifecycle: How React executes this component and reconciles updates through render and commit phases.
3. 🎯 Knowledge Required to Solve This Problem: Specific syntax, hooks rules, and architectural patterns needed to solve this problem correctly.
4. ⚠️ The React Interview Trap: The psychological or technical trap interviewers set and why typical candidates guess wrong.
5. 🗣️ How to Pitch This to an Interviewer: Concise, impressive talking points to say out loud during a technical interview.
6. 💡 Illustrative Minimal Example: A tiny JSX code snippet contrasting the buggy pattern vs the correct pattern.

Format your entire response in clear, beautifully structured GitHub Flavored Markdown with alerts, code blocks, and bullet points.`;
    } else {
      systemPrompt = `You are a World-Class JavaScript & Web Engine Architect and Lead Interview Coach.
Your mission is to equip the candidate with deep, engine-level understanding of this specific topic so they NEVER have to guess tricky interview questions.

Provide a comprehensive, authoritative Masterclass Knowledge Guide covering:
1. 🧠 Core Mental Model & Engine Architecture: Explain the exact underlying mechanics (e.g., V8 Call Stack, Lexical Environments, Microtask queue, or Browser event loop).
2. ⚙️ Step-by-Step Execution Lifecycle: How the engine executes code related to this concept line-by-line.
3. 🎯 Knowledge Required to Solve This Problem: Specific syntax, semantics, and rules needed to solve this problem correctly.
4. ⚠️ The Interview Trap: The psychological or technical trap interviewers set and why typical candidates guess wrong.
5. 🗣️ How to Pitch This to an Interviewer: Concise, impressive talking points to say out loud during a technical interview.
6. 💡 Illustrative Minimal Example: A tiny code snippet contrasting the buggy pattern vs the correct pattern.

Format your entire response in clear, beautifully structured GitHub Flavored Markdown with alerts, code blocks, and bullet points.`;
    }

    const trackLabel = isSystemDesign
      ? 'System Design & Web Architecture (Senior Mastery)'
      : (isDesignSystem
        ? 'Design System Architecture (Senior Frontend Mastery)'
        : (isReact ? 'React.js Mastery' : 'JavaScript Mastery'));

    const prompt = `Track: ${trackLabel}
Topic: "${topicTitle}"
Specific Architectural Focus: "${questionTitle || topicTitle}"
Core Mechanism / Concept: "${concept || topicTitle}"

Problem / Architecture Context:
${problemDescription || ''}
${searchContext}

Generate the complete in-depth senior architectural knowledge guide for this topic now.`;

    const rawExplanation = await callOllama(prompt, systemPrompt, false);
    const explanation = sanitizeMarkdown(rawExplanation);

    // Save generated knowledge guide into selected storage (JSON file or SQLite DB)
    let savedGuide = null;
    const requestedMode = req.body.storageMode || req.query.storageMode || db.getStorageMode();
    let actualStorageMode = requestedMode;
    try {
      savedGuide = db.saveGuide({
        track,
        topicTitle,
        questionTitle,
        concept,
        problemDescription,
        guideContent: explanation,
        searchResultsCount: webSearchResults.length,
        model: OLLAMA_MODEL
      }, requestedMode);
      actualStorageMode = (requestedMode === 'sqlite' && db.isSqliteAvailable) ? 'sqlite' : 'json';
      console.log(`[Storage] Knowledge Guide saved to ${actualStorageMode.toUpperCase()} (ID: ${savedGuide.id}) for: [${track}] ${topicTitle} - ${questionTitle}`);
    } catch (dbErr) {
      console.error('[Storage] Error saving knowledge guide:', dbErr);
    }

    res.json({
      success: true,
      explanation,
      searchResultsCount: webSearchResults.length,
      savedGuide,
      guideId: savedGuide ? savedGuide.id : null,
      storageMode: actualStorageMode,
      storageTarget: actualStorageMode === 'json' ? 'knowledge.json' : 'knowledge.db'
    });
  } catch (error) {
    console.error('Error generating topic knowledge:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Storage status and active mode (JSON vs SQLite)
app.get('/api/storage-status', (req, res) => {
  try {
    const status = db.getStorageStatus();
    res.json({ success: true, ...status });
  } catch (err) {
    console.error('Error fetching storage status:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Set storage mode ('json' or 'sqlite')
app.post('/api/storage-mode', (req, res) => {
  try {
    const { mode } = req.body;
    const newMode = db.setStorageMode(mode);
    res.json({
      success: true,
      mode: newMode,
      sqliteAvailable: db.isSqliteAvailable,
      message: `Storage mode set to ${newMode === 'json' ? 'Local JSON file (knowledge.json)' : 'SQLite Database (knowledge.db)'}`
    });
  } catch (err) {
    console.warn('[Storage] Could not set storage mode:', err.message);
    res.status(400).json({
      success: false,
      error: err.message,
      sqliteAvailable: db.isSqliteAvailable,
      mode: db.getStorageMode()
    });
  }
});

// Sync guides between SQLite and JSON
app.post('/api/storage-sync', (req, res) => {
  try {
    const { from = 'sqlite', to = 'json' } = req.body;
    const result = db.syncGuides(from, to);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[Storage] Error syncing guides:', err);
    res.status(400).json({ success: false, error: err.message });
  }
});

// Fetch latest saved knowledge guide for a track + topic + optional question
app.get('/api/knowledge-guide', (req, res) => {
  try {
    const { track = 'javascript', topicTitle, questionTitle, storageMode } = req.query;
    if (!topicTitle) {
      return res.status(400).json({ success: false, error: 'topicTitle parameter is required' });
    }
    const mode = storageMode || db.getStorageMode();
    const guide = db.getLatestGuide({ track, topicTitle, questionTitle }, mode);
    res.json({ success: true, found: Boolean(guide), guide, storageMode: mode });
  } catch (err) {
    console.error('Error fetching knowledge guide:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Return count of saved knowledge guides
app.get('/api/knowledge-guides/count', (req, res) => {
  try {
    const { track, storageMode } = req.query;
    const mode = storageMode || db.getStorageMode();
    const count = db.getGuidesCount(track, mode);
    res.json({ success: true, count, storageMode: mode });
  } catch (err) {
    console.error('Error fetching count of knowledge guides:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// List saved knowledge guides
app.get('/api/knowledge-guides', (req, res) => {
  try {
    const { track, search, limit = 50, offset = 0, storageMode } = req.query;
    const mode = storageMode || db.getStorageMode();
    const guides = db.listGuides({ track, search, limit: parseInt(limit, 10), offset: parseInt(offset, 10) }, mode);
    const total = db.getGuidesCount(track, mode);
    res.json({ success: true, guides, total, storageMode: mode });
  } catch (err) {
    console.error('Error listing knowledge guides:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fetch single knowledge guide by ID
app.get(['/api/knowledge-guides/:id', '/api/knowledge-guide/:id'], (req, res) => {
  try {
    const mode = req.query.storageMode || db.getStorageMode();
    const guide = db.getGuideById(req.params.id, mode);
    if (!guide) {
      return res.status(404).json({ success: false, error: 'Guide not found' });
    }
    res.json({ success: true, guide, storageMode: mode });
  } catch (err) {
    console.error('Error fetching guide by ID:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete a saved knowledge guide by ID
app.delete(['/api/knowledge-guides/:id', '/api/knowledge-guide/:id'], (req, res) => {
  try {
    const mode = req.query.storageMode || req.body?.storageMode || db.getStorageMode();
    const deleted = db.deleteGuide(req.params.id, mode);
    res.json({ success: true, deleted, storageMode: mode });
  } catch (err) {
    console.error('Error deleting guide:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  const storageStatus = db.getStorageStatus();
  console.log(`\n======================================================`);
  console.log(`⚡ JS & React Mastery Platform running at: http://localhost:${PORT}`);
  console.log(`🧠 Local LLM Model: ${OLLAMA_MODEL} via ${OLLAMA_HOST}`);
  console.log(`💾 Knowledge Storage: Active Mode = [${storageStatus.mode.toUpperCase()}]`);
  console.log(`   - Local JSON File: ${storageStatus.jsonPath} (${storageStatus.counts.json} guides)`);
  console.log(`   - SQLite DB: ${storageStatus.sqliteAvailable ? `Available at ${storageStatus.sqlitePath} (${storageStatus.counts.sqlite} guides)` : 'Not installed / unavailable (Defaulting to JSON)'}`);
  console.log(`======================================================\n`);
});
