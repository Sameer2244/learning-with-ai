// Builder script to construct rich, validated topics.js with Basic, Medium, Hard categories and test cases
const fs = require('fs');
const path = require('path');

const topicsData = [
  {
    id: "engine-internals",
    category: "1. JS Engine & Memory Internals",
    badge: "Core Architecture",
    description: "Understand the V8/SpiderMonkey runtime, memory heap, call stack, execution contexts, and variable lifetimes.",
    topics: [
      {
        id: "execution-context",
        title: "Execution Context & Call Stack",
        tag: "Engine",
        summary: "Creation phase vs Execution phase, Global Execution Context, Function Context, and Stack Overflow mechanics.",
        mentalModel: "Before running any code line, the JS engine allocates memory for declarations (Creation Phase), setting up variable records and the [[Environment]] reference. In the Execution Phase, code is evaluated line-by-line synchronously onto the single-threaded Call Stack.",
        traps: "Variable shadowing, deep recursive calls exhausting stack space (RangeError: Maximum call stack size exceeded), and context creation cost.",
        challenges: {
          Basic: {
            id: "exec-context-basic",
            title: "Call Stack Depth Calculator",
            difficulty: "Basic",
            concept: "Call Stack Execution & Linear Frame Tracking",
            description: "Implement a function `measureStackDepth(limit)` that calculates how many nested function calls can be made synchronously without overflowing the stack. If `limit` is reached, it should return the count of frames reached safely.",
            starterCode: `/**
 * Calculate safe call stack depth iteratively or recursively up to limit.
 * @param {number} limit - Maximum depth to check safely
 * @returns {number} The depth reached
 */
function measureStackDepth(limit = 1000) {
  // Your implementation here
  let depth = 0;
  function recurse() {
    if (depth >= limit) return depth;
    depth++;
    return recurse();
  }
  return recurse();
}
`,
            interviewTrap: "Attempting an unbounded recursion will crash with RangeError: Maximum call stack size exceeded. In production you must establish guard rails.",
            testCases: [
              {
                id: 1,
                name: "Reaches small depth of 10 frames",
                input: "measureStackDepth(10)",
                expected: 10,
                testFn: "return measureStackDepth(10);"
              },
              {
                id: 2,
                name: "Reaches depth of 500 frames safely",
                input: "measureStackDepth(500)",
                expected: 500,
                testFn: "return measureStackDepth(500);"
              },
              {
                id: 3,
                name: "Handles limit of 0 correctly",
                input: "measureStackDepth(0)",
                expected: 0,
                testFn: "return measureStackDepth(0);"
              }
            ]
          },
          Medium: {
            id: "exec-context-medium",
            title: "Fix Deep Stack Overflow (Trampoline / Iterative Traversal)",
            difficulty: "Medium",
            concept: "Tail-Call Trampolining & Heap vs Stack Allocation",
            description: "A standard recursive traversal of a deep linked list crashes with `RangeError: Maximum call stack size exceeded` for large N. Implement `safeTraverse(head)` that iterates through the list without exhausting the call stack, returning the total count of nodes.",
            starterCode: `/**
 * Safely traverses a singly-linked list of any size without stack overflow.
 * @param {{ val: any, next: object|null }|null} head
 * @returns {number} Total count of nodes
 */
function safeTraverse(head) {
  // Implement an iterative or trampolined traversal to handle 50,000+ nodes
  let count = 0;
  let curr = head;
  while (curr) {
    count++;
    curr = curr.next;
  }
  return count;
}
`,
            interviewTrap: "Candidates often write simple recursion `count(node.next) + 1` which overflows around 10,000 calls in V8. Converting to an iterative loop or trampoline moves frames from call stack to heap memory.",
            testCases: [
              {
                id: 1,
                name: "Counts 3-node linked list",
                input: "head = 1 -> 2 -> 3",
                expected: 3,
                testFn: "const list = { val: 1, next: { val: 2, next: { val: 3, next: null } } }; return safeTraverse(list);"
              },
              {
                id: 2,
                name: "Handles null head without error",
                input: "head = null",
                expected: 0,
                testFn: "return safeTraverse(null);"
              },
              {
                id: 3,
                name: "Traverses 30,000 nodes without stack overflow",
                input: "Linked list with 30,000 nodes",
                expected: 30000,
                testFn: "let head = null; for(let i = 0; i < 30000; i++) { head = { val: i, next: head }; } return safeTraverse(head);"
              }
            ]
          },
          Hard: {
            id: "exec-context-hard",
            title: "Synchronous Execution Context Profiler",
            difficulty: "Hard",
            concept: "Execution Context Call Tracking & Stack Unwinding",
            description: "Build an execution context tracker `createExecutionTracker()` that returns an object with methods: `enter(contextName)`, `exit(contextName)`, `getCurrentContext()`, and `getCallStackSnapshot()`. It must validate that exiting matches the current active top of the call stack (LIFO order), and throw an Error if an unmatched exit occurs.",
            starterCode: `/**
 * Simulates call stack frame tracking with LIFO validation.
 */
function createExecutionTracker() {
  const stack = [];
  
  return {
    enter(name) {
      stack.push(name);
      return stack.length;
    },
    exit(name) {
      if (stack.length === 0) {
        throw new Error('Call stack underflow');
      }
      const top = stack[stack.length - 1];
      if (top !== name) {
        throw new Error(\`Mismatched exit: expected \${top}, got \${name}\`);
      }
      return stack.pop();
    },
    getCurrentContext() {
      return stack.length > 0 ? stack[stack.length - 1] : null;
    },
    getCallStackSnapshot() {
      return [...stack];
    }
  };
}
`,
            interviewTrap: "Forgetting that call stacks are strictly LIFO (Last-In First-Out). Exiting a parent before a child context indicates invalid unnesting.",
            testCases: [
              {
                id: 1,
                name: "Tracks nested contexts in LIFO order",
                input: "enter('Global') -> enter('fnA') -> getCurrentContext()",
                expected: "fnA",
                testFn: "const t = createExecutionTracker(); t.enter('Global'); t.enter('fnA'); return t.getCurrentContext();"
              },
              {
                id: 2,
                name: "Unwinds stack accurately on exit",
                input: "enter('Global') -> enter('fnA') -> exit('fnA') -> getCurrentContext()",
                expected: "Global",
                testFn: "const t = createExecutionTracker(); t.enter('Global'); t.enter('fnA'); t.exit('fnA'); return t.getCurrentContext();"
              },
              {
                id: 3,
                name: "Throws error on mismatched exit",
                input: "enter('A') -> exit('B') throws Error",
                expected: true,
                testFn: "const t = createExecutionTracker(); t.enter('A'); try { t.exit('B'); return false; } catch (e) { return true; }"
              }
            ]
          }
        }
      },
      {
        id: "lexical-scope-closures",
        title: "Scope Chain, Lexical Scoping & Closures",
        tag: "Memory & Scope",
        summary: "Lexical environments, outer scope references, closures in loops, and memory leak retention.",
        mentalModel: "Functions in JS carry an internal [[Environment]] slot pointing to their lexical parent. A closure is formed whenever an inner function survives outside its parent scope while retaining references to variables in that parent's Lexical Environment Record.",
        traps: "The classic loop trap `for(var i=0; i<3; i++) setTimeout(...)`, retaining large objects in closure scope unintentionally, and stale closures in callbacks.",
        challenges: {
          Basic: {
            id: "closures-basic",
            title: "Private Counter Factory with Step",
            difficulty: "Basic",
            concept: "Lexical Scoping & Variable Encapsulation",
            description: "Implement `createCounter(initialValue, step)` that encapsulates `initialValue` and `step` in a closure. It returns an object with `increment()`, `decrement()`, `getValue()`, and `reset()`.",
            starterCode: `/**
 * Encapsulates state within a closure.
 */
function createCounter(initialValue = 0, step = 1) {
  let count = initialValue;
  return {
    increment() {
      count += step;
      return count;
    },
    decrement() {
      count -= step;
      return count;
    },
    getValue() {
      return count;
    },
    reset() {
      count = initialValue;
      return count;
    }
  };
}
`,
            interviewTrap: "Exposing internal variables directly or allowing external mutation without getters/setters.",
            testCases: [
              {
                id: 1,
                name: "Increments and decrements with step",
                input: "counter(10, 5) -> increment() -> 15",
                expected: 15,
                testFn: "const c = createCounter(10, 5); return c.increment();"
              },
              {
                id: 2,
                name: "Independent counters maintain isolated states",
                input: "c1.increment() does not affect c2",
                expected: [1, 10],
                testFn: "const c1 = createCounter(0, 1); const c2 = createCounter(10, 2); c1.increment(); return [c1.getValue(), c2.getValue()];"
              },
              {
                id: 3,
                name: "Resets accurately to initial value",
                input: "increment 3 times then reset()",
                expected: 5,
                testFn: "const c = createCounter(5, 2); c.increment(); c.increment(); c.reset(); return c.getValue();"
              }
            ]
          },
          Medium: {
            id: "closures-medium",
            title: "Secure Store with Memory Release & Deep Snapshot",
            difficulty: "Medium",
            concept: "Closure Encapsulation & Memory Leak Prevention",
            description: "Create `createSecureStore(initialData)` that stores sensitive data within a closure. Provide `get(key)`, `set(key, value)`, `has(key)`, and `clear()`. Crucially, `get(key)` must return a safe deep copy (so mutating the returned object does not mutate the inner store), and `clear()` must empty the inner map to free memory.",
            starterCode: `function createSecureStore(initialData = {}) {
  let store = JSON.parse(JSON.stringify(initialData));
  
  return {
    get(key) {
      if (!(key in store)) return undefined;
      const val = store[key];
      return typeof val === 'object' && val !== null ? JSON.parse(JSON.stringify(val)) : val;
    },
    set(key, value) {
      store[key] = typeof value === 'object' && value !== null ? JSON.parse(JSON.stringify(value)) : value;
    },
    has(key) {
      return key in store;
    },
    clear() {
      store = {};
    }
  };
}
`,
            interviewTrap: "Returning direct object references from closures allows external callers to mutate private state directly.",
            testCases: [
              {
                id: 1,
                name: "Stores and retrieves primitive values",
                input: "set('token', 'abc') -> get('token')",
                expected: "abc",
                testFn: "const s = createSecureStore(); s.set('token', 'abc'); return s.get('token');"
              },
              {
                id: 2,
                name: "Prevents external mutation of stored objects",
                input: "Mutating returned object does not affect internal store",
                expected: "alice",
                testFn: "const s = createSecureStore({ user: { name: 'alice' } }); const u = s.get('user'); u.name = 'hacked'; return s.get('user').name;"
              },
              {
                id: 3,
                name: "clear() wipes stored data completely",
                input: "set -> clear -> has('key')",
                expected: false,
                testFn: "const s = createSecureStore(); s.set('k', 123); s.clear(); return s.has('k');"
              }
            ]
          },
          Hard: {
            id: "closures-hard",
            title: "Advanced Multi-Key Memoizer with Capacity & TTL",
            difficulty: "Hard",
            concept: "Lexical Cache Management & Memory Eviction",
            description: "Implement `memoize(fn, { maxAge, maxSize })` which returns a memoized version of `fn`. It must serialize multiple arguments into a deterministic key, respect `maxSize` (LRU eviction when full), and expire entries after `maxAge` milliseconds if provided.",
            starterCode: `function memoize(fn, options = {}) {
  const { maxAge = Infinity, maxSize = Infinity } = options;
  const cache = new Map(); // key -> { value, expiry }

  return function(...args) {
    const key = JSON.stringify(args);
    const now = Date.now();

    if (cache.has(key)) {
      const entry = cache.get(key);
      if (now < entry.expiry) {
        // Refresh position for LRU
        cache.delete(key);
        cache.set(key, entry);
        return entry.value;
      } else {
        cache.delete(key);
      }
    }

    const result = fn.apply(this, args);

    if (cache.size >= maxSize) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }

    cache.set(key, { value: result, expiry: now + maxAge });
    return result;
  };
}
`,
            interviewTrap: "Using simple objects as caches causes memory leaks over time because entries are never evicted. Using Map with LRU deletion and TTL prevents unbounded memory growth.",
            testCases: [
              {
                id: 1,
                name: "Caches computation across repeated calls",
                input: "memoizedFn called twice only executes target once",
                expected: { calls: 1, result: 25 },
                testFn: "let calls = 0; const square = memoize((x) => { calls++; return x * x; }); const r1 = square(5); const r2 = square(5); return { calls, result: r2 };"
              },
              {
                id: 2,
                name: "Evicts oldest entry when maxSize is exceeded",
                input: "maxSize = 2, adding 3rd evicts 1st",
                expected: { calls: 3 },
                testFn: "let calls = 0; const fn = memoize((x) => { calls++; return x; }, { maxSize: 2 }); fn(1); fn(2); fn(3); fn(1); return { calls };"
              },
              {
                id: 3,
                name: "Correctly handles multiple arguments",
                input: "add(2, 3) vs add(3, 2)",
                expected: [5, 5],
                testFn: "let calls = 0; const add = memoize((a, b) => { calls++; return a + b; }); return [add(2, 3), add(3, 2)];"
              }
            ]
          }
        }
      },
      {
        id: "hoisting-tdz",
        title: "Hoisting & Temporal Dead Zone (TDZ)",
        tag: "Engine",
        summary: "var vs let/const, Function Declarations vs Expressions, and parameter default TDZ.",
        mentalModel: "All declarations are hoisted during context creation. However, while `var` is initialized to `undefined`, `let` and `const` remain uninitialized in the Temporal Dead Zone (TDZ) until the evaluator passes their actual declaration line. Accessing them in TDZ throws a ReferenceError.",
        traps: "Function declaration inside `if` block (ES6 Annex B semantics), class hoisting (classes are NOT hoisted like functions, they behave like `let`), and default parameter referencing uninitialized variables `(a = b, b = 2) => {}`.",
        challenges: {
          Basic: {
            id: "tdz-basic",
            title: "Var vs Let Hoisting Analyzer",
            difficulty: "Basic",
            concept: "Variable Lifecycle & Declaration Hoisting",
            description: "Implement `analyzeHoisting(varCodeStr)` that inspects a simple code snippet and determines whether accessing a variable before its declaration returns `undefined` (hoisted with var) or throws a `ReferenceError` (hoisted into TDZ with let/const). Return 'INITIALIZED_UNDEFINED' or 'TDZ_REFERENCE_ERROR'.",
            starterCode: `/**
 * Analyzes whether declaration style results in undefined or TDZ error.
 * @param {'var'|'let'|'const'} declarationType
 * @returns {string}
 */
function analyzeHoisting(declarationType) {
  if (declarationType === 'var') {
    return 'INITIALIZED_UNDEFINED';
  }
  if (declarationType === 'let' || declarationType === 'const') {
    return 'TDZ_REFERENCE_ERROR';
  }
  return 'UNKNOWN';
}
`,
            interviewTrap: "Believing that `let` and `const` are not hoisted at all. They ARE hoisted to the top of the block, but stay uninitialized in the TDZ.",
            testCases: [
              {
                id: 1,
                name: "var declaration is initialized to undefined",
                input: "analyzeHoisting('var')",
                expected: "INITIALIZED_UNDEFINED",
                testFn: "return analyzeHoisting('var');"
              },
              {
                id: 2,
                name: "let declaration produces TDZ ReferenceError",
                input: "analyzeHoisting('let')",
                expected: "TDZ_REFERENCE_ERROR",
                testFn: "return analyzeHoisting('let');"
              },
              {
                id: 3,
                name: "const declaration produces TDZ ReferenceError",
                input: "analyzeHoisting('const')",
                expected: "TDZ_REFERENCE_ERROR",
                testFn: "return analyzeHoisting('const');"
              }
            ]
          },
          Medium: {
            id: "tdz-medium",
            title: "Parameter Scope TDZ Resolver",
            difficulty: "Medium",
            concept: "Default Parameter Temporal Dead Zone & Scope Boundary",
            description: "When default parameters reference each other (e.g. `(a = b, b = 2)`), accessing `b` before its evaluation produces a TDZ ReferenceError. Implement `safeDefaultResolver(params, evaluator)` which receives parameter declarations in order and returns an object `{ valid: boolean, errorParam?: string }` detecting whether any parameter references an uninitialized following parameter.",
            starterCode: `function safeDefaultResolver(paramOrder, references) {
  // paramOrder: Array of string param names in evaluation order: ['a', 'b', 'c']
  // references: Map of param -> array of dependencies: { a: ['b'], b: [] }
  const initialized = new Set();
  
  for (const param of paramOrder) {
    const deps = references[param] || [];
    for (const dep of deps) {
      if (!initialized.has(dep)) {
        return { valid: false, errorParam: dep };
      }
    }
    initialized.add(param);
  }
  return { valid: true };
}
`,
            interviewTrap: "Parameter scopes evaluate from left to right. A default parameter can reference previously initialized parameters to its left, but referencing a parameter to its right throws a TDZ ReferenceError.",
            testCases: [
              {
                id: 1,
                name: "Valid left-to-right default parameter reference",
                input: "b depends on a: valid",
                expected: { valid: true },
                testFn: "return safeDefaultResolver(['a', 'b'], { a: [], b: ['a'] });"
              },
              {
                id: 2,
                name: "TDZ error when referencing right-hand parameter",
                input: "a depends on b before b is initialized",
                expected: { valid: false, errorParam: "b" },
                testFn: "return safeDefaultResolver(['a', 'b'], { a: ['b'], b: [] });"
              },
              {
                id: 3,
                name: "Independent parameters evaluate safely",
                input: "['x', 'y', 'z'] with no dependencies",
                expected: { valid: true },
                testFn: "return safeDefaultResolver(['x', 'y', 'z'], { x: [], y: [], z: [] });"
              }
            ]
          },
          Hard: {
            id: "tdz-hard",
            title: "Safe Function Declaration & Hoisting Sandbox",
            difficulty: "Hard",
            concept: "ES6 Annex B Block Scoping for Function Declarations",
            description: "In ES6+, function declarations inside `if` blocks are block-scoped. Implement `evaluateBlockFunctions(condition, trueFnName, falseFnName)` that executes a simulated block-scoped environment and returns which function is accessible outside the block vs inside.",
            starterCode: `function evaluateBlockFunctions(condition) {
  let insideResult = null;
  let outsideHasTrue = false;
  
  if (condition) {
    function target() { return 'INSIDE_TRUE'; }
    insideResult = target();
  } else {
    function target() { return 'INSIDE_FALSE'; }
    insideResult = target();
  }

  return {
    insideResult,
    hasGlobalLeak: typeof target === 'function'
  };
}
`,
            interviewTrap: "In legacy ES5 / non-strict mode, function declarations in blocks were hoisted out into function scope, overwriting each other. In strict mode, they are strictly block scoped.",
            testCases: [
              {
                id: 1,
                name: "Executes true branch function correctly",
                input: "evaluateBlockFunctions(true)",
                expected: "INSIDE_TRUE",
                testFn: "return evaluateBlockFunctions(true).insideResult;"
              },
              {
                id: 2,
                name: "Executes false branch function correctly",
                input: "evaluateBlockFunctions(false)",
                expected: "INSIDE_FALSE",
                testFn: "return evaluateBlockFunctions(false).insideResult;"
              },
              {
                id: 3,
                name: "Functions are scoped and execute deterministically",
                input: "Both branches return non-null strings",
                expected: true,
                testFn: "const r1 = evaluateBlockFunctions(true); const r2 = evaluateBlockFunctions(false); return typeof r1.insideResult === 'string' && typeof r2.insideResult === 'string';"
              }
            ]
          }
        }
      },
      {
        id: "this-binding",
        title: "'this' Keyword Mechanics & Binding Rules",
        tag: "Language Core",
        summary: "The 4 binding rules: Default, Implicit, Explicit (`call`/`apply`/`bind`), New, plus Lexical `this` in arrow functions.",
        mentalModel: "`this` is NOT author-time; it is runtime call-site dependent (except arrow functions, which capture `this` lexically from their enclosing scope). The precedence order is: new binding > explicit binding > implicit binding > default binding (global or undefined in strict mode).",
        traps: "Passing methods as callbacks losing implicit `this`, arrow functions used as object methods or prototype methods, and constructors returning an explicit object overriding the `new` instance.",
        challenges: {
          Basic: {
            id: "this-basic",
            title: "Method Callback Context Binder",
            difficulty: "Basic",
            concept: "Preserving Object Context when Passing Callbacks",
            description: "When an object method is passed as a callback (e.g., `setTimeout(obj.method)`), implicit `this` is lost. Implement `bindMethod(obj, methodName)` that returns a wrapper function guaranteeing that `methodName` always executes with `obj` as `this`, preserving any forwarded arguments.",
            starterCode: `/**
 * Binds an object's method to its owner object.
 */
function bindMethod(obj, methodName) {
  return function(...args) {
    return obj[methodName].apply(obj, args);
  };
}
`,
            interviewTrap: "Extracting a method `const fn = obj.method; fn()` invokes `fn` with default binding (undefined in strict mode), losing all object properties.",
            testCases: [
              {
                id: 1,
                name: "Preserves object property access",
                input: "bound method accesses this.name",
                expected: "Antigravity",
                testFn: "const user = { name: 'Antigravity', getName() { return this.name; } }; const bound = bindMethod(user, 'getName'); return bound();"
              },
              {
                id: 2,
                name: "Forwards arguments properly to bound method",
                input: "bound method passes greeting and punctuation",
                expected: "Hello, Antigravity!",
                testFn: "const user = { name: 'Antigravity', greet(prefix, suffix) { return \`\${prefix}, \${this.name}\${suffix}\`; } }; const bound = bindMethod(user, 'greet'); return bound('Hello', '!');"
              },
              {
                id: 3,
                name: "Maintains binding even when assigned to another variable",
                input: "const detached = bound; detached()",
                expected: 42,
                testFn: "const calc = { value: 42, getVal() { return this.value; } }; const detached = bindMethod(calc, 'getVal'); return detached();"
              }
            ]
          },
          Medium: {
            id: "this-medium",
            title: "Implement Custom Function.prototype.myCall & myApply",
            difficulty: "Medium",
            concept: "Explicit Context Invocation via Property Binding",
            description: "Implement `myCall(thisArg, ...args)` on `Function.prototype` without using native `.call()`, `.apply()`, or `.bind()`. It must handle null/undefined `thisArg` (falling back to globalThis/window), wrap primitives, and avoid colliding with existing properties on `thisArg` using `Symbol()`.",
            starterCode: `Function.prototype.myCall = function(thisArg, ...args) {
  if (typeof this !== 'function') {
    throw new TypeError('myCall must be called on a function');
  }
  
  const context = (thisArg === null || thisArg === undefined)
    ? globalThis
    : Object(thisArg);

  const fnKey = Symbol('fnKey');
  context[fnKey] = this;

  try {
    const result = context[fnKey](...args);
    return result;
  } finally {
    delete context[fnKey];
  }
};
`,
            interviewTrap: "Using a plain string key like `context.__fn__ = this` can overwrite existing properties on the target object. Using `Symbol()` guarantees zero key collision.",
            testCases: [
              {
                id: 1,
                name: "Invokes function with explicit object context",
                input: "greet.myCall({ name: 'Bob' }, 'Hi')",
                expected: "Hi Bob",
                testFn: "function greet(greeting) { return greeting + ' ' + this.name; } return greet.myCall({ name: 'Bob' }, 'Hi');"
              },
              {
                id: 2,
                name: "Cleans up temporary property after invocation",
                input: "Verify no lingering properties left on context",
                expected: 0,
                testFn: "const ctx = {}; function test() { return 1; } test.myCall(ctx); return Object.getOwnPropertySymbols(ctx).length;"
              },
              {
                id: 3,
                name: "Handles primitive numbers or strings as thisArg",
                input: "getLen.myCall('hello')",
                expected: 5,
                testFn: "function getLen() { return this.length; } return getLen.myCall('hello');"
              }
            ]
          },
          Hard: {
            id: "this-hard",
            title: "Custom 'bind' Polyfill with 'new' Operator Support",
            difficulty: "Hard",
            concept: "Currying, Prototype Chaining, and new.target Resolution",
            description: "Implement `Function.prototype.myBind(thisArg, ...outerArgs)`. It must support partial application (currying), and when the bound function is invoked as a constructor using `new BoundFn()`, the provided `thisArg` MUST be ignored and a new instance inheriting from the original function's prototype must be created.",
            starterCode: `Function.prototype.myBind = function(thisArg, ...outerArgs) {
  if (typeof this !== 'function') {
    throw new TypeError('myBind must be called on a function');
  }

  const originalFn = this;

  function boundFn(...innerArgs) {
    const isConstructorCall = this instanceof boundFn;
    const finalContext = isConstructorCall ? this : thisArg;
    return originalFn.apply(finalContext, [...outerArgs, ...innerArgs]);
  }

  // Preserve prototype chain for 'new' instantiation
  if (originalFn.prototype) {
    boundFn.prototype = Object.create(originalFn.prototype);
  }

  return boundFn;
};
`,
            interviewTrap: "90% of candidates miss the `new` operator rule: when a bound function is called with `new`, the bound `thisArg` is completely ignored in favor of the newly instantiated object.",
            testCases: [
              {
                id: 1,
                name: "Standard bound invocation with curried arguments",
                input: "add.myBind(null, 10)(20)",
                expected: 30,
                testFn: "function add(a, b) { return a + b; } const add10 = add.myBind(null, 10); return add10(20);"
              },
              {
                id: 2,
                name: "Maintains object this context",
                input: "fn.myBind(user)()",
                expected: "Alex",
                testFn: "const user = { name: 'Alex' }; function getName() { return this.name; } return getName.myBind(user)();"
              },
              {
                id: 3,
                name: "Supports 'new' operator correctly overriding thisArg",
                input: "new (Point.myBind({ x: 99 }, 5))(10)",
                expected: { x: 5, y: 10, isInstance: true },
                testFn: "function Point(x, y) { this.x = x; this.y = y; } const BoundPoint = Point.myBind({ x: 99 }, 5); const pt = new BoundPoint(10); return { x: pt.x, y: pt.y, isInstance: pt instanceof Point };"
              }
            ]
          }
        }
      }
    ]
  },
  {
    id: "async-concurrency",
    category: "2. Asynchronous JS & Concurrency",
    badge: "Runtime Engine",
    description: "Master the Event Loop, microtasks vs macrotasks, Promise internals, and async state machines.",
    topics: [
      {
        id: "event-loop-queues",
        title: "Event Loop: Microtasks vs Macrotasks",
        tag: "Concurrency",
        summary: "Call Stack, Macrotask Queue (setTimeout/I/O), Microtask Queue (Promise.then/queueMicrotask), and UI render steps.",
        mentalModel: "The Event Loop continuously checks if the Call Stack is empty. When empty, it DRAINS THE ENTIRE Microtask Queue until empty (even if microtasks schedule more microtasks!) before picking ONE macrotask from the Macrotask Queue.",
        traps: "Microtask starvation (infinite `Promise.resolve().then(...)` locking the UI), order between `requestAnimationFrame`, `setTimeout(0)`, and nested `then` handlers.",
        challenges: {
          Basic: {
            id: "event-loop-basic",
            title: "Microtask Runner with queueMicrotask",
            difficulty: "Basic",
            concept: "Microtask Dispatch Order vs Synchronous Execution",
            description: "Implement `runMicrotaskBatch(tasks)` that accepts an array of functions, executes them strictly as microtasks, and returns a Promise that resolves with an array of their results in order.",
            starterCode: `/**
 * Schedules each task in the microtask queue and gathers results.
 */
function runMicrotaskBatch(tasks) {
  return new Promise((resolve) => {
    const results = [];
    let completed = 0;
    
    if (tasks.length === 0) return resolve([]);

    tasks.forEach((task, index) => {
      queueMicrotask(() => {
        results[index] = task();
        completed++;
        if (completed === tasks.length) {
          resolve(results);
        }
      });
    });
  });
}
`,
            interviewTrap: "Assuming `queueMicrotask` executes in the next macrotask turn like `setTimeout`. Microtasks execute immediately upon completion of the current call stack.",
            testCases: [
              {
                id: 1,
                name: "Executes microtasks in parallel and returns results",
                input: "tasks = [() => 1, () => 2, () => 3]",
                expected: [1, 2, 3],
                testFn: "return runMicrotaskBatch([() => 1, () => 2, () => 3]);"
              },
              {
                id: 2,
                name: "Handles empty task list",
                input: "tasks = []",
                expected: [],
                testFn: "return runMicrotaskBatch([]);"
              },
              {
                id: 3,
                name: "Executes before setTimeout(0)",
                input: "microtask order check",
                expected: ['microtask', 'timeout'],
                testFn: "const log = []; await new Promise(r => { setTimeout(() => { log.push('timeout'); r(); }, 0); queueMicrotask(() => log.push('microtask')); }); return log;"
              }
            ]
          },
          Medium: {
            id: "event-loop-medium",
            title: "Microtask Batcher (Coalesce Multiple Calls into Single Turn)",
            difficulty: "Medium",
            concept: "Event Loop Turn Coalescing & Batch Updating",
            description: "Build `createBatcher(flushCallback)` that batches multiple synchronous updates and triggers `flushCallback(accumulatedItems)` exactly ONCE in the microtask queue at the end of the current synchronous turn.",
            starterCode: `function createBatcher(flushCallback) {
  let batch = [];
  let isScheduled = false;

  return function add(item) {
    batch.push(item);
    
    if (!isScheduled) {
      isScheduled = true;
      queueMicrotask(() => {
        const itemsToFlush = [...batch];
        batch = [];
        isScheduled = false;
        flushCallback(itemsToFlush);
      });
    }
  };
}
`,
            interviewTrap: "Calling the flush callback for every item or using `setTimeout` (which introduces a 4ms minimum delay and runs after UI rendering).",
            testCases: [
              {
                id: 1,
                name: "Batches multiple synchronous calls into one flush",
                input: "add(1), add(2), add(3) synchronously",
                expected: [[1, 2, 3]],
                testFn: "const flushes = []; const batcher = createBatcher(items => flushes.push(items)); batcher(1); batcher(2); batcher(3); await Promise.resolve(); return flushes;"
              },
              {
                id: 2,
                name: "Subsequent turns trigger new independent batches",
                input: "batch in turn 1 and batch in turn 2",
                expected: [[10], [20]],
                testFn: "const flushes = []; const batcher = createBatcher(items => flushes.push(items)); batcher(10); await Promise.resolve(); batcher(20); await Promise.resolve(); return flushes;"
              },
              {
                id: 3,
                name: "Flush receives full item set in exact insertion order",
                input: "batch with strings ['a', 'b', 'c']",
                expected: ['a', 'b', 'c'],
                testFn: "let res = null; const batcher = createBatcher(items => { res = items; }); batcher('a'); batcher('b'); batcher('c'); await Promise.resolve(); return res;"
              }
            ]
          },
          Hard: {
            id: "event-loop-hard",
            title: "Microtask Starvation Guard & Fair Task Scheduler",
            difficulty: "Hard",
            concept: "Microtask Starvation Prevention & Macrotask Interleaving",
            description: "If recursive microtasks continually schedule more microtasks, the event loop locks up and macrotasks/UI renders never run. Implement `fairScheduler(tasks, maxMicrotasksPerYield)` that executes tasks via microtasks, but yields to a macrotask (`setTimeout`) after `maxMicrotasksPerYield` tasks to prevent UI starvation.",
            starterCode: `async function fairScheduler(tasks, maxMicrotasksPerYield = 5) {
  const results = [];
  let processedInCurrentYield = 0;

  for (let i = 0; i < tasks.length; i++) {
    if (processedInCurrentYield >= maxMicrotasksPerYield) {
      // Yield to macrotask queue to allow UI and timer processing
      await new Promise(resolve => setTimeout(resolve, 0));
      processedInCurrentYield = 0;
    }
    results.push(await tasks[i]());
    processedInCurrentYield++;
  }

  return results;
}
`,
            interviewTrap: "Infinite microtasks (`while(true) queueMicrotask(...)`) cause complete page freeze because the event loop will never leave the microtask checkpoint to service browser renders or user clicks.",
            testCases: [
              {
                id: 1,
                name: "Processes small batch without yielding",
                input: "3 tasks with yield limit 5",
                expected: [1, 2, 3],
                testFn: "const tasks = [() => 1, () => 2, () => 3]; return fairScheduler(tasks, 5);"
              },
              {
                id: 2,
                name: "Processes large batch correctly with yields",
                input: "10 tasks with yield limit 3",
                expected: 10,
                testFn: "const tasks = Array.from({ length: 10 }, (_, i) => () => i); const res = await fairScheduler(tasks, 3); return res.length;"
              },
              {
                id: 3,
                name: "Allows interleaved macrotask execution during yields",
                input: "Interleaved setTimeout fires during execution",
                expected: true,
                testFn: "let timerFired = false; setTimeout(() => { timerFired = true; }, 0); const tasks = Array.from({ length: 8 }, () => () => 1); await fairScheduler(tasks, 2); return timerFired;"
              }
            ]
          }
        }
      },
      {
        id: "promise-mechanics",
        title: "Promise Internals & Concurrency Combinators",
        tag: "Async",
        summary: "Promise state transitions, chaining return values vs thrown errors, implementing Promise.all / allSettled / race / any.",
        mentalModel: "A Promise is a state machine: [Pending] -> [Fulfilled] or [Rejected]. Once settled, state is immutable. Handlers registered via `.then` or `.catch` are always dispatched asynchronously as microtasks.",
        traps: "Forgotten `return` inside `.then` causing unhandled promises, uncaught rejections with `Promise.all` fast-failing, and handling non-promise values passed to combinators.",
        challenges: {
          Basic: {
            id: "promise-basic",
            title: "Safe Promise Timeout Wrapper",
            difficulty: "Basic",
            concept: "Promise Race & Timeout Handling",
            description: "Implement `withTimeout(promise, ms, timeoutErrorMsg)` that returns a Promise that rejects with an Error(`timeoutErrorMsg`) if `promise` does not settle within `ms` milliseconds.",
            starterCode: `function withTimeout(promise, ms, timeoutErrorMsg = 'Operation timed out') {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(timeoutErrorMsg)), ms);
    })
  ]);
}
`,
            interviewTrap: "Not clearing the timer when the primary promise resolves or rejects, leaving open handles in server environments.",
            testCases: [
              {
                id: 1,
                name: "Resolves if promise completes before timeout",
                input: "fast promise (10ms) with 100ms timeout",
                expected: "fast-result",
                testFn: "const p = new Promise(r => setTimeout(() => r('fast-result'), 10)); return withTimeout(p, 100);"
              },
              {
                id: 2,
                name: "Rejects with timeout error if operation takes too long",
                input: "slow promise (100ms) with 20ms timeout",
                expected: "Timed out!",
                testFn: "const p = new Promise(r => setTimeout(() => r('slow'), 100)); try { await withTimeout(p, 20, 'Timed out!'); return 'FAIL'; } catch (e) { return e.message; }"
              },
              {
                id: 3,
                name: "Preserves original promise rejection",
                input: "rejecting promise before timeout",
                expected: "original-error",
                testFn: "const p = Promise.reject(new Error('original-error')); try { await withTimeout(p, 100); return 'FAIL'; } catch (e) { return e.message; }"
              }
            ]
          },
          Medium: {
            id: "promise-medium",
            title: "Implement Custom Promise.allSettled",
            difficulty: "Medium",
            concept: "Concurrency Aggregation & Error Resilience",
            description: "Implement `myPromiseAllSettled(promises)` without using native `Promise.allSettled`. It takes an iterable of promises (or non-promise values) and returns a promise that resolves with an array of objects `{ status: 'fulfilled', value }` or `{ status: 'rejected', reason }` after ALL promises settle.",
            starterCode: `function myPromiseAllSettled(promises) {
  const items = Array.from(promises);
  if (items.length === 0) return Promise.resolve([]);

  return new Promise((resolve) => {
    const results = [];
    let completed = 0;

    items.forEach((item, index) => {
      Promise.resolve(item)
        .then(value => {
          results[index] = { status: 'fulfilled', value };
        })
        .catch(reason => {
          results[index] = { status: 'rejected', reason };
        })
        .finally(() => {
          completed++;
          if (completed === items.length) {
            resolve(results);
          }
        });
    });
  });
}
`,
            interviewTrap: "Using `Promise.all` which short-circuits on the first rejection. `allSettled` must wait for every promise regardless of success or failure.",
            testCases: [
              {
                id: 1,
                name: "Handles mix of resolved and rejected promises",
                input: "[Promise.resolve(1), Promise.reject('err'), 3]",
                expected: [
                  { status: 'fulfilled', value: 1 },
                  { status: 'rejected', reason: 'err' },
                  { status: 'fulfilled', value: 3 }
                ],
                testFn: "return myPromiseAllSettled([Promise.resolve(1), Promise.reject('err'), 3]);"
              },
              {
                id: 2,
                name: "Handles empty array immediately",
                input: "[]",
                expected: [],
                testFn: "return myPromiseAllSettled([]);"
              },
              {
                id: 3,
                name: "Preserves exact order of input results",
                input: "[slow promise, fast promise]",
                expected: ['slow', 'fast'],
                testFn: "const p1 = new Promise(r => setTimeout(() => r('slow'), 30)); const p2 = new Promise(r => setTimeout(() => r('fast'), 5)); const res = await myPromiseAllSettled([p1, p2]); return res.map(r => r.value);"
              }
            ]
          },
          Hard: {
            id: "promise-hard",
            title: "Throttled Promise Concurrency Pool",
            difficulty: "Hard",
            concept: "Asynchronous Worker Queue & Concurrency Limiting",
            description: "Implement `promisePool(taskFns, concurrencyLimit)` that takes an array of promise-returning functions and executes them with at most `concurrencyLimit` tasks running concurrently. Returns a Promise resolving to an array of results in the original order.",
            starterCode: `async function promisePool(taskFns, concurrencyLimit = 2) {
  const results = new Array(taskFns.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < taskFns.length) {
      const currentIndex = nextIndex++;
      results[currentIndex] = await taskFns[currentIndex]();
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrencyLimit, taskFns.length) },
    () => worker()
  );

  await Promise.all(workers);
  return results;
}
`,
            interviewTrap: "Starting all promises simultaneously using `Promise.all(tasks.map(fn => fn()))` will overwhelm APIs or databases. Running workers that pull from a shared queue guarantees strict concurrency bounds.",
            testCases: [
              {
                id: 1,
                name: "Executes all tasks and preserves result order",
                input: "5 tasks with limit 2",
                expected: [0, 1, 2, 3, 4],
                testFn: "const tasks = [0, 1, 2, 3, 4].map(n => () => Promise.resolve(n)); return promisePool(tasks, 2);"
              },
              {
                id: 2,
                name: "Enforces max concurrency limit",
                input: "Never exceeds limit of 2 active tasks",
                expected: true,
                testFn: "let active = 0; let maxActive = 0; const makeTask = () => async () => { active++; maxActive = Math.max(maxActive, active); await new Promise(r => setTimeout(r, 15)); active--; return 1; }; const tasks = [makeTask(), makeTask(), makeTask(), makeTask()]; await promisePool(tasks, 2); return maxActive <= 2;"
              },
              {
                id: 3,
                name: "Handles concurrency limit larger than task count",
                input: "2 tasks with limit 10",
                expected: ['a', 'b'],
                testFn: "return promisePool([() => Promise.resolve('a'), () => Promise.resolve('b')], 10);"
              }
            ]
          }
        }
      },
      {
        id: "async-await-under-the-hood",
        title: "Async/Await as Generators + Promise Runners",
        tag: "Async Internals",
        summary: "Babel/TypeScript transpilation of async/await into `function*` and automatic Promise driver.",
        mentalModel: "Under the hood, `async/await` is syntactic sugar over Generator functions (`function*`) yielded to a coroutine runner that wraps each yielded value in `Promise.resolve()` and calls `generator.next(val)` or `generator.throw(err)`.",
        traps: "Sequential `await` in loops destroying parallelism (`for...of` vs `Promise.all`), unhandled errors silently terminating async chains.",
        challenges: {
          Basic: {
            id: "generators-basic",
            title: "Infinite Sequence Generator with Step",
            difficulty: "Basic",
            concept: "Generator Protocol & Yield Delegation",
            description: "Implement a generator function `stepSequence(start, step, max)` that yields numbers starting at `start`, incrementing by `step`, until reaching or exceeding `max`.",
            starterCode: `function* stepSequence(start = 0, step = 1, max = 10) {
  let current = start;
  while (current <= max) {
    yield current;
    current += step;
  }
}
`,
            interviewTrap: "Forgetting that generators are lazy; calling `stepSequence()` does not execute code until `.next()` is called.",
            testCases: [
              {
                id: 1,
                name: "Generates correct sequence from 0 to 6 with step 2",
                input: "stepSequence(0, 2, 6)",
                expected: [0, 2, 4, 6],
                testFn: "return Array.from(stepSequence(0, 2, 6));"
              },
              {
                id: 2,
                name: "Terminates when start > max",
                input: "stepSequence(10, 1, 5)",
                expected: [],
                testFn: "return Array.from(stepSequence(10, 1, 5));"
              },
              {
                id: 3,
                name: "Supports manual .next() consumption",
                input: "gen.next().value",
                expected: 5,
                testFn: "const gen = stepSequence(5, 5, 20); return gen.next().value;"
              }
            ]
          },
          Medium: {
            id: "generators-medium",
            title: "Async Pipeline Generator",
            difficulty: "Medium",
            concept: "Pipelining Asynchronous Generator Streams",
            description: "Implement an async generator `asyncTransformStream(items, transformFn)` that consumes an array of items, applies async `transformFn(item)` to each sequentially, and yields each result.",
            starterCode: `async function* asyncTransformStream(items, transformFn) {
  for (const item of items) {
    const transformed = await transformFn(item);
    yield transformed;
  }
}
`,
            interviewTrap: "Using `items.forEach(async ...)` inside an async generator does not pause generator iteration properly.",
            testCases: [
              {
                id: 1,
                name: "Transforms and yields items sequentially",
                input: "async double [1, 2, 3]",
                expected: [2, 4, 6],
                testFn: "const res = []; for await (const val of asyncTransformStream([1, 2, 3], async x => x * 2)) { res.push(val); } return res;"
              },
              {
                id: 2,
                name: "Handles empty array stream",
                input: "empty array",
                expected: [],
                testFn: "const res = []; for await (const val of asyncTransformStream([], async x => x)) { res.push(val); } return res;"
              },
              {
                id: 3,
                name: "Handles async delays between yields",
                input: "async delayed transform",
                expected: ['A', 'B'],
                testFn: "const res = []; const delay = ms => new Promise(r => setTimeout(r, ms)); for await (const v of asyncTransformStream(['a', 'b'], async s => { await delay(5); return s.toUpperCase(); })) { res.push(v); } return res;"
              }
            ]
          },
          Hard: {
            id: "generators-hard",
            title: "Implement 'co' / asyncToGenerator Coroutine Runner",
            difficulty: "Hard",
            concept: "Transpilation of Async/Await to Generators",
            description: "Implement `runCoroutine(generatorFactory)` which takes a generator function yielding Promises, steps through each yield sequentially passing resolved values into `.next(val)` and rejected errors into `.throw(err)`, and returns a Promise resolving to the generator's final return value.",
            starterCode: `function runCoroutine(genFactory) {
  return new Promise((resolve, reject) => {
    const gen = genFactory();

    function step(nextFn) {
      let result;
      try {
        result = nextFn();
      } catch (err) {
        return reject(err);
      }

      if (result.done) {
        return resolve(result.value);
      }

      Promise.resolve(result.value)
        .then(value => step(() => gen.next(value)))
        .catch(err => step(() => gen.throw(err)));
    }

    step(() => gen.next());
  });
}
`,
            interviewTrap: "This is the exact polyfill Babel generates for `async/await`. Candidates often fail to handle generator `.throw(err)` when a yielded promise rejects.",
            testCases: [
              {
                id: 1,
                name: "Steps through yielded promises sequentially",
                input: "yield promise -> yield promise -> return sum",
                expected: 30,
                testFn: "return runCoroutine(function* () { const a = yield Promise.resolve(10); const b = yield Promise.resolve(20); return a + b; });"
              },
              {
                id: 2,
                name: "Catches thrown errors inside generator try/catch",
                input: "yield rejecting promise caught by generator try/catch",
                expected: "caught-error",
                testFn: "return runCoroutine(function* () { try { yield Promise.reject(new Error('fail')); } catch (e) { return 'caught-error'; } });"
              },
              {
                id: 3,
                name: "Propagates unhandled rejection to returned promise",
                input: "unhandled rejected yield rejects coroutine promise",
                expected: "unhandled-boom",
                testFn: "try { await runCoroutine(function* () { yield Promise.reject(new Error('unhandled-boom')); }); return 'FAIL'; } catch (e) { return e.message; }"
              }
            ]
          }
        }
      }
    ]
  },
  {
    id: "prototypes-and-types",
    category: "3. Prototypes, Objects & Type System",
    badge: "Object Model",
    description: "Deep dive into prototype chains, inheritance, type coercion rules, and object property descriptors.",
    topics: [
      {
        id: "prototype-chain",
        title: "Prototype Chain & Prototypal Inheritance",
        tag: "Object Model",
        summary: "`__proto__`, `prototype`, `Object.create`, `instanceof` algorithm, and prototype property shadowing.",
        mentalModel: "Every JS object has an internal `[[Prototype]]` link. Property lookup walks this chain until the property is found or `null` is reached (`Object.prototype.__proto__ === null`). Modifying a property on an instance creates an 'own property' shadowing the prototype's property.",
        traps: "`instanceof` breaking across iframes, mutating `Array.prototype` causing performance de-optimizations, and confusion between a function's `.prototype` property and an object's `[[Prototype]]`.",
        challenges: {
          Basic: {
            id: "proto-basic",
            title: "Prototype Chain Walker & Distance Calculator",
            difficulty: "Basic",
            concept: "[[Prototype]] Traversal to Object.prototype and null",
            description: "Implement `getPrototypeDepth(obj)` that traverses an object's prototype chain and returns the number of hops until `null` is reached. If `obj` is null or undefined, return 0.",
            starterCode: `function getPrototypeDepth(obj) {
  if (obj === null || obj === undefined) return 0;
  let depth = 0;
  let curr = Object.getPrototypeOf(obj);
  while (curr !== null) {
    depth++;
    curr = Object.getPrototypeOf(curr);
  }
  return depth;
}
`,
            interviewTrap: "Using `__proto__` directly is deprecated. Always prefer `Object.getPrototypeOf(obj)`.",
            testCases: [
              {
                id: 1,
                name: "Standard object literal has depth of 1 (Object.prototype -> null)",
                input: "getPrototypeDepth({})",
                expected: 1,
                testFn: "return getPrototypeDepth({});"
              },
              {
                id: 2,
                name: "Object created with Object.create(null) has depth 0",
                input: "getPrototypeDepth(Object.create(null))",
                expected: 0,
                testFn: "return getPrototypeDepth(Object.create(null));"
              },
              {
                id: 3,
                name: "Inherited chain depth reflects hierarchy",
                input: "grandchild -> parent -> Object.prototype -> null",
                expected: 2,
                testFn: "const parent = {}; const child = Object.create(parent); return getPrototypeDepth(child);"
              }
            ]
          },
          Medium: {
            id: "proto-medium",
            title: "Implement Custom 'myInstanceOf' Operator",
            difficulty: "Medium",
            concept: "ECMAScript instanceof Algorithm & Prototype Comparison",
            description: "Implement `myInstanceOf(instance, Constructor)` that mimics the native `instanceof` operator by walking `instance`'s prototype chain checking for `Constructor.prototype`.",
            starterCode: `function myInstanceOf(instance, Constructor) {
  if (instance === null || instance === undefined || (typeof instance !== 'object' && typeof instance !== 'function')) {
    return false;
  }
  if (typeof Constructor !== 'function') {
    throw new TypeError('Right-hand side of myInstanceOf must be a function');
  }

  const targetProto = Constructor.prototype;
  let current = Object.getPrototypeOf(instance);

  while (current !== null) {
    if (current === targetProto) {
      return true;
    }
    current = Object.getPrototypeOf(current);
  }

  return false;
}
`,
            interviewTrap: "Primitives (`myInstanceOf('string', String)`) return false because `instanceof` only checks object instances, not primitive values.",
            testCases: [
              {
                id: 1,
                name: "Detects standard instance accurately",
                input: "myInstanceOf([], Array)",
                expected: true,
                testFn: "return myInstanceOf([], Array);"
              },
              {
                id: 2,
                name: "Walks up multiple prototype inheritance tiers",
                input: "myInstanceOf([], Object)",
                expected: true,
                testFn: "return myInstanceOf([], Object);"
              },
              {
                id: 3,
                name: "Returns false for primitive values",
                input: "myInstanceOf('hello', String)",
                expected: false,
                testFn: "return myInstanceOf('hello', String);"
              }
            ]
          },
          Hard: {
            id: "proto-hard",
            title: "Inheritance Builder with Multiple Mixins & Super Dispatch",
            difficulty: "Hard",
            concept: "Prototypal Inheritance & Clean Method Composition",
            description: "Implement `createSubclass(Parent, ChildConstructor, methods, mixins)` that sets up full prototypal inheritance without ES6 classes, wires `Child.prototype.__proto__` to `Parent.prototype`, copies mixin methods safely, and attaches `_super` to invoke parent methods.",
            starterCode: `function createSubclass(Parent, ChildConstructor, methods = {}, mixins = []) {
  ChildConstructor.prototype = Object.create(Parent.prototype);
  ChildConstructor.prototype.constructor = ChildConstructor;

  // Add subclass methods
  Object.assign(ChildConstructor.prototype, methods);

  // Copy mixins
  for (const mixin of mixins) {
    Object.assign(ChildConstructor.prototype, mixin);
  }

  ChildConstructor.prototype._super = function(methodName, ...args) {
    return Parent.prototype[methodName].apply(this, args);
  };

  return ChildConstructor;
}
`,
            interviewTrap: "Assigning `Child.prototype = Parent.prototype` shares the exact same prototype object, causing methods added to Child to pollute Parent.",
            testCases: [
              {
                id: 1,
                name: "Correctly wires prototype chain",
                input: "child instanceof Parent",
                expected: true,
                testFn: "function Animal(name) { this.name = name; } function Dog(name) { Animal.call(this, name); } createSubclass(Animal, Dog); const d = new Dog('Rex'); return d instanceof Animal;"
              },
              {
                id: 2,
                name: "Executes super method via _super",
                input: "calls parent method via _super",
                expected: "ANIMAL: Rex",
                testFn: "function Animal(name) { this.name = name; } Animal.prototype.speak = function() { return 'ANIMAL: ' + this.name; }; function Dog(name) { Animal.call(this, name); } createSubclass(Animal, Dog, { speak() { return this._super('speak'); } }); const d = new Dog('Rex'); return d.speak();"
              },
              {
                id: 3,
                name: "Integrates mixins into prototype",
                input: "dog has mixin method",
                expected: "wagging",
                testFn: "function Animal() {} function Dog() {} const wagMixin = { wag() { return 'wagging'; } }; createSubclass(Animal, Dog, {}, [wagMixin]); const d = new Dog(); return d.wag();"
              }
            ]
          }
        }
      },
      {
        id: "type-coercion",
        title: "Implicit & Explicit Type Coercion Rules",
        tag: "Type System",
        summary: "ToPrimitive, ToNumber, ToString algorithms, loose equality (==) comparisons, and Symbol.toPrimitive overrides.",
        mentalModel: "The engine coerces primitives via internal algorithms. In loose equality (`==`), boolean values are first coerced to numbers, objects are coerced via `ToPrimitive(hint)`, and `null == undefined` is exclusively true.",
        traps: "`[] == false` is true (both coerce to 0), `[] == ![]` is true, and objects without `valueOf` falling back to `[object Object]`.",
        challenges: {
          Basic: {
            id: "coercion-basic",
            title: "Strict Type Coercion Formatter",
            difficulty: "Basic",
            concept: "Explicit Type Conversions & Truthiness",
            description: "Implement `safeCast(value, targetType)` that explicitly and safely converts `value` to `'string'`, `'number'`, or `'boolean'`. For `'number'`, if conversion results in NaN, return `0` instead.",
            starterCode: `function safeCast(value, targetType) {
  switch (targetType) {
    case 'string':
      return String(value);
    case 'boolean':
      return Boolean(value);
    case 'number': {
      const num = Number(value);
      return Number.isNaN(num) ? 0 : num;
    }
    default:
      return value;
  }
}
`,
            interviewTrap: "Using `+value` or `parseInt` can cause subtle NaN or radix bugs. `Number(value)` with `Number.isNaN()` check is standard.",
            testCases: [
              {
                id: 1,
                name: "Safely converts string to number with NaN fallback",
                input: "safeCast('invalid', 'number')",
                expected: 0,
                testFn: "return safeCast('invalid', 'number');"
              },
              {
                id: 2,
                name: "Casts valid numeric string to number",
                input: "safeCast('42', 'number')",
                expected: 42,
                testFn: "return safeCast('42', 'number');"
              },
              {
                id: 3,
                name: "Casts empty string and non-empty string to boolean",
                input: "safeCast('', 'boolean') vs safeCast('text', 'boolean')",
                expected: [false, true],
                testFn: "return [safeCast('', 'boolean'), safeCast('text', 'boolean')];"
              }
            ]
          },
          Medium: {
            id: "coercion-medium",
            title: "Custom Symbol.toPrimitive Converter",
            difficulty: "Medium",
            concept: "Custom Object-to-Primitive Protocol (Symbol.toPrimitive)",
            description: "Implement `createMoney(amount, currency)` returning an object that supports arithmetic via `Symbol.toPrimitive`: when coerced to a `'number'`, returns `amount`; when coerced to a `'string'`, returns `\${currency} \${amount}`; and when `'default'`, returns `amount`.",
            starterCode: `function createMoney(amount, currency = 'USD') {
  return {
    amount,
    currency,
    [Symbol.toPrimitive](hint) {
      if (hint === 'string') {
        return \`\${this.currency} \${this.amount}\`;
      }
      return this.amount;
    }
  };
}
`,
            interviewTrap: "If `Symbol.toPrimitive` is absent, JS falls back to calling `valueOf()` and then `toString()`. Providing `Symbol.toPrimitive` takes absolute precedence.",
            testCases: [
              {
                id: 1,
                name: "Supports mathematical addition using number hint",
                input: "createMoney(50) + createMoney(25)",
                expected: 75,
                testFn: "const m1 = createMoney(50); const m2 = createMoney(25); return m1 + m2;"
              },
              {
                id: 2,
                name: "Formats currency in template literal using string hint",
                input: "\`Total: \${createMoney(100, 'EUR')}\`",
                expected: "Total: EUR 100",
                testFn: "const m = createMoney(100, 'EUR'); return \`Total: \${m}\`;"
              },
              {
                id: 3,
                name: "Supports numeric comparison operators (<, >)",
                input: "createMoney(10) < createMoney(20)",
                expected: true,
                testFn: "return createMoney(10) < createMoney(20);"
              }
            ]
          },
          Hard: {
            id: "coercion-hard",
            title: "ECMAScript Abstract Equality (==) Simulator",
            difficulty: "Hard",
            concept: "ECMA-262 7.2.14 Abstract Equality Comparison Algorithm",
            description: "Implement `abstractEquals(x, y)` implementing the precise ECMAScript loose equality `==` rules without using the native `==` operator. Must handle null/undefined pairs, String/Number coercions, Boolean-to-number conversions, and Object-to-primitive conversions.",
            starterCode: `function abstractEquals(x, y) {
  // 1. Same Type
  if (typeof x === typeof y) {
    return x === y;
  }

  // 2. null and undefined
  if ((x === null && y === undefined) || (x === undefined && y === null)) {
    return true;
  }

  // 3. Number and String
  if (typeof x === 'number' && typeof y === 'string') {
    return x === Number(y);
  }
  if (typeof x === 'string' && typeof y === 'number') {
    return Number(x) === y;
  }

  // 4. Boolean
  if (typeof x === 'boolean') {
    return abstractEquals(Number(x), y);
  }
  if (typeof y === 'boolean') {
    return abstractEquals(x, Number(y));
  }

  // 5. Object to Primitive
  if ((typeof x === 'string' || typeof x === 'number') && typeof y === 'object' && y !== null) {
    return abstractEquals(x, String(y));
  }
  if (typeof x === 'object' && x !== null && (typeof y === 'string' || typeof y === 'number')) {
    return abstractEquals(String(x), y);
  }

  return false;
}
`,
            interviewTrap: "When comparing a Boolean with anything else, the Boolean is coerced to a Number FIRST! So `[] == true` -> `[] == 1` -> `'' == 1` -> `0 === 1` -> `false`.",
            testCases: [
              {
                id: 1,
                name: "Compares null and undefined as equal",
                input: "abstractEquals(null, undefined)",
                expected: true,
                testFn: "return abstractEquals(null, undefined);"
              },
              {
                id: 2,
                name: "Coerces number string to number accurately",
                input: "abstractEquals('42', 42)",
                expected: true,
                testFn: "return abstractEquals('42', 42);"
              },
              {
                id: 3,
                name: "Handles boolean coercion rules ([] == false is true)",
                input: "abstractEquals([], false)",
                expected: true,
                testFn: "return abstractEquals([], false);"
              }
            ]
          }
        }
      },
      {
        id: "deep-clone-descriptors",
        title: "Object Descriptors & Deep Cloning with Circular References",
        tag: "Object Model",
        summary: "Enumerable, Writable, Configurable descriptors, getters/setters, structuredClone, and handling circular graphs with WeakMap.",
        mentalModel: "`JSON.parse(JSON.stringify(obj))` drops undefined, functions, Symbols, Date (turned to string), RegExp, and throws TypeError on circular references. Production deep clones require a WeakMap visited tracker.",
        traps: "Circular reference infinite recursion, losing getters/setters when copying with `Object.assign`, and copying non-enumerable properties.",
        challenges: {
          Basic: {
            id: "clone-basic",
            title: "Shallow Clone with Property Descriptors",
            difficulty: "Basic",
            concept: "Object.getOwnPropertyDescriptors & Property Integrity",
            description: "Implement `shallowCloneWithDescriptors(obj)` that copies all own properties (enumerable and non-enumerable, including getters/setters and Symbols) using `Object.getOwnPropertyDescriptors` and `Object.create`.",
            starterCode: `function shallowCloneWithDescriptors(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  const proto = Object.getPrototypeOf(obj);
  const descriptors = Object.getOwnPropertyDescriptors(obj);
  return Object.create(proto, descriptors);
}
`,
            interviewTrap: "Using `{ ...obj }` or `Object.assign` turns getter properties into plain value properties evaluated during copy, destroying the dynamic getter.",
            testCases: [
              {
                id: 1,
                name: "Preserves dynamic getter behavior",
                input: "cloned object preserves getter function",
                expected: "HELLO",
                testFn: "const orig = { text: 'hello', get upper() { return this.text.toUpperCase(); } }; const clone = shallowCloneWithDescriptors(orig); orig.text = 'world'; return clone.upper;"
              },
              {
                id: 2,
                name: "Preserves non-enumerable properties",
                input: "cloned object retains non-enumerable property",
                expected: 123,
                testFn: "const orig = {}; Object.defineProperty(orig, 'secret', { value: 123, enumerable: false }); const clone = shallowCloneWithDescriptors(orig); return clone.secret;"
              },
              {
                id: 3,
                name: "Retains prototype of original object",
                input: "clone has identical prototype",
                expected: true,
                testFn: "class Sample {} const orig = new Sample(); const clone = shallowCloneWithDescriptors(orig); return clone instanceof Sample;"
              }
            ]
          },
          Medium: {
            id: "clone-medium",
            title: "Deep Clone Supporting Nested Objects, Arrays, and Dates",
            difficulty: "Medium",
            concept: "Recursive Deep Copy & Built-in Type Handling",
            description: "Implement `deepClone(target)` that creates a completely independent copy of nested objects, arrays, Dates, and RegExps, so mutations to the copy never affect the original.",
            starterCode: `function deepClone(target) {
  if (target === null || typeof target !== 'object') {
    return target;
  }

  if (target instanceof Date) {
    return new Date(target.getTime());
  }

  if (target instanceof RegExp) {
    return new RegExp(target.source, target.flags);
  }

  if (Array.isArray(target)) {
    return target.map(item => deepClone(item));
  }

  const copy = {};
  for (const key of Object.keys(target)) {
    copy[key] = deepClone(target[key]);
  }
  return copy;
}
`,
            interviewTrap: "`JSON.stringify` converts Dates to strings and silently drops RegExps and functions.",
            testCases: [
              {
                id: 1,
                name: "Deeply clones nested arrays and objects without shared references",
                input: "mutating clone does not mutate original",
                expected: 10,
                testFn: "const orig = { a: { b: [10, 20] } }; const clone = deepClone(orig); clone.a.b[0] = 999; return orig.a.b[0];"
              },
              {
                id: 2,
                name: "Accurately clones Date objects with full methods",
                input: "clone.getTime() matches original",
                expected: true,
                testFn: "const d = new Date(1700000000000); const clone = deepClone(d); return clone instanceof Date && clone.getTime() === d.getTime();"
              },
              {
                id: 3,
                name: "Clones RegExp objects with source and flags",
                input: "clone of /test/gi",
                expected: true,
                testFn: "const re = /test/gi; const clone = deepClone(re); return clone instanceof RegExp && clone.source === 'test' && clone.flags === 'gi';"
              }
            ]
          },
          Hard: {
            id: "clone-hard",
            title: "Universal Deep Clone with Circular Reference Detection",
            difficulty: "Hard",
            concept: "Graph Cycle Traversal using WeakMap",
            description: "Implement `deepCloneCircular(obj)` that deep copies arbitrarily nested data structures containing cyclic self-references without causing `RangeError: Maximum call stack size exceeded`.",
            starterCode: `function deepCloneCircular(target, seen = new WeakMap()) {
  if (target === null || typeof target !== 'object') {
    return target;
  }

  if (seen.has(target)) {
    return seen.get(target);
  }

  if (target instanceof Date) return new Date(target.getTime());
  if (target instanceof RegExp) return new RegExp(target.source, target.flags);

  const copy = Array.isArray(target) ? [] : {};
  seen.set(target, copy);

  for (const key of Object.keys(target)) {
    copy[key] = deepCloneCircular(target[key], seen);
  }

  return copy;
}
`,
            interviewTrap: "Any deep clone that lacks a `WeakMap` or visited cache will crash in an infinite loop as soon as an object points back to an ancestor (`node.parent = parent`).",
            testCases: [
              {
                id: 1,
                name: "Successfully clones object with self-referential cycle",
                input: "obj.self = obj; deepCloneCircular(obj)",
                expected: true,
                testFn: "const obj = { name: 'cyclic' }; obj.self = obj; const clone = deepCloneCircular(obj); return clone !== obj && clone.self === clone;"
              },
              {
                id: 2,
                name: "Clones mutual cyclic graph between two nodes",
                input: "a.b = b; b.a = a",
                expected: true,
                testFn: "const a = { id: 1 }; const b = { id: 2 }; a.b = b; b.a = a; const cloneA = deepCloneCircular(a); return cloneA.b.a === cloneA && cloneA.b !== b;"
              },
              {
                id: 3,
                name: "Preserves primitive and array values alongside circular pointers",
                input: "cyclic graph with array items",
                expected: [1, 2, 3],
                testFn: "const root = { list: [1, 2, 3] }; root.ref = root; const clone = deepCloneCircular(root); return clone.list;"
              }
            ]
          }
        }
      }
    ]
  },
  {
    id: "functional-patterns",
    category: "4. Functional Patterns & System Polyfills",
    badge: "Design Patterns",
    description: "Currying, partial application, advanced debounce/throttle with leading/trailing edges, and core array polyfills.",
    topics: [
      {
        id: "curry-compose",
        title: "Currying, Partial Application & Function Composition",
        tag: "Functional JS",
        summary: "Arity detection, currying functions of arbitrary length, pipe vs compose, and point-free programming.",
        mentalModel: "Currying converts a function taking N arguments `f(a, b, c)` into a sequence of N unary functions `f(a)(b)(c)`. When total collected arguments `>= fn.length`, the underlying function executes.",
        traps: "Functions with default parameters or rest parameters having `fn.length === 0`, and curried functions retaining state between unrelated calls.",
        challenges: {
          Basic: {
            id: "curry-basic",
            title: "Curry a 3-Argument Function",
            difficulty: "Basic",
            concept: "Fixed Arity Currying & Closures",
            description: "Implement `curry3(fn)` that curries a function taking exactly 3 arguments, allowing calls like `fn(1)(2)(3)`, `fn(1, 2)(3)`, or `fn(1)(2, 3)`.",
            starterCode: `function curry3(fn) {
  return function curried(...args) {
    if (args.length >= 3) {
      return fn(...args);
    }
    return function(...moreArgs) {
      return curried(...args, ...moreArgs);
    };
  };
}
`,
            interviewTrap: "Not handling grouped arguments like `fn(1, 2)(3)` where multiple parameters are supplied in a single invocation.",
            testCases: [
              {
                id: 1,
                name: "Accepts 3 arguments one-by-one",
                input: "curriedAdd(1)(2)(3)",
                expected: 6,
                testFn: "const add = (a, b, c) => a + b + c; const cAdd = curry3(add); return cAdd(1)(2)(3);"
              },
              {
                id: 2,
                name: "Accepts 2 arguments then 1 argument",
                input: "curriedAdd(1, 2)(3)",
                expected: 6,
                testFn: "const add = (a, b, c) => a + b + c; const cAdd = curry3(add); return cAdd(1, 2)(3);"
              },
              {
                id: 3,
                name: "Accepts all 3 arguments at once",
                input: "curriedAdd(1, 2, 3)",
                expected: 6,
                testFn: "const add = (a, b, c) => a + b + c; const cAdd = curry3(add); return cAdd(1, 2, 3);"
              }
            ]
          },
          Medium: {
            id: "curry-medium",
            title: "Generalized Dynamic Curry with Arity Detection",
            difficulty: "Medium",
            concept: "Dynamic Arity via fn.length & Recursive Partial Application",
            description: "Implement `curry(fn)` that automatically detects `fn.length` and curries any function regardless of argument count until all required arguments have been provided.",
            starterCode: `function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function(...nextArgs) {
      return curried.apply(this, [...args, ...nextArgs]);
    };
  };
}
`,
            interviewTrap: "Remember that `fn.length` only reflects parameters up to the first parameter with a default value. Rest parameters (`...args`) report length 0.",
            testCases: [
              {
                id: 1,
                name: "Curries a 4-argument function across multiple steps",
                input: "curried(1)(2)(3)(4)",
                expected: 24,
                testFn: "const multiply = (a, b, c, d) => a * b * c * d; const cMul = curry(multiply); return cMul(1)(2)(3)(4);"
              },
              {
                id: 2,
                name: "Allows multiple arguments per step",
                input: "curried(1, 2)(3, 4)",
                expected: 24,
                testFn: "const multiply = (a, b, c, d) => a * b * c * d; const cMul = curry(multiply); return cMul(1, 2)(3, 4);"
              },
              {
                id: 3,
                name: "Preserves 'this' context during invocation",
                input: "curried method preserves object context",
                expected: "Hello, Alice",
                testFn: "const greeter = { prefix: 'Hello', greet(title, name) { return \`\${this.prefix}, \${title} \${name}\`; } }; const curriedGreet = curry(greeter.greet); return curriedGreet.call(greeter, 'Ms.')('Alice');"
              }
            ]
          },
          Hard: {
            id: "curry-hard",
            title: "Asynchronous Pipeline (pipeAsync) with Error Recovery",
            difficulty: "Hard",
            concept: "Point-Free Async Function Composition & Pipe Architecture",
            description: "Implement `pipeAsync(...fns)` that chains functions from left to right, where each function can be synchronous or return a Promise. If any step throws or rejects, allow an optional recovery handler passed via `pipeAsync.recoverWith(handler)`.",
            starterCode: `function pipeAsync(...fns) {
  return async function(initialValue) {
    let result = initialValue;
    for (const fn of fns) {
      result = await fn(result);
    }
    return result;
  };
}
`,
            interviewTrap: "Using synchronous `Array.prototype.reduce` without awaiting promises inside the accumulator will return unresolved promise chains.",
            testCases: [
              {
                id: 1,
                name: "Pipes value through synchronous and async transforms in order",
                input: "10 -> add5 -> async double -> subtract2",
                expected: 28,
                testFn: "const add5 = x => x + 5; const doubleAsync = async x => x * 2; const sub2 = x => x - 2; const pipeline = pipeAsync(add5, doubleAsync, sub2); return pipeline(10);"
              },
              {
                id: 2,
                name: "Handles single function pipeline",
                input: "pipeline with single function",
                expected: "HELLO",
                testFn: "const p = pipeAsync(async s => s.toUpperCase()); return p('hello');"
              },
              {
                id: 3,
                name: "Works with 0 functions (identity)",
                input: "pipeAsync() returns input unchanged",
                expected: 42,
                testFn: "const p = pipeAsync(); return p(42);"
              }
            ]
          }
        }
      },
      {
        id: "debounce-throttle",
        title: "Debounce & Throttle with Advanced Controls",
        tag: "System Design",
        summary: "Timer management, leading edge vs trailing edge execution, cancellation, and flush methods.",
        mentalModel: "Debounce groups bursts into a single execution after `wait` ms of silence. Throttle guarantees a maximum execution frequency of at most once every `limit` ms.",
        traps: "Losing the last execution when trailing is disabled, memory leaks from uncancelled timers, and stale closure variables inside delayed callbacks.",
        challenges: {
          Basic: {
            id: "debounce-basic",
            title: "Basic Debounce Function",
            difficulty: "Basic",
            concept: "Delayed Execution & Timer Resetting",
            description: "Implement `debounce(fn, delay)` that delays invoking `fn` until after `delay` milliseconds have elapsed since the last time the debounced function was invoked.",
            starterCode: `function debounce(fn, delay) {
  let timerId = null;

  return function(...args) {
    if (timerId !== null) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      fn.apply(this, args);
      timerId = null;
    }, delay);
  };
}
`,
            interviewTrap: "Forgetting to preserve `this` and arguments when invoking `fn` inside `setTimeout`.",
            testCases: [
              {
                id: 1,
                name: "Executes only once after rapid burst of calls",
                input: "call 3 times within delay",
                expected: 1,
                testFn: "let calls = 0; const debounced = debounce(() => calls++, 20); debounced(); debounced(); debounced(); await new Promise(r => setTimeout(r, 40)); return calls;"
              },
              {
                id: 2,
                name: "Passes the arguments from the most recent call",
                input: "debounced('first'), debounced('last')",
                expected: "last",
                testFn: "let lastArg = ''; const debounced = debounce(arg => { lastArg = arg; }, 15); debounced('first'); debounced('last'); await new Promise(r => setTimeout(r, 30)); return lastArg;"
              },
              {
                id: 3,
                name: "Executes multiple times if spaced farther than delay",
                input: "call, wait, call again",
                expected: 2,
                testFn: "let count = 0; const debounced = debounce(() => count++, 15); debounced(); await new Promise(r => setTimeout(r, 30)); debounced(); await new Promise(r => setTimeout(r, 30)); return count;"
              }
            ]
          },
          Medium: {
            id: "throttle-medium",
            title: "Basic Throttle Function",
            difficulty: "Medium",
            concept: "Rate Limiting & Time Window Enforcement",
            description: "Implement `throttle(fn, limit)` that guarantees `fn` is called at most once every `limit` milliseconds.",
            starterCode: `function throttle(fn, limit) {
  let inThrottle = false;

  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}
`,
            interviewTrap: "Basic throttle without trailing calls drops the final event in a burst (e.g., stopping scroll). For simple rate limiting, leading execution is standard.",
            testCases: [
              {
                id: 1,
                name: "Executes immediately on leading call",
                input: "first call runs synchronously",
                expected: 1,
                testFn: "let count = 0; const throttled = throttle(() => count++, 50); throttled(); return count;"
              },
              {
                id: 2,
                name: "Blocks subsequent calls during throttle period",
                input: "3 rapid calls within throttle window execute once",
                expected: 1,
                testFn: "let count = 0; const throttled = throttle(() => count++, 50); throttled(); throttled(); throttled(); return count;"
              },
              {
                id: 3,
                name: "Allows new invocation after window expires",
                input: "call, wait limit, call again",
                expected: 2,
                testFn: "let count = 0; const throttled = throttle(() => count++, 20); throttled(); await new Promise(r => setTimeout(r, 35)); throttled(); return count;"
              }
            ]
          },
          Hard: {
            id: "debounce-hard",
            title: "Advanced Debounce with Leading, Trailing & Cancel Controls",
            difficulty: "Hard",
            concept: "Production-Grade Debounce (Lodash Pattern)",
            description: "Implement `debounceAdvanced(fn, delay, { leading = false, trailing = true })`. Provide `.cancel()` to abort any pending execution and `.flush()` to immediately execute any pending call.",
            starterCode: `function debounceAdvanced(fn, delay, options = {}) {
  const { leading = false, trailing = true } = options;
  let timerId = null;
  let lastArgs = null;
  let lastThis = null;

  function debounced(...args) {
    lastArgs = args;
    lastThis = this;

    const shouldCallLeading = leading && !timerId;

    if (timerId !== null) {
      clearTimeout(timerId);
    }

    if (shouldCallLeading) {
      fn.apply(lastThis, lastArgs);
      lastArgs = null;
      lastThis = null;
    }

    timerId = setTimeout(() => {
      if (trailing && lastArgs) {
        fn.apply(lastThis, lastArgs);
      }
      timerId = null;
      lastArgs = null;
      lastThis = null;
    }, delay);
  }

  debounced.cancel = function() {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
    lastArgs = null;
    lastThis = null;
  };

  debounced.flush = function() {
    if (timerId !== null && lastArgs) {
      fn.apply(lastThis, lastArgs);
      debounced.cancel();
    }
  };

  return debounced;
}
`,
            interviewTrap: "If `leading: true` and `trailing: false`, the function fires immediately, but must NOT fire at the end of the delay window.",
            testCases: [
              {
                id: 1,
                name: "Supports leading execution immediately",
                input: "leading: true fires immediately on first call",
                expected: 1,
                testFn: "let count = 0; const debounced = debounceAdvanced(() => count++, 50, { leading: true, trailing: false }); debounced(); return count;"
              },
              {
                id: 2,
                name: "cancel() aborts pending delayed execution",
                input: "debounced() -> cancel() -> wait",
                expected: 0,
                testFn: "let count = 0; const debounced = debounceAdvanced(() => count++, 30); debounced(); debounced.cancel(); await new Promise(r => setTimeout(r, 45)); return count;"
              },
              {
                id: 3,
                name: "flush() triggers pending execution synchronously",
                input: "debounced() -> flush() immediately executes",
                expected: 1,
                testFn: "let count = 0; const debounced = debounceAdvanced(() => count++, 50); debounced(); debounced.flush(); return count;"
              }
            ]
          }
        }
      },
      {
        id: "array-polyfills",
        title: "Core Array & Utility Polyfills from Scratch",
        tag: "Polyfills",
        summary: "Sparse arrays, Array.prototype.reduce edge cases, flat/flatMap depth recursion, and Symbol.iterator protocol.",
        mentalModel: "Native array methods must respect sparse arrays (`in` operator check), handle absent `initialValue` in `reduce` (skipping holes to find the first real element), and preserve the caller's prototype chain.",
        traps: "`Array(3).map(fn)` runs 0 times because indices 0..2 are holes (unassigned slots). Forgetting hole checks breaks ECMAScript compliance.",
        challenges: {
          Basic: {
            id: "array-basic",
            title: "Implement Array.prototype.myMap and myFilter",
            difficulty: "Basic",
            concept: "Array Iteration & Sparse Index Handling",
            description: "Implement `myMap(callback, thisArg)` and `myFilter(callback, thisArg)` on `Array.prototype`. They must correctly skip empty slots (sparse arrays) and pass `(element, index, array)` to the callback.",
            starterCode: `Array.prototype.myMap = function(callback, thisArg) {
  if (typeof callback !== 'function') throw new TypeError('Callback must be a function');
  const result = new Array(this.length);
  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      result[i] = callback.call(thisArg, this[i], i, this);
    }
  }
  return result;
};

Array.prototype.myFilter = function(callback, thisArg) {
  if (typeof callback !== 'function') throw new TypeError('Callback must be a function');
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this && callback.call(thisArg, this[i], i, this)) {
      result.push(this[i]);
    }
  }
  return result;
};
`,
            interviewTrap: "Using simple `for` loop without `if (i in this)` visits empty array holes and converts them to `undefined`, violating the spec.",
            testCases: [
              {
                id: 1,
                name: "myMap doubles elements and respects index",
                input: "[1, 2, 3].myMap((x, i) => x + i)",
                expected: [1, 3, 5],
                testFn: "return [1, 2, 3].myMap((x, i) => x + i);"
              },
              {
                id: 2,
                name: "myFilter filters odd numbers",
                input: "[1, 2, 3, 4, 5].myFilter(x => x % 2 === 0)",
                expected: [2, 4],
                testFn: "return [1, 2, 3, 4, 5].myFilter(x => x % 2 === 0);"
              },
              {
                id: 3,
                name: "myMap preserves sparse array holes",
                input: "[1, , 3].myMap(x => x * 2)",
                expected: true,
                testFn: "const res = [1, , 3].myMap(x => x * 2); return !(1 in res) && res[0] === 2 && res[2] === 6;"
              }
            ]
          },
          Medium: {
            id: "array-medium",
            title: "Implement Array.prototype.myReduce (Compliant Spec)",
            difficulty: "Medium",
            concept: "Accumulator State & Initial Value Resolution",
            description: "Implement `myReduce(callback, initialValue)` on `Array.prototype`. If `initialValue` is not provided, the first non-empty element is used as the accumulator and iteration begins at the next non-empty index. Throws `TypeError` if invoked on an empty array without an initialValue.",
            starterCode: `Array.prototype.myReduce = function(callback, initialValue) {
  if (typeof callback !== 'function') throw new TypeError('Callback must be a function');
  
  let index = 0;
  let accumulator;

  if (arguments.length > 1) {
    accumulator = initialValue;
  } else {
    // Find first non-empty slot
    while (index < this.length && !(index in this)) {
      index++;
    }
    if (index >= this.length) {
      throw new TypeError('Reduce of empty array with no initial value');
    }
    accumulator = this[index++];
  }

  for (; index < this.length; index++) {
    if (index in this) {
      accumulator = callback(accumulator, this[index], index, this);
    }
  }

  return accumulator;
};
`,
            interviewTrap: "Checking `if (!initialValue)` breaks when `initialValue` is `0`, `false`, or `''`! You MUST check `arguments.length > 1`.",
            testCases: [
              {
                id: 1,
                name: "Sums array without initialValue",
                input: "[1, 2, 3, 4].myReduce((acc, x) => acc + x)",
                expected: 10,
                testFn: "return [1, 2, 3, 4].myReduce((acc, x) => acc + x);"
              },
              {
                id: 2,
                name: "Handles 0 as explicit initialValue correctly",
                input: "[1, 2, 3].myReduce((acc, x) => acc + x, 0)",
                expected: 6,
                testFn: "return [1, 2, 3].myReduce((acc, x) => acc + x, 0);"
              },
              {
                id: 3,
                name: "Throws TypeError on empty array with no initialValue",
                input: "[].myReduce(fn) throws TypeError",
                expected: true,
                testFn: "try { [].myReduce((a, b) => a + b); return false; } catch (e) { return e instanceof TypeError; }"
              }
            ]
          },
          Hard: {
            id: "array-hard",
            title: "Implement Array.prototype.myFlat with Depth & Circular Safety",
            difficulty: "Hard",
            concept: "Recursive Flattening & Sparse Array Hole Stripping",
            description: "Implement `myFlat(depth = 1)` on `Array.prototype` that recursively flattens subarrays up to `depth` levels and strips array holes, matching `Array.prototype.flat`.",
            starterCode: `Array.prototype.myFlat = function(depth = 1) {
  const result = [];
  
  function flatten(arr, currentDepth) {
    for (let i = 0; i < arr.length; i++) {
      if (i in arr) {
        const item = arr[i];
        if (Array.isArray(item) && currentDepth < depth) {
          flatten(item, currentDepth + 1);
        } else {
          result.push(item);
        }
      }
    }
  }

  flatten(this, 0);
  return result;
};
`,
            interviewTrap: "`flat()` strips holes entirely! E.g. `[1, , [2]].flat()` returns `[1, 2]` without undefined.",
            testCases: [
              {
                id: 1,
                name: "Flattens 1 level by default",
                input: "[1, [2, [3, [4]]]].myFlat()",
                expected: [1, 2, [3, [4]]],
                testFn: "return [1, [2, [3, [4]]]].myFlat();"
              },
              {
                id: 2,
                name: "Flattens completely with Infinity depth",
                input: "[1, [2, [3, [4]]]].myFlat(Infinity)",
                expected: [1, 2, 3, 4],
                testFn: "return [1, [2, [3, [4]]]].myFlat(Infinity);"
              },
              {
                id: 3,
                name: "Removes sparse holes while flattening",
                input: "[1, , [2, , 3]].myFlat()",
                expected: [1, 2, 3],
                testFn: "return [1, , [2, , 3]].myFlat();"
              }
            ]
          }
        }
      }
    ]
  },
  {
    id: "browser-dom-internals",
    category: "5. Browser Engine & DOM Internals",
    badge: "Browser Architecture",
    description: "DOM Event Flow, capturing/bubbling, event delegation, and browser rendering pipeline (reflow vs repaint).",
    topics: [
      {
        id: "event-propagation",
        title: "DOM Event Flow: Capturing, Bubbling & Delegation",
        tag: "DOM Engine",
        summary: "Capturing phase, Target phase, Bubbling phase, event.stopPropagation() vs stopImmediatePropagation().",
        mentalModel: "Events travel down from `window` through the DOM tree (Capturing Phase) until they reach the target (Target Phase), then bubble back up to `window` (Bubbling Phase). Event delegation attaches a single listener to a common ancestor, querying `event.target.closest()`.",
        traps: "`stopPropagation()` does NOT prevent other listeners on the SAME element from executing; `stopImmediatePropagation()` is required.",
        challenges: {
          Basic: {
            id: "event-basic",
            title: "Event Delegation Matcher",
            difficulty: "Basic",
            concept: "Event Delegation & Target Traversal",
            description: "Implement `delegate(container, selector, eventType, handler)` that listens on `container` and triggers `handler(e, matchedElement)` only when the event originates from or bubbles through an element matching `selector`.",
            starterCode: `function delegate(container, selector, handler) {
  return function(event) {
    const target = event.target;
    const matched = target.closest(selector);
    if (matched && container.contains(matched)) {
      handler.call(matched, event, matched);
    }
  };
}
`,
            interviewTrap: "Directly checking `event.target.matches(selector)` fails if the user clicks a nested child (like an `<i>` or `<span>` inside a `<button>`). Using `.closest()` is required.",
            testCases: [
              {
                id: 1,
                name: "Triggers handler when child matches selector",
                input: "click on matching element",
                expected: "btn-1",
                testFn: "const parent = document.createElement('div'); const btn = document.createElement('button'); btn.id = 'btn-1'; btn.className = 'action-btn'; parent.appendChild(btn); let clickedId = ''; const listener = delegate(parent, '.action-btn', (e, el) => { clickedId = el.id; }); listener({ target: btn }); return clickedId;"
              },
              {
                id: 2,
                name: "Triggers handler when clicking deeply nested child inside matching element",
                input: "click on <span> inside <button>",
                expected: "btn-2",
                testFn: "const parent = document.createElement('div'); const btn = document.createElement('button'); btn.id = 'btn-2'; btn.className = 'action-btn'; const span = document.createElement('span'); btn.appendChild(span); parent.appendChild(btn); let clickedId = ''; const listener = delegate(parent, '.action-btn', (e, el) => { clickedId = el.id; }); listener({ target: span }); return clickedId;"
              },
              {
                id: 3,
                name: "Ignores clicks outside selector",
                input: "click on non-matching sibling",
                expected: false,
                testFn: "const parent = document.createElement('div'); const div = document.createElement('div'); parent.appendChild(div); let called = false; const listener = delegate(parent, '.action-btn', () => { called = true; }); listener({ target: div }); return called;"
              }
            ]
          },
          Medium: {
            id: "event-medium",
            title: "Custom EventEmitter with 'once' and Unsubscribe",
            difficulty: "Medium",
            concept: "Observer Pattern & Clean Subscription Teardown",
            description: "Implement `EventEmitter` with methods: `on(event, listener)`, `emit(event, ...args)`, `off(event, listener)`, and `once(event, listener)`. `on()` and `once()` must return an unsubscribe function `() => void`.",
            starterCode: `class EventEmitter {
  constructor() {
    this.events = new Map();
  }

  on(event, listener) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(listener);

    return () => this.off(event, listener);
  }

  emit(event, ...args) {
    if (!this.events.has(event)) return false;
    // Iterate over a copy to handle listeners modifying the set during emit
    const listeners = Array.from(this.events.get(event));
    for (const listener of listeners) {
      listener(...args);
    }
    return listeners.length > 0;
  }

  off(event, listener) {
    if (!this.events.has(event)) return;
    this.events.get(event).delete(listener);
    if (this.events.get(event).size === 0) {
      this.events.delete(event);
    }
  }

  once(event, listener) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      listener(...args);
    };
    return this.on(event, wrapper);
  }
}
`,
            interviewTrap: "Modifying the listeners array/set while iterating over it during `emit` causes subsequent listeners to be skipped. Always iterate over a snapshot copy.",
            testCases: [
              {
                id: 1,
                name: "Notifies listeners upon emit with parameters",
                input: "emitter.emit('data', 'val')",
                expected: ['val'],
                testFn: "const ee = new EventEmitter(); const log = []; ee.on('data', x => log.push(x)); ee.emit('data', 'val'); return log;"
              },
              {
                id: 2,
                name: "once() fires exactly one time then unregisters",
                input: "emit twice on once listener",
                expected: 1,
                testFn: "const ee = new EventEmitter(); let count = 0; ee.once('ping', () => count++); ee.emit('ping'); ee.emit('ping'); return count;"
              },
              {
                id: 3,
                name: "Returned unsubscribe function removes listener",
                input: "unsub() removes listener",
                expected: 1,
                testFn: "const ee = new EventEmitter(); let count = 0; const unsub = ee.on('tick', () => count++); ee.emit('tick'); unsub(); ee.emit('tick'); return count;"
              }
            ]
          },
          Hard: {
            id: "event-hard",
            title: "Simulated DOM Event Pipeline with Propagation Control",
            difficulty: "Hard",
            concept: "Event Phases (Capture -> Target -> Bubble) and Immediate Stop",
            description: "Implement `dispatchTreeEvent(treeRoot, targetNode, eventName)` that simulates full DOM event flow: executes capture listeners down from root, target listeners on target, then bubble listeners back up to root. Supports `event.stopPropagation()` and `event.stopImmediatePropagation()`.",
            starterCode: `function dispatchTreeEvent(root, target, eventName) {
  // Construct path from root to target
  const path = [];
  let curr = target;
  while (curr) {
    path.unshift(curr);
    if (curr === root) break;
    curr = curr.parentNode;
  }

  const event = {
    type: eventName,
    target: target,
    currentTarget: null,
    isPropagationStopped: false,
    isImmediatePropagationStopped: false,
    stopPropagation() { this.isPropagationStopped = true; },
    stopImmediatePropagation() {
      this.isPropagationStopped = true;
      this.isImmediatePropagationStopped = true;
    }
  };

  const log = [];

  // 1. Capture Phase (root down to target parent)
  for (let i = 0; i < path.length - 1; i++) {
    if (event.isPropagationStopped) break;
    const node = path[i];
    event.currentTarget = node;
    const listeners = node._listeners?.[eventName]?.capture || [];
    for (const fn of listeners) {
      if (event.isImmediatePropagationStopped) break;
      fn(event);
      log.push(\`capture:\${node.id}\`);
    }
  }

  // 2. Target Phase
  if (!event.isPropagationStopped) {
    event.currentTarget = target;
    const targetListeners = target._listeners?.[eventName]?.bubble || [];
    for (const fn of targetListeners) {
      if (event.isImmediatePropagationStopped) break;
      fn(event);
      log.push(\`target:\${target.id}\`);
    }
  }

  // 3. Bubble Phase (target parent up to root)
  for (let i = path.length - 2; i >= 0; i--) {
    if (event.isPropagationStopped) break;
    const node = path[i];
    event.currentTarget = node;
    const listeners = node._listeners?.[eventName]?.bubble || [];
    for (const fn of listeners) {
      if (event.isImmediatePropagationStopped) break;
      fn(event);
      log.push(\`bubble:\${node.id}\`);
    }
  }

  return log;
}
`,
            interviewTrap: "Many engineers do not know the exact order: capture flows strictly root -> target parent, while bubbling flows target parent -> root.",
            testCases: [
              {
                id: 1,
                name: "Executes capture then bubble in correct sequence",
                input: "root -> child event propagation",
                expected: ['capture:root', 'target:child', 'bubble:root'],
                testFn: "const root = { id: 'root', _listeners: { click: { capture: [() => {}], bubble: [() => {}] } } }; const child = { id: 'child', parentNode: root, _listeners: { click: { bubble: [() => {}] } } }; return dispatchTreeEvent(root, child, 'click');"
              },
              {
                id: 2,
                name: "stopPropagation prevents bubbling to parent",
                input: "child stops propagation during target phase",
                expected: ['capture:root', 'target:child'],
                testFn: "const root = { id: 'root', _listeners: { click: { capture: [() => {}], bubble: [() => {}] } } }; const child = { id: 'child', parentNode: root, _listeners: { click: { bubble: [e => e.stopPropagation()] } } }; return dispatchTreeEvent(root, child, 'click');"
              },
              {
                id: 3,
                name: "Capture phase stops immediately when stopped at root",
                input: "root stops propagation during capture phase",
                expected: ['capture:root'],
                testFn: "const root = { id: 'root', _listeners: { click: { capture: [e => e.stopPropagation()] } } }; const child = { id: 'child', parentNode: root, _listeners: { click: { bubble: [() => {}] } } }; return dispatchTreeEvent(root, child, 'click');"
              }
            ]
          }
        }
      },
      {
        id: "rendering-pipeline",
        title: "Critical Rendering Path: Reflow vs Repaint",
        tag: "Browser Engine",
        summary: "Layout (Reflow) triggers, Paint (Repaint) triggers, Composite layers, and layout thrashing.",
        mentalModel: "Reflow recalculates geometry and layout tree (expensive). Repaint redraws pixels without changing geometry. Composite occurs on the GPU (transforms and opacity). Reading layout properties (`offsetWidth`, `scrollTop`) right after writing them forces synchronous layout thrashing.",
        traps: "Interleaving DOM reads and writes in a loop (`for(...) { el.style.width = el.offsetWidth + 10 }`), locking the browser main thread.",
        challenges: {
          Basic: {
            id: "render-basic",
            title: "Layout Thrashing Batcher",
            difficulty: "Basic",
            concept: "Separating DOM Reads and Writes",
            description: "Implement `batchDOMOperations(reads, writes)` that separates an array of DOM measurement tasks (reads) and mutation tasks (writes), executing ALL reads first before executing any writes, preventing forced synchronous layout reflow.",
            starterCode: `function batchDOMOperations(reads, writes) {
  const readResults = reads.map(readFn => readFn());
  writes.forEach(writeFn => writeFn(readResults));
  return readResults;
}
`,
            interviewTrap: "Alternating read-write-read-write inside a loop forces the browser to recalculate layout immediately on every iteration.",
            testCases: [
              {
                id: 1,
                name: "Executes all reads before writes",
                input: "verify read order precedes write order",
                expected: ['read1', 'read2', 'write1'],
                testFn: "const log = []; const reads = [() => log.push('read1'), () => log.push('read2')]; const writes = [() => log.push('write1')]; batchDOMOperations(reads, writes); return log;"
              },
              {
                id: 2,
                name: "Supplies read results to write functions",
                input: "writes receive values calculated by reads",
                expected: 300,
                testFn: "let written = 0; const reads = [() => 100, () => 200]; const writes = [res => { written = res[0] + res[1]; }]; batchDOMOperations(reads, writes); return written;"
              },
              {
                id: 3,
                name: "Handles empty reads or writes safely",
                input: "batch with empty writes",
                expected: ['done'],
                testFn: "return batchDOMOperations([() => 'done'], []);"
              }
            ]
          },
          Medium: {
            id: "render-medium",
            title: "Lightweight Virtual DOM Element Creator & Renderer",
            difficulty: "Medium",
            concept: "Virtual DOM Tree Construction and Real DOM Mounting",
            description: "Implement `h(tag, props, ...children)` and `mount(vnode, container)` that builds a minimal virtual DOM tree and mounts it as real DOM nodes with attributes and text.",
            starterCode: `function h(tag, props = {}, ...children) {
  return {
    tag,
    props: props || {},
    children: children.flat()
  };
}

function mount(vnode, container) {
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    const textNode = document.createTextNode(String(vnode));
    container.appendChild(textNode);
    return textNode;
  }

  const el = document.createElement(vnode.tag);

  for (const [key, value] of Object.entries(vnode.props)) {
    if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      el.setAttribute(key, value);
    }
  }

  for (const child of vnode.children) {
    mount(child, el);
  }

  container.appendChild(el);
  return el;
}
`,
            interviewTrap: "Forgetting that children can be plain strings/numbers or nested arrays (`children.flat()`).",
            testCases: [
              {
                id: 1,
                name: "Creates and mounts DOM node with attributes",
                input: "h('div', { id: 'box' }, 'Hello')",
                expected: { tag: 'DIV', id: 'box', text: 'Hello' },
                testFn: "const root = document.createElement('div'); const v = h('div', { id: 'box' }, 'Hello'); const el = mount(v, root); return { tag: el.tagName, id: el.id, text: el.textContent };"
              },
              {
                id: 2,
                name: "Mounts nested children hierarchically",
                input: "h('ul', {}, h('li', {}, 'A'), h('li', {}, 'B'))",
                expected: 2,
                testFn: "const root = document.createElement('div'); const v = h('ul', {}, h('li', {}, 'A'), h('li', {}, 'B')); const el = mount(v, root); return el.children.length;"
              },
              {
                id: 3,
                name: "Attaches event handlers properly",
                input: "click listener attached via props",
                expected: 1,
                testFn: "let count = 0; const root = document.createElement('div'); const v = h('button', { onClick: () => count++ }, 'Click'); const btn = mount(v, root); btn.click(); return count;"
              }
            ]
          },
          Hard: {
            id: "render-hard",
            title: "Minimal VDOM Diff & Patch Engine",
            difficulty: "Hard",
            concept: "Virtual DOM Reconciliation & Minimal Mutation Operations",
            description: "Implement `diff(oldVNode, newVNode)` that returns a list of patch instructions (`{ type: 'REPLACE'|'TEXT'|'PROPS', ... }`) to update `oldVNode` into `newVNode` with minimal operations.",
            starterCode: `function diff(oldVNode, newVNode) {
  if (!oldVNode) return [{ type: 'CREATE', newVNode }];
  if (!newVNode) return [{ type: 'REMOVE' }];
  
  if (typeof oldVNode !== typeof newVNode || (typeof oldVNode === 'string' && oldVNode !== newVNode)) {
    return [{ type: 'REPLACE', newVNode }];
  }

  if (typeof oldVNode === 'string') {
    return [];
  }

  if (oldVNode.tag !== newVNode.tag) {
    return [{ type: 'REPLACE', newVNode }];
  }

  const patches = [];

  // Props diff
  const propPatches = {};
  for (const key of Object.keys(newVNode.props || {})) {
    if (newVNode.props[key] !== oldVNode.props[key]) {
      propPatches[key] = newVNode.props[key];
    }
  }
  for (const key of Object.keys(oldVNode.props || {})) {
    if (!(key in (newVNode.props || {}))) {
      propPatches[key] = undefined;
    }
  }

  if (Object.keys(propPatches).length > 0) {
    patches.push({ type: 'PROPS', props: propPatches });
  }

  return patches;
}
`,
            interviewTrap: "Assuming that tag changes can be patched in place. If tags differ (`div` -> `span`), the entire node must be replaced.",
            testCases: [
              {
                id: 1,
                name: "Generates REPLACE patch when tag changes",
                input: "div -> span",
                expected: 'REPLACE',
                testFn: "const p = diff({ tag: 'div', props: {} }, { tag: 'span', props: {} }); return p[0].type;"
              },
              {
                id: 2,
                name: "Generates PROPS patch when attributes change",
                input: "props change className",
                expected: { className: 'active' },
                testFn: "const p = diff({ tag: 'div', props: { className: 'old' } }, { tag: 'div', props: { className: 'active' } }); return p[0].props;"
              },
              {
                id: 3,
                name: "Returns empty patches when nodes are identical",
                input: "identical nodes",
                expected: 0,
                testFn: "const p = diff({ tag: 'div', props: { id: 'x' } }, { tag: 'div', props: { id: 'x' } }); return p.length;"
              }
            ]
          }
        }
      }
    ]
  },
  {
    id: "react-internals-js",
    category: "6. React Internals & Tricky Patterns",
    badge: "React Bridge",
    description: "Fiber reconciliation, hook linked list architecture, stale closures in useEffect, and re-render cascades.",
    topics: [
      {
        id: "fiber-reconciliation",
        title: "Fiber Architecture & Reconciliation Mechanics",
        tag: "React Internals",
        summary: "Fiber tree linked list structure, Render phase vs Commit phase, and double buffering.",
        mentalModel: "React represents UI as a singly linked list of Fiber nodes (`child`, `sibling`, `return`). Render phase is interruptible and can be paused; commit phase is strictly synchronous.",
        traps: "Writing recursive tree traversals instead of iterative pointer walks, and thinking reconciliation immediately touches the DOM.",
        challenges: {
          Basic: {
            id: "fiber-basic",
            title: "Fiber Node Factory",
            difficulty: "Basic",
            concept: "Fiber Node Structure & Pointers",
            description: "Implement `createFiberNode(tag, type, props)` that initializes a Fiber node with `child: null`, `sibling: null`, `return: null`, `memoizedProps`, and `alternate: null`.",
            starterCode: `function createFiberNode(tag, type, props = {}) {
  return {
    tag,
    type,
    pendingProps: props,
    memoizedProps: null,
    memoizedState: null,
    child: null,
    sibling: null,
    return: null,
    alternate: null
  };
}
`,
            interviewTrap: "Confusing `pendingProps` (props being passed to the new render) with `memoizedProps` (props from the last committed render).",
            testCases: [
              {
                id: 1,
                name: "Initializes fiber node with null pointers",
                input: "createFiberNode('HostComponent', 'div')",
                expected: { child: null, sibling: null, return: null },
                testFn: "const f = createFiberNode('HostComponent', 'div'); return { child: f.child, sibling: f.sibling, return: f.return };"
              },
              {
                id: 2,
                name: "Assigns type and pending props",
                input: "createFiberNode with props",
                expected: 'hello',
                testFn: "const f = createFiberNode('HostComponent', 'span', { title: 'hello' }); return f.pendingProps.title;"
              },
              {
                id: 3,
                name: "Sets alternate to null by default (double buffering)",
                input: "f.alternate === null",
                expected: true,
                testFn: "const f = createFiberNode('FunctionComponent', () => {}); return f.alternate === null;"
              }
            ]
          },
          Medium: {
            id: "fiber-medium",
            title: "Simulate Fiber Child & Sibling Pointer Linker",
            difficulty: "Medium",
            concept: "Fiber Tree Linking & Return Pointers",
            description: "Implement `linkFiberChildren(parentFiber, childElements)` that takes a parent Fiber node and an array of child element descriptors, converts them into Fiber nodes, links the parent's `child` to the first child, links each child to its next `sibling`, and sets every child's `return` pointer back to `parentFiber`.",
            starterCode: `function linkFiberChildren(parentFiber, childElements) {
  if (!childElements || childElements.length === 0) {
    parentFiber.child = null;
    return;
  }

  let prevChild = null;

  for (let i = 0; i < childElements.length; i++) {
    const el = childElements[i];
    const newFiber = {
      type: el.type,
      child: null,
      sibling: null,
      return: parentFiber
    };

    if (i === 0) {
      parentFiber.child = newFiber;
    } else {
      prevChild.sibling = newFiber;
    }
    prevChild = newFiber;
  }
}
`,
            interviewTrap: "Forgetting to set the `return` pointer on each sibling. The return pointer allows React to walk back up the tree without a call stack.",
            testCases: [
              {
                id: 1,
                name: "Links first child to parent.child",
                input: "parent.child points to first child",
                expected: 'h1',
                testFn: "const parent = { type: 'div', child: null }; linkFiberChildren(parent, [{ type: 'h1' }, { type: 'p' }]); return parent.child.type;"
              },
              {
                id: 2,
                name: "Links siblings in order",
                input: "first.sibling points to second child",
                expected: 'p',
                testFn: "const parent = { type: 'div', child: null }; linkFiberChildren(parent, [{ type: 'h1' }, { type: 'p' }]); return parent.child.sibling.type;"
              },
              {
                id: 3,
                name: "Sets return pointers on all children back to parent",
                input: "both children have return === parent",
                expected: true,
                testFn: "const parent = { type: 'div', child: null }; linkFiberChildren(parent, [{ type: 'h1' }, { type: 'p' }]); return parent.child.return === parent && parent.child.sibling.return === parent;"
              }
            ]
          },
          Hard: {
            id: "fiber-hard",
            title: "Iterative Fiber Depth-First Walker (Without Recursion)",
            difficulty: "Hard",
            concept: "Depth-First Search using child, sibling, return Pointers",
            description: "Implement `traverseFiberTree(rootFiber, visitor)` that visits every Fiber node in depth-first pre-order using ONLY `child`, `sibling`, and `return` pointers. Must not use recursion or array stack frames.",
            starterCode: `function traverseFiberTree(root, visitor) {
  let current = root;

  while (current) {
    visitor(current);

    // 1. Walk down to child if exists
    if (current.child) {
      current = current.child;
      continue;
    }

    // 2. If at root with no child, finish
    if (current === root) break;

    // 3. Walk to sibling or up return pointers until sibling found
    while (!current.sibling) {
      if (!current.return || current.return === root) {
        return;
      }
      current = current.return;
    }

    current = current.sibling;
  }
}
`,
            interviewTrap: "This is the exact workLoop algorithm of React's Concurrent Scheduler. If you use recursion, deep component trees exhaust call stack memory.",
            testCases: [
              {
                id: 1,
                name: "Visits parent before children (pre-order)",
                input: "root -> childA -> childB",
                expected: ['root', 'A', 'B'],
                testFn: "const root = { id: 'root', child: null }; const a = { id: 'A', return: root, child: null, sibling: null }; const b = { id: 'B', return: root, child: null, sibling: null }; root.child = a; a.sibling = b; const order = []; traverseFiberTree(root, f => order.push(f.id)); return order;"
              },
              {
                id: 2,
                name: "Navigates deeply nested subtrees",
                input: "root -> A -> A1 -> B",
                expected: ['root', 'A', 'A1', 'B'],
                testFn: "const root = { id: 'root', child: null }; const b = { id: 'B', return: root, child: null, sibling: null }; const a1 = { id: 'A1', child: null, sibling: null }; const a = { id: 'A', return: root, child: a1, sibling: b }; a1.return = a; root.child = a; const order = []; traverseFiberTree(root, f => order.push(f.id)); return order;"
              },
              {
                id: 3,
                name: "Terminates cleanly on single root node",
                input: "root with no children",
                expected: ['solo'],
                testFn: "const root = { id: 'solo', child: null, sibling: null, return: null }; const order = []; traverseFiberTree(root, f => order.push(f.id)); return order;"
              }
            ]
          }
        }
      },
      {
        id: "stale-closures-hooks",
        title: "Stale Closures & Dependency Array Pitfalls",
        tag: "React Hooks",
        summary: "Capturing old state snapshots inside event listeners, setTimeout, and setInterval.",
        mentalModel: "Every React render has its own props, state, and event handlers. A closure formed inside an effect or callback captures variables from that specific render snapshot forever unless re-created or accessed via functional updates/useRef.",
        traps: "`useEffect(() => { setInterval(() => setCount(count + 1), 1000) }, [])` getting stuck at 1 forever.",
        challenges: {
          Basic: {
            id: "stale-basic",
            title: "Simulate usePrevious Hook",
            difficulty: "Basic",
            concept: "Capturing Previous State via Mutable Ref",
            description: "Implement `createPreviousTracker()` that mimics React's `usePrevious(value)` hook: on every update with a new value, it returns the value from the PREVIOUS invocation (or undefined on first call).",
            starterCode: `function createPreviousTracker() {
  let prevValue = undefined;

  return function update(currentValue) {
    const toReturn = prevValue;
    prevValue = currentValue;
    return toReturn;
  };
}
`,
            interviewTrap: "Returning `currentValue` before updating `prevValue`.",
            testCases: [
              {
                id: 1,
                name: "Returns undefined on first call",
                input: "update(100)",
                expected: undefined,
                testFn: "const tracker = createPreviousTracker(); return tracker(100);"
              },
              {
                id: 2,
                name: "Returns previous value on second call",
                input: "update(10) -> update(20)",
                expected: 10,
                testFn: "const tracker = createPreviousTracker(); tracker(10); return tracker(20);"
              },
              {
                id: 3,
                name: "Continuously steps previous value",
                input: "1 -> 2 -> 3 returns 2",
                expected: 2,
                testFn: "const tracker = createPreviousTracker(); tracker(1); tracker(2); return tracker(3);"
              }
            ]
          },
          Medium: {
            id: "stale-medium",
            title: "Fix Stale Closure in Interval Callback",
            difficulty: "Medium",
            concept: "Functional State Updates vs Snapshot Closure",
            description: "In React, `setCount(count + 1)` inside a `setInterval` with an empty dependency array always sees `count = 0`. Implement `createSafeCounter(initialValue)` that uses functional updater semantics `setCount(prev => prev + 1)` so that repeated ticks always compute against the freshest state.",
            starterCode: `function createSafeCounter(initialValue = 0) {
  let state = initialValue;

  function setState(updater) {
    if (typeof updater === 'function') {
      state = updater(state);
    } else {
      state = updater;
    }
  }

  function tick() {
    setState(prev => prev + 1);
  }

  return {
    getState: () => state,
    tick
  };
}
`,
            interviewTrap: "Writing `state = state + 1` or capturing `state` at closure creation time. Passing an updater function `prev => prev + 1` resolves the current value at invocation time.",
            testCases: [
              {
                id: 1,
                name: "Increments accurately across multiple ticks",
                input: "3 ticks increment state to 3",
                expected: 3,
                testFn: "const c = createSafeCounter(0); c.tick(); c.tick(); c.tick(); return c.getState();"
              },
              {
                id: 2,
                name: "Works with custom starting value",
                input: "start at 10, tick 2 times",
                expected: 12,
                testFn: "const c = createSafeCounter(10); c.tick(); c.tick(); return c.getState();"
              },
              {
                id: 3,
                name: "Functional update receives actual state, not stale snapshot",
                input: "state updates reliably without external dependencies",
                expected: 100,
                testFn: "const c = createSafeCounter(0); for(let i=0; i<100; i++) c.tick(); return c.getState();"
              }
            ]
          },
          Hard: {
            id: "stale-hard",
            title: "Simulate React Hook State Machine & Dependency Comparator",
            difficulty: "Hard",
            concept: "Hook MemoizedState Linked List & Object.is Dependency Diffing",
            description: "Implement a simulated hook runner `createHookEngine()` that supports `useState(initial)` and `useEffect(callback, deps)`. `useEffect` should only trigger its callback on the initial render or when any dependency in `deps` has changed according to `Object.is`.",
            starterCode: `function createHookEngine() {
  const hooks = [];
  let hookIndex = 0;

  function useState(initialState) {
    const currentIndex = hookIndex++;
    if (hooks[currentIndex] === undefined) {
      hooks[currentIndex] = {
        state: typeof initialState === 'function' ? initialState() : initialState,
        type: 'state'
      };
    }

    const setState = (action) => {
      const hook = hooks[currentIndex];
      hook.state = typeof action === 'function' ? action(hook.state) : action;
    };

    return [hooks[currentIndex].state, setState];
  }

  function useEffect(callback, deps) {
    const currentIndex = hookIndex++;
    const prevHook = hooks[currentIndex];
    
    let hasChanged = true;
    if (prevHook && prevHook.deps && deps) {
      hasChanged = deps.length !== prevHook.deps.length || deps.some((dep, i) => !Object.is(dep, prevHook.deps[i]));
    }

    if (hasChanged) {
      callback();
    }

    hooks[currentIndex] = {
      type: 'effect',
      deps
    };
  }

  function reset() {
    hookIndex = 0;
  }

  return { useState, useEffect, reset };
}
`,
            interviewTrap: "Using `===` instead of `Object.is` fails on `NaN` (`NaN === NaN` is false, which would falsely re-trigger effects on every render).",
            testCases: [
              {
                id: 1,
                name: "Executes effect on initial mount",
                input: "effect runs on first render",
                expected: 1,
                testFn: "const engine = createHookEngine(); let effectRuns = 0; engine.useEffect(() => effectRuns++, []); return effectRuns;"
              },
              {
                id: 2,
                name: "Skips effect when dependency array does not change",
                input: "effect does not re-run when deps are identical",
                expected: 1,
                testFn: "const engine = createHookEngine(); let runs = 0; const render = () => { engine.reset(); engine.useEffect(() => runs++, [1, 'abc']); }; render(); render(); render(); return runs;"
              },
              {
                id: 3,
                name: "Re-runs effect when dependency value changes",
                input: "effect triggers when dep changes from 1 to 2",
                expected: 2,
                testFn: "const engine = createHookEngine(); let runs = 0; const render = (val) => { engine.reset(); engine.useEffect(() => runs++, [val]); }; render(1); render(1); render(2); return runs;"
              }
            ]
          }
        }
      },
      {
        id: "rerender-optimization",
        title: "Re-render Cascades & Memoization Strategies",
        tag: "Performance",
        summary: "Shallow equality, React.memo, useMemo/useCallback traps, and fine-grained state isolation.",
        mentalModel: "By default, when a parent component renders, all its child components re-render recursively regardless of whether their props changed. `React.memo` bails out only if all props are shallowly equal.",
        traps: "Passing inline object literals `<Child style={{ color: 'red' }} />` or inline arrow functions breaks `React.memo` on every single render.",
        challenges: {
          Basic: {
            id: "rerender-basic",
            title: "Shallow Equality Comparator (shallowEqual)",
            difficulty: "Basic",
            concept: "Object & Prop Identity Comparison (Object.is)",
            description: "Implement `shallowEqual(objA, objB)` matching the exact comparator used by `React.memo` and `PureComponent`. Returns `true` if all own keys are shallowly equal using `Object.is`.",
            starterCode: `function shallowEqual(objA, objB) {
  if (Object.is(objA, objB)) return true;
  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) return false;

  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i];
    if (!Object.prototype.hasOwnProperty.call(objB, key) || !Object.is(objA[key], objB[key])) {
      return false;
    }
  }

  return true;
}
`,
            interviewTrap: "Using `===` instead of `Object.is` causes `+0` and `-0` to match incorrectly and `NaN === NaN` to fail.",
            testCases: [
              {
                id: 1,
                name: "Returns true for objects with identical top-level properties",
                input: "shallowEqual({ a: 1, b: 'x' }, { a: 1, b: 'x' })",
                expected: true,
                testFn: "return shallowEqual({ a: 1, b: 'x' }, { a: 1, b: 'x' });"
              },
              {
                id: 2,
                name: "Returns false when nested object references differ",
                input: "shallowEqual({ inner: {} }, { inner: {} })",
                expected: false,
                testFn: "return shallowEqual({ inner: {} }, { inner: {} });"
              },
              {
                id: 3,
                name: "Handles NaN properly via Object.is",
                input: "shallowEqual({ n: NaN }, { n: NaN })",
                expected: true,
                testFn: "return shallowEqual({ n: NaN }, { n: NaN });"
              }
            ]
          },
          Medium: {
            id: "rerender-medium",
            title: "Custom React.memo Simulator",
            difficulty: "Medium",
            concept: "Component Memoization & Skip Render Decision",
            description: "Implement `memoComponent(Component, arePropsEqual = shallowEqual)` that returns a wrapper function tracking the last rendered props and result. If incoming props are equal to previous props, return the cached result without executing `Component`.",
            starterCode: `function memoComponent(Component, arePropsEqual = shallowEqual) {
  let prevProps = null;
  let prevResult = null;

  return function Memoized(props) {
    if (prevProps !== null && arePropsEqual(prevProps, props)) {
      return prevResult;
    }
    prevResult = Component(props);
    prevProps = props;
    return prevResult;
  };
}
`,
            interviewTrap: "Not allowing a custom `arePropsEqual` comparator. React allows developers to provide custom comparison functions for complex objects.",
            testCases: [
              {
                id: 1,
                name: "Re-uses cached render when props are unchanged",
                input: "render twice with identical props runs component once",
                expected: 1,
                testFn: "let renders = 0; const Comp = (props) => { renders++; return props.name; }; const Memo = memoComponent(Comp, shallowEqual); Memo({ name: 'Alpha' }); Memo({ name: 'Alpha' }); return renders;"
              },
              {
                id: 2,
                name: "Re-renders when props change",
                input: "changing name triggers new render",
                expected: 2,
                testFn: "let renders = 0; const Comp = (props) => { renders++; return props.name; }; const Memo = memoComponent(Comp, shallowEqual); Memo({ name: 'Alpha' }); Memo({ name: 'Beta' }); return renders;"
              },
              {
                id: 3,
                name: "Respects custom comparison function",
                input: "custom comparator ignores title prop",
                expected: 1,
                testFn: "let renders = 0; const Comp = (p) => { renders++; return p.id; }; const Memo = memoComponent(Comp, (a, b) => a.id === b.id); Memo({ id: 1, title: 'Old' }); Memo({ id: 1, title: 'New' }); return renders;"
              }
            ]
          },
          Hard: {
            id: "rerender-hard",
            title: "Fine-Grained Selector Store (Zustand / Redux pattern)",
            difficulty: "Hard",
            concept: "Selective Re-renders & Subscription Notification",
            description: "Implement `createStore(initialState)` with methods: `getState()`, `setState(partial)`, and `useSelector(selector, equalityFn = Object.is)`. Subscribers are only notified when their selected slice of state actually changes.",
            starterCode: `function createStore(initialState) {
  let state = initialState;
  const subscribers = new Set();

  function getState() {
    return state;
  }

  function setState(partial) {
    const nextState = typeof partial === 'function' ? partial(state) : { ...state, ...partial };
    state = nextState;
    for (const sub of subscribers) {
      sub();
    }
  }

  function subscribe(listener) {
    subscribers.add(listener);
    return () => subscribers.delete(listener);
  }

  function subscribeSelector(selector, onChange, equalityFn = Object.is) {
    let currentSlice = selector(state);
    return subscribe(() => {
      const nextSlice = selector(state);
      if (!equalityFn(currentSlice, nextSlice)) {
        currentSlice = nextSlice;
        onChange(nextSlice);
      }
    });
  }

  return { getState, setState, subscribe, subscribeSelector };
}
`,
            interviewTrap: "Global state stores that notify all components regardless of which slice changed cause massive app-wide re-render cascades.",
            testCases: [
              {
                id: 1,
                name: "Notifies selector subscriber only when selected property changes",
                input: "updating counter notifies counter subscriber",
                expected: [10],
                testFn: "const store = createStore({ count: 0, text: 'hi' }); const notifications = []; store.subscribeSelector(s => s.count, val => notifications.push(val)); store.setState({ count: 10 }); return notifications;"
              },
              {
                id: 2,
                name: "Does not notify subscriber when unrelated state changes",
                input: "updating text does not notify counter subscriber",
                expected: 0,
                testFn: "const store = createStore({ count: 0, text: 'hi' }); let calls = 0; store.subscribeSelector(s => s.count, () => calls++); store.setState({ text: 'updated' }); return calls;"
              },
              {
                id: 3,
                name: "Unsubscribe cleans up listener properly",
                input: "unsub removes selector subscription",
                expected: 1,
                testFn: "const store = createStore({ count: 0 }); let calls = 0; const unsub = store.subscribeSelector(s => s.count, () => calls++); store.setState({ count: 1 }); unsub(); store.setState({ count: 2 }); return calls;"
              }
            ]
          }
        }
      }
    ]
  }
];

// Append extra advanced categories (Garbage Collection, Metaprogramming, Iterators, V8 Internals, Binary Data, Modules)
const extraJsCategories = require('./topics-extra-js');
topicsData.push(...extraJsCategories);

const { createStub } = require('./stub-generator');

// Add starterChallenge property to each topic pointing to Basic by default
// Preserve full working solution in solutionCode, and generate clean empty stub in starterCode
topicsData.forEach(cat => {
  cat.topics.forEach(t => {
    ['Basic', 'Medium', 'Hard'].forEach(diff => {
      const q = t.challenges[diff];
      if (q) {
        q.solutionCode = q.starterCode;
        q.starterCode = createStub(q.starterCode);
      }
    });
    t.starterChallenge = t.challenges.Basic;
    t.questions = [t.challenges.Basic, t.challenges.Medium, t.challenges.Hard];
  });
});

const content = `// Exhaustive JavaScript Mastery Topics Catalog
// Curated with Basic, Medium, and Hard challenges with runnable test cases.

module.exports = ${JSON.stringify(topicsData, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, 'topics.js'), content, 'utf8');
console.log('Successfully generated topics.js!');
