const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'knowledge.db');
const JSON_PATH = process.env.JSON_PATH || path.join(__dirname, 'knowledge.json');

// --- SQLite Engine Initialization (Safe fallback if node:sqlite is not installed) ---
let DatabaseSync = null;
let isSqliteAvailable = false;
let sqliteInitError = null;
let db = null;

try {
  // node:sqlite is available in Node 22+ (experimental) or specific environments
  const sqliteModule = require('node:sqlite');
  DatabaseSync = sqliteModule.DatabaseSync;
  if (typeof DatabaseSync === 'function') {
    db = new DatabaseSync(DB_PATH);
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec('PRAGMA foreign_keys = ON;');

    // Create table for knowledge guides if it does not exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS knowledge_guides (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        track TEXT NOT NULL,
        topic_title TEXT NOT NULL,
        question_title TEXT NOT NULL,
        concept TEXT,
        problem_description TEXT,
        guide_content TEXT NOT NULL,
        search_results_count INTEGER DEFAULT 0,
        model TEXT,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        updated_at TEXT DEFAULT (datetime('now', 'localtime'))
      );

      CREATE INDEX IF NOT EXISTS idx_kg_track_topic 
        ON knowledge_guides(track, topic_title);

      CREATE INDEX IF NOT EXISTS idx_kg_created_at 
        ON knowledge_guides(created_at DESC);
    `);
    isSqliteAvailable = true;
    console.log(`[Storage] SQLite database initialized successfully at: ${DB_PATH}`);
  } else {
    sqliteInitError = 'node:sqlite DatabaseSync class not found in current Node runtime.';
    console.warn(`[Storage] SQLite not available: ${sqliteInitError}`);
  }
} catch (err) {
  isSqliteAvailable = false;
  sqliteInitError = err.message || 'SQLite module not installed or supported';
  console.warn(`[Storage] SQLite not available (${sqliteInitError}). Defaulting to local JSON storage.`);
}

// Default storage mode: 'json' (user can toggle to 'sqlite' if SQLite is installed)
let activeStorageMode = 'json';

// Helper to format timestamps matching SQLite datetime('now', 'localtime')
function formatLocalTimestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = now.getFullYear();
  const mm = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());
  const hh = pad(now.getHours());
  const min = pad(now.getMinutes());
  const ss = pad(now.getSeconds());
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

// -------------------------------------------------------------
// LOCAL JSON STORAGE BACKEND
// -------------------------------------------------------------

function readJsonGuides() {
  try {
    if (!fs.existsSync(JSON_PATH)) {
      let initialGuides = [];
      // If SQLite is available and has guides, seed them into the JSON file
      if (isSqliteAvailable && db) {
        try {
          const stmt = db.prepare('SELECT * FROM knowledge_guides ORDER BY id DESC');
          initialGuides = stmt.all() || [];
        } catch (e) {
          initialGuides = [];
        }
      }
      fs.writeFileSync(JSON_PATH, JSON.stringify(initialGuides, null, 2), 'utf-8');
      console.log(`[Storage] Initialized local JSON file at: ${JSON_PATH} with ${initialGuides.length} guides.`);
      return initialGuides;
    }

    const content = fs.readFileSync(JSON_PATH, 'utf-8');
    if (!content.trim()) return [];
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error(`[Storage] Error reading JSON file (${JSON_PATH}):`, err.message);
    return [];
  }
}

function writeJsonGuides(guides) {
  try {
    const tmpPath = `${JSON_PATH}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(guides, null, 2), 'utf-8');
    fs.renameSync(tmpPath, JSON_PATH);
    return true;
  } catch (err) {
    console.error(`[Storage] Error writing JSON file (${JSON_PATH}):`, err.message);
    try {
      fs.writeFileSync(JSON_PATH, JSON.stringify(guides, null, 2), 'utf-8');
      return true;
    } catch (fallbackErr) {
      console.error(`[Storage] Fatal fallback error writing JSON:`, fallbackErr.message);
      return false;
    }
  }
}

