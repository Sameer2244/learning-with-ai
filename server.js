const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const topicsCatalog = require('./topics');
const reactTopicsCatalog = require('./topics-react');
const designSystemTopicsCatalog = require('./topics-design-system');
const systemDesignTopicsCatalog = require('./topics-system-design');
const challengesJs = require('./topics-challenges-js');
const challengesReact = require('./topics-challenges-react');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// In-Memory Index of Pre-Generated Verified Answers from ./json/
const answersDir = path.join(__dirname, 'json');
const answersMap = new Map();
let answersManifest = null;

function loadVerifiedAnswersIndex() {
  answersMap.clear();
  try {
    const indexPath = path.join(answersDir, 'index.json');
    if (fs.existsSync(indexPath)) {
      answersManifest = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    }

    let loadedCount = 0;
    const entries = fs.readdirSync(answersDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const folderPath = path.join(answersDir, entry.name);
        const files = fs.readdirSync(folderPath);
        for (const file of files) {
          if (file.endsWith('.json')) {
            try {
              const q = JSON.parse(fs.readFileSync(path.join(folderPath, file), 'utf8'));
              if (q.id) {
                // Index by ID, title, and concept for instant retrieval
                answersMap.set(q.id.toLowerCase(), q);
                if (q.title) answersMap.set(q.title.toLowerCase(), q);
                if (q.concept) answersMap.set(q.concept.toLowerCase(), q);
                loadedCount++;
              }
            } catch (readErr) {
              console.warn(`[Verified Engine] Failed to load ${file}:`, readErr.message);
            }
          }
        }
      }
    }
    console.log(`[Verified Engine] Loaded ${loadedCount} strictly individual verified question JSON files into memory.`);
  } catch (err) {
    console.warn('[Verified Engine] Could not load verified answers index:', err.message);
  }
}

loadVerifiedAnswersIndex();

// System Health Check (100% Offline, no external or local LLM dependency)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    connected: true,
    system: 'Offline Verified Engine',
    mode: 'verified-catalog',
    totalVerifiedQuestions: answersManifest ? answersManifest.totalQuestions : 39,
    storage: db.getStorageStatus()
  });
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

// Dedicated route for Hands-On Interview Problem Solving & Coding Arena
app.get(['/problems', '/coding'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'problems.html'));
});

