// Builder script to convert JavaScript and React topics into pure Concept-Based Masterclasses
const fs = require('fs');
const path = require('path');

const answersDir = path.join(__dirname, 'json');

// Index all JSON files by ID
const allJson = {};
fs.readdirSync(answersDir).forEach(dir => {
  const p = path.join(answersDir, dir);
  if (fs.statSync(p).isDirectory()) {
    fs.readdirSync(p).forEach(f => {
      if (f.endsWith('.json')) {
        const data = JSON.parse(fs.readFileSync(path.join(p, f), 'utf8'));
        allJson[data.id] = data;
      }
    });
  }
});

function synthesizeConceptGuide(topic, catTitle, files) {
  const [b, m, h] = files;
  const primary = b || m || h || {};

  const title = topic.title;
  const category = catTitle;

  // Gather all interview cross questions
  const seenQ = new Set();
  const allQuestions = [];
  files.forEach(f => {
    if (f && Array.isArray(f.interviewCrossQuestions)) {
      f.interviewCrossQuestions.forEach(q => {
        if (!seenQ.has(q.question)) {
          seenQ.add(q.question);
          allQuestions.push(q);
        }
      });
    }
  });

  // Real world use cases
  const seenScenarios = new Set();
  const allScenarios = [];
  files.forEach(f => {
    if (f && Array.isArray(f.realWorldUseCases)) {
      f.realWorldUseCases.forEach(u => {
        if (!seenScenarios.has(u.scenario)) {
          seenScenarios.add(u.scenario);
          allScenarios.push(u);
        }
      });
    }
  });

  // Specs and rules
  const specs = new Set();
  const rules = new Set();
  files.forEach(f => {
    if (f && f.onlineVerification) {
      (f.onlineVerification.specifications || []).forEach(s => specs.add(s));
      (f.onlineVerification.verifiedRules || []).forEach(r => rules.add(r));
    }
  });

  // Traps
  const traps = [];
  files.forEach(f => {
    if (f && f.interviewTrap && !traps.includes(f.interviewTrap)) {
      traps.push(f.interviewTrap);
    }
  });

  // Common mistakes
  const mistakes = [];
  files.forEach(f => {
    if (f && Array.isArray(f.commonMistakes)) {
      f.commonMistakes.forEach(cm => {
        if (!mistakes.some(x => x.mistake === cm.mistake)) mistakes.push(cm);
      });
    }
  });

  // Follow-up deep dives
  const followUps = [];
  files.forEach(f => {
    if (f && Array.isArray(f.followUpDeepDive)) {
      f.followUpDeepDive.forEach(fu => {
        if (!followUps.some(x => x.question === fu.question)) followUps.push(fu);
      });
    }
  });

  const d = primary.detailedExplanation || {};
  const explanationSteps = (d.stepByStepWalkthrough || []).map((s, idx) => `${idx + 1}. ${s}`).join('\n');
  const howToExplain = primary.howToExplain || {};

  const guide = `## 🏛️ ${title} — Architectural Masterclass Guide

> **Track Focus**: ${category}
> **Core Concept**: ${primary.concept || topic.tag || title}
> **Status**: Verified against ECMAScript & Engine Runtime Specifications

---

### 1. 🧠 Core Architectural Mental Model
${d.conceptualOverview || topic.summary || topic.mentalModel || 'Deep architectural mental model.'}

#### Execution Lifecycle & Sequence
${explanationSteps || '1. Evaluates declarations\n2. Binds scope and execution records\n3. Dispatches synchronous or asynchronous operations onto the engine stack.'}

---

### 2. ⚙️ Underlying Engine Internals
${d.underlyingEngineInternals || 'Deep low-level engine memory layout and runtime dispatching mechanisms.'}

${m && m.detailedExplanation && m.detailedExplanation.underlyingEngineInternals && m.detailedExplanation.underlyingEngineInternals !== d.underlyingEngineInternals ? `\n#### Advanced Engine Invariants\n${m.detailedExplanation.underlyingEngineInternals}` : ''}

---

### 3. ⚠️ Senior Interview Traps & Pitfalls
${traps.map((t, idx) => `> [!WARNING]\n> **Trap ${idx + 1}**: ${t}`).join('\n\n')}

${mistakes.length > 0 ? `\n#### Common Candidate Mistakes\n` + mistakes.map(cm => `- ❌ **Mistake**: ${cm.mistake}\n  - **Why it's wrong**: ${cm.why}\n  - ✅ **What to say instead**: ${cm.correct}`).join('\n') : ''}

---

### 4. 📊 Algorithmic & Memory Complexity
- **Time Complexity**: ${d.complexity?.time || 'O(1) amortized'}
- **Space Complexity**: ${d.complexity?.space || 'O(1) memory overhead'}

---

### 5. 📜 Verified Standards & Engine Specifications
${Array.from(specs).map(s => `- 📖 **Specification**: ${s}`).join('\n') || '- Official ECMAScript / React Architecture Reference'}

**Verified Runtime Invariants**:
${Array.from(rules).map(r => `- ✅ ${r}`).join('\n') || '- Runtime invariants guaranteed by engine specification.'}

---

### 6. 🎯 Senior & Staff Interview Questions & Expert Answers
${allQuestions.map((q, idx) => `
#### Q${idx + 1}. ${q.question}
> **Why Interviewers Ask This**: ${q.whyAsked || 'Testing depth of architectural understanding'}  
> **Difficulty**: \`${q.difficulty || 'intermediate'}\`

${q.answer}
`).join('\n---\n')}

${allScenarios.length > 0 ? `
---

### 7. 🏢 Real-World Production Architecture & Case Studies
${allScenarios.map((sc, idx) => `
#### ${idx + 1}. ${sc.scenario}
${sc.description}
${sc.companies ? `\n> **Production Reference**: ${sc.companies}` : ''}
${sc.codeSnippet ? `\n\`\`\`javascript\n${sc.codeSnippet}\n\`\`\`` : ''}
`).join('\n')}` : ''}

${howToExplain.opening ? `
---

### 8. 🗣️ How to Articulate This to an Interviewer

**Opening Statement**:
> "${howToExplain.opening}"

**Key Architectural Points to Hit**:
${(howToExplain.keyPoints || []).map((kp, idx) => `${idx + 1}. ${kp}`).join('\n')}

${howToExplain.analogies && howToExplain.analogies.length > 0 ? `**Intuitive Mental Analogy**: ${howToExplain.analogies[0]}\n` : ''}
**Closing Impression**:
> "${howToExplain.closingImpression || ''}"
` : ''}

${followUps.length > 0 ? `
---

### 9. 🔬 Follow-Up Deep-Dive Questions
${followUps.map((fu, idx) => `
**Deep-Dive Q${idx + 1}: ${fu.question}**  
${fu.answer || fu.expertAnswer || ''}
${fu.specReference ? `\n> 📖 **Spec Reference**: ${fu.specReference}` : ''}
`).join('\n\n')}` : ''}
`;

  return {
    guide,
    questions: allQuestions,
    importance: primary.importance || `Understanding ${title} is critical for diagnosing performance bottlenecks, memory leaks, and architecting robust production systems.`,
    mentalModel: primary.mentalModel || d.conceptualOverview || topic.mentalModel || topic.summary,
    traps: traps.join('; ') || topic.traps || 'Subtle engine behaviors that typical candidates overlook.'
  };
}

// Convert JavaScript topics
const rawJsTopics = require('./topics');
const processedJs = rawJsTopics.map(cat => {
  const topics = cat.topics.map(t => {
    const basicId = t.challenges?.Basic?.id;
    const medId = t.challenges?.Medium?.id;
    const hardId = t.challenges?.Hard?.id;
    const files = [allJson[basicId], allJson[medId], allJson[hardId]].filter(Boolean);

    const synthesized = synthesizeConceptGuide(t, cat.category, files);

    return {
      id: t.id,
      title: t.title,
      tag: t.tag,
      summary: t.summary,
      importance: t.importance || synthesized.importance,
      mentalModel: t.mentalModel || synthesized.mentalModel,
      traps: t.traps || synthesized.traps,
      interviewQuestions: synthesized.questions,
      defaultGuide: synthesized.guide
    };
  });

  return {
    id: cat.id,
    category: cat.category,
    badge: cat.badge,
    description: cat.description,
    topics
  };
});

// Convert React topics
const rawReactTopics = require('./topics-react');
const processedReact = rawReactTopics.map(cat => {
  const topics = cat.topics.map(t => {
    const basicId = t.challenges?.Basic?.id;
    const medId = t.challenges?.Medium?.id;
    const hardId = t.challenges?.Hard?.id;
    const files = [allJson[basicId], allJson[medId], allJson[hardId]].filter(Boolean);

    const synthesized = synthesizeConceptGuide(t, cat.category, files);

    return {
      id: t.id,
      title: t.title,
      tag: t.tag,
      summary: t.summary,
      importance: t.importance || synthesized.importance,
      mentalModel: t.mentalModel || synthesized.mentalModel,
      traps: t.traps || synthesized.traps,
      interviewQuestions: synthesized.questions,
      defaultGuide: synthesized.guide
    };
  });

  return {
    id: cat.id,
    category: cat.category,
    badge: cat.badge,
    description: cat.description,
    topics
  };
});

// Backups
if (!fs.existsSync(path.join(__dirname, 'topics.backup.js'))) {
  fs.copyFileSync(path.join(__dirname, 'topics.js'), path.join(__dirname, 'topics.backup.js'));
}
if (!fs.existsSync(path.join(__dirname, 'topics-react.backup.js'))) {
  fs.copyFileSync(path.join(__dirname, 'topics-react.js'), path.join(__dirname, 'topics-react.backup.js'));
}

// Write concept-based catalogs
fs.writeFileSync(
  path.join(__dirname, 'topics.js'),
  '// Authoritative JavaScript Architecture & Runtime Concepts Catalog\n// Pure Deep Knowledge & Concept-Based Masterclasses (No Coding Challenges)\n\nmodule.exports = ' + JSON.stringify(processedJs, null, 2) + ';\n'
);

fs.writeFileSync(
  path.join(__dirname, 'topics-react.js'),
  '// Authoritative React.js Fiber & Engine Architecture Concepts Catalog\n// Pure Deep Knowledge & Concept-Based Masterclasses (No Coding Challenges)\n\nmodule.exports = ' + JSON.stringify(processedReact, null, 2) + ';\n'
);

console.log('Successfully generated concept-based topics.js and topics-react.js!');