// JSON backend operations
const jsonBackend = {
  saveGuide({ track = 'javascript', topicTitle, questionTitle, concept = '', problemDescription = '', guideContent, searchResultsCount = 0, model = '' }) {
    const guides = readJsonGuides();
    const maxId = guides.reduce((acc, g) => Math.max(acc, Number(g.id) || 0), 0);
    const now = formatLocalTimestamp();
    const safeTopic = topicTitle || 'General';
    const safeQuestion = questionTitle || safeTopic;

    const newGuide = {
      id: maxId + 1,
      track: (track || 'javascript').toLowerCase(),
      topic_title: safeTopic,
      question_title: safeQuestion,
      concept: concept || '',
      problem_description: problemDescription || '',
      guide_content: guideContent || '',
      search_results_count: Number(searchResultsCount) || 0,
      model: model || '',
      created_at: now,
      updated_at: now
    };

    guides.unshift(newGuide);
    writeJsonGuides(guides);
    return newGuide;
  },

  getGuideById(id) {
    const guides = readJsonGuides();
    const numId = Number(id);
    return guides.find(g => Number(g.id) === numId) || null;
  },

  getLatestGuide({ track = 'javascript', topicTitle, questionTitle }) {
    const guides = readJsonGuides();
    const normalizedTrack = (track || 'javascript').toLowerCase();

    if (questionTitle && topicTitle) {
      const found = guides.find(g =>
        g.track.toLowerCase() === normalizedTrack &&
        g.topic_title.toLowerCase() === topicTitle.toLowerCase() &&
        g.question_title.toLowerCase() === questionTitle.toLowerCase()
      );
      if (found) return found;
    }

    if (topicTitle) {
      const found = guides.find(g =>
        g.track.toLowerCase() === normalizedTrack &&
        g.topic_title.toLowerCase() === topicTitle.toLowerCase()
      );
      if (found) return found;
    }

    return null;
  },

  listGuides({ track, search, limit = 50, offset = 0 } = {}) {
    let guides = readJsonGuides();

    if (track) {
      const normTrack = track.toLowerCase();
      guides = guides.filter(g => g.track && g.track.toLowerCase() === normTrack);
    }

    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      guides = guides.filter(g =>
        (g.topic_title && g.topic_title.toLowerCase().includes(term)) ||
        (g.question_title && g.question_title.toLowerCase().includes(term)) ||
        (g.concept && g.concept.toLowerCase().includes(term)) ||
        (g.guide_content && g.guide_content.toLowerCase().includes(term))
      );
    }

    guides.sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
    const sliced = guides.slice(Number(offset), Number(offset) + Number(limit));

    return sliced.map(g => ({
      id: g.id,
      track: g.track,
      topic_title: g.topic_title,
      question_title: g.question_title,
      concept: g.concept,
      search_results_count: g.search_results_count,
      model: g.model,
      created_at: g.created_at,
      preview: (g.guide_content || '').slice(0, 280),
      content_length: (g.guide_content || '').length
    }));
  },

  getGuidesCount(track) {
    const guides = readJsonGuides();
    if (track) {
      const normTrack = track.toLowerCase();
      return guides.filter(g => g.track && g.track.toLowerCase() === normTrack).length;
    }
    return guides.length;
  },

  deleteGuide(id) {
    const guides = readJsonGuides();
    const numId = Number(id);
    const initialLen = guides.length;
    const filtered = guides.filter(g => Number(g.id) !== numId);
    if (filtered.length !== initialLen) {
      writeJsonGuides(filtered);
      return true;
    }
    return false;
  }
};

// -------------------------------------------------------------
// SQLITE DATABASE BACKEND
// -------------------------------------------------------------