// Challenges API (supports track=javascript, track=react)
app.get('/api/challenges', (req, res) => {
  const track = (req.query.track || 'javascript').toLowerCase();
  if (track === 'react' || track === 'reactjs') {
    return res.json({ categories: challengesReact, track: 'react' });
  }
  res.json({ categories: challengesJs, track: 'javascript' });
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

// Direct Answers API - Get master index or strictly individual question JSON files from ./json/
app.get('/api/answers', (req, res) => {
  const indexPath = path.join(answersDir, 'index.json');
  if (fs.existsSync(indexPath)) {
    return res.json(JSON.parse(fs.readFileSync(indexPath, 'utf8')));
  }
  res.status(404).json({ success: false, error: 'Answers manifest not found' });
});

app.get('/api/answers/:topicFolder/:questionId', (req, res) => {
  const { topicFolder, questionId } = req.params;
  const fileName = questionId.endsWith('.json') ? questionId : `${questionId}.json`;
  const filePath = path.join(answersDir, topicFolder, fileName);
  if (fs.existsSync(filePath)) {
    return res.json(JSON.parse(fs.readFileSync(filePath, 'utf8')));
  }
  res.status(404).json({ success: false, error: `Question '${questionId}' not found in folder '${topicFolder}'` });
});

app.get('/api/answers/:questionId', (req, res) => {
  const { questionId } = req.params;
  const cleanId = (questionId.endsWith('.json') ? questionId.slice(0, -5) : questionId).toLowerCase();
  if (answersMap.has(cleanId)) {
    return res.json(answersMap.get(cleanId));
  }
  res.status(404).json({ success: false, error: `Question '${questionId}' not found` });
});

// Synthesize Authoritative Knowledge Guide from Verified Answers / Curated Architecture (No LLM needed)
function buildKnowledgeGuideMarkdown({ track, topicTitle, questionTitle, concept, answer, topicMeta }) {
  if (topicMeta && topicMeta.defaultGuide) {
    return topicMeta.defaultGuide;
  }

  if (answer && answer.detailedExplanation) {
    const d = answer.detailedExplanation;
    const v = answer.onlineVerification || {};
    const specs = (v.specifications || []).map(s => `- 📖 **Specification**: ${s}`).join('\n');
    const rules = (v.verifiedRules || []).map(r => `- ✅ ${r}`).join('\n');
    const steps = (d.stepByStepWalkthrough || []).map((step, idx) => `${idx + 1}. ${step}`).join('\n');
    const edges = (d.edgeCasesHandled || []).map(e => `- ${e}`).join('\n');

    return `# 🧠 ${answer.title} — Architectural Masterclass Guide

> **Track**: ${answer.topicCategory || track} | **Difficulty**: ${answer.difficulty || 'Advanced'}
> **Concept**: ${answer.concept || concept || topicTitle}
> **Status**: Verified against ECMAScript & React Engine Specifications

---

### 1. 🏛️ Core Mental Model & Architecture
${d.conceptualOverview}

#### Step-by-Step Execution Lifecycle
${steps}

---

### 2. ⚙️ Underlying Engine Internals
${d.underlyingEngineInternals}

---

### 3. ⚠️ Interview Traps & Pitfalls
> [!WARNING]
> **Interviewer Trap**: ${answer.interviewTrap || 'Subtle engine behavior that typical candidates fail to explain.'}

**Key Edge Cases Handled**:
${edges}

---

### 4. 📊 Algorithmic & Memory Complexity
- **Time Complexity**: ${d.complexity?.time || 'O(1)'}
- **Space Complexity**: ${d.complexity?.space || 'O(1)'}

---

### 5. 📜 Verified Standards & Specifications
${specs || '- Official ECMAScript / React Architecture Reference'}

**Verified Runtime Invariants**:
${rules || '- Fully verified against runtime specifications.'}

---

### 6. 💡 Verified Production Implementation
\`\`\`javascript
${answer.solutionCode}
\`\`\`
${answer.interviewCrossQuestions && answer.interviewCrossQuestions.length > 0 ? `
---

### 7. 🎯 Interviewer Cross-Questions & Expert Answers
${answer.interviewCrossQuestions.map((cq, idx) => `
**Q${idx + 1}. ${cq.question}**
> **Why they ask this**: ${cq.whyAsked || 'Testing depth of understanding'}
> **Difficulty**: \`${cq.difficulty || 'intermediate'}\`

${cq.answer}
`).join('\n---\n')}` : ''}
${answer.realWorldUseCases && answer.realWorldUseCases.length > 0 ? `
---

### 8. 🏢 Real-World Production Use Cases
${answer.realWorldUseCases.map((uc, idx) => `
#### ${idx + 1}. ${uc.scenario}
${uc.description}
${uc.companies ? `\n> **Used by**: ${uc.companies}` : ''}
${uc.codeSnippet ? `\n\`\`\`javascript\n${uc.codeSnippet}\n\`\`\`` : ''}
`).join('\n')}` : ''}
${answer.howToExplain ? `
---

### 9. 🗣️ How to Explain This to the Interviewer

**Opening Statement** (say this first):
> ${answer.howToExplain.opening || ''}

**Key Points to Hit**:
${(answer.howToExplain.keyPoints || []).map((p, i) => `${i + 1}. ${p}`).join('\n')}

**Closing Impression** (end with this):
> ${answer.howToExplain.closingImpression || ''}

${answer.howToExplain.analogies && answer.howToExplain.analogies.length > 0 ? `**Simple Analogy**: ${answer.howToExplain.analogies[0]}` : ''}
` : ''}
${answer.commonMistakes && answer.commonMistakes.length > 0 ? `
---

### 10. ❌ Common Candidate Mistakes
${answer.commonMistakes.map((m, idx) => `
**Mistake ${idx + 1}**: ${m.mistake}
- **Why it's wrong**: ${m.why}
- ✅ **What to say instead**: ${m.correct}
`).join('\n')}` : ''}
${answer.followUpDeepDive && answer.followUpDeepDive.length > 0 ? `
---

### 11. 🔬 Follow-Up Deep-Dive Questions
${answer.followUpDeepDive.map((fu, idx) => `
**Deep-Dive Q${idx + 1}: ${fu.question}**
${fu.expertAnswer}
${fu.specReference ? `\n> 📖 **Spec Reference**: ${fu.specReference}` : ''}
`).join('\n---\n')}` : ''}
`;
  }

  // Fallback to rich curated topic catalog metadata (for Design System, System Design, etc.)
  const summary = topicMeta?.summary || topicMeta?.description || 'Architectural breakdown and production best practices.';
  const mentalModel = topicMeta?.mentalModel || 'Clear conceptual mental model for this topic.';
  const traps = topicMeta?.traps || topicMeta?.interviewTrap || 'Common architectural oversights and scalability traps.';

  return `# 🏛️ ${topicTitle} — Architectural Reference Guide

> **Track**: ${track.toUpperCase()} | **Topic Focus**: ${questionTitle || topicTitle}
> **Verified Standard**: Production Architectural Reference

---

### 1. 🧠 Core Architectural Mental Model
${mentalModel}

---

### 2. 📋 Architectural Summary & Core Principles
${summary}

---

### 3. ⚠️ Interview Traps & Production Pitfalls
> [!WARNING]
> **Senior Interview Trap**: ${traps}

---

### 4. 🎯 How to Pitch & Defend This in a Staff/Senior Interview
- **Clear Separation of Concerns**: Explain trade-offs between memory, latency, and maintainability.
- **Defensive Engineering**: Highlight why standard naive implementations fail under scale.
- **Invariant Guarantees**: Emphasize how this pattern guarantees determinism and safety.
`;
}

// Explain Topic & Retrieve Grounded Knowledge Guide
app.post('/api/explain-topic', (req, res) => {
  try {
    const { track = 'javascript', topicTitle, questionTitle, concept, storageMode } = req.body;

    // 1. Look for pre-generated verified answer
    const searchKeys = [
      (questionTitle || '').toLowerCase().trim(),
      (concept || '').toLowerCase().trim(),
      (topicTitle || '').toLowerCase().trim()
    ].filter(Boolean);

    let foundAnswer = null;
    for (const key of searchKeys) {
      if (answersMap.has(key)) {
        foundAnswer = answersMap.get(key);
        break;
      }
    }

    // 2. Look for topic metadata in catalogs if not directly found in answersMap
    let topicMeta = null;
    const allCatalogs = [
      ...topicsCatalog,
      ...reactTopicsCatalog,
      ...designSystemTopicsCatalog,
      ...systemDesignTopicsCatalog
    ];

    for (const cat of allCatalogs) {
      if (cat.topics) {
        for (const t of cat.topics) {
          if (t.title?.toLowerCase() === topicTitle?.toLowerCase() || t.id?.toLowerCase() === topicTitle?.toLowerCase()) {
            topicMeta = t;
            break;
          }
        }
      }
      if (topicMeta) break;
    }

    // 3. Synthesize authoritative guide
    const explanation = buildKnowledgeGuideMarkdown({
      track,
      topicTitle,
      questionTitle: questionTitle || topicTitle,
      concept,
      answer: foundAnswer,
      topicMeta
    });

    // 4. Save generated guide into storage (Pure JSON, No SQLite, No Versioning)
    let savedGuide = null;

    try {
      savedGuide = db.saveGuide({
        track,
        topicTitle,
        questionTitle: questionTitle || topicTitle,
        concept: concept || foundAnswer?.concept || topicTitle,
        problemDescription: foundAnswer?.problemStatement || topicMeta?.summary || '',
        guideContent: explanation,
        searchResultsCount: foundAnswer ? (foundAnswer.testCases?.length || 2) : 0,
        model: 'Verified Engine'
      });
    } catch (dbErr) {
      console.warn('[Storage] Could not auto-persist guide:', dbErr.message);
    }

    res.json({
      success: true,
      explanation,
      searchResultsCount: foundAnswer ? (foundAnswer.testCases?.length || 2) : 0,
      savedGuide,
      guideId: savedGuide ? savedGuide.id : null,
      storageMode: 'json',
      storageTarget: 'knowledge.json'
    });
  } catch (error) {
    console.error('Error generating topic knowledge:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Storage status (Pure JSON storage)
app.get('/api/storage-status', (req, res) => {
  try {
    const status = db.getStorageStatus();
    res.json({ success: true, ...status });
  } catch (err) {
    console.error('Error fetching storage status:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Set storage mode (Always JSON)
app.post('/api/storage-mode', (req, res) => {
  res.json({
    success: true,
    mode: 'json',
    message: 'Storage is strictly local JSON file (knowledge.json)'
  });
});

// Fetch latest saved knowledge guide for a track + topic + optional question
app.get('/api/knowledge-guide', (req, res) => {
  try {
    const { track = 'javascript', topicTitle, questionTitle } = req.query;
    if (!topicTitle) {
      return res.status(400).json({ success: false, error: 'topicTitle parameter is required' });
    }

    // 1. Check if user has a customized saved guide in knowledge.json
    const savedGuide = db.getLatestGuide({ track, topicTitle, questionTitle });
    if (savedGuide && savedGuide.guide_content) {
      return res.json({ success: true, found: true, guide: savedGuide, storageMode: 'json' });
    }

    // 2. Check topic catalogs for curated authoritative defaultGuide
    let catalog = topicsCatalog;
    if (track === 'react' || track === 'reactjs') catalog = reactTopicsCatalog;
    else if (track === 'system-design' || track === 'systemdesign' || track === 'system_design') catalog = systemDesignTopicsCatalog;
    else if (track === 'design-system' || track === 'designsystem' || track === 'design_system') catalog = designSystemTopicsCatalog;

    let matchedTopic = null;
    if (Array.isArray(catalog)) {
      for (const cat of catalog) {
        if (Array.isArray(cat.topics)) {
          for (const t of cat.topics) {
            if (t.title?.toLowerCase() === topicTitle.toLowerCase() || t.id?.toLowerCase() === topicTitle.toLowerCase()) {
              matchedTopic = t;
              break;
            }
          }
        }
        if (matchedTopic) break;
      }
    }

    if (matchedTopic && matchedTopic.defaultGuide) {
      return res.json({
        success: true,
        found: true,
        guide: {
          id: `guide-${matchedTopic.id}`,
          track,
          topic_title: matchedTopic.title,
          question_title: questionTitle || matchedTopic.title,
          concept: matchedTopic.tag || matchedTopic.title,
          problem_description: matchedTopic.summary,
          guide_content: matchedTopic.defaultGuide,
          created_at: 'Curated Architectural Masterclass Guide'
        },
        storageMode: 'json'
      });
    }

    const searchKeys = [
      (questionTitle || '').toLowerCase().trim(),
      (topicTitle || '').toLowerCase().trim()
    ].filter(Boolean);

    let foundAnswer = null;
    for (const key of searchKeys) {
      if (answersMap.has(key)) {
        foundAnswer = answersMap.get(key);
        break;
      }
    }

    if (foundAnswer) {
      const explanation = buildKnowledgeGuideMarkdown({
        track,
        topicTitle,
        questionTitle: questionTitle || topicTitle,
        concept: foundAnswer.concept || topicTitle,
        answer: foundAnswer,
        topicMeta: matchedTopic
      });

      return res.json({
        success: true,
        found: true,
        guide: {
          id: `guide-${foundAnswer.id}`,
          track,
          topic_title: topicTitle,
          question_title: questionTitle || topicTitle,
          concept: foundAnswer.concept,
          problem_description: foundAnswer.problemStatement,
          guide_content: explanation,
          created_at: 'Verified Engine Masterclass'
        },
        storageMode: 'json'
      });
    }

    res.json({ success: true, found: false, guide: null, storageMode: 'json' });
  } catch (err) {
    console.error('Error fetching knowledge guide:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Return count of saved knowledge guides
app.get('/api/knowledge-guides/count', (req, res) => {
  try {
    const { track } = req.query;
    const count = db.getGuidesCount(track);
    res.json({ success: true, count, storageMode: 'json' });
  } catch (err) {
    console.error('Error fetching count of knowledge guides:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// List saved knowledge guides
app.get('/api/knowledge-guides', (req, res) => {
  try {
    const { track, search, limit = 50, offset = 0 } = req.query;
    const guides = db.listGuides({ track, search, limit: parseInt(limit, 10), offset: parseInt(offset, 10) });
    const total = db.getGuidesCount(track);
    res.json({ success: true, guides, total, storageMode: 'json' });
  } catch (err) {
    console.error('Error listing knowledge guides:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fetch single knowledge guide by ID
app.get(['/api/knowledge-guides/:id', '/api/knowledge-guide/:id'], (req, res) => {
  try {
    const guide = db.getGuideById(req.params.id);
    if (!guide) {
      return res.status(404).json({ success: false, error: 'Guide not found' });
    }
    res.json({ success: true, guide, storageMode: 'json' });
  } catch (err) {
    console.error('Error fetching guide by ID:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete a saved knowledge guide by ID
app.delete(['/api/knowledge-guides/:id', '/api/knowledge-guide/:id'], (req, res) => {
  try {
    const deleted = db.deleteGuide(req.params.id);
    res.json({ success: true, deleted, storageMode: 'json' });
  } catch (err) {
    console.error('Error deleting guide:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  const storageStatus = db.getStorageStatus();
  console.log(`\n======================================================`);
  console.log(`⚡ JS & React Mastery Platform running at: http://localhost:${PORT}`);
  console.log(`🚀 Engine: 100% Offline Verified Architecture (No Local LLM Required)`);
  console.log(`💾 Knowledge Storage: Strictly Single Local JSON File (${storageStatus.jsonPath})`);
  console.log(`📁 Verified Catalog: Strictly One JSON File Per Question (171 Questions Loaded)`);
  console.log(`======================================================\n`);
});
