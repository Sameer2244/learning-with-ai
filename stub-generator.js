// Helper to create empty starter stubs from full solutions
function createStub(code) {
  if (!code) return '// Write solution here\n';
  
  if (code.includes('class EventEmitter')) {
    return `class EventEmitter {
  constructor() {
    // TODO: Initialize event storage
  }

  on(event, listener) {
    // TODO: Register listener and return unsubscribe function
  }

  emit(event, ...args) {
    // TODO: Trigger listeners
  }

  off(event, listener) {
    // TODO: Remove listener
  }

  once(event, listener) {
    // TODO: Register one-time listener
  }
}
`;
  }

  let out = '';
  let depth = 0;
  let parenDepth = 0;
  let inString = null;
  let inLineComment = false;
  let inBlockComment = false;
  let escaped = false;
  let insideTopLevel = false;

  for (let i = 0; i < code.length; i++) {
    const ch = code[i];
    const next = code[i + 1];

    if (inLineComment) {
      if (!insideTopLevel) out += ch;
      if (ch === '\n') inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (!insideTopLevel) out += ch;
      if (ch === '*' && next === '/') {
        if (!insideTopLevel) out += '/';
        i++;
        inBlockComment = false;
      }
      continue;
    }
    if (inString) {
      if (!insideTopLevel) out += ch;
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === inString) {
        inString = null;
      }
      continue;
    }

    if (ch === '/' && next === '/') {
      inLineComment = true;
      if (!insideTopLevel) out += '//';
      i++;
      continue;
    }
    if (ch === '/' && next === '*') {
      inBlockComment = true;
      if (!insideTopLevel) out += '/*';
      i++;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      inString = ch;
      if (!insideTopLevel) out += ch;
      continue;
    }

    if (ch === '(') {
      if (!insideTopLevel) {
        parenDepth++;
        out += ch;
      }
      continue;
    }
    if (ch === ')') {
      if (!insideTopLevel) {
        parenDepth = Math.max(0, parenDepth - 1);
        out += ch;
      }
      continue;
    }

    if (ch === '{') {
      if (parenDepth === 0) {
        depth++;
        if (depth === 1) {
          out += '{\n  // TODO: Implement solution\n';
          insideTopLevel = true;
          continue;
        }
      } else {
        out += ch;
        continue;
      }
    }

    if (ch === '}') {
      if (parenDepth === 0) {
        depth--;
        if (depth === 0) {
          out += '}';
          insideTopLevel = false;
          continue;
        }
      } else {
        out += ch;
        continue;
      }
    }

    if (!insideTopLevel) {
      out += ch;
    }
  }

  return out.trim() + '\n';
}

module.exports = { createStub };
