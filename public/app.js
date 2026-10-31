// JS.DEPTH / REACT.DEPTH — Dedicated Deep Knowledge Masterclass Controller
// Pure Conceptual Architecture & Engine Internals (No Code Editor, No Problem Puzzles)

(function () {
  'use strict';

  // Track Awareness (defaults to 'javascript', override via window.APP_TRACK = 'react')
  const currentTrack = window.APP_TRACK || 'javascript';
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
    initMobileDrawer();
    setupEventListeners();
    await initStorageMode();
    checkHealth();
    await loadTopics();
    updateSavedGuidesCount();
  }

  // Mobile Sidebar Drawer Management
  function closeMobileSidebar() {
    const sidebar = document.querySelector('.sidebar-panel');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (backdrop) backdrop.classList.remove('active');
    document.body.classList.remove('sidebar-is-open');
  }

  function toggleMobileSidebar() {
    const sidebar = document.querySelector('.sidebar-panel');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (!sidebar) return;
    const isOpen = sidebar.classList.toggle('mobile-open');
    if (backdrop) backdrop.classList.toggle('active', isOpen);
    document.body.classList.toggle('sidebar-is-open', isOpen);
  }

  function initMobileDrawer() {
    const mobileToggle = document.getElementById('mobileSidebarToggle');
    const mobileClose = document.getElementById('mobileSidebarClose');
    const backdrop = document.getElementById('sidebarBackdrop');

    if (mobileToggle) mobileToggle.addEventListener('click', toggleMobileSidebar);
    if (mobileClose) mobileClose.addEventListener('click', closeMobileSidebar);
    if (backdrop) backdrop.addEventListener('click', closeMobileSidebar);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobileSidebar();
    });
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
      const trackLabel = currentTrack === 'react' ? 'React' : 'JavaScript';
      topicsTree.innerHTML = `<div class="loading-state"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading ${trackLabel} syllabus...</div>`;
      const res = await fetch('/api/topics?track=' + currentTrack);
      const data = await res.json();
      state.categories = data.categories || [];
      renderTopicsTree(state.categories);
      updateMasteryProgress();

      // Check URL hash for direct topic navigation (e.g. #execution-context)
      const hash = window.location.hash.replace(/^#/, '');
      let defaultSelected = false;

      if (hash) {
        for (const cat of state.categories) {
          const match = cat.topics.find(t => t.id === hash);
          if (match) {
            selectTopic(match, cat);
            defaultSelected = true;
            break;
          }
        }
      }

      // Fallback: select first topic by default
      if (!defaultSelected && state.categories.length > 0 && state.categories[0].topics.length > 0) {
        selectTopic(state.categories[0].topics[0], state.categories[0]);
      }
    } catch (err) {
      console.error('Failed to load syllabus:', err);
      topicsTree.innerHTML = `<div class="empty-eval-state"><p style="color:var(--accent-danger);">Failed to load syllabus: ${err.message}</p></div>`;
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
        (t.tag && t.tag.toLowerCase().includes(q)) || 
        (t.summary && t.summary.toLowerCase().includes(q))
      );

      if (q && matchingTopics.length === 0) return;

      const catEl = document.createElement('div');
      catEl.className = 'category-group';

      const catHeader = document.createElement('div');
      catHeader.className = 'category-header';
      
      const masteredInCat = cat.topics.filter(t => state.masteredTopics.has(t.id)).length;
      
      const accentColor = currentTrack === 'react' ? '#38bdf8' : '#eab308';
      const accentBg = currentTrack === 'react' ? 'rgba(56,189,248,0.12)' : 'rgba(234,179,8,0.12)';
      const accentBorder = currentTrack === 'react' ? 'rgba(56,189,248,0.3)' : 'rgba(234,179,8,0.3)';

      catHeader.innerHTML = `
        <div class="cat-title-wrap">
          <i class="fa-solid fa-chevron-down cat-arrow"></i>
          <span>${cat.category}</span>
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <span class="category-badge" style="background:${accentBg}; color:${accentColor}; border:1px solid ${accentBorder};">${masteredInCat}/${cat.topics.length}</span>
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
          <span class="topic-badge" style="border-color:${accentBorder};">${t.tag || 'Architecture'}</span>
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

    closeMobileSidebar();

    // Update URL hash without jumping
    if (history.replaceState) {
      history.replaceState(null, null, '#' + topic.id);
    }

    // Breadcrumbs
    crumbCategory.textContent = category.category.replace(/^\d+\.\s*/, '');
    crumbTopic.textContent = topic.title;

    // Hero Overview
    topicTitle.textContent = topic.title;
    topicBadge.textContent = topic.tag || category.badge || (currentTrack === 'react' ? 'React Architecture' : 'JS Engine');
    topicImportanceText.textContent = topic.importance || topic.summary;
    topicMentalModel.textContent = topic.mentalModel || topic.summary;
    topicTraps.textContent = topic.traps || 'Subtle engine behaviors and edge cases that typical candidates fail to explain.';

    // Interactive Concept Interview Questions Card
    renderInterviewQuestions(topic.interviewQuestions);

    updateMasteredButtonState();
    switchView('guide');

    // Load guide
    await checkAndLoadGuide(topic);
  }

  // Render Interactive Concept Questions
  function renderInterviewQuestions(questions) {
    if (!interviewQuestionsCard || !topicInterviewQuestions) return;

    if (!questions || questions.length === 0) {
      interviewQuestionsCard.style.display = 'none';
      return;
    }

    interviewQuestionsCard.style.display = 'flex';

    if (Array.isArray(questions)) {
      const qCardsHtml = questions.map((q, idx) => {
        const isObj = typeof q === 'object' && q !== null;
        const qText = isObj ? q.question : q;
        const qAns = isObj ? q.answer : '';
        const qWhy = isObj ? q.whyAsked : '';
        const qDiff = isObj ? q.difficulty : '';

        const diffBadge = qDiff ? `<span class="ds-badge" style="background:rgba(56,189,248,0.1); color:#38bdf8; font-size:10px; text-transform:uppercase;">${qDiff}</span>` : '';

        return `
          <div class="interview-q-card" data-idx="${idx}">
            <div class="interview-q-header">
              <div class="interview-q-title">
                <span class="q-num">Q${idx + 1}</span>
                <span>${escapeHtml(qText)}</span>
                ${diffBadge}
              </div>
              <i class="fa-solid fa-chevron-down q-arrow"></i>
            </div>
            <div class="interview-q-body" style="display: none;">
              ${qWhy ? `<div class="q-why"><i class="fa-solid fa-circle-question"></i> <strong>Why Interviewers Ask:</strong> ${escapeHtml(qWhy)}</div>` : ''}
              <div class="q-answer">${qAns ? marked.parse(qAns) : '<p>Detailed answer available in the Masterclass Guide below.</p>'}</div>
            </div>
          </div>
        `;
      }).join('');

      topicInterviewQuestions.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <span style="font-size:12px; color:var(--text-muted);"><i class="fa-solid fa-comments"></i> ${questions.length} Staff-Level Architectural Concept Questions</span>
          <button type="button" class="icon-btn-sm" id="toggleAllQuestionsBtn" style="font-size:11px; padding:3px 8px;">
            <i class="fa-solid fa-arrows-up-down"></i> Toggle All
          </button>
        </div>
        <div class="interview-q-list">
          ${qCardsHtml}
        </div>
      `;

      // Accordion click handlers
      const qCards = topicInterviewQuestions.querySelectorAll('.interview-q-card');
      qCards.forEach(card => {
        const header = card.querySelector('.interview-q-header');
        const body = card.querySelector('.interview-q-body');
        header.addEventListener('click', () => {
          const isExpanded = card.classList.toggle('expanded');
          body.style.display = isExpanded ? 'block' : 'none';
        });
      });

      // Toggle All button
      const toggleAllBtn = document.getElementById('toggleAllQuestionsBtn');
      if (toggleAllBtn) {
        let allExpanded = false;
        toggleAllBtn.addEventListener('click', () => {
          allExpanded = !allExpanded;
          qCards.forEach(card => {
            const body = card.querySelector('.interview-q-body');
            if (allExpanded) {
              card.classList.add('expanded');
              body.style.display = 'block';
            } else {
              card.classList.remove('expanded');
              body.style.display = 'none';
            }
          });
          toggleAllBtn.innerHTML = allExpanded 
            ? '<i class="fa-solid fa-compress"></i> Collapse All'
            : '<i class="fa-solid fa-arrows-up-down"></i> Expand All';
        });
      }
    } else {
      topicInterviewQuestions.innerHTML = `<p>${escapeHtml(questions)}</p>`;
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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

  // Check and Load Guide (from DB or curated default)
  async function checkAndLoadGuide(topic) {
    try {
      guideContent.innerHTML = `
        <div class="loading-state" style="padding: 40px 0;">
          <i class="fa-solid fa-circle-notch fa-spin"></i> Loading verified architectural guide for "${topic.title}"...
        </div>
      `;

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
          created_at: 'Curated Senior Architectural Masterclass Guide'
        });
      } else {
        guideContent.innerHTML = `
          <div class="empty-eval-state">
            <i class="fa-solid fa-book-open"></i>
            <h3>No Guide Available Yet</h3>
            <p>Click <strong>Knowledge Guide</strong> to view the verified architectural guide.</p>
          </div>
        `;
      }
    } catch (err) {
      console.warn('Could not load guide from storage, falling back to default:', err);
      if (topic.defaultGuide) {
        renderGuideContent(topic.defaultGuide, { isDb: false, created_at: 'Curated Senior Architectural Masterclass Guide' });
      }
    }
  }

  // Render Guide Markdown into Container
  function renderGuideContent(markdown, meta = {}) {
    state.currentGuideMarkdown = markdown;

    const sourcesBadge = meta.search_results_count > 0
      ? `<div style="display:inline-flex; align-items:center; gap:6px; background:rgba(16,185,129,0.12); color:#34d399; border:1px solid rgba(16,185,129,0.3); border-radius:4px; padding:3px 8px; font-size:11px; margin-right:8px; margin-bottom:12px;">
          <i class="fa-solid fa-globe"></i> Grounded with ${meta.search_results_count} Live Engine Specs
         </div>`
      : '';

    const dbBadge = meta.isDb
      ? `<div class="storage-target-badge json" style="display:inline-flex; align-items:center; gap:6px; background:rgba(14,165,233,0.12); color:#38bdf8; border:1px solid rgba(14,165,233,0.3); border-radius:4px; padding:3px 8px; font-size:11px; margin-bottom:12px;">
          <i class="fa-solid fa-file-code"></i> Saved in Local JSON (ID: #${meta.id || 'Latest'}) • ${meta.created_at || ''}
         </div>`
      : `<div style="display:inline-flex; align-items:center; gap:6px; background:rgba(16,185,129,0.12); color:#34d399; border:1px solid rgba(16,185,129,0.3); border-radius:4px; padding:3px 8px; font-size:11px; margin-bottom:12px;">
          <i class="fa-solid fa-certificate"></i> Verified Architectural Masterclass Guide
         </div>`;

    // Format GitHub-style alerts in markdown
    let processed = markdown || '';
    processed = processed.replace(/>\s*\[!NOTE\]\s*\n((?:>.*\n?)*)/gi, (match, content) => {
      const clean = content.replace(/^>\s?/gm, '');
      return `<div class="gh-alert gh-alert-note"><div class="gh-alert-title"><i class="fa-solid fa-info-circle"></i> NOTE</div>${clean}</div>\n`;
    });
    processed = processed.replace(/>\s*\[!WARNING\]\s*\n((?:>.*\n?)*)/gi, (match, content) => {
      const clean = content.replace(/^>\s?/gm, '');
      return `<div class="gh-alert gh-alert-warning"><div class="gh-alert-title"><i class="fa-solid fa-triangle-exclamation"></i> WARNING</div>${clean}</div>\n`;
    });
    processed = processed.replace(/>\s*\[!IMPORTANT\]\s*\n((?:>.*\n?)*)/gi, (match, content) => {
      const clean = content.replace(/^>\s?/gm, '');
      return `<div class="gh-alert gh-alert-important"><div class="gh-alert-title"><i class="fa-solid fa-circle-exclamation"></i> IMPORTANT</div>${clean}</div>\n`;
    });

    const parsedHtml = marked.parse(processed);

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

    // Apply Prism Syntax Highlighting
    if (window.Prism) {
      Prism.highlightAllUnder(guideContent);
    }
  }

  // Switch View: Guide vs Saved
  function switchView(targetView) {
    state.activeView = targetView;
    if (targetView === 'guide') {
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

  // Update Saved Guides Count Badge
  async function updateSavedGuidesCount() {
    if (!savedCountBadge) return;
    try {
      const res = await fetch(`/api/knowledge-guides/count?track=${currentTrack}&storageMode=${state.storageMode}`);
      const data = await res.json();
      if (data.success && typeof data.count === 'number') {
        savedCountBadge.textContent = data.count;
      }
    } catch (err) {
      console.warn('Could not update saved guides count:', err);
    }
  }

  // Load Saved Guides List
  async function loadSavedGuidesList(searchQuery = '') {
    if (!savedGuidesList) return;
    try {
      savedGuidesList.innerHTML = '<div class="loading-state"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading saved guides from knowledge.json...</div>';
      const q = encodeURIComponent(searchQuery || '');
      const res = await fetch(`/api/knowledge-guides?track=${currentTrack}&search=${q}&storageMode=${state.storageMode}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.guides) && data.guides.length > 0) {
        savedGuidesList.innerHTML = data.guides.map(g => `
          <div class="saved-guide-item" data-id="${g.id}">
            <div class="saved-guide-header">
              <div class="saved-guide-title">
                <i class="fa-solid fa-file-lines" style="color:var(--accent-primary);"></i>
                <strong>${escapeHtml(g.topic_title || 'Untitled Topic')}</strong>
                <span class="saved-guide-chip">${escapeHtml(g.question_title || g.concept || currentTrack)}</span>
              </div>
              <div class="saved-guide-meta">
                <span class="saved-guide-date"><i class="fa-regular fa-clock"></i> ${escapeHtml(g.created_at || 'Recently saved')}</span>
                <span class="storage-tag json"><i class="fa-solid fa-file-code"></i> JSON</span>
              </div>
            </div>
            <p class="saved-guide-preview">${escapeHtml((g.problem_description || g.concept || '').substring(0, 140))}...</p>
            <div class="saved-guide-actions">
              <button class="btn secondary-btn view-saved-btn" data-id="${g.id}"><i class="fa-solid fa-book-open"></i> Read Guide</button>
              <button class="icon-btn-sm delete-saved-btn" data-id="${g.id}" title="Delete Guide"><i class="fa-regular fa-trash-can"></i></button>
            </div>
          </div>
        `).join('');

        // Attach action handlers
        savedGuidesList.querySelectorAll('.view-saved-btn').forEach(btn => {
          btn.addEventListener('click', () => viewSavedGuide(btn.dataset.id));
        });

        savedGuidesList.querySelectorAll('.delete-saved-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteSavedGuide(btn.dataset.id);
          });
        });
      } else {
        savedGuidesList.innerHTML = `
          <div class="empty-eval-state">
            <i class="fa-solid fa-database"></i>
            <h3>No Saved Guides Yet</h3>
            <p>Saved guides in local <code>knowledge.json</code> will appear here for rapid review.</p>
          </div>
        `;
      }
    } catch (err) {
      console.error('Failed to load saved guides:', err);
      savedGuidesList.innerHTML = `<div class="empty-eval-state"><p style="color:var(--accent-danger);">Failed to load saved guides: ${err.message}</p></div>`;
    }
  }

  // View Single Saved Guide
  async function viewSavedGuide(id) {
    try {
      const res = await fetch(`/api/knowledge-guide/${id}?storageMode=${state.storageMode}`);
      const data = await res.json();
      if (data.success && data.guide) {
        switchView('guide');
        renderGuideContent(data.guide.guide_content, {
          id: data.guide.id,
          created_at: data.guide.created_at,
          search_results_count: data.guide.search_results_count,
          isDb: true,
          storageMode: data.storageMode || state.storageMode
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      alert('Could not open saved guide: ' + err.message);
    }
  }

  // Delete Saved Guide
  async function deleteSavedGuide(id) {
    if (!confirm('Are you sure you want to delete this saved guide from knowledge.json?')) return;
    try {
      const res = await fetch(`/api/knowledge-guide/${id}?storageMode=${state.storageMode}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        await updateSavedGuidesCount();
        await loadSavedGuidesList(savedGuidesSearch ? savedGuidesSearch.value : '');
      } else {
        alert('Could not delete guide: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Failed to delete guide: ' + err.message);
    }
  }

  // Copy Current Guide to Clipboard
  function copyCurrentGuide() {
    if (!state.currentGuideMarkdown) return;
    navigator.clipboard.writeText(state.currentGuideMarkdown).then(() => {
      const originalText = copyGuideBtn.innerHTML;
      copyGuideBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
      setTimeout(() => {
        copyGuideBtn.innerHTML = originalText;
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy guide:', err);
    });
  }

  // Event Listeners Setup
  function setupEventListeners() {
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    if (markMasteredBtn) markMasteredBtn.addEventListener('click', toggleMasteredStatus);
    if (copyGuideBtn) copyGuideBtn.addEventListener('click', copyCurrentGuide);

    if (generateKnowledgeBtn) {
      generateKnowledgeBtn.addEventListener('click', () => {
        if (state.selectedTopic) {
          checkAndLoadGuide(state.selectedTopic);
        }
      });
    }

    if (tabGuideBtn) tabGuideBtn.addEventListener('click', () => switchView('guide'));
    if (tabSavedBtn) tabSavedBtn.addEventListener('click', () => switchView('saved'));

    // Topic Search filter
    if (topicSearch) {
      topicSearch.addEventListener('input', (e) => {
        renderTopicsTree(state.categories, e.target.value);
      });
    }

    // Saved guides search
    if (savedGuidesSearch) {
      let debounceTimer = null;
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

    // Reset Progress
    if (resetProgressBtn) {
      resetProgressBtn.addEventListener('click', () => {
        if (confirm(`Reset all mastered topics in ${currentTrack} to 0%?`)) {
          state.masteredTopics.clear();
          localStorage.removeItem(storageMasteredKey);
          updateMasteredButtonState();
          updateMasteryProgress();
          renderTopicsTree(state.categories, topicSearch.value);
        }
      });
    }

    // Export Progress
    if (exportProgressBtn) {
      exportProgressBtn.addEventListener('click', () => {
        const payload = {
          track: currentTrack,
          exportDate: new Date().toISOString(),
          totalTopics: state.categories.reduce((acc, c) => acc + c.topics.length, 0),
          masteredCount: state.masteredTopics.size,
          masteredTopics: Array.from(state.masteredTopics)
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentTrack}-mastery-export-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }
  }

  // Start app when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