const sqliteBackend = {
  saveGuide({ track = 'javascript', topicTitle, questionTitle, concept = '', problemDescription = '', guideContent, searchResultsCount = 0, model = '' }) {
    if (!isSqliteAvailable || !db) {
      console.warn('[Storage] SQLite not available, saving to JSON storage instead.');
      return jsonBackend.saveGuide({ track, topicTitle, questionTitle, concept, problemDescription, guideContent, searchResultsCount, model });
    }

    const safeTopic = topicTitle || 'General';
    const safeQuestion = questionTitle || safeTopic;

    const stmt = db.prepare(`
      INSERT INTO knowledge_guides (
        track,
        topic_title,
        question_title,
        concept,
        problem_description,
        guide_content,
        search_results_count,
        model,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'), datetime('now', 'localtime'))
    `);

    const res = stmt.run(
      track.toLowerCase(),
      safeTopic,
      safeQuestion,
      concept,
      problemDescription,
      guideContent,
      searchResultsCount,
      model
    );

    const rowId = Number(res.lastInsertRowid);
    return this.getGuideById(rowId);
  },

  getGuideById(id) {
    if (!isSqliteAvailable || !db) return jsonBackend.getGuideById(id);
    const stmt = db.prepare('SELECT * FROM knowledge_guides WHERE id = ?');
    return stmt.get(Number(id)) || null;
  },

  getLatestGuide({ track = 'javascript', topicTitle, questionTitle }) {
    if (!isSqliteAvailable || !db) return jsonBackend.getLatestGuide({ track, topicTitle, questionTitle });
    const normalizedTrack = (track || 'javascript').toLowerCase();

    if (questionTitle && topicTitle) {
      const stmt = db.prepare(`
        SELECT * FROM knowledge_guides
        WHERE track = ? AND topic_title = ? AND question_title = ?
        ORDER BY id DESC LIMIT 1
      `);
      const guide = stmt.get(normalizedTrack, topicTitle, questionTitle);
      if (guide) return guide;
    }

    if (topicTitle) {
      const stmt = db.prepare(`
        SELECT * FROM knowledge_guides
        WHERE track = ? AND topic_title = ?
        ORDER BY id DESC LIMIT 1
      `);
      const guide = stmt.get(normalizedTrack, topicTitle);
      if (guide) return guide;
    }

    return null;
  },

  listGuides({ track, search, limit = 50, offset = 0 } = {}) {
    if (!isSqliteAvailable || !db) return jsonBackend.listGuides({ track, search, limit, offset });
    let query = `
      SELECT 
        id,
        track,
        topic_title,
        question_title,
        concept,
        search_results_count,
        model,
        created_at,
        substr(guide_content, 1, 280) AS preview,
        length(guide_content) AS content_length
      FROM knowledge_guides
    `;

    const conditions = [];
    const params = [];

    if (track) {
      conditions.push('track = ?');
      params.push(track.toLowerCase());
    }

    if (search && search.trim()) {
      conditions.push('(topic_title LIKE ? OR question_title LIKE ? OR concept LIKE ? OR guide_content LIKE ?)');
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const stmt = db.prepare(query);
    return stmt.all(...params);
  },

  getGuidesCount(track) {
    if (!isSqliteAvailable || !db) return jsonBackend.getGuidesCount(track);
    if (track) {
      const stmt = db.prepare('SELECT COUNT(*) AS count FROM knowledge_guides WHERE track = ?');
      return stmt.get(track.toLowerCase()).count;
    }
    const stmt = db.prepare('SELECT COUNT(*) AS count FROM knowledge_guides');
    return stmt.get().count;
  },

  deleteGuide(id) {
    if (!isSqliteAvailable || !db) return jsonBackend.deleteGuide(id);
    const stmt = db.prepare('DELETE FROM knowledge_guides WHERE id = ?');
    const res = stmt.run(Number(id));
    return res.changes > 0;
  }
};

// -------------------------------------------------------------
// UNIFIED STORAGE ROUTER & EXPORTS
// -------------------------------------------------------------

function resolveBackend(mode) {
  const chosenMode = (mode || activeStorageMode || 'json').toLowerCase();
  if (chosenMode === 'sqlite') {
    if (isSqliteAvailable && db) {
      return sqliteBackend;
    }
    console.warn('[Storage] SQLite mode selected but SQLite is not available. Falling back to local JSON storage.');
    return jsonBackend;
  }
  return jsonBackend;
}

function getStorageMode() {
  if (!isSqliteAvailable) return 'json';
  return activeStorageMode;
}

function setStorageMode(mode) {
  const requested = String(mode || '').toLowerCase();
  if (requested === 'sqlite') {
    if (!isSqliteAvailable) {
      const msg = `SQLite is not installed or available (${sqliteInitError || 'node:sqlite not found'}). Using local JSON storage.`;
      const err = new Error(msg);
      err.sqliteAvailable = false;
      throw err;
    }
    activeStorageMode = 'sqlite';
    return 'sqlite';
  }
  activeStorageMode = 'json';
  return 'json';
}

function getStorageStatus() {
  return {
    mode: getStorageMode(),
    sqliteAvailable: isSqliteAvailable,
    sqliteError: sqliteInitError,
    sqlitePath: DB_PATH,
    jsonPath: JSON_PATH,
    counts: {
      json: jsonBackend.getGuidesCount(),
      sqlite: isSqliteAvailable && db ? sqliteBackend.getGuidesCount() : 0,
      active: resolveBackend(activeStorageMode).getGuidesCount()
    }
  };
}

// Sync guides between SQLite and JSON
function syncGuides(fromMode = 'sqlite', toMode = 'json') {
  const from = (fromMode || 'sqlite').toLowerCase();
  const to = (toMode || 'json').toLowerCase();
  if (from === to) return { copied: 0, total: 0, message: 'Source and destination are identical.' };

  let sourceGuides = [];
  if (from === 'sqlite') {
    if (!isSqliteAvailable || !db) throw new Error('SQLite source is not available');
    const stmt = db.prepare('SELECT * FROM knowledge_guides ORDER BY id ASC');
    sourceGuides = stmt.all() || [];
  } else {
    sourceGuides = readJsonGuides();
  }

  let copied = 0;
  if (to === 'json') {
    const existingJson = readJsonGuides();
    sourceGuides.forEach(sg => {
      const exists = existingJson.some(eg => 
        eg.track === sg.track && 
        eg.topic_title === sg.topic_title && 
        eg.question_title === sg.question_title
      );
      if (!exists) {
        jsonBackend.saveGuide({
          track: sg.track,
          topicTitle: sg.topic_title,
          questionTitle: sg.question_title,
          concept: sg.concept,
          problemDescription: sg.problem_description,
          guideContent: sg.guide_content,
          searchResultsCount: sg.search_results_count,
          model: sg.model
        });
        copied++;
      }
    });
  } else if (to === 'sqlite') {
    if (!isSqliteAvailable || !db) throw new Error('SQLite destination is not available');
    sourceGuides.forEach(sg => {
      const stmt = db.prepare('SELECT id FROM knowledge_guides WHERE track = ? AND topic_title = ? AND question_title = ? LIMIT 1');
      const found = stmt.get(sg.track, sg.topic_title, sg.question_title);
      if (!found) {
        sqliteBackend.saveGuide({
          track: sg.track,
          topicTitle: sg.topic_title,
          questionTitle: sg.question_title,
          concept: sg.concept,
          problemDescription: sg.problem_description,
          guideContent: sg.guide_content,
          searchResultsCount: sg.search_results_count,
          model: sg.model
        });
        copied++;
      }
    });
  }

  return { copied, from, to };
}

// Pre-initialize JSON file immediately on module load so knowledge.json exists right away
readJsonGuides();

module.exports = {
  db,
  isSqliteAvailable,
  sqliteInitError,
  getStorageMode,
  setStorageMode,
  getStorageStatus,
  syncGuides,

  // Storage operations accept optional mode parameter ('json' or 'sqlite')
  saveGuide(payload, mode) {
    return resolveBackend(mode).saveGuide(payload);
  },

  getGuideById(id, mode) {
    return resolveBackend(mode).getGuideById(id);
  },

  getLatestGuide(params, mode) {
    return resolveBackend(mode).getLatestGuide(params);
  },

  listGuides(params, mode) {
    return resolveBackend(mode).listGuides(params);
  },

  getGuidesCount(track, mode) {
    return resolveBackend(mode).getGuidesCount(track);
  },

  deleteGuide(id, mode) {
    return resolveBackend(mode).deleteGuide(id);
  },

  // Direct backend access if needed
  jsonBackend,
  sqliteBackend
};
