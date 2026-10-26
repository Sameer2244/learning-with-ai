// Exhaustive JavaScript Mastery Topics Catalog
// Curated with Basic, Medium, and Hard challenges with runnable test cases.

module.exports = [
  {
    "id": "engine-internals",
    "category": "1. JS Engine & Memory Internals",
    "badge": "Core Architecture",
    "description": "Understand the V8/SpiderMonkey runtime, memory heap, call stack, execution contexts, and variable lifetimes.",
    "topics": [
      {
        "id": "execution-context",
        "title": "Execution Context & Call Stack",
        "tag": "Engine",
        "summary": "Creation phase vs Execution phase, Global Execution Context, Function Context, and Stack Overflow mechanics.",
        "mentalModel": "Before running any code line, the JS engine allocates memory for declarations (Creation Phase), setting up variable records and the [[Environment]] reference. In the Execution Phase, code is evaluated line-by-line synchronously onto the single-threaded Call Stack.",
        "traps": "Variable shadowing, deep recursive calls exhausting stack space (RangeError: Maximum call stack size exceeded), and context creation cost.",
        "challenges": {
          "Basic": {
            "id": "exec-context-basic",
            "title": "Call Stack Depth Calculator",
            "difficulty": "Basic",
            "concept": "Call Stack Execution & Linear Frame Tracking",
            "description": "Implement a function `measureStackDepth(limit)` that calculates how many nested function calls can be made synchronously without overflowing the stack. If `limit` is reached, it should return the count of frames reached safely.",
            "starterCode": "/**\n * Calculate safe call stack depth iteratively or recursively up to limit.\n * @param {number} limit - Maximum depth to check safely\n * @returns {number} The depth reached\n */\nfunction measureStackDepth(limit = 1000) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Attempting an unbounded recursion will crash with RangeError: Maximum call stack size exceeded. In production you must establish guard rails.",
            "testCases": [
              {
                "id": 1,
                "name": "Reaches small depth of 10 frames",
                "input": "measureStackDepth(10)",
                "expected": 10,
                "testFn": "return measureStackDepth(10);"
              },
              {
                "id": 2,
                "name": "Reaches depth of 500 frames safely",
                "input": "measureStackDepth(500)",
                "expected": 500,
                "testFn": "return measureStackDepth(500);"
              },
              {
                "id": 3,
                "name": "Handles limit of 0 correctly",
                "input": "measureStackDepth(0)",
                "expected": 0,
                "testFn": "return measureStackDepth(0);"
              }
            ],
            "solutionCode": "/**\n * Calculate safe call stack depth iteratively or recursively up to limit.\n * @param {number} limit - Maximum depth to check safely\n * @returns {number} The depth reached\n */\nfunction measureStackDepth(limit = 1000) {\n  // Your implementation here\n  let depth = 0;\n  function recurse() {\n    if (depth >= limit) return depth;\n    depth++;\n    return recurse();\n  }\n  return recurse();\n}\n"
          },
          "Medium": {
            "id": "exec-context-medium",
            "title": "Fix Deep Stack Overflow (Trampoline / Iterative Traversal)",
            "difficulty": "Medium",
            "concept": "Tail-Call Trampolining & Heap vs Stack Allocation",
            "description": "A standard recursive traversal of a deep linked list crashes with `RangeError: Maximum call stack size exceeded` for large N. Implement `safeTraverse(head)` that iterates through the list without exhausting the call stack, returning the total count of nodes.",
            "starterCode": "/**\n * Safely traverses a singly-linked list of any size without stack overflow.\n * @param {{ val: any, next: object|null }|null} head\n * @returns {number} Total count of nodes\n */\nfunction safeTraverse(head) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Candidates often write simple recursion `count(node.next) + 1` which overflows around 10,000 calls in V8. Converting to an iterative loop or trampoline moves frames from call stack to heap memory.",
            "testCases": [
              {
                "id": 1,
                "name": "Counts 3-node linked list",
                "input": "head = 1 -> 2 -> 3",
                "expected": 3,
                "testFn": "const list = { val: 1, next: { val: 2, next: { val: 3, next: null } } }; return safeTraverse(list);"
              },
              {
                "id": 2,
                "name": "Handles null head without error",
                "input": "head = null",
                "expected": 0,
                "testFn": "return safeTraverse(null);"
              },
              {
                "id": 3,
                "name": "Traverses 30,000 nodes without stack overflow",
                "input": "Linked list with 30,000 nodes",
                "expected": 30000,
                "testFn": "let head = null; for(let i = 0; i < 30000; i++) { head = { val: i, next: head }; } return safeTraverse(head);"
              }
            ],
            "solutionCode": "/**\n * Safely traverses a singly-linked list of any size without stack overflow.\n * @param {{ val: any, next: object|null }|null} head\n * @returns {number} Total count of nodes\n */\nfunction safeTraverse(head) {\n  // Implement an iterative or trampolined traversal to handle 50,000+ nodes\n  let count = 0;\n  let curr = head;\n  while (curr) {\n    count++;\n    curr = curr.next;\n  }\n  return count;\n}\n"
          },
          "Hard": {
            "id": "exec-context-hard",
            "title": "Synchronous Execution Context Profiler",
            "difficulty": "Hard",
            "concept": "Execution Context Call Tracking & Stack Unwinding",
            "description": "Build an execution context tracker `createExecutionTracker()` that returns an object with methods: `enter(contextName)`, `exit(contextName)`, `getCurrentContext()`, and `getCallStackSnapshot()`. It must validate that exiting matches the current active top of the call stack (LIFO order), and throw an Error if an unmatched exit occurs.",
            "starterCode": "/**\n * Simulates call stack frame tracking with LIFO validation.\n */\nfunction createExecutionTracker() {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Forgetting that call stacks are strictly LIFO (Last-In First-Out). Exiting a parent before a child context indicates invalid unnesting.",
            "testCases": [
              {
                "id": 1,
                "name": "Tracks nested contexts in LIFO order",
                "input": "enter('Global') -> enter('fnA') -> getCurrentContext()",
                "expected": "fnA",
                "testFn": "const t = createExecutionTracker(); t.enter('Global'); t.enter('fnA'); return t.getCurrentContext();"
              },
              {
                "id": 2,
                "name": "Unwinds stack accurately on exit",
                "input": "enter('Global') -> enter('fnA') -> exit('fnA') -> getCurrentContext()",
                "expected": "Global",
                "testFn": "const t = createExecutionTracker(); t.enter('Global'); t.enter('fnA'); t.exit('fnA'); return t.getCurrentContext();"
              },
              {
                "id": 3,
                "name": "Throws error on mismatched exit",
                "input": "enter('A') -> exit('B') throws Error",
                "expected": true,
                "testFn": "const t = createExecutionTracker(); t.enter('A'); try { t.exit('B'); return false; } catch (e) { return true; }"
              }
            ],
            "solutionCode": "/**\n * Simulates call stack frame tracking with LIFO validation.\n */\nfunction createExecutionTracker() {\n  const stack = [];\n  \n  return {\n    enter(name) {\n      stack.push(name);\n      return stack.length;\n    },\n    exit(name) {\n      if (stack.length === 0) {\n        throw new Error('Call stack underflow');\n      }\n      const top = stack[stack.length - 1];\n      if (top !== name) {\n        throw new Error(`Mismatched exit: expected ${top}, got ${name}`);\n      }\n      return stack.pop();\n    },\n    getCurrentContext() {\n      return stack.length > 0 ? stack[stack.length - 1] : null;\n    },\n    getCallStackSnapshot() {\n      return [...stack];\n    }\n  };\n}\n"
          }
        },
        "starterChallenge": {
          "id": "exec-context-basic",
          "title": "Call Stack Depth Calculator",
          "difficulty": "Basic",
          "concept": "Call Stack Execution & Linear Frame Tracking",
          "description": "Implement a function `measureStackDepth(limit)` that calculates how many nested function calls can be made synchronously without overflowing the stack. If `limit` is reached, it should return the count of frames reached safely.",
          "starterCode": "/**\n * Calculate safe call stack depth iteratively or recursively up to limit.\n * @param {number} limit - Maximum depth to check safely\n * @returns {number} The depth reached\n */\nfunction measureStackDepth(limit = 1000) {\n  // TODO: Implement solution\n}\n",
          "interviewTrap": "Attempting an unbounded recursion will crash with RangeError: Maximum call stack size exceeded. In production you must establish guard rails.",
          "testCases": [
            {
              "id": 1,
              "name": "Reaches small depth of 10 frames",
              "input": "measureStackDepth(10)",
              "expected": 10,
              "testFn": "return measureStackDepth(10);"
            },
            {
              "id": 2,
              "name": "Reaches depth of 500 frames safely",
              "input": "measureStackDepth(500)",
              "expected": 500,
              "testFn": "return measureStackDepth(500);"
            },
            {
              "id": 3,
              "name": "Handles limit of 0 correctly",
              "input": "measureStackDepth(0)",
              "expected": 0,
              "testFn": "return measureStackDepth(0);"
            }
          ],
          "solutionCode": "/**\n * Calculate safe call stack depth iteratively or recursively up to limit.\n * @param {number} limit - Maximum depth to check safely\n * @returns {number} The depth reached\n */\nfunction measureStackDepth(limit = 1000) {\n  // Your implementation here\n  let depth = 0;\n  function recurse() {\n    if (depth >= limit) return depth;\n    depth++;\n    return recurse();\n  }\n  return recurse();\n}\n"
        },
        "questions": [
          {
            "id": "exec-context-basic",
            "title": "Call Stack Depth Calculator",
            "difficulty": "Basic",
            "concept": "Call Stack Execution & Linear Frame Tracking",
            "description": "Implement a function `measureStackDepth(limit)` that calculates how many nested function calls can be made synchronously without overflowing the stack. If `limit` is reached, it should return the count of frames reached safely.",
            "starterCode": "/**\n * Calculate safe call stack depth iteratively or recursively up to limit.\n * @param {number} limit - Maximum depth to check safely\n * @returns {number} The depth reached\n */\nfunction measureStackDepth(limit = 1000) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Attempting an unbounded recursion will crash with RangeError: Maximum call stack size exceeded. In production you must establish guard rails.",
            "testCases": [
              {
                "id": 1,
                "name": "Reaches small depth of 10 frames",
                "input": "measureStackDepth(10)",
                "expected": 10,
                "testFn": "return measureStackDepth(10);"
              },
              {
                "id": 2,
                "name": "Reaches depth of 500 frames safely",
                "input": "measureStackDepth(500)",
                "expected": 500,
                "testFn": "return measureStackDepth(500);"
              },
              {
                "id": 3,
                "name": "Handles limit of 0 correctly",
                "input": "measureStackDepth(0)",
                "expected": 0,
                "testFn": "return measureStackDepth(0);"
              }
            ],
            "solutionCode": "/**\n * Calculate safe call stack depth iteratively or recursively up to limit.\n * @param {number} limit - Maximum depth to check safely\n * @returns {number} The depth reached\n */\nfunction measureStackDepth(limit = 1000) {\n  // Your implementation here\n  let depth = 0;\n  function recurse() {\n    if (depth >= limit) return depth;\n    depth++;\n    return recurse();\n  }\n  return recurse();\n}\n"
          },
          {
            "id": "exec-context-medium",
            "title": "Fix Deep Stack Overflow (Trampoline / Iterative Traversal)",
            "difficulty": "Medium",
            "concept": "Tail-Call Trampolining & Heap vs Stack Allocation",
            "description": "A standard recursive traversal of a deep linked list crashes with `RangeError: Maximum call stack size exceeded` for large N. Implement `safeTraverse(head)` that iterates through the list without exhausting the call stack, returning the total count of nodes.",
            "starterCode": "/**\n * Safely traverses a singly-linked list of any size without stack overflow.\n * @param {{ val: any, next: object|null }|null} head\n * @returns {number} Total count of nodes\n */\nfunction safeTraverse(head) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Candidates often write simple recursion `count(node.next) + 1` which overflows around 10,000 calls in V8. Converting to an iterative loop or trampoline moves frames from call stack to heap memory.",
            "testCases": [
              {
                "id": 1,
                "name": "Counts 3-node linked list",
                "input": "head = 1 -> 2 -> 3",
                "expected": 3,
                "testFn": "const list = { val: 1, next: { val: 2, next: { val: 3, next: null } } }; return safeTraverse(list);"
              },
              {
                "id": 2,
                "name": "Handles null head without error",
                "input": "head = null",
                "expected": 0,
                "testFn": "return safeTraverse(null);"
              },
              {
                "id": 3,
                "name": "Traverses 30,000 nodes without stack overflow",
                "input": "Linked list with 30,000 nodes",
                "expected": 30000,
                "testFn": "let head = null; for(let i = 0; i < 30000; i++) { head = { val: i, next: head }; } return safeTraverse(head);"
              }
            ],
            "solutionCode": "/**\n * Safely traverses a singly-linked list of any size without stack overflow.\n * @param {{ val: any, next: object|null }|null} head\n * @returns {number} Total count of nodes\n */\nfunction safeTraverse(head) {\n  // Implement an iterative or trampolined traversal to handle 50,000+ nodes\n  let count = 0;\n  let curr = head;\n  while (curr) {\n    count++;\n    curr = curr.next;\n  }\n  return count;\n}\n"
          },
          {
            "id": "exec-context-hard",
            "title": "Synchronous Execution Context Profiler",
            "difficulty": "Hard",
            "concept": "Execution Context Call Tracking & Stack Unwinding",
            "description": "Build an execution context tracker `createExecutionTracker()` that returns an object with methods: `enter(contextName)`, `exit(contextName)`, `getCurrentContext()`, and `getCallStackSnapshot()`. It must validate that exiting matches the current active top of the call stack (LIFO order), and throw an Error if an unmatched exit occurs.",
            "starterCode": "/**\n * Simulates call stack frame tracking with LIFO validation.\n */\nfunction createExecutionTracker() {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Forgetting that call stacks are strictly LIFO (Last-In First-Out). Exiting a parent before a child context indicates invalid unnesting.",
            "testCases": [
              {
                "id": 1,
                "name": "Tracks nested contexts in LIFO order",
                "input": "enter('Global') -> enter('fnA') -> getCurrentContext()",
                "expected": "fnA",
                "testFn": "const t = createExecutionTracker(); t.enter('Global'); t.enter('fnA'); return t.getCurrentContext();"
              },
              {
                "id": 2,
                "name": "Unwinds stack accurately on exit",
                "input": "enter('Global') -> enter('fnA') -> exit('fnA') -> getCurrentContext()",
                "expected": "Global",
                "testFn": "const t = createExecutionTracker(); t.enter('Global'); t.enter('fnA'); t.exit('fnA'); return t.getCurrentContext();"
              },
              {
                "id": 3,
                "name": "Throws error on mismatched exit",
                "input": "enter('A') -> exit('B') throws Error",
                "expected": true,
                "testFn": "const t = createExecutionTracker(); t.enter('A'); try { t.exit('B'); return false; } catch (e) { return true; }"
              }
            ],
            "solutionCode": "/**\n * Simulates call stack frame tracking with LIFO validation.\n */\nfunction createExecutionTracker() {\n  const stack = [];\n  \n  return {\n    enter(name) {\n      stack.push(name);\n      return stack.length;\n    },\n    exit(name) {\n      if (stack.length === 0) {\n        throw new Error('Call stack underflow');\n      }\n      const top = stack[stack.length - 1];\n      if (top !== name) {\n        throw new Error(`Mismatched exit: expected ${top}, got ${name}`);\n      }\n      return stack.pop();\n    },\n    getCurrentContext() {\n      return stack.length > 0 ? stack[stack.length - 1] : null;\n    },\n    getCallStackSnapshot() {\n      return [...stack];\n    }\n  };\n}\n"
          }
        ]
      },
      {
        "id": "lexical-scope-closures",
        "title": "Scope Chain, Lexical Scoping & Closures",
        "tag": "Memory & Scope",
        "summary": "Lexical environments, outer scope references, closures in loops, and memory leak retention.",
        "mentalModel": "Functions in JS carry an internal [[Environment]] slot pointing to their lexical parent. A closure is formed whenever an inner function survives outside its parent scope while retaining references to variables in that parent's Lexical Environment Record.",
        "traps": "The classic loop trap `for(var i=0; i<3; i++) setTimeout(...)`, retaining large objects in closure scope unintentionally, and stale closures in callbacks.",
        "challenges": {
          "Basic": {
            "id": "closures-basic",
            "title": "Private Counter Factory with Step",
            "difficulty": "Basic",
            "concept": "Lexical Scoping & Variable Encapsulation",
            "description": "Implement `createCounter(initialValue, step)` that encapsulates `initialValue` and `step` in a closure. It returns an object with `increment()`, `decrement()`, `getValue()`, and `reset()`.",
            "starterCode": "/**\n * Encapsulates state within a closure.\n */\nfunction createCounter(initialValue = 0, step = 1) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Exposing internal variables directly or allowing external mutation without getters/setters.",
            "testCases": [
              {
                "id": 1,
                "name": "Increments and decrements with step",
                "input": "counter(10, 5) -> increment() -> 15",
                "expected": 15,
                "testFn": "const c = createCounter(10, 5); return c.increment();"
              },
              {
                "id": 2,
                "name": "Independent counters maintain isolated states",
                "input": "c1.increment() does not affect c2",
                "expected": [
                  1,
                  10
                ],
                "testFn": "const c1 = createCounter(0, 1); const c2 = createCounter(10, 2); c1.increment(); return [c1.getValue(), c2.getValue()];"
              },
              {
                "id": 3,
                "name": "Resets accurately to initial value",
                "input": "increment 3 times then reset()",
                "expected": 5,
                "testFn": "const c = createCounter(5, 2); c.increment(); c.increment(); c.reset(); return c.getValue();"
              }
            ],
            "solutionCode": "/**\n * Encapsulates state within a closure.\n */\nfunction createCounter(initialValue = 0, step = 1) {\n  let count = initialValue;\n  return {\n    increment() {\n      count += step;\n      return count;\n    },\n    decrement() {\n      count -= step;\n      return count;\n    },\n    getValue() {\n      return count;\n    },\n    reset() {\n      count = initialValue;\n      return count;\n    }\n  };\n}\n"
          },
          "Medium": {
            "id": "closures-medium",
            "title": "Secure Store with Memory Release & Deep Snapshot",
            "difficulty": "Medium",
            "concept": "Closure Encapsulation & Memory Leak Prevention",
            "description": "Create `createSecureStore(initialData)` that stores sensitive data within a closure. Provide `get(key)`, `set(key, value)`, `has(key)`, and `clear()`. Crucially, `get(key)` must return a safe deep copy (so mutating the returned object does not mutate the inner store), and `clear()` must empty the inner map to free memory.",
            "starterCode": "function createSecureStore(initialData = {}) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Returning direct object references from closures allows external callers to mutate private state directly.",
            "testCases": [
              {
                "id": 1,
                "name": "Stores and retrieves primitive values",
                "input": "set('token', 'abc') -> get('token')",
                "expected": "abc",
                "testFn": "const s = createSecureStore(); s.set('token', 'abc'); return s.get('token');"
              },
              {
                "id": 2,
                "name": "Prevents external mutation of stored objects",
                "input": "Mutating returned object does not affect internal store",
                "expected": "alice",
                "testFn": "const s = createSecureStore({ user: { name: 'alice' } }); const u = s.get('user'); u.name = 'hacked'; return s.get('user').name;"
              },
              {
                "id": 3,
                "name": "clear() wipes stored data completely",
                "input": "set -> clear -> has('key')",
                "expected": false,
                "testFn": "const s = createSecureStore(); s.set('k', 123); s.clear(); return s.has('k');"
              }
            ],
            "solutionCode": "function createSecureStore(initialData = {}) {\n  let store = JSON.parse(JSON.stringify(initialData));\n  \n  return {\n    get(key) {\n      if (!(key in store)) return undefined;\n      const val = store[key];\n      return typeof val === 'object' && val !== null ? JSON.parse(JSON.stringify(val)) : val;\n    },\n    set(key, value) {\n      store[key] = typeof value === 'object' && value !== null ? JSON.parse(JSON.stringify(value)) : value;\n    },\n    has(key) {\n      return key in store;\n    },\n    clear() {\n      store = {};\n    }\n  };\n}\n"
          },
          "Hard": {
            "id": "closures-hard",
            "title": "Advanced Multi-Key Memoizer with Capacity & TTL",
            "difficulty": "Hard",
            "concept": "Lexical Cache Management & Memory Eviction",
            "description": "Implement `memoize(fn, { maxAge, maxSize })` which returns a memoized version of `fn`. It must serialize multiple arguments into a deterministic key, respect `maxSize` (LRU eviction when full), and expire entries after `maxAge` milliseconds if provided.",
            "starterCode": "function memoize(fn, options = {}) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Using simple objects as caches causes memory leaks over time because entries are never evicted. Using Map with LRU deletion and TTL prevents unbounded memory growth.",
            "testCases": [
              {
                "id": 1,
                "name": "Caches computation across repeated calls",
                "input": "memoizedFn called twice only executes target once",
                "expected": {
                  "calls": 1,
                  "result": 25
                },
                "testFn": "let calls = 0; const square = memoize((x) => { calls++; return x * x; }); const r1 = square(5); const r2 = square(5); return { calls, result: r2 };"
              },
              {
                "id": 2,
                "name": "Evicts oldest entry when maxSize is exceeded",
                "input": "maxSize = 2, adding 3rd evicts 1st",
                "expected": {
                  "calls": 4
                },
                "testFn": "let calls = 0; const fn = memoize((x) => { calls++; return x; }, { maxSize: 2 }); fn(1); fn(2); fn(3); fn(1); return { calls };"
              },
              {
                "id": 3,
                "name": "Correctly handles multiple arguments",
                "input": "add(2, 3) vs add(3, 2)",
                "expected": [
                  5,
                  5
                ],
                "testFn": "let calls = 0; const add = memoize((a, b) => { calls++; return a + b; }); return [add(2, 3), add(3, 2)];"
              }
            ],
            "solutionCode": "function memoize(fn, options = {}) {\n  const { maxAge = Infinity, maxSize = Infinity } = options;\n  const cache = new Map(); // key -> { value, expiry }\n\n  return function(...args) {\n    const key = JSON.stringify(args);\n    const now = Date.now();\n\n    if (cache.has(key)) {\n      const entry = cache.get(key);\n      if (now < entry.expiry) {\n        // Refresh position for LRU\n        cache.delete(key);\n        cache.set(key, entry);\n        return entry.value;\n      } else {\n        cache.delete(key);\n      }\n    }\n\n    const result = fn.apply(this, args);\n\n    if (cache.size >= maxSize) {\n      const oldestKey = cache.keys().next().value;\n      cache.delete(oldestKey);\n    }\n\n    cache.set(key, { value: result, expiry: now + maxAge });\n    return result;\n  };\n}\n"
          }
        },
        "starterChallenge": {
          "id": "closures-basic",
          "title": "Private Counter Factory with Step",
          "difficulty": "Basic",
          "concept": "Lexical Scoping & Variable Encapsulation",
          "description": "Implement `createCounter(initialValue, step)` that encapsulates `initialValue` and `step` in a closure. It returns an object with `increment()`, `decrement()`, `getValue()`, and `reset()`.",
          "starterCode": "/**\n * Encapsulates state within a closure.\n */\nfunction createCounter(initialValue = 0, step = 1) {\n  // TODO: Implement solution\n}\n",
          "interviewTrap": "Exposing internal variables directly or allowing external mutation without getters/setters.",
          "testCases": [
            {
              "id": 1,
              "name": "Increments and decrements with step",
              "input": "counter(10, 5) -> increment() -> 15",
              "expected": 15,
              "testFn": "const c = createCounter(10, 5); return c.increment();"
            },
            {
              "id": 2,
              "name": "Independent counters maintain isolated states",
              "input": "c1.increment() does not affect c2",
              "expected": [
                1,
                10
              ],
              "testFn": "const c1 = createCounter(0, 1); const c2 = createCounter(10, 2); c1.increment(); return [c1.getValue(), c2.getValue()];"
            },
            {
              "id": 3,
              "name": "Resets accurately to initial value",
              "input": "increment 3 times then reset()",
              "expected": 5,
              "testFn": "const c = createCounter(5, 2); c.increment(); c.increment(); c.reset(); return c.getValue();"
            }
          ],
          "solutionCode": "/**\n * Encapsulates state within a closure.\n */\nfunction createCounter(initialValue = 0, step = 1) {\n  let count = initialValue;\n  return {\n    increment() {\n      count += step;\n      return count;\n    },\n    decrement() {\n      count -= step;\n      return count;\n    },\n    getValue() {\n      return count;\n    },\n    reset() {\n      count = initialValue;\n      return count;\n    }\n  };\n}\n"
        },
        "questions": [
          {
            "id": "closures-basic",
            "title": "Private Counter Factory with Step",
            "difficulty": "Basic",
            "concept": "Lexical Scoping & Variable Encapsulation",
            "description": "Implement `createCounter(initialValue, step)` that encapsulates `initialValue` and `step` in a closure. It returns an object with `increment()`, `decrement()`, `getValue()`, and `reset()`.",
            "starterCode": "/**\n * Encapsulates state within a closure.\n */\nfunction createCounter(initialValue = 0, step = 1) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Exposing internal variables directly or allowing external mutation without getters/setters.",
            "testCases": [
              {
                "id": 1,
                "name": "Increments and decrements with step",
                "input": "counter(10, 5) -> increment() -> 15",
                "expected": 15,
                "testFn": "const c = createCounter(10, 5); return c.increment();"
              },
              {
                "id": 2,
                "name": "Independent counters maintain isolated states",
                "input": "c1.increment() does not affect c2",
                "expected": [
                  1,
                  10
                ],
                "testFn": "const c1 = createCounter(0, 1); const c2 = createCounter(10, 2); c1.increment(); return [c1.getValue(), c2.getValue()];"
              },
              {
                "id": 3,
                "name": "Resets accurately to initial value",
                "input": "increment 3 times then reset()",
                "expected": 5,
                "testFn": "const c = createCounter(5, 2); c.increment(); c.increment(); c.reset(); return c.getValue();"
              }
            ],
            "solutionCode": "/**\n * Encapsulates state within a closure.\n */\nfunction createCounter(initialValue = 0, step = 1) {\n  let count = initialValue;\n  return {\n    increment() {\n      count += step;\n      return count;\n    },\n    decrement() {\n      count -= step;\n      return count;\n    },\n    getValue() {\n      return count;\n    },\n    reset() {\n      count = initialValue;\n      return count;\n    }\n  };\n}\n"
          },
          {
            "id": "closures-medium",
            "title": "Secure Store with Memory Release & Deep Snapshot",
            "difficulty": "Medium",
            "concept": "Closure Encapsulation & Memory Leak Prevention",
            "description": "Create `createSecureStore(initialData)` that stores sensitive data within a closure. Provide `get(key)`, `set(key, value)`, `has(key)`, and `clear()`. Crucially, `get(key)` must return a safe deep copy (so mutating the returned object does not mutate the inner store), and `clear()` must empty the inner map to free memory.",
            "starterCode": "function createSecureStore(initialData = {}) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Returning direct object references from closures allows external callers to mutate private state directly.",
            "testCases": [
              {
                "id": 1,
                "name": "Stores and retrieves primitive values",
                "input": "set('token', 'abc') -> get('token')",
                "expected": "abc",
                "testFn": "const s = createSecureStore(); s.set('token', 'abc'); return s.get('token');"
              },
              {
                "id": 2,
                "name": "Prevents external mutation of stored objects",
                "input": "Mutating returned object does not affect internal store",
                "expected": "alice",
                "testFn": "const s = createSecureStore({ user: { name: 'alice' } }); const u = s.get('user'); u.name = 'hacked'; return s.get('user').name;"
              },
              {
                "id": 3,
                "name": "clear() wipes stored data completely",
                "input": "set -> clear -> has('key')",
                "expected": false,
                "testFn": "const s = createSecureStore(); s.set('k', 123); s.clear(); return s.has('k');"
              }
            ],
            "solutionCode": "function createSecureStore(initialData = {}) {\n  let store = JSON.parse(JSON.stringify(initialData));\n  \n  return {\n    get(key) {\n      if (!(key in store)) return undefined;\n      const val = store[key];\n      return typeof val === 'object' && val !== null ? JSON.parse(JSON.stringify(val)) : val;\n    },\n    set(key, value) {\n      store[key] = typeof value === 'object' && value !== null ? JSON.parse(JSON.stringify(value)) : value;\n    },\n    has(key) {\n      return key in store;\n    },\n    clear() {\n      store = {};\n    }\n  };\n}\n"
          },
          {
            "id": "closures-hard",
            "title": "Advanced Multi-Key Memoizer with Capacity & TTL",
            "difficulty": "Hard",
            "concept": "Lexical Cache Management & Memory Eviction",
            "description": "Implement `memoize(fn, { maxAge, maxSize })` which returns a memoized version of `fn`. It must serialize multiple arguments into a deterministic key, respect `maxSize` (LRU eviction when full), and expire entries after `maxAge` milliseconds if provided.",
            "starterCode": "function memoize(fn, options = {}) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Using simple objects as caches causes memory leaks over time because entries are never evicted. Using Map with LRU deletion and TTL prevents unbounded memory growth.",
            "testCases": [
              {
                "id": 1,
                "name": "Caches computation across repeated calls",
                "input": "memoizedFn called twice only executes target once",
                "expected": {
                  "calls": 1,
                  "result": 25
                },
                "testFn": "let calls = 0; const square = memoize((x) => { calls++; return x * x; }); const r1 = square(5); const r2 = square(5); return { calls, result: r2 };"
              },
              {
                "id": 2,
                "name": "Evicts oldest entry when maxSize is exceeded",
                "input": "maxSize = 2, adding 3rd evicts 1st",
                "expected": {
                  "calls": 4
                },
                "testFn": "let calls = 0; const fn = memoize((x) => { calls++; return x; }, { maxSize: 2 }); fn(1); fn(2); fn(3); fn(1); return { calls };"
              },
              {
                "id": 3,
                "name": "Correctly handles multiple arguments",
                "input": "add(2, 3) vs add(3, 2)",
                "expected": [
                  5,
                  5
                ],
                "testFn": "let calls = 0; const add = memoize((a, b) => { calls++; return a + b; }); return [add(2, 3), add(3, 2)];"
              }
            ],
            "solutionCode": "function memoize(fn, options = {}) {\n  const { maxAge = Infinity, maxSize = Infinity } = options;\n  const cache = new Map(); // key -> { value, expiry }\n\n  return function(...args) {\n    const key = JSON.stringify(args);\n    const now = Date.now();\n\n    if (cache.has(key)) {\n      const entry = cache.get(key);\n      if (now < entry.expiry) {\n        // Refresh position for LRU\n        cache.delete(key);\n        cache.set(key, entry);\n        return entry.value;\n      } else {\n        cache.delete(key);\n      }\n    }\n\n    const result = fn.apply(this, args);\n\n    if (cache.size >= maxSize) {\n      const oldestKey = cache.keys().next().value;\n      cache.delete(oldestKey);\n    }\n\n    cache.set(key, { value: result, expiry: now + maxAge });\n    return result;\n  };\n}\n"
          }
        ]
      },
      {
        "id": "hoisting-tdz",
        "title": "Hoisting & Temporal Dead Zone (TDZ)",
        "tag": "Engine",
        "summary": "var vs let/const, Function Declarations vs Expressions, and parameter default TDZ.",
        "mentalModel": "All declarations are hoisted during context creation. However, while `var` is initialized to `undefined`, `let` and `const` remain uninitialized in the Temporal Dead Zone (TDZ) until the evaluator passes their actual declaration line. Accessing them in TDZ throws a ReferenceError.",
        "traps": "Function declaration inside `if` block (ES6 Annex B semantics), class hoisting (classes are NOT hoisted like functions, they behave like `let`), and default parameter referencing uninitialized variables `(a = b, b = 2) => {}`.",
        "challenges": {
          "Basic": {
            "id": "tdz-basic",
            "title": "Var vs Let Hoisting Analyzer",
            "difficulty": "Basic",
            "concept": "Variable Lifecycle & Declaration Hoisting",
            "description": "Implement `analyzeHoisting(varCodeStr)` that inspects a simple code snippet and determines whether accessing a variable before its declaration returns `undefined` (hoisted with var) or throws a `ReferenceError` (hoisted into TDZ with let/const). Return 'INITIALIZED_UNDEFINED' or 'TDZ_REFERENCE_ERROR'.",
            "starterCode": "/**\n * Analyzes whether declaration style results in undefined or TDZ error.\n * @param {'var'|'let'|'const'} declarationType\n * @returns {string}\n */\nfunction analyzeHoisting(declarationType) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Believing that `let` and `const` are not hoisted at all. They ARE hoisted to the top of the block, but stay uninitialized in the TDZ.",
            "testCases": [
              {
                "id": 1,
                "name": "var declaration is initialized to undefined",
                "input": "analyzeHoisting('var')",
                "expected": "INITIALIZED_UNDEFINED",
                "testFn": "return analyzeHoisting('var');"
              },
              {
                "id": 2,
                "name": "let declaration produces TDZ ReferenceError",
                "input": "analyzeHoisting('let')",
                "expected": "TDZ_REFERENCE_ERROR",
                "testFn": "return analyzeHoisting('let');"
              },
              {
                "id": 3,
                "name": "const declaration produces TDZ ReferenceError",
                "input": "analyzeHoisting('const')",
                "expected": "TDZ_REFERENCE_ERROR",
                "testFn": "return analyzeHoisting('const');"
              }
            ],
            "solutionCode": "/**\n * Analyzes whether declaration style results in undefined or TDZ error.\n * @param {'var'|'let'|'const'} declarationType\n * @returns {string}\n */\nfunction analyzeHoisting(declarationType) {\n  if (declarationType === 'var') {\n    return 'INITIALIZED_UNDEFINED';\n  }\n  if (declarationType === 'let' || declarationType === 'const') {\n    return 'TDZ_REFERENCE_ERROR';\n  }\n  return 'UNKNOWN';\n}\n"
          },
          "Medium": {
            "id": "tdz-medium",
            "title": "Parameter Scope TDZ Resolver",
            "difficulty": "Medium",
            "concept": "Default Parameter Temporal Dead Zone & Scope Boundary",
            "description": "When default parameters reference each other (e.g. `(a = b, b = 2)`), accessing `b` before its evaluation produces a TDZ ReferenceError. Implement `safeDefaultResolver(params, evaluator)` which receives parameter declarations in order and returns an object `{ valid: boolean, errorParam?: string }` detecting whether any parameter references an uninitialized following parameter.",
            "starterCode": "function safeDefaultResolver(paramOrder, references) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Parameter scopes evaluate from left to right. A default parameter can reference previously initialized parameters to its left, but referencing a parameter to its right throws a TDZ ReferenceError.",
            "testCases": [
              {
                "id": 1,
                "name": "Valid left-to-right default parameter reference",
                "input": "b depends on a: valid",
                "expected": {
                  "valid": true
                },
                "testFn": "return safeDefaultResolver(['a', 'b'], { a: [], b: ['a'] });"
              },
              {
                "id": 2,
                "name": "TDZ error when referencing right-hand parameter",
                "input": "a depends on b before b is initialized",
                "expected": {
                  "valid": false,
                  "errorParam": "b"
                },
                "testFn": "return safeDefaultResolver(['a', 'b'], { a: ['b'], b: [] });"
              },
              {
                "id": 3,
                "name": "Independent parameters evaluate safely",
                "input": "['x', 'y', 'z'] with no dependencies",
                "expected": {
                  "valid": true
                },
                "testFn": "return safeDefaultResolver(['x', 'y', 'z'], { x: [], y: [], z: [] });"
              }
            ],
            "solutionCode": "function safeDefaultResolver(paramOrder, references) {\n  // paramOrder: Array of string param names in evaluation order: ['a', 'b', 'c']\n  // references: Map of param -> array of dependencies: { a: ['b'], b: [] }\n  const initialized = new Set();\n  \n  for (const param of paramOrder) {\n    const deps = references[param] || [];\n    for (const dep of deps) {\n      if (!initialized.has(dep)) {\n        return { valid: false, errorParam: dep };\n      }\n    }\n    initialized.add(param);\n  }\n  return { valid: true };\n}\n"
          },
          "Hard": {
            "id": "tdz-hard",
            "title": "Safe Function Declaration & Hoisting Sandbox",
            "difficulty": "Hard",
            "concept": "ES6 Annex B Block Scoping for Function Declarations",
            "description": "In ES6+, function declarations inside `if` blocks are block-scoped. Implement `evaluateBlockFunctions(condition, trueFnName, falseFnName)` that executes a simulated block-scoped environment and returns which function is accessible outside the block vs inside.",
            "starterCode": "function evaluateBlockFunctions(condition) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "In legacy ES5 / non-strict mode, function declarations in blocks were hoisted out into function scope, overwriting each other. In strict mode, they are strictly block scoped.",
            "testCases": [
              {
                "id": 1,
                "name": "Executes true branch function correctly",
                "input": "evaluateBlockFunctions(true)",
                "expected": "INSIDE_TRUE",
                "testFn": "return evaluateBlockFunctions(true).insideResult;"
              },
              {
                "id": 2,
                "name": "Executes false branch function correctly",
                "input": "evaluateBlockFunctions(false)",
                "expected": "INSIDE_FALSE",
                "testFn": "return evaluateBlockFunctions(false).insideResult;"
              },
              {
                "id": 3,
                "name": "Functions are scoped and execute deterministically",
                "input": "Both branches return non-null strings",
                "expected": true,
                "testFn": "const r1 = evaluateBlockFunctions(true); const r2 = evaluateBlockFunctions(false); return typeof r1.insideResult === 'string' && typeof r2.insideResult === 'string';"
              }
            ],
            "solutionCode": "function evaluateBlockFunctions(condition) {\n  let insideResult = null;\n  let outsideHasTrue = false;\n  \n  if (condition) {\n    function target() { return 'INSIDE_TRUE'; }\n    insideResult = target();\n  } else {\n    function target() { return 'INSIDE_FALSE'; }\n    insideResult = target();\n  }\n\n  return {\n    insideResult,\n    hasGlobalLeak: typeof target === 'function'\n  };\n}\n"
          }
        },
        "starterChallenge": {
          "id": "tdz-basic",
          "title": "Var vs Let Hoisting Analyzer",
          "difficulty": "Basic",
          "concept": "Variable Lifecycle & Declaration Hoisting",
          "description": "Implement `analyzeHoisting(varCodeStr)` that inspects a simple code snippet and determines whether accessing a variable before its declaration returns `undefined` (hoisted with var) or throws a `ReferenceError` (hoisted into TDZ with let/const). Return 'INITIALIZED_UNDEFINED' or 'TDZ_REFERENCE_ERROR'.",
          "starterCode": "/**\n * Analyzes whether declaration style results in undefined or TDZ error.\n * @param {'var'|'let'|'const'} declarationType\n * @returns {string}\n */\nfunction analyzeHoisting(declarationType) {\n  // TODO: Implement solution\n}\n",
          "interviewTrap": "Believing that `let` and `const` are not hoisted at all. They ARE hoisted to the top of the block, but stay uninitialized in the TDZ.",
          "testCases": [
            {
              "id": 1,
              "name": "var declaration is initialized to undefined",
              "input": "analyzeHoisting('var')",
              "expected": "INITIALIZED_UNDEFINED",
              "testFn": "return analyzeHoisting('var');"
            },
            {
              "id": 2,
              "name": "let declaration produces TDZ ReferenceError",
              "input": "analyzeHoisting('let')",
              "expected": "TDZ_REFERENCE_ERROR",
              "testFn": "return analyzeHoisting('let');"
            },
            {
              "id": 3,
              "name": "const declaration produces TDZ ReferenceError",
              "input": "analyzeHoisting('const')",
              "expected": "TDZ_REFERENCE_ERROR",
              "testFn": "return analyzeHoisting('const');"
            }
          ],
          "solutionCode": "/**\n * Analyzes whether declaration style results in undefined or TDZ error.\n * @param {'var'|'let'|'const'} declarationType\n * @returns {string}\n */\nfunction analyzeHoisting(declarationType) {\n  if (declarationType === 'var') {\n    return 'INITIALIZED_UNDEFINED';\n  }\n  if (declarationType === 'let' || declarationType === 'const') {\n    return 'TDZ_REFERENCE_ERROR';\n  }\n  return 'UNKNOWN';\n}\n"
        },
        "questions": [
          {
            "id": "tdz-basic",
            "title": "Var vs Let Hoisting Analyzer",
            "difficulty": "Basic",
            "concept": "Variable Lifecycle & Declaration Hoisting",
            "description": "Implement `analyzeHoisting(varCodeStr)` that inspects a simple code snippet and determines whether accessing a variable before its declaration returns `undefined` (hoisted with var) or throws a `ReferenceError` (hoisted into TDZ with let/const). Return 'INITIALIZED_UNDEFINED' or 'TDZ_REFERENCE_ERROR'.",
            "starterCode": "/**\n * Analyzes whether declaration style results in undefined or TDZ error.\n * @param {'var'|'let'|'const'} declarationType\n * @returns {string}\n */\nfunction analyzeHoisting(declarationType) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Believing that `let` and `const` are not hoisted at all. They ARE hoisted to the top of the block, but stay uninitialized in the TDZ.",
            "testCases": [
              {
                "id": 1,
                "name": "var declaration is initialized to undefined",
                "input": "analyzeHoisting('var')",
                "expected": "INITIALIZED_UNDEFINED",
                "testFn": "return analyzeHoisting('var');"
              },
              {
                "id": 2,
                "name": "let declaration produces TDZ ReferenceError",
                "input": "analyzeHoisting('let')",
                "expected": "TDZ_REFERENCE_ERROR",
                "testFn": "return analyzeHoisting('let');"
              },
              {
                "id": 3,
                "name": "const declaration produces TDZ ReferenceError",
                "input": "analyzeHoisting('const')",
                "expected": "TDZ_REFERENCE_ERROR",
                "testFn": "return analyzeHoisting('const');"
              }
            ],
            "solutionCode": "/**\n * Analyzes whether declaration style results in undefined or TDZ error.\n * @param {'var'|'let'|'const'} declarationType\n * @returns {string}\n */\nfunction analyzeHoisting(declarationType) {\n  if (declarationType === 'var') {\n    return 'INITIALIZED_UNDEFINED';\n  }\n  if (declarationType === 'let' || declarationType === 'const') {\n    return 'TDZ_REFERENCE_ERROR';\n  }\n  return 'UNKNOWN';\n}\n"
          },
          {
            "id": "tdz-medium",
            "title": "Parameter Scope TDZ Resolver",
            "difficulty": "Medium",
            "concept": "Default Parameter Temporal Dead Zone & Scope Boundary",
            "description": "When default parameters reference each other (e.g. `(a = b, b = 2)`), accessing `b` before its evaluation produces a TDZ ReferenceError. Implement `safeDefaultResolver(params, evaluator)` which receives parameter declarations in order and returns an object `{ valid: boolean, errorParam?: string }` detecting whether any parameter references an uninitialized following parameter.",
            "starterCode": "function safeDefaultResolver(paramOrder, references) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Parameter scopes evaluate from left to right. A default parameter can reference previously initialized parameters to its left, but referencing a parameter to its right throws a TDZ ReferenceError.",
            "testCases": [
              {
                "id": 1,
                "name": "Valid left-to-right default parameter reference",
                "input": "b depends on a: valid",
                "expected": {
                  "valid": true
                },
                "testFn": "return safeDefaultResolver(['a', 'b'], { a: [], b: ['a'] });"
              },
              {
                "id": 2,
                "name": "TDZ error when referencing right-hand parameter",
                "input": "a depends on b before b is initialized",
                "expected": {
                  "valid": false,
                  "errorParam": "b"
                },
                "testFn": "return safeDefaultResolver(['a', 'b'], { a: ['b'], b: [] });"
              },
              {
                "id": 3,
                "name": "Independent parameters evaluate safely",
                "input": "['x', 'y', 'z'] with no dependencies",
                "expected": {
                  "valid": true
                },
                "testFn": "return safeDefaultResolver(['x', 'y', 'z'], { x: [], y: [], z: [] });"
              }
            ],
            "solutionCode": "function safeDefaultResolver(paramOrder, references) {\n  // paramOrder: Array of string param names in evaluation order: ['a', 'b', 'c']\n  // references: Map of param -> array of dependencies: { a: ['b'], b: [] }\n  const initialized = new Set();\n  \n  for (const param of paramOrder) {\n    const deps = references[param] || [];\n    for (const dep of deps) {\n      if (!initialized.has(dep)) {\n        return { valid: false, errorParam: dep };\n      }\n    }\n    initialized.add(param);\n  }\n  return { valid: true };\n}\n"
          },
          {
            "id": "tdz-hard",
            "title": "Safe Function Declaration & Hoisting Sandbox",
            "difficulty": "Hard",
            "concept": "ES6 Annex B Block Scoping for Function Declarations",
            "description": "In ES6+, function declarations inside `if` blocks are block-scoped. Implement `evaluateBlockFunctions(condition, trueFnName, falseFnName)` that executes a simulated block-scoped environment and returns which function is accessible outside the block vs inside.",
            "starterCode": "function evaluateBlockFunctions(condition) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "In legacy ES5 / non-strict mode, function declarations in blocks were hoisted out into function scope, overwriting each other. In strict mode, they are strictly block scoped.",
            "testCases": [
              {
                "id": 1,
                "name": "Executes true branch function correctly",
                "input": "evaluateBlockFunctions(true)",
                "expected": "INSIDE_TRUE",
                "testFn": "return evaluateBlockFunctions(true).insideResult;"
              },
              {
                "id": 2,
                "name": "Executes false branch function correctly",
                "input": "evaluateBlockFunctions(false)",
                "expected": "INSIDE_FALSE",
                "testFn": "return evaluateBlockFunctions(false).insideResult;"
              },
              {
                "id": 3,
                "name": "Functions are scoped and execute deterministically",
                "input": "Both branches return non-null strings",
                "expected": true,
                "testFn": "const r1 = evaluateBlockFunctions(true); const r2 = evaluateBlockFunctions(false); return typeof r1.insideResult === 'string' && typeof r2.insideResult === 'string';"
              }
            ],
            "solutionCode": "function evaluateBlockFunctions(condition) {\n  let insideResult = null;\n  let outsideHasTrue = false;\n  \n  if (condition) {\n    function target() { return 'INSIDE_TRUE'; }\n    insideResult = target();\n  } else {\n    function target() { return 'INSIDE_FALSE'; }\n    insideResult = target();\n  }\n\n  return {\n    insideResult,\n    hasGlobalLeak: typeof target === 'function'\n  };\n}\n"
          }
        ]
      },
      {
        "id": "this-binding",
        "title": "'this' Keyword Mechanics & Binding Rules",
        "tag": "Language Core",
        "summary": "The 4 binding rules: Default, Implicit, Explicit (`call`/`apply`/`bind`), New, plus Lexical `this` in arrow functions.",
        "mentalModel": "`this` is NOT author-time; it is runtime call-site dependent (except arrow functions, which capture `this` lexically from their enclosing scope). The precedence order is: new binding > explicit binding > implicit binding > default binding (global or undefined in strict mode).",
        "traps": "Passing methods as callbacks losing implicit `this`, arrow functions used as object methods or prototype methods, and constructors returning an explicit object overriding the `new` instance.",
        "challenges": {
          "Basic": {
            "id": "this-basic",
            "title": "Method Callback Context Binder",
            "difficulty": "Basic",
            "concept": "Preserving Object Context when Passing Callbacks",
            "description": "When an object method is passed as a callback (e.g., `setTimeout(obj.method)`), implicit `this` is lost. Implement `bindMethod(obj, methodName)` that returns a wrapper function guaranteeing that `methodName` always executes with `obj` as `this`, preserving any forwarded arguments.",
            "starterCode": "/**\n * Binds an object's method to its owner object.\n */\nfunction bindMethod(obj, methodName) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Extracting a method `const fn = obj.method; fn()` invokes `fn` with default binding (undefined in strict mode), losing all object properties.",
            "testCases": [
              {
                "id": 1,
                "name": "Preserves object property access",
                "input": "bound method accesses this.name",
                "expected": "Antigravity",
                "testFn": "const user = { name: 'Antigravity', getName() { return this.name; } }; const bound = bindMethod(user, 'getName'); return bound();"
              },
              {
                "id": 2,
                "name": "Forwards arguments properly to bound method",
                "input": "bound method passes greeting and punctuation",
                "expected": "Hello, Antigravity!",
                "testFn": "const user = { name: 'Antigravity', greet(prefix, suffix) { return `${prefix}, ${this.name}${suffix}`; } }; const bound = bindMethod(user, 'greet'); return bound('Hello', '!');"
              },
              {
                "id": 3,
                "name": "Maintains binding even when assigned to another variable",
                "input": "const detached = bound; detached()",
                "expected": 42,
                "testFn": "const calc = { value: 42, getVal() { return this.value; } }; const detached = bindMethod(calc, 'getVal'); return detached();"
              }
            ],
            "solutionCode": "/**\n * Binds an object's method to its owner object.\n */\nfunction bindMethod(obj, methodName) {\n  return function(...args) {\n    return obj[methodName].apply(obj, args);\n  };\n}\n"
          },
          "Medium": {
            "id": "this-medium",
            "title": "Implement Custom Function.prototype.myCall & myApply",
            "difficulty": "Medium",
            "concept": "Explicit Context Invocation via Property Binding",
            "description": "Implement `myCall(thisArg, ...args)` on `Function.prototype` without using native `.call()`, `.apply()`, or `.bind()`. It must handle null/undefined `thisArg` (falling back to globalThis/window), wrap primitives, and avoid colliding with existing properties on `thisArg` using `Symbol()`.",
            "starterCode": "Function.prototype.myCall = function(thisArg, ...args) {\n  // TODO: Implement solution\n};\n",
            "interviewTrap": "Using a plain string key like `context.__fn__ = this` can overwrite existing properties on the target object. Using `Symbol()` guarantees zero key collision.",
            "testCases": [
              {
                "id": 1,
                "name": "Invokes function with explicit object context",
                "input": "greet.myCall({ name: 'Bob' }, 'Hi')",
                "expected": "Hi Bob",
                "testFn": "function greet(greeting) { return greeting + ' ' + this.name; } return greet.myCall({ name: 'Bob' }, 'Hi');"
              },
              {
                "id": 2,
                "name": "Cleans up temporary property after invocation",
                "input": "Verify no lingering properties left on context",
                "expected": 0,
                "testFn": "const ctx = {}; function test() { return 1; } test.myCall(ctx); return Object.getOwnPropertySymbols(ctx).length;"
              },
              {
                "id": 3,
                "name": "Handles primitive numbers or strings as thisArg",
                "input": "getLen.myCall('hello')",
                "expected": 5,
                "testFn": "function getLen() { return this.length; } return getLen.myCall('hello');"
              }
            ],
            "solutionCode": "Function.prototype.myCall = function(thisArg, ...args) {\n  if (typeof this !== 'function') {\n    throw new TypeError('myCall must be called on a function');\n  }\n  \n  const context = (thisArg === null || thisArg === undefined)\n    ? globalThis\n    : Object(thisArg);\n\n  const fnKey = Symbol('fnKey');\n  context[fnKey] = this;\n\n  try {\n    const result = context[fnKey](...args);\n    return result;\n  } finally {\n    delete context[fnKey];\n  }\n};\n"
          },
          "Hard": {
            "id": "this-hard",
            "title": "Custom 'bind' Polyfill with 'new' Operator Support",
            "difficulty": "Hard",
            "concept": "Currying, Prototype Chaining, and new.target Resolution",
            "description": "Implement `Function.prototype.myBind(thisArg, ...outerArgs)`. It must support partial application (currying), and when the bound function is invoked as a constructor using `new BoundFn()`, the provided `thisArg` MUST be ignored and a new instance inheriting from the original function's prototype must be created.",
            "starterCode": "Function.prototype.myBind = function(thisArg, ...outerArgs) {\n  // TODO: Implement solution\n};\n",
            "interviewTrap": "90% of candidates miss the `new` operator rule: when a bound function is called with `new`, the bound `thisArg` is completely ignored in favor of the newly instantiated object.",
            "testCases": [
              {
                "id": 1,
                "name": "Standard bound invocation with curried arguments",
                "input": "add.myBind(null, 10)(20)",
                "expected": 30,
                "testFn": "function add(a, b) { return a + b; } const add10 = add.myBind(null, 10); return add10(20);"
              },
              {
                "id": 2,
                "name": "Maintains object this context",
                "input": "fn.myBind(user)()",
                "expected": "Alex",
                "testFn": "const user = { name: 'Alex' }; function getName() { return this.name; } return getName.myBind(user)();"
              },
              {
                "id": 3,
                "name": "Supports 'new' operator correctly overriding thisArg",
                "input": "new (Point.myBind({ x: 99 }, 5))(10)",
                "expected": {
                  "x": 5,
                  "y": 10,
                  "isInstance": true
                },
                "testFn": "function Point(x, y) { this.x = x; this.y = y; } const BoundPoint = Point.myBind({ x: 99 }, 5); const pt = new BoundPoint(10); return { x: pt.x, y: pt.y, isInstance: pt instanceof Point };"
              }
            ],
            "solutionCode": "Function.prototype.myBind = function(thisArg, ...outerArgs) {\n  if (typeof this !== 'function') {\n    throw new TypeError('myBind must be called on a function');\n  }\n\n  const originalFn = this;\n\n  function boundFn(...innerArgs) {\n    const isConstructorCall = this instanceof boundFn;\n    const finalContext = isConstructorCall ? this : thisArg;\n    return originalFn.apply(finalContext, [...outerArgs, ...innerArgs]);\n  }\n\n  // Preserve prototype chain for 'new' instantiation\n  if (originalFn.prototype) {\n    boundFn.prototype = Object.create(originalFn.prototype);\n  }\n\n  return boundFn;\n};\n"
          }
        },
        "starterChallenge": {
          "id": "this-basic",
          "title": "Method Callback Context Binder",
          "difficulty": "Basic",
          "concept": "Preserving Object Context when Passing Callbacks",
          "description": "When an object method is passed as a callback (e.g., `setTimeout(obj.method)`), implicit `this` is lost. Implement `bindMethod(obj, methodName)` that returns a wrapper function guaranteeing that `methodName` always executes with `obj` as `this`, preserving any forwarded arguments.",
          "starterCode": "/**\n * Binds an object's method to its owner object.\n */\nfunction bindMethod(obj, methodName) {\n  // TODO: Implement solution\n}\n",
          "interviewTrap": "Extracting a method `const fn = obj.method; fn()` invokes `fn` with default binding (undefined in strict mode), losing all object properties.",
          "testCases": [
            {
              "id": 1,
              "name": "Preserves object property access",
              "input": "bound method accesses this.name",
              "expected": "Antigravity",
              "testFn": "const user = { name: 'Antigravity', getName() { return this.name; } }; const bound = bindMethod(user, 'getName'); return bound();"
            },
            {
              "id": 2,
              "name": "Forwards arguments properly to bound method",
              "input": "bound method passes greeting and punctuation",
              "expected": "Hello, Antigravity!",
              "testFn": "const user = { name: 'Antigravity', greet(prefix, suffix) { return `${prefix}, ${this.name}${suffix}`; } }; const bound = bindMethod(user, 'greet'); return bound('Hello', '!');"
            },
            {
              "id": 3,
              "name": "Maintains binding even when assigned to another variable",
              "input": "const detached = bound; detached()",
              "expected": 42,
              "testFn": "const calc = { value: 42, getVal() { return this.value; } }; const detached = bindMethod(calc, 'getVal'); return detached();"
            }
          ],
          "solutionCode": "/**\n * Binds an object's method to its owner object.\n */\nfunction bindMethod(obj, methodName) {\n  return function(...args) {\n    return obj[methodName].apply(obj, args);\n  };\n}\n"
        },
        "questions": [
          {
            "id": "this-basic",
            "title": "Method Callback Context Binder",
            "difficulty": "Basic",
            "concept": "Preserving Object Context when Passing Callbacks",
            "description": "When an object method is passed as a callback (e.g., `setTimeout(obj.method)`), implicit `this` is lost. Implement `bindMethod(obj, methodName)` that returns a wrapper function guaranteeing that `methodName` always executes with `obj` as `this`, preserving any forwarded arguments.",
            "starterCode": "/**\n * Binds an object's method to its owner object.\n */\nfunction bindMethod(obj, methodName) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Extracting a method `const fn = obj.method; fn()` invokes `fn` with default binding (undefined in strict mode), losing all object properties.",
            "testCases": [
              {
                "id": 1,
                "name": "Preserves object property access",
                "input": "bound method accesses this.name",
                "expected": "Antigravity",
                "testFn": "const user = { name: 'Antigravity', getName() { return this.name; } }; const bound = bindMethod(user, 'getName'); return bound();"
              },
              {
                "id": 2,
                "name": "Forwards arguments properly to bound method",
                "input": "bound method passes greeting and punctuation",
                "expected": "Hello, Antigravity!",
                "testFn": "const user = { name: 'Antigravity', greet(prefix, suffix) { return `${prefix}, ${this.name}${suffix}`; } }; const bound = bindMethod(user, 'greet'); return bound('Hello', '!');"
              },
              {
                "id": 3,
                "name": "Maintains binding even when assigned to another variable",
                "input": "const detached = bound; detached()",
                "expected": 42,
                "testFn": "const calc = { value: 42, getVal() { return this.value; } }; const detached = bindMethod(calc, 'getVal'); return detached();"
              }
            ],
            "solutionCode": "/**\n * Binds an object's method to its owner object.\n */\nfunction bindMethod(obj, methodName) {\n  return function(...args) {\n    return obj[methodName].apply(obj, args);\n  };\n}\n"
          },
          {
            "id": "this-medium",
            "title": "Implement Custom Function.prototype.myCall & myApply",
            "difficulty": "Medium",
            "concept": "Explicit Context Invocation via Property Binding",
            "description": "Implement `myCall(thisArg, ...args)` on `Function.prototype` without using native `.call()`, `.apply()`, or `.bind()`. It must handle null/undefined `thisArg` (falling back to globalThis/window), wrap primitives, and avoid colliding with existing properties on `thisArg` using `Symbol()`.",
            "starterCode": "Function.prototype.myCall = function(thisArg, ...args) {\n  // TODO: Implement solution\n};\n",
            "interviewTrap": "Using a plain string key like `context.__fn__ = this` can overwrite existing properties on the target object. Using `Symbol()` guarantees zero key collision.",
            "testCases": [
              {
                "id": 1,
                "name": "Invokes function with explicit object context",
                "input": "greet.myCall({ name: 'Bob' }, 'Hi')",
                "expected": "Hi Bob",
                "testFn": "function greet(greeting) { return greeting + ' ' + this.name; } return greet.myCall({ name: 'Bob' }, 'Hi');"
              },
              {
                "id": 2,
                "name": "Cleans up temporary property after invocation",
                "input": "Verify no lingering properties left on context",
                "expected": 0,
                "testFn": "const ctx = {}; function test() { return 1; } test.myCall(ctx); return Object.getOwnPropertySymbols(ctx).length;"
              },
              {
                "id": 3,
                "name": "Handles primitive numbers or strings as thisArg",
                "input": "getLen.myCall('hello')",
                "expected": 5,
                "testFn": "function getLen() { return this.length; } return getLen.myCall('hello');"
              }
            ],
            "solutionCode": "Function.prototype.myCall = function(thisArg, ...args) {\n  if (typeof this !== 'function') {\n    throw new TypeError('myCall must be called on a function');\n  }\n  \n  const context = (thisArg === null || thisArg === undefined)\n    ? globalThis\n    : Object(thisArg);\n\n  const fnKey = Symbol('fnKey');\n  context[fnKey] = this;\n\n  try {\n    const result = context[fnKey](...args);\n    return result;\n  } finally {\n    delete context[fnKey];\n  }\n};\n"
          },
          {
            "id": "this-hard",
            "title": "Custom 'bind' Polyfill with 'new' Operator Support",
            "difficulty": "Hard",
            "concept": "Currying, Prototype Chaining, and new.target Resolution",
            "description": "Implement `Function.prototype.myBind(thisArg, ...outerArgs)`. It must support partial application (currying), and when the bound function is invoked as a constructor using `new BoundFn()`, the provided `thisArg` MUST be ignored and a new instance inheriting from the original function's prototype must be created.",
            "starterCode": "Function.prototype.myBind = function(thisArg, ...outerArgs) {\n  // TODO: Implement solution\n};\n",
            "interviewTrap": "90% of candidates miss the `new` operator rule: when a bound function is called with `new`, the bound `thisArg` is completely ignored in favor of the newly instantiated object.",
            "testCases": [
              {
                "id": 1,
                "name": "Standard bound invocation with curried arguments",
                "input": "add.myBind(null, 10)(20)",
                "expected": 30,
                "testFn": "function add(a, b) { return a + b; } const add10 = add.myBind(null, 10); return add10(20);"
              },
              {
                "id": 2,
                "name": "Maintains object this context",
                "input": "fn.myBind(user)()",
                "expected": "Alex",
                "testFn": "const user = { name: 'Alex' }; function getName() { return this.name; } return getName.myBind(user)();"
              },
              {
                "id": 3,
                "name": "Supports 'new' operator correctly overriding thisArg",
                "input": "new (Point.myBind({ x: 99 }, 5))(10)",
                "expected": {
                  "x": 5,
                  "y": 10,
                  "isInstance": true
                },
                "testFn": "function Point(x, y) { this.x = x; this.y = y; } const BoundPoint = Point.myBind({ x: 99 }, 5); const pt = new BoundPoint(10); return { x: pt.x, y: pt.y, isInstance: pt instanceof Point };"
              }
            ],
            "solutionCode": "Function.prototype.myBind = function(thisArg, ...outerArgs) {\n  if (typeof this !== 'function') {\n    throw new TypeError('myBind must be called on a function');\n  }\n\n  const originalFn = this;\n\n  function boundFn(...innerArgs) {\n    const isConstructorCall = this instanceof boundFn;\n    const finalContext = isConstructorCall ? this : thisArg;\n    return originalFn.apply(finalContext, [...outerArgs, ...innerArgs]);\n  }\n\n  // Preserve prototype chain for 'new' instantiation\n  if (originalFn.prototype) {\n    boundFn.prototype = Object.create(originalFn.prototype);\n  }\n\n  return boundFn;\n};\n"
          }
        ]
      }
    ]
  },
  {
    "id": "async-concurrency",
    "category": "2. Asynchronous JS & Concurrency",
    "badge": "Runtime Engine",
    "description": "Master the Event Loop, microtasks vs macrotasks, Promise internals, and async state machines.",
    "topics": [
      {
        "id": "event-loop-queues",
        "title": "Event Loop: Microtasks vs Macrotasks",
        "tag": "Concurrency",
        "summary": "Call Stack, Macrotask Queue (setTimeout/I/O), Microtask Queue (Promise.then/queueMicrotask), and UI render steps.",
        "mentalModel": "The Event Loop continuously checks if the Call Stack is empty. When empty, it DRAINS THE ENTIRE Microtask Queue until empty (even if microtasks schedule more microtasks!) before picking ONE macrotask from the Macrotask Queue.",
        "traps": "Microtask starvation (infinite `Promise.resolve().then(...)` locking the UI), order between `requestAnimationFrame`, `setTimeout(0)`, and nested `then` handlers.",
        "challenges": {
          "Basic": {
            "id": "event-loop-basic",
            "title": "Microtask Runner with queueMicrotask",
            "difficulty": "Basic",
            "concept": "Microtask Dispatch Order vs Synchronous Execution",
            "description": "Implement `runMicrotaskBatch(tasks)` that accepts an array of functions, executes them strictly as microtasks, and returns a Promise that resolves with an array of their results in order.",
            "starterCode": "/**\n * Schedules each task in the microtask queue and gathers results.\n */\nfunction runMicrotaskBatch(tasks) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Assuming `queueMicrotask` executes in the next macrotask turn like `setTimeout`. Microtasks execute immediately upon completion of the current call stack.",
            "testCases": [
              {
                "id": 1,
                "name": "Executes microtasks in parallel and returns results",
                "input": "tasks = [() => 1, () => 2, () => 3]",
                "expected": [
                  1,
                  2,
                  3
                ],
                "testFn": "return runMicrotaskBatch([() => 1, () => 2, () => 3]);"
              },
              {
                "id": 2,
                "name": "Handles empty task list",
                "input": "tasks = []",
                "expected": [],
                "testFn": "return runMicrotaskBatch([]);"
              },
              {
                "id": 3,
                "name": "Executes before setTimeout(0)",
                "input": "microtask order check",
                "expected": [
                  "microtask",
                  "timeout"
                ],
                "testFn": "const log = []; await new Promise(r => { setTimeout(() => { log.push('timeout'); r(); }, 0); queueMicrotask(() => log.push('microtask')); }); return log;"
              }
            ],
            "solutionCode": "/**\n * Schedules each task in the microtask queue and gathers results.\n */\nfunction runMicrotaskBatch(tasks) {\n  return new Promise((resolve) => {\n    const results = [];\n    let completed = 0;\n    \n    if (tasks.length === 0) return resolve([]);\n\n    tasks.forEach((task, index) => {\n      queueMicrotask(() => {\n        results[index] = task();\n        completed++;\n        if (completed === tasks.length) {\n          resolve(results);\n        }\n      });\n    });\n  });\n}\n"
          },
          "Medium": {
            "id": "event-loop-medium",
            "title": "Microtask Batcher (Coalesce Multiple Calls into Single Turn)",
            "difficulty": "Medium",
            "concept": "Event Loop Turn Coalescing & Batch Updating",
            "description": "Build `createBatcher(flushCallback)` that batches multiple synchronous updates and triggers `flushCallback(accumulatedItems)` exactly ONCE in the microtask queue at the end of the current synchronous turn.",
            "starterCode": "function createBatcher(flushCallback) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Calling the flush callback for every item or using `setTimeout` (which introduces a 4ms minimum delay and runs after UI rendering).",
            "testCases": [
              {
                "id": 1,
                "name": "Batches multiple synchronous calls into one flush",
                "input": "add(1), add(2), add(3) synchronously",
                "expected": [
                  [
                    1,
                    2,
                    3
                  ]
                ],
                "testFn": "const flushes = []; const batcher = createBatcher(items => flushes.push(items)); batcher(1); batcher(2); batcher(3); await Promise.resolve(); return flushes;"
              },
              {
                "id": 2,
                "name": "Subsequent turns trigger new independent batches",
                "input": "batch in turn 1 and batch in turn 2",
                "expected": [
                  [
                    10
                  ],
                  [
                    20
                  ]
                ],
                "testFn": "const flushes = []; const batcher = createBatcher(items => flushes.push(items)); batcher(10); await Promise.resolve(); batcher(20); await Promise.resolve(); return flushes;"
              },
              {
                "id": 3,
                "name": "Flush receives full item set in exact insertion order",
                "input": "batch with strings ['a', 'b', 'c']",
                "expected": [
                  "a",
                  "b",
                  "c"
                ],
                "testFn": "let res = null; const batcher = createBatcher(items => { res = items; }); batcher('a'); batcher('b'); batcher('c'); await Promise.resolve(); return res;"
              }
            ],
            "solutionCode": "function createBatcher(flushCallback) {\n  let batch = [];\n  let isScheduled = false;\n\n  return function add(item) {\n    batch.push(item);\n    \n    if (!isScheduled) {\n      isScheduled = true;\n      queueMicrotask(() => {\n        const itemsToFlush = [...batch];\n        batch = [];\n        isScheduled = false;\n        flushCallback(itemsToFlush);\n      });\n    }\n  };\n}\n"
          },
          "Hard": {
            "id": "event-loop-hard",
            "title": "Microtask Starvation Guard & Fair Task Scheduler",
            "difficulty": "Hard",
            "concept": "Microtask Starvation Prevention & Macrotask Interleaving",
            "description": "If recursive microtasks continually schedule more microtasks, the event loop locks up and macrotasks/UI renders never run. Implement `fairScheduler(tasks, maxMicrotasksPerYield)` that executes tasks via microtasks, but yields to a macrotask (`setTimeout`) after `maxMicrotasksPerYield` tasks to prevent UI starvation.",
            "starterCode": "async function fairScheduler(tasks, maxMicrotasksPerYield = 5) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Infinite microtasks (`while(true) queueMicrotask(...)`) cause complete page freeze because the event loop will never leave the microtask checkpoint to service browser renders or user clicks.",
            "testCases": [
              {
                "id": 1,
                "name": "Processes small batch without yielding",
                "input": "3 tasks with yield limit 5",
                "expected": [
                  1,
                  2,
                  3
                ],
                "testFn": "const tasks = [() => 1, () => 2, () => 3]; return fairScheduler(tasks, 5);"
              },
              {
                "id": 2,
                "name": "Processes large batch correctly with yields",
                "input": "10 tasks with yield limit 3",
                "expected": 10,
                "testFn": "const tasks = Array.from({ length: 10 }, (_, i) => () => i); const res = await fairScheduler(tasks, 3); return res.length;"
              },
              {
                "id": 3,
                "name": "Allows interleaved macrotask execution during yields",
                "input": "Interleaved setTimeout fires during execution",
                "expected": true,
                "testFn": "let timerFired = false; setTimeout(() => { timerFired = true; }, 0); const tasks = Array.from({ length: 8 }, () => () => 1); await fairScheduler(tasks, 2); return timerFired;"
              }
            ],
            "solutionCode": "async function fairScheduler(tasks, maxMicrotasksPerYield = 5) {\n  const results = [];\n  let processedInCurrentYield = 0;\n\n  for (let i = 0; i < tasks.length; i++) {\n    if (processedInCurrentYield >= maxMicrotasksPerYield) {\n      // Yield to macrotask queue to allow UI and timer processing\n      await new Promise(resolve => setTimeout(resolve, 0));\n      processedInCurrentYield = 0;\n    }\n    results.push(await tasks[i]());\n    processedInCurrentYield++;\n  }\n\n  return results;\n}\n"
          }
        },
        "starterChallenge": {
          "id": "event-loop-basic",
          "title": "Microtask Runner with queueMicrotask",
          "difficulty": "Basic",
          "concept": "Microtask Dispatch Order vs Synchronous Execution",
          "description": "Implement `runMicrotaskBatch(tasks)` that accepts an array of functions, executes them strictly as microtasks, and returns a Promise that resolves with an array of their results in order.",
          "starterCode": "/**\n * Schedules each task in the microtask queue and gathers results.\n */\nfunction runMicrotaskBatch(tasks) {\n  // TODO: Implement solution\n}\n",
          "interviewTrap": "Assuming `queueMicrotask` executes in the next macrotask turn like `setTimeout`. Microtasks execute immediately upon completion of the current call stack.",
          "testCases": [
            {
              "id": 1,
              "name": "Executes microtasks in parallel and returns results",
              "input": "tasks = [() => 1, () => 2, () => 3]",
              "expected": [
                1,
                2,
                3
              ],
              "testFn": "return runMicrotaskBatch([() => 1, () => 2, () => 3]);"
            },
            {
              "id": 2,
              "name": "Handles empty task list",
              "input": "tasks = []",
              "expected": [],
              "testFn": "return runMicrotaskBatch([]);"
            },
            {
              "id": 3,
              "name": "Executes before setTimeout(0)",
              "input": "microtask order check",
              "expected": [
                "microtask",
                "timeout"
              ],
              "testFn": "const log = []; await new Promise(r => { setTimeout(() => { log.push('timeout'); r(); }, 0); queueMicrotask(() => log.push('microtask')); }); return log;"
            }
          ],
          "solutionCode": "/**\n * Schedules each task in the microtask queue and gathers results.\n */\nfunction runMicrotaskBatch(tasks) {\n  return new Promise((resolve) => {\n    const results = [];\n    let completed = 0;\n    \n    if (tasks.length === 0) return resolve([]);\n\n    tasks.forEach((task, index) => {\n      queueMicrotask(() => {\n        results[index] = task();\n        completed++;\n        if (completed === tasks.length) {\n          resolve(results);\n        }\n      });\n    });\n  });\n}\n"
        },
        "questions": [
          {
            "id": "event-loop-basic",
            "title": "Microtask Runner with queueMicrotask",
            "difficulty": "Basic",
            "concept": "Microtask Dispatch Order vs Synchronous Execution",
            "description": "Implement `runMicrotaskBatch(tasks)` that accepts an array of functions, executes them strictly as microtasks, and returns a Promise that resolves with an array of their results in order.",
            "starterCode": "/**\n * Schedules each task in the microtask queue and gathers results.\n */\nfunction runMicrotaskBatch(tasks) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Assuming `queueMicrotask` executes in the next macrotask turn like `setTimeout`. Microtasks execute immediately upon completion of the current call stack.",
            "testCases": [
              {
                "id": 1,
                "name": "Executes microtasks in parallel and returns results",
                "input": "tasks = [() => 1, () => 2, () => 3]",
                "expected": [
                  1,
                  2,
                  3
                ],
                "testFn": "return runMicrotaskBatch([() => 1, () => 2, () => 3]);"
              },
              {
                "id": 2,
                "name": "Handles empty task list",
                "input": "tasks = []",
                "expected": [],
                "testFn": "return runMicrotaskBatch([]);"
              },
              {
                "id": 3,
                "name": "Executes before setTimeout(0)",
                "input": "microtask order check",
                "expected": [
                  "microtask",
                  "timeout"
                ],
                "testFn": "const log = []; await new Promise(r => { setTimeout(() => { log.push('timeout'); r(); }, 0); queueMicrotask(() => log.push('microtask')); }); return log;"
              }
            ],
            "solutionCode": "/**\n * Schedules each task in the microtask queue and gathers results.\n */\nfunction runMicrotaskBatch(tasks) {\n  return new Promise((resolve) => {\n    const results = [];\n    let completed = 0;\n    \n    if (tasks.length === 0) return resolve([]);\n\n    tasks.forEach((task, index) => {\n      queueMicrotask(() => {\n        results[index] = task();\n        completed++;\n        if (completed === tasks.length) {\n          resolve(results);\n        }\n      });\n    });\n  });\n}\n"
          },
          {
            "id": "event-loop-medium",
            "title": "Microtask Batcher (Coalesce Multiple Calls into Single Turn)",
            "difficulty": "Medium",
            "concept": "Event Loop Turn Coalescing & Batch Updating",
            "description": "Build `createBatcher(flushCallback)` that batches multiple synchronous updates and triggers `flushCallback(accumulatedItems)` exactly ONCE in the microtask queue at the end of the current synchronous turn.",
            "starterCode": "function createBatcher(flushCallback) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Calling the flush callback for every item or using `setTimeout` (which introduces a 4ms minimum delay and runs after UI rendering).",
            "testCases": [
              {
                "id": 1,
                "name": "Batches multiple synchronous calls into one flush",
                "input": "add(1), add(2), add(3) synchronously",
                "expected": [
                  [
                    1,
                    2,
                    3
                  ]
                ],
                "testFn": "const flushes = []; const batcher = createBatcher(items => flushes.push(items)); batcher(1); batcher(2); batcher(3); await Promise.resolve(); return flushes;"
              },
              {
                "id": 2,
                "name": "Subsequent turns trigger new independent batches",
                "input": "batch in turn 1 and batch in turn 2",
                "expected": [
                  [
                    10
                  ],
                  [
                    20
                  ]
                ],
                "testFn": "const flushes = []; const batcher = createBatcher(items => flushes.push(items)); batcher(10); await Promise.resolve(); batcher(20); await Promise.resolve(); return flushes;"
              },
              {
                "id": 3,
                "name": "Flush receives full item set in exact insertion order",
                "input": "batch with strings ['a', 'b', 'c']",
                "expected": [
                  "a",
                  "b",
                  "c"
                ],
                "testFn": "let res = null; const batcher = createBatcher(items => { res = items; }); batcher('a'); batcher('b'); batcher('c'); await Promise.resolve(); return res;"
              }
            ],
            "solutionCode": "function createBatcher(flushCallback) {\n  let batch = [];\n  let isScheduled = false;\n\n  return function add(item) {\n    batch.push(item);\n    \n    if (!isScheduled) {\n      isScheduled = true;\n      queueMicrotask(() => {\n        const itemsToFlush = [...batch];\n        batch = [];\n        isScheduled = false;\n        flushCallback(itemsToFlush);\n      });\n    }\n  };\n}\n"
          },
          {
            "id": "event-loop-hard",
            "title": "Microtask Starvation Guard & Fair Task Scheduler",
            "difficulty": "Hard",
            "concept": "Microtask Starvation Prevention & Macrotask Interleaving",
            "description": "If recursive microtasks continually schedule more microtasks, the event loop locks up and macrotasks/UI renders never run. Implement `fairScheduler(tasks, maxMicrotasksPerYield)` that executes tasks via microtasks, but yields to a macrotask (`setTimeout`) after `maxMicrotasksPerYield` tasks to prevent UI starvation.",
            "starterCode": "async function fairScheduler(tasks, maxMicrotasksPerYield = 5) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Infinite microtasks (`while(true) queueMicrotask(...)`) cause complete page freeze because the event loop will never leave the microtask checkpoint to service browser renders or user clicks.",
            "testCases": [
              {
                "id": 1,
                "name": "Processes small batch without yielding",
                "input": "3 tasks with yield limit 5",
                "expected": [
                  1,
                  2,
                  3
                ],
                "testFn": "const tasks = [() => 1, () => 2, () => 3]; return fairScheduler(tasks, 5);"
              },
              {
                "id": 2,
                "name": "Processes large batch correctly with yields",
                "input": "10 tasks with yield limit 3",
                "expected": 10,
                "testFn": "const tasks = Array.from({ length: 10 }, (_, i) => () => i); const res = await fairScheduler(tasks, 3); return res.length;"
              },
              {
                "id": 3,
                "name": "Allows interleaved macrotask execution during yields",
                "input": "Interleaved setTimeout fires during execution",
                "expected": true,
                "testFn": "let timerFired = false; setTimeout(() => { timerFired = true; }, 0); const tasks = Array.from({ length: 8 }, () => () => 1); await fairScheduler(tasks, 2); return timerFired;"
              }
            ],
            "solutionCode": "async function fairScheduler(tasks, maxMicrotasksPerYield = 5) {\n  const results = [];\n  let processedInCurrentYield = 0;\n\n  for (let i = 0; i < tasks.length; i++) {\n    if (processedInCurrentYield >= maxMicrotasksPerYield) {\n      // Yield to macrotask queue to allow UI and timer processing\n      await new Promise(resolve => setTimeout(resolve, 0));\n      processedInCurrentYield = 0;\n    }\n    results.push(await tasks[i]());\n    processedInCurrentYield++;\n  }\n\n  return results;\n}\n"
          }
        ]
      },
      {
        "id": "promise-mechanics",
        "title": "Promise Internals & Concurrency Combinators",
        "tag": "Async",
        "summary": "Promise state transitions, chaining return values vs thrown errors, implementing Promise.all / allSettled / race / any.",
        "mentalModel": "A Promise is a state machine: [Pending] -> [Fulfilled] or [Rejected]. Once settled, state is immutable. Handlers registered via `.then` or `.catch` are always dispatched asynchronously as microtasks.",
        "traps": "Forgotten `return` inside `.then` causing unhandled promises, uncaught rejections with `Promise.all` fast-failing, and handling non-promise values passed to combinators.",
        "challenges": {
          "Basic": {
            "id": "promise-basic",
            "title": "Safe Promise Timeout Wrapper",
            "difficulty": "Basic",
            "concept": "Promise Race & Timeout Handling",
            "description": "Implement `withTimeout(promise, ms, timeoutErrorMsg)` that returns a Promise that rejects with an Error(`timeoutErrorMsg`) if `promise` does not settle within `ms` milliseconds.",
            "starterCode": "function withTimeout(promise, ms, timeoutErrorMsg = 'Operation timed out') {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Not clearing the timer when the primary promise resolves or rejects, leaving open handles in server environments.",
            "testCases": [
              {
                "id": 1,
                "name": "Resolves if promise completes before timeout",
                "input": "fast promise (10ms) with 100ms timeout",
                "expected": "fast-result",
                "testFn": "const p = new Promise(r => setTimeout(() => r('fast-result'), 10)); return withTimeout(p, 100);"
              },
              {
                "id": 2,
                "name": "Rejects with timeout error if operation takes too long",
                "input": "slow promise (100ms) with 20ms timeout",
                "expected": "Timed out!",
                "testFn": "const p = new Promise(r => setTimeout(() => r('slow'), 100)); try { await withTimeout(p, 20, 'Timed out!'); return 'FAIL'; } catch (e) { return e.message; }"
              },
              {
                "id": 3,
                "name": "Preserves original promise rejection",
                "input": "rejecting promise before timeout",
                "expected": "original-error",
                "testFn": "const p = Promise.reject(new Error('original-error')); try { await withTimeout(p, 100); return 'FAIL'; } catch (e) { return e.message; }"
              }
            ],
            "solutionCode": "function withTimeout(promise, ms, timeoutErrorMsg = 'Operation timed out') {\n  return Promise.race([\n    promise,\n    new Promise((_, reject) => {\n      setTimeout(() => reject(new Error(timeoutErrorMsg)), ms);\n    })\n  ]);\n}\n"
          },
          "Medium": {
            "id": "promise-medium",
            "title": "Implement Custom Promise.allSettled",
            "difficulty": "Medium",
            "concept": "Concurrency Aggregation & Error Resilience",
            "description": "Implement `myPromiseAllSettled(promises)` without using native `Promise.allSettled`. It takes an iterable of promises (or non-promise values) and returns a promise that resolves with an array of objects `{ status: 'fulfilled', value }` or `{ status: 'rejected', reason }` after ALL promises settle.",
            "starterCode": "function myPromiseAllSettled(promises) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Using `Promise.all` which short-circuits on the first rejection. `allSettled` must wait for every promise regardless of success or failure.",
            "testCases": [
              {
                "id": 1,
                "name": "Handles mix of resolved and rejected promises",
                "input": "[Promise.resolve(1), Promise.reject('err'), 3]",
                "expected": [
                  {
                    "status": "fulfilled",
                    "value": 1
                  },
                  {
                    "status": "rejected",
                    "reason": "err"
                  },
                  {
                    "status": "fulfilled",
                    "value": 3
                  }
                ],
                "testFn": "return myPromiseAllSettled([Promise.resolve(1), Promise.reject('err'), 3]);"
              },
              {
                "id": 2,
                "name": "Handles empty array immediately",
                "input": "[]",
                "expected": [],
                "testFn": "return myPromiseAllSettled([]);"
              },
              {
                "id": 3,
                "name": "Preserves exact order of input results",
                "input": "[slow promise, fast promise]",
                "expected": [
                  "slow",
                  "fast"
                ],
                "testFn": "const p1 = new Promise(r => setTimeout(() => r('slow'), 30)); const p2 = new Promise(r => setTimeout(() => r('fast'), 5)); const res = await myPromiseAllSettled([p1, p2]); return res.map(r => r.value);"
              }
            ],
            "solutionCode": "function myPromiseAllSettled(promises) {\n  const items = Array.from(promises);\n  if (items.length === 0) return Promise.resolve([]);\n\n  return new Promise((resolve) => {\n    const results = [];\n    let completed = 0;\n\n    items.forEach((item, index) => {\n      Promise.resolve(item)\n        .then(value => {\n          results[index] = { status: 'fulfilled', value };\n        })\n        .catch(reason => {\n          results[index] = { status: 'rejected', reason };\n        })\n        .finally(() => {\n          completed++;\n          if (completed === items.length) {\n            resolve(results);\n          }\n        });\n    });\n  });\n}\n"
          },
          "Hard": {
            "id": "promise-hard",
            "title": "Throttled Promise Concurrency Pool",
            "difficulty": "Hard",
            "concept": "Asynchronous Worker Queue & Concurrency Limiting",
            "description": "Implement `promisePool(taskFns, concurrencyLimit)` that takes an array of promise-returning functions and executes them with at most `concurrencyLimit` tasks running concurrently. Returns a Promise resolving to an array of results in the original order.",
            "starterCode": "async function promisePool(taskFns, concurrencyLimit = 2) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Starting all promises simultaneously using `Promise.all(tasks.map(fn => fn()))` will overwhelm APIs or databases. Running workers that pull from a shared queue guarantees strict concurrency bounds.",
            "testCases": [
              {
                "id": 1,
                "name": "Executes all tasks and preserves result order",
                "input": "5 tasks with limit 2",
                "expected": [
                  0,
                  1,
                  2,
                  3,
                  4
                ],
                "testFn": "const tasks = [0, 1, 2, 3, 4].map(n => () => Promise.resolve(n)); return promisePool(tasks, 2);"
              },
              {
                "id": 2,
                "name": "Enforces max concurrency limit",
                "input": "Never exceeds limit of 2 active tasks",
                "expected": true,
                "testFn": "let active = 0; let maxActive = 0; const makeTask = () => async () => { active++; maxActive = Math.max(maxActive, active); await new Promise(r => setTimeout(r, 15)); active--; return 1; }; const tasks = [makeTask(), makeTask(), makeTask(), makeTask()]; await promisePool(tasks, 2); return maxActive <= 2;"
              },
              {
                "id": 3,
                "name": "Handles concurrency limit larger than task count",
                "input": "2 tasks with limit 10",
                "expected": [
                  "a",
                  "b"
                ],
                "testFn": "return promisePool([() => Promise.resolve('a'), () => Promise.resolve('b')], 10);"
              }
            ],
            "solutionCode": "async function promisePool(taskFns, concurrencyLimit = 2) {\n  const results = new Array(taskFns.length);\n  let nextIndex = 0;\n\n  async function worker() {\n    while (nextIndex < taskFns.length) {\n      const currentIndex = nextIndex++;\n      results[currentIndex] = await taskFns[currentIndex]();\n    }\n  }\n\n  const workers = Array.from(\n    { length: Math.min(concurrencyLimit, taskFns.length) },\n    () => worker()\n  );\n\n  await Promise.all(workers);\n  return results;\n}\n"
          }
        },
        "starterChallenge": {
          "id": "promise-basic",
          "title": "Safe Promise Timeout Wrapper",
          "difficulty": "Basic",
          "concept": "Promise Race & Timeout Handling",
          "description": "Implement `withTimeout(promise, ms, timeoutErrorMsg)` that returns a Promise that rejects with an Error(`timeoutErrorMsg`) if `promise` does not settle within `ms` milliseconds.",
          "starterCode": "function withTimeout(promise, ms, timeoutErrorMsg = 'Operation timed out') {\n  // TODO: Implement solution\n}\n",
          "interviewTrap": "Not clearing the timer when the primary promise resolves or rejects, leaving open handles in server environments.",
          "testCases": [
            {
              "id": 1,
              "name": "Resolves if promise completes before timeout",
              "input": "fast promise (10ms) with 100ms timeout",
              "expected": "fast-result",
              "testFn": "const p = new Promise(r => setTimeout(() => r('fast-result'), 10)); return withTimeout(p, 100);"
            },
            {
              "id": 2,
              "name": "Rejects with timeout error if operation takes too long",
              "input": "slow promise (100ms) with 20ms timeout",
              "expected": "Timed out!",
              "testFn": "const p = new Promise(r => setTimeout(() => r('slow'), 100)); try { await withTimeout(p, 20, 'Timed out!'); return 'FAIL'; } catch (e) { return e.message; }"
            },
            {
              "id": 3,
              "name": "Preserves original promise rejection",
              "input": "rejecting promise before timeout",
              "expected": "original-error",
              "testFn": "const p = Promise.reject(new Error('original-error')); try { await withTimeout(p, 100); return 'FAIL'; } catch (e) { return e.message; }"
            }
          ],
          "solutionCode": "function withTimeout(promise, ms, timeoutErrorMsg = 'Operation timed out') {\n  return Promise.race([\n    promise,\n    new Promise((_, reject) => {\n      setTimeout(() => reject(new Error(timeoutErrorMsg)), ms);\n    })\n  ]);\n}\n"
        },
        "questions": [
          {
            "id": "promise-basic",
            "title": "Safe Promise Timeout Wrapper",
            "difficulty": "Basic",
            "concept": "Promise Race & Timeout Handling",
            "description": "Implement `withTimeout(promise, ms, timeoutErrorMsg)` that returns a Promise that rejects with an Error(`timeoutErrorMsg`) if `promise` does not settle within `ms` milliseconds.",
            "starterCode": "function withTimeout(promise, ms, timeoutErrorMsg = 'Operation timed out') {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Not clearing the timer when the primary promise resolves or rejects, leaving open handles in server environments.",
            "testCases": [
              {
                "id": 1,
                "name": "Resolves if promise completes before timeout",
                "input": "fast promise (10ms) with 100ms timeout",
                "expected": "fast-result",
                "testFn": "const p = new Promise(r => setTimeout(() => r('fast-result'), 10)); return withTimeout(p, 100);"
              },
              {
                "id": 2,
                "name": "Rejects with timeout error if operation takes too long",
                "input": "slow promise (100ms) with 20ms timeout",
                "expected": "Timed out!",
                "testFn": "const p = new Promise(r => setTimeout(() => r('slow'), 100)); try { await withTimeout(p, 20, 'Timed out!'); return 'FAIL'; } catch (e) { return e.message; }"
              },
              {
                "id": 3,
                "name": "Preserves original promise rejection",
                "input": "rejecting promise before timeout",
                "expected": "original-error",
                "testFn": "const p = Promise.reject(new Error('original-error')); try { await withTimeout(p, 100); return 'FAIL'; } catch (e) { return e.message; }"
              }
            ],
            "solutionCode": "function withTimeout(promise, ms, timeoutErrorMsg = 'Operation timed out') {\n  return Promise.race([\n    promise,\n    new Promise((_, reject) => {\n      setTimeout(() => reject(new Error(timeoutErrorMsg)), ms);\n    })\n  ]);\n}\n"
          },
          {
            "id": "promise-medium",
            "title": "Implement Custom Promise.allSettled",
            "difficulty": "Medium",
            "concept": "Concurrency Aggregation & Error Resilience",
            "description": "Implement `myPromiseAllSettled(promises)` without using native `Promise.allSettled`. It takes an iterable of promises (or non-promise values) and returns a promise that resolves with an array of objects `{ status: 'fulfilled', value }` or `{ status: 'rejected', reason }` after ALL promises settle.",
            "starterCode": "function myPromiseAllSettled(promises) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Using `Promise.all` which short-circuits on the first rejection. `allSettled` must wait for every promise regardless of success or failure.",
            "testCases": [
              {
                "id": 1,
                "name": "Handles mix of resolved and rejected promises",
                "input": "[Promise.resolve(1), Promise.reject('err'), 3]",
                "expected": [
                  {
                    "status": "fulfilled",
                    "value": 1
                  },
                  {
                    "status": "rejected",
                    "reason": "err"
                  },
                  {
                    "status": "fulfilled",
                    "value": 3
                  }
                ],
                "testFn": "return myPromiseAllSettled([Promise.resolve(1), Promise.reject('err'), 3]);"
              },
              {
                "id": 2,
                "name": "Handles empty array immediately",
                "input": "[]",
                "expected": [],
                "testFn": "return myPromiseAllSettled([]);"
              },
              {
                "id": 3,
                "name": "Preserves exact order of input results",
                "input": "[slow promise, fast promise]",
                "expected": [
                  "slow",
                  "fast"
                ],
                "testFn": "const p1 = new Promise(r => setTimeout(() => r('slow'), 30)); const p2 = new Promise(r => setTimeout(() => r('fast'), 5)); const res = await myPromiseAllSettled([p1, p2]); return res.map(r => r.value);"
              }
            ],
            "solutionCode": "function myPromiseAllSettled(promises) {\n  const items = Array.from(promises);\n  if (items.length === 0) return Promise.resolve([]);\n\n  return new Promise((resolve) => {\n    const results = [];\n    let completed = 0;\n\n    items.forEach((item, index) => {\n      Promise.resolve(item)\n        .then(value => {\n          results[index] = { status: 'fulfilled', value };\n        })\n        .catch(reason => {\n          results[index] = { status: 'rejected', reason };\n        })\n        .finally(() => {\n          completed++;\n          if (completed === items.length) {\n            resolve(results);\n          }\n        });\n    });\n  });\n}\n"
          },
          {
            "id": "promise-hard",
            "title": "Throttled Promise Concurrency Pool",
            "difficulty": "Hard",
            "concept": "Asynchronous Worker Queue & Concurrency Limiting",
            "description": "Implement `promisePool(taskFns, concurrencyLimit)` that takes an array of promise-returning functions and executes them with at most `concurrencyLimit` tasks running concurrently. Returns a Promise resolving to an array of results in the original order.",
            "starterCode": "async function promisePool(taskFns, concurrencyLimit = 2) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Starting all promises simultaneously using `Promise.all(tasks.map(fn => fn()))` will overwhelm APIs or databases. Running workers that pull from a shared queue guarantees strict concurrency bounds.",
            "testCases": [
              {
                "id": 1,
                "name": "Executes all tasks and preserves result order",
                "input": "5 tasks with limit 2",
                "expected": [
                  0,
                  1,
                  2,
                  3,
                  4
                ],
                "testFn": "const tasks = [0, 1, 2, 3, 4].map(n => () => Promise.resolve(n)); return promisePool(tasks, 2);"
              },
              {
                "id": 2,
                "name": "Enforces max concurrency limit",
                "input": "Never exceeds limit of 2 active tasks",
                "expected": true,
                "testFn": "let active = 0; let maxActive = 0; const makeTask = () => async () => { active++; maxActive = Math.max(maxActive, active); await new Promise(r => setTimeout(r, 15)); active--; return 1; }; const tasks = [makeTask(), makeTask(), makeTask(), makeTask()]; await promisePool(tasks, 2); return maxActive <= 2;"
              },
              {
                "id": 3,
                "name": "Handles concurrency limit larger than task count",
                "input": "2 tasks with limit 10",
                "expected": [
                  "a",
                  "b"
                ],
                "testFn": "return promisePool([() => Promise.resolve('a'), () => Promise.resolve('b')], 10);"
              }
            ],
            "solutionCode": "async function promisePool(taskFns, concurrencyLimit = 2) {\n  const results = new Array(taskFns.length);\n  let nextIndex = 0;\n\n  async function worker() {\n    while (nextIndex < taskFns.length) {\n      const currentIndex = nextIndex++;\n      results[currentIndex] = await taskFns[currentIndex]();\n    }\n  }\n\n  const workers = Array.from(\n    { length: Math.min(concurrencyLimit, taskFns.length) },\n    () => worker()\n  );\n\n  await Promise.all(workers);\n  return results;\n}\n"
          }
        ]
      },
      {
        "id": "async-await-under-the-hood",
        "title": "Async/Await as Generators + Promise Runners",
        "tag": "Async Internals",
        "summary": "Babel/TypeScript transpilation of async/await into `function*` and automatic Promise driver.",
        "mentalModel": "Under the hood, `async/await` is syntactic sugar over Generator functions (`function*`) yielded to a coroutine runner that wraps each yielded value in `Promise.resolve()` and calls `generator.next(val)` or `generator.throw(err)`.",
        "traps": "Sequential `await` in loops destroying parallelism (`for...of` vs `Promise.all`), unhandled errors silently terminating async chains.",
        "challenges": {
          "Basic": {
            "id": "generators-basic",
            "title": "Infinite Sequence Generator with Step",
            "difficulty": "Basic",
            "concept": "Generator Protocol & Yield Delegation",
            "description": "Implement a generator function `stepSequence(start, step, max)` that yields numbers starting at `start`, incrementing by `step`, until reaching or exceeding `max`.",
            "starterCode": "function* stepSequence(start = 0, step = 1, max = 10) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Forgetting that generators are lazy; calling `stepSequence()` does not execute code until `.next()` is called.",
            "testCases": [
              {
                "id": 1,
                "name": "Generates correct sequence from 0 to 6 with step 2",
                "input": "stepSequence(0, 2, 6)",
                "expected": [
                  0,
                  2,
                  4,
                  6
                ],
                "testFn": "return Array.from(stepSequence(0, 2, 6));"
              },
              {
                "id": 2,
                "name": "Terminates when start > max",
                "input": "stepSequence(10, 1, 5)",
                "expected": [],
                "testFn": "return Array.from(stepSequence(10, 1, 5));"
              },
              {
                "id": 3,
                "name": "Supports manual .next() consumption",
                "input": "gen.next().value",
                "expected": 5,
                "testFn": "const gen = stepSequence(5, 5, 20); return gen.next().value;"
              }
            ],
            "solutionCode": "function* stepSequence(start = 0, step = 1, max = 10) {\n  let current = start;\n  while (current <= max) {\n    yield current;\n    current += step;\n  }\n}\n"
          },
          "Medium": {
            "id": "generators-medium",
            "title": "Async Pipeline Generator",
            "difficulty": "Medium",
            "concept": "Pipelining Asynchronous Generator Streams",
            "description": "Implement an async generator `asyncTransformStream(items, transformFn)` that consumes an array of items, applies async `transformFn(item)` to each sequentially, and yields each result.",
            "starterCode": "async function* asyncTransformStream(items, transformFn) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Using `items.forEach(async ...)` inside an async generator does not pause generator iteration properly.",
            "testCases": [
              {
                "id": 1,
                "name": "Transforms and yields items sequentially",
                "input": "async double [1, 2, 3]",
                "expected": [
                  2,
                  4,
                  6
                ],
                "testFn": "const res = []; for await (const val of asyncTransformStream([1, 2, 3], async x => x * 2)) { res.push(val); } return res;"
              },
              {
                "id": 2,
                "name": "Handles empty array stream",
                "input": "empty array",
                "expected": [],
                "testFn": "const res = []; for await (const val of asyncTransformStream([], async x => x)) { res.push(val); } return res;"
              },
              {
                "id": 3,
                "name": "Handles async delays between yields",
                "input": "async delayed transform",
                "expected": [
                  "A",
                  "B"
                ],
                "testFn": "const res = []; const delay = ms => new Promise(r => setTimeout(r, ms)); for await (const v of asyncTransformStream(['a', 'b'], async s => { await delay(5); return s.toUpperCase(); })) { res.push(v); } return res;"
              }
            ],
            "solutionCode": "async function* asyncTransformStream(items, transformFn) {\n  for (const item of items) {\n    const transformed = await transformFn(item);\n    yield transformed;\n  }\n}\n"
          },
          "Hard": {
            "id": "generators-hard",
            "title": "Implement 'co' / asyncToGenerator Coroutine Runner",
            "difficulty": "Hard",
            "concept": "Transpilation of Async/Await to Generators",
            "description": "Implement `runCoroutine(generatorFactory)` which takes a generator function yielding Promises, steps through each yield sequentially passing resolved values into `.next(val)` and rejected errors into `.throw(err)`, and returns a Promise resolving to the generator's final return value.",
            "starterCode": "function runCoroutine(genFactory) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "This is the exact polyfill Babel generates for `async/await`. Candidates often fail to handle generator `.throw(err)` when a yielded promise rejects.",
            "testCases": [
              {
                "id": 1,
                "name": "Steps through yielded promises sequentially",
                "input": "yield promise -> yield promise -> return sum",
                "expected": 30,
                "testFn": "return runCoroutine(function* () { const a = yield Promise.resolve(10); const b = yield Promise.resolve(20); return a + b; });"
              },
              {
                "id": 2,
                "name": "Catches thrown errors inside generator try/catch",
                "input": "yield rejecting promise caught by generator try/catch",
                "expected": "caught-error",
                "testFn": "return runCoroutine(function* () { try { yield Promise.reject(new Error('fail')); } catch (e) { return 'caught-error'; } });"
              },
              {
                "id": 3,
                "name": "Propagates unhandled rejection to returned promise",
                "input": "unhandled rejected yield rejects coroutine promise",
                "expected": "unhandled-boom",
                "testFn": "try { await runCoroutine(function* () { yield Promise.reject(new Error('unhandled-boom')); }); return 'FAIL'; } catch (e) { return e.message; }"
              }
            ],
            "solutionCode": "function runCoroutine(genFactory) {\n  return new Promise((resolve, reject) => {\n    const gen = genFactory();\n\n    function step(nextFn) {\n      let result;\n      try {\n        result = nextFn();\n      } catch (err) {\n        return reject(err);\n      }\n\n      if (result.done) {\n        return resolve(result.value);\n      }\n\n      Promise.resolve(result.value)\n        .then(value => step(() => gen.next(value)))\n        .catch(err => step(() => gen.throw(err)));\n    }\n\n    step(() => gen.next());\n  });\n}\n"
          }
        },
        "starterChallenge": {
          "id": "generators-basic",
          "title": "Infinite Sequence Generator with Step",
          "difficulty": "Basic",
          "concept": "Generator Protocol & Yield Delegation",
          "description": "Implement a generator function `stepSequence(start, step, max)` that yields numbers starting at `start`, incrementing by `step`, until reaching or exceeding `max`.",
          "starterCode": "function* stepSequence(start = 0, step = 1, max = 10) {\n  // TODO: Implement solution\n}\n",
          "interviewTrap": "Forgetting that generators are lazy; calling `stepSequence()` does not execute code until `.next()` is called.",
          "testCases": [
            {
              "id": 1,
              "name": "Generates correct sequence from 0 to 6 with step 2",
              "input": "stepSequence(0, 2, 6)",
              "expected": [
                0,
                2,
                4,
                6
              ],
              "testFn": "return Array.from(stepSequence(0, 2, 6));"
            },
            {
              "id": 2,
              "name": "Terminates when start > max",
              "input": "stepSequence(10, 1, 5)",
              "expected": [],
              "testFn": "return Array.from(stepSequence(10, 1, 5));"
            },
            {
              "id": 3,
              "name": "Supports manual .next() consumption",
              "input": "gen.next().value",
              "expected": 5,
              "testFn": "const gen = stepSequence(5, 5, 20); return gen.next().value;"
            }
          ],
          "solutionCode": "function* stepSequence(start = 0, step = 1, max = 10) {\n  let current = start;\n  while (current <= max) {\n    yield current;\n    current += step;\n  }\n}\n"
        },
        "questions": [
          {
            "id": "generators-basic",
            "title": "Infinite Sequence Generator with Step",
            "difficulty": "Basic",
            "concept": "Generator Protocol & Yield Delegation",
            "description": "Implement a generator function `stepSequence(start, step, max)` that yields numbers starting at `start`, incrementing by `step`, until reaching or exceeding `max`.",
            "starterCode": "function* stepSequence(start = 0, step = 1, max = 10) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Forgetting that generators are lazy; calling `stepSequence()` does not execute code until `.next()` is called.",
            "testCases": [
              {
                "id": 1,
                "name": "Generates correct sequence from 0 to 6 with step 2",
                "input": "stepSequence(0, 2, 6)",
                "expected": [
                  0,
                  2,
                  4,
                  6
                ],
                "testFn": "return Array.from(stepSequence(0, 2, 6));"
              },
              {
                "id": 2,
                "name": "Terminates when start > max",
                "input": "stepSequence(10, 1, 5)",
                "expected": [],
                "testFn": "return Array.from(stepSequence(10, 1, 5));"
              },
              {
                "id": 3,
                "name": "Supports manual .next() consumption",
                "input": "gen.next().value",
                "expected": 5,
                "testFn": "const gen = stepSequence(5, 5, 20); return gen.next().value;"
              }
            ],
            "solutionCode": "function* stepSequence(start = 0, step = 1, max = 10) {\n  let current = start;\n  while (current <= max) {\n    yield current;\n    current += step;\n  }\n}\n"
          },
          {
            "id": "generators-medium",
            "title": "Async Pipeline Generator",
            "difficulty": "Medium",
            "concept": "Pipelining Asynchronous Generator Streams",
            "description": "Implement an async generator `asyncTransformStream(items, transformFn)` that consumes an array of items, applies async `transformFn(item)` to each sequentially, and yields each result.",
            "starterCode": "async function* asyncTransformStream(items, transformFn) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Using `items.forEach(async ...)` inside an async generator does not pause generator iteration properly.",
            "testCases": [
              {
                "id": 1,
                "name": "Transforms and yields items sequentially",
                "input": "async double [1, 2, 3]",
                "expected": [
                  2,
                  4,
                  6
                ],
                "testFn": "const res = []; for await (const val of asyncTransformStream([1, 2, 3], async x => x * 2)) { res.push(val); } return res;"
              },
              {
                "id": 2,
                "name": "Handles empty array stream",
                "input": "empty array",
                "expected": [],
                "testFn": "const res = []; for await (const val of asyncTransformStream([], async x => x)) { res.push(val); } return res;"
              },
              {
                "id": 3,
                "name": "Handles async delays between yields",
                "input": "async delayed transform",
                "expected": [
                  "A",
                  "B"
                ],
                "testFn": "const res = []; const delay = ms => new Promise(r => setTimeout(r, ms)); for await (const v of asyncTransformStream(['a', 'b'], async s => { await delay(5); return s.toUpperCase(); })) { res.push(v); } return res;"
              }
            ],
            "solutionCode": "async function* asyncTransformStream(items, transformFn) {\n  for (const item of items) {\n    const transformed = await transformFn(item);\n    yield transformed;\n  }\n}\n"
          },
          {
            "id": "generators-hard",
            "title": "Implement 'co' / asyncToGenerator Coroutine Runner",
            "difficulty": "Hard",
            "concept": "Transpilation of Async/Await to Generators",
            "description": "Implement `runCoroutine(generatorFactory)` which takes a generator function yielding Promises, steps through each yield sequentially passing resolved values into `.next(val)` and rejected errors into `.throw(err)`, and returns a Promise resolving to the generator's final return value.",
            "starterCode": "function runCoroutine(genFactory) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "This is the exact polyfill Babel generates for `async/await`. Candidates often fail to handle generator `.throw(err)` when a yielded promise rejects.",
            "testCases": [
              {
                "id": 1,
                "name": "Steps through yielded promises sequentially",
                "input": "yield promise -> yield promise -> return sum",
                "expected": 30,
                "testFn": "return runCoroutine(function* () { const a = yield Promise.resolve(10); const b = yield Promise.resolve(20); return a + b; });"
              },
              {
                "id": 2,
                "name": "Catches thrown errors inside generator try/catch",
                "input": "yield rejecting promise caught by generator try/catch",
                "expected": "caught-error",
                "testFn": "return runCoroutine(function* () { try { yield Promise.reject(new Error('fail')); } catch (e) { return 'caught-error'; } });"
              },
              {
                "id": 3,
                "name": "Propagates unhandled rejection to returned promise",
                "input": "unhandled rejected yield rejects coroutine promise",
                "expected": "unhandled-boom",
                "testFn": "try { await runCoroutine(function* () { yield Promise.reject(new Error('unhandled-boom')); }); return 'FAIL'; } catch (e) { return e.message; }"
              }
            ],
            "solutionCode": "function runCoroutine(genFactory) {\n  return new Promise((resolve, reject) => {\n    const gen = genFactory();\n\n    function step(nextFn) {\n      let result;\n      try {\n        result = nextFn();\n      } catch (err) {\n        return reject(err);\n      }\n\n      if (result.done) {\n        return resolve(result.value);\n      }\n\n      Promise.resolve(result.value)\n        .then(value => step(() => gen.next(value)))\n        .catch(err => step(() => gen.throw(err)));\n    }\n\n    step(() => gen.next());\n  });\n}\n"
          }
        ]
      }
    ]
  },
  {
    "id": "prototypes-and-types",
    "category": "3. Prototypes, Objects & Type System",
    "badge": "Object Model",
    "description": "Deep dive into prototype chains, inheritance, type coercion rules, and object property descriptors.",
    "topics": [
      {
        "id": "prototype-chain",
        "title": "Prototype Chain & Prototypal Inheritance",
        "tag": "Object Model",
        "summary": "`__proto__`, `prototype`, `Object.create`, `instanceof` algorithm, and prototype property shadowing.",
        "mentalModel": "Every JS object has an internal `[[Prototype]]` link. Property lookup walks this chain until the property is found or `null` is reached (`Object.prototype.__proto__ === null`). Modifying a property on an instance creates an 'own property' shadowing the prototype's property.",
        "traps": "`instanceof` breaking across iframes, mutating `Array.prototype` causing performance de-optimizations, and confusion between a function's `.prototype` property and an object's `[[Prototype]]`.",
        "challenges": {
          "Basic": {
            "id": "proto-basic",
            "title": "Prototype Chain Walker & Distance Calculator",
            "difficulty": "Basic",
            "concept": "[[Prototype]] Traversal to Object.prototype and null",
            "description": "Implement `getPrototypeDepth(obj)` that traverses an object's prototype chain and returns the number of hops until `null` is reached. If `obj` is null or undefined, return 0.",
            "starterCode": "function getPrototypeDepth(obj) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Using `__proto__` directly is deprecated. Always prefer `Object.getPrototypeOf(obj)`.",
            "testCases": [
              {
                "id": 1,
                "name": "Standard object literal has depth of 1 (Object.prototype -> null)",
                "input": "getPrototypeDepth({})",
                "expected": 1,
                "testFn": "return getPrototypeDepth({});"
              },
              {
                "id": 2,
                "name": "Object created with Object.create(null) has depth 0",
                "input": "getPrototypeDepth(Object.create(null))",
                "expected": 0,
                "testFn": "return getPrototypeDepth(Object.create(null));"
              },
              {
                "id": 3,
                "name": "Inherited chain depth reflects hierarchy",
                "input": "grandchild -> parent -> Object.prototype -> null",
                "expected": 2,
                "testFn": "const parent = {}; const child = Object.create(parent); return getPrototypeDepth(child);"
              }
            ],
            "solutionCode": "function getPrototypeDepth(obj) {\n  if (obj === null || obj === undefined) return 0;\n  let depth = 0;\n  let curr = Object.getPrototypeOf(obj);\n  while (curr !== null) {\n    depth++;\n    curr = Object.getPrototypeOf(curr);\n  }\n  return depth;\n}\n"
          },
          "Medium": {
            "id": "proto-medium",
            "title": "Implement Custom 'myInstanceOf' Operator",
            "difficulty": "Medium",
            "concept": "ECMAScript instanceof Algorithm & Prototype Comparison",
            "description": "Implement `myInstanceOf(instance, Constructor)` that mimics the native `instanceof` operator by walking `instance`'s prototype chain checking for `Constructor.prototype`.",
            "starterCode": "function myInstanceOf(instance, Constructor) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Primitives (`myInstanceOf('string', String)`) return false because `instanceof` only checks object instances, not primitive values.",
            "testCases": [
              {
                "id": 1,
                "name": "Detects standard instance accurately",
                "input": "myInstanceOf([], Array)",
                "expected": true,
                "testFn": "return myInstanceOf([], Array);"
              },
              {
                "id": 2,
                "name": "Walks up multiple prototype inheritance tiers",
                "input": "myInstanceOf([], Object)",
                "expected": true,
                "testFn": "return myInstanceOf([], Object);"
              },
              {
                "id": 3,
                "name": "Returns false for primitive values",
                "input": "myInstanceOf('hello', String)",
                "expected": false,
                "testFn": "return myInstanceOf('hello', String);"
              }
            ],
            "solutionCode": "function myInstanceOf(instance, Constructor) {\n  if (instance === null || instance === undefined || (typeof instance !== 'object' && typeof instance !== 'function')) {\n    return false;\n  }\n  if (typeof Constructor !== 'function') {\n    throw new TypeError('Right-hand side of myInstanceOf must be a function');\n  }\n\n  const targetProto = Constructor.prototype;\n  let current = Object.getPrototypeOf(instance);\n\n  while (current !== null) {\n    if (current === targetProto) {\n      return true;\n    }\n    current = Object.getPrototypeOf(current);\n  }\n\n  return false;\n}\n"
          },
          "Hard": {
            "id": "proto-hard",
            "title": "Inheritance Builder with Multiple Mixins & Super Dispatch",
            "difficulty": "Hard",
            "concept": "Prototypal Inheritance & Clean Method Composition",
            "description": "Implement `createSubclass(Parent, ChildConstructor, methods, mixins)` that sets up full prototypal inheritance without ES6 classes, wires `Child.prototype.__proto__` to `Parent.prototype`, copies mixin methods safely, and attaches `_super` to invoke parent methods.",
            "starterCode": "function createSubclass(Parent, ChildConstructor, methods = {}, mixins = []) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Assigning `Child.prototype = Parent.prototype` shares the exact same prototype object, causing methods added to Child to pollute Parent.",
            "testCases": [
              {
                "id": 1,
                "name": "Correctly wires prototype chain",
                "input": "child instanceof Parent",
                "expected": true,
                "testFn": "function Animal(name) { this.name = name; } function Dog(name) { Animal.call(this, name); } createSubclass(Animal, Dog); const d = new Dog('Rex'); return d instanceof Animal;"
              },
              {
                "id": 2,
                "name": "Executes super method via _super",
                "input": "calls parent method via _super",
                "expected": "ANIMAL: Rex",
                "testFn": "function Animal(name) { this.name = name; } Animal.prototype.speak = function() { return 'ANIMAL: ' + this.name; }; function Dog(name) { Animal.call(this, name); } createSubclass(Animal, Dog, { speak() { return this._super('speak'); } }); const d = new Dog('Rex'); return d.speak();"
              },
              {
                "id": 3,
                "name": "Integrates mixins into prototype",
                "input": "dog has mixin method",
                "expected": "wagging",
                "testFn": "function Animal() {} function Dog() {} const wagMixin = { wag() { return 'wagging'; } }; createSubclass(Animal, Dog, {}, [wagMixin]); const d = new Dog(); return d.wag();"
              }
            ],
            "solutionCode": "function createSubclass(Parent, ChildConstructor, methods = {}, mixins = []) {\n  ChildConstructor.prototype = Object.create(Parent.prototype);\n  ChildConstructor.prototype.constructor = ChildConstructor;\n\n  // Add subclass methods\n  Object.assign(ChildConstructor.prototype, methods);\n\n  // Copy mixins\n  for (const mixin of mixins) {\n    Object.assign(ChildConstructor.prototype, mixin);\n  }\n\n  ChildConstructor.prototype._super = function(methodName, ...args) {\n    return Parent.prototype[methodName].apply(this, args);\n  };\n\n  return ChildConstructor;\n}\n"
          }
        },
        "starterChallenge": {
          "id": "proto-basic",
          "title": "Prototype Chain Walker & Distance Calculator",
          "difficulty": "Basic",
          "concept": "[[Prototype]] Traversal to Object.prototype and null",
          "description": "Implement `getPrototypeDepth(obj)` that traverses an object's prototype chain and returns the number of hops until `null` is reached. If `obj` is null or undefined, return 0.",
          "starterCode": "function getPrototypeDepth(obj) {\n  // TODO: Implement solution\n}\n",
          "interviewTrap": "Using `__proto__` directly is deprecated. Always prefer `Object.getPrototypeOf(obj)`.",
          "testCases": [
            {
              "id": 1,
              "name": "Standard object literal has depth of 1 (Object.prototype -> null)",
              "input": "getPrototypeDepth({})",
              "expected": 1,
              "testFn": "return getPrototypeDepth({});"
            },
            {
              "id": 2,
              "name": "Object created with Object.create(null) has depth 0",
              "input": "getPrototypeDepth(Object.create(null))",
              "expected": 0,
              "testFn": "return getPrototypeDepth(Object.create(null));"
            },
            {
              "id": 3,
              "name": "Inherited chain depth reflects hierarchy",
              "input": "grandchild -> parent -> Object.prototype -> null",
              "expected": 2,
              "testFn": "const parent = {}; const child = Object.create(parent); return getPrototypeDepth(child);"
            }
          ],
          "solutionCode": "function getPrototypeDepth(obj) {\n  if (obj === null || obj === undefined) return 0;\n  let depth = 0;\n  let curr = Object.getPrototypeOf(obj);\n  while (curr !== null) {\n    depth++;\n    curr = Object.getPrototypeOf(curr);\n  }\n  return depth;\n}\n"
        },
        "questions": [
          {
            "id": "proto-basic",
            "title": "Prototype Chain Walker & Distance Calculator",
            "difficulty": "Basic",
            "concept": "[[Prototype]] Traversal to Object.prototype and null",
            "description": "Implement `getPrototypeDepth(obj)` that traverses an object's prototype chain and returns the number of hops until `null` is reached. If `obj` is null or undefined, return 0.",
            "starterCode": "function getPrototypeDepth(obj) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Using `__proto__` directly is deprecated. Always prefer `Object.getPrototypeOf(obj)`.",
            "testCases": [
              {
                "id": 1,
                "name": "Standard object literal has depth of 1 (Object.prototype -> null)",
                "input": "getPrototypeDepth({})",
                "expected": 1,
                "testFn": "return getPrototypeDepth({});"
              },
              {
                "id": 2,
                "name": "Object created with Object.create(null) has depth 0",
                "input": "getPrototypeDepth(Object.create(null))",
                "expected": 0,
                "testFn": "return getPrototypeDepth(Object.create(null));"
              },
              {
                "id": 3,
                "name": "Inherited chain depth reflects hierarchy",
                "input": "grandchild -> parent -> Object.prototype -> null",
                "expected": 2,
                "testFn": "const parent = {}; const child = Object.create(parent); return getPrototypeDepth(child);"
              }
            ],
            "solutionCode": "function getPrototypeDepth(obj) {\n  if (obj === null || obj === undefined) return 0;\n  let depth = 0;\n  let curr = Object.getPrototypeOf(obj);\n  while (curr !== null) {\n    depth++;\n    curr = Object.getPrototypeOf(curr);\n  }\n  return depth;\n}\n"
          },
          {
            "id": "proto-medium",
            "title": "Implement Custom 'myInstanceOf' Operator",
            "difficulty": "Medium",
            "concept": "ECMAScript instanceof Algorithm & Prototype Comparison",
            "description": "Implement `myInstanceOf(instance, Constructor)` that mimics the native `instanceof` operator by walking `instance`'s prototype chain checking for `Constructor.prototype`.",
            "starterCode": "function myInstanceOf(instance, Constructor) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Primitives (`myInstanceOf('string', String)`) return false because `instanceof` only checks object instances, not primitive values.",
            "testCases": [
              {
                "id": 1,
                "name": "Detects standard instance accurately",
                "input": "myInstanceOf([], Array)",
                "expected": true,
                "testFn": "return myInstanceOf([], Array);"
              },
              {
                "id": 2,
                "name": "Walks up multiple prototype inheritance tiers",
                "input": "myInstanceOf([], Object)",
                "expected": true,
                "testFn": "return myInstanceOf([], Object);"
              },
              {
                "id": 3,
                "name": "Returns false for primitive values",
                "input": "myInstanceOf('hello', String)",
                "expected": false,
                "testFn": "return myInstanceOf('hello', String);"
              }
            ],
            "solutionCode": "function myInstanceOf(instance, Constructor) {\n  if (instance === null || instance === undefined || (typeof instance !== 'object' && typeof instance !== 'function')) {\n    return false;\n  }\n  if (typeof Constructor !== 'function') {\n    throw new TypeError('Right-hand side of myInstanceOf must be a function');\n  }\n\n  const targetProto = Constructor.prototype;\n  let current = Object.getPrototypeOf(instance);\n\n  while (current !== null) {\n    if (current === targetProto) {\n      return true;\n    }\n    current = Object.getPrototypeOf(current);\n  }\n\n  return false;\n}\n"
          },
          {
            "id": "proto-hard",
            "title": "Inheritance Builder with Multiple Mixins & Super Dispatch",
            "difficulty": "Hard",
            "concept": "Prototypal Inheritance & Clean Method Composition",
            "description": "Implement `createSubclass(Parent, ChildConstructor, methods, mixins)` that sets up full prototypal inheritance without ES6 classes, wires `Child.prototype.__proto__` to `Parent.prototype`, copies mixin methods safely, and attaches `_super` to invoke parent methods.",
            "starterCode": "function createSubclass(Parent, ChildConstructor, methods = {}, mixins = []) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Assigning `Child.prototype = Parent.prototype` shares the exact same prototype object, causing methods added to Child to pollute Parent.",
            "testCases": [
              {
                "id": 1,
                "name": "Correctly wires prototype chain",
                "input": "child instanceof Parent",
                "expected": true,
                "testFn": "function Animal(name) { this.name = name; } function Dog(name) { Animal.call(this, name); } createSubclass(Animal, Dog); const d = new Dog('Rex'); return d instanceof Animal;"
              },
              {
                "id": 2,
                "name": "Executes super method via _super",
                "input": "calls parent method via _super",
                "expected": "ANIMAL: Rex",
                "testFn": "function Animal(name) { this.name = name; } Animal.prototype.speak = function() { return 'ANIMAL: ' + this.name; }; function Dog(name) { Animal.call(this, name); } createSubclass(Animal, Dog, { speak() { return this._super('speak'); } }); const d = new Dog('Rex'); return d.speak();"
              },
              {
                "id": 3,
                "name": "Integrates mixins into prototype",
                "input": "dog has mixin method",
                "expected": "wagging",
                "testFn": "function Animal() {} function Dog() {} const wagMixin = { wag() { return 'wagging'; } }; createSubclass(Animal, Dog, {}, [wagMixin]); const d = new Dog(); return d.wag();"
              }
            ],
            "solutionCode": "function createSubclass(Parent, ChildConstructor, methods = {}, mixins = []) {\n  ChildConstructor.prototype = Object.create(Parent.prototype);\n  ChildConstructor.prototype.constructor = ChildConstructor;\n\n  // Add subclass methods\n  Object.assign(ChildConstructor.prototype, methods);\n\n  // Copy mixins\n  for (const mixin of mixins) {\n    Object.assign(ChildConstructor.prototype, mixin);\n  }\n\n  ChildConstructor.prototype._super = function(methodName, ...args) {\n    return Parent.prototype[methodName].apply(this, args);\n  };\n\n  return ChildConstructor;\n}\n"
          }
        ]
      },
      {
        "id": "type-coercion",
        "title": "Implicit & Explicit Type Coercion Rules",
        "tag": "Type System",
        "summary": "ToPrimitive, ToNumber, ToString algorithms, loose equality (==) comparisons, and Symbol.toPrimitive overrides.",
        "mentalModel": "The engine coerces primitives via internal algorithms. In loose equality (`==`), boolean values are first coerced to numbers, objects are coerced via `ToPrimitive(hint)`, and `null == undefined` is exclusively true.",
        "traps": "`[] == false` is true (both coerce to 0), `[] == ![]` is true, and objects without `valueOf` falling back to `[object Object]`.",
        "challenges": {
          "Basic": {
            "id": "coercion-basic",
            "title": "Strict Type Coercion Formatter",
            "difficulty": "Basic",
            "concept": "Explicit Type Conversions & Truthiness",
            "description": "Implement `safeCast(value, targetType)` that explicitly and safely converts `value` to `'string'`, `'number'`, or `'boolean'`. For `'number'`, if conversion results in NaN, return `0` instead.",
            "starterCode": "function safeCast(value, targetType) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Using `+value` or `parseInt` can cause subtle NaN or radix bugs. `Number(value)` with `Number.isNaN()` check is standard.",
            "testCases": [
              {
                "id": 1,
                "name": "Safely converts string to number with NaN fallback",
                "input": "safeCast('invalid', 'number')",
                "expected": 0,
                "testFn": "return safeCast('invalid', 'number');"
              },
              {
                "id": 2,
                "name": "Casts valid numeric string to number",
                "input": "safeCast('42', 'number')",
                "expected": 42,
                "testFn": "return safeCast('42', 'number');"
              },
              {
                "id": 3,
                "name": "Casts empty string and non-empty string to boolean",
                "input": "safeCast('', 'boolean') vs safeCast('text', 'boolean')",
                "expected": [
                  false,
                  true
                ],
                "testFn": "return [safeCast('', 'boolean'), safeCast('text', 'boolean')];"
              }
            ],
            "solutionCode": "function safeCast(value, targetType) {\n  switch (targetType) {\n    case 'string':\n      return String(value);\n    case 'boolean':\n      return Boolean(value);\n    case 'number': {\n      const num = Number(value);\n      return Number.isNaN(num) ? 0 : num;\n    }\n    default:\n      return value;\n  }\n}\n"
          },
          "Medium": {
            "id": "coercion-medium",
            "title": "Custom Symbol.toPrimitive Converter",
            "difficulty": "Medium",
            "concept": "Custom Object-to-Primitive Protocol (Symbol.toPrimitive)",
            "description": "Implement `createMoney(amount, currency)` returning an object that supports arithmetic via `Symbol.toPrimitive`: when coerced to a `'number'`, returns `amount`; when coerced to a `'string'`, returns `${currency} ${amount}`; and when `'default'`, returns `amount`.",
            "starterCode": "function createMoney(amount, currency = 'USD') {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "If `Symbol.toPrimitive` is absent, JS falls back to calling `valueOf()` and then `toString()`. Providing `Symbol.toPrimitive` takes absolute precedence.",
            "testCases": [
              {
                "id": 1,
                "name": "Supports mathematical addition using number hint",
                "input": "createMoney(50) + createMoney(25)",
                "expected": 75,
                "testFn": "const m1 = createMoney(50); const m2 = createMoney(25); return m1 + m2;"
              },
              {
                "id": 2,
                "name": "Formats currency in template literal using string hint",
                "input": "`Total: ${createMoney(100, 'EUR')}`",
                "expected": "Total: EUR 100",
                "testFn": "const m = createMoney(100, 'EUR'); return `Total: ${m}`;"
              },
              {
                "id": 3,
                "name": "Supports numeric comparison operators (<, >)",
                "input": "createMoney(10) < createMoney(20)",
                "expected": true,
                "testFn": "return createMoney(10) < createMoney(20);"
              }
            ],
            "solutionCode": "function createMoney(amount, currency = 'USD') {\n  return {\n    amount,\n    currency,\n    [Symbol.toPrimitive](hint) {\n      if (hint === 'string') {\n        return `${this.currency} ${this.amount}`;\n      }\n      return this.amount;\n    }\n  };\n}\n"
          },
          "Hard": {
            "id": "coercion-hard",
            "title": "ECMAScript Abstract Equality (==) Simulator",
            "difficulty": "Hard",
            "concept": "ECMA-262 7.2.14 Abstract Equality Comparison Algorithm",
            "description": "Implement `abstractEquals(x, y)` implementing the precise ECMAScript loose equality `==` rules without using the native `==` operator. Must handle null/undefined pairs, String/Number coercions, Boolean-to-number conversions, and Object-to-primitive conversions.",
            "starterCode": "function abstractEquals(x, y) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "When comparing a Boolean with anything else, the Boolean is coerced to a Number FIRST! So `[] == true` -> `[] == 1` -> `'' == 1` -> `0 === 1` -> `false`.",
            "testCases": [
              {
                "id": 1,
                "name": "Compares null and undefined as equal",
                "input": "abstractEquals(null, undefined)",
                "expected": true,
                "testFn": "return abstractEquals(null, undefined);"
              },
              {
                "id": 2,
                "name": "Coerces number string to number accurately",
                "input": "abstractEquals('42', 42)",
                "expected": true,
                "testFn": "return abstractEquals('42', 42);"
              },
              {
                "id": 3,
                "name": "Handles boolean coercion rules ([] == false is true)",
                "input": "abstractEquals([], false)",
                "expected": true,
                "testFn": "return abstractEquals([], false);"
              }
            ],
            "solutionCode": "function abstractEquals(x, y) {\n  // 1. Same Type\n  if (typeof x === typeof y) {\n    return x === y;\n  }\n\n  // 2. null and undefined\n  if ((x === null && y === undefined) || (x === undefined && y === null)) {\n    return true;\n  }\n\n  // 3. Number and String\n  if (typeof x === 'number' && typeof y === 'string') {\n    return x === Number(y);\n  }\n  if (typeof x === 'string' && typeof y === 'number') {\n    return Number(x) === y;\n  }\n\n  // 4. Boolean\n  if (typeof x === 'boolean') {\n    return abstractEquals(Number(x), y);\n  }\n  if (typeof y === 'boolean') {\n    return abstractEquals(x, Number(y));\n  }\n\n  // 5. Object to Primitive\n  if ((typeof x === 'string' || typeof x === 'number') && typeof y === 'object' && y !== null) {\n    return abstractEquals(x, String(y));\n  }\n  if (typeof x === 'object' && x !== null && (typeof y === 'string' || typeof y === 'number')) {\n    return abstractEquals(String(x), y);\n  }\n\n  return false;\n}\n"
          }
        },
        "starterChallenge": {
          "id": "coercion-basic",
          "title": "Strict Type Coercion Formatter",
          "difficulty": "Basic",
          "concept": "Explicit Type Conversions & Truthiness",
          "description": "Implement `safeCast(value, targetType)` that explicitly and safely converts `value` to `'string'`, `'number'`, or `'boolean'`. For `'number'`, if conversion results in NaN, return `0` instead.",
          "starterCode": "function safeCast(value, targetType) {\n  // TODO: Implement solution\n}\n",
          "interviewTrap": "Using `+value` or `parseInt` can cause subtle NaN or radix bugs. `Number(value)` with `Number.isNaN()` check is standard.",
          "testCases": [
            {
              "id": 1,
              "name": "Safely converts string to number with NaN fallback",
              "input": "safeCast('invalid', 'number')",
              "expected": 0,
              "testFn": "return safeCast('invalid', 'number');"
            },
            {
              "id": 2,
              "name": "Casts valid numeric string to number",
              "input": "safeCast('42', 'number')",
              "expected": 42,
              "testFn": "return safeCast('42', 'number');"
            },
            {
              "id": 3,
              "name": "Casts empty string and non-empty string to boolean",
              "input": "safeCast('', 'boolean') vs safeCast('text', 'boolean')",
              "expected": [
                false,
                true
              ],
              "testFn": "return [safeCast('', 'boolean'), safeCast('text', 'boolean')];"
            }
          ],
          "solutionCode": "function safeCast(value, targetType) {\n  switch (targetType) {\n    case 'string':\n      return String(value);\n    case 'boolean':\n      return Boolean(value);\n    case 'number': {\n      const num = Number(value);\n      return Number.isNaN(num) ? 0 : num;\n    }\n    default:\n      return value;\n  }\n}\n"
        },
        "questions": [
          {
            "id": "coercion-basic",
            "title": "Strict Type Coercion Formatter",
            "difficulty": "Basic",
            "concept": "Explicit Type Conversions & Truthiness",
            "description": "Implement `safeCast(value, targetType)` that explicitly and safely converts `value` to `'string'`, `'number'`, or `'boolean'`. For `'number'`, if conversion results in NaN, return `0` instead.",
            "starterCode": "function safeCast(value, targetType) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Using `+value` or `parseInt` can cause subtle NaN or radix bugs. `Number(value)` with `Number.isNaN()` check is standard.",
            "testCases": [
              {
                "id": 1,
                "name": "Safely converts string to number with NaN fallback",
                "input": "safeCast('invalid', 'number')",
                "expected": 0,
                "testFn": "return safeCast('invalid', 'number');"
              },
              {
                "id": 2,
                "name": "Casts valid numeric string to number",
                "input": "safeCast('42', 'number')",
                "expected": 42,
                "testFn": "return safeCast('42', 'number');"
              },
              {
                "id": 3,
                "name": "Casts empty string and non-empty string to boolean",
                "input": "safeCast('', 'boolean') vs safeCast('text', 'boolean')",
                "expected": [
                  false,
                  true
                ],
                "testFn": "return [safeCast('', 'boolean'), safeCast('text', 'boolean')];"
              }
            ],
            "solutionCode": "function safeCast(value, targetType) {\n  switch (targetType) {\n    case 'string':\n      return String(value);\n    case 'boolean':\n      return Boolean(value);\n    case 'number': {\n      const num = Number(value);\n      return Number.isNaN(num) ? 0 : num;\n    }\n    default:\n      return value;\n  }\n}\n"
          },
          {
            "id": "coercion-medium",
            "title": "Custom Symbol.toPrimitive Converter",
            "difficulty": "Medium",
            "concept": "Custom Object-to-Primitive Protocol (Symbol.toPrimitive)",
            "description": "Implement `createMoney(amount, currency)` returning an object that supports arithmetic via `Symbol.toPrimitive`: when coerced to a `'number'`, returns `amount`; when coerced to a `'string'`, returns `${currency} ${amount}`; and when `'default'`, returns `amount`.",
            "starterCode": "function createMoney(amount, currency = 'USD') {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "If `Symbol.toPrimitive` is absent, JS falls back to calling `valueOf()` and then `toString()`. Providing `Symbol.toPrimitive` takes absolute precedence.",
            "testCases": [
              {
                "id": 1,
                "name": "Supports mathematical addition using number hint",
                "input": "createMoney(50) + createMoney(25)",
                "expected": 75,
                "testFn": "const m1 = createMoney(50); const m2 = createMoney(25); return m1 + m2;"
              },
              {
                "id": 2,
                "name": "Formats currency in template literal using string hint",
                "input": "`Total: ${createMoney(100, 'EUR')}`",
                "expected": "Total: EUR 100",
                "testFn": "const m = createMoney(100, 'EUR'); return `Total: ${m}`;"
              },
              {
                "id": 3,
                "name": "Supports numeric comparison operators (<, >)",
                "input": "createMoney(10) < createMoney(20)",
                "expected": true,
                "testFn": "return createMoney(10) < createMoney(20);"
              }
            ],
            "solutionCode": "function createMoney(amount, currency = 'USD') {\n  return {\n    amount,\n    currency,\n    [Symbol.toPrimitive](hint) {\n      if (hint === 'string') {\n        return `${this.currency} ${this.amount}`;\n      }\n      return this.amount;\n    }\n  };\n}\n"
          },
          {
            "id": "coercion-hard",
            "title": "ECMAScript Abstract Equality (==) Simulator",
            "difficulty": "Hard",
            "concept": "ECMA-262 7.2.14 Abstract Equality Comparison Algorithm",
            "description": "Implement `abstractEquals(x, y)` implementing the precise ECMAScript loose equality `==` rules without using the native `==` operator. Must handle null/undefined pairs, String/Number coercions, Boolean-to-number conversions, and Object-to-primitive conversions.",
            "starterCode": "function abstractEquals(x, y) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "When comparing a Boolean with anything else, the Boolean is coerced to a Number FIRST! So `[] == true` -> `[] == 1` -> `'' == 1` -> `0 === 1` -> `false`.",
            "testCases": [
              {
                "id": 1,
                "name": "Compares null and undefined as equal",
                "input": "abstractEquals(null, undefined)",
                "expected": true,
                "testFn": "return abstractEquals(null, undefined);"
              },
              {
                "id": 2,
                "name": "Coerces number string to number accurately",
                "input": "abstractEquals('42', 42)",
                "expected": true,
                "testFn": "return abstractEquals('42', 42);"
              },
              {
                "id": 3,
                "name": "Handles boolean coercion rules ([] == false is true)",
                "input": "abstractEquals([], false)",
                "expected": true,
                "testFn": "return abstractEquals([], false);"
              }
            ],
            "solutionCode": "function abstractEquals(x, y) {\n  // 1. Same Type\n  if (typeof x === typeof y) {\n    return x === y;\n  }\n\n  // 2. null and undefined\n  if ((x === null && y === undefined) || (x === undefined && y === null)) {\n    return true;\n  }\n\n  // 3. Number and String\n  if (typeof x === 'number' && typeof y === 'string') {\n    return x === Number(y);\n  }\n  if (typeof x === 'string' && typeof y === 'number') {\n    return Number(x) === y;\n  }\n\n  // 4. Boolean\n  if (typeof x === 'boolean') {\n    return abstractEquals(Number(x), y);\n  }\n  if (typeof y === 'boolean') {\n    return abstractEquals(x, Number(y));\n  }\n\n  // 5. Object to Primitive\n  if ((typeof x === 'string' || typeof x === 'number') && typeof y === 'object' && y !== null) {\n    return abstractEquals(x, String(y));\n  }\n  if (typeof x === 'object' && x !== null && (typeof y === 'string' || typeof y === 'number')) {\n    return abstractEquals(String(x), y);\n  }\n\n  return false;\n}\n"
          }
        ]
      },
      {
        "id": "deep-clone-descriptors",
        "title": "Object Descriptors & Deep Cloning with Circular References",
        "tag": "Object Model",
        "summary": "Enumerable, Writable, Configurable descriptors, getters/setters, structuredClone, and handling circular graphs with WeakMap.",
        "mentalModel": "`JSON.parse(JSON.stringify(obj))` drops undefined, functions, Symbols, Date (turned to string), RegExp, and throws TypeError on circular references. Production deep clones require a WeakMap visited tracker.",
        "traps": "Circular reference infinite recursion, losing getters/setters when copying with `Object.assign`, and copying non-enumerable properties.",
        "challenges": {
          "Basic": {
            "id": "clone-basic",
            "title": "Shallow Clone with Property Descriptors",
            "difficulty": "Basic",
            "concept": "Object.getOwnPropertyDescriptors & Property Integrity",
            "description": "Implement `shallowCloneWithDescriptors(obj)` that copies all own properties (enumerable and non-enumerable, including getters/setters and Symbols) using `Object.getOwnPropertyDescriptors` and `Object.create`.",
            "starterCode": "function shallowCloneWithDescriptors(obj) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Using `{ ...obj }` or `Object.assign` turns getter properties into plain value properties evaluated during copy, destroying the dynamic getter.",
            "testCases": [
              {
                "id": 1,
                "name": "Preserves dynamic getter behavior",
                "input": "cloned object preserves getter function",
                "expected": "HELLO",
                "testFn": "const orig = { text: 'hello', get upper() { return this.text.toUpperCase(); } }; const clone = shallowCloneWithDescriptors(orig); orig.text = 'world'; return clone.upper;"
              },
              {
                "id": 2,
                "name": "Preserves non-enumerable properties",
                "input": "cloned object retains non-enumerable property",
                "expected": 123,
                "testFn": "const orig = {}; Object.defineProperty(orig, 'secret', { value: 123, enumerable: false }); const clone = shallowCloneWithDescriptors(orig); return clone.secret;"
              },
              {
                "id": 3,
                "name": "Retains prototype of original object",
                "input": "clone has identical prototype",
                "expected": true,
                "testFn": "class Sample {} const orig = new Sample(); const clone = shallowCloneWithDescriptors(orig); return clone instanceof Sample;"
              }
            ],
            "solutionCode": "function shallowCloneWithDescriptors(obj) {\n  if (obj === null || typeof obj !== 'object') return obj;\n  const proto = Object.getPrototypeOf(obj);\n  const descriptors = Object.getOwnPropertyDescriptors(obj);\n  return Object.create(proto, descriptors);\n}\n"
          },
          "Medium": {
            "id": "clone-medium",
            "title": "Deep Clone Supporting Nested Objects, Arrays, and Dates",
            "difficulty": "Medium",
            "concept": "Recursive Deep Copy & Built-in Type Handling",
            "description": "Implement `deepClone(target)` that creates a completely independent copy of nested objects, arrays, Dates, and RegExps, so mutations to the copy never affect the original.",
            "starterCode": "function deepClone(target) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "`JSON.stringify` converts Dates to strings and silently drops RegExps and functions.",
            "testCases": [
              {
                "id": 1,
                "name": "Deeply clones nested arrays and objects without shared references",
                "input": "mutating clone does not mutate original",
                "expected": 10,
                "testFn": "const orig = { a: { b: [10, 20] } }; const clone = deepClone(orig); clone.a.b[0] = 999; return orig.a.b[0];"
              },
              {
                "id": 2,
                "name": "Accurately clones Date objects with full methods",
                "input": "clone.getTime() matches original",
                "expected": true,
                "testFn": "const d = new Date(1700000000000); const clone = deepClone(d); return clone instanceof Date && clone.getTime() === d.getTime();"
              },
              {
                "id": 3,
                "name": "Clones RegExp objects with source and flags",
                "input": "clone of /test/gi",
                "expected": true,
                "testFn": "const re = /test/gi; const clone = deepClone(re); return clone instanceof RegExp && clone.source === 'test' && clone.flags === 'gi';"
              }
            ],
            "solutionCode": "function deepClone(target) {\n  if (target === null || typeof target !== 'object') {\n    return target;\n  }\n\n  if (target instanceof Date) {\n    return new Date(target.getTime());\n  }\n\n  if (target instanceof RegExp) {\n    return new RegExp(target.source, target.flags);\n  }\n\n  if (Array.isArray(target)) {\n    return target.map(item => deepClone(item));\n  }\n\n  const copy = {};\n  for (const key of Object.keys(target)) {\n    copy[key] = deepClone(target[key]);\n  }\n  return copy;\n}\n"
          },
          "Hard": {
            "id": "clone-hard",
            "title": "Universal Deep Clone with Circular Reference Detection",
            "difficulty": "Hard",
            "concept": "Graph Cycle Traversal using WeakMap",
            "description": "Implement `deepCloneCircular(obj)` that deep copies arbitrarily nested data structures containing cyclic self-references without causing `RangeError: Maximum call stack size exceeded`.",
            "starterCode": "function deepCloneCircular(target, seen = new WeakMap()) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Any deep clone that lacks a `WeakMap` or visited cache will crash in an infinite loop as soon as an object points back to an ancestor (`node.parent = parent`).",
            "testCases": [
              {
                "id": 1,
                "name": "Successfully clones object with self-referential cycle",
                "input": "obj.self = obj; deepCloneCircular(obj)",
                "expected": true,
                "testFn": "const obj = { name: 'cyclic' }; obj.self = obj; const clone = deepCloneCircular(obj); return clone !== obj && clone.self === clone;"
              },
              {
                "id": 2,
                "name": "Clones mutual cyclic graph between two nodes",
                "input": "a.b = b; b.a = a",
                "expected": true,
                "testFn": "const a = { id: 1 }; const b = { id: 2 }; a.b = b; b.a = a; const cloneA = deepCloneCircular(a); return cloneA.b.a === cloneA && cloneA.b !== b;"
              },
              {
                "id": 3,
                "name": "Preserves primitive and array values alongside circular pointers",
                "input": "cyclic graph with array items",
                "expected": [
                  1,
                  2,
                  3
                ],
                "testFn": "const root = { list: [1, 2, 3] }; root.ref = root; const clone = deepCloneCircular(root); return clone.list;"
              }
            ],
            "solutionCode": "function deepCloneCircular(target, seen = new WeakMap()) {\n  if (target === null || typeof target !== 'object') {\n    return target;\n  }\n\n  if (seen.has(target)) {\n    return seen.get(target);\n  }\n\n  if (target instanceof Date) return new Date(target.getTime());\n  if (target instanceof RegExp) return new RegExp(target.source, target.flags);\n\n  const copy = Array.isArray(target) ? [] : {};\n  seen.set(target, copy);\n\n  for (const key of Object.keys(target)) {\n    copy[key] = deepCloneCircular(target[key], seen);\n  }\n\n  return copy;\n}\n"
          }
        },
        "starterChallenge": {
          "id": "clone-basic",
          "title": "Shallow Clone with Property Descriptors",
          "difficulty": "Basic",
          "concept": "Object.getOwnPropertyDescriptors & Property Integrity",
          "description": "Implement `shallowCloneWithDescriptors(obj)` that copies all own properties (enumerable and non-enumerable, including getters/setters and Symbols) using `Object.getOwnPropertyDescriptors` and `Object.create`.",
          "starterCode": "function shallowCloneWithDescriptors(obj) {\n  // TODO: Implement solution\n}\n",
          "interviewTrap": "Using `{ ...obj }` or `Object.assign` turns getter properties into plain value properties evaluated during copy, destroying the dynamic getter.",
          "testCases": [
            {
              "id": 1,
              "name": "Preserves dynamic getter behavior",
              "input": "cloned object preserves getter function",
              "expected": "HELLO",
              "testFn": "const orig = { text: 'hello', get upper() { return this.text.toUpperCase(); } }; const clone = shallowCloneWithDescriptors(orig); orig.text = 'world'; return clone.upper;"
            },
            {
              "id": 2,
              "name": "Preserves non-enumerable properties",
              "input": "cloned object retains non-enumerable property",
              "expected": 123,
              "testFn": "const orig = {}; Object.defineProperty(orig, 'secret', { value: 123, enumerable: false }); const clone = shallowCloneWithDescriptors(orig); return clone.secret;"
            },
            {
              "id": 3,
              "name": "Retains prototype of original object",
              "input": "clone has identical prototype",
              "expected": true,
              "testFn": "class Sample {} const orig = new Sample(); const clone = shallowCloneWithDescriptors(orig); return clone instanceof Sample;"
            }
          ],
          "solutionCode": "function shallowCloneWithDescriptors(obj) {\n  if (obj === null || typeof obj !== 'object') return obj;\n  const proto = Object.getPrototypeOf(obj);\n  const descriptors = Object.getOwnPropertyDescriptors(obj);\n  return Object.create(proto, descriptors);\n}\n"
        },
        "questions": [
          {
            "id": "clone-basic",
            "title": "Shallow Clone with Property Descriptors",
            "difficulty": "Basic",
            "concept": "Object.getOwnPropertyDescriptors & Property Integrity",
            "description": "Implement `shallowCloneWithDescriptors(obj)` that copies all own properties (enumerable and non-enumerable, including getters/setters and Symbols) using `Object.getOwnPropertyDescriptors` and `Object.create`.",
            "starterCode": "function shallowCloneWithDescriptors(obj) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Using `{ ...obj }` or `Object.assign` turns getter properties into plain value properties evaluated during copy, destroying the dynamic getter.",
            "testCases": [
              {
                "id": 1,
                "name": "Preserves dynamic getter behavior",
                "input": "cloned object preserves getter function",
                "expected": "HELLO",
                "testFn": "const orig = { text: 'hello', get upper() { return this.text.toUpperCase(); } }; const clone = shallowCloneWithDescriptors(orig); orig.text = 'world'; return clone.upper;"
              },
              {
                "id": 2,
                "name": "Preserves non-enumerable properties",
                "input": "cloned object retains non-enumerable property",
                "expected": 123,
                "testFn": "const orig = {}; Object.defineProperty(orig, 'secret', { value: 123, enumerable: false }); const clone = shallowCloneWithDescriptors(orig); return clone.secret;"
              },
              {
                "id": 3,
                "name": "Retains prototype of original object",
                "input": "clone has identical prototype",
                "expected": true,
                "testFn": "class Sample {} const orig = new Sample(); const clone = shallowCloneWithDescriptors(orig); return clone instanceof Sample;"
              }
            ],
            "solutionCode": "function shallowCloneWithDescriptors(obj) {\n  if (obj === null || typeof obj !== 'object') return obj;\n  const proto = Object.getPrototypeOf(obj);\n  const descriptors = Object.getOwnPropertyDescriptors(obj);\n  return Object.create(proto, descriptors);\n}\n"
          },
          {
            "id": "clone-medium",
            "title": "Deep Clone Supporting Nested Objects, Arrays, and Dates",
            "difficulty": "Medium",
            "concept": "Recursive Deep Copy & Built-in Type Handling",
            "description": "Implement `deepClone(target)` that creates a completely independent copy of nested objects, arrays, Dates, and RegExps, so mutations to the copy never affect the original.",
            "starterCode": "function deepClone(target) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "`JSON.stringify` converts Dates to strings and silently drops RegExps and functions.",
            "testCases": [
              {
                "id": 1,
                "name": "Deeply clones nested arrays and objects without shared references",
                "input": "mutating clone does not mutate original",
                "expected": 10,
                "testFn": "const orig = { a: { b: [10, 20] } }; const clone = deepClone(orig); clone.a.b[0] = 999; return orig.a.b[0];"
              },
              {
                "id": 2,
                "name": "Accurately clones Date objects with full methods",
                "input": "clone.getTime() matches original",
                "expected": true,
                "testFn": "const d = new Date(1700000000000); const clone = deepClone(d); return clone instanceof Date && clone.getTime() === d.getTime();"
              },
              {
                "id": 3,
                "name": "Clones RegExp objects with source and flags",
                "input": "clone of /test/gi",
                "expected": true,
                "testFn": "const re = /test/gi; const clone = deepClone(re); return clone instanceof RegExp && clone.source === 'test' && clone.flags === 'gi';"
              }
            ],
            "solutionCode": "function deepClone(target) {\n  if (target === null || typeof target !== 'object') {\n    return target;\n  }\n\n  if (target instanceof Date) {\n    return new Date(target.getTime());\n  }\n\n  if (target instanceof RegExp) {\n    return new RegExp(target.source, target.flags);\n  }\n\n  if (Array.isArray(target)) {\n    return target.map(item => deepClone(item));\n  }\n\n  const copy = {};\n  for (const key of Object.keys(target)) {\n    copy[key] = deepClone(target[key]);\n  }\n  return copy;\n}\n"
          },
          {
            "id": "clone-hard",
            "title": "Universal Deep Clone with Circular Reference Detection",
            "difficulty": "Hard",
            "concept": "Graph Cycle Traversal using WeakMap",
            "description": "Implement `deepCloneCircular(obj)` that deep copies arbitrarily nested data structures containing cyclic self-references without causing `RangeError: Maximum call stack size exceeded`.",
            "starterCode": "function deepCloneCircular(target, seen = new WeakMap()) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Any deep clone that lacks a `WeakMap` or visited cache will crash in an infinite loop as soon as an object points back to an ancestor (`node.parent = parent`).",
            "testCases": [
              {
                "id": 1,
                "name": "Successfully clones object with self-referential cycle",
                "input": "obj.self = obj; deepCloneCircular(obj)",
                "expected": true,
                "testFn": "const obj = { name: 'cyclic' }; obj.self = obj; const clone = deepCloneCircular(obj); return clone !== obj && clone.self === clone;"
              },
              {
                "id": 2,
                "name": "Clones mutual cyclic graph between two nodes",
                "input": "a.b = b; b.a = a",
                "expected": true,
                "testFn": "const a = { id: 1 }; const b = { id: 2 }; a.b = b; b.a = a; const cloneA = deepCloneCircular(a); return cloneA.b.a === cloneA && cloneA.b !== b;"
              },
              {
                "id": 3,
                "name": "Preserves primitive and array values alongside circular pointers",
                "input": "cyclic graph with array items",
                "expected": [
                  1,
                  2,
                  3
                ],
                "testFn": "const root = { list: [1, 2, 3] }; root.ref = root; const clone = deepCloneCircular(root); return clone.list;"
              }
            ],
            "solutionCode": "function deepCloneCircular(target, seen = new WeakMap()) {\n  if (target === null || typeof target !== 'object') {\n    return target;\n  }\n\n  if (seen.has(target)) {\n    return seen.get(target);\n  }\n\n  if (target instanceof Date) return new Date(target.getTime());\n  if (target instanceof RegExp) return new RegExp(target.source, target.flags);\n\n  const copy = Array.isArray(target) ? [] : {};\n  seen.set(target, copy);\n\n  for (const key of Object.keys(target)) {\n    copy[key] = deepCloneCircular(target[key], seen);\n  }\n\n  return copy;\n}\n"
          }
        ]
      }
    ]
  },
  {
    "id": "functional-patterns",
    "category": "4. Functional Patterns & System Polyfills",
    "badge": "Design Patterns",
    "description": "Currying, partial application, advanced debounce/throttle with leading/trailing edges, and core array polyfills.",
    "topics": [
      {
        "id": "curry-compose",
        "title": "Currying, Partial Application & Function Composition",
        "tag": "Functional JS",
        "summary": "Arity detection, currying functions of arbitrary length, pipe vs compose, and point-free programming.",
        "mentalModel": "Currying converts a function taking N arguments `f(a, b, c)` into a sequence of N unary functions `f(a)(b)(c)`. When total collected arguments `>= fn.length`, the underlying function executes.",
        "traps": "Functions with default parameters or rest parameters having `fn.length === 0`, and curried functions retaining state between unrelated calls.",
        "challenges": {
          "Basic": {
            "id": "curry-basic",
            "title": "Curry a 3-Argument Function",
            "difficulty": "Basic",
            "concept": "Fixed Arity Currying & Closures",
            "description": "Implement `curry3(fn)` that curries a function taking exactly 3 arguments, allowing calls like `fn(1)(2)(3)`, `fn(1, 2)(3)`, or `fn(1)(2, 3)`.",
            "starterCode": "function curry3(fn) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Not handling grouped arguments like `fn(1, 2)(3)` where multiple parameters are supplied in a single invocation.",
            "testCases": [
              {
                "id": 1,
                "name": "Accepts 3 arguments one-by-one",
                "input": "curriedAdd(1)(2)(3)",
                "expected": 6,
                "testFn": "const add = (a, b, c) => a + b + c; const cAdd = curry3(add); return cAdd(1)(2)(3);"
              },
              {
                "id": 2,
                "name": "Accepts 2 arguments then 1 argument",
                "input": "curriedAdd(1, 2)(3)",
                "expected": 6,
                "testFn": "const add = (a, b, c) => a + b + c; const cAdd = curry3(add); return cAdd(1, 2)(3);"
              },
              {
                "id": 3,
                "name": "Accepts all 3 arguments at once",
                "input": "curriedAdd(1, 2, 3)",
                "expected": 6,
                "testFn": "const add = (a, b, c) => a + b + c; const cAdd = curry3(add); return cAdd(1, 2, 3);"
              }
            ],
            "solutionCode": "function curry3(fn) {\n  return function curried(...args) {\n    if (args.length >= 3) {\n      return fn(...args);\n    }\n    return function(...moreArgs) {\n      return curried(...args, ...moreArgs);\n    };\n  };\n}\n"
          },
          "Medium": {
            "id": "curry-medium",
            "title": "Generalized Dynamic Curry with Arity Detection",
            "difficulty": "Medium",
            "concept": "Dynamic Arity via fn.length & Recursive Partial Application",
            "description": "Implement `curry(fn)` that automatically detects `fn.length` and curries any function regardless of argument count until all required arguments have been provided.",
            "starterCode": "function curry(fn) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Remember that `fn.length` only reflects parameters up to the first parameter with a default value. Rest parameters (`...args`) report length 0.",
            "testCases": [
              {
                "id": 1,
                "name": "Curries a 4-argument function across multiple steps",
                "input": "curried(1)(2)(3)(4)",
                "expected": 24,
                "testFn": "const multiply = (a, b, c, d) => a * b * c * d; const cMul = curry(multiply); return cMul(1)(2)(3)(4);"
              },
              {
                "id": 2,
                "name": "Allows multiple arguments per step",
                "input": "curried(1, 2)(3, 4)",
                "expected": 24,
                "testFn": "const multiply = (a, b, c, d) => a * b * c * d; const cMul = curry(multiply); return cMul(1, 2)(3, 4);"
              },
              {
                "id": 3,
                "name": "Preserves 'this' context during invocation",
                "input": "curried method preserves object context",
                "expected": "Hello, Alice",
                "testFn": "const greeter = { prefix: 'Hello', greet(title, name) { return `${this.prefix}, ${title} ${name}`; } }; const curriedGreet = curry(greeter.greet); return curriedGreet.call(greeter, 'Ms.')('Alice');"
              }
            ],
            "solutionCode": "function curry(fn) {\n  return function curried(...args) {\n    if (args.length >= fn.length) {\n      return fn.apply(this, args);\n    }\n    return function(...nextArgs) {\n      return curried.apply(this, [...args, ...nextArgs]);\n    };\n  };\n}\n"
          },
          "Hard": {
            "id": "curry-hard",
            "title": "Asynchronous Pipeline (pipeAsync) with Error Recovery",
            "difficulty": "Hard",
            "concept": "Point-Free Async Function Composition & Pipe Architecture",
            "description": "Implement `pipeAsync(...fns)` that chains functions from left to right, where each function can be synchronous or return a Promise. If any step throws or rejects, allow an optional recovery handler passed via `pipeAsync.recoverWith(handler)`.",
            "starterCode": "function pipeAsync(...fns) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Using synchronous `Array.prototype.reduce` without awaiting promises inside the accumulator will return unresolved promise chains.",
            "testCases": [
              {
                "id": 1,
                "name": "Pipes value through synchronous and async transforms in order",
                "input": "10 -> add5 -> async double -> subtract2",
                "expected": 28,
                "testFn": "const add5 = x => x + 5; const doubleAsync = async x => x * 2; const sub2 = x => x - 2; const pipeline = pipeAsync(add5, doubleAsync, sub2); return pipeline(10);"
              },
              {
                "id": 2,
                "name": "Handles single function pipeline",
                "input": "pipeline with single function",
                "expected": "HELLO",
                "testFn": "const p = pipeAsync(async s => s.toUpperCase()); return p('hello');"
              },
              {
                "id": 3,
                "name": "Works with 0 functions (identity)",
                "input": "pipeAsync() returns input unchanged",
                "expected": 42,
                "testFn": "const p = pipeAsync(); return p(42);"
              }
            ],
            "solutionCode": "function pipeAsync(...fns) {\n  return async function(initialValue) {\n    let result = initialValue;\n    for (const fn of fns) {\n      result = await fn(result);\n    }\n    return result;\n  };\n}\n"
          }
        },
        "starterChallenge": {
          "id": "curry-basic",
          "title": "Curry a 3-Argument Function",
          "difficulty": "Basic",
          "concept": "Fixed Arity Currying & Closures",
          "description": "Implement `curry3(fn)` that curries a function taking exactly 3 arguments, allowing calls like `fn(1)(2)(3)`, `fn(1, 2)(3)`, or `fn(1)(2, 3)`.",
          "starterCode": "function curry3(fn) {\n  // TODO: Implement solution\n}\n",
          "interviewTrap": "Not handling grouped arguments like `fn(1, 2)(3)` where multiple parameters are supplied in a single invocation.",
          "testCases": [
            {
              "id": 1,
              "name": "Accepts 3 arguments one-by-one",
              "input": "curriedAdd(1)(2)(3)",
              "expected": 6,
              "testFn": "const add = (a, b, c) => a + b + c; const cAdd = curry3(add); return cAdd(1)(2)(3);"
            },
            {
              "id": 2,
              "name": "Accepts 2 arguments then 1 argument",
              "input": "curriedAdd(1, 2)(3)",
              "expected": 6,
              "testFn": "const add = (a, b, c) => a + b + c; const cAdd = curry3(add); return cAdd(1, 2)(3);"
            },
            {
              "id": 3,
              "name": "Accepts all 3 arguments at once",
              "input": "curriedAdd(1, 2, 3)",
              "expected": 6,
              "testFn": "const add = (a, b, c) => a + b + c; const cAdd = curry3(add); return cAdd(1, 2, 3);"
            }
          ],
          "solutionCode": "function curry3(fn) {\n  return function curried(...args) {\n    if (args.length >= 3) {\n      return fn(...args);\n    }\n    return function(...moreArgs) {\n      return curried(...args, ...moreArgs);\n    };\n  };\n}\n"
        },
        "questions": [
          {
            "id": "curry-basic",
            "title": "Curry a 3-Argument Function",
            "difficulty": "Basic",
            "concept": "Fixed Arity Currying & Closures",
            "description": "Implement `curry3(fn)` that curries a function taking exactly 3 arguments, allowing calls like `fn(1)(2)(3)`, `fn(1, 2)(3)`, or `fn(1)(2, 3)`.",
            "starterCode": "function curry3(fn) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Not handling grouped arguments like `fn(1, 2)(3)` where multiple parameters are supplied in a single invocation.",
            "testCases": [
              {
                "id": 1,
                "name": "Accepts 3 arguments one-by-one",
                "input": "curriedAdd(1)(2)(3)",
                "expected": 6,
                "testFn": "const add = (a, b, c) => a + b + c; const cAdd = curry3(add); return cAdd(1)(2)(3);"
              },
              {
                "id": 2,
                "name": "Accepts 2 arguments then 1 argument",
                "input": "curriedAdd(1, 2)(3)",
                "expected": 6,
                "testFn": "const add = (a, b, c) => a + b + c; const cAdd = curry3(add); return cAdd(1, 2)(3);"
              },
              {
                "id": 3,
                "name": "Accepts all 3 arguments at once",
                "input": "curriedAdd(1, 2, 3)",
                "expected": 6,
                "testFn": "const add = (a, b, c) => a + b + c; const cAdd = curry3(add); return cAdd(1, 2, 3);"
              }
            ],
            "solutionCode": "function curry3(fn) {\n  return function curried(...args) {\n    if (args.length >= 3) {\n      return fn(...args);\n    }\n    return function(...moreArgs) {\n      return curried(...args, ...moreArgs);\n    };\n  };\n}\n"
          },
          {
            "id": "curry-medium",
            "title": "Generalized Dynamic Curry with Arity Detection",
            "difficulty": "Medium",
            "concept": "Dynamic Arity via fn.length & Recursive Partial Application",
            "description": "Implement `curry(fn)` that automatically detects `fn.length` and curries any function regardless of argument count until all required arguments have been provided.",
            "starterCode": "function curry(fn) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Remember that `fn.length` only reflects parameters up to the first parameter with a default value. Rest parameters (`...args`) report length 0.",
            "testCases": [
              {
                "id": 1,
                "name": "Curries a 4-argument function across multiple steps",
                "input": "curried(1)(2)(3)(4)",
                "expected": 24,
                "testFn": "const multiply = (a, b, c, d) => a * b * c * d; const cMul = curry(multiply); return cMul(1)(2)(3)(4);"
              },
              {
                "id": 2,
                "name": "Allows multiple arguments per step",
                "input": "curried(1, 2)(3, 4)",
                "expected": 24,
                "testFn": "const multiply = (a, b, c, d) => a * b * c * d; const cMul = curry(multiply); return cMul(1, 2)(3, 4);"
              },
              {
                "id": 3,
                "name": "Preserves 'this' context during invocation",
                "input": "curried method preserves object context",
                "expected": "Hello, Alice",
                "testFn": "const greeter = { prefix: 'Hello', greet(title, name) { return `${this.prefix}, ${title} ${name}`; } }; const curriedGreet = curry(greeter.greet); return curriedGreet.call(greeter, 'Ms.')('Alice');"
              }
            ],
            "solutionCode": "function curry(fn) {\n  return function curried(...args) {\n    if (args.length >= fn.length) {\n      return fn.apply(this, args);\n    }\n    return function(...nextArgs) {\n      return curried.apply(this, [...args, ...nextArgs]);\n    };\n  };\n}\n"
          },
          {
            "id": "curry-hard",
            "title": "Asynchronous Pipeline (pipeAsync) with Error Recovery",
            "difficulty": "Hard",
            "concept": "Point-Free Async Function Composition & Pipe Architecture",
            "description": "Implement `pipeAsync(...fns)` that chains functions from left to right, where each function can be synchronous or return a Promise. If any step throws or rejects, allow an optional recovery handler passed via `pipeAsync.recoverWith(handler)`.",
            "starterCode": "function pipeAsync(...fns) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Using synchronous `Array.prototype.reduce` without awaiting promises inside the accumulator will return unresolved promise chains.",
            "testCases": [
              {
                "id": 1,
                "name": "Pipes value through synchronous and async transforms in order",
                "input": "10 -> add5 -> async double -> subtract2",
                "expected": 28,
                "testFn": "const add5 = x => x + 5; const doubleAsync = async x => x * 2; const sub2 = x => x - 2; const pipeline = pipeAsync(add5, doubleAsync, sub2); return pipeline(10);"
              },
              {
                "id": 2,
                "name": "Handles single function pipeline",
                "input": "pipeline with single function",
                "expected": "HELLO",
                "testFn": "const p = pipeAsync(async s => s.toUpperCase()); return p('hello');"
              },
              {
                "id": 3,
                "name": "Works with 0 functions (identity)",
                "input": "pipeAsync() returns input unchanged",
                "expected": 42,
                "testFn": "const p = pipeAsync(); return p(42);"
              }
            ],
            "solutionCode": "function pipeAsync(...fns) {\n  return async function(initialValue) {\n    let result = initialValue;\n    for (const fn of fns) {\n      result = await fn(result);\n    }\n    return result;\n  };\n}\n"
          }
        ]
      },
      {
        "id": "debounce-throttle",
        "title": "Debounce & Throttle with Advanced Controls",
        "tag": "System Design",
        "summary": "Timer management, leading edge vs trailing edge execution, cancellation, and flush methods.",
        "mentalModel": "Debounce groups bursts into a single execution after `wait` ms of silence. Throttle guarantees a maximum execution frequency of at most once every `limit` ms.",
        "traps": "Losing the last execution when trailing is disabled, memory leaks from uncancelled timers, and stale closure variables inside delayed callbacks.",
        "challenges": {
          "Basic": {
            "id": "debounce-basic",
            "title": "Basic Debounce Function",
            "difficulty": "Basic",
            "concept": "Delayed Execution & Timer Resetting",
            "description": "Implement `debounce(fn, delay)` that delays invoking `fn` until after `delay` milliseconds have elapsed since the last time the debounced function was invoked.",
            "starterCode": "function debounce(fn, delay) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Forgetting to preserve `this` and arguments when invoking `fn` inside `setTimeout`.",
            "testCases": [
              {
                "id": 1,
                "name": "Executes only once after rapid burst of calls",
                "input": "call 3 times within delay",
                "expected": 1,
                "testFn": "let calls = 0; const debounced = debounce(() => calls++, 20); debounced(); debounced(); debounced(); await new Promise(r => setTimeout(r, 40)); return calls;"
              },
              {
                "id": 2,
                "name": "Passes the arguments from the most recent call",
                "input": "debounced('first'), debounced('last')",
                "expected": "last",
                "testFn": "let lastArg = ''; const debounced = debounce(arg => { lastArg = arg; }, 15); debounced('first'); debounced('last'); await new Promise(r => setTimeout(r, 30)); return lastArg;"
              },
              {
                "id": 3,
                "name": "Executes multiple times if spaced farther than delay",
                "input": "call, wait, call again",
                "expected": 2,
                "testFn": "let count = 0; const debounced = debounce(() => count++, 15); debounced(); await new Promise(r => setTimeout(r, 30)); debounced(); await new Promise(r => setTimeout(r, 30)); return count;"
              }
            ],
            "solutionCode": "function debounce(fn, delay) {\n  let timerId = null;\n\n  return function(...args) {\n    if (timerId !== null) {\n      clearTimeout(timerId);\n    }\n    timerId = setTimeout(() => {\n      fn.apply(this, args);\n      timerId = null;\n    }, delay);\n  };\n}\n"
          },
          "Medium": {
            "id": "throttle-medium",
            "title": "Basic Throttle Function",
            "difficulty": "Medium",
            "concept": "Rate Limiting & Time Window Enforcement",
            "description": "Implement `throttle(fn, limit)` that guarantees `fn` is called at most once every `limit` milliseconds.",
            "starterCode": "function throttle(fn, limit) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Basic throttle without trailing calls drops the final event in a burst (e.g., stopping scroll). For simple rate limiting, leading execution is standard.",
            "testCases": [
              {
                "id": 1,
                "name": "Executes immediately on leading call",
                "input": "first call runs synchronously",
                "expected": 1,
                "testFn": "let count = 0; const throttled = throttle(() => count++, 50); throttled(); return count;"
              },
              {
                "id": 2,
                "name": "Blocks subsequent calls during throttle period",
                "input": "3 rapid calls within throttle window execute once",
                "expected": 1,
                "testFn": "let count = 0; const throttled = throttle(() => count++, 50); throttled(); throttled(); throttled(); return count;"
              },
              {
                "id": 3,
                "name": "Allows new invocation after window expires",
                "input": "call, wait limit, call again",
                "expected": 2,
                "testFn": "let count = 0; const throttled = throttle(() => count++, 20); throttled(); await new Promise(r => setTimeout(r, 35)); throttled(); return count;"
              }
            ],
            "solutionCode": "function throttle(fn, limit) {\n  let inThrottle = false;\n\n  return function(...args) {\n    if (!inThrottle) {\n      fn.apply(this, args);\n      inThrottle = true;\n      setTimeout(() => {\n        inThrottle = false;\n      }, limit);\n    }\n  };\n}\n"
          },
          "Hard": {
            "id": "debounce-hard",
            "title": "Advanced Debounce with Leading, Trailing & Cancel Controls",
            "difficulty": "Hard",
            "concept": "Production-Grade Debounce (Lodash Pattern)",
            "description": "Implement `debounceAdvanced(fn, delay, { leading = false, trailing = true })`. Provide `.cancel()` to abort any pending execution and `.flush()` to immediately execute any pending call.",
            "starterCode": "function debounceAdvanced(fn, delay, options = {}) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "If `leading: true` and `trailing: false`, the function fires immediately, but must NOT fire at the end of the delay window.",
            "testCases": [
              {
                "id": 1,
                "name": "Supports leading execution immediately",
                "input": "leading: true fires immediately on first call",
                "expected": 1,
                "testFn": "let count = 0; const debounced = debounceAdvanced(() => count++, 50, { leading: true, trailing: false }); debounced(); return count;"
              },
              {
                "id": 2,
                "name": "cancel() aborts pending delayed execution",
                "input": "debounced() -> cancel() -> wait",
                "expected": 0,
                "testFn": "let count = 0; const debounced = debounceAdvanced(() => count++, 30); debounced(); debounced.cancel(); await new Promise(r => setTimeout(r, 45)); return count;"
              },
              {
                "id": 3,
                "name": "flush() triggers pending execution synchronously",
                "input": "debounced() -> flush() immediately executes",
                "expected": 1,
                "testFn": "let count = 0; const debounced = debounceAdvanced(() => count++, 50); debounced(); debounced.flush(); return count;"
              }
            ],
            "solutionCode": "function debounceAdvanced(fn, delay, options = {}) {\n  const { leading = false, trailing = true } = options;\n  let timerId = null;\n  let lastArgs = null;\n  let lastThis = null;\n\n  function debounced(...args) {\n    lastArgs = args;\n    lastThis = this;\n\n    const shouldCallLeading = leading && !timerId;\n\n    if (timerId !== null) {\n      clearTimeout(timerId);\n    }\n\n    if (shouldCallLeading) {\n      fn.apply(lastThis, lastArgs);\n      lastArgs = null;\n      lastThis = null;\n    }\n\n    timerId = setTimeout(() => {\n      if (trailing && lastArgs) {\n        fn.apply(lastThis, lastArgs);\n      }\n      timerId = null;\n      lastArgs = null;\n      lastThis = null;\n    }, delay);\n  }\n\n  debounced.cancel = function() {\n    if (timerId !== null) {\n      clearTimeout(timerId);\n      timerId = null;\n    }\n    lastArgs = null;\n    lastThis = null;\n  };\n\n  debounced.flush = function() {\n    if (timerId !== null && lastArgs) {\n      fn.apply(lastThis, lastArgs);\n      debounced.cancel();\n    }\n  };\n\n  return debounced;\n}\n"
          }
        },
        "starterChallenge": {
          "id": "debounce-basic",
          "title": "Basic Debounce Function",
          "difficulty": "Basic",
          "concept": "Delayed Execution & Timer Resetting",
          "description": "Implement `debounce(fn, delay)` that delays invoking `fn` until after `delay` milliseconds have elapsed since the last time the debounced function was invoked.",
          "starterCode": "function debounce(fn, delay) {\n  // TODO: Implement solution\n}\n",
          "interviewTrap": "Forgetting to preserve `this` and arguments when invoking `fn` inside `setTimeout`.",
          "testCases": [
            {
              "id": 1,
              "name": "Executes only once after rapid burst of calls",
              "input": "call 3 times within delay",
              "expected": 1,
              "testFn": "let calls = 0; const debounced = debounce(() => calls++, 20); debounced(); debounced(); debounced(); await new Promise(r => setTimeout(r, 40)); return calls;"
            },
            {
              "id": 2,
              "name": "Passes the arguments from the most recent call",
              "input": "debounced('first'), debounced('last')",
              "expected": "last",
              "testFn": "let lastArg = ''; const debounced = debounce(arg => { lastArg = arg; }, 15); debounced('first'); debounced('last'); await new Promise(r => setTimeout(r, 30)); return lastArg;"
            },
            {
              "id": 3,
              "name": "Executes multiple times if spaced farther than delay",
              "input": "call, wait, call again",
              "expected": 2,
              "testFn": "let count = 0; const debounced = debounce(() => count++, 15); debounced(); await new Promise(r => setTimeout(r, 30)); debounced(); await new Promise(r => setTimeout(r, 30)); return count;"
            }
          ],
          "solutionCode": "function debounce(fn, delay) {\n  let timerId = null;\n\n  return function(...args) {\n    if (timerId !== null) {\n      clearTimeout(timerId);\n    }\n    timerId = setTimeout(() => {\n      fn.apply(this, args);\n      timerId = null;\n    }, delay);\n  };\n}\n"
        },
        "questions": [
          {
            "id": "debounce-basic",
            "title": "Basic Debounce Function",
            "difficulty": "Basic",
            "concept": "Delayed Execution & Timer Resetting",
            "description": "Implement `debounce(fn, delay)` that delays invoking `fn` until after `delay` milliseconds have elapsed since the last time the debounced function was invoked.",
            "starterCode": "function debounce(fn, delay) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Forgetting to preserve `this` and arguments when invoking `fn` inside `setTimeout`.",
            "testCases": [
              {
                "id": 1,
                "name": "Executes only once after rapid burst of calls",
                "input": "call 3 times within delay",
                "expected": 1,
                "testFn": "let calls = 0; const debounced = debounce(() => calls++, 20); debounced(); debounced(); debounced(); await new Promise(r => setTimeout(r, 40)); return calls;"
              },
              {
                "id": 2,
                "name": "Passes the arguments from the most recent call",
                "input": "debounced('first'), debounced('last')",
                "expected": "last",
                "testFn": "let lastArg = ''; const debounced = debounce(arg => { lastArg = arg; }, 15); debounced('first'); debounced('last'); await new Promise(r => setTimeout(r, 30)); return lastArg;"
              },
              {
                "id": 3,
                "name": "Executes multiple times if spaced farther than delay",
                "input": "call, wait, call again",
                "expected": 2,
                "testFn": "let count = 0; const debounced = debounce(() => count++, 15); debounced(); await new Promise(r => setTimeout(r, 30)); debounced(); await new Promise(r => setTimeout(r, 30)); return count;"
              }
            ],
            "solutionCode": "function debounce(fn, delay) {\n  let timerId = null;\n\n  return function(...args) {\n    if (timerId !== null) {\n      clearTimeout(timerId);\n    }\n    timerId = setTimeout(() => {\n      fn.apply(this, args);\n      timerId = null;\n    }, delay);\n  };\n}\n"
          },
          {
            "id": "throttle-medium",
            "title": "Basic Throttle Function",
            "difficulty": "Medium",
            "concept": "Rate Limiting & Time Window Enforcement",
            "description": "Implement `throttle(fn, limit)` that guarantees `fn` is called at most once every `limit` milliseconds.",
            "starterCode": "function throttle(fn, limit) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Basic throttle without trailing calls drops the final event in a burst (e.g., stopping scroll). For simple rate limiting, leading execution is standard.",
            "testCases": [
              {
                "id": 1,
                "name": "Executes immediately on leading call",
                "input": "first call runs synchronously",
                "expected": 1,
                "testFn": "let count = 0; const throttled = throttle(() => count++, 50); throttled(); return count;"
              },
              {
                "id": 2,
                "name": "Blocks subsequent calls during throttle period",
                "input": "3 rapid calls within throttle window execute once",
                "expected": 1,
                "testFn": "let count = 0; const throttled = throttle(() => count++, 50); throttled(); throttled(); throttled(); return count;"
              },
              {
                "id": 3,
                "name": "Allows new invocation after window expires",
                "input": "call, wait limit, call again",
                "expected": 2,
                "testFn": "let count = 0; const throttled = throttle(() => count++, 20); throttled(); await new Promise(r => setTimeout(r, 35)); throttled(); return count;"
              }
            ],
            "solutionCode": "function throttle(fn, limit) {\n  let inThrottle = false;\n\n  return function(...args) {\n    if (!inThrottle) {\n      fn.apply(this, args);\n      inThrottle = true;\n      setTimeout(() => {\n        inThrottle = false;\n      }, limit);\n    }\n  };\n}\n"
          },
          {
            "id": "debounce-hard",
            "title": "Advanced Debounce with Leading, Trailing & Cancel Controls",
            "difficulty": "Hard",
            "concept": "Production-Grade Debounce (Lodash Pattern)",
            "description": "Implement `debounceAdvanced(fn, delay, { leading = false, trailing = true })`. Provide `.cancel()` to abort any pending execution and `.flush()` to immediately execute any pending call.",
            "starterCode": "function debounceAdvanced(fn, delay, options = {}) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "If `leading: true` and `trailing: false`, the function fires immediately, but must NOT fire at the end of the delay window.",
            "testCases": [
              {
                "id": 1,
                "name": "Supports leading execution immediately",
                "input": "leading: true fires immediately on first call",
                "expected": 1,
                "testFn": "let count = 0; const debounced = debounceAdvanced(() => count++, 50, { leading: true, trailing: false }); debounced(); return count;"
              },
              {
                "id": 2,
                "name": "cancel() aborts pending delayed execution",
                "input": "debounced() -> cancel() -> wait",
                "expected": 0,
                "testFn": "let count = 0; const debounced = debounceAdvanced(() => count++, 30); debounced(); debounced.cancel(); await new Promise(r => setTimeout(r, 45)); return count;"
              },
              {
                "id": 3,
                "name": "flush() triggers pending execution synchronously",
                "input": "debounced() -> flush() immediately executes",
                "expected": 1,
                "testFn": "let count = 0; const debounced = debounceAdvanced(() => count++, 50); debounced(); debounced.flush(); return count;"
              }
            ],
            "solutionCode": "function debounceAdvanced(fn, delay, options = {}) {\n  const { leading = false, trailing = true } = options;\n  let timerId = null;\n  let lastArgs = null;\n  let lastThis = null;\n\n  function debounced(...args) {\n    lastArgs = args;\n    lastThis = this;\n\n    const shouldCallLeading = leading && !timerId;\n\n    if (timerId !== null) {\n      clearTimeout(timerId);\n    }\n\n    if (shouldCallLeading) {\n      fn.apply(lastThis, lastArgs);\n      lastArgs = null;\n      lastThis = null;\n    }\n\n    timerId = setTimeout(() => {\n      if (trailing && lastArgs) {\n        fn.apply(lastThis, lastArgs);\n      }\n      timerId = null;\n      lastArgs = null;\n      lastThis = null;\n    }, delay);\n  }\n\n  debounced.cancel = function() {\n    if (timerId !== null) {\n      clearTimeout(timerId);\n      timerId = null;\n    }\n    lastArgs = null;\n    lastThis = null;\n  };\n\n  debounced.flush = function() {\n    if (timerId !== null && lastArgs) {\n      fn.apply(lastThis, lastArgs);\n      debounced.cancel();\n    }\n  };\n\n  return debounced;\n}\n"
          }
        ]
      },
      {
        "id": "array-polyfills",
        "title": "Core Array & Utility Polyfills from Scratch",
        "tag": "Polyfills",
        "summary": "Sparse arrays, Array.prototype.reduce edge cases, flat/flatMap depth recursion, and Symbol.iterator protocol.",
        "mentalModel": "Native array methods must respect sparse arrays (`in` operator check), handle absent `initialValue` in `reduce` (skipping holes to find the first real element), and preserve the caller's prototype chain.",
        "traps": "`Array(3).map(fn)` runs 0 times because indices 0..2 are holes (unassigned slots). Forgetting hole checks breaks ECMAScript compliance.",
        "challenges": {
          "Basic": {
            "id": "array-basic",
            "title": "Implement Array.prototype.myMap and myFilter",
            "difficulty": "Basic",
            "concept": "Array Iteration & Sparse Index Handling",
            "description": "Implement `myMap(callback, thisArg)` and `myFilter(callback, thisArg)` on `Array.prototype`. They must correctly skip empty slots (sparse arrays) and pass `(element, index, array)` to the callback.",
            "starterCode": "Array.prototype.myMap = function(callback, thisArg) {\n  // TODO: Implement solution\n};\n\nArray.prototype.myFilter = function(callback, thisArg) {\n  // TODO: Implement solution\n};\n",
            "interviewTrap": "Using simple `for` loop without `if (i in this)` visits empty array holes and converts them to `undefined`, violating the spec.",
            "testCases": [
              {
                "id": 1,
                "name": "myMap doubles elements and respects index",
                "input": "[1, 2, 3].myMap((x, i) => x + i)",
                "expected": [
                  1,
                  3,
                  5
                ],
                "testFn": "return [1, 2, 3].myMap((x, i) => x + i);"
              },
              {
                "id": 2,
                "name": "myFilter filters odd numbers",
                "input": "[1, 2, 3, 4, 5].myFilter(x => x % 2 === 0)",
                "expected": [
                  2,
                  4
                ],
                "testFn": "return [1, 2, 3, 4, 5].myFilter(x => x % 2 === 0);"
              },
              {
                "id": 3,
                "name": "myMap preserves sparse array holes",
                "input": "[1, , 3].myMap(x => x * 2)",
                "expected": true,
                "testFn": "const res = [1, , 3].myMap(x => x * 2); return !(1 in res) && res[0] === 2 && res[2] === 6;"
              }
            ],
            "solutionCode": "Array.prototype.myMap = function(callback, thisArg) {\n  if (typeof callback !== 'function') throw new TypeError('Callback must be a function');\n  const result = new Array(this.length);\n  for (let i = 0; i < this.length; i++) {\n    if (i in this) {\n      result[i] = callback.call(thisArg, this[i], i, this);\n    }\n  }\n  return result;\n};\n\nArray.prototype.myFilter = function(callback, thisArg) {\n  if (typeof callback !== 'function') throw new TypeError('Callback must be a function');\n  const result = [];\n  for (let i = 0; i < this.length; i++) {\n    if (i in this && callback.call(thisArg, this[i], i, this)) {\n      result.push(this[i]);\n    }\n  }\n  return result;\n};\n"
          },
          "Medium": {
            "id": "array-medium",
            "title": "Implement Array.prototype.myReduce (Compliant Spec)",
            "difficulty": "Medium",
            "concept": "Accumulator State & Initial Value Resolution",
            "description": "Implement `myReduce(callback, initialValue)` on `Array.prototype`. If `initialValue` is not provided, the first non-empty element is used as the accumulator and iteration begins at the next non-empty index. Throws `TypeError` if invoked on an empty array without an initialValue.",
            "starterCode": "Array.prototype.myReduce = function(callback, initialValue) {\n  // TODO: Implement solution\n};\n",
            "interviewTrap": "Checking `if (!initialValue)` breaks when `initialValue` is `0`, `false`, or `''`! You MUST check `arguments.length > 1`.",
            "testCases": [
              {
                "id": 1,
                "name": "Sums array without initialValue",
                "input": "[1, 2, 3, 4].myReduce((acc, x) => acc + x)",
                "expected": 10,
                "testFn": "return [1, 2, 3, 4].myReduce((acc, x) => acc + x);"
              },
              {
                "id": 2,
                "name": "Handles 0 as explicit initialValue correctly",
                "input": "[1, 2, 3].myReduce((acc, x) => acc + x, 0)",
                "expected": 6,
                "testFn": "return [1, 2, 3].myReduce((acc, x) => acc + x, 0);"
              },
              {
                "id": 3,
                "name": "Throws TypeError on empty array with no initialValue",
                "input": "[].myReduce(fn) throws TypeError",
                "expected": true,
                "testFn": "try { [].myReduce((a, b) => a + b); return false; } catch (e) { return e instanceof TypeError; }"
              }
            ],
            "solutionCode": "Array.prototype.myReduce = function(callback, initialValue) {\n  if (typeof callback !== 'function') throw new TypeError('Callback must be a function');\n  \n  let index = 0;\n  let accumulator;\n\n  if (arguments.length > 1) {\n    accumulator = initialValue;\n  } else {\n    // Find first non-empty slot\n    while (index < this.length && !(index in this)) {\n      index++;\n    }\n    if (index >= this.length) {\n      throw new TypeError('Reduce of empty array with no initial value');\n    }\n    accumulator = this[index++];\n  }\n\n  for (; index < this.length; index++) {\n    if (index in this) {\n      accumulator = callback(accumulator, this[index], index, this);\n    }\n  }\n\n  return accumulator;\n};\n"
          },
          "Hard": {
            "id": "array-hard",
            "title": "Implement Array.prototype.myFlat with Depth & Circular Safety",
            "difficulty": "Hard",
            "concept": "Recursive Flattening & Sparse Array Hole Stripping",
            "description": "Implement `myFlat(depth = 1)` on `Array.prototype` that recursively flattens subarrays up to `depth` levels and strips array holes, matching `Array.prototype.flat`.",
            "starterCode": "Array.prototype.myFlat = function(depth = 1) {\n  // TODO: Implement solution\n};\n",
            "interviewTrap": "`flat()` strips holes entirely! E.g. `[1, , [2]].flat()` returns `[1, 2]` without undefined.",
            "testCases": [
              {
                "id": 1,
                "name": "Flattens 1 level by default",
                "input": "[1, [2, [3, [4]]]].myFlat()",
                "expected": [
                  1,
                  2,
                  [
                    3,
                    [
                      4
                    ]
                  ]
                ],
                "testFn": "return [1, [2, [3, [4]]]].myFlat();"
              },
              {
                "id": 2,
                "name": "Flattens completely with Infinity depth",
                "input": "[1, [2, [3, [4]]]].myFlat(Infinity)",
                "expected": [
                  1,
                  2,
                  3,
                  4
                ],
                "testFn": "return [1, [2, [3, [4]]]].myFlat(Infinity);"
              },
              {
                "id": 3,
                "name": "Removes sparse holes while flattening",
                "input": "[1, , [2, , 3]].myFlat()",
                "expected": [
                  1,
                  2,
                  3
                ],
                "testFn": "return [1, , [2, , 3]].myFlat();"
              }
            ],
            "solutionCode": "Array.prototype.myFlat = function(depth = 1) {\n  const result = [];\n  \n  function flatten(arr, currentDepth) {\n    for (let i = 0; i < arr.length; i++) {\n      if (i in arr) {\n        const item = arr[i];\n        if (Array.isArray(item) && currentDepth < depth) {\n          flatten(item, currentDepth + 1);\n        } else {\n          result.push(item);\n        }\n      }\n    }\n  }\n\n  flatten(this, 0);\n  return result;\n};\n"
          }
        },
        "starterChallenge": {
          "id": "array-basic",
          "title": "Implement Array.prototype.myMap and myFilter",
          "difficulty": "Basic",
          "concept": "Array Iteration & Sparse Index Handling",
          "description": "Implement `myMap(callback, thisArg)` and `myFilter(callback, thisArg)` on `Array.prototype`. They must correctly skip empty slots (sparse arrays) and pass `(element, index, array)` to the callback.",
          "starterCode": "Array.prototype.myMap = function(callback, thisArg) {\n  // TODO: Implement solution\n};\n\nArray.prototype.myFilter = function(callback, thisArg) {\n  // TODO: Implement solution\n};\n",
          "interviewTrap": "Using simple `for` loop without `if (i in this)` visits empty array holes and converts them to `undefined`, violating the spec.",
          "testCases": [
            {
              "id": 1,
              "name": "myMap doubles elements and respects index",
              "input": "[1, 2, 3].myMap((x, i) => x + i)",
              "expected": [
                1,
                3,
                5
              ],
              "testFn": "return [1, 2, 3].myMap((x, i) => x + i);"
            },
            {
              "id": 2,
              "name": "myFilter filters odd numbers",
              "input": "[1, 2, 3, 4, 5].myFilter(x => x % 2 === 0)",
              "expected": [
                2,
                4
              ],
              "testFn": "return [1, 2, 3, 4, 5].myFilter(x => x % 2 === 0);"
            },
            {
              "id": 3,
              "name": "myMap preserves sparse array holes",
              "input": "[1, , 3].myMap(x => x * 2)",
              "expected": true,
              "testFn": "const res = [1, , 3].myMap(x => x * 2); return !(1 in res) && res[0] === 2 && res[2] === 6;"
            }
          ],
          "solutionCode": "Array.prototype.myMap = function(callback, thisArg) {\n  if (typeof callback !== 'function') throw new TypeError('Callback must be a function');\n  const result = new Array(this.length);\n  for (let i = 0; i < this.length; i++) {\n    if (i in this) {\n      result[i] = callback.call(thisArg, this[i], i, this);\n    }\n  }\n  return result;\n};\n\nArray.prototype.myFilter = function(callback, thisArg) {\n  if (typeof callback !== 'function') throw new TypeError('Callback must be a function');\n  const result = [];\n  for (let i = 0; i < this.length; i++) {\n    if (i in this && callback.call(thisArg, this[i], i, this)) {\n      result.push(this[i]);\n    }\n  }\n  return result;\n};\n"
        },
        "questions": [
          {
            "id": "array-basic",
            "title": "Implement Array.prototype.myMap and myFilter",
            "difficulty": "Basic",
            "concept": "Array Iteration & Sparse Index Handling",
            "description": "Implement `myMap(callback, thisArg)` and `myFilter(callback, thisArg)` on `Array.prototype`. They must correctly skip empty slots (sparse arrays) and pass `(element, index, array)` to the callback.",
            "starterCode": "Array.prototype.myMap = function(callback, thisArg) {\n  // TODO: Implement solution\n};\n\nArray.prototype.myFilter = function(callback, thisArg) {\n  // TODO: Implement solution\n};\n",
            "interviewTrap": "Using simple `for` loop without `if (i in this)` visits empty array holes and converts them to `undefined`, violating the spec.",
            "testCases": [
              {
                "id": 1,
                "name": "myMap doubles elements and respects index",
                "input": "[1, 2, 3].myMap((x, i) => x + i)",
                "expected": [
                  1,
                  3,
                  5
                ],
                "testFn": "return [1, 2, 3].myMap((x, i) => x + i);"
              },
              {
                "id": 2,
                "name": "myFilter filters odd numbers",
                "input": "[1, 2, 3, 4, 5].myFilter(x => x % 2 === 0)",
                "expected": [
                  2,
                  4
                ],
                "testFn": "return [1, 2, 3, 4, 5].myFilter(x => x % 2 === 0);"
              },
              {
                "id": 3,
                "name": "myMap preserves sparse array holes",
                "input": "[1, , 3].myMap(x => x * 2)",
                "expected": true,
                "testFn": "const res = [1, , 3].myMap(x => x * 2); return !(1 in res) && res[0] === 2 && res[2] === 6;"
              }
            ],
            "solutionCode": "Array.prototype.myMap = function(callback, thisArg) {\n  if (typeof callback !== 'function') throw new TypeError('Callback must be a function');\n  const result = new Array(this.length);\n  for (let i = 0; i < this.length; i++) {\n    if (i in this) {\n      result[i] = callback.call(thisArg, this[i], i, this);\n    }\n  }\n  return result;\n};\n\nArray.prototype.myFilter = function(callback, thisArg) {\n  if (typeof callback !== 'function') throw new TypeError('Callback must be a function');\n  const result = [];\n  for (let i = 0; i < this.length; i++) {\n    if (i in this && callback.call(thisArg, this[i], i, this)) {\n      result.push(this[i]);\n    }\n  }\n  return result;\n};\n"
          },
          {
            "id": "array-medium",
            "title": "Implement Array.prototype.myReduce (Compliant Spec)",
            "difficulty": "Medium",
            "concept": "Accumulator State & Initial Value Resolution",
            "description": "Implement `myReduce(callback, initialValue)` on `Array.prototype`. If `initialValue` is not provided, the first non-empty element is used as the accumulator and iteration begins at the next non-empty index. Throws `TypeError` if invoked on an empty array without an initialValue.",
            "starterCode": "Array.prototype.myReduce = function(callback, initialValue) {\n  // TODO: Implement solution\n};\n",
            "interviewTrap": "Checking `if (!initialValue)` breaks when `initialValue` is `0`, `false`, or `''`! You MUST check `arguments.length > 1`.",
            "testCases": [
              {
                "id": 1,
                "name": "Sums array without initialValue",
                "input": "[1, 2, 3, 4].myReduce((acc, x) => acc + x)",
                "expected": 10,
                "testFn": "return [1, 2, 3, 4].myReduce((acc, x) => acc + x);"
              },
              {
                "id": 2,
                "name": "Handles 0 as explicit initialValue correctly",
                "input": "[1, 2, 3].myReduce((acc, x) => acc + x, 0)",
                "expected": 6,
                "testFn": "return [1, 2, 3].myReduce((acc, x) => acc + x, 0);"
              },
              {
                "id": 3,
                "name": "Throws TypeError on empty array with no initialValue",
                "input": "[].myReduce(fn) throws TypeError",
                "expected": true,
                "testFn": "try { [].myReduce((a, b) => a + b); return false; } catch (e) { return e instanceof TypeError; }"
              }
            ],
            "solutionCode": "Array.prototype.myReduce = function(callback, initialValue) {\n  if (typeof callback !== 'function') throw new TypeError('Callback must be a function');\n  \n  let index = 0;\n  let accumulator;\n\n  if (arguments.length > 1) {\n    accumulator = initialValue;\n  } else {\n    // Find first non-empty slot\n    while (index < this.length && !(index in this)) {\n      index++;\n    }\n    if (index >= this.length) {\n      throw new TypeError('Reduce of empty array with no initial value');\n    }\n    accumulator = this[index++];\n  }\n\n  for (; index < this.length; index++) {\n    if (index in this) {\n      accumulator = callback(accumulator, this[index], index, this);\n    }\n  }\n\n  return accumulator;\n};\n"
          },
          {
            "id": "array-hard",
            "title": "Implement Array.prototype.myFlat with Depth & Circular Safety",
            "difficulty": "Hard",
            "concept": "Recursive Flattening & Sparse Array Hole Stripping",
            "description": "Implement `myFlat(depth = 1)` on `Array.prototype` that recursively flattens subarrays up to `depth` levels and strips array holes, matching `Array.prototype.flat`.",
            "starterCode": "Array.prototype.myFlat = function(depth = 1) {\n  // TODO: Implement solution\n};\n",
            "interviewTrap": "`flat()` strips holes entirely! E.g. `[1, , [2]].flat()` returns `[1, 2]` without undefined.",
            "testCases": [
              {
                "id": 1,
                "name": "Flattens 1 level by default",
                "input": "[1, [2, [3, [4]]]].myFlat()",
                "expected": [
                  1,
                  2,
                  [
                    3,
                    [
                      4
                    ]
                  ]
                ],
                "testFn": "return [1, [2, [3, [4]]]].myFlat();"
              },
              {
                "id": 2,
                "name": "Flattens completely with Infinity depth",
                "input": "[1, [2, [3, [4]]]].myFlat(Infinity)",
                "expected": [
                  1,
                  2,
                  3,
                  4
                ],
                "testFn": "return [1, [2, [3, [4]]]].myFlat(Infinity);"
              },
              {
                "id": 3,
                "name": "Removes sparse holes while flattening",
                "input": "[1, , [2, , 3]].myFlat()",
                "expected": [
                  1,
                  2,
                  3
                ],
                "testFn": "return [1, , [2, , 3]].myFlat();"
              }
            ],
            "solutionCode": "Array.prototype.myFlat = function(depth = 1) {\n  const result = [];\n  \n  function flatten(arr, currentDepth) {\n    for (let i = 0; i < arr.length; i++) {\n      if (i in arr) {\n        const item = arr[i];\n        if (Array.isArray(item) && currentDepth < depth) {\n          flatten(item, currentDepth + 1);\n        } else {\n          result.push(item);\n        }\n      }\n    }\n  }\n\n  flatten(this, 0);\n  return result;\n};\n"
          }
        ]
      }
    ]
  },
  {
    "id": "browser-dom-internals",
    "category": "5. Browser Engine & DOM Internals",
    "badge": "Browser Architecture",
    "description": "DOM Event Flow, capturing/bubbling, event delegation, and browser rendering pipeline (reflow vs repaint).",
    "topics": [
      {
        "id": "event-propagation",
        "title": "DOM Event Flow: Capturing, Bubbling & Delegation",
        "tag": "DOM Engine",
        "summary": "Capturing phase, Target phase, Bubbling phase, event.stopPropagation() vs stopImmediatePropagation().",
        "mentalModel": "Events travel down from `window` through the DOM tree (Capturing Phase) until they reach the target (Target Phase), then bubble back up to `window` (Bubbling Phase). Event delegation attaches a single listener to a common ancestor, querying `event.target.closest()`.",
        "traps": "`stopPropagation()` does NOT prevent other listeners on the SAME element from executing; `stopImmediatePropagation()` is required.",
        "challenges": {
          "Basic": {
            "id": "event-basic",
            "title": "Event Delegation Matcher",
            "difficulty": "Basic",
            "concept": "Event Delegation & Target Traversal",
            "description": "Implement `delegate(container, selector, eventType, handler)` that listens on `container` and triggers `handler(e, matchedElement)` only when the event originates from or bubbles through an element matching `selector`.",
            "starterCode": "function delegate(container, selector, handler) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Directly checking `event.target.matches(selector)` fails if the user clicks a nested child (like an `<i>` or `<span>` inside a `<button>`). Using `.closest()` is required.",
            "testCases": [
              {
                "id": 1,
                "name": "Triggers handler when child matches selector",
                "input": "click on matching element",
                "expected": "btn-1",
                "testFn": "const parent = document.createElement('div'); const btn = document.createElement('button'); btn.id = 'btn-1'; btn.className = 'action-btn'; parent.appendChild(btn); let clickedId = ''; const listener = delegate(parent, '.action-btn', (e, el) => { clickedId = el.id; }); listener({ target: btn }); return clickedId;"
              },
              {
                "id": 2,
                "name": "Triggers handler when clicking deeply nested child inside matching element",
                "input": "click on <span> inside <button>",
                "expected": "btn-2",
                "testFn": "const parent = document.createElement('div'); const btn = document.createElement('button'); btn.id = 'btn-2'; btn.className = 'action-btn'; const span = document.createElement('span'); btn.appendChild(span); parent.appendChild(btn); let clickedId = ''; const listener = delegate(parent, '.action-btn', (e, el) => { clickedId = el.id; }); listener({ target: span }); return clickedId;"
              },
              {
                "id": 3,
                "name": "Ignores clicks outside selector",
                "input": "click on non-matching sibling",
                "expected": false,
                "testFn": "const parent = document.createElement('div'); const div = document.createElement('div'); parent.appendChild(div); let called = false; const listener = delegate(parent, '.action-btn', () => { called = true; }); listener({ target: div }); return called;"
              }
            ],
            "solutionCode": "function delegate(container, selector, handler) {\n  return function(event) {\n    const target = event.target;\n    const matched = target.closest(selector);\n    if (matched && container.contains(matched)) {\n      handler.call(matched, event, matched);\n    }\n  };\n}\n"
          },
          "Medium": {
            "id": "event-medium",
            "title": "Custom EventEmitter with 'once' and Unsubscribe",
            "difficulty": "Medium",
            "concept": "Observer Pattern & Clean Subscription Teardown",
            "description": "Implement `EventEmitter` with methods: `on(event, listener)`, `emit(event, ...args)`, `off(event, listener)`, and `once(event, listener)`. `on()` and `once()` must return an unsubscribe function `() => void`.",
            "starterCode": "class EventEmitter {\n  constructor() {\n    // TODO: Initialize event storage\n  }\n\n  on(event, listener) {\n    // TODO: Register listener and return unsubscribe function\n  }\n\n  emit(event, ...args) {\n    // TODO: Trigger listeners\n  }\n\n  off(event, listener) {\n    // TODO: Remove listener\n  }\n\n  once(event, listener) {\n    // TODO: Register one-time listener\n  }\n}\n",
            "interviewTrap": "Modifying the listeners array/set while iterating over it during `emit` causes subsequent listeners to be skipped. Always iterate over a snapshot copy.",
            "testCases": [
              {
                "id": 1,
                "name": "Notifies listeners upon emit with parameters",
                "input": "emitter.emit('data', 'val')",
                "expected": [
                  "val"
                ],
                "testFn": "const ee = new EventEmitter(); const log = []; ee.on('data', x => log.push(x)); ee.emit('data', 'val'); return log;"
              },
              {
                "id": 2,
                "name": "once() fires exactly one time then unregisters",
                "input": "emit twice on once listener",
                "expected": 1,
                "testFn": "const ee = new EventEmitter(); let count = 0; ee.once('ping', () => count++); ee.emit('ping'); ee.emit('ping'); return count;"
              },
              {
                "id": 3,
                "name": "Returned unsubscribe function removes listener",
                "input": "unsub() removes listener",
                "expected": 1,
                "testFn": "const ee = new EventEmitter(); let count = 0; const unsub = ee.on('tick', () => count++); ee.emit('tick'); unsub(); ee.emit('tick'); return count;"
              }
            ],
            "solutionCode": "class EventEmitter {\n  constructor() {\n    this.events = new Map();\n  }\n\n  on(event, listener) {\n    if (!this.events.has(event)) {\n      this.events.set(event, new Set());\n    }\n    this.events.get(event).add(listener);\n\n    return () => this.off(event, listener);\n  }\n\n  emit(event, ...args) {\n    if (!this.events.has(event)) return false;\n    // Iterate over a copy to handle listeners modifying the set during emit\n    const listeners = Array.from(this.events.get(event));\n    for (const listener of listeners) {\n      listener(...args);\n    }\n    return listeners.length > 0;\n  }\n\n  off(event, listener) {\n    if (!this.events.has(event)) return;\n    this.events.get(event).delete(listener);\n    if (this.events.get(event).size === 0) {\n      this.events.delete(event);\n    }\n  }\n\n  once(event, listener) {\n    const wrapper = (...args) => {\n      this.off(event, wrapper);\n      listener(...args);\n    };\n    return this.on(event, wrapper);\n  }\n}\n"
          },
          "Hard": {
            "id": "event-hard",
            "title": "Simulated DOM Event Pipeline with Propagation Control",
            "difficulty": "Hard",
            "concept": "Event Phases (Capture -> Target -> Bubble) and Immediate Stop",
            "description": "Implement `dispatchTreeEvent(treeRoot, targetNode, eventName)` that simulates full DOM event flow: executes capture listeners down from root, target listeners on target, then bubble listeners back up to root. Supports `event.stopPropagation()` and `event.stopImmediatePropagation()`.",
            "starterCode": "function dispatchTreeEvent(root, target, eventName) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Many engineers do not know the exact order: capture flows strictly root -> target parent, while bubbling flows target parent -> root.",
            "testCases": [
              {
                "id": 1,
                "name": "Executes capture then bubble in correct sequence",
                "input": "root -> child event propagation",
                "expected": [
                  "capture:root",
                  "target:child",
                  "bubble:root"
                ],
                "testFn": "const root = { id: 'root', _listeners: { click: { capture: [() => {}], bubble: [() => {}] } } }; const child = { id: 'child', parentNode: root, _listeners: { click: { bubble: [() => {}] } } }; return dispatchTreeEvent(root, child, 'click');"
              },
              {
                "id": 2,
                "name": "stopPropagation prevents bubbling to parent",
                "input": "child stops propagation during target phase",
                "expected": [
                  "capture:root",
                  "target:child"
                ],
                "testFn": "const root = { id: 'root', _listeners: { click: { capture: [() => {}], bubble: [() => {}] } } }; const child = { id: 'child', parentNode: root, _listeners: { click: { bubble: [e => e.stopPropagation()] } } }; return dispatchTreeEvent(root, child, 'click');"
              },
              {
                "id": 3,
                "name": "Capture phase stops immediately when stopped at root",
                "input": "root stops propagation during capture phase",
                "expected": [
                  "capture:root"
                ],
                "testFn": "const root = { id: 'root', _listeners: { click: { capture: [e => e.stopPropagation()] } } }; const child = { id: 'child', parentNode: root, _listeners: { click: { bubble: [() => {}] } } }; return dispatchTreeEvent(root, child, 'click');"
              }
            ],
            "solutionCode": "function dispatchTreeEvent(root, target, eventName) {\n  // Construct path from root to target\n  const path = [];\n  let curr = target;\n  while (curr) {\n    path.unshift(curr);\n    if (curr === root) break;\n    curr = curr.parentNode;\n  }\n\n  const event = {\n    type: eventName,\n    target: target,\n    currentTarget: null,\n    isPropagationStopped: false,\n    isImmediatePropagationStopped: false,\n    stopPropagation() { this.isPropagationStopped = true; },\n    stopImmediatePropagation() {\n      this.isPropagationStopped = true;\n      this.isImmediatePropagationStopped = true;\n    }\n  };\n\n  const log = [];\n\n  // 1. Capture Phase (root down to target parent)\n  for (let i = 0; i < path.length - 1; i++) {\n    if (event.isPropagationStopped) break;\n    const node = path[i];\n    event.currentTarget = node;\n    const listeners = node._listeners?.[eventName]?.capture || [];\n    for (const fn of listeners) {\n      if (event.isImmediatePropagationStopped) break;\n      fn(event);\n      log.push(`capture:${node.id}`);\n    }\n  }\n\n  // 2. Target Phase\n  if (!event.isPropagationStopped) {\n    event.currentTarget = target;\n    const targetListeners = target._listeners?.[eventName]?.bubble || [];\n    for (const fn of targetListeners) {\n      if (event.isImmediatePropagationStopped) break;\n      fn(event);\n      log.push(`target:${target.id}`);\n    }\n  }\n\n  // 3. Bubble Phase (target parent up to root)\n  for (let i = path.length - 2; i >= 0; i--) {\n    if (event.isPropagationStopped) break;\n    const node = path[i];\n    event.currentTarget = node;\n    const listeners = node._listeners?.[eventName]?.bubble || [];\n    for (const fn of listeners) {\n      if (event.isImmediatePropagationStopped) break;\n      fn(event);\n      log.push(`bubble:${node.id}`);\n    }\n  }\n\n  return log;\n}\n"
          }
        },
        "starterChallenge": {
          "id": "event-basic",
          "title": "Event Delegation Matcher",
          "difficulty": "Basic",
          "concept": "Event Delegation & Target Traversal",
          "description": "Implement `delegate(container, selector, eventType, handler)` that listens on `container` and triggers `handler(e, matchedElement)` only when the event originates from or bubbles through an element matching `selector`.",
          "starterCode": "function delegate(container, selector, handler) {\n  // TODO: Implement solution\n}\n",
          "interviewTrap": "Directly checking `event.target.matches(selector)` fails if the user clicks a nested child (like an `<i>` or `<span>` inside a `<button>`). Using `.closest()` is required.",
          "testCases": [
            {
              "id": 1,
              "name": "Triggers handler when child matches selector",
              "input": "click on matching element",
              "expected": "btn-1",
              "testFn": "const parent = document.createElement('div'); const btn = document.createElement('button'); btn.id = 'btn-1'; btn.className = 'action-btn'; parent.appendChild(btn); let clickedId = ''; const listener = delegate(parent, '.action-btn', (e, el) => { clickedId = el.id; }); listener({ target: btn }); return clickedId;"
            },
            {
              "id": 2,
              "name": "Triggers handler when clicking deeply nested child inside matching element",
              "input": "click on <span> inside <button>",
              "expected": "btn-2",
              "testFn": "const parent = document.createElement('div'); const btn = document.createElement('button'); btn.id = 'btn-2'; btn.className = 'action-btn'; const span = document.createElement('span'); btn.appendChild(span); parent.appendChild(btn); let clickedId = ''; const listener = delegate(parent, '.action-btn', (e, el) => { clickedId = el.id; }); listener({ target: span }); return clickedId;"
            },
            {
              "id": 3,
              "name": "Ignores clicks outside selector",
              "input": "click on non-matching sibling",
              "expected": false,
              "testFn": "const parent = document.createElement('div'); const div = document.createElement('div'); parent.appendChild(div); let called = false; const listener = delegate(parent, '.action-btn', () => { called = true; }); listener({ target: div }); return called;"
            }
          ],
          "solutionCode": "function delegate(container, selector, handler) {\n  return function(event) {\n    const target = event.target;\n    const matched = target.closest(selector);\n    if (matched && container.contains(matched)) {\n      handler.call(matched, event, matched);\n    }\n  };\n}\n"
        },
        "questions": [
          {
            "id": "event-basic",
            "title": "Event Delegation Matcher",
            "difficulty": "Basic",
            "concept": "Event Delegation & Target Traversal",
            "description": "Implement `delegate(container, selector, eventType, handler)` that listens on `container` and triggers `handler(e, matchedElement)` only when the event originates from or bubbles through an element matching `selector`.",
            "starterCode": "function delegate(container, selector, handler) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Directly checking `event.target.matches(selector)` fails if the user clicks a nested child (like an `<i>` or `<span>` inside a `<button>`). Using `.closest()` is required.",
            "testCases": [
              {
                "id": 1,
                "name": "Triggers handler when child matches selector",
                "input": "click on matching element",
                "expected": "btn-1",
                "testFn": "const parent = document.createElement('div'); const btn = document.createElement('button'); btn.id = 'btn-1'; btn.className = 'action-btn'; parent.appendChild(btn); let clickedId = ''; const listener = delegate(parent, '.action-btn', (e, el) => { clickedId = el.id; }); listener({ target: btn }); return clickedId;"
              },
              {
                "id": 2,
                "name": "Triggers handler when clicking deeply nested child inside matching element",
                "input": "click on <span> inside <button>",
                "expected": "btn-2",
                "testFn": "const parent = document.createElement('div'); const btn = document.createElement('button'); btn.id = 'btn-2'; btn.className = 'action-btn'; const span = document.createElement('span'); btn.appendChild(span); parent.appendChild(btn); let clickedId = ''; const listener = delegate(parent, '.action-btn', (e, el) => { clickedId = el.id; }); listener({ target: span }); return clickedId;"
              },
              {
                "id": 3,
                "name": "Ignores clicks outside selector",
                "input": "click on non-matching sibling",
                "expected": false,
                "testFn": "const parent = document.createElement('div'); const div = document.createElement('div'); parent.appendChild(div); let called = false; const listener = delegate(parent, '.action-btn', () => { called = true; }); listener({ target: div }); return called;"
              }
            ],
            "solutionCode": "function delegate(container, selector, handler) {\n  return function(event) {\n    const target = event.target;\n    const matched = target.closest(selector);\n    if (matched && container.contains(matched)) {\n      handler.call(matched, event, matched);\n    }\n  };\n}\n"
          },
          {
            "id": "event-medium",
            "title": "Custom EventEmitter with 'once' and Unsubscribe",
            "difficulty": "Medium",
            "concept": "Observer Pattern & Clean Subscription Teardown",
            "description": "Implement `EventEmitter` with methods: `on(event, listener)`, `emit(event, ...args)`, `off(event, listener)`, and `once(event, listener)`. `on()` and `once()` must return an unsubscribe function `() => void`.",
            "starterCode": "class EventEmitter {\n  constructor() {\n    // TODO: Initialize event storage\n  }\n\n  on(event, listener) {\n    // TODO: Register listener and return unsubscribe function\n  }\n\n  emit(event, ...args) {\n    // TODO: Trigger listeners\n  }\n\n  off(event, listener) {\n    // TODO: Remove listener\n  }\n\n  once(event, listener) {\n    // TODO: Register one-time listener\n  }\n}\n",
            "interviewTrap": "Modifying the listeners array/set while iterating over it during `emit` causes subsequent listeners to be skipped. Always iterate over a snapshot copy.",
            "testCases": [
              {
                "id": 1,
                "name": "Notifies listeners upon emit with parameters",
                "input": "emitter.emit('data', 'val')",
                "expected": [
                  "val"
                ],
                "testFn": "const ee = new EventEmitter(); const log = []; ee.on('data', x => log.push(x)); ee.emit('data', 'val'); return log;"
              },
              {
                "id": 2,
                "name": "once() fires exactly one time then unregisters",
                "input": "emit twice on once listener",
                "expected": 1,
                "testFn": "const ee = new EventEmitter(); let count = 0; ee.once('ping', () => count++); ee.emit('ping'); ee.emit('ping'); return count;"
              },
              {
                "id": 3,
                "name": "Returned unsubscribe function removes listener",
                "input": "unsub() removes listener",
                "expected": 1,
                "testFn": "const ee = new EventEmitter(); let count = 0; const unsub = ee.on('tick', () => count++); ee.emit('tick'); unsub(); ee.emit('tick'); return count;"
              }
            ],
            "solutionCode": "class EventEmitter {\n  constructor() {\n    this.events = new Map();\n  }\n\n  on(event, listener) {\n    if (!this.events.has(event)) {\n      this.events.set(event, new Set());\n    }\n    this.events.get(event).add(listener);\n\n    return () => this.off(event, listener);\n  }\n\n  emit(event, ...args) {\n    if (!this.events.has(event)) return false;\n    // Iterate over a copy to handle listeners modifying the set during emit\n    const listeners = Array.from(this.events.get(event));\n    for (const listener of listeners) {\n      listener(...args);\n    }\n    return listeners.length > 0;\n  }\n\n  off(event, listener) {\n    if (!this.events.has(event)) return;\n    this.events.get(event).delete(listener);\n    if (this.events.get(event).size === 0) {\n      this.events.delete(event);\n    }\n  }\n\n  once(event, listener) {\n    const wrapper = (...args) => {\n      this.off(event, wrapper);\n      listener(...args);\n    };\n    return this.on(event, wrapper);\n  }\n}\n"
          },
          {
            "id": "event-hard",
            "title": "Simulated DOM Event Pipeline with Propagation Control",
            "difficulty": "Hard",
            "concept": "Event Phases (Capture -> Target -> Bubble) and Immediate Stop",
            "description": "Implement `dispatchTreeEvent(treeRoot, targetNode, eventName)` that simulates full DOM event flow: executes capture listeners down from root, target listeners on target, then bubble listeners back up to root. Supports `event.stopPropagation()` and `event.stopImmediatePropagation()`.",
            "starterCode": "function dispatchTreeEvent(root, target, eventName) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Many engineers do not know the exact order: capture flows strictly root -> target parent, while bubbling flows target parent -> root.",
            "testCases": [
              {
                "id": 1,
                "name": "Executes capture then bubble in correct sequence",
                "input": "root -> child event propagation",
                "expected": [
                  "capture:root",
                  "target:child",
                  "bubble:root"
                ],
                "testFn": "const root = { id: 'root', _listeners: { click: { capture: [() => {}], bubble: [() => {}] } } }; const child = { id: 'child', parentNode: root, _listeners: { click: { bubble: [() => {}] } } }; return dispatchTreeEvent(root, child, 'click');"
              },
              {
                "id": 2,
                "name": "stopPropagation prevents bubbling to parent",
                "input": "child stops propagation during target phase",
                "expected": [
                  "capture:root",
                  "target:child"
                ],
                "testFn": "const root = { id: 'root', _listeners: { click: { capture: [() => {}], bubble: [() => {}] } } }; const child = { id: 'child', parentNode: root, _listeners: { click: { bubble: [e => e.stopPropagation()] } } }; return dispatchTreeEvent(root, child, 'click');"
              },
              {
                "id": 3,
                "name": "Capture phase stops immediately when stopped at root",
                "input": "root stops propagation during capture phase",
                "expected": [
                  "capture:root"
                ],
                "testFn": "const root = { id: 'root', _listeners: { click: { capture: [e => e.stopPropagation()] } } }; const child = { id: 'child', parentNode: root, _listeners: { click: { bubble: [() => {}] } } }; return dispatchTreeEvent(root, child, 'click');"
              }
            ],
            "solutionCode": "function dispatchTreeEvent(root, target, eventName) {\n  // Construct path from root to target\n  const path = [];\n  let curr = target;\n  while (curr) {\n    path.unshift(curr);\n    if (curr === root) break;\n    curr = curr.parentNode;\n  }\n\n  const event = {\n    type: eventName,\n    target: target,\n    currentTarget: null,\n    isPropagationStopped: false,\n    isImmediatePropagationStopped: false,\n    stopPropagation() { this.isPropagationStopped = true; },\n    stopImmediatePropagation() {\n      this.isPropagationStopped = true;\n      this.isImmediatePropagationStopped = true;\n    }\n  };\n\n  const log = [];\n\n  // 1. Capture Phase (root down to target parent)\n  for (let i = 0; i < path.length - 1; i++) {\n    if (event.isPropagationStopped) break;\n    const node = path[i];\n    event.currentTarget = node;\n    const listeners = node._listeners?.[eventName]?.capture || [];\n    for (const fn of listeners) {\n      if (event.isImmediatePropagationStopped) break;\n      fn(event);\n      log.push(`capture:${node.id}`);\n    }\n  }\n\n  // 2. Target Phase\n  if (!event.isPropagationStopped) {\n    event.currentTarget = target;\n    const targetListeners = target._listeners?.[eventName]?.bubble || [];\n    for (const fn of targetListeners) {\n      if (event.isImmediatePropagationStopped) break;\n      fn(event);\n      log.push(`target:${target.id}`);\n    }\n  }\n\n  // 3. Bubble Phase (target parent up to root)\n  for (let i = path.length - 2; i >= 0; i--) {\n    if (event.isPropagationStopped) break;\n    const node = path[i];\n    event.currentTarget = node;\n    const listeners = node._listeners?.[eventName]?.bubble || [];\n    for (const fn of listeners) {\n      if (event.isImmediatePropagationStopped) break;\n      fn(event);\n      log.push(`bubble:${node.id}`);\n    }\n  }\n\n  return log;\n}\n"
          }
        ]
      },
      {
        "id": "rendering-pipeline",
        "title": "Critical Rendering Path: Reflow vs Repaint",
        "tag": "Browser Engine",
        "summary": "Layout (Reflow) triggers, Paint (Repaint) triggers, Composite layers, and layout thrashing.",
        "mentalModel": "Reflow recalculates geometry and layout tree (expensive). Repaint redraws pixels without changing geometry. Composite occurs on the GPU (transforms and opacity). Reading layout properties (`offsetWidth`, `scrollTop`) right after writing them forces synchronous layout thrashing.",
        "traps": "Interleaving DOM reads and writes in a loop (`for(...) { el.style.width = el.offsetWidth + 10 }`), locking the browser main thread.",
        "challenges": {
          "Basic": {
            "id": "render-basic",
            "title": "Layout Thrashing Batcher",
            "difficulty": "Basic",
            "concept": "Separating DOM Reads and Writes",
            "description": "Implement `batchDOMOperations(reads, writes)` that separates an array of DOM measurement tasks (reads) and mutation tasks (writes), executing ALL reads first before executing any writes, preventing forced synchronous layout reflow.",
            "starterCode": "function batchDOMOperations(reads, writes) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Alternating read-write-read-write inside a loop forces the browser to recalculate layout immediately on every iteration.",
            "testCases": [
              {
                "id": 1,
                "name": "Executes all reads before writes",
                "input": "verify read order precedes write order",
                "expected": [
                  "read1",
                  "read2",
                  "write1"
                ],
                "testFn": "const log = []; const reads = [() => log.push('read1'), () => log.push('read2')]; const writes = [() => log.push('write1')]; batchDOMOperations(reads, writes); return log;"
              },
              {
                "id": 2,
                "name": "Supplies read results to write functions",
                "input": "writes receive values calculated by reads",
                "expected": 300,
                "testFn": "let written = 0; const reads = [() => 100, () => 200]; const writes = [res => { written = res[0] + res[1]; }]; batchDOMOperations(reads, writes); return written;"
              },
              {
                "id": 3,
                "name": "Handles empty reads or writes safely",
                "input": "batch with empty writes",
                "expected": [
                  "done"
                ],
                "testFn": "return batchDOMOperations([() => 'done'], []);"
              }
            ],
            "solutionCode": "function batchDOMOperations(reads, writes) {\n  const readResults = reads.map(readFn => readFn());\n  writes.forEach(writeFn => writeFn(readResults));\n  return readResults;\n}\n"
          },
          "Medium": {
            "id": "render-medium",
            "title": "Lightweight Virtual DOM Element Creator & Renderer",
            "difficulty": "Medium",
            "concept": "Virtual DOM Tree Construction and Real DOM Mounting",
            "description": "Implement `h(tag, props, ...children)` and `mount(vnode, container)` that builds a minimal virtual DOM tree and mounts it as real DOM nodes with attributes and text.",
            "starterCode": "function h(tag, props = {}, ...children) {\n  // TODO: Implement solution\n}\n\nfunction mount(vnode, container) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Forgetting that children can be plain strings/numbers or nested arrays (`children.flat()`).",
            "testCases": [
              {
                "id": 1,
                "name": "Creates and mounts DOM node with attributes",
                "input": "h('div', { id: 'box' }, 'Hello')",
                "expected": {
                  "tag": "DIV",
                  "id": "box",
                  "text": "Hello"
                },
                "testFn": "const root = document.createElement('div'); const v = h('div', { id: 'box' }, 'Hello'); const el = mount(v, root); return { tag: el.tagName, id: el.id, text: el.textContent };"
              },
              {
                "id": 2,
                "name": "Mounts nested children hierarchically",
                "input": "h('ul', {}, h('li', {}, 'A'), h('li', {}, 'B'))",
                "expected": 2,
                "testFn": "const root = document.createElement('div'); const v = h('ul', {}, h('li', {}, 'A'), h('li', {}, 'B')); const el = mount(v, root); return el.children.length;"
              },
              {
                "id": 3,
                "name": "Attaches event handlers properly",
                "input": "click listener attached via props",
                "expected": 1,
                "testFn": "let count = 0; const root = document.createElement('div'); const v = h('button', { onClick: () => count++ }, 'Click'); const btn = mount(v, root); btn.click(); return count;"
              }
            ],
            "solutionCode": "function h(tag, props = {}, ...children) {\n  return {\n    tag,\n    props: props || {},\n    children: children.flat()\n  };\n}\n\nfunction mount(vnode, container) {\n  if (typeof vnode === 'string' || typeof vnode === 'number') {\n    const textNode = document.createTextNode(String(vnode));\n    container.appendChild(textNode);\n    return textNode;\n  }\n\n  const el = document.createElement(vnode.tag);\n\n  for (const [key, value] of Object.entries(vnode.props)) {\n    if (key.startsWith('on') && typeof value === 'function') {\n      el.addEventListener(key.slice(2).toLowerCase(), value);\n    } else {\n      el.setAttribute(key, value);\n    }\n  }\n\n  for (const child of vnode.children) {\n    mount(child, el);\n  }\n\n  container.appendChild(el);\n  return el;\n}\n"
          },
          "Hard": {
            "id": "render-hard",
            "title": "Minimal VDOM Diff & Patch Engine",
            "difficulty": "Hard",
            "concept": "Virtual DOM Reconciliation & Minimal Mutation Operations",
            "description": "Implement `diff(oldVNode, newVNode)` that returns a list of patch instructions (`{ type: 'REPLACE'|'TEXT'|'PROPS', ... }`) to update `oldVNode` into `newVNode` with minimal operations.",
            "starterCode": "function diff(oldVNode, newVNode) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Assuming that tag changes can be patched in place. If tags differ (`div` -> `span`), the entire node must be replaced.",
            "testCases": [
              {
                "id": 1,
                "name": "Generates REPLACE patch when tag changes",
                "input": "div -> span",
                "expected": "REPLACE",
                "testFn": "const p = diff({ tag: 'div', props: {} }, { tag: 'span', props: {} }); return p[0].type;"
              },
              {
                "id": 2,
                "name": "Generates PROPS patch when attributes change",
                "input": "props change className",
                "expected": {
                  "className": "active"
                },
                "testFn": "const p = diff({ tag: 'div', props: { className: 'old' } }, { tag: 'div', props: { className: 'active' } }); return p[0].props;"
              },
              {
                "id": 3,
                "name": "Returns empty patches when nodes are identical",
                "input": "identical nodes",
                "expected": 0,
                "testFn": "const p = diff({ tag: 'div', props: { id: 'x' } }, { tag: 'div', props: { id: 'x' } }); return p.length;"
              }
            ],
            "solutionCode": "function diff(oldVNode, newVNode) {\n  if (!oldVNode) return [{ type: 'CREATE', newVNode }];\n  if (!newVNode) return [{ type: 'REMOVE' }];\n  \n  if (typeof oldVNode !== typeof newVNode || (typeof oldVNode === 'string' && oldVNode !== newVNode)) {\n    return [{ type: 'REPLACE', newVNode }];\n  }\n\n  if (typeof oldVNode === 'string') {\n    return [];\n  }\n\n  if (oldVNode.tag !== newVNode.tag) {\n    return [{ type: 'REPLACE', newVNode }];\n  }\n\n  const patches = [];\n\n  // Props diff\n  const propPatches = {};\n  for (const key of Object.keys(newVNode.props || {})) {\n    if (newVNode.props[key] !== oldVNode.props[key]) {\n      propPatches[key] = newVNode.props[key];\n    }\n  }\n  for (const key of Object.keys(oldVNode.props || {})) {\n    if (!(key in (newVNode.props || {}))) {\n      propPatches[key] = undefined;\n    }\n  }\n\n  if (Object.keys(propPatches).length > 0) {\n    patches.push({ type: 'PROPS', props: propPatches });\n  }\n\n  return patches;\n}\n"
          }
        },
        "starterChallenge": {
          "id": "render-basic",
          "title": "Layout Thrashing Batcher",
          "difficulty": "Basic",
          "concept": "Separating DOM Reads and Writes",
          "description": "Implement `batchDOMOperations(reads, writes)` that separates an array of DOM measurement tasks (reads) and mutation tasks (writes), executing ALL reads first before executing any writes, preventing forced synchronous layout reflow.",
          "starterCode": "function batchDOMOperations(reads, writes) {\n  // TODO: Implement solution\n}\n",
          "interviewTrap": "Alternating read-write-read-write inside a loop forces the browser to recalculate layout immediately on every iteration.",
          "testCases": [
            {
              "id": 1,
              "name": "Executes all reads before writes",
              "input": "verify read order precedes write order",
              "expected": [
                "read1",
                "read2",
                "write1"
              ],
              "testFn": "const log = []; const reads = [() => log.push('read1'), () => log.push('read2')]; const writes = [() => log.push('write1')]; batchDOMOperations(reads, writes); return log;"
            },
            {
              "id": 2,
              "name": "Supplies read results to write functions",
              "input": "writes receive values calculated by reads",
              "expected": 300,
              "testFn": "let written = 0; const reads = [() => 100, () => 200]; const writes = [res => { written = res[0] + res[1]; }]; batchDOMOperations(reads, writes); return written;"
            },
            {
              "id": 3,
              "name": "Handles empty reads or writes safely",
              "input": "batch with empty writes",
              "expected": [
                "done"
              ],
              "testFn": "return batchDOMOperations([() => 'done'], []);"
            }
          ],
          "solutionCode": "function batchDOMOperations(reads, writes) {\n  const readResults = reads.map(readFn => readFn());\n  writes.forEach(writeFn => writeFn(readResults));\n  return readResults;\n}\n"
        },
        "questions": [
          {
            "id": "render-basic",
            "title": "Layout Thrashing Batcher",
            "difficulty": "Basic",
            "concept": "Separating DOM Reads and Writes",
            "description": "Implement `batchDOMOperations(reads, writes)` that separates an array of DOM measurement tasks (reads) and mutation tasks (writes), executing ALL reads first before executing any writes, preventing forced synchronous layout reflow.",
            "starterCode": "function batchDOMOperations(reads, writes) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Alternating read-write-read-write inside a loop forces the browser to recalculate layout immediately on every iteration.",
            "testCases": [
              {
                "id": 1,
                "name": "Executes all reads before writes",
                "input": "verify read order precedes write order",
                "expected": [
                  "read1",
                  "read2",
                  "write1"
                ],
                "testFn": "const log = []; const reads = [() => log.push('read1'), () => log.push('read2')]; const writes = [() => log.push('write1')]; batchDOMOperations(reads, writes); return log;"
              },
              {
                "id": 2,
                "name": "Supplies read results to write functions",
                "input": "writes receive values calculated by reads",
                "expected": 300,
                "testFn": "let written = 0; const reads = [() => 100, () => 200]; const writes = [res => { written = res[0] + res[1]; }]; batchDOMOperations(reads, writes); return written;"
              },
              {
                "id": 3,
                "name": "Handles empty reads or writes safely",
                "input": "batch with empty writes",
                "expected": [
                  "done"
                ],
                "testFn": "return batchDOMOperations([() => 'done'], []);"
              }
            ],
            "solutionCode": "function batchDOMOperations(reads, writes) {\n  const readResults = reads.map(readFn => readFn());\n  writes.forEach(writeFn => writeFn(readResults));\n  return readResults;\n}\n"
          },
          {
            "id": "render-medium",
            "title": "Lightweight Virtual DOM Element Creator & Renderer",
            "difficulty": "Medium",
            "concept": "Virtual DOM Tree Construction and Real DOM Mounting",
            "description": "Implement `h(tag, props, ...children)` and `mount(vnode, container)` that builds a minimal virtual DOM tree and mounts it as real DOM nodes with attributes and text.",
            "starterCode": "function h(tag, props = {}, ...children) {\n  // TODO: Implement solution\n}\n\nfunction mount(vnode, container) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Forgetting that children can be plain strings/numbers or nested arrays (`children.flat()`).",
            "testCases": [
              {
                "id": 1,
                "name": "Creates and mounts DOM node with attributes",
                "input": "h('div', { id: 'box' }, 'Hello')",
                "expected": {
                  "tag": "DIV",
                  "id": "box",
                  "text": "Hello"
                },
                "testFn": "const root = document.createElement('div'); const v = h('div', { id: 'box' }, 'Hello'); const el = mount(v, root); return { tag: el.tagName, id: el.id, text: el.textContent };"
              },
              {
                "id": 2,
                "name": "Mounts nested children hierarchically",
                "input": "h('ul', {}, h('li', {}, 'A'), h('li', {}, 'B'))",
                "expected": 2,
                "testFn": "const root = document.createElement('div'); const v = h('ul', {}, h('li', {}, 'A'), h('li', {}, 'B')); const el = mount(v, root); return el.children.length;"
              },
              {
                "id": 3,
                "name": "Attaches event handlers properly",
                "input": "click listener attached via props",
                "expected": 1,
                "testFn": "let count = 0; const root = document.createElement('div'); const v = h('button', { onClick: () => count++ }, 'Click'); const btn = mount(v, root); btn.click(); return count;"
              }
            ],
            "solutionCode": "function h(tag, props = {}, ...children) {\n  return {\n    tag,\n    props: props || {},\n    children: children.flat()\n  };\n}\n\nfunction mount(vnode, container) {\n  if (typeof vnode === 'string' || typeof vnode === 'number') {\n    const textNode = document.createTextNode(String(vnode));\n    container.appendChild(textNode);\n    return textNode;\n  }\n\n  const el = document.createElement(vnode.tag);\n\n  for (const [key, value] of Object.entries(vnode.props)) {\n    if (key.startsWith('on') && typeof value === 'function') {\n      el.addEventListener(key.slice(2).toLowerCase(), value);\n    } else {\n      el.setAttribute(key, value);\n    }\n  }\n\n  for (const child of vnode.children) {\n    mount(child, el);\n  }\n\n  container.appendChild(el);\n  return el;\n}\n"
          },
          {
            "id": "render-hard",
            "title": "Minimal VDOM Diff & Patch Engine",
            "difficulty": "Hard",
            "concept": "Virtual DOM Reconciliation & Minimal Mutation Operations",
            "description": "Implement `diff(oldVNode, newVNode)` that returns a list of patch instructions (`{ type: 'REPLACE'|'TEXT'|'PROPS', ... }`) to update `oldVNode` into `newVNode` with minimal operations.",
            "starterCode": "function diff(oldVNode, newVNode) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Assuming that tag changes can be patched in place. If tags differ (`div` -> `span`), the entire node must be replaced.",
            "testCases": [
              {
                "id": 1,
                "name": "Generates REPLACE patch when tag changes",
                "input": "div -> span",
                "expected": "REPLACE",
                "testFn": "const p = diff({ tag: 'div', props: {} }, { tag: 'span', props: {} }); return p[0].type;"
              },
              {
                "id": 2,
                "name": "Generates PROPS patch when attributes change",
                "input": "props change className",
                "expected": {
                  "className": "active"
                },
                "testFn": "const p = diff({ tag: 'div', props: { className: 'old' } }, { tag: 'div', props: { className: 'active' } }); return p[0].props;"
              },
              {
                "id": 3,
                "name": "Returns empty patches when nodes are identical",
                "input": "identical nodes",
                "expected": 0,
                "testFn": "const p = diff({ tag: 'div', props: { id: 'x' } }, { tag: 'div', props: { id: 'x' } }); return p.length;"
              }
            ],
            "solutionCode": "function diff(oldVNode, newVNode) {\n  if (!oldVNode) return [{ type: 'CREATE', newVNode }];\n  if (!newVNode) return [{ type: 'REMOVE' }];\n  \n  if (typeof oldVNode !== typeof newVNode || (typeof oldVNode === 'string' && oldVNode !== newVNode)) {\n    return [{ type: 'REPLACE', newVNode }];\n  }\n\n  if (typeof oldVNode === 'string') {\n    return [];\n  }\n\n  if (oldVNode.tag !== newVNode.tag) {\n    return [{ type: 'REPLACE', newVNode }];\n  }\n\n  const patches = [];\n\n  // Props diff\n  const propPatches = {};\n  for (const key of Object.keys(newVNode.props || {})) {\n    if (newVNode.props[key] !== oldVNode.props[key]) {\n      propPatches[key] = newVNode.props[key];\n    }\n  }\n  for (const key of Object.keys(oldVNode.props || {})) {\n    if (!(key in (newVNode.props || {}))) {\n      propPatches[key] = undefined;\n    }\n  }\n\n  if (Object.keys(propPatches).length > 0) {\n    patches.push({ type: 'PROPS', props: propPatches });\n  }\n\n  return patches;\n}\n"
          }
        ]
      }
    ]
  },
  {
    "id": "react-internals-js",
    "category": "6. React Internals & Tricky Patterns",
    "badge": "React Bridge",
    "description": "Fiber reconciliation, hook linked list architecture, stale closures in useEffect, and re-render cascades.",
    "topics": [
      {
        "id": "fiber-reconciliation",
        "title": "Fiber Architecture & Reconciliation Mechanics",
        "tag": "React Internals",
        "summary": "Fiber tree linked list structure, Render phase vs Commit phase, and double buffering.",
        "mentalModel": "React represents UI as a singly linked list of Fiber nodes (`child`, `sibling`, `return`). Render phase is interruptible and can be paused; commit phase is strictly synchronous.",
        "traps": "Writing recursive tree traversals instead of iterative pointer walks, and thinking reconciliation immediately touches the DOM.",
        "challenges": {
          "Basic": {
            "id": "fiber-basic",
            "title": "Fiber Node Factory",
            "difficulty": "Basic",
            "concept": "Fiber Node Structure & Pointers",
            "description": "Implement `createFiberNode(tag, type, props)` that initializes a Fiber node with `child: null`, `sibling: null`, `return: null`, `memoizedProps`, and `alternate: null`.",
            "starterCode": "function createFiberNode(tag, type, props = {}) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Confusing `pendingProps` (props being passed to the new render) with `memoizedProps` (props from the last committed render).",
            "testCases": [
              {
                "id": 1,
                "name": "Initializes fiber node with null pointers",
                "input": "createFiberNode('HostComponent', 'div')",
                "expected": {
                  "child": null,
                  "sibling": null,
                  "return": null
                },
                "testFn": "const f = createFiberNode('HostComponent', 'div'); return { child: f.child, sibling: f.sibling, return: f.return };"
              },
              {
                "id": 2,
                "name": "Assigns type and pending props",
                "input": "createFiberNode with props",
                "expected": "hello",
                "testFn": "const f = createFiberNode('HostComponent', 'span', { title: 'hello' }); return f.pendingProps.title;"
              },
              {
                "id": 3,
                "name": "Sets alternate to null by default (double buffering)",
                "input": "f.alternate === null",
                "expected": true,
                "testFn": "const f = createFiberNode('FunctionComponent', () => {}); return f.alternate === null;"
              }
            ],
            "solutionCode": "function createFiberNode(tag, type, props = {}) {\n  return {\n    tag,\n    type,\n    pendingProps: props,\n    memoizedProps: null,\n    memoizedState: null,\n    child: null,\n    sibling: null,\n    return: null,\n    alternate: null\n  };\n}\n"
          },
          "Medium": {
            "id": "fiber-medium",
            "title": "Simulate Fiber Child & Sibling Pointer Linker",
            "difficulty": "Medium",
            "concept": "Fiber Tree Linking & Return Pointers",
            "description": "Implement `linkFiberChildren(parentFiber, childElements)` that takes a parent Fiber node and an array of child element descriptors, converts them into Fiber nodes, links the parent's `child` to the first child, links each child to its next `sibling`, and sets every child's `return` pointer back to `parentFiber`.",
            "starterCode": "function linkFiberChildren(parentFiber, childElements) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Forgetting to set the `return` pointer on each sibling. The return pointer allows React to walk back up the tree without a call stack.",
            "testCases": [
              {
                "id": 1,
                "name": "Links first child to parent.child",
                "input": "parent.child points to first child",
                "expected": "h1",
                "testFn": "const parent = { type: 'div', child: null }; linkFiberChildren(parent, [{ type: 'h1' }, { type: 'p' }]); return parent.child.type;"
              },
              {
                "id": 2,
                "name": "Links siblings in order",
                "input": "first.sibling points to second child",
                "expected": "p",
                "testFn": "const parent = { type: 'div', child: null }; linkFiberChildren(parent, [{ type: 'h1' }, { type: 'p' }]); return parent.child.sibling.type;"
              },
              {
                "id": 3,
                "name": "Sets return pointers on all children back to parent",
                "input": "both children have return === parent",
                "expected": true,
                "testFn": "const parent = { type: 'div', child: null }; linkFiberChildren(parent, [{ type: 'h1' }, { type: 'p' }]); return parent.child.return === parent && parent.child.sibling.return === parent;"
              }
            ],
            "solutionCode": "function linkFiberChildren(parentFiber, childElements) {\n  if (!childElements || childElements.length === 0) {\n    parentFiber.child = null;\n    return;\n  }\n\n  let prevChild = null;\n\n  for (let i = 0; i < childElements.length; i++) {\n    const el = childElements[i];\n    const newFiber = {\n      type: el.type,\n      child: null,\n      sibling: null,\n      return: parentFiber\n    };\n\n    if (i === 0) {\n      parentFiber.child = newFiber;\n    } else {\n      prevChild.sibling = newFiber;\n    }\n    prevChild = newFiber;\n  }\n}\n"
          },
          "Hard": {
            "id": "fiber-hard",
            "title": "Iterative Fiber Depth-First Walker (Without Recursion)",
            "difficulty": "Hard",
            "concept": "Depth-First Search using child, sibling, return Pointers",
            "description": "Implement `traverseFiberTree(rootFiber, visitor)` that visits every Fiber node in depth-first pre-order using ONLY `child`, `sibling`, and `return` pointers. Must not use recursion or array stack frames.",
            "starterCode": "function traverseFiberTree(root, visitor) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "This is the exact workLoop algorithm of React's Concurrent Scheduler. If you use recursion, deep component trees exhaust call stack memory.",
            "testCases": [
              {
                "id": 1,
                "name": "Visits parent before children (pre-order)",
                "input": "root -> childA -> childB",
                "expected": [
                  "root",
                  "A",
                  "B"
                ],
                "testFn": "const root = { id: 'root', child: null }; const a = { id: 'A', return: root, child: null, sibling: null }; const b = { id: 'B', return: root, child: null, sibling: null }; root.child = a; a.sibling = b; const order = []; traverseFiberTree(root, f => order.push(f.id)); return order;"
              },
              {
                "id": 2,
                "name": "Navigates deeply nested subtrees",
                "input": "root -> A -> A1 -> B",
                "expected": [
                  "root",
                  "A",
                  "A1",
                  "B"
                ],
                "testFn": "const root = { id: 'root', child: null }; const b = { id: 'B', return: root, child: null, sibling: null }; const a1 = { id: 'A1', child: null, sibling: null }; const a = { id: 'A', return: root, child: a1, sibling: b }; a1.return = a; root.child = a; const order = []; traverseFiberTree(root, f => order.push(f.id)); return order;"
              },
              {
                "id": 3,
                "name": "Terminates cleanly on single root node",
                "input": "root with no children",
                "expected": [
                  "solo"
                ],
                "testFn": "const root = { id: 'solo', child: null, sibling: null, return: null }; const order = []; traverseFiberTree(root, f => order.push(f.id)); return order;"
              }
            ],
            "solutionCode": "function traverseFiberTree(root, visitor) {\n  let current = root;\n\n  while (current) {\n    visitor(current);\n\n    // 1. Walk down to child if exists\n    if (current.child) {\n      current = current.child;\n      continue;\n    }\n\n    // 2. If at root with no child, finish\n    if (current === root) break;\n\n    // 3. Walk to sibling or up return pointers until sibling found\n    while (!current.sibling) {\n      if (!current.return || current.return === root) {\n        return;\n      }\n      current = current.return;\n    }\n\n    current = current.sibling;\n  }\n}\n"
          }
        },
        "starterChallenge": {
          "id": "fiber-basic",
          "title": "Fiber Node Factory",
          "difficulty": "Basic",
          "concept": "Fiber Node Structure & Pointers",
          "description": "Implement `createFiberNode(tag, type, props)` that initializes a Fiber node with `child: null`, `sibling: null`, `return: null`, `memoizedProps`, and `alternate: null`.",
          "starterCode": "function createFiberNode(tag, type, props = {}) {\n  // TODO: Implement solution\n}\n",
          "interviewTrap": "Confusing `pendingProps` (props being passed to the new render) with `memoizedProps` (props from the last committed render).",
          "testCases": [
            {
              "id": 1,
              "name": "Initializes fiber node with null pointers",
              "input": "createFiberNode('HostComponent', 'div')",
              "expected": {
                "child": null,
                "sibling": null,
                "return": null
              },
              "testFn": "const f = createFiberNode('HostComponent', 'div'); return { child: f.child, sibling: f.sibling, return: f.return };"
            },
            {
              "id": 2,
              "name": "Assigns type and pending props",
              "input": "createFiberNode with props",
              "expected": "hello",
              "testFn": "const f = createFiberNode('HostComponent', 'span', { title: 'hello' }); return f.pendingProps.title;"
            },
            {
              "id": 3,
              "name": "Sets alternate to null by default (double buffering)",
              "input": "f.alternate === null",
              "expected": true,
              "testFn": "const f = createFiberNode('FunctionComponent', () => {}); return f.alternate === null;"
            }
          ],
          "solutionCode": "function createFiberNode(tag, type, props = {}) {\n  return {\n    tag,\n    type,\n    pendingProps: props,\n    memoizedProps: null,\n    memoizedState: null,\n    child: null,\n    sibling: null,\n    return: null,\n    alternate: null\n  };\n}\n"
        },
        "questions": [
          {
            "id": "fiber-basic",
            "title": "Fiber Node Factory",
            "difficulty": "Basic",
            "concept": "Fiber Node Structure & Pointers",
            "description": "Implement `createFiberNode(tag, type, props)` that initializes a Fiber node with `child: null`, `sibling: null`, `return: null`, `memoizedProps`, and `alternate: null`.",
            "starterCode": "function createFiberNode(tag, type, props = {}) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Confusing `pendingProps` (props being passed to the new render) with `memoizedProps` (props from the last committed render).",
            "testCases": [
              {
                "id": 1,
                "name": "Initializes fiber node with null pointers",
                "input": "createFiberNode('HostComponent', 'div')",
                "expected": {
                  "child": null,
                  "sibling": null,
                  "return": null
                },
                "testFn": "const f = createFiberNode('HostComponent', 'div'); return { child: f.child, sibling: f.sibling, return: f.return };"
              },
              {
                "id": 2,
                "name": "Assigns type and pending props",
                "input": "createFiberNode with props",
                "expected": "hello",
                "testFn": "const f = createFiberNode('HostComponent', 'span', { title: 'hello' }); return f.pendingProps.title;"
              },
              {
                "id": 3,
                "name": "Sets alternate to null by default (double buffering)",
                "input": "f.alternate === null",
                "expected": true,
                "testFn": "const f = createFiberNode('FunctionComponent', () => {}); return f.alternate === null;"
              }
            ],
            "solutionCode": "function createFiberNode(tag, type, props = {}) {\n  return {\n    tag,\n    type,\n    pendingProps: props,\n    memoizedProps: null,\n    memoizedState: null,\n    child: null,\n    sibling: null,\n    return: null,\n    alternate: null\n  };\n}\n"
          },
          {
            "id": "fiber-medium",
            "title": "Simulate Fiber Child & Sibling Pointer Linker",
            "difficulty": "Medium",
            "concept": "Fiber Tree Linking & Return Pointers",
            "description": "Implement `linkFiberChildren(parentFiber, childElements)` that takes a parent Fiber node and an array of child element descriptors, converts them into Fiber nodes, links the parent's `child` to the first child, links each child to its next `sibling`, and sets every child's `return` pointer back to `parentFiber`.",
            "starterCode": "function linkFiberChildren(parentFiber, childElements) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Forgetting to set the `return` pointer on each sibling. The return pointer allows React to walk back up the tree without a call stack.",
            "testCases": [
              {
                "id": 1,
                "name": "Links first child to parent.child",
                "input": "parent.child points to first child",
                "expected": "h1",
                "testFn": "const parent = { type: 'div', child: null }; linkFiberChildren(parent, [{ type: 'h1' }, { type: 'p' }]); return parent.child.type;"
              },
              {
                "id": 2,
                "name": "Links siblings in order",
                "input": "first.sibling points to second child",
                "expected": "p",
                "testFn": "const parent = { type: 'div', child: null }; linkFiberChildren(parent, [{ type: 'h1' }, { type: 'p' }]); return parent.child.sibling.type;"
              },
              {
                "id": 3,
                "name": "Sets return pointers on all children back to parent",
                "input": "both children have return === parent",
                "expected": true,
                "testFn": "const parent = { type: 'div', child: null }; linkFiberChildren(parent, [{ type: 'h1' }, { type: 'p' }]); return parent.child.return === parent && parent.child.sibling.return === parent;"
              }
            ],
            "solutionCode": "function linkFiberChildren(parentFiber, childElements) {\n  if (!childElements || childElements.length === 0) {\n    parentFiber.child = null;\n    return;\n  }\n\n  let prevChild = null;\n\n  for (let i = 0; i < childElements.length; i++) {\n    const el = childElements[i];\n    const newFiber = {\n      type: el.type,\n      child: null,\n      sibling: null,\n      return: parentFiber\n    };\n\n    if (i === 0) {\n      parentFiber.child = newFiber;\n    } else {\n      prevChild.sibling = newFiber;\n    }\n    prevChild = newFiber;\n  }\n}\n"
          },
          {
            "id": "fiber-hard",
            "title": "Iterative Fiber Depth-First Walker (Without Recursion)",
            "difficulty": "Hard",
            "concept": "Depth-First Search using child, sibling, return Pointers",
            "description": "Implement `traverseFiberTree(rootFiber, visitor)` that visits every Fiber node in depth-first pre-order using ONLY `child`, `sibling`, and `return` pointers. Must not use recursion or array stack frames.",
            "starterCode": "function traverseFiberTree(root, visitor) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "This is the exact workLoop algorithm of React's Concurrent Scheduler. If you use recursion, deep component trees exhaust call stack memory.",
            "testCases": [
              {
                "id": 1,
                "name": "Visits parent before children (pre-order)",
                "input": "root -> childA -> childB",
                "expected": [
                  "root",
                  "A",
                  "B"
                ],
                "testFn": "const root = { id: 'root', child: null }; const a = { id: 'A', return: root, child: null, sibling: null }; const b = { id: 'B', return: root, child: null, sibling: null }; root.child = a; a.sibling = b; const order = []; traverseFiberTree(root, f => order.push(f.id)); return order;"
              },
              {
                "id": 2,
                "name": "Navigates deeply nested subtrees",
                "input": "root -> A -> A1 -> B",
                "expected": [
                  "root",
                  "A",
                  "A1",
                  "B"
                ],
                "testFn": "const root = { id: 'root', child: null }; const b = { id: 'B', return: root, child: null, sibling: null }; const a1 = { id: 'A1', child: null, sibling: null }; const a = { id: 'A', return: root, child: a1, sibling: b }; a1.return = a; root.child = a; const order = []; traverseFiberTree(root, f => order.push(f.id)); return order;"
              },
              {
                "id": 3,
                "name": "Terminates cleanly on single root node",
                "input": "root with no children",
                "expected": [
                  "solo"
                ],
                "testFn": "const root = { id: 'solo', child: null, sibling: null, return: null }; const order = []; traverseFiberTree(root, f => order.push(f.id)); return order;"
              }
            ],
            "solutionCode": "function traverseFiberTree(root, visitor) {\n  let current = root;\n\n  while (current) {\n    visitor(current);\n\n    // 1. Walk down to child if exists\n    if (current.child) {\n      current = current.child;\n      continue;\n    }\n\n    // 2. If at root with no child, finish\n    if (current === root) break;\n\n    // 3. Walk to sibling or up return pointers until sibling found\n    while (!current.sibling) {\n      if (!current.return || current.return === root) {\n        return;\n      }\n      current = current.return;\n    }\n\n    current = current.sibling;\n  }\n}\n"
          }
        ]
      },
      {
        "id": "stale-closures-hooks",
        "title": "Stale Closures & Dependency Array Pitfalls",
        "tag": "React Hooks",
        "summary": "Capturing old state snapshots inside event listeners, setTimeout, and setInterval.",
        "mentalModel": "Every React render has its own props, state, and event handlers. A closure formed inside an effect or callback captures variables from that specific render snapshot forever unless re-created or accessed via functional updates/useRef.",
        "traps": "`useEffect(() => { setInterval(() => setCount(count + 1), 1000) }, [])` getting stuck at 1 forever.",
        "challenges": {
          "Basic": {
            "id": "stale-basic",
            "title": "Simulate usePrevious Hook",
            "difficulty": "Basic",
            "concept": "Capturing Previous State via Mutable Ref",
            "description": "Implement `createPreviousTracker()` that mimics React's `usePrevious(value)` hook: on every update with a new value, it returns the value from the PREVIOUS invocation (or undefined on first call).",
            "starterCode": "function createPreviousTracker() {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Returning `currentValue` before updating `prevValue`.",
            "testCases": [
              {
                "id": 1,
                "name": "Returns undefined on first call",
                "input": "update(100)",
                "testFn": "const tracker = createPreviousTracker(); return tracker(100);"
              },
              {
                "id": 2,
                "name": "Returns previous value on second call",
                "input": "update(10) -> update(20)",
                "expected": 10,
                "testFn": "const tracker = createPreviousTracker(); tracker(10); return tracker(20);"
              },
              {
                "id": 3,
                "name": "Continuously steps previous value",
                "input": "1 -> 2 -> 3 returns 2",
                "expected": 2,
                "testFn": "const tracker = createPreviousTracker(); tracker(1); tracker(2); return tracker(3);"
              }
            ],
            "solutionCode": "function createPreviousTracker() {\n  let prevValue = undefined;\n\n  return function update(currentValue) {\n    const toReturn = prevValue;\n    prevValue = currentValue;\n    return toReturn;\n  };\n}\n"
          },
          "Medium": {
            "id": "stale-medium",
            "title": "Fix Stale Closure in Interval Callback",
            "difficulty": "Medium",
            "concept": "Functional State Updates vs Snapshot Closure",
            "description": "In React, `setCount(count + 1)` inside a `setInterval` with an empty dependency array always sees `count = 0`. Implement `createSafeCounter(initialValue)` that uses functional updater semantics `setCount(prev => prev + 1)` so that repeated ticks always compute against the freshest state.",
            "starterCode": "function createSafeCounter(initialValue = 0) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Writing `state = state + 1` or capturing `state` at closure creation time. Passing an updater function `prev => prev + 1` resolves the current value at invocation time.",
            "testCases": [
              {
                "id": 1,
                "name": "Increments accurately across multiple ticks",
                "input": "3 ticks increment state to 3",
                "expected": 3,
                "testFn": "const c = createSafeCounter(0); c.tick(); c.tick(); c.tick(); return c.getState();"
              },
              {
                "id": 2,
                "name": "Works with custom starting value",
                "input": "start at 10, tick 2 times",
                "expected": 12,
                "testFn": "const c = createSafeCounter(10); c.tick(); c.tick(); return c.getState();"
              },
              {
                "id": 3,
                "name": "Functional update receives actual state, not stale snapshot",
                "input": "state updates reliably without external dependencies",
                "expected": 100,
                "testFn": "const c = createSafeCounter(0); for(let i=0; i<100; i++) c.tick(); return c.getState();"
              }
            ],
            "solutionCode": "function createSafeCounter(initialValue = 0) {\n  let state = initialValue;\n\n  function setState(updater) {\n    if (typeof updater === 'function') {\n      state = updater(state);\n    } else {\n      state = updater;\n    }\n  }\n\n  function tick() {\n    setState(prev => prev + 1);\n  }\n\n  return {\n    getState: () => state,\n    tick\n  };\n}\n"
          },
          "Hard": {
            "id": "stale-hard",
            "title": "Simulate React Hook State Machine & Dependency Comparator",
            "difficulty": "Hard",
            "concept": "Hook MemoizedState Linked List & Object.is Dependency Diffing",
            "description": "Implement a simulated hook runner `createHookEngine()` that supports `useState(initial)` and `useEffect(callback, deps)`. `useEffect` should only trigger its callback on the initial render or when any dependency in `deps` has changed according to `Object.is`.",
            "starterCode": "function createHookEngine() {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Using `===` instead of `Object.is` fails on `NaN` (`NaN === NaN` is false, which would falsely re-trigger effects on every render).",
            "testCases": [
              {
                "id": 1,
                "name": "Executes effect on initial mount",
                "input": "effect runs on first render",
                "expected": 1,
                "testFn": "const engine = createHookEngine(); let effectRuns = 0; engine.useEffect(() => effectRuns++, []); return effectRuns;"
              },
              {
                "id": 2,
                "name": "Skips effect when dependency array does not change",
                "input": "effect does not re-run when deps are identical",
                "expected": 1,
                "testFn": "const engine = createHookEngine(); let runs = 0; const render = () => { engine.reset(); engine.useEffect(() => runs++, [1, 'abc']); }; render(); render(); render(); return runs;"
              },
              {
                "id": 3,
                "name": "Re-runs effect when dependency value changes",
                "input": "effect triggers when dep changes from 1 to 2",
                "expected": 2,
                "testFn": "const engine = createHookEngine(); let runs = 0; const render = (val) => { engine.reset(); engine.useEffect(() => runs++, [val]); }; render(1); render(1); render(2); return runs;"
              }
            ],
            "solutionCode": "function createHookEngine() {\n  const hooks = [];\n  let hookIndex = 0;\n\n  function useState(initialState) {\n    const currentIndex = hookIndex++;\n    if (hooks[currentIndex] === undefined) {\n      hooks[currentIndex] = {\n        state: typeof initialState === 'function' ? initialState() : initialState,\n        type: 'state'\n      };\n    }\n\n    const setState = (action) => {\n      const hook = hooks[currentIndex];\n      hook.state = typeof action === 'function' ? action(hook.state) : action;\n    };\n\n    return [hooks[currentIndex].state, setState];\n  }\n\n  function useEffect(callback, deps) {\n    const currentIndex = hookIndex++;\n    const prevHook = hooks[currentIndex];\n    \n    let hasChanged = true;\n    if (prevHook && prevHook.deps && deps) {\n      hasChanged = deps.length !== prevHook.deps.length || deps.some((dep, i) => !Object.is(dep, prevHook.deps[i]));\n    }\n\n    if (hasChanged) {\n      callback();\n    }\n\n    hooks[currentIndex] = {\n      type: 'effect',\n      deps\n    };\n  }\n\n  function reset() {\n    hookIndex = 0;\n  }\n\n  return { useState, useEffect, reset };\n}\n"
          }
        },
        "starterChallenge": {
          "id": "stale-basic",
          "title": "Simulate usePrevious Hook",
          "difficulty": "Basic",
          "concept": "Capturing Previous State via Mutable Ref",
          "description": "Implement `createPreviousTracker()` that mimics React's `usePrevious(value)` hook: on every update with a new value, it returns the value from the PREVIOUS invocation (or undefined on first call).",
          "starterCode": "function createPreviousTracker() {\n  // TODO: Implement solution\n}\n",
          "interviewTrap": "Returning `currentValue` before updating `prevValue`.",
          "testCases": [
            {
              "id": 1,
              "name": "Returns undefined on first call",
              "input": "update(100)",
              "testFn": "const tracker = createPreviousTracker(); return tracker(100);"
            },
            {
              "id": 2,
              "name": "Returns previous value on second call",
              "input": "update(10) -> update(20)",
              "expected": 10,
              "testFn": "const tracker = createPreviousTracker(); tracker(10); return tracker(20);"
            },
            {
              "id": 3,
              "name": "Continuously steps previous value",
              "input": "1 -> 2 -> 3 returns 2",
              "expected": 2,
              "testFn": "const tracker = createPreviousTracker(); tracker(1); tracker(2); return tracker(3);"
            }
          ],
          "solutionCode": "function createPreviousTracker() {\n  let prevValue = undefined;\n\n  return function update(currentValue) {\n    const toReturn = prevValue;\n    prevValue = currentValue;\n    return toReturn;\n  };\n}\n"
        },
        "questions": [
          {
            "id": "stale-basic",
            "title": "Simulate usePrevious Hook",
            "difficulty": "Basic",
            "concept": "Capturing Previous State via Mutable Ref",
            "description": "Implement `createPreviousTracker()` that mimics React's `usePrevious(value)` hook: on every update with a new value, it returns the value from the PREVIOUS invocation (or undefined on first call).",
            "starterCode": "function createPreviousTracker() {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Returning `currentValue` before updating `prevValue`.",
            "testCases": [
              {
                "id": 1,
                "name": "Returns undefined on first call",
                "input": "update(100)",
                "testFn": "const tracker = createPreviousTracker(); return tracker(100);"
              },
              {
                "id": 2,
                "name": "Returns previous value on second call",
                "input": "update(10) -> update(20)",
                "expected": 10,
                "testFn": "const tracker = createPreviousTracker(); tracker(10); return tracker(20);"
              },
              {
                "id": 3,
                "name": "Continuously steps previous value",
                "input": "1 -> 2 -> 3 returns 2",
                "expected": 2,
                "testFn": "const tracker = createPreviousTracker(); tracker(1); tracker(2); return tracker(3);"
              }
            ],
            "solutionCode": "function createPreviousTracker() {\n  let prevValue = undefined;\n\n  return function update(currentValue) {\n    const toReturn = prevValue;\n    prevValue = currentValue;\n    return toReturn;\n  };\n}\n"
          },
          {
            "id": "stale-medium",
            "title": "Fix Stale Closure in Interval Callback",
            "difficulty": "Medium",
            "concept": "Functional State Updates vs Snapshot Closure",
            "description": "In React, `setCount(count + 1)` inside a `setInterval` with an empty dependency array always sees `count = 0`. Implement `createSafeCounter(initialValue)` that uses functional updater semantics `setCount(prev => prev + 1)` so that repeated ticks always compute against the freshest state.",
            "starterCode": "function createSafeCounter(initialValue = 0) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Writing `state = state + 1` or capturing `state` at closure creation time. Passing an updater function `prev => prev + 1` resolves the current value at invocation time.",
            "testCases": [
              {
                "id": 1,
                "name": "Increments accurately across multiple ticks",
                "input": "3 ticks increment state to 3",
                "expected": 3,
                "testFn": "const c = createSafeCounter(0); c.tick(); c.tick(); c.tick(); return c.getState();"
              },
              {
                "id": 2,
                "name": "Works with custom starting value",
                "input": "start at 10, tick 2 times",
                "expected": 12,
                "testFn": "const c = createSafeCounter(10); c.tick(); c.tick(); return c.getState();"
              },
              {
                "id": 3,
                "name": "Functional update receives actual state, not stale snapshot",
                "input": "state updates reliably without external dependencies",
                "expected": 100,
                "testFn": "const c = createSafeCounter(0); for(let i=0; i<100; i++) c.tick(); return c.getState();"
              }
            ],
            "solutionCode": "function createSafeCounter(initialValue = 0) {\n  let state = initialValue;\n\n  function setState(updater) {\n    if (typeof updater === 'function') {\n      state = updater(state);\n    } else {\n      state = updater;\n    }\n  }\n\n  function tick() {\n    setState(prev => prev + 1);\n  }\n\n  return {\n    getState: () => state,\n    tick\n  };\n}\n"
          },
          {
            "id": "stale-hard",
            "title": "Simulate React Hook State Machine & Dependency Comparator",
            "difficulty": "Hard",
            "concept": "Hook MemoizedState Linked List & Object.is Dependency Diffing",
            "description": "Implement a simulated hook runner `createHookEngine()` that supports `useState(initial)` and `useEffect(callback, deps)`. `useEffect` should only trigger its callback on the initial render or when any dependency in `deps` has changed according to `Object.is`.",
            "starterCode": "function createHookEngine() {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Using `===` instead of `Object.is` fails on `NaN` (`NaN === NaN` is false, which would falsely re-trigger effects on every render).",
            "testCases": [
              {
                "id": 1,
                "name": "Executes effect on initial mount",
                "input": "effect runs on first render",
                "expected": 1,
                "testFn": "const engine = createHookEngine(); let effectRuns = 0; engine.useEffect(() => effectRuns++, []); return effectRuns;"
              },
              {
                "id": 2,
                "name": "Skips effect when dependency array does not change",
                "input": "effect does not re-run when deps are identical",
                "expected": 1,
                "testFn": "const engine = createHookEngine(); let runs = 0; const render = () => { engine.reset(); engine.useEffect(() => runs++, [1, 'abc']); }; render(); render(); render(); return runs;"
              },
              {
                "id": 3,
                "name": "Re-runs effect when dependency value changes",
                "input": "effect triggers when dep changes from 1 to 2",
                "expected": 2,
                "testFn": "const engine = createHookEngine(); let runs = 0; const render = (val) => { engine.reset(); engine.useEffect(() => runs++, [val]); }; render(1); render(1); render(2); return runs;"
              }
            ],
            "solutionCode": "function createHookEngine() {\n  const hooks = [];\n  let hookIndex = 0;\n\n  function useState(initialState) {\n    const currentIndex = hookIndex++;\n    if (hooks[currentIndex] === undefined) {\n      hooks[currentIndex] = {\n        state: typeof initialState === 'function' ? initialState() : initialState,\n        type: 'state'\n      };\n    }\n\n    const setState = (action) => {\n      const hook = hooks[currentIndex];\n      hook.state = typeof action === 'function' ? action(hook.state) : action;\n    };\n\n    return [hooks[currentIndex].state, setState];\n  }\n\n  function useEffect(callback, deps) {\n    const currentIndex = hookIndex++;\n    const prevHook = hooks[currentIndex];\n    \n    let hasChanged = true;\n    if (prevHook && prevHook.deps && deps) {\n      hasChanged = deps.length !== prevHook.deps.length || deps.some((dep, i) => !Object.is(dep, prevHook.deps[i]));\n    }\n\n    if (hasChanged) {\n      callback();\n    }\n\n    hooks[currentIndex] = {\n      type: 'effect',\n      deps\n    };\n  }\n\n  function reset() {\n    hookIndex = 0;\n  }\n\n  return { useState, useEffect, reset };\n}\n"
          }
        ]
      },
      {
        "id": "rerender-optimization",
        "title": "Re-render Cascades & Memoization Strategies",
        "tag": "Performance",
        "summary": "Shallow equality, React.memo, useMemo/useCallback traps, and fine-grained state isolation.",
        "mentalModel": "By default, when a parent component renders, all its child components re-render recursively regardless of whether their props changed. `React.memo` bails out only if all props are shallowly equal.",
        "traps": "Passing inline object literals `<Child style={{ color: 'red' }} />` or inline arrow functions breaks `React.memo` on every single render.",
        "challenges": {
          "Basic": {
            "id": "rerender-basic",
            "title": "Shallow Equality Comparator (shallowEqual)",
            "difficulty": "Basic",
            "concept": "Object & Prop Identity Comparison (Object.is)",
            "description": "Implement `shallowEqual(objA, objB)` matching the exact comparator used by `React.memo` and `PureComponent`. Returns `true` if all own keys are shallowly equal using `Object.is`.",
            "starterCode": "function shallowEqual(objA, objB) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Using `===` instead of `Object.is` causes `+0` and `-0` to match incorrectly and `NaN === NaN` to fail.",
            "testCases": [
              {
                "id": 1,
                "name": "Returns true for objects with identical top-level properties",
                "input": "shallowEqual({ a: 1, b: 'x' }, { a: 1, b: 'x' })",
                "expected": true,
                "testFn": "return shallowEqual({ a: 1, b: 'x' }, { a: 1, b: 'x' });"
              },
              {
                "id": 2,
                "name": "Returns false when nested object references differ",
                "input": "shallowEqual({ inner: {} }, { inner: {} })",
                "expected": false,
                "testFn": "return shallowEqual({ inner: {} }, { inner: {} });"
              },
              {
                "id": 3,
                "name": "Handles NaN properly via Object.is",
                "input": "shallowEqual({ n: NaN }, { n: NaN })",
                "expected": true,
                "testFn": "return shallowEqual({ n: NaN }, { n: NaN });"
              }
            ],
            "solutionCode": "function shallowEqual(objA, objB) {\n  if (Object.is(objA, objB)) return true;\n  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {\n    return false;\n  }\n\n  const keysA = Object.keys(objA);\n  const keysB = Object.keys(objB);\n\n  if (keysA.length !== keysB.length) return false;\n\n  for (let i = 0; i < keysA.length; i++) {\n    const key = keysA[i];\n    if (!Object.prototype.hasOwnProperty.call(objB, key) || !Object.is(objA[key], objB[key])) {\n      return false;\n    }\n  }\n\n  return true;\n}\n"
          },
          "Medium": {
            "id": "rerender-medium",
            "title": "Custom React.memo Simulator",
            "difficulty": "Medium",
            "concept": "Component Memoization & Skip Render Decision",
            "description": "Implement `memoComponent(Component, arePropsEqual = shallowEqual)` that returns a wrapper function tracking the last rendered props and result. If incoming props are equal to previous props, return the cached result without executing `Component`.",
            "starterCode": "function memoComponent(Component, arePropsEqual = shallowEqual) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Not allowing a custom `arePropsEqual` comparator. React allows developers to provide custom comparison functions for complex objects.",
            "testCases": [
              {
                "id": 1,
                "name": "Re-uses cached render when props are unchanged",
                "input": "render twice with identical props runs component once",
                "expected": 1,
                "testFn": "let renders = 0; const Comp = (props) => { renders++; return props.name; }; const Memo = memoComponent(Comp, shallowEqual); Memo({ name: 'Alpha' }); Memo({ name: 'Alpha' }); return renders;"
              },
              {
                "id": 2,
                "name": "Re-renders when props change",
                "input": "changing name triggers new render",
                "expected": 2,
                "testFn": "let renders = 0; const Comp = (props) => { renders++; return props.name; }; const Memo = memoComponent(Comp, shallowEqual); Memo({ name: 'Alpha' }); Memo({ name: 'Beta' }); return renders;"
              },
              {
                "id": 3,
                "name": "Respects custom comparison function",
                "input": "custom comparator ignores title prop",
                "expected": 1,
                "testFn": "let renders = 0; const Comp = (p) => { renders++; return p.id; }; const Memo = memoComponent(Comp, (a, b) => a.id === b.id); Memo({ id: 1, title: 'Old' }); Memo({ id: 1, title: 'New' }); return renders;"
              }
            ],
            "solutionCode": "function memoComponent(Component, arePropsEqual = shallowEqual) {\n  let prevProps = null;\n  let prevResult = null;\n\n  return function Memoized(props) {\n    if (prevProps !== null && arePropsEqual(prevProps, props)) {\n      return prevResult;\n    }\n    prevResult = Component(props);\n    prevProps = props;\n    return prevResult;\n  };\n}\n"
          },
          "Hard": {
            "id": "rerender-hard",
            "title": "Fine-Grained Selector Store (Zustand / Redux pattern)",
            "difficulty": "Hard",
            "concept": "Selective Re-renders & Subscription Notification",
            "description": "Implement `createStore(initialState)` with methods: `getState()`, `setState(partial)`, and `useSelector(selector, equalityFn = Object.is)`. Subscribers are only notified when their selected slice of state actually changes.",
            "starterCode": "function createStore(initialState) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Global state stores that notify all components regardless of which slice changed cause massive app-wide re-render cascades.",
            "testCases": [
              {
                "id": 1,
                "name": "Notifies selector subscriber only when selected property changes",
                "input": "updating counter notifies counter subscriber",
                "expected": [
                  10
                ],
                "testFn": "const store = createStore({ count: 0, text: 'hi' }); const notifications = []; store.subscribeSelector(s => s.count, val => notifications.push(val)); store.setState({ count: 10 }); return notifications;"
              },
              {
                "id": 2,
                "name": "Does not notify subscriber when unrelated state changes",
                "input": "updating text does not notify counter subscriber",
                "expected": 0,
                "testFn": "const store = createStore({ count: 0, text: 'hi' }); let calls = 0; store.subscribeSelector(s => s.count, () => calls++); store.setState({ text: 'updated' }); return calls;"
              },
              {
                "id": 3,
                "name": "Unsubscribe cleans up listener properly",
                "input": "unsub removes selector subscription",
                "expected": 1,
                "testFn": "const store = createStore({ count: 0 }); let calls = 0; const unsub = store.subscribeSelector(s => s.count, () => calls++); store.setState({ count: 1 }); unsub(); store.setState({ count: 2 }); return calls;"
              }
            ],
            "solutionCode": "function createStore(initialState) {\n  let state = initialState;\n  const subscribers = new Set();\n\n  function getState() {\n    return state;\n  }\n\n  function setState(partial) {\n    const nextState = typeof partial === 'function' ? partial(state) : { ...state, ...partial };\n    state = nextState;\n    for (const sub of subscribers) {\n      sub();\n    }\n  }\n\n  function subscribe(listener) {\n    subscribers.add(listener);\n    return () => subscribers.delete(listener);\n  }\n\n  function subscribeSelector(selector, onChange, equalityFn = Object.is) {\n    let currentSlice = selector(state);\n    return subscribe(() => {\n      const nextSlice = selector(state);\n      if (!equalityFn(currentSlice, nextSlice)) {\n        currentSlice = nextSlice;\n        onChange(nextSlice);\n      }\n    });\n  }\n\n  return { getState, setState, subscribe, subscribeSelector };\n}\n"
          }
        },
        "starterChallenge": {
          "id": "rerender-basic",
          "title": "Shallow Equality Comparator (shallowEqual)",
          "difficulty": "Basic",
          "concept": "Object & Prop Identity Comparison (Object.is)",
          "description": "Implement `shallowEqual(objA, objB)` matching the exact comparator used by `React.memo` and `PureComponent`. Returns `true` if all own keys are shallowly equal using `Object.is`.",
          "starterCode": "function shallowEqual(objA, objB) {\n  // TODO: Implement solution\n}\n",
          "interviewTrap": "Using `===` instead of `Object.is` causes `+0` and `-0` to match incorrectly and `NaN === NaN` to fail.",
          "testCases": [
            {
              "id": 1,
              "name": "Returns true for objects with identical top-level properties",
              "input": "shallowEqual({ a: 1, b: 'x' }, { a: 1, b: 'x' })",
              "expected": true,
              "testFn": "return shallowEqual({ a: 1, b: 'x' }, { a: 1, b: 'x' });"
            },
            {
              "id": 2,
              "name": "Returns false when nested object references differ",
              "input": "shallowEqual({ inner: {} }, { inner: {} })",
              "expected": false,
              "testFn": "return shallowEqual({ inner: {} }, { inner: {} });"
            },
            {
              "id": 3,
              "name": "Handles NaN properly via Object.is",
              "input": "shallowEqual({ n: NaN }, { n: NaN })",
              "expected": true,
              "testFn": "return shallowEqual({ n: NaN }, { n: NaN });"
            }
          ],
          "solutionCode": "function shallowEqual(objA, objB) {\n  if (Object.is(objA, objB)) return true;\n  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {\n    return false;\n  }\n\n  const keysA = Object.keys(objA);\n  const keysB = Object.keys(objB);\n\n  if (keysA.length !== keysB.length) return false;\n\n  for (let i = 0; i < keysA.length; i++) {\n    const key = keysA[i];\n    if (!Object.prototype.hasOwnProperty.call(objB, key) || !Object.is(objA[key], objB[key])) {\n      return false;\n    }\n  }\n\n  return true;\n}\n"
        },
        "questions": [
          {
            "id": "rerender-basic",
            "title": "Shallow Equality Comparator (shallowEqual)",
            "difficulty": "Basic",
            "concept": "Object & Prop Identity Comparison (Object.is)",
            "description": "Implement `shallowEqual(objA, objB)` matching the exact comparator used by `React.memo` and `PureComponent`. Returns `true` if all own keys are shallowly equal using `Object.is`.",
            "starterCode": "function shallowEqual(objA, objB) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Using `===` instead of `Object.is` causes `+0` and `-0` to match incorrectly and `NaN === NaN` to fail.",
            "testCases": [
              {
                "id": 1,
                "name": "Returns true for objects with identical top-level properties",
                "input": "shallowEqual({ a: 1, b: 'x' }, { a: 1, b: 'x' })",
                "expected": true,
                "testFn": "return shallowEqual({ a: 1, b: 'x' }, { a: 1, b: 'x' });"
              },
              {
                "id": 2,
                "name": "Returns false when nested object references differ",
                "input": "shallowEqual({ inner: {} }, { inner: {} })",
                "expected": false,
                "testFn": "return shallowEqual({ inner: {} }, { inner: {} });"
              },
              {
                "id": 3,
                "name": "Handles NaN properly via Object.is",
                "input": "shallowEqual({ n: NaN }, { n: NaN })",
                "expected": true,
                "testFn": "return shallowEqual({ n: NaN }, { n: NaN });"
              }
            ],
            "solutionCode": "function shallowEqual(objA, objB) {\n  if (Object.is(objA, objB)) return true;\n  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {\n    return false;\n  }\n\n  const keysA = Object.keys(objA);\n  const keysB = Object.keys(objB);\n\n  if (keysA.length !== keysB.length) return false;\n\n  for (let i = 0; i < keysA.length; i++) {\n    const key = keysA[i];\n    if (!Object.prototype.hasOwnProperty.call(objB, key) || !Object.is(objA[key], objB[key])) {\n      return false;\n    }\n  }\n\n  return true;\n}\n"
          },
          {
            "id": "rerender-medium",
            "title": "Custom React.memo Simulator",
            "difficulty": "Medium",
            "concept": "Component Memoization & Skip Render Decision",
            "description": "Implement `memoComponent(Component, arePropsEqual = shallowEqual)` that returns a wrapper function tracking the last rendered props and result. If incoming props are equal to previous props, return the cached result without executing `Component`.",
            "starterCode": "function memoComponent(Component, arePropsEqual = shallowEqual) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Not allowing a custom `arePropsEqual` comparator. React allows developers to provide custom comparison functions for complex objects.",
            "testCases": [
              {
                "id": 1,
                "name": "Re-uses cached render when props are unchanged",
                "input": "render twice with identical props runs component once",
                "expected": 1,
                "testFn": "let renders = 0; const Comp = (props) => { renders++; return props.name; }; const Memo = memoComponent(Comp, shallowEqual); Memo({ name: 'Alpha' }); Memo({ name: 'Alpha' }); return renders;"
              },
              {
                "id": 2,
                "name": "Re-renders when props change",
                "input": "changing name triggers new render",
                "expected": 2,
                "testFn": "let renders = 0; const Comp = (props) => { renders++; return props.name; }; const Memo = memoComponent(Comp, shallowEqual); Memo({ name: 'Alpha' }); Memo({ name: 'Beta' }); return renders;"
              },
              {
                "id": 3,
                "name": "Respects custom comparison function",
                "input": "custom comparator ignores title prop",
                "expected": 1,
                "testFn": "let renders = 0; const Comp = (p) => { renders++; return p.id; }; const Memo = memoComponent(Comp, (a, b) => a.id === b.id); Memo({ id: 1, title: 'Old' }); Memo({ id: 1, title: 'New' }); return renders;"
              }
            ],
            "solutionCode": "function memoComponent(Component, arePropsEqual = shallowEqual) {\n  let prevProps = null;\n  let prevResult = null;\n\n  return function Memoized(props) {\n    if (prevProps !== null && arePropsEqual(prevProps, props)) {\n      return prevResult;\n    }\n    prevResult = Component(props);\n    prevProps = props;\n    return prevResult;\n  };\n}\n"
          },
          {
            "id": "rerender-hard",
            "title": "Fine-Grained Selector Store (Zustand / Redux pattern)",
            "difficulty": "Hard",
            "concept": "Selective Re-renders & Subscription Notification",
            "description": "Implement `createStore(initialState)` with methods: `getState()`, `setState(partial)`, and `useSelector(selector, equalityFn = Object.is)`. Subscribers are only notified when their selected slice of state actually changes.",
            "starterCode": "function createStore(initialState) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Global state stores that notify all components regardless of which slice changed cause massive app-wide re-render cascades.",
            "testCases": [
              {
                "id": 1,
                "name": "Notifies selector subscriber only when selected property changes",
                "input": "updating counter notifies counter subscriber",
                "expected": [
                  10
                ],
                "testFn": "const store = createStore({ count: 0, text: 'hi' }); const notifications = []; store.subscribeSelector(s => s.count, val => notifications.push(val)); store.setState({ count: 10 }); return notifications;"
              },
              {
                "id": 2,
                "name": "Does not notify subscriber when unrelated state changes",
                "input": "updating text does not notify counter subscriber",
                "expected": 0,
                "testFn": "const store = createStore({ count: 0, text: 'hi' }); let calls = 0; store.subscribeSelector(s => s.count, () => calls++); store.setState({ text: 'updated' }); return calls;"
              },
              {
                "id": 3,
                "name": "Unsubscribe cleans up listener properly",
                "input": "unsub removes selector subscription",
                "expected": 1,
                "testFn": "const store = createStore({ count: 0 }); let calls = 0; const unsub = store.subscribeSelector(s => s.count, () => calls++); store.setState({ count: 1 }); unsub(); store.setState({ count: 2 }); return calls;"
              }
            ],
            "solutionCode": "function createStore(initialState) {\n  let state = initialState;\n  const subscribers = new Set();\n\n  function getState() {\n    return state;\n  }\n\n  function setState(partial) {\n    const nextState = typeof partial === 'function' ? partial(state) : { ...state, ...partial };\n    state = nextState;\n    for (const sub of subscribers) {\n      sub();\n    }\n  }\n\n  function subscribe(listener) {\n    subscribers.add(listener);\n    return () => subscribers.delete(listener);\n  }\n\n  function subscribeSelector(selector, onChange, equalityFn = Object.is) {\n    let currentSlice = selector(state);\n    return subscribe(() => {\n      const nextSlice = selector(state);\n      if (!equalityFn(currentSlice, nextSlice)) {\n        currentSlice = nextSlice;\n        onChange(nextSlice);\n      }\n    });\n  }\n\n  return { getState, setState, subscribe, subscribeSelector };\n}\n"
          }
        ]
      }
    ]
  },
  {
    "id": "memory-gc-internals",
    "category": "7. Garbage Collection & Memory Management",
    "badge": "Memory Systems",
    "description": "Master V8 Mark-and-Sweep garbage collection, reference retention, WeakMap, WeakSet, and FinalizationRegistry.",
    "topics": [
      {
        "id": "gc-weak-refs",
        "title": "Garbage Collection, Memory Leaks & Weak References",
        "tag": "Memory",
        "summary": "Mark-and-sweep mechanics, root reachability, object retention trees, WeakMap for metadata caching, and WeakRef.",
        "mentalModel": "Objects remain allocated in the V8 heap as long as they are reachable from GC Roots (Global Object, Call Stack, DOM Trees). Weak references allow referencing an object without incrementing its reachability count, preventing memory leaks when targets are discarded.",
        "traps": "Retaining DOM nodes in closures, detached DOM trees, accumulating keys in regular Map/Set, and relying on FinalizationRegistry for deterministic cleanup.",
        "challenges": {
          "Basic": {
            "id": "gc-weakmap-cache-basic",
            "title": "Leak-Free Object Metadata Cache with WeakMap",
            "difficulty": "Basic",
            "concept": "WeakMap Ephemeral Key Lifecycle & Garbage Collection",
            "description": "Implement a metadata tracking cache `createMetadataStore()` that allows attaching metadata (such as access counts and labels) to arbitrary target objects without preventing the target objects from being garbage collected. Provide methods: `set(target, key, value)`, `get(target, key)`, and `has(target, key)`.",
            "starterCode": "/**\n * Creates an ephemeral metadata store using WeakMap to prevent memory leaks.\n */\nfunction createMetadataStore() {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Using a standard Map or plain object keeps strong references to target objects in memory, causing silent memory leaks when DOM elements or temporary objects are removed from the page.",
            "testCases": [
              {
                "id": 1,
                "name": "Sets and retrieves metadata for an object",
                "input": "store.set(obj, 'visited', true); store.get(obj, 'visited')",
                "expected": true,
                "testFn": "const store = createMetadataStore(); const obj = { id: 1 }; store.set(obj, 'visited', true); return store.get(obj, 'visited');"
              },
              {
                "id": 2,
                "name": "Handles multiple independent objects without cross-contamination",
                "input": "store.set(objA, 'tag', 'A'); store.set(objB, 'tag', 'B')",
                "expected": "A-B",
                "testFn": "const store = createMetadataStore(); const a = {}; const b = {}; store.set(a, 'tag', 'A'); store.set(b, 'tag', 'B'); return store.get(a, 'tag') + '-' + store.get(b, 'tag');"
              },
              {
                "id": 3,
                "name": "Returns undefined and false for non-existent keys",
                "input": "store.has(obj, 'missing') and store.get(obj, 'missing')",
                "expected": false,
                "testFn": "const store = createMetadataStore(); const obj = {}; return store.has(obj, 'nonExistent');"
              }
            ],
            "solutionCode": "/**\n * Creates an ephemeral metadata store using WeakMap to prevent memory leaks.\n */\nfunction createMetadataStore() {\n  const store = new WeakMap();\n  return {\n    set(target, key, val) {\n      if (!store.has(target)) {\n        store.set(target, {});\n      }\n      store.get(target)[key] = val;\n    },\n    get(target, key) {\n      const meta = store.get(target);\n      return meta ? meta[key] : undefined;\n    },\n    has(target, key) {\n      const meta = store.get(target);\n      return meta ? Object.prototype.hasOwnProperty.call(meta, key) : false;\n    }\n  };\n}\n"
          },
          "Medium": {
            "id": "gc-weakref-registry-medium",
            "title": "Ephemeral Cache with WeakRef & Memory Reclamation",
            "difficulty": "Medium",
            "concept": "WeakRef Dereferencing & Manual Cache Cleanup",
            "description": "Implement an ephemeral in-memory cache `createEphemeralCache()` that stores objects using `WeakRef`. Methods: `set(key, obj)`, `get(key)` (returns the dereferenced object or `undefined` if garbage collected or missing), and `cleanup()` (removes entries whose references have been cleared).",
            "starterCode": "/**\n * Creates an ephemeral cache storing objects through WeakRef.\n */\nfunction createEphemeralCache() {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "A WeakRef object itself is a strong heap reference if stored in a Map. Without a cleanup pass or FinalizationRegistry, dead keys accumulate in the Map structure even though the targets are collected.",
            "testCases": [
              {
                "id": 1,
                "name": "Stores and dereferences live object",
                "input": "cache.set('user', user); cache.get('user').name",
                "expected": "Antigravity",
                "testFn": "const cache = createEphemeralCache(); const user = { name: 'Antigravity' }; cache.set('user', user); return cache.get('user').name;"
              },
              {
                "id": 2,
                "name": "Returns undefined for non-existent keys",
                "input": "cache.get('unknown')",
                "expected": true,
                "testFn": "const cache = createEphemeralCache(); return cache.get('unknown') === undefined;"
              },
              {
                "id": 3,
                "name": "Reports accurate map size",
                "input": "cache.set('a', a); cache.set('b', b); cache.size()",
                "expected": 2,
                "testFn": "const cache = createEphemeralCache(); const a = {}; const b = {}; cache.set('a', a); cache.set('b', b); return cache.size();"
              }
            ],
            "solutionCode": "/**\n * Creates an ephemeral cache storing objects through WeakRef.\n */\nfunction createEphemeralCache() {\n  const map = new Map();\n  return {\n    set(key, obj) {\n      map.set(key, new WeakRef(obj));\n    },\n    get(key) {\n      const ref = map.get(key);\n      if (!ref) return undefined;\n      const target = ref.deref();\n      if (!target) {\n        map.delete(key);\n        return undefined;\n      }\n      return target;\n    },\n    cleanup() {\n      let cleaned = 0;\n      for (const [key, ref] of map.entries()) {\n        if (!ref.deref()) {\n          map.delete(key);\n          cleaned++;\n        }\n      }\n      return cleaned;\n    },\n    size() {\n      return map.size;\n    }\n  };\n}\n"
          },
          "Hard": {
            "id": "gc-cycle-detector-hard",
            "title": "Retained Memory Cycle & Detached Node Detector",
            "difficulty": "Hard",
            "concept": "Object Graph Reachability & Circular Memory Reference Detection",
            "description": "Implement `findRetainedCycles(root)` that traverses an arbitrary object graph and identifies all circular reference paths that retain memory. Return an array of detected cycle paths formatted as strings, e.g. `['root.child.parent -> root']`.",
            "starterCode": "/**\n * Detects circular memory retention paths within an object graph.\n * @param {object} root - Root object of the graph\n * @returns {string[]} Array of string path representations of cycles\n */\nfunction findRetainedCycles(root) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Cycles between orphaned objects are collected by modern Mark-and-Sweep GC, but if any node in the cycle is retained by a root closure or global event listener, the entire graph remains pinned in memory.",
            "testCases": [
              {
                "id": 1,
                "name": "Detects direct circular self-reference",
                "input": "obj.self = obj",
                "expected": [
                  "root.self -> root"
                ],
                "testFn": "const obj = {}; obj.self = obj; return findRetainedCycles(obj);"
              },
              {
                "id": 2,
                "name": "Detects multi-hop circular reference across children",
                "input": "parent.child.parent = parent",
                "expected": [
                  "root.child.parent -> root"
                ],
                "testFn": "const p = { child: {} }; p.child.parent = p; return findRetainedCycles(p);"
              },
              {
                "id": 3,
                "name": "Returns empty array on clean acyclic object graph",
                "input": "{ a: { b: 1 }, c: 2 }",
                "expected": [],
                "testFn": "const clean = { a: { b: 1 }, c: 2 }; return findRetainedCycles(clean);"
              }
            ],
            "solutionCode": "/**\n * Detects circular memory retention paths within an object graph.\n * @param {object} root - Root object of the graph\n * @returns {string[]} Array of string path representations of cycles\n */\nfunction findRetainedCycles(root) {\n  const cycles = [];\n  const visited = new Map(); // object -> path\n\n  function traverse(curr, path) {\n    if (!curr || typeof curr !== 'object') return;\n    if (visited.has(curr)) {\n      cycles.push(path + ' -> ' + visited.get(curr));\n      return;\n    }\n    visited.set(curr, path);\n    for (const key of Object.keys(curr)) {\n      traverse(curr[key], path + '.' + key);\n    }\n    visited.delete(curr);\n  }\n\n  traverse(root, 'root');\n  return cycles;\n}\n"
          }
        },
        "starterChallenge": {
          "id": "gc-weakmap-cache-basic",
          "title": "Leak-Free Object Metadata Cache with WeakMap",
          "difficulty": "Basic",
          "concept": "WeakMap Ephemeral Key Lifecycle & Garbage Collection",
          "description": "Implement a metadata tracking cache `createMetadataStore()` that allows attaching metadata (such as access counts and labels) to arbitrary target objects without preventing the target objects from being garbage collected. Provide methods: `set(target, key, value)`, `get(target, key)`, and `has(target, key)`.",
          "starterCode": "/**\n * Creates an ephemeral metadata store using WeakMap to prevent memory leaks.\n */\nfunction createMetadataStore() {\n  // TODO: Implement solution\n}\n",
          "interviewTrap": "Using a standard Map or plain object keeps strong references to target objects in memory, causing silent memory leaks when DOM elements or temporary objects are removed from the page.",
          "testCases": [
            {
              "id": 1,
              "name": "Sets and retrieves metadata for an object",
              "input": "store.set(obj, 'visited', true); store.get(obj, 'visited')",
              "expected": true,
              "testFn": "const store = createMetadataStore(); const obj = { id: 1 }; store.set(obj, 'visited', true); return store.get(obj, 'visited');"
            },
            {
              "id": 2,
              "name": "Handles multiple independent objects without cross-contamination",
              "input": "store.set(objA, 'tag', 'A'); store.set(objB, 'tag', 'B')",
              "expected": "A-B",
              "testFn": "const store = createMetadataStore(); const a = {}; const b = {}; store.set(a, 'tag', 'A'); store.set(b, 'tag', 'B'); return store.get(a, 'tag') + '-' + store.get(b, 'tag');"
            },
            {
              "id": 3,
              "name": "Returns undefined and false for non-existent keys",
              "input": "store.has(obj, 'missing') and store.get(obj, 'missing')",
              "expected": false,
              "testFn": "const store = createMetadataStore(); const obj = {}; return store.has(obj, 'nonExistent');"
            }
          ],
          "solutionCode": "/**\n * Creates an ephemeral metadata store using WeakMap to prevent memory leaks.\n */\nfunction createMetadataStore() {\n  const store = new WeakMap();\n  return {\n    set(target, key, val) {\n      if (!store.has(target)) {\n        store.set(target, {});\n      }\n      store.get(target)[key] = val;\n    },\n    get(target, key) {\n      const meta = store.get(target);\n      return meta ? meta[key] : undefined;\n    },\n    has(target, key) {\n      const meta = store.get(target);\n      return meta ? Object.prototype.hasOwnProperty.call(meta, key) : false;\n    }\n  };\n}\n"
        },
        "questions": [
          {
            "id": "gc-weakmap-cache-basic",
            "title": "Leak-Free Object Metadata Cache with WeakMap",
            "difficulty": "Basic",
            "concept": "WeakMap Ephemeral Key Lifecycle & Garbage Collection",
            "description": "Implement a metadata tracking cache `createMetadataStore()` that allows attaching metadata (such as access counts and labels) to arbitrary target objects without preventing the target objects from being garbage collected. Provide methods: `set(target, key, value)`, `get(target, key)`, and `has(target, key)`.",
            "starterCode": "/**\n * Creates an ephemeral metadata store using WeakMap to prevent memory leaks.\n */\nfunction createMetadataStore() {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Using a standard Map or plain object keeps strong references to target objects in memory, causing silent memory leaks when DOM elements or temporary objects are removed from the page.",
            "testCases": [
              {
                "id": 1,
                "name": "Sets and retrieves metadata for an object",
                "input": "store.set(obj, 'visited', true); store.get(obj, 'visited')",
                "expected": true,
                "testFn": "const store = createMetadataStore(); const obj = { id: 1 }; store.set(obj, 'visited', true); return store.get(obj, 'visited');"
              },
              {
                "id": 2,
                "name": "Handles multiple independent objects without cross-contamination",
                "input": "store.set(objA, 'tag', 'A'); store.set(objB, 'tag', 'B')",
                "expected": "A-B",
                "testFn": "const store = createMetadataStore(); const a = {}; const b = {}; store.set(a, 'tag', 'A'); store.set(b, 'tag', 'B'); return store.get(a, 'tag') + '-' + store.get(b, 'tag');"
              },
              {
                "id": 3,
                "name": "Returns undefined and false for non-existent keys",
                "input": "store.has(obj, 'missing') and store.get(obj, 'missing')",
                "expected": false,
                "testFn": "const store = createMetadataStore(); const obj = {}; return store.has(obj, 'nonExistent');"
              }
            ],
            "solutionCode": "/**\n * Creates an ephemeral metadata store using WeakMap to prevent memory leaks.\n */\nfunction createMetadataStore() {\n  const store = new WeakMap();\n  return {\n    set(target, key, val) {\n      if (!store.has(target)) {\n        store.set(target, {});\n      }\n      store.get(target)[key] = val;\n    },\n    get(target, key) {\n      const meta = store.get(target);\n      return meta ? meta[key] : undefined;\n    },\n    has(target, key) {\n      const meta = store.get(target);\n      return meta ? Object.prototype.hasOwnProperty.call(meta, key) : false;\n    }\n  };\n}\n"
          },
          {
            "id": "gc-weakref-registry-medium",
            "title": "Ephemeral Cache with WeakRef & Memory Reclamation",
            "difficulty": "Medium",
            "concept": "WeakRef Dereferencing & Manual Cache Cleanup",
            "description": "Implement an ephemeral in-memory cache `createEphemeralCache()` that stores objects using `WeakRef`. Methods: `set(key, obj)`, `get(key)` (returns the dereferenced object or `undefined` if garbage collected or missing), and `cleanup()` (removes entries whose references have been cleared).",
            "starterCode": "/**\n * Creates an ephemeral cache storing objects through WeakRef.\n */\nfunction createEphemeralCache() {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "A WeakRef object itself is a strong heap reference if stored in a Map. Without a cleanup pass or FinalizationRegistry, dead keys accumulate in the Map structure even though the targets are collected.",
            "testCases": [
              {
                "id": 1,
                "name": "Stores and dereferences live object",
                "input": "cache.set('user', user); cache.get('user').name",
                "expected": "Antigravity",
                "testFn": "const cache = createEphemeralCache(); const user = { name: 'Antigravity' }; cache.set('user', user); return cache.get('user').name;"
              },
              {
                "id": 2,
                "name": "Returns undefined for non-existent keys",
                "input": "cache.get('unknown')",
                "expected": true,
                "testFn": "const cache = createEphemeralCache(); return cache.get('unknown') === undefined;"
              },
              {
                "id": 3,
                "name": "Reports accurate map size",
                "input": "cache.set('a', a); cache.set('b', b); cache.size()",
                "expected": 2,
                "testFn": "const cache = createEphemeralCache(); const a = {}; const b = {}; cache.set('a', a); cache.set('b', b); return cache.size();"
              }
            ],
            "solutionCode": "/**\n * Creates an ephemeral cache storing objects through WeakRef.\n */\nfunction createEphemeralCache() {\n  const map = new Map();\n  return {\n    set(key, obj) {\n      map.set(key, new WeakRef(obj));\n    },\n    get(key) {\n      const ref = map.get(key);\n      if (!ref) return undefined;\n      const target = ref.deref();\n      if (!target) {\n        map.delete(key);\n        return undefined;\n      }\n      return target;\n    },\n    cleanup() {\n      let cleaned = 0;\n      for (const [key, ref] of map.entries()) {\n        if (!ref.deref()) {\n          map.delete(key);\n          cleaned++;\n        }\n      }\n      return cleaned;\n    },\n    size() {\n      return map.size;\n    }\n  };\n}\n"
          },
          {
            "id": "gc-cycle-detector-hard",
            "title": "Retained Memory Cycle & Detached Node Detector",
            "difficulty": "Hard",
            "concept": "Object Graph Reachability & Circular Memory Reference Detection",
            "description": "Implement `findRetainedCycles(root)` that traverses an arbitrary object graph and identifies all circular reference paths that retain memory. Return an array of detected cycle paths formatted as strings, e.g. `['root.child.parent -> root']`.",
            "starterCode": "/**\n * Detects circular memory retention paths within an object graph.\n * @param {object} root - Root object of the graph\n * @returns {string[]} Array of string path representations of cycles\n */\nfunction findRetainedCycles(root) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Cycles between orphaned objects are collected by modern Mark-and-Sweep GC, but if any node in the cycle is retained by a root closure or global event listener, the entire graph remains pinned in memory.",
            "testCases": [
              {
                "id": 1,
                "name": "Detects direct circular self-reference",
                "input": "obj.self = obj",
                "expected": [
                  "root.self -> root"
                ],
                "testFn": "const obj = {}; obj.self = obj; return findRetainedCycles(obj);"
              },
              {
                "id": 2,
                "name": "Detects multi-hop circular reference across children",
                "input": "parent.child.parent = parent",
                "expected": [
                  "root.child.parent -> root"
                ],
                "testFn": "const p = { child: {} }; p.child.parent = p; return findRetainedCycles(p);"
              },
              {
                "id": 3,
                "name": "Returns empty array on clean acyclic object graph",
                "input": "{ a: { b: 1 }, c: 2 }",
                "expected": [],
                "testFn": "const clean = { a: { b: 1 }, c: 2 }; return findRetainedCycles(clean);"
              }
            ],
            "solutionCode": "/**\n * Detects circular memory retention paths within an object graph.\n * @param {object} root - Root object of the graph\n * @returns {string[]} Array of string path representations of cycles\n */\nfunction findRetainedCycles(root) {\n  const cycles = [];\n  const visited = new Map(); // object -> path\n\n  function traverse(curr, path) {\n    if (!curr || typeof curr !== 'object') return;\n    if (visited.has(curr)) {\n      cycles.push(path + ' -> ' + visited.get(curr));\n      return;\n    }\n    visited.set(curr, path);\n    for (const key of Object.keys(curr)) {\n      traverse(curr[key], path + '.' + key);\n    }\n    visited.delete(curr);\n  }\n\n  traverse(root, 'root');\n  return cycles;\n}\n"
          }
        ]
      }
    ]
  },
  {
    "id": "metaprogramming-proxy-reflect",
    "category": "8. Metaprogramming: Proxy & Reflect",
    "badge": "Metaprogramming",
    "description": "Intercept fundamental language operations: property access, assignment, function invocation, and define reactive data patterns.",
    "topics": [
      {
        "id": "proxy-reflect",
        "title": "Metaprogramming with Proxy & Reflect",
        "tag": "Proxy & Reflect",
        "summary": "Internal traps ([[Get]], [[Set]], [[Delete]]), Reflect forwarding, receiver binding, and reactive property observation.",
        "mentalModel": "A Proxy wraps a target object and re-routes internal engine operations through handler traps. Using Reflect inside traps ensures correct 'this' receiver binding and preserves default language invariants.",
        "traps": "Failing to pass receiver to Reflect.get/set breaks prototype property inheritance and accessor getters. Invariant violations crash at runtime.",
        "challenges": {
          "Basic": {
            "id": "proxy-negative-index-basic",
            "title": "Python-style Negative Indexing with Proxy",
            "difficulty": "Basic",
            "concept": "Proxy [[Get]] and [[Set]] Trap Interception",
            "description": "Implement `createSmartArray(...initialItems)` that returns a Proxied array supporting negative index reads and writes (e.g., `arr[-1]` accesses the last item, `arr[-2] = 99` modifies the second to last item). Standard positive indices, array methods (`push`, `pop`, `length`), and properties must continue working seamlessly.",
            "starterCode": "/**\n * Creates an array proxy that supports Python-style negative indexing.\n */\nfunction createSmartArray(...items) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Directly accessing target[resolved] instead of Reflect.get(t, resolved, receiver) breaks subclassed arrays and getters. Also, handling non-numeric properties like 'length' or 'slice' must be preserved.",
            "testCases": [
              {
                "id": 1,
                "name": "Reads last element with index -1",
                "input": "smartArr[-1] on [10, 20, 30]",
                "expected": 30,
                "testFn": "const arr = createSmartArray(10, 20, 30); return arr[-1];"
              },
              {
                "id": 2,
                "name": "Mutates element via negative index",
                "input": "smartArr[-2] = 99 on [10, 20, 30]",
                "expected": [
                  10,
                  99,
                  30
                ],
                "testFn": "const arr = createSmartArray(10, 20, 30); arr[-2] = 99; return [arr[0], arr[1], arr[2]];"
              },
              {
                "id": 3,
                "name": "Preserves native array methods and length property",
                "input": "push(40) then verify length and -1 access",
                "expected": 40,
                "testFn": "const arr = createSmartArray(10, 20, 30); arr.push(40); return arr[-1];"
              }
            ],
            "solutionCode": "/**\n * Creates an array proxy that supports Python-style negative indexing.\n */\nfunction createSmartArray(...items) {\n  const target = [...items];\n  return new Proxy(target, {\n    get(t, prop, receiver) {\n      if (typeof prop === 'string') {\n        const idx = Number(prop);\n        if (Number.isInteger(idx) && idx < 0) {\n          const resolved = t.length + idx;\n          return Reflect.get(t, resolved, receiver);\n        }\n      }\n      return Reflect.get(t, prop, receiver);\n    },\n    set(t, prop, val, receiver) {\n      if (typeof prop === 'string') {\n        const idx = Number(prop);\n        if (Number.isInteger(idx) && idx < 0) {\n          const resolved = t.length + idx;\n          return Reflect.set(t, resolved, val, receiver);\n        }\n      }\n      return Reflect.set(t, prop, val, receiver);\n    }\n  });\n}\n"
          },
          "Medium": {
            "id": "proxy-reactive-observable-medium",
            "title": "Deep Reactive Observable Store with Change Listeners",
            "difficulty": "Medium",
            "concept": "Recursive Proxy Trapping & Mutation Notification",
            "description": "Implement `createObservable(initialState, onChange)` that returns a deeply reactive proxy. Whenever any property at any depth is modified or added, `onChange({ path, oldValue, newValue })` must be synchronously triggered. Nested objects accessed or modified must also be reactive.",
            "starterCode": "/**\n * Creates a deeply observable reactive object triggering onChange on mutations.\n */\nfunction createObservable(initialState, onChange) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Shallow proxies fail to notify mutations on nested properties (e.g., store.user.profile.name = 'Alex'). Recursively wrapping targets on get and preserving object identity via WeakMap is essential.",
            "testCases": [
              {
                "id": 1,
                "name": "Triggers on top-level property mutation",
                "input": "store.count = 1",
                "expected": {
                  "path": "count",
                  "oldValue": 0,
                  "newValue": 1
                },
                "testFn": "let change = null; const store = createObservable({ count: 0 }, c => change = c); store.count = 1; return change;"
              },
              {
                "id": 2,
                "name": "Triggers on deeply nested mutation with exact dot path",
                "input": "store.user.profile.city = 'Tokyo'",
                "expected": "user.profile.city:Tokyo",
                "testFn": "let log = ''; const store = createObservable({ user: { profile: { city: 'Paris' } } }, c => log = c.path + ':' + c.newValue); store.user.profile.city = 'Tokyo'; return log;"
              },
              {
                "id": 3,
                "name": "Does not trigger listener when setting identical value",
                "input": "store.value = store.value",
                "expected": 0,
                "testFn": "let calls = 0; const store = createObservable({ val: 42 }, () => calls++); store.val = 42; return calls;"
              }
            ],
            "solutionCode": "/**\n * Creates a deeply observable reactive object triggering onChange on mutations.\n */\nfunction createObservable(initialState, onChange) {\n  const proxyMap = new WeakMap();\n\n  function wrap(target, currentPath) {\n    if (!target || typeof target !== 'object') return target;\n    if (proxyMap.has(target)) return proxyMap.get(target);\n\n    const proxy = new Proxy(target, {\n      get(t, prop, receiver) {\n        const val = Reflect.get(t, prop, receiver);\n        if (typeof prop === 'symbol') return val;\n        if (val && typeof val === 'object') {\n          const nextPath = currentPath ? currentPath + '.' + String(prop) : String(prop);\n          return wrap(val, nextPath);\n        }\n        return val;\n      },\n      set(t, prop, val, receiver) {\n        const oldValue = Reflect.get(t, prop, receiver);\n        if (oldValue === val) return true;\n        const res = Reflect.set(t, prop, val, receiver);\n        const fullPath = currentPath ? currentPath + '.' + String(prop) : String(prop);\n        onChange({ path: fullPath, oldValue, newValue: val });\n        return res;\n      }\n    });\n\n    proxyMap.set(target, proxy);\n    return proxy;\n  }\n\n  return wrap(initialState, '');\n}\n"
          },
          "Hard": {
            "id": "proxy-schema-validator-hard",
            "title": "Enforced Schema Invariants & Revocable Sandboxed Proxy",
            "difficulty": "Hard",
            "concept": "Proxy Invariants, Revocable Proxies & Type Guards",
            "description": "Implement `createSecureSchemaProxy(schema, initialData)` that validates data against a schema on write, throws TypeErrors for unknown properties or type mismatches, and exposes a `revoke()` method that permanently disables all further read/write access.",
            "starterCode": "/**\n * Creates a revocable proxy enforcing a strict property schema.\n */\nfunction createSecureSchemaProxy(schema, initialData) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Failing to handle non-configurable or non-writable invariant checks in Proxy handlers will cause the JS engine to throw an uncatchable runtime TypeError. Revocable proxies are critical for security sandboxes.",
            "testCases": [
              {
                "id": 1,
                "name": "Allows valid property update conforming to schema",
                "input": "proxy.age = 30 where schema expects number",
                "expected": 30,
                "testFn": "const proxy = createSecureSchemaProxy({ name: 'string', age: 'number' }, { name: 'Alice', age: 25 }); proxy.age = 30; return proxy.age;"
              },
              {
                "id": 2,
                "name": "Throws TypeError on forbidden property addition",
                "input": "proxy.hack = true",
                "expected": "Property hack is not allowed by schema",
                "testFn": "const proxy = createSecureSchemaProxy({ name: 'string' }, { name: 'Bob' }); try { proxy.hack = true; return 'no-error'; } catch (e) { return e.message; }"
              },
              {
                "id": 3,
                "name": "Permanently disables proxy access once revoked",
                "input": "proxy.revoke(); then reading proxy.name throws",
                "expected": true,
                "testFn": "const proxy = createSecureSchemaProxy({ name: 'string' }, { name: 'Eve' }); proxy.revoke(); try { const x = proxy.name; return false; } catch (e) { return true; }"
              }
            ],
            "solutionCode": "/**\n * Creates a revocable proxy enforcing a strict property schema.\n */\nfunction createSecureSchemaProxy(schema, initialData) {\n  const target = { ...initialData };\n  for (const [key, type] of Object.entries(schema)) {\n    if (target[key] !== undefined && typeof target[key] !== type) {\n      throw new TypeError('Initial property ' + key + ' must be ' + type);\n    }\n  }\n\n  const { proxy, revoke } = Proxy.revocable(target, {\n    get(t, prop, receiver) {\n      if (prop === 'revoke') return revoke;\n      return Reflect.get(t, prop, receiver);\n    },\n    set(t, prop, val, receiver) {\n      if (typeof prop === 'string' && !(prop in schema)) {\n        throw new TypeError('Property ' + String(prop) + ' is not allowed by schema');\n      }\n      const expectedType = schema[prop];\n      if (typeof val !== expectedType) {\n        throw new TypeError('Property ' + String(prop) + ' must be of type ' + expectedType);\n      }\n      return Reflect.set(t, prop, val, receiver);\n    }\n  });\n\n  return proxy;\n}\n"
          }
        },
        "starterChallenge": {
          "id": "proxy-negative-index-basic",
          "title": "Python-style Negative Indexing with Proxy",
          "difficulty": "Basic",
          "concept": "Proxy [[Get]] and [[Set]] Trap Interception",
          "description": "Implement `createSmartArray(...initialItems)` that returns a Proxied array supporting negative index reads and writes (e.g., `arr[-1]` accesses the last item, `arr[-2] = 99` modifies the second to last item). Standard positive indices, array methods (`push`, `pop`, `length`), and properties must continue working seamlessly.",
          "starterCode": "/**\n * Creates an array proxy that supports Python-style negative indexing.\n */\nfunction createSmartArray(...items) {\n  // TODO: Implement solution\n}\n",
          "interviewTrap": "Directly accessing target[resolved] instead of Reflect.get(t, resolved, receiver) breaks subclassed arrays and getters. Also, handling non-numeric properties like 'length' or 'slice' must be preserved.",
          "testCases": [
            {
              "id": 1,
              "name": "Reads last element with index -1",
              "input": "smartArr[-1] on [10, 20, 30]",
              "expected": 30,
              "testFn": "const arr = createSmartArray(10, 20, 30); return arr[-1];"
            },
            {
              "id": 2,
              "name": "Mutates element via negative index",
              "input": "smartArr[-2] = 99 on [10, 20, 30]",
              "expected": [
                10,
                99,
                30
              ],
              "testFn": "const arr = createSmartArray(10, 20, 30); arr[-2] = 99; return [arr[0], arr[1], arr[2]];"
            },
            {
              "id": 3,
              "name": "Preserves native array methods and length property",
              "input": "push(40) then verify length and -1 access",
              "expected": 40,
              "testFn": "const arr = createSmartArray(10, 20, 30); arr.push(40); return arr[-1];"
            }
          ],
          "solutionCode": "/**\n * Creates an array proxy that supports Python-style negative indexing.\n */\nfunction createSmartArray(...items) {\n  const target = [...items];\n  return new Proxy(target, {\n    get(t, prop, receiver) {\n      if (typeof prop === 'string') {\n        const idx = Number(prop);\n        if (Number.isInteger(idx) && idx < 0) {\n          const resolved = t.length + idx;\n          return Reflect.get(t, resolved, receiver);\n        }\n      }\n      return Reflect.get(t, prop, receiver);\n    },\n    set(t, prop, val, receiver) {\n      if (typeof prop === 'string') {\n        const idx = Number(prop);\n        if (Number.isInteger(idx) && idx < 0) {\n          const resolved = t.length + idx;\n          return Reflect.set(t, resolved, val, receiver);\n        }\n      }\n      return Reflect.set(t, prop, val, receiver);\n    }\n  });\n}\n"
        },
        "questions": [
          {
            "id": "proxy-negative-index-basic",
            "title": "Python-style Negative Indexing with Proxy",
            "difficulty": "Basic",
            "concept": "Proxy [[Get]] and [[Set]] Trap Interception",
            "description": "Implement `createSmartArray(...initialItems)` that returns a Proxied array supporting negative index reads and writes (e.g., `arr[-1]` accesses the last item, `arr[-2] = 99` modifies the second to last item). Standard positive indices, array methods (`push`, `pop`, `length`), and properties must continue working seamlessly.",
            "starterCode": "/**\n * Creates an array proxy that supports Python-style negative indexing.\n */\nfunction createSmartArray(...items) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Directly accessing target[resolved] instead of Reflect.get(t, resolved, receiver) breaks subclassed arrays and getters. Also, handling non-numeric properties like 'length' or 'slice' must be preserved.",
            "testCases": [
              {
                "id": 1,
                "name": "Reads last element with index -1",
                "input": "smartArr[-1] on [10, 20, 30]",
                "expected": 30,
                "testFn": "const arr = createSmartArray(10, 20, 30); return arr[-1];"
              },
              {
                "id": 2,
                "name": "Mutates element via negative index",
                "input": "smartArr[-2] = 99 on [10, 20, 30]",
                "expected": [
                  10,
                  99,
                  30
                ],
                "testFn": "const arr = createSmartArray(10, 20, 30); arr[-2] = 99; return [arr[0], arr[1], arr[2]];"
              },
              {
                "id": 3,
                "name": "Preserves native array methods and length property",
                "input": "push(40) then verify length and -1 access",
                "expected": 40,
                "testFn": "const arr = createSmartArray(10, 20, 30); arr.push(40); return arr[-1];"
              }
            ],
            "solutionCode": "/**\n * Creates an array proxy that supports Python-style negative indexing.\n */\nfunction createSmartArray(...items) {\n  const target = [...items];\n  return new Proxy(target, {\n    get(t, prop, receiver) {\n      if (typeof prop === 'string') {\n        const idx = Number(prop);\n        if (Number.isInteger(idx) && idx < 0) {\n          const resolved = t.length + idx;\n          return Reflect.get(t, resolved, receiver);\n        }\n      }\n      return Reflect.get(t, prop, receiver);\n    },\n    set(t, prop, val, receiver) {\n      if (typeof prop === 'string') {\n        const idx = Number(prop);\n        if (Number.isInteger(idx) && idx < 0) {\n          const resolved = t.length + idx;\n          return Reflect.set(t, resolved, val, receiver);\n        }\n      }\n      return Reflect.set(t, prop, val, receiver);\n    }\n  });\n}\n"
          },
          {
            "id": "proxy-reactive-observable-medium",
            "title": "Deep Reactive Observable Store with Change Listeners",
            "difficulty": "Medium",
            "concept": "Recursive Proxy Trapping & Mutation Notification",
            "description": "Implement `createObservable(initialState, onChange)` that returns a deeply reactive proxy. Whenever any property at any depth is modified or added, `onChange({ path, oldValue, newValue })` must be synchronously triggered. Nested objects accessed or modified must also be reactive.",
            "starterCode": "/**\n * Creates a deeply observable reactive object triggering onChange on mutations.\n */\nfunction createObservable(initialState, onChange) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Shallow proxies fail to notify mutations on nested properties (e.g., store.user.profile.name = 'Alex'). Recursively wrapping targets on get and preserving object identity via WeakMap is essential.",
            "testCases": [
              {
                "id": 1,
                "name": "Triggers on top-level property mutation",
                "input": "store.count = 1",
                "expected": {
                  "path": "count",
                  "oldValue": 0,
                  "newValue": 1
                },
                "testFn": "let change = null; const store = createObservable({ count: 0 }, c => change = c); store.count = 1; return change;"
              },
              {
                "id": 2,
                "name": "Triggers on deeply nested mutation with exact dot path",
                "input": "store.user.profile.city = 'Tokyo'",
                "expected": "user.profile.city:Tokyo",
                "testFn": "let log = ''; const store = createObservable({ user: { profile: { city: 'Paris' } } }, c => log = c.path + ':' + c.newValue); store.user.profile.city = 'Tokyo'; return log;"
              },
              {
                "id": 3,
                "name": "Does not trigger listener when setting identical value",
                "input": "store.value = store.value",
                "expected": 0,
                "testFn": "let calls = 0; const store = createObservable({ val: 42 }, () => calls++); store.val = 42; return calls;"
              }
            ],
            "solutionCode": "/**\n * Creates a deeply observable reactive object triggering onChange on mutations.\n */\nfunction createObservable(initialState, onChange) {\n  const proxyMap = new WeakMap();\n\n  function wrap(target, currentPath) {\n    if (!target || typeof target !== 'object') return target;\n    if (proxyMap.has(target)) return proxyMap.get(target);\n\n    const proxy = new Proxy(target, {\n      get(t, prop, receiver) {\n        const val = Reflect.get(t, prop, receiver);\n        if (typeof prop === 'symbol') return val;\n        if (val && typeof val === 'object') {\n          const nextPath = currentPath ? currentPath + '.' + String(prop) : String(prop);\n          return wrap(val, nextPath);\n        }\n        return val;\n      },\n      set(t, prop, val, receiver) {\n        const oldValue = Reflect.get(t, prop, receiver);\n        if (oldValue === val) return true;\n        const res = Reflect.set(t, prop, val, receiver);\n        const fullPath = currentPath ? currentPath + '.' + String(prop) : String(prop);\n        onChange({ path: fullPath, oldValue, newValue: val });\n        return res;\n      }\n    });\n\n    proxyMap.set(target, proxy);\n    return proxy;\n  }\n\n  return wrap(initialState, '');\n}\n"
          },
          {
            "id": "proxy-schema-validator-hard",
            "title": "Enforced Schema Invariants & Revocable Sandboxed Proxy",
            "difficulty": "Hard",
            "concept": "Proxy Invariants, Revocable Proxies & Type Guards",
            "description": "Implement `createSecureSchemaProxy(schema, initialData)` that validates data against a schema on write, throws TypeErrors for unknown properties or type mismatches, and exposes a `revoke()` method that permanently disables all further read/write access.",
            "starterCode": "/**\n * Creates a revocable proxy enforcing a strict property schema.\n */\nfunction createSecureSchemaProxy(schema, initialData) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Failing to handle non-configurable or non-writable invariant checks in Proxy handlers will cause the JS engine to throw an uncatchable runtime TypeError. Revocable proxies are critical for security sandboxes.",
            "testCases": [
              {
                "id": 1,
                "name": "Allows valid property update conforming to schema",
                "input": "proxy.age = 30 where schema expects number",
                "expected": 30,
                "testFn": "const proxy = createSecureSchemaProxy({ name: 'string', age: 'number' }, { name: 'Alice', age: 25 }); proxy.age = 30; return proxy.age;"
              },
              {
                "id": 2,
                "name": "Throws TypeError on forbidden property addition",
                "input": "proxy.hack = true",
                "expected": "Property hack is not allowed by schema",
                "testFn": "const proxy = createSecureSchemaProxy({ name: 'string' }, { name: 'Bob' }); try { proxy.hack = true; return 'no-error'; } catch (e) { return e.message; }"
              },
              {
                "id": 3,
                "name": "Permanently disables proxy access once revoked",
                "input": "proxy.revoke(); then reading proxy.name throws",
                "expected": true,
                "testFn": "const proxy = createSecureSchemaProxy({ name: 'string' }, { name: 'Eve' }); proxy.revoke(); try { const x = proxy.name; return false; } catch (e) { return true; }"
              }
            ],
            "solutionCode": "/**\n * Creates a revocable proxy enforcing a strict property schema.\n */\nfunction createSecureSchemaProxy(schema, initialData) {\n  const target = { ...initialData };\n  for (const [key, type] of Object.entries(schema)) {\n    if (target[key] !== undefined && typeof target[key] !== type) {\n      throw new TypeError('Initial property ' + key + ' must be ' + type);\n    }\n  }\n\n  const { proxy, revoke } = Proxy.revocable(target, {\n    get(t, prop, receiver) {\n      if (prop === 'revoke') return revoke;\n      return Reflect.get(t, prop, receiver);\n    },\n    set(t, prop, val, receiver) {\n      if (typeof prop === 'string' && !(prop in schema)) {\n        throw new TypeError('Property ' + String(prop) + ' is not allowed by schema');\n      }\n      const expectedType = schema[prop];\n      if (typeof val !== expectedType) {\n        throw new TypeError('Property ' + String(prop) + ' must be of type ' + expectedType);\n      }\n      return Reflect.set(t, prop, val, receiver);\n    }\n  });\n\n  return proxy;\n}\n"
          }
        ]
      }
    ]
  },
  {
    "id": "iterators-generators-coroutines",
    "category": "9. Iterators, Generators & Async Iteration",
    "badge": "Language Grammar",
    "description": "Master the iteration protocol, generator coroutines, yield delegation, and async generators for streaming pipelines.",
    "topics": [
      {
        "id": "iterators-generators",
        "title": "Iterators, Generators & Async Iteration",
        "tag": "Generators",
        "summary": "Iterable and Iterator protocols, Symbol.iterator, yield state suspension, bidirectional communication, and async streams.",
        "mentalModel": "Generators are re-entrant state machines. When yield is encountered, the generator's execution context is suspended and pushed out of the call stack. Calling .next() re-attaches the context and resumes evaluation.",
        "traps": "First .next(val) call cannot receive a value because it only starts the generator. Forgetting yield* delegation wraps iterables into single yielded items.",
        "challenges": {
          "Basic": {
            "id": "generator-fibonacci-basic",
            "title": "Infinite Sequence Generator with Symbol.iterator",
            "difficulty": "Basic",
            "concept": "Generator State Suspension & Iterable Protocol",
            "description": "Implement an iterable object `createFibonacciSequence(limit)` that yields Fibonacci numbers up to `limit`. It must support `for...of` iteration and array spreading `[...createFibonacciSequence(50)]`.",
            "starterCode": "/**\n * Creates an iterable yielding Fibonacci numbers up to limit.\n */\nfunction createFibonacciSequence(limit = 100) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Returning a plain iterator without Symbol.iterator makes an object non-iterable in for...of loops and spread syntax.",
            "testCases": [
              {
                "id": 1,
                "name": "Generates Fibonacci sequence up to limit 20",
                "input": "[...createFibonacciSequence(20)]",
                "expected": [
                  0,
                  1,
                  1,
                  2,
                  3,
                  5,
                  8,
                  13
                ],
                "testFn": "return [...createFibonacciSequence(20)];"
              },
              {
                "id": 2,
                "name": "Handles limit of 0 correctly",
                "input": "[...createFibonacciSequence(0)]",
                "expected": [
                  0
                ],
                "testFn": "return [...createFibonacciSequence(0)];"
              },
              {
                "id": 3,
                "name": "Works seamlessly in standard for...of loop",
                "input": "sum of elements up to 10",
                "expected": 20,
                "testFn": "let sum = 0; for (const n of createFibonacciSequence(10)) sum += n; return sum;"
              }
            ],
            "solutionCode": "/**\n * Creates an iterable yielding Fibonacci numbers up to limit.\n */\nfunction createFibonacciSequence(limit = 100) {\n  return {\n    *[Symbol.iterator]() {\n      let a = 0, b = 1;\n      while (a <= limit) {\n        yield a;\n        const next = a + b;\n        a = b;\n        b = next;\n      }\n    }\n  };\n}\n"
          },
          "Medium": {
            "id": "generator-bidirectional-medium",
            "title": "Bidirectional Coroutine Task Runner",
            "difficulty": "Medium",
            "concept": "Bidirectional Generator Communication via .next(val)",
            "description": "Implement `runConversation(generatorFn, responses)` that steps through a generator function and supplies sequential response values from the `responses` array into each successive `yield` expression, returning an array of all yielded questions and the final return value.",
            "starterCode": "/**\n * Feeds responses into a generator coroutine step-by-step.\n */\nfunction runConversation(generatorFn, responses = []) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "The argument passed to the FIRST .next() call is silently discarded by V8 because execution has not yet reached a yield expression. Passing input starts on the second .next(val) invocation.",
            "testCases": [
              {
                "id": 1,
                "name": "Feeds inputs into yielded expressions",
                "input": "coroutine receives name and age",
                "expected": {
                  "yielded": [
                    "What is your name?",
                    "What is your age?"
                  ],
                  "result": "Profile: Alex, 28"
                },
                "testFn": "function* dialog() { const name = yield 'What is your name?'; const age = yield 'What is your age?'; return 'Profile: ' + name + ', ' + age; } return runConversation(dialog, ['Alex', 28]);"
              },
              {
                "id": 2,
                "name": "Handles immediate return without yields",
                "input": "generator with no yield",
                "expected": {
                  "yielded": [],
                  "result": 42
                },
                "testFn": "function* direct() { return 42; } return runConversation(direct, ['ignore']);"
              },
              {
                "id": 3,
                "name": "Handles fewer responses than yield requests",
                "input": "yields 2 times but only 1 response provided",
                "expected": "Done with undefined",
                "testFn": "function* dialog() { const a = yield 1; const b = yield 2; return 'Done with ' + b; } return runConversation(dialog, ['first']).result;"
              }
            ],
            "solutionCode": "/**\n * Feeds responses into a generator coroutine step-by-step.\n */\nfunction runConversation(generatorFn, responses = []) {\n  const gen = generatorFn();\n  const yielded = [];\n  let step = gen.next();\n  let idx = 0;\n\n  while (!step.done) {\n    yielded.push(step.value);\n    const inputVal = idx < responses.length ? responses[idx] : undefined;\n    idx++;\n    step = gen.next(inputVal);\n  }\n\n  return { yielded, result: step.value };\n}\n"
          },
          "Hard": {
            "id": "async-generator-pipeline-hard",
            "title": "Async Streaming Pipeline with Backpressure & Batching",
            "difficulty": "Hard",
            "concept": "Async Generators & Flow Control Backpressure",
            "description": "Implement `async function* batchAsyncStream(asyncIterable, batchSize)` that reads from an async iterable source and yields arrays of items chunked by `batchSize`. Any remaining items when the stream closes must be yielded in a final partial batch.",
            "starterCode": "/**\n * Chunks an async iterable stream into fixed-size batches.\n */\nasync function* batchAsyncStream(asyncIterable, batchSize = 3) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Failing to handle trailing remaining items when an async iterator completes causes silent data loss. Consuming without backpressure risks memory ballooning.",
            "testCases": [
              {
                "id": 1,
                "name": "Chunks stream into equal batches",
                "input": "Stream of [1, 2, 3, 4] with batchSize 2",
                "expected": [
                  [
                    1,
                    2
                  ],
                  [
                    3,
                    4
                  ]
                ],
                "testFn": "async function* src() { yield 1; yield 2; yield 3; yield 4; } const res = []; for await (const b of batchAsyncStream(src(), 2)) res.push(b); return res;"
              },
              {
                "id": 2,
                "name": "Flushes remaining items on stream completion",
                "input": "Stream of [1, 2, 3, 4, 5] with batchSize 2",
                "expected": [
                  [
                    1,
                    2
                  ],
                  [
                    3,
                    4
                  ],
                  [
                    5
                  ]
                ],
                "testFn": "async function* src() { yield 1; yield 2; yield 3; yield 4; yield 5; } const res = []; for await (const b of batchAsyncStream(src(), 2)) res.push(b); return res;"
              },
              {
                "id": 3,
                "name": "Yields nothing for empty stream",
                "input": "Empty source stream",
                "expected": [],
                "testFn": "async function* src() {} const res = []; for await (const b of batchAsyncStream(src(), 2)) res.push(b); return res;"
              }
            ],
            "solutionCode": "/**\n * Chunks an async iterable stream into fixed-size batches.\n */\nasync function* batchAsyncStream(asyncIterable, batchSize = 3) {\n  let batch = [];\n  for await (const item of asyncIterable) {\n    batch.push(item);\n    if (batch.length >= batchSize) {\n      yield batch;\n      batch = [];\n    }\n  }\n  if (batch.length > 0) {\n    yield batch;\n  }\n}\n"
          }
        },
        "starterChallenge": {
          "id": "generator-fibonacci-basic",
          "title": "Infinite Sequence Generator with Symbol.iterator",
          "difficulty": "Basic",
          "concept": "Generator State Suspension & Iterable Protocol",
          "description": "Implement an iterable object `createFibonacciSequence(limit)` that yields Fibonacci numbers up to `limit`. It must support `for...of` iteration and array spreading `[...createFibonacciSequence(50)]`.",
          "starterCode": "/**\n * Creates an iterable yielding Fibonacci numbers up to limit.\n */\nfunction createFibonacciSequence(limit = 100) {\n  // TODO: Implement solution\n}\n",
          "interviewTrap": "Returning a plain iterator without Symbol.iterator makes an object non-iterable in for...of loops and spread syntax.",
          "testCases": [
            {
              "id": 1,
              "name": "Generates Fibonacci sequence up to limit 20",
              "input": "[...createFibonacciSequence(20)]",
              "expected": [
                0,
                1,
                1,
                2,
                3,
                5,
                8,
                13
              ],
              "testFn": "return [...createFibonacciSequence(20)];"
            },
            {
              "id": 2,
              "name": "Handles limit of 0 correctly",
              "input": "[...createFibonacciSequence(0)]",
              "expected": [
                0
              ],
              "testFn": "return [...createFibonacciSequence(0)];"
            },
            {
              "id": 3,
              "name": "Works seamlessly in standard for...of loop",
              "input": "sum of elements up to 10",
              "expected": 20,
              "testFn": "let sum = 0; for (const n of createFibonacciSequence(10)) sum += n; return sum;"
            }
          ],
          "solutionCode": "/**\n * Creates an iterable yielding Fibonacci numbers up to limit.\n */\nfunction createFibonacciSequence(limit = 100) {\n  return {\n    *[Symbol.iterator]() {\n      let a = 0, b = 1;\n      while (a <= limit) {\n        yield a;\n        const next = a + b;\n        a = b;\n        b = next;\n      }\n    }\n  };\n}\n"
        },
        "questions": [
          {
            "id": "generator-fibonacci-basic",
            "title": "Infinite Sequence Generator with Symbol.iterator",
            "difficulty": "Basic",
            "concept": "Generator State Suspension & Iterable Protocol",
            "description": "Implement an iterable object `createFibonacciSequence(limit)` that yields Fibonacci numbers up to `limit`. It must support `for...of` iteration and array spreading `[...createFibonacciSequence(50)]`.",
            "starterCode": "/**\n * Creates an iterable yielding Fibonacci numbers up to limit.\n */\nfunction createFibonacciSequence(limit = 100) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Returning a plain iterator without Symbol.iterator makes an object non-iterable in for...of loops and spread syntax.",
            "testCases": [
              {
                "id": 1,
                "name": "Generates Fibonacci sequence up to limit 20",
                "input": "[...createFibonacciSequence(20)]",
                "expected": [
                  0,
                  1,
                  1,
                  2,
                  3,
                  5,
                  8,
                  13
                ],
                "testFn": "return [...createFibonacciSequence(20)];"
              },
              {
                "id": 2,
                "name": "Handles limit of 0 correctly",
                "input": "[...createFibonacciSequence(0)]",
                "expected": [
                  0
                ],
                "testFn": "return [...createFibonacciSequence(0)];"
              },
              {
                "id": 3,
                "name": "Works seamlessly in standard for...of loop",
                "input": "sum of elements up to 10",
                "expected": 20,
                "testFn": "let sum = 0; for (const n of createFibonacciSequence(10)) sum += n; return sum;"
              }
            ],
            "solutionCode": "/**\n * Creates an iterable yielding Fibonacci numbers up to limit.\n */\nfunction createFibonacciSequence(limit = 100) {\n  return {\n    *[Symbol.iterator]() {\n      let a = 0, b = 1;\n      while (a <= limit) {\n        yield a;\n        const next = a + b;\n        a = b;\n        b = next;\n      }\n    }\n  };\n}\n"
          },
          {
            "id": "generator-bidirectional-medium",
            "title": "Bidirectional Coroutine Task Runner",
            "difficulty": "Medium",
            "concept": "Bidirectional Generator Communication via .next(val)",
            "description": "Implement `runConversation(generatorFn, responses)` that steps through a generator function and supplies sequential response values from the `responses` array into each successive `yield` expression, returning an array of all yielded questions and the final return value.",
            "starterCode": "/**\n * Feeds responses into a generator coroutine step-by-step.\n */\nfunction runConversation(generatorFn, responses = []) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "The argument passed to the FIRST .next() call is silently discarded by V8 because execution has not yet reached a yield expression. Passing input starts on the second .next(val) invocation.",
            "testCases": [
              {
                "id": 1,
                "name": "Feeds inputs into yielded expressions",
                "input": "coroutine receives name and age",
                "expected": {
                  "yielded": [
                    "What is your name?",
                    "What is your age?"
                  ],
                  "result": "Profile: Alex, 28"
                },
                "testFn": "function* dialog() { const name = yield 'What is your name?'; const age = yield 'What is your age?'; return 'Profile: ' + name + ', ' + age; } return runConversation(dialog, ['Alex', 28]);"
              },
              {
                "id": 2,
                "name": "Handles immediate return without yields",
                "input": "generator with no yield",
                "expected": {
                  "yielded": [],
                  "result": 42
                },
                "testFn": "function* direct() { return 42; } return runConversation(direct, ['ignore']);"
              },
              {
                "id": 3,
                "name": "Handles fewer responses than yield requests",
                "input": "yields 2 times but only 1 response provided",
                "expected": "Done with undefined",
                "testFn": "function* dialog() { const a = yield 1; const b = yield 2; return 'Done with ' + b; } return runConversation(dialog, ['first']).result;"
              }
            ],
            "solutionCode": "/**\n * Feeds responses into a generator coroutine step-by-step.\n */\nfunction runConversation(generatorFn, responses = []) {\n  const gen = generatorFn();\n  const yielded = [];\n  let step = gen.next();\n  let idx = 0;\n\n  while (!step.done) {\n    yielded.push(step.value);\n    const inputVal = idx < responses.length ? responses[idx] : undefined;\n    idx++;\n    step = gen.next(inputVal);\n  }\n\n  return { yielded, result: step.value };\n}\n"
          },
          {
            "id": "async-generator-pipeline-hard",
            "title": "Async Streaming Pipeline with Backpressure & Batching",
            "difficulty": "Hard",
            "concept": "Async Generators & Flow Control Backpressure",
            "description": "Implement `async function* batchAsyncStream(asyncIterable, batchSize)` that reads from an async iterable source and yields arrays of items chunked by `batchSize`. Any remaining items when the stream closes must be yielded in a final partial batch.",
            "starterCode": "/**\n * Chunks an async iterable stream into fixed-size batches.\n */\nasync function* batchAsyncStream(asyncIterable, batchSize = 3) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Failing to handle trailing remaining items when an async iterator completes causes silent data loss. Consuming without backpressure risks memory ballooning.",
            "testCases": [
              {
                "id": 1,
                "name": "Chunks stream into equal batches",
                "input": "Stream of [1, 2, 3, 4] with batchSize 2",
                "expected": [
                  [
                    1,
                    2
                  ],
                  [
                    3,
                    4
                  ]
                ],
                "testFn": "async function* src() { yield 1; yield 2; yield 3; yield 4; } const res = []; for await (const b of batchAsyncStream(src(), 2)) res.push(b); return res;"
              },
              {
                "id": 2,
                "name": "Flushes remaining items on stream completion",
                "input": "Stream of [1, 2, 3, 4, 5] with batchSize 2",
                "expected": [
                  [
                    1,
                    2
                  ],
                  [
                    3,
                    4
                  ],
                  [
                    5
                  ]
                ],
                "testFn": "async function* src() { yield 1; yield 2; yield 3; yield 4; yield 5; } const res = []; for await (const b of batchAsyncStream(src(), 2)) res.push(b); return res;"
              },
              {
                "id": 3,
                "name": "Yields nothing for empty stream",
                "input": "Empty source stream",
                "expected": [],
                "testFn": "async function* src() {} const res = []; for await (const b of batchAsyncStream(src(), 2)) res.push(b); return res;"
              }
            ],
            "solutionCode": "/**\n * Chunks an async iterable stream into fixed-size batches.\n */\nasync function* batchAsyncStream(asyncIterable, batchSize = 3) {\n  let batch = [];\n  for await (const item of asyncIterable) {\n    batch.push(item);\n    if (batch.length >= batchSize) {\n      yield batch;\n      batch = [];\n    }\n  }\n  if (batch.length > 0) {\n    yield batch;\n  }\n}\n"
          }
        ]
      }
    ]
  },
  {
    "id": "v8-engine-hidden-classes",
    "category": "10. V8 Engine Internals & Hidden Classes",
    "badge": "V8 Internals",
    "description": "Understand how Google's V8 JIT compiles JavaScript, manages Hidden Classes (Shapes/Maps), optimizes Inline Caches, and avoids deoptimizations.",
    "topics": [
      {
        "id": "v8-internals-optimization",
        "title": "V8 Internals: Hidden Classes & Inline Caches",
        "tag": "V8 Engine",
        "summary": "Object shapes, property transition trees, monomorphic vs polymorphic inline caches, SMI arrays, and TurboFan deoptimization.",
        "mentalModel": "V8 assigns a Hidden Class (Map) to every object. Adding properties in different orders or using 'delete' splits the transition tree and degrades inline caches from Monomorphic (fastest) to Megamorphic (hash table lookup fallback).",
        "traps": "Deleting properties creates slow dictionary-mode objects. Inserting undefined holes into arrays converts packed SMI elements into slow hash lookups.",
        "challenges": {
          "Basic": {
            "id": "v8-shape-stabilizer-basic",
            "title": "Object Shape Stabilizer for Monomorphic Inline Caching",
            "difficulty": "Basic",
            "concept": "Hidden Class Transition Tree Alignment",
            "description": "Implement `stabilizeObjectShape(obj, fieldOrder)` that produces a normalized object containing the specified fields in deterministic declaration order, ensuring all instances share the exact same V8 Hidden Class transition chain.",
            "starterCode": "/**\n * Normalizes object property initialization order to preserve V8 Hidden Classes.\n */\nfunction stabilizeObjectShape(obj, fieldOrder) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Initializing { a: 1, b: 2 } vs { b: 2, a: 1 } creates two separate V8 Hidden Classes. When passed to a shared function, the call site becomes polymorphic, doubling lookup overhead.",
            "testCases": [
              {
                "id": 1,
                "name": "Orders properties deterministically according to fieldOrder",
                "input": "{ y: 2, x: 1 } with fieldOrder ['x', 'y']",
                "expected": [
                  "x",
                  "y"
                ],
                "testFn": "const normalized = stabilizeObjectShape({ y: 2, x: 1 }, ['x', 'y']); return Object.keys(normalized);"
              },
              {
                "id": 2,
                "name": "Populates missing schema properties with null",
                "input": "{ x: 10 } with fieldOrder ['x', 'y', 'z']",
                "expected": {
                  "x": 10,
                  "y": null,
                  "z": null
                },
                "testFn": "return stabilizeObjectShape({ x: 10 }, ['x', 'y', 'z']);"
              },
              {
                "id": 3,
                "name": "Produces identical key sequence across differently constructed inputs",
                "input": "compare key order of two objects",
                "expected": true,
                "testFn": "const a = stabilizeObjectShape({ a: 1, b: 2 }, ['a', 'b']); const b = stabilizeObjectShape({ b: 2, a: 1 }, ['a', 'b']); return JSON.stringify(Object.keys(a)) === JSON.stringify(Object.keys(b));"
              }
            ],
            "solutionCode": "/**\n * Normalizes object property initialization order to preserve V8 Hidden Classes.\n */\nfunction stabilizeObjectShape(obj, fieldOrder) {\n  const normalized = {};\n  for (const field of fieldOrder) {\n    normalized[field] = Object.prototype.hasOwnProperty.call(obj, field) ? obj[field] : null;\n  }\n  return normalized;\n}\n"
          },
          "Medium": {
            "id": "v8-inline-cache-simulator-medium",
            "title": "Inline Cache (IC) State Machine Simulator",
            "difficulty": "Medium",
            "concept": "Monomorphic, Polymorphic, and Megamorphic IC Transitions",
            "description": "Implement `createInlineCache(maxPolymorphic = 4)` that tracks property lookups across observed object shapes. Return an object with `access(shapeId)` and `getCacheState()` returning 'UNINITIALIZED', 'MONOMORPHIC', 'POLYMORPHIC', or 'MEGAMORPHIC'.",
            "starterCode": "/**\n * Simulates the state transitions of a V8 Inline Cache (IC).\n */\nfunction createInlineCache(maxPolymorphic = 4) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Once an inline cache transitions to Megamorphic, V8 abandons inline machine code stub lookups and falls back to a global hash table lookup, permanently losing optimization for that call site.",
            "testCases": [
              {
                "id": 1,
                "name": "Single shape stays Monomorphic",
                "input": "access('ShapeA') 5 times",
                "expected": "MONOMORPHIC",
                "testFn": "const ic = createInlineCache(4); ic.access('ShapeA'); ic.access('ShapeA'); return ic.getCacheState();"
              },
              {
                "id": 2,
                "name": "Multiple shapes up to limit transition to Polymorphic",
                "input": "access ShapeA, ShapeB, ShapeC",
                "expected": "POLYMORPHIC",
                "testFn": "const ic = createInlineCache(4); ic.access('A'); ic.access('B'); ic.access('C'); return ic.getCacheState();"
              },
              {
                "id": 3,
                "name": "Exceeding threshold triggers Megamorphic fallback",
                "input": "access 5 different shapes with maxPolymorphic 4",
                "expected": "MEGAMORPHIC",
                "testFn": "const ic = createInlineCache(4); ['A', 'B', 'C', 'D', 'E'].forEach(s => ic.access(s)); return ic.getCacheState();"
              }
            ],
            "solutionCode": "/**\n * Simulates the state transitions of a V8 Inline Cache (IC).\n */\nfunction createInlineCache(maxPolymorphic = 4) {\n  const observedShapes = new Set();\n  return {\n    access(shapeId) {\n      observedShapes.add(shapeId);\n    },\n    getCacheState() {\n      const count = observedShapes.size;\n      if (count === 0) return 'UNINITIALIZED';\n      if (count === 1) return 'MONOMORPHIC';\n      if (count <= maxPolymorphic) return 'POLYMORPHIC';\n      return 'MEGAMORPHIC';\n    }\n  };\n}\n"
          },
          "Hard": {
            "id": "v8-array-element-kind-hard",
            "title": "Array Hole Elimination & Packed SMI Preserver",
            "difficulty": "Hard",
            "concept": "V8 Array Elements Kinds: PACKED_SMI vs HOLEY_DOUBLE",
            "description": "Implement `compactAndPackSmiArray(sparseArray)` that detects and removes holes from a sparse array while ensuring all remaining values are strictly 31-bit signed Small Integers (SMIs), returning a dense contiguous array.",
            "starterCode": "/**\n * Removes array holes and verifies strict Small Integer (SMI) compliance.\n */\nfunction compactAndPackSmiArray(sparseArray) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "A single arr[100] = 1 in an empty array causes V8 to permanently demote the array from PACKED_SMI_ELEMENTS to HOLEY_SMI_ELEMENTS. Once demoted to HOLEY, element reads must check the prototype chain for every hole.",
            "testCases": [
              {
                "id": 1,
                "name": "Eliminates sparse holes without prototype lookup",
                "input": "sparse array [1, empty, 3]",
                "expected": [
                  1,
                  3
                ],
                "testFn": "const arr = [1]; arr[3] = 3; return compactAndPackSmiArray(arr);"
              },
              {
                "id": 2,
                "name": "Filters out floating-point doubles to preserve SMI packing",
                "input": "[10, 20.5, 30, 'string']",
                "expected": [
                  10,
                  30
                ],
                "testFn": "return compactAndPackSmiArray([10, 20.5, 30, 'invalid']);"
              },
              {
                "id": 3,
                "name": "Handles already packed dense array unchanged",
                "input": "[1, 2, 3, 4, 5]",
                "expected": [
                  1,
                  2,
                  3,
                  4,
                  5
                ],
                "testFn": "return compactAndPackSmiArray([1, 2, 3, 4, 5]);"
              }
            ],
            "solutionCode": "/**\n * Removes array holes and verifies strict Small Integer (SMI) compliance.\n */\nfunction compactAndPackSmiArray(sparseArray) {\n  const result = [];\n  const MIN_SMI = -1073741824; // -2^30\n  const MAX_SMI = 1073741823;  // 2^30 - 1\n\n  for (let i = 0; i < sparseArray.length; i++) {\n    if (i in sparseArray) {\n      const val = sparseArray[i];\n      if (typeof val === 'number' && Number.isInteger(val) && val >= MIN_SMI && val <= MAX_SMI) {\n        result.push(val);\n      }\n    }\n  }\n  return result;\n}\n"
          }
        },
        "starterChallenge": {
          "id": "v8-shape-stabilizer-basic",
          "title": "Object Shape Stabilizer for Monomorphic Inline Caching",
          "difficulty": "Basic",
          "concept": "Hidden Class Transition Tree Alignment",
          "description": "Implement `stabilizeObjectShape(obj, fieldOrder)` that produces a normalized object containing the specified fields in deterministic declaration order, ensuring all instances share the exact same V8 Hidden Class transition chain.",
          "starterCode": "/**\n * Normalizes object property initialization order to preserve V8 Hidden Classes.\n */\nfunction stabilizeObjectShape(obj, fieldOrder) {\n  // TODO: Implement solution\n}\n",
          "interviewTrap": "Initializing { a: 1, b: 2 } vs { b: 2, a: 1 } creates two separate V8 Hidden Classes. When passed to a shared function, the call site becomes polymorphic, doubling lookup overhead.",
          "testCases": [
            {
              "id": 1,
              "name": "Orders properties deterministically according to fieldOrder",
              "input": "{ y: 2, x: 1 } with fieldOrder ['x', 'y']",
              "expected": [
                "x",
                "y"
              ],
              "testFn": "const normalized = stabilizeObjectShape({ y: 2, x: 1 }, ['x', 'y']); return Object.keys(normalized);"
            },
            {
              "id": 2,
              "name": "Populates missing schema properties with null",
              "input": "{ x: 10 } with fieldOrder ['x', 'y', 'z']",
              "expected": {
                "x": 10,
                "y": null,
                "z": null
              },
              "testFn": "return stabilizeObjectShape({ x: 10 }, ['x', 'y', 'z']);"
            },
            {
              "id": 3,
              "name": "Produces identical key sequence across differently constructed inputs",
              "input": "compare key order of two objects",
              "expected": true,
              "testFn": "const a = stabilizeObjectShape({ a: 1, b: 2 }, ['a', 'b']); const b = stabilizeObjectShape({ b: 2, a: 1 }, ['a', 'b']); return JSON.stringify(Object.keys(a)) === JSON.stringify(Object.keys(b));"
            }
          ],
          "solutionCode": "/**\n * Normalizes object property initialization order to preserve V8 Hidden Classes.\n */\nfunction stabilizeObjectShape(obj, fieldOrder) {\n  const normalized = {};\n  for (const field of fieldOrder) {\n    normalized[field] = Object.prototype.hasOwnProperty.call(obj, field) ? obj[field] : null;\n  }\n  return normalized;\n}\n"
        },
        "questions": [
          {
            "id": "v8-shape-stabilizer-basic",
            "title": "Object Shape Stabilizer for Monomorphic Inline Caching",
            "difficulty": "Basic",
            "concept": "Hidden Class Transition Tree Alignment",
            "description": "Implement `stabilizeObjectShape(obj, fieldOrder)` that produces a normalized object containing the specified fields in deterministic declaration order, ensuring all instances share the exact same V8 Hidden Class transition chain.",
            "starterCode": "/**\n * Normalizes object property initialization order to preserve V8 Hidden Classes.\n */\nfunction stabilizeObjectShape(obj, fieldOrder) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Initializing { a: 1, b: 2 } vs { b: 2, a: 1 } creates two separate V8 Hidden Classes. When passed to a shared function, the call site becomes polymorphic, doubling lookup overhead.",
            "testCases": [
              {
                "id": 1,
                "name": "Orders properties deterministically according to fieldOrder",
                "input": "{ y: 2, x: 1 } with fieldOrder ['x', 'y']",
                "expected": [
                  "x",
                  "y"
                ],
                "testFn": "const normalized = stabilizeObjectShape({ y: 2, x: 1 }, ['x', 'y']); return Object.keys(normalized);"
              },
              {
                "id": 2,
                "name": "Populates missing schema properties with null",
                "input": "{ x: 10 } with fieldOrder ['x', 'y', 'z']",
                "expected": {
                  "x": 10,
                  "y": null,
                  "z": null
                },
                "testFn": "return stabilizeObjectShape({ x: 10 }, ['x', 'y', 'z']);"
              },
              {
                "id": 3,
                "name": "Produces identical key sequence across differently constructed inputs",
                "input": "compare key order of two objects",
                "expected": true,
                "testFn": "const a = stabilizeObjectShape({ a: 1, b: 2 }, ['a', 'b']); const b = stabilizeObjectShape({ b: 2, a: 1 }, ['a', 'b']); return JSON.stringify(Object.keys(a)) === JSON.stringify(Object.keys(b));"
              }
            ],
            "solutionCode": "/**\n * Normalizes object property initialization order to preserve V8 Hidden Classes.\n */\nfunction stabilizeObjectShape(obj, fieldOrder) {\n  const normalized = {};\n  for (const field of fieldOrder) {\n    normalized[field] = Object.prototype.hasOwnProperty.call(obj, field) ? obj[field] : null;\n  }\n  return normalized;\n}\n"
          },
          {
            "id": "v8-inline-cache-simulator-medium",
            "title": "Inline Cache (IC) State Machine Simulator",
            "difficulty": "Medium",
            "concept": "Monomorphic, Polymorphic, and Megamorphic IC Transitions",
            "description": "Implement `createInlineCache(maxPolymorphic = 4)` that tracks property lookups across observed object shapes. Return an object with `access(shapeId)` and `getCacheState()` returning 'UNINITIALIZED', 'MONOMORPHIC', 'POLYMORPHIC', or 'MEGAMORPHIC'.",
            "starterCode": "/**\n * Simulates the state transitions of a V8 Inline Cache (IC).\n */\nfunction createInlineCache(maxPolymorphic = 4) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Once an inline cache transitions to Megamorphic, V8 abandons inline machine code stub lookups and falls back to a global hash table lookup, permanently losing optimization for that call site.",
            "testCases": [
              {
                "id": 1,
                "name": "Single shape stays Monomorphic",
                "input": "access('ShapeA') 5 times",
                "expected": "MONOMORPHIC",
                "testFn": "const ic = createInlineCache(4); ic.access('ShapeA'); ic.access('ShapeA'); return ic.getCacheState();"
              },
              {
                "id": 2,
                "name": "Multiple shapes up to limit transition to Polymorphic",
                "input": "access ShapeA, ShapeB, ShapeC",
                "expected": "POLYMORPHIC",
                "testFn": "const ic = createInlineCache(4); ic.access('A'); ic.access('B'); ic.access('C'); return ic.getCacheState();"
              },
              {
                "id": 3,
                "name": "Exceeding threshold triggers Megamorphic fallback",
                "input": "access 5 different shapes with maxPolymorphic 4",
                "expected": "MEGAMORPHIC",
                "testFn": "const ic = createInlineCache(4); ['A', 'B', 'C', 'D', 'E'].forEach(s => ic.access(s)); return ic.getCacheState();"
              }
            ],
            "solutionCode": "/**\n * Simulates the state transitions of a V8 Inline Cache (IC).\n */\nfunction createInlineCache(maxPolymorphic = 4) {\n  const observedShapes = new Set();\n  return {\n    access(shapeId) {\n      observedShapes.add(shapeId);\n    },\n    getCacheState() {\n      const count = observedShapes.size;\n      if (count === 0) return 'UNINITIALIZED';\n      if (count === 1) return 'MONOMORPHIC';\n      if (count <= maxPolymorphic) return 'POLYMORPHIC';\n      return 'MEGAMORPHIC';\n    }\n  };\n}\n"
          },
          {
            "id": "v8-array-element-kind-hard",
            "title": "Array Hole Elimination & Packed SMI Preserver",
            "difficulty": "Hard",
            "concept": "V8 Array Elements Kinds: PACKED_SMI vs HOLEY_DOUBLE",
            "description": "Implement `compactAndPackSmiArray(sparseArray)` that detects and removes holes from a sparse array while ensuring all remaining values are strictly 31-bit signed Small Integers (SMIs), returning a dense contiguous array.",
            "starterCode": "/**\n * Removes array holes and verifies strict Small Integer (SMI) compliance.\n */\nfunction compactAndPackSmiArray(sparseArray) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "A single arr[100] = 1 in an empty array causes V8 to permanently demote the array from PACKED_SMI_ELEMENTS to HOLEY_SMI_ELEMENTS. Once demoted to HOLEY, element reads must check the prototype chain for every hole.",
            "testCases": [
              {
                "id": 1,
                "name": "Eliminates sparse holes without prototype lookup",
                "input": "sparse array [1, empty, 3]",
                "expected": [
                  1,
                  3
                ],
                "testFn": "const arr = [1]; arr[3] = 3; return compactAndPackSmiArray(arr);"
              },
              {
                "id": 2,
                "name": "Filters out floating-point doubles to preserve SMI packing",
                "input": "[10, 20.5, 30, 'string']",
                "expected": [
                  10,
                  30
                ],
                "testFn": "return compactAndPackSmiArray([10, 20.5, 30, 'invalid']);"
              },
              {
                "id": 3,
                "name": "Handles already packed dense array unchanged",
                "input": "[1, 2, 3, 4, 5]",
                "expected": [
                  1,
                  2,
                  3,
                  4,
                  5
                ],
                "testFn": "return compactAndPackSmiArray([1, 2, 3, 4, 5]);"
              }
            ],
            "solutionCode": "/**\n * Removes array holes and verifies strict Small Integer (SMI) compliance.\n */\nfunction compactAndPackSmiArray(sparseArray) {\n  const result = [];\n  const MIN_SMI = -1073741824; // -2^30\n  const MAX_SMI = 1073741823;  // 2^30 - 1\n\n  for (let i = 0; i < sparseArray.length; i++) {\n    if (i in sparseArray) {\n      const val = sparseArray[i];\n      if (typeof val === 'number' && Number.isInteger(val) && val >= MIN_SMI && val <= MAX_SMI) {\n        result.push(val);\n      }\n    }\n  }\n  return result;\n}\n"
          }
        ]
      }
    ]
  },
  {
    "id": "binary-typed-arrays-buffers",
    "category": "11. Binary Data, Buffers & Memory Systems",
    "badge": "Binary & Buffers",
    "description": "Direct memory manipulation with ArrayBuffer, TypedArrays, DataView, byte packing, and multi-threaded worker communication.",
    "topics": [
      {
        "id": "binary-data-buffers",
        "title": "Binary Data, TypedArrays & Memory Buffers",
        "tag": "Binary & Buffers",
        "summary": "ArrayBuffer allocation, TypedArray views, DataView endianness handling, bitwise packing, and zero-copy Transferables.",
        "mentalModel": "An ArrayBuffer is a contiguous chunk of raw heap memory. TypedArrays (Uint8Array, Int32Array) and DataViews provide structured lenses over the buffer. Endianness matters when parsing multi-byte integers across platforms.",
        "traps": "Mixing little-endian and big-endian reads in DataView corrupts multi-byte numbers. Modifying a TypedArray view mutates the shared underlying buffer.",
        "challenges": {
          "Basic": {
            "id": "binary-dataview-packet-basic",
            "title": "Binary Header Packet Encoder & Decoder",
            "difficulty": "Basic",
            "concept": "DataView Explicit Endianness & Byte Serialization",
            "description": "Implement `encodePacket(id, statusCode, payloadLength)` and `decodePacket(arrayBuffer)` where the packet structure is: 2 bytes for uint16 ID, 1 byte for uint8 statusCode, 4 bytes for uint32 payloadLength (all Big-Endian).",
            "starterCode": "/**\n * Encodes a 7-byte binary header packet using DataView.\n */\nfunction encodePacket(id, statusCode, payloadLength) {\n  // TODO: Implement solution\n}\n\n/**\n * Decodes a 7-byte binary header packet using DataView.\n */\nfunction decodePacket(buffer) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "TypedArrays (e.g., Uint16Array) use the CPU's native endianness (almost always Little-Endian on x86/ARM), which breaks cross-platform network protocol compliance. Always use DataView for explicit endianness control.",
            "testCases": [
              {
                "id": 1,
                "name": "Correctly encodes and decodes round-trip packet",
                "input": "encode(1001, 200, 65536)",
                "expected": {
                  "id": 1001,
                  "statusCode": 200,
                  "payloadLength": 65536
                },
                "testFn": "const buf = encodePacket(1001, 200, 65536); return decodePacket(buf);"
              },
              {
                "id": 2,
                "name": "Handles boundary 16-bit and 32-bit integer limits",
                "input": "id: 65535, statusCode: 255, payload: 4294967295",
                "expected": {
                  "id": 65535,
                  "statusCode": 255,
                  "payloadLength": 4294967295
                },
                "testFn": "const buf = encodePacket(65535, 255, 4294967295); return decodePacket(buf);"
              },
              {
                "id": 3,
                "name": "Enforces exact 7-byte buffer size allocation",
                "input": "encodePacket byteLength check",
                "expected": 7,
                "testFn": "const buf = encodePacket(1, 1, 1); return buf.byteLength;"
              }
            ],
            "solutionCode": "/**\n * Encodes a 7-byte binary header packet using DataView.\n */\nfunction encodePacket(id, statusCode, payloadLength) {\n  const buffer = new ArrayBuffer(7);\n  const view = new DataView(buffer);\n  view.setUint16(0, id, false); // Big-Endian\n  view.setUint8(2, statusCode);\n  view.setUint32(3, payloadLength, false); // Big-Endian\n  return buffer;\n}\n\n/**\n * Decodes a 7-byte binary header packet using DataView.\n */\nfunction decodePacket(buffer) {\n  const view = new DataView(buffer);\n  return {\n    id: view.getUint16(0, false),\n    statusCode: view.getUint8(2),\n    payloadLength: view.getUint32(3, false)\n  };\n}\n"
          },
          "Medium": {
            "id": "binary-base64-buffer-medium",
            "title": "Base64 to Uint8Array Binary Decoder",
            "difficulty": "Medium",
            "concept": "Bitwise Shifting & Byte Array Construction",
            "description": "Implement `base64ToUint8Array(b64String)` that decodes a standard Base64 string directly into a `Uint8Array` using bitwise operations.",
            "starterCode": "/**\n * Decodes a Base64 string directly into a Uint8Array byte buffer.\n */\nfunction base64ToUint8Array(b64) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Using atob() creates an intermediate binary string in memory where each byte is stored as a 16-bit UTF-16 code point, doubling memory consumption.",
            "testCases": [
              {
                "id": 1,
                "name": "Decodes 'SGVsbG8=' to ASCII byte values of 'Hello'",
                "input": "base64ToUint8Array('SGVsbG8=')",
                "expected": [
                  72,
                  101,
                  108,
                  108,
                  111
                ],
                "testFn": "const bytes = base64ToUint8Array('SGVsbG8='); return Array.from(bytes);"
              },
              {
                "id": 2,
                "name": "Decodes multiple blocks accurately",
                "input": "base64ToUint8Array('AQIDBAU=')",
                "expected": [
                  1,
                  2,
                  3,
                  4,
                  5
                ],
                "testFn": "return Array.from(base64ToUint8Array('AQIDBAU='));"
              },
              {
                "id": 3,
                "name": "Handles empty string input",
                "input": "base64ToUint8Array('')",
                "expected": [],
                "testFn": "return Array.from(base64ToUint8Array(''));"
              }
            ],
            "solutionCode": "/**\n * Decodes a Base64 string directly into a Uint8Array byte buffer.\n */\nfunction base64ToUint8Array(b64) {\n  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';\n  const lookup = new Uint8Array(256);\n  for (let i = 0; i < chars.length; i++) lookup[chars.charCodeAt(i)] = i;\n\n  const clean = b64.replace(/=+$/, '');\n  const len = clean.length;\n  const byteLen = Math.floor((len * 3) / 4);\n  const bytes = new Uint8Array(byteLen);\n\n  let p = 0;\n  for (let i = 0; i < len; i += 4) {\n    const c0 = lookup[clean.charCodeAt(i)];\n    const c1 = lookup[clean.charCodeAt(i + 1)];\n    const c2 = i + 2 < len ? lookup[clean.charCodeAt(i + 2)] : 0;\n    const c3 = i + 3 < len ? lookup[clean.charCodeAt(i + 3)] : 0;\n\n    bytes[p++] = (c0 << 2) | (c1 >> 4);\n    if (p < byteLen) bytes[p++] = ((c1 & 15) << 4) | (c2 >> 2);\n    if (p < byteLen) bytes[p++] = ((c2 & 3) << 6) | c3;\n  }\n  return bytes;\n}\n"
          },
          "Hard": {
            "id": "binary-ring-buffer-hard",
            "title": "Lockless Circular Ring Buffer with TypedArrays",
            "difficulty": "Hard",
            "concept": "Ring Buffer Head/Tail Pointers & Modulo Addressing",
            "description": "Implement `createCircularBuffer(capacity)` that manages a fixed-size byte buffer. Methods: `write(byte)` (returns false if full), `read()` (returns byte or null if empty), `isFull()`, and `isEmpty()`.",
            "starterCode": "/**\n * Fixed-capacity circular byte buffer implemented over Uint8Array.\n */\nfunction createCircularBuffer(capacity = 8) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "In shared-memory multi-threaded Web Worker architectures, circular buffers prevent lock contention between audio/compute threads and the UI thread.",
            "testCases": [
              {
                "id": 1,
                "name": "Writes and reads bytes in FIFO order",
                "input": "write 42, 84 then read both",
                "expected": [
                  42,
                  84
                ],
                "testFn": "const ring = createCircularBuffer(4); ring.write(42); ring.write(84); return [ring.read(), ring.read()];"
              },
              {
                "id": 2,
                "name": "Detects full condition and rejects overflow writes",
                "input": "write 3 items into capacity 2",
                "expected": false,
                "testFn": "const ring = createCircularBuffer(2); ring.write(1); ring.write(2); return ring.write(3);"
              },
              {
                "id": 3,
                "name": "Wraps around head and tail pointers seamlessly",
                "input": "write 2, read 2, write 2 more",
                "expected": [
                  30,
                  40
                ],
                "testFn": "const ring = createCircularBuffer(2); ring.write(10); ring.write(20); ring.read(); ring.read(); ring.write(30); ring.write(40); return [ring.read(), ring.read()];"
              }
            ],
            "solutionCode": "/**\n * Fixed-capacity circular byte buffer implemented over Uint8Array.\n */\nfunction createCircularBuffer(capacity = 8) {\n  const buffer = new Uint8Array(capacity + 1);\n  let head = 0;\n  let tail = 0;\n  const size = capacity + 1;\n\n  return {\n    write(byte) {\n      if ((tail + 1) % size === head) return false; // Full\n      buffer[tail] = byte & 0xFF;\n      tail = (tail + 1) % size;\n      return true;\n    },\n    read() {\n      if (head === tail) return null; // Empty\n      const val = buffer[head];\n      head = (head + 1) % size;\n      return val;\n    },\n    isFull() {\n      return (tail + 1) % size === head;\n    },\n    isEmpty() {\n      return head === tail;\n    }\n  };\n}\n"
          }
        },
        "starterChallenge": {
          "id": "binary-dataview-packet-basic",
          "title": "Binary Header Packet Encoder & Decoder",
          "difficulty": "Basic",
          "concept": "DataView Explicit Endianness & Byte Serialization",
          "description": "Implement `encodePacket(id, statusCode, payloadLength)` and `decodePacket(arrayBuffer)` where the packet structure is: 2 bytes for uint16 ID, 1 byte for uint8 statusCode, 4 bytes for uint32 payloadLength (all Big-Endian).",
          "starterCode": "/**\n * Encodes a 7-byte binary header packet using DataView.\n */\nfunction encodePacket(id, statusCode, payloadLength) {\n  // TODO: Implement solution\n}\n\n/**\n * Decodes a 7-byte binary header packet using DataView.\n */\nfunction decodePacket(buffer) {\n  // TODO: Implement solution\n}\n",
          "interviewTrap": "TypedArrays (e.g., Uint16Array) use the CPU's native endianness (almost always Little-Endian on x86/ARM), which breaks cross-platform network protocol compliance. Always use DataView for explicit endianness control.",
          "testCases": [
            {
              "id": 1,
              "name": "Correctly encodes and decodes round-trip packet",
              "input": "encode(1001, 200, 65536)",
              "expected": {
                "id": 1001,
                "statusCode": 200,
                "payloadLength": 65536
              },
              "testFn": "const buf = encodePacket(1001, 200, 65536); return decodePacket(buf);"
            },
            {
              "id": 2,
              "name": "Handles boundary 16-bit and 32-bit integer limits",
              "input": "id: 65535, statusCode: 255, payload: 4294967295",
              "expected": {
                "id": 65535,
                "statusCode": 255,
                "payloadLength": 4294967295
              },
              "testFn": "const buf = encodePacket(65535, 255, 4294967295); return decodePacket(buf);"
            },
            {
              "id": 3,
              "name": "Enforces exact 7-byte buffer size allocation",
              "input": "encodePacket byteLength check",
              "expected": 7,
              "testFn": "const buf = encodePacket(1, 1, 1); return buf.byteLength;"
            }
          ],
          "solutionCode": "/**\n * Encodes a 7-byte binary header packet using DataView.\n */\nfunction encodePacket(id, statusCode, payloadLength) {\n  const buffer = new ArrayBuffer(7);\n  const view = new DataView(buffer);\n  view.setUint16(0, id, false); // Big-Endian\n  view.setUint8(2, statusCode);\n  view.setUint32(3, payloadLength, false); // Big-Endian\n  return buffer;\n}\n\n/**\n * Decodes a 7-byte binary header packet using DataView.\n */\nfunction decodePacket(buffer) {\n  const view = new DataView(buffer);\n  return {\n    id: view.getUint16(0, false),\n    statusCode: view.getUint8(2),\n    payloadLength: view.getUint32(3, false)\n  };\n}\n"
        },
        "questions": [
          {
            "id": "binary-dataview-packet-basic",
            "title": "Binary Header Packet Encoder & Decoder",
            "difficulty": "Basic",
            "concept": "DataView Explicit Endianness & Byte Serialization",
            "description": "Implement `encodePacket(id, statusCode, payloadLength)` and `decodePacket(arrayBuffer)` where the packet structure is: 2 bytes for uint16 ID, 1 byte for uint8 statusCode, 4 bytes for uint32 payloadLength (all Big-Endian).",
            "starterCode": "/**\n * Encodes a 7-byte binary header packet using DataView.\n */\nfunction encodePacket(id, statusCode, payloadLength) {\n  // TODO: Implement solution\n}\n\n/**\n * Decodes a 7-byte binary header packet using DataView.\n */\nfunction decodePacket(buffer) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "TypedArrays (e.g., Uint16Array) use the CPU's native endianness (almost always Little-Endian on x86/ARM), which breaks cross-platform network protocol compliance. Always use DataView for explicit endianness control.",
            "testCases": [
              {
                "id": 1,
                "name": "Correctly encodes and decodes round-trip packet",
                "input": "encode(1001, 200, 65536)",
                "expected": {
                  "id": 1001,
                  "statusCode": 200,
                  "payloadLength": 65536
                },
                "testFn": "const buf = encodePacket(1001, 200, 65536); return decodePacket(buf);"
              },
              {
                "id": 2,
                "name": "Handles boundary 16-bit and 32-bit integer limits",
                "input": "id: 65535, statusCode: 255, payload: 4294967295",
                "expected": {
                  "id": 65535,
                  "statusCode": 255,
                  "payloadLength": 4294967295
                },
                "testFn": "const buf = encodePacket(65535, 255, 4294967295); return decodePacket(buf);"
              },
              {
                "id": 3,
                "name": "Enforces exact 7-byte buffer size allocation",
                "input": "encodePacket byteLength check",
                "expected": 7,
                "testFn": "const buf = encodePacket(1, 1, 1); return buf.byteLength;"
              }
            ],
            "solutionCode": "/**\n * Encodes a 7-byte binary header packet using DataView.\n */\nfunction encodePacket(id, statusCode, payloadLength) {\n  const buffer = new ArrayBuffer(7);\n  const view = new DataView(buffer);\n  view.setUint16(0, id, false); // Big-Endian\n  view.setUint8(2, statusCode);\n  view.setUint32(3, payloadLength, false); // Big-Endian\n  return buffer;\n}\n\n/**\n * Decodes a 7-byte binary header packet using DataView.\n */\nfunction decodePacket(buffer) {\n  const view = new DataView(buffer);\n  return {\n    id: view.getUint16(0, false),\n    statusCode: view.getUint8(2),\n    payloadLength: view.getUint32(3, false)\n  };\n}\n"
          },
          {
            "id": "binary-base64-buffer-medium",
            "title": "Base64 to Uint8Array Binary Decoder",
            "difficulty": "Medium",
            "concept": "Bitwise Shifting & Byte Array Construction",
            "description": "Implement `base64ToUint8Array(b64String)` that decodes a standard Base64 string directly into a `Uint8Array` using bitwise operations.",
            "starterCode": "/**\n * Decodes a Base64 string directly into a Uint8Array byte buffer.\n */\nfunction base64ToUint8Array(b64) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Using atob() creates an intermediate binary string in memory where each byte is stored as a 16-bit UTF-16 code point, doubling memory consumption.",
            "testCases": [
              {
                "id": 1,
                "name": "Decodes 'SGVsbG8=' to ASCII byte values of 'Hello'",
                "input": "base64ToUint8Array('SGVsbG8=')",
                "expected": [
                  72,
                  101,
                  108,
                  108,
                  111
                ],
                "testFn": "const bytes = base64ToUint8Array('SGVsbG8='); return Array.from(bytes);"
              },
              {
                "id": 2,
                "name": "Decodes multiple blocks accurately",
                "input": "base64ToUint8Array('AQIDBAU=')",
                "expected": [
                  1,
                  2,
                  3,
                  4,
                  5
                ],
                "testFn": "return Array.from(base64ToUint8Array('AQIDBAU='));"
              },
              {
                "id": 3,
                "name": "Handles empty string input",
                "input": "base64ToUint8Array('')",
                "expected": [],
                "testFn": "return Array.from(base64ToUint8Array(''));"
              }
            ],
            "solutionCode": "/**\n * Decodes a Base64 string directly into a Uint8Array byte buffer.\n */\nfunction base64ToUint8Array(b64) {\n  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';\n  const lookup = new Uint8Array(256);\n  for (let i = 0; i < chars.length; i++) lookup[chars.charCodeAt(i)] = i;\n\n  const clean = b64.replace(/=+$/, '');\n  const len = clean.length;\n  const byteLen = Math.floor((len * 3) / 4);\n  const bytes = new Uint8Array(byteLen);\n\n  let p = 0;\n  for (let i = 0; i < len; i += 4) {\n    const c0 = lookup[clean.charCodeAt(i)];\n    const c1 = lookup[clean.charCodeAt(i + 1)];\n    const c2 = i + 2 < len ? lookup[clean.charCodeAt(i + 2)] : 0;\n    const c3 = i + 3 < len ? lookup[clean.charCodeAt(i + 3)] : 0;\n\n    bytes[p++] = (c0 << 2) | (c1 >> 4);\n    if (p < byteLen) bytes[p++] = ((c1 & 15) << 4) | (c2 >> 2);\n    if (p < byteLen) bytes[p++] = ((c2 & 3) << 6) | c3;\n  }\n  return bytes;\n}\n"
          },
          {
            "id": "binary-ring-buffer-hard",
            "title": "Lockless Circular Ring Buffer with TypedArrays",
            "difficulty": "Hard",
            "concept": "Ring Buffer Head/Tail Pointers & Modulo Addressing",
            "description": "Implement `createCircularBuffer(capacity)` that manages a fixed-size byte buffer. Methods: `write(byte)` (returns false if full), `read()` (returns byte or null if empty), `isFull()`, and `isEmpty()`.",
            "starterCode": "/**\n * Fixed-capacity circular byte buffer implemented over Uint8Array.\n */\nfunction createCircularBuffer(capacity = 8) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "In shared-memory multi-threaded Web Worker architectures, circular buffers prevent lock contention between audio/compute threads and the UI thread.",
            "testCases": [
              {
                "id": 1,
                "name": "Writes and reads bytes in FIFO order",
                "input": "write 42, 84 then read both",
                "expected": [
                  42,
                  84
                ],
                "testFn": "const ring = createCircularBuffer(4); ring.write(42); ring.write(84); return [ring.read(), ring.read()];"
              },
              {
                "id": 2,
                "name": "Detects full condition and rejects overflow writes",
                "input": "write 3 items into capacity 2",
                "expected": false,
                "testFn": "const ring = createCircularBuffer(2); ring.write(1); ring.write(2); return ring.write(3);"
              },
              {
                "id": 3,
                "name": "Wraps around head and tail pointers seamlessly",
                "input": "write 2, read 2, write 2 more",
                "expected": [
                  30,
                  40
                ],
                "testFn": "const ring = createCircularBuffer(2); ring.write(10); ring.write(20); ring.read(); ring.read(); ring.write(30); ring.write(40); return [ring.read(), ring.read()];"
              }
            ],
            "solutionCode": "/**\n * Fixed-capacity circular byte buffer implemented over Uint8Array.\n */\nfunction createCircularBuffer(capacity = 8) {\n  const buffer = new Uint8Array(capacity + 1);\n  let head = 0;\n  let tail = 0;\n  const size = capacity + 1;\n\n  return {\n    write(byte) {\n      if ((tail + 1) % size === head) return false; // Full\n      buffer[tail] = byte & 0xFF;\n      tail = (tail + 1) % size;\n      return true;\n    },\n    read() {\n      if (head === tail) return null; // Empty\n      const val = buffer[head];\n      head = (head + 1) % size;\n      return val;\n    },\n    isFull() {\n      return (tail + 1) % size === head;\n    },\n    isEmpty() {\n      return head === tail;\n    }\n  };\n}\n"
          }
        ]
      }
    ]
  },
  {
    "id": "module-systems-esm-cjs",
    "category": "12. Module Systems: ESM vs CommonJS",
    "badge": "Modules",
    "description": "Deep dive into static ESM vs dynamic CommonJS, live export bindings, module caches, and circular dependency resolution.",
    "topics": [
      {
        "id": "module-systems",
        "title": "Module Systems: ESM vs CommonJS & Circular Dependencies",
        "tag": "Modules",
        "summary": "Two-phase execution (Parsing vs Evaluation), live bindings vs value copies, circular reference caching, and tree shaking.",
        "mentalModel": "CommonJS exports are evaluated at runtime and copied by value into a module.exports object. ESM exports are live references bound during static analysis, meaning changes in the exporter reflect immediately in the importer.",
        "traps": "In CommonJS circular dependencies, an importing module gets an incomplete snapshot of module.exports. In ESM, accessing uninitialized hoisted live bindings before evaluation triggers a ReferenceError TDZ.",
        "challenges": {
          "Basic": {
            "id": "cjs-module-cache-basic",
            "title": "Simulate CommonJS Module Cache & require()",
            "difficulty": "Basic",
            "concept": "CommonJS module.exports & require cache mechanics",
            "description": "Implement `createModuleEnvironment()` that exposes `defineModule(id, fn)` and `require(id)`. Modules must only be evaluated once; subsequent `require` calls must return the cached `module.exports` object.",
            "starterCode": "/**\n * Simulates the CommonJS runtime module registry and require() cache.\n */\nfunction createModuleEnvironment() {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Forgetting to populate cache.set(id, mod) BEFORE calling the module factory causes infinite recursion on circular dependencies.",
            "testCases": [
              {
                "id": 1,
                "name": "Exports and requires a module successfully",
                "input": "define math module and require('math').add(2, 3)",
                "expected": 5,
                "testFn": "const env = createModuleEnvironment(); env.defineModule('math', (exports) => { exports.add = (a, b) => a + b; }); return env.require('math').add(2, 3);"
              },
              {
                "id": 2,
                "name": "Subsequent requires return cached instance without re-evaluating",
                "input": "verify factory is only invoked once",
                "expected": 1,
                "testFn": "const env = createModuleEnvironment(); let calls = 0; env.defineModule('counter', (exports) => { calls++; exports.val = 42; }); env.require('counter'); env.require('counter'); return calls;"
              },
              {
                "id": 3,
                "name": "Throws descriptive error on unknown module ID",
                "input": "require('unknown')",
                "expected": "Module unknown not found",
                "testFn": "const env = createModuleEnvironment(); try { env.require('unknown'); return 'no-error'; } catch (e) { return e.message; }"
              }
            ],
            "solutionCode": "/**\n * Simulates the CommonJS runtime module registry and require() cache.\n */\nfunction createModuleEnvironment() {\n  const registry = new Map();\n  const cache = new Map();\n\n  return {\n    defineModule(id, factory) {\n      registry.set(id, factory);\n    },\n    require(id) {\n      if (cache.has(id)) {\n        return cache.get(id).exports;\n      }\n      if (!registry.has(id)) {\n        throw new Error('Module ' + id + ' not found');\n      }\n      const mod = { exports: {} };\n      cache.set(id, mod);\n      const factory = registry.get(id);\n      factory(mod.exports, mod, (depId) => this.require(depId));\n      return mod.exports;\n    }\n  };\n}\n"
          },
          "Medium": {
            "id": "esm-live-binding-medium",
            "title": "ESM Live Binding vs CJS Value Copy Simulator",
            "difficulty": "Medium",
            "concept": "Live Reference Bindings vs Copied Primitive Values",
            "description": "Implement `createLiveBindingStore()` that demonstrates the fundamental difference between ESM live bindings (which reflect exported counter changes when incremented) and CJS value copies (which remain frozen at the initial value).",
            "starterCode": "/**\n * Demonstrates ESM live bindings vs CommonJS value snapshots.\n */\nfunction createLiveBindingStore() {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Candidates often assume ESM exports work like objects with values. In reality, ESM generates pointer references in the module record, so mutating the internal variable changes what importers see without re-exporting.",
            "testCases": [
              {
                "id": 1,
                "name": "Both start at initial value 0",
                "input": "getCjsCounter() and getEsmCounter() before increment",
                "expected": "0:0",
                "testFn": "const store = createLiveBindingStore(); return store.getCjsCounter() + ':' + store.getEsmCounter();"
              },
              {
                "id": 2,
                "name": "After increment, CJS stays 0 while ESM updates to 1",
                "input": "store.increment()",
                "expected": {
                  "cjs": 0,
                  "esm": 1
                },
                "testFn": "const store = createLiveBindingStore(); store.increment(); return { cjs: store.getCjsCounter(), esm: store.getEsmCounter() };"
              },
              {
                "id": 3,
                "name": "Multiple increments continue updating ESM counter live",
                "input": "store.increment() 3 times",
                "expected": 3,
                "testFn": "const store = createLiveBindingStore(); store.increment(); store.increment(); store.increment(); return store.getEsmCounter();"
              }
            ],
            "solutionCode": "/**\n * Demonstrates ESM live bindings vs CommonJS value snapshots.\n */\nfunction createLiveBindingStore() {\n  let counter = 0;\n  // CJS export snapshot (value copy)\n  const cjsExport = { counter };\n  // ESM export accessor (live binding)\n  const esmExport = {\n    get counter() { return counter; }\n  };\n\n  return {\n    increment() {\n      counter++;\n    },\n    getCjsCounter() {\n      return cjsExport.counter;\n    },\n    getEsmCounter() {\n      return esmExport.counter;\n    }\n  };\n}\n"
          },
          "Hard": {
            "id": "module-graph-cycle-hard",
            "title": "Module Dependency Graph Cycle Detector & Topological Evaluator",
            "difficulty": "Hard",
            "concept": "Topological Sorting & Circular Module Graph Resolution",
            "description": "Implement `resolveEvaluationOrder(graph)` that accepts a directed module dependency graph (e.g. `{ A: ['B', 'C'], B: ['C'], C: [] }`) and returns the strict evaluation order array, or throws an Error if a circular dependency is detected.",
            "starterCode": "/**\n * Computes deterministic module evaluation order or detects circular cycles.\n */\nfunction resolveEvaluationOrder(graph) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "ESM parses the entire module dependency graph statically using Post-Order DFS before executing a single line of module code, whereas CommonJS resolves modules dynamically at runtime.",
            "testCases": [
              {
                "id": 1,
                "name": "Resolves linear and diamond dependencies in topological order",
                "input": "{ A: ['B'], B: ['C'], C: [] }",
                "expected": [
                  "C",
                  "B",
                  "A"
                ],
                "testFn": "return resolveEvaluationOrder({ A: ['B'], B: ['C'], C: [] });"
              },
              {
                "id": 2,
                "name": "Throws on circular cycle between modules",
                "input": "{ A: ['B'], B: ['A'] }",
                "expected": "Circular dependency detected at module: A",
                "testFn": "try { resolveEvaluationOrder({ A: ['B'], B: ['A'] }); return 'no-error'; } catch (e) { return e.message; }"
              },
              {
                "id": 3,
                "name": "Resolves diamond graph correctly",
                "input": "{ A: ['B', 'C'], B: ['D'], C: ['D'], D: [] }",
                "expected": true,
                "testFn": "const order = resolveEvaluationOrder({ A: ['B', 'C'], B: ['D'], C: ['D'], D: [] }); return order[0] === 'D' && order[order.length - 1] === 'A';"
              }
            ],
            "solutionCode": "/**\n * Computes deterministic module evaluation order or detects circular cycles.\n */\nfunction resolveEvaluationOrder(graph) {\n  const order = [];\n  const visited = new Set();\n  const visiting = new Set();\n\n  function visit(node) {\n    if (visiting.has(node)) {\n      throw new Error('Circular dependency detected at module: ' + node);\n    }\n    if (visited.has(node)) return;\n\n    visiting.add(node);\n    const deps = graph[node] || [];\n    for (const dep of deps) {\n      visit(dep);\n    }\n    visiting.delete(node);\n    visited.add(node);\n    order.push(node);\n  }\n\n  for (const node of Object.keys(graph)) {\n    if (!visited.has(node)) {\n      visit(node);\n    }\n  }\n\n  return order;\n}\n"
          }
        },
        "starterChallenge": {
          "id": "cjs-module-cache-basic",
          "title": "Simulate CommonJS Module Cache & require()",
          "difficulty": "Basic",
          "concept": "CommonJS module.exports & require cache mechanics",
          "description": "Implement `createModuleEnvironment()` that exposes `defineModule(id, fn)` and `require(id)`. Modules must only be evaluated once; subsequent `require` calls must return the cached `module.exports` object.",
          "starterCode": "/**\n * Simulates the CommonJS runtime module registry and require() cache.\n */\nfunction createModuleEnvironment() {\n  // TODO: Implement solution\n}\n",
          "interviewTrap": "Forgetting to populate cache.set(id, mod) BEFORE calling the module factory causes infinite recursion on circular dependencies.",
          "testCases": [
            {
              "id": 1,
              "name": "Exports and requires a module successfully",
              "input": "define math module and require('math').add(2, 3)",
              "expected": 5,
              "testFn": "const env = createModuleEnvironment(); env.defineModule('math', (exports) => { exports.add = (a, b) => a + b; }); return env.require('math').add(2, 3);"
            },
            {
              "id": 2,
              "name": "Subsequent requires return cached instance without re-evaluating",
              "input": "verify factory is only invoked once",
              "expected": 1,
              "testFn": "const env = createModuleEnvironment(); let calls = 0; env.defineModule('counter', (exports) => { calls++; exports.val = 42; }); env.require('counter'); env.require('counter'); return calls;"
            },
            {
              "id": 3,
              "name": "Throws descriptive error on unknown module ID",
              "input": "require('unknown')",
              "expected": "Module unknown not found",
              "testFn": "const env = createModuleEnvironment(); try { env.require('unknown'); return 'no-error'; } catch (e) { return e.message; }"
            }
          ],
          "solutionCode": "/**\n * Simulates the CommonJS runtime module registry and require() cache.\n */\nfunction createModuleEnvironment() {\n  const registry = new Map();\n  const cache = new Map();\n\n  return {\n    defineModule(id, factory) {\n      registry.set(id, factory);\n    },\n    require(id) {\n      if (cache.has(id)) {\n        return cache.get(id).exports;\n      }\n      if (!registry.has(id)) {\n        throw new Error('Module ' + id + ' not found');\n      }\n      const mod = { exports: {} };\n      cache.set(id, mod);\n      const factory = registry.get(id);\n      factory(mod.exports, mod, (depId) => this.require(depId));\n      return mod.exports;\n    }\n  };\n}\n"
        },
        "questions": [
          {
            "id": "cjs-module-cache-basic",
            "title": "Simulate CommonJS Module Cache & require()",
            "difficulty": "Basic",
            "concept": "CommonJS module.exports & require cache mechanics",
            "description": "Implement `createModuleEnvironment()` that exposes `defineModule(id, fn)` and `require(id)`. Modules must only be evaluated once; subsequent `require` calls must return the cached `module.exports` object.",
            "starterCode": "/**\n * Simulates the CommonJS runtime module registry and require() cache.\n */\nfunction createModuleEnvironment() {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Forgetting to populate cache.set(id, mod) BEFORE calling the module factory causes infinite recursion on circular dependencies.",
            "testCases": [
              {
                "id": 1,
                "name": "Exports and requires a module successfully",
                "input": "define math module and require('math').add(2, 3)",
                "expected": 5,
                "testFn": "const env = createModuleEnvironment(); env.defineModule('math', (exports) => { exports.add = (a, b) => a + b; }); return env.require('math').add(2, 3);"
              },
              {
                "id": 2,
                "name": "Subsequent requires return cached instance without re-evaluating",
                "input": "verify factory is only invoked once",
                "expected": 1,
                "testFn": "const env = createModuleEnvironment(); let calls = 0; env.defineModule('counter', (exports) => { calls++; exports.val = 42; }); env.require('counter'); env.require('counter'); return calls;"
              },
              {
                "id": 3,
                "name": "Throws descriptive error on unknown module ID",
                "input": "require('unknown')",
                "expected": "Module unknown not found",
                "testFn": "const env = createModuleEnvironment(); try { env.require('unknown'); return 'no-error'; } catch (e) { return e.message; }"
              }
            ],
            "solutionCode": "/**\n * Simulates the CommonJS runtime module registry and require() cache.\n */\nfunction createModuleEnvironment() {\n  const registry = new Map();\n  const cache = new Map();\n\n  return {\n    defineModule(id, factory) {\n      registry.set(id, factory);\n    },\n    require(id) {\n      if (cache.has(id)) {\n        return cache.get(id).exports;\n      }\n      if (!registry.has(id)) {\n        throw new Error('Module ' + id + ' not found');\n      }\n      const mod = { exports: {} };\n      cache.set(id, mod);\n      const factory = registry.get(id);\n      factory(mod.exports, mod, (depId) => this.require(depId));\n      return mod.exports;\n    }\n  };\n}\n"
          },
          {
            "id": "esm-live-binding-medium",
            "title": "ESM Live Binding vs CJS Value Copy Simulator",
            "difficulty": "Medium",
            "concept": "Live Reference Bindings vs Copied Primitive Values",
            "description": "Implement `createLiveBindingStore()` that demonstrates the fundamental difference between ESM live bindings (which reflect exported counter changes when incremented) and CJS value copies (which remain frozen at the initial value).",
            "starterCode": "/**\n * Demonstrates ESM live bindings vs CommonJS value snapshots.\n */\nfunction createLiveBindingStore() {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "Candidates often assume ESM exports work like objects with values. In reality, ESM generates pointer references in the module record, so mutating the internal variable changes what importers see without re-exporting.",
            "testCases": [
              {
                "id": 1,
                "name": "Both start at initial value 0",
                "input": "getCjsCounter() and getEsmCounter() before increment",
                "expected": "0:0",
                "testFn": "const store = createLiveBindingStore(); return store.getCjsCounter() + ':' + store.getEsmCounter();"
              },
              {
                "id": 2,
                "name": "After increment, CJS stays 0 while ESM updates to 1",
                "input": "store.increment()",
                "expected": {
                  "cjs": 0,
                  "esm": 1
                },
                "testFn": "const store = createLiveBindingStore(); store.increment(); return { cjs: store.getCjsCounter(), esm: store.getEsmCounter() };"
              },
              {
                "id": 3,
                "name": "Multiple increments continue updating ESM counter live",
                "input": "store.increment() 3 times",
                "expected": 3,
                "testFn": "const store = createLiveBindingStore(); store.increment(); store.increment(); store.increment(); return store.getEsmCounter();"
              }
            ],
            "solutionCode": "/**\n * Demonstrates ESM live bindings vs CommonJS value snapshots.\n */\nfunction createLiveBindingStore() {\n  let counter = 0;\n  // CJS export snapshot (value copy)\n  const cjsExport = { counter };\n  // ESM export accessor (live binding)\n  const esmExport = {\n    get counter() { return counter; }\n  };\n\n  return {\n    increment() {\n      counter++;\n    },\n    getCjsCounter() {\n      return cjsExport.counter;\n    },\n    getEsmCounter() {\n      return esmExport.counter;\n    }\n  };\n}\n"
          },
          {
            "id": "module-graph-cycle-hard",
            "title": "Module Dependency Graph Cycle Detector & Topological Evaluator",
            "difficulty": "Hard",
            "concept": "Topological Sorting & Circular Module Graph Resolution",
            "description": "Implement `resolveEvaluationOrder(graph)` that accepts a directed module dependency graph (e.g. `{ A: ['B', 'C'], B: ['C'], C: [] }`) and returns the strict evaluation order array, or throws an Error if a circular dependency is detected.",
            "starterCode": "/**\n * Computes deterministic module evaluation order or detects circular cycles.\n */\nfunction resolveEvaluationOrder(graph) {\n  // TODO: Implement solution\n}\n",
            "interviewTrap": "ESM parses the entire module dependency graph statically using Post-Order DFS before executing a single line of module code, whereas CommonJS resolves modules dynamically at runtime.",
            "testCases": [
              {
                "id": 1,
                "name": "Resolves linear and diamond dependencies in topological order",
                "input": "{ A: ['B'], B: ['C'], C: [] }",
                "expected": [
                  "C",
                  "B",
                  "A"
                ],
                "testFn": "return resolveEvaluationOrder({ A: ['B'], B: ['C'], C: [] });"
              },
              {
                "id": 2,
                "name": "Throws on circular cycle between modules",
                "input": "{ A: ['B'], B: ['A'] }",
                "expected": "Circular dependency detected at module: A",
                "testFn": "try { resolveEvaluationOrder({ A: ['B'], B: ['A'] }); return 'no-error'; } catch (e) { return e.message; }"
              },
              {
                "id": 3,
                "name": "Resolves diamond graph correctly",
                "input": "{ A: ['B', 'C'], B: ['D'], C: ['D'], D: [] }",
                "expected": true,
                "testFn": "const order = resolveEvaluationOrder({ A: ['B', 'C'], B: ['D'], C: ['D'], D: [] }); return order[0] === 'D' && order[order.length - 1] === 'A';"
              }
            ],
            "solutionCode": "/**\n * Computes deterministic module evaluation order or detects circular cycles.\n */\nfunction resolveEvaluationOrder(graph) {\n  const order = [];\n  const visited = new Set();\n  const visiting = new Set();\n\n  function visit(node) {\n    if (visiting.has(node)) {\n      throw new Error('Circular dependency detected at module: ' + node);\n    }\n    if (visited.has(node)) return;\n\n    visiting.add(node);\n    const deps = graph[node] || [];\n    for (const dep of deps) {\n      visit(dep);\n    }\n    visiting.delete(node);\n    visited.add(node);\n    order.push(node);\n  }\n\n  for (const node of Object.keys(graph)) {\n    if (!visited.has(node)) {\n      visit(node);\n    }\n  }\n\n  return order;\n}\n"
          }
        ]
      }
    ]
  }
];
