// JS.DEPTH — Interactive Client Application
// End-to-End JavaScript & React Mastery Platform with Monaco Editor & Automated Test Runner

(function () {
  'use strict';

  // Track Awareness (JavaScript vs React, switchable via sidebar pills)
  let currentTrack = window.APP_TRACK || 'javascript';
  const getMasteredKey = () => 'jsdepth_mastered_' + currentTrack;
  const getHistoryKey = () => 'jsdepth_code_history_' + currentTrack;

  // Auto-reset solved questions data migration
  if (!localStorage.getItem('jsdepth_reset_solved_v1')) {
    localStorage.removeItem('jsdepth_mastered_javascript');
    localStorage.removeItem('jsdepth_mastered_react');
    localStorage.removeItem('jsdepth_code_history_javascript');
    localStorage.removeItem('jsdepth_code_history_react');
    localStorage.setItem('jsdepth_reset_solved_v1', 'true');
  }

  // State Management
  const state = {
    categories: [],
    selectedTopic: null,
    selectedDifficulty: 'Basic',
    currentQuestion: null,
    masteredTopics: new Set(JSON.parse(localStorage.getItem(getMasteredKey()) || '[]')),
    userCodeHistory: JSON.parse(localStorage.getItem(getHistoryKey()) || '{}'),
    lastConsoleOutput: '',
    storageMode: 'json'
  };

  // Monaco Editor Reference
  let monacoEditor = null;

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
  const diffChips = document.querySelectorAll('.diff-chip');
  const onlineSearchCheckbox = document.getElementById('onlineSearchCheckbox');
  const explainTopicBtn = document.getElementById('explainTopicBtn');
  const generateQuestionBtn = document.getElementById('generateQuestionBtn');

  const problemTitle = document.getElementById('problemTitle');
  const problemDifficulty = document.getElementById('problemDifficulty');
  const problemConcept = document.getElementById('problemConcept');
  const problemDescription = document.getElementById('problemDescription');
  const toggleTrapBtn = document.getElementById('toggleTrapBtn');
  const interviewTrapBox = document.getElementById('interviewTrapBox');
  const interviewTrapText = document.getElementById('interviewTrapText');

  const monacoEditorContainer = document.getElementById('monacoEditorContainer');
  const codeEditor = document.getElementById('codeEditor');
  const lineNumbers = document.getElementById('lineNumbers');
  const resetCodeBtn = document.getElementById('resetCodeBtn');
  const formatCodeBtn = document.getElementById('formatCodeBtn');
  const runCodeBtn = document.getElementById('runCodeBtn');
  const evaluateBtn = document.getElementById('evaluateBtn');

  // Test Results & Console Tabs
  const tabTestCasesBtn = document.getElementById('tabTestCasesBtn');
  const tabConsoleBtn = document.getElementById('tabConsoleBtn');
  const testCasesPane = document.getElementById('testCasesPane');
  const consolePane = document.getElementById('consolePane');
  const testSummaryBadge = document.getElementById('testSummaryBadge');
  const testBanner = document.getElementById('testBanner');
  const testCasesList = document.getElementById('testCasesList');

  const consoleOutput = document.getElementById('consoleOutput');
  const execTime = document.getElementById('execTime');
  const clearConsoleBtn = document.getElementById('clearConsoleBtn');

  // Right Panel Tabs & Content
  const tabKnowledgeBtn = document.getElementById('tabKnowledgeBtn');
  const tabSavedGuidesBtn = document.getElementById('tabSavedGuidesBtn');
  const tabEvalBtn = document.getElementById('tabEvalBtn');
  const knowledgePane = document.getElementById('knowledgePane');
  const savedGuidesPane = document.getElementById('savedGuidesPane');
  const evalPane = document.getElementById('evalPane');
  const emptyKnowledgeState = document.getElementById('emptyKnowledgeState');
  const knowledgeContent = document.getElementById('knowledgeContent');
  const savedCountBadge = document.getElementById('savedCountBadge');
  const savedGuidesSearch = document.getElementById('savedGuidesSearch');
  const refreshSavedGuidesBtn = document.getElementById('refreshSavedGuidesBtn');
  const savedGuidesList = document.getElementById('savedGuidesList');
  const tabSavedLabel = document.getElementById('tabSavedLabel');
  const tabSavedIcon = document.getElementById('tabSavedIcon');

  const btnStorageJson = document.getElementById('btnStorageJson');
  const panelStorageJsonBtn = document.getElementById('panelStorageJsonBtn');

  const evaluationContent = document.getElementById('evaluationContent');
  const markMasteredBtn = document.getElementById('markMasteredBtn');

  const evaluationPanel = document.getElementById('evaluationPanel');
  const toggleMaximizeBtn = document.getElementById('toggleMaximizeBtn');
  const panelMaxTopicBadge = document.getElementById('panelMaxTopicBadge');
  const panelMaxTopicName = document.getElementById('panelMaxTopicName');
  const floatingMinimizeBtn = document.getElementById('floatingMinimizeBtn');
  const emptyStateGenerateBtn = document.getElementById('emptyStateGenerateBtn');
  const emptyStateMaximizeBtn = document.getElementById('emptyStateMaximizeBtn');

  // Initialize
  async function init() {
    setupTheme();
    setupEditor();
    setupEventListeners();
    await initStorageMode();
    await checkModelHealth();
    await loadTopics();
    updateMasteryProgress();
    await updateSavedGuidesCount();
  }

  // Theme Management
  function setupTheme() {
    const savedTheme = localStorage.getItem('jsdepth_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('jsdepth_theme', next);
      updateThemeIcon(next);

      if (window.monaco && monaco.editor) {
        monaco.editor.setTheme(next === 'light' ? 'vs' : 'vs-dark');
      }
    });
  }

  function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    if (theme === 'dark') {
      icon.className = 'fa-solid fa-moon';
    } else {
      icon.className = 'fa-solid fa-sun';
    }
  }

  // Model Health Check
  async function checkModelHealth() {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      const indicator = modelStatusPill ? modelStatusPill.querySelector('.status-indicator') : null;
      const label = modelStatusPill ? modelStatusPill.querySelector('.model-name') : null;

      if (data.status === 'ok') {
        if (indicator) indicator.className = 'status-indicator connected';
        if (label) label.textContent = 'Verified Suite Ready';
        if (modelStatusPill) modelStatusPill.title = 'Offline Verified Engine & Test Suite Ready';
      } else {
        if (indicator) indicator.className = 'status-indicator offline';
        if (label) label.textContent = 'Server Offline';
      }
    } catch (err) {
      const indicator = modelStatusPill ? modelStatusPill.querySelector('.status-indicator') : null;
      const label = modelStatusPill ? modelStatusPill.querySelector('.model-name') : null;
      if (indicator) indicator.className = 'status-indicator offline';
      if (label) label.textContent = 'Server Offline';
    }
  }

  // Load Topics from API
  async function loadTopics() {
    try {
      topicsTree.innerHTML = '<div class="loading-state"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading interview coding challenges...</div>';
      const res = await fetch('/api/challenges?track=' + currentTrack);
      const data = await res.json();
      state.categories = data.categories || [];
      renderTopicsTree(state.categories);

      // Select first topic by default
      if (state.categories.length > 0 && state.categories[0].topics.length > 0) {
        selectTopic(state.categories[0].topics[0], state.categories[0]);
      }
    } catch (err) {
      topicsTree.innerHTML = `<div class="empty-eval-state"><p style="color:var(--accent-danger);">Failed to load syllabus: ${err.message}</p></div>`;
    }
  }

  // Switch Track (JS Problems vs React Problems)
  function switchTrack(targetTrack) {
    if (currentTrack === targetTrack) return;
    currentTrack = targetTrack;
    const btnJs = document.getElementById('btnTrackJs');
    const btnReact = document.getElementById('btnTrackReact');
    if (btnJs) btnJs.classList.toggle('active', targetTrack === 'javascript');
    if (btnReact) btnReact.classList.toggle('active', targetTrack === 'react');

    state.masteredTopics = new Set(JSON.parse(localStorage.getItem(getMasteredKey()) || '[]'));
    state.userCodeHistory = JSON.parse(localStorage.getItem(getHistoryKey()) || '{}');
    loadTopics();
    updateMasteryProgress();
    updateSavedGuidesCount();
  }

  // Render Topics Tree
  function renderTopicsTree(categories, filter = '') {
    topicsTree.innerHTML = '';
    const q = filter.toLowerCase().trim();

    categories.forEach(cat => {
      const filteredTopics = cat.topics.filter(t => 
        !q || t.title.toLowerCase().includes(q) || t.summary.toLowerCase().includes(q) || t.tag.toLowerCase().includes(q)
      );

      if (filteredTopics.length === 0) return;

      const catEl = document.createElement('div');
      catEl.className = 'category-group';

      const catHeader = document.createElement('div');
      catHeader.className = 'category-header';
      catHeader.innerHTML = `<span>${cat.category}</span><i class="fa-solid fa-angle-down"></i>`;

      const topicList = document.createElement('div');
      topicList.className = 'topic-list';

      filteredTopics.forEach(t => {
        const item = document.createElement('div');
        const isMastered = state.masteredTopics.has(t.id);
        const isActive = state.selectedTopic && state.selectedTopic.id === t.id;

        item.className = `topic-item ${isActive ? 'active' : ''} ${isMastered ? 'mastered' : ''}`;
        item.innerHTML = `
          <div style="display:flex; align-items:center;">
            <i class="topic-status-icon ${isMastered ? 'fa-solid fa-circle-check' : 'fa-regular fa-circle'}"></i>
            <span>${t.title}</span>
          </div>
          <span class="topic-badge">${t.tag}</span>
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

  // Select Topic
  function selectTopic(topic, category) {
    state.selectedTopic = topic;
    crumbCategory.textContent = category.category.replace(/^\d+\.\s*/, '');
    crumbTopic.textContent = topic.title;

    if (panelMaxTopicName) {
      panelMaxTopicName.textContent = topic.title;
    }

    updateMasteredButtonState();

    // Pick challenge for current difficulty
    let challenge = null;
    if (topic.challenges) {
      challenge = topic.challenges[state.selectedDifficulty] || topic.challenges.Basic;
    } else {
      challenge = topic.starterChallenge;
    }

    setProblem(challenge);
  }

  // Strip markdown code block wrappers
  function cleanCodeSnippet(code) {
    if (!code) return '';
    let cleaned = code.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '');
    }
    return cleaned;
  }

  // Update Problem View
  function setProblem(challenge) {
    state.currentQuestion = challenge;
    problemTitle.textContent = challenge.title;
    
    // Set difficulty badge and sync active diff-chip
    const diff = challenge.difficulty || state.selectedDifficulty;
    state.selectedDifficulty = diff;
    problemDifficulty.textContent = diff;
    problemDifficulty.className = 'badge diff-badge ' + diff;

    diffChips.forEach(chip => {
      if (chip.dataset.diff === diff) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });

    problemConcept.textContent = challenge.concept || (state.selectedTopic ? state.selectedTopic.tag : 'Deep Concept');

    // Render markdown description
    problemDescription.innerHTML = marked.parse(challenge.description || '');

    // Interview trap
    interviewTrapText.textContent = challenge.interviewTrap || state.selectedTopic?.traps || 'Understanding engine execution lifecycle without guessing.';
    interviewTrapBox.style.display = 'none';
    toggleTrapBtn.innerHTML = '<i class="fa-solid fa-eye"></i> The Trap';

    // Populate Code Editor
    const rawStarter = cleanCodeSnippet(challenge.starterCode);
    const solutionCode = cleanCodeSnippet(challenge.solutionCode);
    let savedCode = state.userCodeHistory[challenge.title];

    // If the saved code is identical to the solution, discard it so user gets the blank starter template to solve
    if (savedCode && solutionCode && savedCode.trim() === solutionCode.trim()) {
      delete state.userCodeHistory[challenge.title];
      localStorage.setItem(storageHistoryKey, JSON.stringify(state.userCodeHistory));
      savedCode = null;
    }

    const codeToSet = savedCode || rawStarter || '// Write solution here\n';
    setCode(codeToSet);

    // Render Test Cases
    renderTestCases(challenge.testCases || []);

    // Check local JSON storage for saved knowledge guide
    checkAndLoadSavedGuide(challenge);
  }

  // HTML escaping utility
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Deep Equality Comparison
  function deepEqual(a, b) {
    if (a === b) return true;
    if (typeof a === 'number' && typeof b === 'number' && Number.isNaN(a) && Number.isNaN(b)) return true;
    if (a == null || b == null) return false;
    if (typeof a !== typeof b) return false;
    if (typeof a !== 'object') return false;
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    if (Array.isArray(a)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!deepEqual(a[i], b[i])) return false;
      }
      return true;
    }
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const k of keysA) {
      if (!Object.prototype.hasOwnProperty.call(b, k) || !deepEqual(a[k], b[k])) return false;
    }
    return true;
  }

  // Render Test Cases List
  function renderTestCases(testCases = [], results = null) {
    testCasesList.innerHTML = '';
    if (!testCases || testCases.length === 0) {
      testCasesList.innerHTML = '<div style="color:var(--text-muted); padding:10px; font-size:13px;">No automated test cases defined for this problem.</div>';
      testSummaryBadge.textContent = 'None';
      testSummaryBadge.className = 'test-summary-badge';
      return;
    }

    if (!results) {
      // Ready / Idle state
      testSummaryBadge.textContent = `${testCases.length} Tests Ready`;
      testSummaryBadge.className = 'test-summary-badge';
      testBanner.className = 'test-banner idle';
      testBanner.innerHTML = `
        <span class="test-banner-icon"><i class="fa-solid fa-circle-play"></i></span>
        <span class="test-banner-text">Click <strong>Run Tests</strong> (or press <kbd>Ctrl</kbd> + <kbd>Enter</kbd>) to verify your solution against ${testCases.length} test cases.</span>
      `;
    }

    testCases.forEach((tc, idx) => {
      const res = results ? results[idx] : null;
      const card = document.createElement('div');

      let statusClass = 'pending';
      let iconHtml = '<i class="fa-regular fa-circle test-icon pending"></i>';
      let statusPill = '<span class="test-status-pill pending">Pending</span>';

      if (res) {
        if (res.pass) {
          statusClass = 'passed';
          iconHtml = '<i class="fa-solid fa-circle-check test-icon passed"></i>';
          statusPill = '<span class="test-status-pill passed">PASS</span>';
        } else {
          statusClass = 'failed';
          iconHtml = '<i class="fa-solid fa-circle-xmark test-icon failed"></i>';
          statusPill = '<span class="test-status-pill failed">FAIL</span>';
        }
      }

      card.className = `test-case-card ${statusClass}`;
      card.innerHTML = `
        <div class="test-card-header">
          <div class="test-title-wrap">
            ${iconHtml}
            <span>Test Case ${tc.id || idx + 1}: ${escapeHtml(tc.name)}</span>
          </div>
          <div class="test-meta">
            ${res ? `<span class="test-duration">${res.duration} ms</span>` : ''}
            ${statusPill}
          </div>
        </div>
        <div class="test-card-body">
          <div class="test-row">
            <span class="test-label">Input:</span>
            <span class="test-val">${escapeHtml(typeof tc.input === 'object' ? JSON.stringify(tc.input) : String(tc.input))}</span>
          </div>
          <div class="test-row">
            <span class="test-label">Expected:</span>
            <span class="test-val">${escapeHtml(typeof tc.expected === 'object' ? JSON.stringify(tc.expected) : String(tc.expected))}</span>
          </div>
          ${res ? `
          <div class="test-row">
            <span class="test-label">Received:</span>
            <span class="test-val ${res.pass ? 'match' : 'mismatch'}">${escapeHtml(typeof res.received === 'object' ? JSON.stringify(res.received) : String(res.received))}</span>
          </div>
          ` : ''}
        </div>
      `;
      testCasesList.appendChild(card);
    });
  }

  // Switch Results Panel Tabs (Test Cases vs Console)
  function switchResultsTab(tabName) {
    if (tabName === 'testcases') {
      tabTestCasesBtn.classList.add('active');
      tabConsoleBtn.classList.remove('active');
      testCasesPane.style.display = 'flex';
      consolePane.style.display = 'none';
    } else {
      tabConsoleBtn.classList.add('active');
      tabTestCasesBtn.classList.remove('active');
      consolePane.style.display = 'flex';
      testCasesPane.style.display = 'none';
    }
  }

  // Code Editor Management (Monaco + Textarea Fallback)
  function setupEditor() {
    initMonaco();

    // Fallback textarea event listeners
    if (codeEditor) {
      codeEditor.addEventListener('input', () => {
        updateLineNumbers();
        if (state.currentQuestion) {
          state.userCodeHistory[state.currentQuestion.title] = codeEditor.value;
          localStorage.setItem(storageHistoryKey, JSON.stringify(state.userCodeHistory));
        }
      });

      codeEditor.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          e.preventDefault();
          const start = codeEditor.selectionStart;
          const end = codeEditor.selectionEnd;
          codeEditor.value = codeEditor.value.substring(0, start) + '  ' + codeEditor.value.substring(end);
          codeEditor.selectionStart = codeEditor.selectionEnd = start + 2;
          updateLineNumbers();
        }

        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          runCode();
        }
      });
    }
  }

  // Initialize VS Code Monaco Editor
  function initMonaco() {
    if (window.monaco && monaco.editor) {
      createMonacoInstance();
      return;
    }

    if (typeof require !== 'undefined' && require.config) {
      try {
        require.config({
          paths: {
            vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs'
          }
        });

        require(['vs/editor/editor.main'], function () {
          createMonacoInstance();
        });
      } catch (e) {
        console.warn('Monaco loader notice:', e);
        showTextareaFallback();
      }
    } else {
      showTextareaFallback();
    }
  }

  function createMonacoInstance() {
    if (!monacoEditorContainer || monacoEditor) return;

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';

    try {
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: false
      });

      monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2022,
        allowNonTextExtensions: true,
        allowJs: true,
        jsx: monaco.languages.typescript.JsxEmit.React
      });

      const initialValue = codeEditor ? codeEditor.value : '// Write solution here\n';

      monacoEditor = monaco.editor.create(monacoEditorContainer, {
        value: initialValue,
        language: 'javascript',
        theme: isLight ? 'vs' : 'vs-dark',
        fontSize: 14,
        fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, 'Courier New', monospace",
        fontLigatures: true,
        automaticLayout: true,
        lineNumbers: 'on',
        tabSize: 2,
        insertSpaces: true,
        bracketPairColorization: {
          enabled: true
        },
        autoClosingBrackets: 'always',
        autoClosingQuotes: 'always',
        autoClosingDelete: 'always',
        autoClosingOvertype: 'always',
        quickSuggestions: {
          other: true,
          comments: false,
          strings: true
        },
        suggestOnTriggerCharacters: true,
        wordBasedSuggestions: "allDocuments",
        formatOnPaste: true,
        formatOnType: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        padding: { top: 12, bottom: 12 }
      });

      // Hide textarea and line numbers once Monaco is live
      if (codeEditor) codeEditor.style.display = 'none';
      if (lineNumbers) lineNumbers.style.display = 'none';

      monacoEditor.onDidChangeModelContent(() => {
        const val = monacoEditor.getValue();
        if (state.currentQuestion) {
          state.userCodeHistory[state.currentQuestion.title] = val;
          localStorage.setItem(storageHistoryKey, JSON.stringify(state.userCodeHistory));
        }
      });

      monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
        runCode();
      });
    } catch (err) {
      console.warn('Monaco initialization failed, using textarea:', err);
      showTextareaFallback();
    }
  }

  function showTextareaFallback() {
    if (codeEditor) codeEditor.style.display = 'block';
    if (lineNumbers) lineNumbers.style.display = 'block';
  }

  function getCode() {
    return monacoEditor ? monacoEditor.getValue() : (codeEditor ? codeEditor.value : '');
  }

  function setCode(code) {
    if (monacoEditor) {
      monacoEditor.setValue(code);
    }
    if (codeEditor) {
      codeEditor.value = code;
      updateLineNumbers();
    }
  }

  function updateLineNumbers() {
    if (!lineNumbers || !codeEditor) return;
    const lines = codeEditor.value.split('\n').length;
    let numbers = '';
    for (let i = 1; i <= Math.max(lines, 1); i++) {
      numbers += i + '\n';
    }
    lineNumbers.textContent = numbers;
  }

  // Execute Code and Run Test Cases in Browser Sandbox
  async function runCode() {
    const code = getCode();
    consoleOutput.innerHTML = '';
    const logs = [];
    const startTime = performance.now();

    // Capture console methods
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    function formatArg(arg) {
      if (arg === null) return 'null';
      if (arg === undefined) return 'undefined';
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return Object.prototype.toString.call(arg);
        }
      }
      return String(arg);
    }

    function appendLog(type, args) {
      const text = args.map(formatArg).join(' ');
      logs.push(`[${type.toUpperCase()}] ${text}`);
      const line = document.createElement('div');
      line.className = `log-line ${type}`;
      line.textContent = `> ${text}`;
      consoleOutput.appendChild(line);
      consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }

    console.log = (...args) => { appendLog('log', args); originalLog.apply(console, args); };
    console.warn = (...args) => { appendLog('warn', args); originalWarn.apply(console, args); };
    console.error = (...args) => { appendLog('error', args); originalError.apply(console, args); };

    // Auto-switch to test cases tab
    switchResultsTab('testcases');

    const testCases = state.currentQuestion?.testCases || [];
    const results = [];
    let passedCount = 0;

    try {
      // Support React JSX compilation if Babel is available
      let executableCode = code;
      if (window.Babel && /<[a-zA-Z0-9_\s="'{}/]+>/.test(code)) {
        try {
          executableCode = Babel.transform(code, { presets: ['react'] }).code;
        } catch (babelErr) {
          appendLog('error', ['[JSX Transpile Error]: ' + babelErr.message]);
          testBanner.className = 'test-banner failure';
          testBanner.innerHTML = `<span class="test-banner-icon"><i class="fa-solid fa-triangle-exclamation"></i></span><span class="test-banner-text">JSX Transpilation Error: ${escapeHtml(babelErr.message)}</span>`;
          return;
        }
      }

      // Execute each test case
      for (const tc of testCases) {
        const tcStart = performance.now();
        try {
          const runner = new Function('deepEqual', `
            return (async () => {
              ${executableCode}
              ;
              ${tc.testFn}
            })();
          `);

          const out = await runner(deepEqual);
          const dur = Math.round((performance.now() - tcStart) * 10) / 10;

          if (out && typeof out === 'object' && typeof out.pass === 'boolean') {
            if (out.pass) passedCount++;
            results.push({
              pass: out.pass,
              received: 'received' in out ? out.received : out,
              expected: 'expected' in out ? out.expected : tc.expected,
              duration: dur
            });
          } else {
            const pass = deepEqual(out, tc.expected);
            if (pass) passedCount++;
            results.push({
              pass,
              received: out,
              expected: tc.expected,
              duration: dur
            });
          }
        } catch (err) {
          const dur = Math.round((performance.now() - tcStart) * 10) / 10;
          results.push({
            pass: false,
            received: `${err.name}: ${err.message}`,
            expected: tc.expected,
            duration: dur
          });
        }
      }

      // If no test cases are defined, execute raw code in sandbox
      if (testCases.length === 0) {
        const wrapped = `(async function() {\n${executableCode}\n})();`;
        const result = await eval(wrapped);
        if (result !== undefined) {
          appendLog('log', ['[Return Value]:', result]);
        }
      }
    } finally {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;

      const duration = (performance.now() - startTime).toFixed(1);
      execTime.textContent = `${duration} ms`;

      if (logs.length === 0) {
        consoleOutput.innerHTML = `<div class="console-placeholder">// Code executed cleanly without console logs (${duration} ms)</div>`;
      }
      state.lastConsoleOutput = logs.join('\n');

      // Update Test Cases UI
      if (testCases.length > 0) {
        renderTestCases(testCases, results);
        testSummaryBadge.textContent = `${passedCount} / ${testCases.length} Passed`;
        
        if (passedCount === testCases.length) {
          testSummaryBadge.className = 'test-summary-badge all-passed';
          testBanner.className = 'test-banner success';
          testBanner.innerHTML = `
            <span class="test-banner-icon"><i class="fa-solid fa-circle-check"></i></span>
            <span class="test-banner-text">🎉 All ${testCases.length} test cases passed! Great job mastering this concept!</span>
          `;
          // Mark topic mastered
          if (state.selectedTopic) {
            state.masteredTopics.add(state.selectedTopic.id);
            localStorage.setItem(storageMasteredKey, JSON.stringify([...state.masteredTopics]));
            updateMasteryProgress();
            updateMasteredButtonState();
          }
        } else {
          testSummaryBadge.className = 'test-summary-badge has-failed';
          testBanner.className = 'test-banner failure';
          testBanner.innerHTML = `
            <span class="test-banner-icon"><i class="fa-solid fa-circle-xmark"></i></span>
            <span class="test-banner-text">❌ ${testCases.length - passedCount} of ${testCases.length} test cases failed. Review details above.</span>
          `;
        }
      }
    }
  }

  // Sanitize Markdown
  function sanitizeMarkdown(text) {
    if (!text) return '';
    let str = text.trim();
    if (/^```(?:markdown)?/i.test(str)) {
      str = str.replace(/^```(?:markdown)?\s*\n?/i, '').replace(/\n?\s*```$/, '');
    }
    return str.trim();
  }

  // Render High-End Executive Preview with Section Cards and QuickNav
  function renderProperPreview(rawMarkdown) {
    const cleaned = sanitizeMarkdown(rawMarkdown);
    if (!cleaned) return '';

    const sectionRegex = /^##\s+(.+)$/gm;
    const matches = [...cleaned.matchAll(sectionRegex)];

    if (matches.length >= 2) {
      const sections = [];
      let lastIndex = 0;
      let lastTitle = '';

      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        if (i > 0) {
          const content = cleaned.slice(lastIndex, match.index).trim();
          sections.push({ title: lastTitle, content });
        } else {
          const preamble = cleaned.slice(0, match.index).trim();
          if (preamble && !preamble.startsWith('# Masterclass')) {
            sections.push({ title: '📋 Overview', content: preamble });
          }
        }
        lastTitle = match[1].trim();
        lastIndex = match.index + match[0].length;
      }
      sections.push({ title: lastTitle, content: cleaned.slice(lastIndex).trim() });

      let quickNav = '<div class="guide-quicknav">';
      sections.forEach((sec, idx) => {
        const iconMatch = sec.title.match(/[\u{1F300}-\u{1FAFF}]/u);
        const icon = iconMatch ? iconMatch[0] : '📌';
        const label = sec.title.replace(/[\u{1F300}-\u{1FAFF}]/u, '').trim().slice(0, 18);
        quickNav += `<a href="#guide-sec-${idx}" class="quicknav-pill">${icon} ${label}</a>`;
      });
      quickNav += '</div>';

      let cardsHtml = '<div class="masterclass-guide">' + quickNav;
      sections.forEach((sec, idx) => {
        const parsedBody = marked.parse(sec.content);
        cardsHtml += `
          <div class="guide-card" id="guide-sec-${idx}">
            <div class="guide-card-header">
              <span class="guide-card-title">${sec.title}</span>
            </div>
            <div class="guide-card-body">${parsedBody}</div>
          </div>
        `;
      });
      cardsHtml += '</div>';

      return cardsHtml;
    }

    return `<div class="guide-card"><div class="guide-card-body">${marked.parse(cleaned)}</div></div>`;
  }

  // Panel Tab Switching (Knowledge Guide vs Saved DB Guides)
  function switchPanelTab(tabName) {
    if (tabName === 'saved') {
      if (tabSavedGuidesBtn) tabSavedGuidesBtn.classList.add('active');
      if (tabKnowledgeBtn) tabKnowledgeBtn.classList.remove('active');
      if (savedGuidesPane) {
        savedGuidesPane.classList.add('active');
        savedGuidesPane.style.display = 'block';
      }
      if (knowledgePane) {
        knowledgePane.classList.remove('active');
        knowledgePane.style.display = 'none';
      }
      loadSavedGuidesList(savedGuidesSearch ? savedGuidesSearch.value : '');
    } else {
      if (tabKnowledgeBtn) tabKnowledgeBtn.classList.add('active');
      if (tabSavedGuidesBtn) tabSavedGuidesBtn.classList.remove('active');
      if (knowledgePane) {
        knowledgePane.classList.add('active');
        knowledgePane.style.display = 'block';
      }
      if (savedGuidesPane) savedGuidesPane.style.display = 'none';
    }
  }

  // Panel Maximize / Minimize Controls
  function maximizePanel() {
    if (!evaluationPanel) return;
    evaluationPanel.classList.add('maximized');
    document.body.classList.add('panel-is-maximized');

    if (toggleMaximizeBtn) {
      toggleMaximizeBtn.classList.add('active');
      toggleMaximizeBtn.title = 'Minimize / Restore to Side Panel (Esc)';
      const icon = toggleMaximizeBtn.querySelector('i');
      if (icon) icon.className = 'fa-solid fa-compress';
      const text = toggleMaximizeBtn.querySelector('.maximize-btn-text');
      if (text) text.textContent = 'Minimize';
    }

    if (panelMaxTopicBadge) {
      panelMaxTopicBadge.style.display = 'inline-flex';
      if (panelMaxTopicName && state.selectedTopic) {
        panelMaxTopicName.textContent = state.selectedTopic.title;
      }
    }

    if (floatingMinimizeBtn) {
      floatingMinimizeBtn.style.display = 'inline-flex';
    }

    const inlineMaxBtn = document.getElementById('btnGuideMaximizeInline');
    if (inlineMaxBtn) {
      inlineMaxBtn.innerHTML = '<i class="fa-solid fa-compress"></i> Minimize';
      inlineMaxBtn.title = 'Minimize / Restore to Side Panel (Esc)';
    }
  }

  function minimizePanel() {
    if (!evaluationPanel) return;
    evaluationPanel.classList.remove('maximized');
    document.body.classList.remove('panel-is-maximized');

    if (toggleMaximizeBtn) {
      toggleMaximizeBtn.classList.remove('active');
      toggleMaximizeBtn.title = 'Maximize Knowledge Window';
      const icon = toggleMaximizeBtn.querySelector('i');
      if (icon) icon.className = 'fa-solid fa-expand';
      const text = toggleMaximizeBtn.querySelector('.maximize-btn-text');
      if (text) text.textContent = 'Maximize';
    }

    if (panelMaxTopicBadge) {
      panelMaxTopicBadge.style.display = 'none';
    }

    if (floatingMinimizeBtn) {
      floatingMinimizeBtn.style.display = 'none';
    }

    const inlineMaxBtn = document.getElementById('btnGuideMaximizeInline');
    if (inlineMaxBtn) {
      inlineMaxBtn.innerHTML = '<i class="fa-solid fa-expand"></i> Maximize';
      inlineMaxBtn.title = 'Maximize Knowledge Window';
    }

    if (monacoEditor) {
      setTimeout(() => {
        monacoEditor.layout();
      }, 60);
    }
  }

  function toggleMaximize() {
    if (evaluationPanel && evaluationPanel.classList.contains('maximized')) {
      minimizePanel();
    } else {
      maximizePanel();
    }
  }

  // Open Knowledge Section in Maximized Window
  function openKnowledgeSection(forceRegenerate = false) {
    switchPanelTab('knowledge');
    maximizePanel();

    const hasLoadedGuide = knowledgeContent && 
      knowledgeContent.style.display !== 'none' && 
      knowledgeContent.innerHTML.trim().length > 0 && 
      !knowledgeContent.querySelector('.empty-eval-state') &&
      !knowledgeContent.querySelector('.loading-knowledge');

    if (forceRegenerate || !hasLoadedGuide) {
      generateTopicKnowledge();
    }
  }

  // -------------------------------------------------------------
  // Storage Management (Strictly Local JSON File - knowledge.json)
  // -------------------------------------------------------------

  async function initStorageMode() {
    state.storageMode = 'json';
    updateStorageUI();
  }

  function updateStorageUI() {
    if (btnStorageJson) {
      btnStorageJson.classList.add('active');
    }
    if (panelStorageJsonBtn) {
      panelStorageJsonBtn.classList.add('active');
    }
    if (tabSavedLabel) {
      tabSavedLabel.textContent = 'Saved JSON';
    }
    if (tabSavedIcon) {
      tabSavedIcon.className = 'fa-solid fa-file-code';
    }
  }

  async function handleStorageSwitch(targetMode) {
    state.storageMode = 'json';
    updateStorageUI();
    await updateSavedGuidesCount();

    if (savedGuidesPane && savedGuidesPane.classList.contains('active')) {
      loadSavedGuidesList(savedGuidesSearch ? savedGuidesSearch.value : '');
    }

    if (state.currentQuestion) {
      checkAndLoadSavedGuide(state.currentQuestion);
    }
  }

  // Display a Knowledge Guide
  function displaySavedGuide(guide, isFromAutoLoad = false) {
    if (!guide || !guide.guide_content) return;

    emptyKnowledgeState.style.display = 'none';
    knowledgeContent.style.display = 'block';

    const isCurrentlyMax = evaluationPanel && evaluationPanel.classList.contains('maximized');
    const maxBtnInGuide = `<button class="btn-xs" id="btnGuideMaximizeInline" title="${isCurrentlyMax ? 'Minimize / Restore to Side Panel (Esc)' : 'Maximize Knowledge Window'}" style="margin-left: auto;">
      <i class="fa-solid ${isCurrentlyMax ? 'fa-compress' : 'fa-expand'}"></i> ${isCurrentlyMax ? 'Minimize' : 'Maximize'}
    </button>`;

    const sourcesBadge = guide.search_results_count > 0
      ? `<div style="display:inline-flex; align-items:center; gap:6px; background:rgba(2,132,199,0.12); color:#38bdf8; border:1px solid rgba(2,132,199,0.3); border-radius:4px; padding:3px 8px; font-size:11px; margin-right:8px; margin-bottom:12px;">
          <i class="fa-solid fa-globe"></i> Grounded with ${guide.search_results_count} Live Specs
         </div>`
      : '';

    const storageBadge = `<div class="storage-target-badge json">
      <i class="fa-solid fa-file-code"></i> Saved in Local JSON (knowledge.json #${guide.id || 'Saved'})
    </div>`;

    const banner = isFromAutoLoad
      ? `<div class="db-loaded-banner">
          <div class="db-banner-left">
            <i class="fa-solid fa-file-code" style="color:#38bdf8;"></i>
            <span><strong>Loaded from Local JSON (knowledge.json)</strong> (Saved: ${guide.created_at || 'Saved'})</span>
          </div>
          <button class="btn-xs" id="btnRegenSaved" title="Re-read authoritative guide">
            <i class="fa-solid fa-arrows-rotate"></i> Refresh
          </button>
        </div>`
      : '';

    const previewHtml = renderProperPreview(guide.guide_content || '');
    knowledgeContent.innerHTML = `${banner}<div style="display:flex; flex-wrap:wrap; align-items:center; gap:8px;">${sourcesBadge}${storageBadge}${maxBtnInGuide}</div>${previewHtml}`;
    Prism.highlightAllUnder(knowledgeContent);

    const regenBtn = knowledgeContent.querySelector('#btnRegenSaved');
    if (regenBtn) {
      regenBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        generateTopicKnowledge();
      });
    }

    const inlineMaxBtn = knowledgeContent.querySelector('#btnGuideMaximizeInline');
    if (inlineMaxBtn) {
      inlineMaxBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMaximize();
      });
    }
  }

  // Check storage if a guide was previously saved
  async function checkAndLoadSavedGuide(challenge) {
    if (!state.selectedTopic) return;

    try {
      const topicTitle = state.selectedTopic.title;
      const questionTitle = challenge.title;
      const url = `/api/knowledge-guide?track=${currentTrack}&topicTitle=${encodeURIComponent(topicTitle)}&questionTitle=${encodeURIComponent(questionTitle)}&storageMode=${state.storageMode}`;
      
      const res = await fetch(url);
      const data = await res.json();

      if (data.success && data.guide) {
        displaySavedGuide({
          ...data.guide,
          storageMode: data.storageMode || state.storageMode
        }, true);
      } else {
        emptyKnowledgeState.style.display = 'flex';
        knowledgeContent.style.display = 'none';
        knowledgeContent.innerHTML = '';
      }
    } catch (err) {
      console.warn('Could not auto-load saved guide:', err);
    }
  }

  // Generate In-Depth Topic Knowledge with Web Search
  async function generateTopicKnowledge() {
    if (!state.selectedTopic) return;

    switchPanelTab('knowledge');
    maximizePanel();

    const btn = explainTopicBtn;
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Loading...`;

    emptyKnowledgeState.style.display = 'none';
    knowledgeContent.style.display = 'block';

    knowledgeContent.innerHTML = `
      <div class="loading-knowledge">
        <i class="fa-solid fa-book-open fa-bounce"></i>
        <h3>Loading Verified Knowledge Guide</h3>
        <p>Grounding with internal engine architecture and verified specs...</p>
      </div>
    `;

    try {
      const res = await fetch('/api/explain-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          track: currentTrack,
          topicTitle: state.selectedTopic.title,
          questionTitle: state.currentQuestion ? state.currentQuestion.title : state.selectedTopic.title,
          concept: state.currentQuestion ? state.currentQuestion.concept : state.selectedTopic.tag,
          problemDescription: state.currentQuestion ? state.currentQuestion.description : state.selectedTopic.summary,
          storageMode: state.storageMode
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to explain topic');
      }

      displaySavedGuide({
        id: data.guideId || data.savedGuide?.id,
        created_at: 'Just now',
        search_results_count: data.searchResultsCount || 0,
        guide_content: data.explanation,
        storageMode: data.storageMode || state.storageMode
      }, false);

      updateSavedGuidesCount();
    } catch (err) {
      knowledgeContent.innerHTML = `
        <div class="empty-eval-state">
          <i class="fa-solid fa-triangle-exclamation" style="color:var(--accent-danger);"></i>
          <h3>Generation Failed</h3>
          <p>${err.message}</p>
        </div>
      `;
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalText;
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
      // Non-critical
    }
  }

  // Load Saved Knowledge Guides List from local JSON storage
  async function loadSavedGuidesList(searchTerm = '') {
    if (!savedGuidesList) return;

    savedGuidesList.innerHTML = `
      <div style="text-align:center; padding:24px; color:var(--text-muted);">
        <i class="fa-solid fa-circle-notch fa-spin"></i> Loading ${state.storageMode === 'json' ? 'JSON' : 'SQL'} guides...
      </div>
    `;

    try {
      const params = new URLSearchParams({ track: currentTrack, limit: '100' });
      if (searchTerm) params.append('search', searchTerm);

      const res = await fetch(`/api/knowledge-guides?${params.toString()}`);
      const data = await res.json();

      if (!data.success || !data.guides || data.guides.length === 0) {
        savedGuidesList.innerHTML = `
          <div class="empty-eval-state" style="padding:40px 20px;">
            <i class="fa-solid fa-file-code" style="font-size:32px; color:var(--text-muted); margin-bottom:12px;"></i>
            <h3>No Saved Knowledge Guides in Local JSON</h3>
            <p>Click "Deep Knowledge Guide" on any topic to view and save guides to knowledge.json.</p>
          </div>
        `;
        return;
      }

      savedGuidesList.innerHTML = '';
      data.guides.forEach(g => {
        const item = document.createElement('div');
        item.className = 'saved-guide-item';
        const dateStr = g.created_at ? g.created_at.slice(0, 16) : '';
        const searchBadge = g.search_results_count > 0 
          ? `<span class="badge" style="background:rgba(2,132,199,0.15); color:#38bdf8; font-size:10px;"><i class="fa-solid fa-globe"></i> ${g.search_results_count} Specs</span>` 
          : '';
        const storageTypeBadge = `<span class="badge" style="background:rgba(14,165,233,0.15); color:#38bdf8; font-size:10px;">
          <i class="fa-solid fa-file-code"></i> JSON #${g.id}
        </span>`;

        item.innerHTML = `
          <div class="saved-guide-item-header">
            <div>
              <span class="saved-guide-topic">${escapeHtml(g.topic_title)}</span>
              <div class="saved-guide-question">${escapeHtml(g.question_title)}</div>
            </div>
            <div style="display:flex; flex-direction:column; align-items:flex-end; gap:4px;">
              <span class="saved-guide-date">${dateStr}</span>
              <div style="display:flex; gap:4px; align-items:center;">
                ${storageTypeBadge}
                ${searchBadge}
              </div>
            </div>
          </div>
          <div class="saved-guide-preview">${escapeHtml(g.preview || '')}...</div>
          <div class="saved-guide-actions">
            <button class="btn-xs primary load-guide-btn" data-id="${g.id}">
              <i class="fa-solid fa-book-open"></i> View Guide
            </button>
            <button class="btn-xs danger delete-guide-btn" data-id="${g.id}">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        `;

        item.querySelector('.load-guide-btn').addEventListener('click', async () => {
          await loadFullGuideById(g.id);
        });

        item.querySelector('.delete-guide-btn').addEventListener('click', async (e) => {
          e.stopPropagation();
          if (confirm(`Delete saved knowledge guide #${g.id} from local JSON file?`)) {
            await deleteGuideById(g.id);
          }
        });

        savedGuidesList.appendChild(item);
      });
    } catch (err) {
      savedGuidesList.innerHTML = `<div class="empty-eval-state"><p style="color:var(--accent-danger);">Failed to load: ${err.message}</p></div>`;
    }
  }

  // Load a single full guide from storage by ID and show it in the Knowledge Guide tab
  async function loadFullGuideById(id) {
    try {
      const res = await fetch(`/api/knowledge-guide/${id}?storageMode=${state.storageMode}`);
      const data = await res.json();
      if (data.success && data.guide) {
        switchPanelTab('knowledge');
        displaySavedGuide({
          ...data.guide,
          storageMode: data.storageMode || state.storageMode
        }, true);
        maximizePanel();
      }
    } catch (err) {
      alert('Could not load guide: ' + err.message);
    }
  }

  // Delete a guide by ID
  async function deleteGuideById(id) {
    try {
      const res = await fetch(`/api/knowledge-guide/${id}?storageMode=${state.storageMode}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadSavedGuidesList(savedGuidesSearch ? savedGuidesSearch.value : '');
        updateSavedGuidesCount();
      }
    } catch (err) {
      alert('Could not delete guide: ' + err.message);
    }
  }

  // Toggle Mastery State
  function toggleMastery() {
    if (!state.selectedTopic) return;
    const id = state.selectedTopic.id;
    if (state.masteredTopics.has(id)) {
      state.masteredTopics.delete(id);
    } else {
      state.masteredTopics.add(id);
    }

    localStorage.setItem(storageMasteredKey, JSON.stringify([...state.masteredTopics]));
    updateMasteryProgress();
    updateMasteredButtonState();
    renderTopicsTree(state.categories);
  }

  function updateMasteredButtonState() {
    if (!state.selectedTopic) return;
    const isMastered = state.masteredTopics.has(state.selectedTopic.id);
    if (isMastered) {
      markMasteredBtn.classList.add('mastered');
      markMasteredBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Mastered';
    } else {
      markMasteredBtn.classList.remove('mastered');
      markMasteredBtn.innerHTML = '<i class="fa-regular fa-circle-check"></i> Mark Mastered';
    }
  }

  function updateMasteryProgress() {
    let totalTopics = 0;
    state.categories.forEach(c => totalTopics += c.topics.length);
    if (totalTopics === 0) return;

    const count = state.masteredTopics.size;
    const percent = Math.round((count / totalTopics) * 100);
    masteryPercentEl.textContent = `${percent}% (${count}/${totalTopics})`;
    progressBarFill.style.width = `${percent}%`;
  }

  // Export Progress JSON
  function exportProgress() {
    const report = {
      track: currentTrack,
      timestamp: new Date().toISOString(),
      masteredTopics: [...state.masteredTopics],
      codeHistory: state.userCodeHistory
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTrack}-depth-mastery-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Setup Event Listeners
  function setupEventListeners() {
    // Track pills (JS Problems vs React Problems)
    const btnJs = document.getElementById('btnTrackJs');
    const btnReact = document.getElementById('btnTrackReact');
    if (btnJs) btnJs.addEventListener('click', () => switchTrack('javascript'));
    if (btnReact) btnReact.addEventListener('click', () => switchTrack('react'));

    // Search
    topicSearch.addEventListener('input', (e) => {
      renderTopicsTree(state.categories, e.target.value);
    });

    // Difficulty switcher (Basic, Medium, Hard)
    diffChips.forEach(chip => {
      chip.addEventListener('click', () => {
        diffChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.selectedDifficulty = chip.dataset.diff;

        if (state.selectedTopic && state.selectedTopic.challenges) {
          const target = state.selectedTopic.challenges[state.selectedDifficulty] || state.selectedTopic.challenges.Basic;
          if (target) {
            setProblem(target);
          }
        }
      });
    });

    // Results Tabs (Test Cases vs Console)
    if (tabTestCasesBtn) {
      tabTestCasesBtn.addEventListener('click', () => switchResultsTab('testcases'));
    }
    if (tabConsoleBtn) {
      tabConsoleBtn.addEventListener('click', () => switchResultsTab('console'));
    }

    // Knowledge Guide
    if (explainTopicBtn) {
      explainTopicBtn.addEventListener('click', () => {
        openKnowledgeSection(false);
      });
    }

    // Maximize / Minimize Window Controls
    if (toggleMaximizeBtn) {
      toggleMaximizeBtn.addEventListener('click', toggleMaximize);
    }

    if (floatingMinimizeBtn) {
      floatingMinimizeBtn.addEventListener('click', minimizePanel);
    }

    if (emptyStateGenerateBtn) {
      emptyStateGenerateBtn.addEventListener('click', () => {
        openKnowledgeSection(true);
      });
    }

    if (emptyStateMaximizeBtn) {
      emptyStateMaximizeBtn.addEventListener('click', () => {
        maximizePanel();
      });
    }

    // Keyboard shortcut: Esc to minimize window
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (evaluationPanel && evaluationPanel.classList.contains('maximized')) {
          minimizePanel();
        }
      }
    });

    // Storage Controls (Local JSON Storage)
    if (btnStorageJson) {
      btnStorageJson.addEventListener('click', () => handleStorageSwitch('json'));
    }
    if (panelStorageJsonBtn) {
      panelStorageJsonBtn.addEventListener('click', () => handleStorageSwitch('json'));
    }

    // Right Panel Tabs
    if (tabKnowledgeBtn) {
      tabKnowledgeBtn.addEventListener('click', () => switchPanelTab('knowledge'));
    }
    if (tabSavedGuidesBtn) {
      tabSavedGuidesBtn.addEventListener('click', () => switchPanelTab('saved'));
    }

    // Saved Guides Actions
    if (refreshSavedGuidesBtn) {
      refreshSavedGuidesBtn.addEventListener('click', () => {
        loadSavedGuidesList(savedGuidesSearch ? savedGuidesSearch.value : '');
        updateSavedGuidesCount();
      });
    }

    if (savedGuidesSearch) {
      let debounceTimer = null;
      savedGuidesSearch.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          loadSavedGuidesList(e.target.value);
        }, 250);
      });
    }

    // Toggle Interview Trap
    toggleTrapBtn.addEventListener('click', () => {
      const isVisible = interviewTrapBox.style.display !== 'none';
      interviewTrapBox.style.display = isVisible ? 'none' : 'block';
      toggleTrapBtn.innerHTML = isVisible 
        ? '<i class="fa-solid fa-eye"></i> The Trap' 
        : '<i class="fa-solid fa-eye-slash"></i> Hide Trap';
    });

    // Editor Actions
    resetCodeBtn.addEventListener('click', () => {
      if (confirm('Reset editor to initial template? Any unsaved edits will be lost.')) {
        if (state.currentQuestion) {
          delete state.userCodeHistory[state.currentQuestion.title];
          localStorage.setItem(storageHistoryKey, JSON.stringify(state.userCodeHistory));
          setCode(cleanCodeSnippet(state.currentQuestion.starterCode) || '');
        }
      }
    });

    // Reference Solution Modal wiring
    const solutionCodeBtn = document.getElementById('solutionCodeBtn');
    const solutionModal = document.getElementById('solutionModal');
    const closeSolutionModalBtn = document.getElementById('closeSolutionModalBtn');
    const solutionCodeDisplay = document.getElementById('solutionCodeDisplay');
    const copySolutionBtn = document.getElementById('copySolutionBtn');
    const loadSolutionBtn = document.getElementById('loadSolutionBtn');

    if (solutionCodeBtn && solutionModal) {
      solutionCodeBtn.addEventListener('click', () => {
        const sol = cleanCodeSnippet(state.currentQuestion?.solutionCode || '// No reference solution available');
        if (solutionCodeDisplay) {
          solutionCodeDisplay.textContent = sol;
          if (window.Prism) {
            Prism.highlightElement(solutionCodeDisplay);
          }
        }
        solutionModal.style.display = 'flex';
      });

      closeSolutionModalBtn?.addEventListener('click', () => {
        solutionModal.style.display = 'none';
      });

      solutionModal.addEventListener('click', (e) => {
        if (e.target === solutionModal) {
          solutionModal.style.display = 'none';
        }
      });

      copySolutionBtn?.addEventListener('click', () => {
        const sol = cleanCodeSnippet(state.currentQuestion?.solutionCode || '');
        if (navigator.clipboard) {
          navigator.clipboard.writeText(sol).then(() => {
            copySolutionBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
            setTimeout(() => {
              copySolutionBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy Solution';
            }, 1500);
          });
        }
      });

      loadSolutionBtn?.addEventListener('click', () => {
        if (confirm('Load reference solution into the editor? This will replace your current code.')) {
          const sol = cleanCodeSnippet(state.currentQuestion?.solutionCode || '');
          setCode(sol);
          solutionModal.style.display = 'none';
        }
      });
    }

    formatCodeBtn.addEventListener('click', () => {
      if (monacoEditor) {
        monacoEditor.getAction('editor.action.formatDocument').run();
      } else if (codeEditor) {
        const lines = codeEditor.value.split('\n');
        codeEditor.value = lines.map(l => l.replace(/\s+$/, '')).join('\n');
        updateLineNumbers();
      }
    });

    runCodeBtn.addEventListener('click', runCode);

    clearConsoleBtn.addEventListener('click', () => {
      consoleOutput.innerHTML = '<div class="console-placeholder">// Console cleared</div>';
      execTime.textContent = '0 ms';
    });

    markMasteredBtn.addEventListener('click', toggleMastery);
    exportProgressBtn.addEventListener('click', exportProgress);

    if (resetProgressBtn) {
      resetProgressBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all solved questions and progress back to 0%?')) {
          localStorage.removeItem('jsdepth_mastered_javascript');
          localStorage.removeItem('jsdepth_mastered_react');
          localStorage.removeItem('jsdepth_code_history_javascript');
          localStorage.removeItem('jsdepth_code_history_react');
          state.masteredTopics.clear();
          state.userCodeHistory = {};
          updateMasteryProgress();
          updateMasteredButtonState();
          renderTopicsTree(state.categories);
          if (state.currentQuestion) {
            setCode(cleanCodeSnippet(state.currentQuestion.starterCode) || '');
          }
        }
      });
    }

    // Smooth scroll for QuickNav pills in Knowledge Guide
    document.addEventListener('click', (e) => {
      const pill = e.target.closest('.quicknav-pill');
      if (pill) {
        e.preventDefault();
        const targetId = pill.getAttribute('href')?.replace('#', '');
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  }

  // Start app on DOMContentLoaded or immediately if already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
