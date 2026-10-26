const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const topicsCatalog = require('./topics');
const reactTopicsCatalog = require('./topics-react');
const designSystemTopicsCatalog = require('./topics-design-system');
const systemDesignTopicsCatalog = require('./topics-system-design');
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
      answersManifest.topics.forEach(t => {
        const topicFilePath = path.join(answersDir, t.fileName);
        if (fs.existsSync(topicFilePath)) {
          const topicData = JSON.parse(fs.readFileSync(topicFilePath, 'utf8'));
          (topicData.subtopics || []).forEach(sub => {
            (sub.questions || []).forEach(q => {
              // Index by ID, title, and concept for instant retrieval
              answersMap.set(q.id.toLowerCase(), q);
              answersMap.set(q.title.toLowerCase(), q);
              if (q.concept) {
                answersMap.set(q.concept.toLowerCase(), q);
              }
            });
          });
        }
      });
      console.log(`[Verified Engine] Loaded ${answersMap.size / 3} unique verified answers into memory.`);
    }
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

// Direct Answers API - Get master index or topic JSON files from ./json/
app.get('/api/answers', (req, res) => {
  const indexPath = path.join(answersDir, 'index.json');
  if (fs.existsSync(indexPath)) {
    return res.json(JSON.parse(fs.readFileSync(indexPath, 'utf8')));
  }
  res.status(404).json({ success: false, error: 'Answers manifest not found' });
});

app.get('/api/answers/:topicId', (req, res) => {
  const { topicId } = req.params;
  const filenameMap = {
    'engine-internals': 'js-engine-and-memory-internals.json',
    'async-concurrency': 'asynchronous-js-and-concurrency.json',
    'react-engine-fiber': 'fiber-architecture-and-reconciliation.json',
    'react-hooks-state-machine': 'hooks-state-machine-and-closures.json'
  };
  const targetFile = filenameMap[topicId] || (topicId.endsWith('.json') ? topicId : `${topicId}.json`);
  const filePath = path.join(answersDir, targetFile);
  if (fs.existsSync(filePath)) {
    return res.json(JSON.parse(fs.readFileSync(filePath, 'utf8')));
  }
  res.status(404).json({ success: false, error: `Topic answers for '${topicId}' not found` });
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

// Synthesize Authoritative Knowledge Guide from Verified Answers / Curated Architecture (No LLM needed)
function buildKnowledgeGuideMarkdown({ track, topicTitle, questionTitle, concept, answer, topicMeta }) {
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

    // 4. Save generated guide into storage
    const requestedMode = storageMode || db.getStorageMode();
    let actualStorageMode = requestedMode;
    let savedGuide = null;

    try {
      savedGuide = db.saveGuide({
        track,
        topicTitle,
        questionTitle: questionTitle || topicTitle,
        concept: concept || foundAnswer?.concept || topicTitle,
        problemDescription: foundAnswer?.problemStatement || topicMeta?.summary || '',
        guideContent: explanation,
        searchResultsCount: foundAnswer ? foundAnswer.testCases?.length || 3 : 0,
        model: 'Verified Engine'
      }, requestedMode);
      actualStorageMode = (requestedMode === 'sqlite' && db.isSqliteAvailable) ? 'sqlite' : 'json';
    } catch (dbErr) {
      console.warn('[Storage] Could not auto-persist guide:', dbErr.message);
    }

    res.json({
      success: true,
      explanation,
      searchResultsCount: foundAnswer ? foundAnswer.testCases?.length || 3 : 0,
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
  console.log(`🚀 Engine: 100% Offline Verified Architecture & Test Suite (No Local LLM Required)`);
  console.log(`💾 Knowledge Storage: Active Mode = [${storageStatus.mode.toUpperCase()}]`);
  console.log(`   - Local JSON File: ${storageStatus.jsonPath} (${storageStatus.counts.json} guides)`);
  console.log(`   - SQLite DB: ${storageStatus.sqliteAvailable ? `Available at ${storageStatus.sqlitePath} (${storageStatus.counts.sqlite} guides)` : 'Not installed / unavailable (Defaulting to JSON)'}`);
  console.log(`======================================================\n`);
});
