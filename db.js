const path = require('path');
const fs = require('fs');

const JSON_PATH = process.env.JSON_PATH || path.join(__dirname, 'knowledge.json');

// Helper to format timestamps: YYYY-MM-DD HH:MM:SS
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
// LOCAL JSON STORAGE BACKEND (Pure JSON, No SQL DB, No Versioning)
// -------------------------------------------------------------

function readJsonGuides() {
  try {
    if (!fs.existsSync(JSON_PATH)) {
      fs.writeFileSync(JSON_PATH, JSON.stringify([], null, 2), 'utf-8');
      return [];
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

// Strictly ONE guide per question/topic - NO versioning/duplicates
function saveGuide({ track = 'javascript', topicTitle, questionTitle, concept = '', problemDescription = '', guideContent, searchResultsCount = 0, model = 'Verified Engine' }) {
  const guides = readJsonGuides();
  const normTrack = (track || 'javascript').toLowerCase();
  const safeTopic = topicTitle || 'General';
  const safeQuestion = questionTitle || safeTopic;
  const now = formatLocalTimestamp();

  // Find existing guide to prevent versioning / duplicate records
  const existingIdx = guides.findIndex(g =>
    (g.track || '').toLowerCase() === normTrack &&
    (g.topic_title || '').toLowerCase() === safeTopic.toLowerCase() &&
    (g.question_title || '').toLowerCase() === safeQuestion.toLowerCase()
  );

  if (existingIdx !== -1) {
    // In-place update: strict single record per question, no versioning
    const existing = guides[existingIdx];
    existing.concept = concept || existing.concept;
    existing.problem_description = problemDescription || existing.problem_description;
    existing.guide_content = guideContent || existing.guide_content;
    existing.search_results_count = Number(searchResultsCount) || existing.search_results_count;
    existing.model = model || existing.model || 'Verified Engine';
    existing.updated_at = now;
    writeJsonGuides(guides);
    return existing;
  }

  // Create single new record
  const maxId = guides.reduce((acc, g) => Math.max(acc, Number(g.id) || 0), 0);
  const newGuide = {
    id: maxId + 1,
    track: normTrack,
    topic_title: safeTopic,
    question_title: safeQuestion,
    concept: concept || '',
    problem_description: problemDescription || '',
    guide_content: guideContent || '',
    search_results_count: Number(searchResultsCount) || 0,
    model: model || 'Verified Engine',
    created_at: now,
    updated_at: now
  };

  guides.unshift(newGuide);
  writeJsonGuides(guides);
  return newGuide;
}

function getGuideById(id) {
  const guides = readJsonGuides();
  const numId = Number(id);
  return guides.find(g => Number(g.id) === numId) || null;
}

function getLatestGuide({ track = 'javascript', topicTitle, questionTitle }) {
  const guides = readJsonGuides();
  const normalizedTrack = (track || 'javascript').toLowerCase();

  if (questionTitle && topicTitle) {
    const found = guides.find(g =>
      (g.track || '').toLowerCase() === normalizedTrack &&
      (g.topic_title || '').toLowerCase() === topicTitle.toLowerCase() &&
      (g.question_title || '').toLowerCase() === questionTitle.toLowerCase()
    );
    if (found) return found;
  }

  if (topicTitle) {
    const found = guides.find(g =>
      (g.track || '').toLowerCase() === normalizedTrack &&
      (g.topic_title || '').toLowerCase() === topicTitle.toLowerCase()
    );
    if (found) return found;
  }

  return null;
}

function listGuides({ track, search, limit = 50, offset = 0 } = {}) {
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
    updated_at: g.updated_at,
    preview: (g.guide_content || '').slice(0, 280),
    content_length: (g.guide_content || '').length
  }));
}

function getGuidesCount(track) {
  const guides = readJsonGuides();
  if (track) {
    const normTrack = track.toLowerCase();
    return guides.filter(g => g.track && g.track.toLowerCase() === normTrack).length;
  }
  return guides.length;
}

function deleteGuide(id) {
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

function getStorageStatus() {
  return {
    mode: 'json',
    storage: 'Local JSON File',
    jsonPath: JSON_PATH,
    counts: {
      json: getGuidesCount(),
      active: getGuidesCount()
    }
  };
}

// Pre-initialize JSON file immediately on module load
readJsonGuides();

module.exports = {
  getStorageMode: () => 'json',
  setStorageMode: () => 'json',
  getStorageStatus,
  saveGuide,
  getGuideById,
  getLatestGuide,
  listGuides,
  getGuidesCount,
  deleteGuide
};
