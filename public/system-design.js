// SYS.DEPTH — System Design, Servers & Deployments Platform
// Knowledge-first client controller for Developers (No Code Editor)

(function () {
  'use strict';

  const currentTrack = 'system-design';
  const storageMasteredKey = 'jsdepth_mastered_' + currentTrack;
  const storageThemeKey = 'jsdepth_theme';

  // State Management
  const state = {
    categories: [],
    selectedTopic: null,
    selectedCategory: null,
    masteredTopics: new Set(JSON.parse(localStorage.getItem(storageMasteredKey) || '[]')),
    activeView: 'guide', // 'guide' | 'saved'
    currentGuideMarkdown: '',
    storageMode: 'json'
  };

  // DOM Elements
  const modelStatusPill = document.getElementById('modelStatusPill');
  const masteryPercentEl = document.getElementById('masteryPercent');
  const progressBarFill = document.getElementById('progressBarFill');
  const themeToggle = document.getElementById('themeToggle');
  const resetProgressBtn = document.getElementById('resetProgressBtn');
  const exportProgressBtn = document.getElementById('exportProgressBtn');

  const topicSearch = document.getElementById('topicSearch');
  const topicsTree = document.getElementById('topicsTree');

  const crumbCategory = document.getElementById('crumbCategory');
  const crumbTopic = document.getElementById('crumbTopic');
  const markMasteredBtn = document.getElementById('markMasteredBtn');
  const onlineSearchCheckbox = document.getElementById('onlineSearchCheckbox');
  const generateKnowledgeBtn = document.getElementById('generateKnowledgeBtn');
  const copyGuideBtn = document.getElementById('copyGuideBtn');

  const topicTitle = document.getElementById('topicTitle');
  const topicBadge = document.getElementById('topicBadge');
  const topicImportanceText = document.getElementById('topicImportanceText');
  const topicMentalModel = document.getElementById('topicMentalModel');
  const topicTraps = document.getElementById('topicTraps');
  const interviewQuestionsCard = document.getElementById('interviewQuestionsCard');
  const topicInterviewQuestions = document.getElementById('topicInterviewQuestions');

  const tabGuideBtn = document.getElementById('tabGuideBtn');
  const tabSavedBtn = document.getElementById('tabSavedBtn');
  const guideView = document.getElementById('guideView');
  const savedView = document.getElementById('savedView');
  const guideContent = document.getElementById('guideContent');

  const savedCountBadge = document.getElementById('savedCountBadge');
  const savedGuidesSearch = document.getElementById('savedGuidesSearch');
  const refreshSavedGuidesBtn = document.getElementById('refreshSavedGuidesBtn');
  const savedGuidesList = document.getElementById('savedGuidesList');
  const tabSavedLabel = document.getElementById('tabSavedLabel');
  const tabSavedIcon = document.getElementById('tabSavedIcon');

  const btnStorageJson = document.getElementById('btnStorageJson');
  const panelStorageJsonBtn = document.getElementById('panelStorageJsonBtn');

  // Initialize Application
  async function init() {
    initTheme();
    setupEventListeners();
    await initStorageMode();
    checkHealth();
    await loadTopics();
    updateSavedGuidesCount();
  }

  // Theme Management
  function initTheme() {
    const savedTheme = localStorage.getItem(storageThemeKey) || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(storageThemeKey, next);
    updateThemeIcon(next);
  }

  function updateThemeIcon(theme) {
    if (!themeToggle) return;
    const icon = themeToggle.querySelector('i');
    if (icon) {
      icon.className = theme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    }
  }

  // Check System Health
  async function checkHealth() {
    if (!modelStatusPill) return;
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      const indicator = modelStatusPill.querySelector('.status-indicator');
      const name = modelStatusPill.querySelector('.model-name');

      if (data.status === 'ok') {
        if (indicator) indicator.className = 'status-indicator online connected';
        if (name) name.textContent = 'Verified Suite Ready';
        modelStatusPill.title = 'Offline Verified Engine Ready';
      } else {
        if (indicator) indicator.className = 'status-indicator offline';
        if (name) name.textContent = 'Server Offline';
      }
    } catch (err) {
      const indicator = modelStatusPill.querySelector('.status-indicator');
      const name = modelStatusPill.querySelector('.model-name');
      if (indicator) indicator.className = 'status-indicator offline';
      if (name) name.textContent = 'Server Offline';
    }
  }

  // Load Topics from Backend
  async function loadTopics() {
    try {
      topicsTree.innerHTML = '<div class="loading-state"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading System Design syllabus...</div>';
      const res = await fetch('/api/topics?track=' + currentTrack);
      const data = await res.json();
      state.categories = data.categories || [];
      renderTopicsTree(state.categories);
      updateMasteryProgress();

      // Select first topic by default
      if (state.categories.length > 0 && state.categories[0].topics.length > 0) {
        selectTopic(state.categories[0].topics[0], state.categories[0]);
      }
    } catch (err) {
      console.error('Failed to load syllabus:', err);
      topicsTree.innerHTML = `<div class="empty-eval-state"><p style="color:var(--accent-danger);">Failed to load System Design syllabus: ${err.message}</p></div>`;
    }
  }

  // Render Topics Tree
  function renderTopicsTree(categories, filter = '') {
    topicsTree.innerHTML = '';
    const q = filter.toLowerCase().trim();

    categories.forEach((cat) => {
      const matchingTopics = cat.topics.filter(t => 
        !q || 
        t.title.toLowerCase().includes(q) || 
        t.tag.toLowerCase().includes(q) || 
        (t.summary && t.summary.toLowerCase().includes(q))
      );

      if (q && matchingTopics.length === 0) return;

      const catEl = document.createElement('div');
      catEl.className = 'category-group';

      const catHeader = document.createElement('div');
      catHeader.className = 'category-header';
      
      const masteredInCat = cat.topics.filter(t => state.masteredTopics.has(t.id)).length;
      
      catHeader.innerHTML = `
        <div class="cat-title-wrap">
          <i class="fa-solid fa-chevron-down cat-arrow"></i>
          <span>${cat.category}</span>
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <span class="category-badge" style="background:rgba(16,185,129,0.12); color:#34d399; border:1px solid rgba(16,185,129,0.3);">${masteredInCat}/${cat.topics.length}</span>
        </div>
      `;

      const topicList = document.createElement('div');
      topicList.className = 'category-topics';

      catHeader.addEventListener('click', () => {
        catHeader.classList.toggle('collapsed');
        topicList.classList.toggle('collapsed');
      });

      matchingTopics.forEach(t => {
        const item = document.createElement('div');
        item.className = 'topic-item';
        item.dataset.topicId = t.id;

        if (state.selectedTopic && state.selectedTopic.id === t.id) {
          item.classList.add('active');
        }

        const isMastered = state.masteredTopics.has(t.id);
        if (isMastered) {
          item.classList.add('mastered');
        }

        item.innerHTML = `
          <div class="topic-item-left">
            <span class="topic-status-dot ${isMastered ? 'done' : ''}"><i class="fa-solid fa-check"></i></span>
            <span class="topic-item-title">${t.title}</span>
          </div>
          <span class="topic-badge" style="border-color:rgba(16,185,129,0.3);">${t.tag}</span>
        `;

        item.addEventListener('click', () => {
          selectTopic(t, cat);
          document.querySelectorAll('.topic-item').forEach(el => el.classList.remove('active'));
          item.classList.add('active');
        });

        topicList.appendChild(item);
      });

      catEl.appendChild(catHeader);
      catEl.appendChild(topicList);
      topicsTree.appendChild(catEl);
    });
  }

  // Select a Topic
  async function selectTopic(topic, category) {
    state.selectedTopic = topic;
    state.selectedCategory = category;

    // Breadcrumbs
    crumbCategory.textContent = category.category.replace(/^\d+\.\s*/, '');
    crumbTopic.textContent = topic.title;

    // Hero Overview
    topicTitle.textContent = topic.title;
    topicBadge.textContent = topic.tag || category.badge;
    topicImportanceText.textContent = topic.importance || topic.summary;
    topicMentalModel.textContent = topic.mentalModel || topic.summary;
    topicTraps.textContent = topic.traps || 'Understanding distributed failure modes and trade-offs without guessing.';

    // Interview Questions
    if (topic.interviewQuestions && topic.interviewQuestions.length > 0) {
      interviewQuestionsCard.style.display = 'flex';
      const listItems = Array.isArray(topic.interviewQuestions)
        ? topic.interviewQuestions.map(q => `<li><strong>Q:</strong> ${q}</li>`).join('')
        : `<li>${topic.interviewQuestions}</li>`;
      topicInterviewQuestions.innerHTML = `<ul>${listItems}</ul>`;
    } else {
      interviewQuestionsCard.style.display = 'none';
    }

    updateMasteredButtonState();
    switchView('guide');

    // Check for saved guide in DB, else render default curated guide
    await checkAndLoadGuide(topic);
  }

  // Update Mastered Button State
  function updateMasteredButtonState() {
    if (!markMasteredBtn || !state.selectedTopic) return;
    const isMastered = state.masteredTopics.has(state.selectedTopic.id);
    if (isMastered) {
      markMasteredBtn.classList.add('mastered');
      markMasteredBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Mastered';
    } else {
      markMasteredBtn.classList.remove('mastered');
      markMasteredBtn.innerHTML = '<i class="fa-regular fa-circle-check"></i> Mark as Mastered';
    }
  }

  // Toggle Mastered Status for Topic
  function toggleMasteredStatus() {
    if (!state.selectedTopic) return;
    const id = state.selectedTopic.id;
    if (state.masteredTopics.has(id)) {
      state.masteredTopics.delete(id);
    } else {
      state.masteredTopics.add(id);
    }

    localStorage.setItem(storageMasteredKey, JSON.stringify(Array.from(state.masteredTopics)));
    updateMasteredButtonState();
    updateMasteryProgress();
    renderTopicsTree(state.categories, topicSearch.value);
  }

  // Update Overall Curriculum Mastery Progress
  function updateMasteryProgress() {
    let totalTopics = 0;
    state.categories.forEach(c => { totalTopics += c.topics.length; });

    const solvedCount = state.masteredTopics.size;
    const pct = totalTopics > 0 ? Math.round((solvedCount / totalTopics) * 100) : 0;

    masteryPercentEl.textContent = `${pct}% (${solvedCount}/${totalTopics})`;
    progressBarFill.style.width = `${pct}%`;
  }

  // Storage Management (Strictly Local JSON File - knowledge.json)
  async function initStorageMode() {
    state.storageMode = 'json';
    updateStorageUI();
  }

  function updateStorageUI() {
    if (btnStorageJson) btnStorageJson.classList.add('active');
    if (panelStorageJsonBtn) panelStorageJsonBtn.classList.add('active');
    if (tabSavedLabel) tabSavedLabel.textContent = 'Saved JSON';
    if (tabSavedIcon) tabSavedIcon.className = 'fa-solid fa-file-code';
  }

  async function handleStorageSwitch(targetMode) {
    state.storageMode = 'json';
    updateStorageUI();

    try {
      await fetch('/api/storage-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: targetMode })
      });
    } catch (e) {
      // Non-critical
    }

    await updateSavedGuidesCount();

    if (state.activeView === 'saved') {
      loadSavedGuidesList(savedGuidesSearch ? savedGuidesSearch.value : '');
    }

    if (state.selectedTopic) {
      checkAndLoadGuide(state.selectedTopic);
    }
  }

  // Check and Load Guide (from DB or default)
  async function checkAndLoadGuide(topic) {
    try {
      const res = await fetch(`/api/knowledge-guide?track=${currentTrack}&topicTitle=${encodeURIComponent(topic.title)}&storageMode=${state.storageMode}`);
      const data = await res.json();

      if (data.success && data.guide && data.guide.guide_content) {
        renderGuideContent(data.guide.guide_content, {
          id: data.guide.id,
          created_at: data.guide.created_at,
          search_results_count: data.guide.search_results_count,
          isDb: true,
          storageMode: data.storageMode || state.storageMode
        });
      } else if (topic.defaultGuide) {
        renderGuideContent(topic.defaultGuide, {
          isDb: false,
          created_at: 'Curated Senior System Architecture Guide'
        });
      } else {
        guideContent.innerHTML = `
          <div class="empty-eval-state">
            <i class="fa-solid fa-server"></i>
            <h3>No Guide Available Yet</h3>
            <p>Click <strong>Generate Knowledge Guide</strong> to synthesize an in-depth system architecture guide with local AI.</p>
          </div>
        `;
      }
    } catch (err) {
      console.warn('Could not load guide from storage, falling back to default:', err);
      if (topic.defaultGuide) {
        renderGuideContent(topic.defaultGuide, { isDb: false, created_at: 'Curated Senior System Architecture Guide' });
      }
    }
  }

  // Render Guide Markdown into Container
  function renderGuideContent(markdown, meta = {}) {
    state.currentGuideMarkdown = markdown;

    const sourcesBadge = meta.search_results_count > 0
      ? `<div style="display:inline-flex; align-items:center; gap:6px; background:rgba(16,185,129,0.12); color:#34d399; border:1px solid rgba(16,185,129,0.3); border-radius:4px; padding:3px 8px; font-size:11px; margin-right:8px; margin-bottom:12px;">
          <i class="fa-solid fa-globe"></i> Grounded with ${meta.search_results_count} Live Architecture Specs
         </div>`
      : '';

    const dbBadge = meta.isDb
      ? `<div class="storage-target-badge json" style="display:inline-flex; align-items:center; gap:6px; background:rgba(14,165,233,0.12); color:#38bdf8; border:1px solid rgba(14,165,233,0.3); border-radius:4px; padding:3px 8px; font-size:11px; margin-bottom:12px;">
          <i class="fa-solid fa-file-code"></i> Saved in Local JSON (ID: #${meta.id || 'Latest'}) • ${meta.created_at || ''}
         </div>`
      : `<div style="display:inline-flex; align-items:center; gap:6px; background:rgba(16,185,129,0.12); color:#34d399; border:1px solid rgba(16,185,129,0.3); border-radius:4px; padding:3px 8px; font-size:11px; margin-bottom:12px;">
          <i class="fa-solid fa-certificate"></i> Verified Senior Systems Guide
         </div>`;

    const parsedHtml = marked.parse(markdown || '');

    guideContent.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 12px;">
        <div>
          ${sourcesBadge}
          ${dbBadge}
        </div>
      </div>
      <div class="guide-body-rendered">
        ${parsedHtml}
      </div>
    `;

    // Apply Prism syntax highlighting
    Prism.highlightAllUnder(guideContent);

    // Add copy buttons to all code blocks
    attachCodeCopyButtons();
  }

  // Attach Copy Buttons to Code Blocks
  function attachCodeCopyButtons() {
    const preBlocks = guideContent.querySelectorAll('pre');
    preBlocks.forEach(pre => {
      if (pre.querySelector('.code-copy-btn')) return;
      pre.style.position = 'relative';

      const copyBtn = document.createElement('button');
      copyBtn.className = 'icon-btn-sm code-copy-btn';
      copyBtn.title = 'Copy code snippet';
      copyBtn.style.position = 'absolute';
      copyBtn.style.top = '8px';
      copyBtn.style.right = '8px';
      copyBtn.style.background = 'rgba(0,0,0,0.4)';
      copyBtn.style.padding = '4px 8px';
      copyBtn.style.fontSize = '11px';
      copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i>';

      copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const code = pre.querySelector('code');
        const text = code ? code.innerText : pre.innerText;
        navigator.clipboard.writeText(text).then(() => {
          copyBtn.innerHTML = '<i class="fa-solid fa-check" style="color:#34d399;"></i>';
          setTimeout(() => {
            copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i>';
          }, 1800);
        });
      });

      pre.appendChild(copyBtn);
    });
  }

  // Load In-Depth Topic Knowledge
  async function generateTopicKnowledge() {
    if (!state.selectedTopic) return;

    switchView('guide');
    const btn = generateKnowledgeBtn;
    const originalText = btn.innerHTML;
    btn.disabled = true;

    guideContent.innerHTML = `
      <div class="loading-knowledge" style="text-align:center; padding: 60px 20px;">
        <i class="fa-solid fa-book-open fa-bounce" style="font-size:36px; color:#10b981; margin-bottom:16px;"></i>
        <h3 style="font-size:18px; margin-bottom:8px; color:var(--text-primary);">Loading System Architecture Guide</h3>
        <p style="color:var(--text-secondary); margin-bottom:12px;">Grounding with distributed systems architecture, servers, and deployment models...</p>
      </div>
    `;

    try {
      const res = await fetch('/api/explain-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          track: currentTrack,
          topicTitle: state.selectedTopic.title,
          questionTitle: state.selectedTopic.title,
          concept: state.selectedTopic.tag,
          problemDescription: `${state.selectedTopic.summary}\n${state.selectedTopic.importance || ''}`,
          storageMode: state.storageMode
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate system design knowledge');
      }

      renderGuideContent(data.explanation, {
        id: data.savedGuide ? data.savedGuide.id : 'Latest',
        created_at: 'Just now',
        search_results_count: data.searchResultsCount || 0,
        isDb: true,
        storageMode: data.storageMode || state.storageMode
      });

      updateSavedGuidesCount();
    } catch (err) {
      console.error('Error generating guide:', err);
      guideContent.innerHTML = `
        <div class="empty-eval-state">
          <i class="fa-solid fa-triangle-exclamation" style="color:var(--accent-danger);"></i>
          <h3>Knowledge Generation Failed</h3>
          <p>${err.message}</p>
        </div>
      `;
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  }

  // Switch View (Guide vs Saved in DB)
  function switchView(viewName) {
    state.activeView = viewName;
    if (viewName === 'guide') {
      tabGuideBtn.classList.add('active');
      tabSavedBtn.classList.remove('active');
      guideView.style.display = 'block';
      savedView.style.display = 'none';
    } else {
      tabGuideBtn.classList.remove('active');
      tabSavedBtn.classList.add('active');
      guideView.style.display = 'none';
      savedView.style.display = 'block';
      loadSavedGuidesList(savedGuidesSearch ? savedGuidesSearch.value : '');
    }
  }

  // Update total count badge for saved knowledge guides
  async function updateSavedGuidesCount() {
    if (!savedCountBadge) return;
    try {
      const res = await fetch(`/api/knowledge-guides/count?track=${currentTrack}&storageMode=${state.storageMode}`);
      const data = await res.json();
      if (data.success && typeof data.count === 'number') {
        savedCountBadge.textContent = String(data.count);
      }
    } catch (e) {
      console.warn('Could not fetch guides count:', e);
    }
  }

  // Load Saved Guides List from local JSON storage
  async function loadSavedGuidesList(searchQuery = '') {
    if (!savedGuidesList) return;
    const isJson = state.storageMode === 'json';
    savedGuidesList.innerHTML = `<div class="empty-eval-state"><i class="fa-solid fa-circle-notch fa-spin"></i><p>Loading saved guides from JSON storage...</p></div>`;

    try {
      let url = `/api/knowledge-guides?track=${currentTrack}&limit=50`;
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!data.success || !data.guides || data.guides.length === 0) {
        savedGuidesList.innerHTML = `
          <div class="empty-eval-state">
            <i class="fa-solid fa-file-code"></i>
            <h3>No Saved Guides in Local JSON</h3>
            <p>${searchQuery ? 'No saved guides match your search query.' : 'Click "Knowledge Guide" to view and persist guides to knowledge.json.'}</p>
          </div>
        `;
        return;
      }

      savedGuidesList.innerHTML = '';
      data.guides.forEach(g => {
        const item = document.createElement('div');
        item.className = 'saved-guide-item';

        const previewSnippet = (g.preview || g.guide_content || '').slice(0, 150).replace(/#+\s+/g, '').replace(/```[\s\S]*?```/g, '') + '...';

        item.innerHTML = `
          <div class="saved-guide-info">
            <div class="saved-guide-title">
              <i class="fa-solid fa-server" style="color:#34d399;"></i>
              <span>${g.topic_title}</span>
            </div>
            <div class="saved-guide-meta">
              <span><i class="fa-regular fa-clock"></i> ${g.created_at || 'Recently'}</span>
              <span class="badge" style="background:rgba(14,165,233,0.15); color:#38bdf8; font-size:10px;">
                <i class="fa-solid fa-file-code"></i> JSON #${g.id}
              </span>
              ${g.search_results_count > 0 ? `<span style="color:#34d399;"><i class="fa-solid fa-globe"></i> ${g.search_results_count} Specs</span>` : ''}
            </div>
            <div class="saved-guide-preview">${previewSnippet}</div>
          </div>
          <div class="saved-guide-actions">
            <button class="btn-xs view-saved-btn" title="Open this guide in viewer">
              <i class="fa-solid fa-book-open"></i> Read
            </button>
            <button class="icon-btn-sm delete-saved-btn" title="Delete guide from storage" style="color:var(--accent-danger);">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        `;

        item.querySelector('.view-saved-btn').addEventListener('click', async () => {
          try {
            const detailRes = await fetch(`/api/knowledge-guides/${g.id}?storageMode=${state.storageMode}`);
            const detailData = await detailRes.json();
            const fullContent = detailData.success && detailData.guide ? detailData.guide.guide_content : g.guide_content;
            renderGuideContent(fullContent, {
              id: g.id,
              created_at: g.created_at,
              search_results_count: g.search_results_count,
              isDb: true,
              storageMode: state.storageMode
            });
            switchView('guide');
          } catch (e) {
            renderGuideContent(g.guide_content, {
              id: g.id,
              created_at: g.created_at,
              search_results_count: g.search_results_count,
              isDb: true,
              storageMode: state.storageMode
            });
            switchView('guide');
          }
        });

        item.querySelector('.delete-saved-btn').addEventListener('click', async (e) => {
          e.stopPropagation();
          const target = state.storageMode === 'json' ? 'local JSON file' : 'database';
          if (confirm(`Delete saved guide for "${g.topic_title}" from ${target}?`)) {
            await deleteGuideById(g.id);
          }
        });

        savedGuidesList.appendChild(item);
      });
    } catch (err) {
      console.error('Error listing guides:', err);
      savedGuidesList.innerHTML = `<div class="empty-eval-state"><p style="color:var(--accent-danger);">Failed to load saved guides: ${err.message}</p></div>`;
    }
  }

  // Delete a Guide by ID
  async function deleteGuideById(id) {
    try {
      const res = await fetch(`/api/knowledge-guides/${id}?storageMode=${state.storageMode}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadSavedGuidesList(savedGuidesSearch ? savedGuidesSearch.value : '');
        updateSavedGuidesCount();
      }
    } catch (err) {
      alert('Failed to delete guide: ' + err.message);
    }
  }

  // Copy Full Guide
  function copyFullGuide() {
    if (!state.currentGuideMarkdown) return;
    navigator.clipboard.writeText(state.currentGuideMarkdown).then(() => {
      const orig = copyGuideBtn.innerHTML;
      copyGuideBtn.innerHTML = '<i class="fa-solid fa-check" style="color:#34d399;"></i> Copied!';
      setTimeout(() => { copyGuideBtn.innerHTML = orig; }, 1800);
    });
  }

  // Reset Progress
  function resetProgress() {
    if (confirm('Are you sure you want to reset all mastered topics for System Design to 0%?')) {
      state.masteredTopics.clear();
      localStorage.removeItem(storageMasteredKey);
      updateMasteredButtonState();
      updateMasteryProgress();
      renderTopicsTree(state.categories, topicSearch.value);
    }
  }

  // Export Progress
  function exportProgress() {
    const data = {
      track: currentTrack,
      masteredTopics: Array.from(state.masteredTopics),
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-design-mastery-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Setup Event Listeners
  function setupEventListeners() {
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    if (resetProgressBtn) resetProgressBtn.addEventListener('click', resetProgress);
    if (exportProgressBtn) exportProgressBtn.addEventListener('click', exportProgress);

    if (markMasteredBtn) markMasteredBtn.addEventListener('click', toggleMasteredStatus);
    if (generateKnowledgeBtn) generateKnowledgeBtn.addEventListener('click', generateTopicKnowledge);
    if (copyGuideBtn) copyGuideBtn.addEventListener('click', copyFullGuide);

    // Storage Controls (JSON Storage)
    if (btnStorageJson) btnStorageJson.addEventListener('click', () => handleStorageSwitch('json'));
    if (panelStorageJsonBtn) panelStorageJsonBtn.addEventListener('click', () => handleStorageSwitch('json'));

    if (tabGuideBtn) tabGuideBtn.addEventListener('click', () => switchView('guide'));
    if (tabSavedBtn) tabSavedBtn.addEventListener('click', () => switchView('saved'));

    if (topicSearch) {
      topicSearch.addEventListener('input', (e) => {
        renderTopicsTree(state.categories, e.target.value);
      });
    }

    if (savedGuidesSearch) {
      let debounceTimer;
      savedGuidesSearch.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          loadSavedGuidesList(e.target.value);
        }, 300);
      });
    }

    if (refreshSavedGuidesBtn) {
      refreshSavedGuidesBtn.addEventListener('click', () => {
        loadSavedGuidesList(savedGuidesSearch ? savedGuidesSearch.value : '');
        updateSavedGuidesCount();
      });
    }
  }

  // Start application on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
