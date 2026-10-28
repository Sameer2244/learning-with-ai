// Comprehensive Interview Cross-Questions & Deep Preparation Data
// Domain: 1. JS Engine & Memory Internals (12 Questions)
// Questions: exec-context-basic, exec-context-medium, exec-context-hard,
//            closures-basic, closures-medium, closures-hard,
//            tdz-basic, tdz-medium, tdz-hard,
//            this-basic, this-medium, this-hard

module.exports = {
  "exec-context-basic": {
    interviewCrossQuestions: [
      {
        question: "Why does the V8 call stack size vary between different machines or even runs?",
        answer: "The call stack is governed by the OS-level thread stack size allocated to the V8 process (typically 1MB on 64-bit Linux/Windows for Node.js, and 984KB in Chrome). The actual number of function frames that can fit depends on the size of each activation record (local variables, parameters, scope pointers, and register spills). Functions declaring many local variables or closures consume larger frame slots, decreasing the maximum recursion depth before throwing RangeError: Maximum call stack size exceeded.",
        difficulty: "intermediate",
        whyAsked: "Tests whether you understand that stack frames have variable byte sizes determined by local variable allocations."
      },
      {
        question: "What is the difference between Call Stack, Execution Context, and Lexical Environment?",
        answer: "The Call Stack is the physical LIFO memory structure tracking active function invocations. An Execution Context is the conceptual runtime environment created when code evaluates, consisting of VariableEnvironment, LexicalEnvironment, and ThisBinding. The LexicalEnvironment is an internal specification type holding the Environment Record (identifier-to-value mappings) and an outer [[Environment]] pointer for scope chain lookups.",
        difficulty: "advanced",
        whyAsked: "Interviews check if the candidate conflates language specification constructs (ECMA-262 Execution Contexts) with C++ runtime data structures (Call Stack)."
      },
      {
        question: "Does Tail Call Optimization (TCO) prevent call stack exhaustion in standard JavaScript?",
        answer: "Syntactic TCO was specified in ES2015 (§14.6) for strict mode, but only WebKit / JavaScriptCore (Safari) actually implements it. V8 (Chrome/Node.js) and SpiderMonkey (Firefox) dropped TCO support because it strips stack traces for debugging and complicates error profiling. Therefore, you cannot rely on TCO in Node or Chromium; you must use iterative loops, trampolines, or microtask scheduling to prevent stack overflow.",
        difficulty: "advanced",
        whyAsked: "Checks if the candidate is aware of real-world browser engine divergence vs ECMAScript specification theory."
      },
      {
        question: "How does the engine detect stack overflow before crashing the entire operating system process?",
        answer: "V8 maintains an internal stack limit address pointer on the Isolate (`isolate->stack_guard()`). At the prologue of every function invocation, compiled bytecode or TurboFan machine code compares the current CPU stack pointer ($rsp / $esp) against this boundary. If the stack pointer drops past the limit, V8 raises a StackOverflow interrupt and throws a JavaScript RangeError instead of allowing a catastrophic OS segmentation fault.",
        difficulty: "advanced",
        whyAsked: "Tests understanding of low-level runtime safety guards in modern JIT engines."
      },
      {
        question: "If a stack overflow occurs inside a try...catch block, can it be caught?",
        answer: "Yes, 'RangeError: Maximum call stack size exceeded' is a standard JavaScript error instance that can be caught by an enclosing try/catch block. However, executing further code within the catch block can immediately trigger secondary stack errors if the stack has not sufficiently unwound or if memory allocation fails.",
        difficulty: "basic",
        whyAsked: "Tests practical debugging and resilience instincts."
      },
      {
        question: "What happens to the Call Stack when an asynchronous callback (e.g. setTimeout) is scheduled?",
        answer: "Scheduling an asynchronous operation merely registers a timer in the browser/libuv timer wheel. The current function continues executing and its frame pops off the Call Stack normally. The callback is enqueued into the Task/Macrotask Queue and will only be pushed onto a completely empty Call Stack in a future turn of the event loop.",
        difficulty: "basic",
        whyAsked: "Validates foundational distinction between synchronous call stack execution and asynchronous event loop queues."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Babel AST & TypeScript Compiler Traversal",
        description: "Compilers traversing Abstract Syntax Trees (ASTs) containing thousands of nested statements avoid naive recursion by using an explicit heap stack (iterative DFS) to prevent call stack overflow.",
        companies: "Babel, TypeScript, ESLint",
        codeSnippet: "function traverse(ast) {\n  const stack = [ast];\n  while (stack.length) {\n    const node = stack.pop();\n    for (const child of node.children) stack.push(child);\n  }\n}"
      },
      {
        scenario: "Safe Deep Object Serialization",
        description: "JSON stringifiers and deep cloner libraries implement depth counters to guard against malicious deeply-nested JSON payloads designed to cause Denial of Service (DoS) attacks via stack exhaustion.",
        companies: "Fastify, Express, AWS Lambda",
        codeSnippet: "function safeSerialize(obj, maxDepth = 100) {\n  if (maxDepth <= 0) throw new Error('Max payload nesting depth exceeded');\n  // serialize\n}"
      },
      {
        scenario: "React Fiber Architecture",
        description: "React 16 completely rewrote the reconciler from recursive virtual DOM diffing (Stack Reconciler) to a linked-list work loop (Fiber Reconciler) to eliminate call stack depth limits and allow pausing work.",
        companies: "Meta, Next.js",
        codeSnippet: "while (workInProgress !== null && !shouldYield()) {\n  workInProgress = performUnitOfWork(workInProgress);\n}"
      }
    ],
    howToExplain: {
      opening: "The JavaScript Call Stack is a synchronous, single-threaded LIFO data structure that tracks active Execution Contexts in the host engine. Each function call pushes an activation frame, and returns pop that frame.",
      keyPoints: [
        "Each frame stores local variables, parameter arguments, and references to its outer lexical environment.",
        "Stack size is bounded by the host OS thread stack (typically ~1MB in Node.js, allowing ~10,000 to 12,000 frames).",
        "Stack overflow occurs when recursion fails to hit a base case before exceeding the engine's stack guard limit.",
        "Production systems handle deep hierarchy via iterative heap-allocated stacks or trampolining rather than deep recursion."
      ],
      closingImpression: "Understanding stack frame limits is why modern frameworks like React transitioned away from recursive tree diffing to iterative pointer traversal like Fiber.",
      analogies: ["Think of the call stack like a stack of cafeteria trays: you can only place a tray on top and take one from the top; if you stack too high, it hits the ceiling and collapses."]
    },
    commonMistakes: [
      {
        mistake: "Assuming all functions allow the exact same number of recursive calls (e.g. 'always 10,000').",
        why: "Stack frame byte footprint depends directly on the number of declared local variables and registers needed by that specific function.",
        correct: "State that recursion depth limits are variable and depend on frame size and thread memory constraints."
      },
      {
        mistake: "Confusing stack memory with heap memory.",
        why: "Stack memory is small (~1MB) and fixed for sequential execution; heap memory is large (gigabytes) for dynamic object allocation.",
        correct: "Clarify that stack holds execution pointers and primitive local activation records, while objects and closures survive on the heap."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does V8 allocate memory for closures that outlive the function's call stack frame?",
        answer: "When V8 analyzes a function during parsing, its Scope Analysis phase identifies variables accessed by inner closures. Instead of allocating those variables on the Call Stack frame (which would be discarded on return), V8 allocates a heap-allocated Context object. The inner function retains a hidden [[Scopes]] pointer to this heap Context, ensuring the data persists after the stack frame pops.",
        specReference: "ECMA-262 §9.1.1 Declarative Environment Records & V8 src/ast/scopes.cc"
      }
    ]
  },

  "exec-context-medium": {
    interviewCrossQuestions: [
      {
        question: "What is a trampoline function and how does it prevent stack overflow?",
        answer: "A trampoline is a higher-order control flow utility that takes a function returning either a result or another function (a thunk). The trampoline executes in a synchronous `while` loop, repeatedly invoking the returned thunk until a non-function value is produced. Because each thunk invocation finishes and returns before the next is called, the Call Stack never grows beyond 1 or 2 frames.",
        difficulty: "intermediate",
        whyAsked: "Tests understanding of functional programming patterns used to achieve unbounded recursive algorithms in languages lacking TCO."
      },
      {
        question: "What is the memory trade-off between trampolining and iterative loops?",
        answer: "An iterative `while` loop with heap variables has zero function allocation overhead and O(1) space. A trampoline allocates a closure object (thunk) on the V8 heap for every single iteration step. While it avoids call stack overflow, it produces significant garbage collection churn in high-frequency loops. An explicit iterative loop is almost always faster in production V8.",
        difficulty: "advanced",
        whyAsked: "Separates textbook knowledge from real-world performance engineering."
      },
      {
        question: "Can generators or async/await be used as a trampoline?",
        answer: "Yes! A generator function yields values without growing the call stack because `yield` suspends the generator's execution context frame to the heap. A runner loop repeatedly calling `gen.next()` can iterate indefinitely with a constant call stack depth of 1.",
        difficulty: "advanced",
        whyAsked: "Tests ability to connect execution contexts with generator coroutines."
      },
      {
        question: "How does tail-call elimination differ from trampolining?",
        answer: "Tail Call Elimination (TCO) is a compiler/engine optimization where the existing stack frame is overwritten and reused for the tail call, consuming zero additional memory. Trampolining is a userland software pattern where functions return thunks to an external driving loop, running on any engine without compiler support.",
        difficulty: "intermediate",
        whyAsked: "Tests precision in compiler theory vs userland patterns."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Redux-Saga Effect Runners",
        description: "Redux-Saga uses generator-based trampolining to step through complex nested asynchronous actions and yield effects without exhausting call stack frames.",
        companies: "Netflix, Airbnb",
        codeSnippet: "function* rootSaga() { while (true) { const action = yield take('ACTION'); yield fork(handleAction, action); } }"
      },
      {
        scenario: "Immutable.js Persistent Data Structures",
        description: "Navigating deeply nested 32-way trie nodes in Immutable.js relies on iterative traversals to guarantee stability regardless of depth.",
        companies: "Meta, Uber",
        codeSnippet: "while (node) { if (node.isLeaf) return node.val; node = node.children[hash & MASK]; }"
      }
    ],
    howToExplain: {
      opening: "When an algorithm requires processing deeply nested structures where recursive depth exceeds ~10,000 frames, we must decouple algorithm execution from the physical call stack.",
      keyPoints: [
        "Recursive calls place frames on the engine's fixed thread stack, risking RangeError.",
        "Trampolining wraps steps in thunk closures evaluated inside a synchronous while loop.",
        "Iterative traversal with an explicit heap-allocated array moves the stack state to the engine heap.",
        "In production V8, explicit iterative loops are preferred over trampolines to avoid GC pressure from thunk allocations."
      ],
      closingImpression: "By moving the call state from the fixed 1MB stack to the multi-gigabyte heap, we scale to millions of elements safely.",
      analogies: ["Instead of holding 10,000 tasks in your hands (stack) until you collapse, you put them on a desk clipboard (heap) and process them one by one."]
    },
    commonMistakes: [
      {
        mistake: "Believing that writing return recurse() in Node.js automatically performs TCO.",
        why: "V8 does not implement syntactic TCO; writing return recurse() still grows the call stack frame by frame.",
        correct: "Explicitly state that Node.js / V8 lacks TCO, so you must use iterative loops or trampolining."
      }
    ],
    followUpDeepDive: [
      {
        question: "Why did the V8 team explicitly remove Tail Call Optimization after implementing it behind a flag in 2016?",
        answer: "The V8 and TC39 consensus cited two major blockers: 1) Loss of debugging fidelity: developers could no longer inspect full call stacks or `Error().stack` traces when frames were overwritten. 2) Interop with `Function.caller` and `Function.arguments` properties, which expect legacy frame pointers. A proposal for explicit syntactic tail calls (`return continue fn()`) was discussed but never achieved consensus.",
        specReference: "TC39 Proposal: Syntactic Tail Calls (STC) & V8 Issue #4698"
      }
    ]
  },

  "exec-context-hard": {
    interviewCrossQuestions: [
      {
        question: "How does the Call Stack guarantee LIFO unwinding when an unhandled error is thrown?",
        answer: "When an exception occurs, the runtime evaluates the Completion Record of the active execution context. Because it is an 'abrupt completion' of type 'throw', the engine checks for an active exception handler in the current frame. If none exists, the frame is popped, its lexical resources are scheduled for GC, and the unwinding continues down the Call Stack until a matching try/catch handler is reached or the top-level script terminates.",
        difficulty: "advanced",
        whyAsked: "Tests understanding of ECMA-262 completion records and stack unwinding mechanics."
      },
      {
        question: "How do tools like AsyncLocalStorage or Chrome DevTools maintain context across asynchronous boundaries?",
        answer: "The synchronous call stack is completely lost once an asynchronous boundary is crossed. Tools like Node.js `async_hooks` and `AsyncLocalStorage` hook into resource lifecycle events (init, before, after, destroy). When an async operation is scheduled, the engine snapshots the current context ID in an internal C++ table and restores it when the callback executes.",
        difficulty: "advanced",
        whyAsked: "Tests ability to bridge synchronous call stack knowledge with modern asynchronous runtime architecture."
      },
      {
        question: "What is the performance overhead of wrapping functions with execution context profilers?",
        answer: "Calling `performance.now()` incurs high-resolution timer access overhead (~15-30ns per call). Furthermore, wrapping calls in higher-order functions prevents JIT compilers (like V8 TurboFan) from inlining the target function, disrupting monomorphic inline caches and leading to deoptimizations.",
        difficulty: "advanced",
        whyAsked: "Tests awareness of how instrumentation perturbs JIT optimizations (the Observer Effect in profiling)."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "OpenTelemetry Distributed Tracing",
        description: "Tracing libraries instrument incoming HTTP requests and internal function invocations using call stack context trackers to emit spans with exact durations and parent-child hierarchy.",
        companies: "Datadog, Dynatrace, New Relic",
        codeSnippet: "tracer.startActiveSpan('processOrder', (span) => { try { doWork(); } finally { span.end(); } });"
      },
      {
        scenario: "React Error Boundaries (getDerivedStateFromError)",
        description: "React captures abrupt component render crashes and unwinds the Fiber tree to the nearest ErrorBoundary boundary without crashing the whole host DOM tree.",
        companies: "Meta, Vercel",
        codeSnippet: "static getDerivedStateFromError(error) { return { hasError: true }; }"
      }
    ],
    howToExplain: {
      opening: "A synchronous execution context profiler replicates the engine's internal call stack tracking by maintaining a strict LIFO stack of execution records.",
      keyPoints: [
        "Context tracking requires pushing on function entry and popping on exit to ensure parent-child nesting fidelity.",
        "Guaranteed unwinding must use try...finally to ensure stack consistency even when exceptions are thrown.",
        "DevTools profilers hook into the engine's activation records and sampling timers to construct flame charts.",
        "Context instrumentation must be aware of JIT inlining penalties in performance-critical hot paths."
      ],
      closingImpression: "This architecture is the foundational mental model behind APM monitoring, distributed tracing, and execution flamegraphs.",
      analogies: ["Like checking into a hotel floor: you register your entry at the front desk, swipe into your room, and must checkout in reverse order to balance the logbook."]
    },
    commonMistakes: [
      {
        mistake: "Failing to use try...finally when unwinding context on exit.",
        why: "If the profiled function throws, an unhandled exit call will leave the tracker's call stack permanently corrupted.",
        correct: "Always place context exit / pop logic in a finally block."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does V8 implement Error.captureStackTrace and what is the cost of generating stack traces?",
        answer: "When an Error is constructed, V8 does not immediately format the stack string. Instead, it captures a snapshot of current C++ and bytecode frame pointers. The expensive serialization (source map resolution, function names, line numbers) is deferred until the `.stack` property is accessed via a getter. Accessing `.stack` forces V8 to traverse the frame table and inspect AST script lines, which is CPU intensive.",
        specReference: "V8 internal implementation: src/execution/isolate.cc & Error.stack API"
      }
    ]
  },

  "closures-basic": {
    interviewCrossQuestions: [
      {
        question: "Where are variables held in a closure stored in memory?",
        answer: "Variables captured by a closure that outlives its parent function are allocated on the V8 Heap inside a special internal `Context` object, NOT on the Call Stack. Stack memory is ephemeral and reclaimed immediately when a function returns. The Heap Context object is retained because the returned inner function holds a reference in its internal `[[Scopes]]` array, creating an active reachability path from GC roots.",
        difficulty: "intermediate",
        whyAsked: "Tests whether you understand real memory allocation mechanics vs abstract lexical scope definitions."
      },
      {
        question: "Can two different functions share the exact same closure context?",
        answer: "Yes. If an outer function defines multiple inner functions that reference outer variables, V8 allocates a single shared `Context` object for that scope. All inner functions point to that identical Context. Mutating a variable from one inner function is instantly observed by the other.",
        difficulty: "intermediate",
        whyAsked: "Tests understanding of how engines bundle multiple closures from the same scope."
      },
      {
        question: "How do closures relate to the classic for(var i=0; i<3; i++) setTimeout trap?",
        answer: "With `var`, there is only a single function-scoped variable binding for `i`. All three setTimeout callbacks close over the exact same variable reference. By the time the callbacks fire, the loop has completed and mutated `i` to 3. Replacing `var` with `let` creates a new lexical environment binding for `i` on every loop iteration, giving each callback its own distinct closed-over copy.",
        difficulty: "basic",
        whyAsked: "The universal junior-to-mid litmus test for closure understanding."
      },
      {
        question: "What is the [[Scopes]] internal property on a function object?",
        answer: "In V8 and Chromium DevTools, every function has a hidden internal slot `[[Scopes]]`. It contains a scope chain linked list: from the local closure Contexts, through module and script scopes, up to the Global scope. When resolving variable lookups, the engine walks this chain from nearest to furthest.",
        difficulty: "advanced",
        whyAsked: "Tests whether the candidate has inspected function internals using Chrome DevTools or Node inspect."
      },
      {
        question: "Do modern JS engines keep unreferenced variables in a closure context?",
        answer: "No. Modern engines (V8, SpiderMonkey) perform Scope Analysis during AST parsing. Any variable declared in the outer scope that is NEVER referenced by any inner function is stripped and discarded from the heap Context. Only referenced variables are retained, optimizing heap memory usage.",
        difficulty: "advanced",
        whyAsked: "Checks if candidate understands V8 dead-code and scope pruning optimizations."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Module Pattern & Private State Encapsulation",
        description: "Before ES2022 private class fields (#field), closures were the primary mechanism for true information hiding in JavaScript, preventing external consumers from tampering with internal state.",
        companies: "Lodash, Redux, jQuery",
        codeSnippet: "function createStore(initial) { let state = initial; return { getState: () => state, setState: (s) => { state = s; } }; }"
      },
      {
        scenario: "React useState & useReducer Hook Internals",
        description: "React hooks rely on closures to bind component render cycles to fiber nodes. Each render pass captures state and dispatchers within that render's functional closure.",
        companies: "Meta, Next.js",
        codeSnippet: "const [count, setCount] = useState(0); // count is captured in component closure"
      },
      {
        scenario: "Function Currying & Partial Application",
        description: "Utilities like `curry` and `debounce` use closures to accumulate arguments across multiple distinct invocations until threshold conditions are satisfied.",
        companies: "Ramda, Lodash",
        codeSnippet: "const add = a => b => a + b;"
      }
    ],
    howToExplain: {
      opening: "A closure is a function bundled together with references to its surrounding lexical environment. It allows an inner function to retain access to variables from an outer scope even after that outer function has returned.",
      keyPoints: [
        "Functions in JS carry an internal [[Environment]] reference to their enclosing Lexical Environment Record.",
        "Captured variables escape stack frame destruction and are allocated on the V8 Heap inside a Context object.",
        "Multiple functions created in the same scope share the same closure Context.",
        "Closures provide the foundation for private encapsulation, currying, and React hook state persistence."
      ],
      closingImpression: "Closures are not a special feature you opt into; in JavaScript, all functions are closures because they retain lexical scope references by default.",
      analogies: ["A closure is like taking a backpack with supplies from your hometown when you travel; even after leaving town, you still have everything you packed inside your backpack."]
    },
    commonMistakes: [
      {
        mistake: "Saying that closures copy variable values.",
        why: "Closures do NOT copy values; they capture live references to the binding in the environment record. If the variable mutates later, the closure reads the mutated value.",
        correct: "State that closures hold live references to outer variable bindings, not static snapshot copies."
      },
      {
        mistake: "Thinking closures only exist when an inner function is returned.",
        why: "Any inner function referencing an outer variable forms a closure, even if passed as a callback to setTimeout or an event listener without being returned.",
        correct: "Explain that closure formation depends on lexical nesting and variable access, not the return statement."
      }
    ],
    followUpDeepDive: [
      {
        question: "Explain the 'Eval Scope Leak' edge case in V8 closure optimization.",
        answer: "Normally V8 prunes unreferenced variables from heap Contexts. However, if a function contains a direct `eval()` call, V8 cannot predict at compile time which variables `eval` might access at runtime. Consequently, V8 is forced to deoptimize and retain ALL outer scope variables in the heap Context, potentially causing unintended memory retention.",
        specReference: "ECMA-262 §13.3.7.1 Direct Eval Arguments & V8 Scope Analysis"
      }
    ]
  },

  "closures-medium": {
    interviewCrossQuestions: [
      {
        question: "How can closures inadvertently cause severe memory leaks in production Node.js applications?",
        answer: "Memory leaks occur when an inner closure retains a reference to a large object (or outer scope holding a large object) and that closure is attached to a long-lived root (e.g. a global event emitter, setInterval, or cache map). Even if the application no longer needs the large object, V8's Garbage Collector cannot free it because an active reachability path exists from the closure root.",
        difficulty: "intermediate",
        whyAsked: "Tests practical production debugging ability and memory lifecycle understanding."
      },
      {
        question: "Explain the infamous 'Meteor / Lexical Scope Context Sharing' memory leak.",
        answer: "If function `A` defines a large buffer and an inner function `unused` that references it, and also defines a small function `clean` that doesn't reference the buffer, V8 still allocates a single shared Context for both. If `clean` is saved globally (e.g., as an event listener), it keeps the ENTIRE shared Context alive, preventing the large buffer from being GC'd even though `clean` never touches it!",
        difficulty: "advanced",
        whyAsked: "This is one of the highest-signal senior frontend/backend questions regarding V8 closure mechanics."
      },
      {
        question: "Why does returning a direct object reference from a closure break encapsulation?",
        answer: "JavaScript objects are passed by reference. If a closure returns an internal object directly, external callers can mutate its properties (e.g. `store.get().user.role = 'admin'`). True encapsulation requires returning defensive deep copies (via `structuredClone` or JSON parsing) or using frozen immutable data.",
        difficulty: "basic",
        whyAsked: "Tests defensive programming principles."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Express/Fastify Authentication Middleware",
        description: "Middleware factories accept options (roles, JWT secrets) and return request handlers that close over those configurations securely without polluting req/res objects.",
        companies: "Uber, Stripe, PayPal",
        codeSnippet: "function authorize(role) { return (req, res, next) => { if (req.user.role === role) next(); else res.status(403).send(); }; }"
      },
      {
        scenario: "Database Connection Pool Management",
        description: "Connection poolers use closures to hide raw socket handles and expose clean acquire/release handles, preventing client code from closing underlying connections directly.",
        companies: "Prisma, TypeORM, Knex",
        codeSnippet: "function createPool() { const connections = []; return { acquire: () => getFree(connections), release: (c) => reset(c) }; }"
      }
    ],
    howToExplain: {
      opening: "A secure store leverages closures to achieve private data encapsulation and defensive cloning to guarantee that internal state cannot be mutated or leaked to external callers.",
      keyPoints: [
        "Closure-held state is inaccessible from the global scope and cannot be inspected via Object.keys.",
        "Defensive deep snapshots prevent reference aliasing where callers accidentally mutate internal state.",
        "Explicit cleanup methods (like clear()) drop references from the closure context, enabling GC reclamation.",
        "Shared context memory leaks must be prevented by nullifying references when their lifecycle terminates."
      ],
      closingImpression: "Defensive copying combined with explicit teardown hooks is essential when building enterprise state containers.",
      analogies: ["Like a bank vault with a teller window: you can ask for a photocopy of your balance sheet, but you are never handed the master ledger directly."]
    },
    commonMistakes: [
      {
        mistake: "Using Object.assign or spread {...obj} for deep snapshots.",
        why: "Object.assign and spread only create shallow copies. Nested objects and arrays still share identical memory references.",
        correct: "Use structuredClone() or recursive deep cloning to guarantee nested reference isolation."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does structuredClone() differ from JSON.parse(JSON.stringify()) for deep cloning?",
        answer: "structuredClone() (HTML Living Standard / Node 17+) uses the HTML Structured Clone Algorithm. Unlike JSON serialization, it handles circular references, preserves Date objects, RegExp instances, Maps, Sets, and TypedArrays, and does not strip properties with `undefined` values. However, it cannot clone functions or DOM nodes (which throws a DataCloneError).",
        specReference: "HTML Living Standard §2.7 Safe passing of structured data"
      }
    ]
  },

  "closures-hard": {
    interviewCrossQuestions: [
      {
        question: "Why is a Map preferred over a plain object for implementing an LRU cache?",
        answer: "In JavaScript (ECMA-262 §24.1.3), `Map` is guaranteed to iterate its keys in deterministic insertion order. When a key is accessed in an LRU cache, deleting and re-inserting it (`map.delete(k); map.set(k, v)`) moves it to the most recently used (end) position in O(1) time. The least recently used key is always the first key in the map (`map.keys().next().value`), allowing O(1) eviction without maintaining a separate doubly-linked list.",
        difficulty: "intermediate",
        whyAsked: "Tests understanding of ES6 data structure specification guarantees and algorithmic efficiency."
      },
      {
        question: "What is the problem with JSON.stringify as a cache key serializer?",
        answer: "JSON.stringify has three flaws: 1) Key order non-determinism: `{a:1, b:2}` produces a different string than `{b:2, a:1}`, causing cache misses for identical inputs. 2) Unsupported types: `undefined`, functions, and symbols are converted to `null` or omitted. 3) Performance overhead: serializing large argument payloads on every call can take longer than the function execution itself.",
        difficulty: "intermediate",
        whyAsked: "Tests practical production awareness of serialization pitfalls in memoization libraries."
      },
      {
        question: "How would you handle cache expiration (TTL) without running active setInterval timers?",
        answer: "Active timers (`setInterval` or `setTimeout` per key) waste CPU cycles and keep the event loop alive. The optimal approach is 'Passive / Lazy Eviction': store a timestamp `{ value, expiry }` in the cache entry. When the key is queried, compare `Date.now() > expiry`. If expired, delete the key and treat it as a miss. An optional sweep can be triggered on new insertions to purge accumulated expired keys.",
        difficulty: "advanced",
        whyAsked: "Distinguishes junior developers who create thousands of timers from engineers who design passive memory eviction systems."
      },
      {
        question: "How can WeakMap be used in memoization, and what is its limitation?",
        answer: "A `WeakMap` uses objects as keys without preventing garbage collection of those objects. It provides perfect zero-leak memoization for object arguments. However, WeakMap keys MUST be objects (primitives like strings/numbers are forbidden), and WeakMap is non-iterable, meaning you cannot implement an LRU size limit or inspect cache keys.",
        difficulty: "advanced",
        whyAsked: "Tests knowledge of WeakMap garbage collection semantics vs standard Map."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "GraphQL Query Result & DataLoader Caching",
        description: "Facebook's DataLoader memoizes database batch loads within the lexical scope of a single HTTP request tick to prevent duplicate SQL queries.",
        companies: "Meta, Shopify, GitHub",
        codeSnippet: "const userLoader = new DataLoader(keys => myBatchGetUsers(keys));"
      },
      {
        scenario: "React reselect Selector Memoization",
        description: "Redux applications use reselect to cache expensive state slice calculations, evicting previous results when input parameters change.",
        companies: "Airbnb, Discord",
        codeSnippet: "const selectFiltered = createSelector([getItems, getFilter], (items, f) => items.filter(f));"
      }
    ],
    howToExplain: {
      opening: "An enterprise memoizer pairs closure state with an LRU (Least Recently Used) eviction policy and time-to-live expiration to strictly bound memory growth.",
      keyPoints: [
        "Unbounded memoization caches are guaranteed memory leaks in production long-running services.",
        "ES6 Map insertion order semantics enable O(1) LRU eviction by deleting and re-inserting accessed keys.",
        "Lazy TTL expiration checks timestamps on access rather than creating thousands of background timer handles.",
        "Key serialization must be deterministic to ensure equivalent argument sets produce identical cache keys."
      ],
      closingImpression: "A memoizer without capacity eviction is a memory leak waiting to happen.",
      analogies: ["Like an executive desk with space for only 5 folders: when a new folder arrives, you throw away the one you haven't touched for the longest time."]
    },
    commonMistakes: [
      {
        mistake: "Creating a setTimeout for every cached entry to handle TTL.",
        why: "Creating 50,000 setTimeout handles overwhelms the Node.js / browser timer wheel and prevents process exit.",
        correct: "Use passive expiration by checking entry.expiry on read, and evict during lookup or insert."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does V8 implement Map internally to provide O(1) key access and insertion-order iteration?",
        answer: "V8 implements ES6 Map using a deterministic hash table based on the 'OrderedHashTable' C++ class. It stores entries in a flat contiguous array with bucket indices and next pointers. When keys are deleted, they are marked as deleted (tombstones) and cleaned up during periodic table compaction, preserving exact insertion order without linked list node allocations.",
        specReference: "V8 source: src/objects/ordered-hash-table.cc"
      }
    ]
  },

  "tdz-basic": {
    interviewCrossQuestions: [
      {
        question: "Are let and const declarations hoisted in JavaScript?",
        answer: "Yes, `let` and `const` ARE hoisted to the very top of their enclosing block scope during the Creation Phase of the Execution Context. However, unlike `var` (which is hoisted and immediately initialized to `undefined`), `let` and `const` remain uninitialized. The region of code between entering the block and evaluating the declaration line is the Temporal Dead Zone (TDZ). Accessing the identifier in this zone throws ReferenceError.",
        difficulty: "intermediate",
        whyAsked: "The #1 trap question interviewers use to identify candidates who memorize surface-level answers vs understand the spec."
      },
      {
        question: "How does typeof behave on a TDZ variable vs an undeclared variable?",
        answer: "For an undeclared variable (one that was never declared anywhere), `typeof x` safely returns `'undefined'`. However, for a variable declared with `let` or `const` later in the scope, `typeof x` inside its TDZ throws `ReferenceError: Cannot access 'x' before initialization`. This proves that `let` is indeed hoisted and aware of its identifier in the scope.",
        difficulty: "intermediate",
        whyAsked: "Classic cross-question that definitively proves TDZ hoisting mechanics."
      },
      {
        question: "What is the internal representation of a TDZ binding in V8?",
        answer: "In V8, when an Environment Record is instantiated, variable slots for `let`/`const` are filled with a special internal sentinel value called `the_hole`. Whenever bytecode operations (e.g. `LdaCurrentContextSlot`) read a slot, the engine executes a 'hole check'. If the value is `the_hole`, V8 immediately raises a runtime ReferenceError.",
        difficulty: "advanced",
        whyAsked: "Demonstrates deep engine-level knowledge of V8 bytecode interpreter (Ignition)."
      },
      {
        question: "Why was the Temporal Dead Zone introduced in ES2015?",
        answer: "TDZ was designed for two reasons: 1) Const invariants: A `const` variable must never be observed in an unassigned state or reassigned; initializing it to `undefined` on hoisting would violate the `const` contract. 2) Bug prevention: Accessing variables before their declaration line is almost always a logical developer error; failing fast with a ReferenceError prevents subtle undefined bugs.",
        difficulty: "basic",
        whyAsked: "Tests understanding of language design rationale (TC39 motivations)."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Preventing State Desynchronization in React Components",
        description: "Block-scoped let/const inside hooks and conditional renders prevent stale hoisted variable leakage across branch conditions.",
        companies: "Meta, Vercel",
        codeSnippet: "if (condition) { const data = compute(); use(data); } // data is isolated to block"
      },
      {
        scenario: "Refactoring Legacy Codebases safely",
        description: "Static analyzers and TypeScript use TDZ rules to catch inadvertent variable access before initialization during automated code migrations.",
        companies: "Stripe, Airbnb",
        codeSnippet: "console.log(x); // TS Error: Block-scoped variable 'x' used before its declaration."
      }
    ],
    howToExplain: {
      opening: "The Temporal Dead Zone (TDZ) is the lexical timespan between entering a block scope and evaluating a let or const declaration. While the variable is hoisted, it cannot be read or written until its declaration is reached.",
      keyPoints: [
        "All declarations (var, let, const, function, class) are hoisted during execution context creation.",
        "var is initialized to undefined; let and const are left uninitialized in the TDZ.",
        "Accessing a TDZ variable throws a ReferenceError — including the typeof operator.",
        "TDZ is temporal (based on execution time order), not purely spatial (code line position)."
      ],
      closingImpression: "TDZ guarantees that const variables are never observed without their assigned value and turns silent undefined bugs into clear runtime exceptions.",
      analogies: ["Like reserving a table at a restaurant: your name is on the reservation book (hoisted), but you cannot sit or eat until your reserved time arrives (initialization)."]
    },
    commonMistakes: [
      {
        mistake: "Saying 'let and const are not hoisted at all'.",
        why: "If let was not hoisted, accessing a variable shadowed in an inner block would read the outer variable. Instead, it throws ReferenceError because the inner let IS hoisted and shadows the outer scope.",
        correct: "Explain that let is hoisted to block scope, but remains in the uninitialized TDZ state until evaluated."
      }
    ],
    followUpDeepDive: [
      {
        question: "Explain why TDZ is called 'Temporal' rather than 'Spatial'.",
        answer: "TDZ is called 'temporal' because it depends on the order of execution in time, not line placement in code. For example:\n```javascript\nfunction test() {\n  const fn = () => console.log(x); // Line 2: declared before x\n  let x = 10;                      // Line 3: x initialized\n  fn();                            // Line 4: executes AFTER Line 3 -> Valid!\n}\n```\nHere `fn` appears above `let x` spatially, but because it is invoked temporally after `let x` evaluates, it executes without error.",
        specReference: "ECMA-262 §14.3.1 Let and Const Declarations Static Semantics"
      }
    ]
  },

  "tdz-medium": {
    interviewCrossQuestions: [
      {
        question: "Why does function foo(a = b, b = 2) {} throw ReferenceError when invoked as foo()?",
        answer: "ECMA-262 §10.2.11 specifies that function parameters evaluate from left to right inside an intermediate Parameter Environment Record. When `a = b` evaluates, `b` has been declared in the parameter scope but has not yet evaluated its default expression (`b = 2`). Therefore, `b` is in the TDZ and reading it produces a ReferenceError.",
        difficulty: "intermediate",
        whyAsked: "Tests understanding of parameter scope evaluation order and TDZ boundaries."
      },
      {
        question: "What happens if you invoke foo(undefined, 5)? Does it still throw?",
        answer: "Yes, it still throws! Passing `undefined` triggers the default parameter evaluation for `a`, which attempts to read `b = b`. Because `b` has not yet been assigned in the left-to-right evaluation sequence, it throws ReferenceError regardless of the second argument's presence.",
        difficulty: "advanced",
        whyAsked: "Probes edge cases regarding default parameter trigger conditions."
      },
      {
        question: "Do function parameters share the exact same scope as the function body?",
        answer: "No! When a function uses default parameters, rest parameters, or destructured parameters, ECMAScript creates TWO separate environment records: 1) Parameter Environment Record (created first), and 2) Body Variable Environment Record. A `var x` in the function body does NOT overwrite parameter `x` during parameter initialization.",
        difficulty: "advanced",
        whyAsked: "High-level spec question that separates senior architects from standard developers."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Configurable Component Prop Defaults",
        description: "Functions accepting computed options (e.g. `(width, height = width * 1.5)`) safely derive subsequent parameters from previously initialized parameters to the left.",
        companies: "Tailwind UI, Material UI",
        codeSnippet: "function createBox(width = 100, height = width * 2) { return { width, height }; }"
      },
      {
        scenario: "Dependency Injection Resolvers",
        description: "DI containers validate topological parameter order to prevent circular constructor dependencies that trigger TDZ deadlocks.",
        companies: "NestJS, Angular",
        codeSnippet: "constructor(authService, logger = authService.getLogger()) {}"
      }
    ],
    howToExplain: {
      opening: "Parameter scope initializes left-to-right in an independent declarative environment record, enforcing TDZ rules for default expressions referencing adjacent parameters.",
      keyPoints: [
        "Default parameters evaluate sequentially from index 0 to N-1.",
        "A parameter can safely reference any initialized parameter to its left.",
        "Referencing a parameter to its right throws a ReferenceError because the target is still in the TDZ.",
        "Parameter scopes form an intermediate environment between outer scope and function body scope."
      ],
      closingImpression: "Recognizing that parameter evaluation order enforces TDZ boundaries prevents subtle initialization bugs in complex function signatures.",
      analogies: ["An assembly line: worker B can use the part worker A just assembled, but worker A cannot grab the part worker B hasn't touched yet."]
    },
    commonMistakes: [
      {
        mistake: "Assuming parameters and local function body variables share a single flat scope when defaults are present.",
        why: "ECMAScript specifies an isolated Parameter Scope whenever non-simple parameter lists (defaults, destructuring, rest) are used.",
        correct: "Clarify that default parameters instantiate an intermediate Parameter Environment Record before the body record is created."
      }
    ],
    followUpDeepDive: [
      {
        question: "What is the difference between simple and non-simple parameter lists regarding 'use strict'?",
        answer: "In ES2016+, if a function has a non-simple parameter list (default values, destructuring, rest parameters), it is an early SyntaxError to include `'use strict'` directive inside the function body. This is because the parameters must evaluate BEFORE the body is parsed, meaning the engine would not know whether to evaluate the parameters in strict mode until after parsing them.",
        specReference: "ECMA-262 §15.1 Static Semantics: Early Errors for FunctionDeclaration"
      }
    ]
  },

  "tdz-hard": {
    interviewCrossQuestions: [
      {
        question: "How do class declarations behave regarding hoisting and the Temporal Dead Zone?",
        answer: "Class declarations in JavaScript behave exactly like `let` declarations: they ARE hoisted to the top of their block, but remain in the TDZ until the class declaration statement evaluates. Attempting to instantiate a class (`new MyClass()`) before its declaration line throws `ReferenceError: Cannot access 'MyClass' before initialization`, even though class methods are defined.",
        difficulty: "intermediate",
        whyAsked: "Many candidates falsely assume classes hoist like function declarations."
      },
      {
        question: "What are the Annex B.3.3 web legacy semantics for block-level function declarations?",
        answer: "In ES5 and sloppy (non-strict) mode, function declarations inside blocks (`if (cond) { function foo() {} }`) had browser-dependent undefined behavior. ES6 standardized Annex B.3.3: the function declaration creates a block-scoped binding hoisted to the block, BUT ALSO hoists a `var` binding to the enclosing function/global scope which receives the function value only when the block executes. In strict mode, function declarations are strictly block-scoped without outer pollution.",
        difficulty: "advanced",
        whyAsked: "Tests knowledge of the darkest compatibility corners of the ECMAScript specification."
      },
      {
        question: "Why does class Sub extends Super {} place Super in the TDZ?",
        answer: "In a class `extends` clause, the superclass expression evaluates in the outer scope during class definition. If `Super` is declared with `let`/`class` below `Sub`, the extends expression evaluates `Super` while it is in the TDZ, resulting in a ReferenceError before the class body is even interpreted.",
        difficulty: "advanced",
        whyAsked: "Tests understanding of class inheritance evaluation order."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Module Bundler AST Transformations (Webpack / Rollup)",
        description: "Bundlers hoisting imported class and function declarations rewrite scopes to prevent cyclic dependency evaluation from hitting TDZ ReferenceErrors.",
        companies: "Webpack, Vite, Rollup",
        codeSnippet: "// Transpiled code places variable declarations at top with safe initializers"
      },
      {
        scenario: "Safe Sandboxed Code Evaluators",
        description: "Web IDEs (CodeSandbox, StackBlitz) run user-submitted code in sandboxed scopes that trap TDZ reference errors to display clean inline editor diagnostic markers.",
        companies: "CodeSandbox, Replit",
        codeSnippet: "try { evaluate(userCode); } catch (e) { if (e instanceof ReferenceError) markLine(e); }"
      }
    ],
    howToExplain: {
      opening: "Class declarations and complex block-scoped constructs obey strict TDZ semantics, differentiating them from legacy function declarations.",
      keyPoints: [
        "Classes are never hoisted like function declarations; they behave like let bindings in the TDZ.",
        "Function declarations in strict mode are block-scoped; in sloppy mode they follow Annex B legacy dual-hoisting.",
        "Class extends clauses evaluate the superclass expression in the TDZ of the super identifier.",
        "Sandboxed evaluation engines isolate these errors to prevent parent process crashes."
      ],
      closingImpression: "Mastering TDZ boundaries across classes, modules, and legacy block semantics is vital when debugging bundler output and circular dependency crashes.",
      analogies: ["A blueprint vs a building: a function declaration is a prefabricated building dropped in instantly; a class is a blueprint that must be formally registered before you can enter."]
    },
    commonMistakes: [
      {
        mistake: "Assuming class Foo {} hoists like function Foo() {}.",
        why: "Classes were deliberately specified in ES6 to follow let/const TDZ semantics to prevent calling constructors before prototype definitions are finalized.",
        correct: "State clearly that class declarations are hoisted into the TDZ and throw ReferenceError if accessed early."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does new.target behave in static class initialization blocks (ES2022)?",
        answer: "In ES2022 static initialization blocks (`static { ... }`), `new.target` is `undefined` because the block evaluates during class definition, not during instantiation. Variables declared with `let`/`const` inside static blocks are block-scoped to that initialization block, with their own TDZ.",
        specReference: "ECMA-262 §15.7 Class Definitions Static Initializer Blocks"
      }
    ]
  },

  "this-basic": {
    interviewCrossQuestions: [
      {
        question: "How is the value of 'this' determined in a standard JavaScript function?",
        answer: "'this' is NOT determined by where a function is declared, but by HOW it is called (the Call-Site). There are 4 fundamental rules evaluated in order: 1) `new` binding: points to newly created instance. 2) Explicit binding: `.call()`, `.apply()`, `.bind()`. 3) Implicit binding: called as method on an object `obj.method()`. 4) Default binding: `undefined` in strict mode, or `globalThis` (window/global) in non-strict mode.",
        difficulty: "basic",
        whyAsked: "The universal baseline check for JavaScript developer competency."
      },
      {
        question: "Why does extracting a method `const fn = obj.method; fn();` lose its 'this' binding?",
        answer: "In the specification (ECMA-262 §13.3.7), property access `obj.method` produces an intermediate Reference Record `{ base: obj, name: 'method' }`. When invoked directly as `obj.method()`, the call operator uses the `base` property as `this`. However, when assigned to a variable `fn = obj.method`, the `GetValue()` algorithm strips the Reference Record, leaving `fn` as a bare function reference. Calling `fn()` triggers Default Binding (`undefined` or global).",
        difficulty: "intermediate",
        whyAsked: "Tests understanding of the underlying ECMAScript Reference Type mechanism."
      },
      {
        question: "How do arrow functions handle 'this' differently from standard functions?",
        answer: "Arrow functions do NOT have their own `this` binding at all (they lack an internal `[[ThisValue]]` slot). Instead, they treat `this` as a standard lexical variable, resolving it by walking up the lexical scope chain to the enclosing function or global scope. Consequently, `.call()`, `.apply()`, or `.bind()` have ZERO effect on an arrow function's `this`.",
        difficulty: "basic",
        whyAsked: "Verifies core ES6 arrow function design principles."
      },
      {
        question: "What happens when you pass an object method as a callback to an event listener or setTimeout?",
        answer: "The receiving API (e.g. `setTimeout(obj.method, 100)`) receives only a reference to the underlying function, detaching it from the object. When the timer fires, the function is invoked with default binding (`this = window` or `undefined`). You must preserve context using `obj.method.bind(obj)` or an arrow wrapper `() => obj.method()`.",
        difficulty: "basic",
        whyAsked: "Most common practical source of 'cannot read property of undefined' errors in web development."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "React Class Component Event Handlers",
        description: "Before functional components and hooks, event handlers passed to JSX required explicit binding in the constructor (`this.handleClick = this.handleClick.bind(this)`) to preserve component state access.",
        companies: "Meta, Legacy React Codebases",
        codeSnippet: "constructor(props) { super(props); this.handleClick = this.handleClick.bind(this); }"
      },
      {
        scenario: "DOM Event Delegation Listeners",
        description: "Binding an event listener to a parent list element while retaining access to a Controller instance requires explicit context binding.",
        companies: "Vanilla JS, jQuery, Backbone",
        codeSnippet: "this.el.addEventListener('click', this.onClick.bind(this));"
      }
    ],
    howToExplain: {
      opening: "'this' in JavaScript is an execution-time binding determined strictly by the call-site invocation pattern, not lexical declaration position (except for arrow functions).",
      keyPoints: [
        "Four call-site rules govern this: new operator, explicit call/apply/bind, implicit receiver object, and default global/undefined.",
        "Passing methods as callbacks strips the object Reference Record, causing this to revert to default binding.",
        "Arrow functions have no this binding; they resolve this lexically from their enclosing scope.",
        "Hard-binding via .bind() returns an exotic bound function object that permanently pins this."
      ],
      closingImpression: "Remembering that 'this' is determined at invocation time while closures are determined at definition time is the key distinction in JavaScript scope mechanics.",
      analogies: ["'this' is like a pronoun ('it' or 'he'): what 'it' refers to depends entirely on what subject preceded it in the sentence."]
    },
    commonMistakes: [
      {
        mistake: "Thinking 'this' points to the function itself or its lexical scope.",
        why: "'this' never points to the function's own lexical scope. It is strictly a receiver binding provided by the caller.",
        correct: "Clarify that this is an execution context receiver determined by how the function was invoked."
      }
    ],
    followUpDeepDive: [
      {
        question: "What is an Exotic Bound Function Object according to ECMA-262?",
        answer: "When `Function.prototype.bind()` is called, the engine creates an Exotic Bound Function Object (ECMA-262 §10.4.1). It stores internal slots: `[[BoundTargetFunction]]`, `[[BoundThis]]`, and `[[BoundArguments]]`. Its internal `[[Call]]` method unconditionally forwards calls using `[[BoundThis]]`, overriding any caller receiver.",
        specReference: "ECMA-262 §10.4.1 Bound Function Exotic Objects"
      }
    ]
  },

  "this-medium": {
    interviewCrossQuestions: [
      {
        question: "How does a custom polyfill for call/apply attach context without polluting the target object?",
        answer: "By creating a unique property on the target context using `const fnKey = Symbol('fn')` and assigning the function to it: `context[fnKey] = this`. Invoking `context[fnKey](...args)` naturally triggers the Implicit Binding rule, setting `this` to `context`. Using `Symbol()` guarantees no existing properties are overwritten, and executing inside a `try...finally` block guarantees `delete context[fnKey]` cleans up even if the function throws.",
        difficulty: "intermediate",
        whyAsked: "Tests understanding of how property invocation sets `this` under the hood."
      },
      {
        question: "What happens if context is null, undefined, or a primitive (number, string)?",
        answer: "In non-strict mode: 1) Passing `null` or `undefined` as context defaults to `globalThis` (window in browser, global in Node). 2) Passing a primitive (e.g. `42` or `'hello'`) causes JavaScript to wrap it into an object instance (`Object(42)` -> `Number` object) via boxing. In strict mode, `this` remains exactly as passed without coercion.",
        difficulty: "intermediate",
        whyAsked: "Tests knowledge of strict vs non-strict boxing and global fallback rules."
      },
      {
        question: "What is the difference between call and apply under the hood?",
        answer: "Both immediately invoke the function with a specified `this` context. The sole difference is argument formatting: `.call(thisArg, arg1, arg2...)` accepts a comma-separated argument list, while `.apply(thisArg, [argsArray])` accepts an array or array-like object. In ES6+, `fn.call(ctx, ...args)` accomplishes the same as `fn.apply(ctx, args)`.",
        difficulty: "basic",
        whyAsked: "Foundational API syntax check."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Borrowing Built-in Methods (Object.prototype.hasOwnProperty)",
        description: "Because objects created via `Object.create(null)` lack prototypes, and user objects might shadow properties (`obj.hasOwnProperty = false`), production code borrows the method safely: `Object.prototype.hasOwnProperty.call(obj, 'prop')`.",
        companies: "ESLint, TypeScript, Babel",
        codeSnippet: "const hasKey = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);"
      },
      {
        scenario: "Converting Array-Like Objects to Real Arrays",
        description: "Before `Array.from()`, legacy code used `Array.prototype.slice.call(arguments)` to convert function arguments or DOM NodeLists into arrays.",
        companies: "jQuery, Underscore.js",
        codeSnippet: "const args = Array.prototype.slice.call(arguments);"
      }
    ],
    howToExplain: {
      opening: "Implementing custom `call` and `apply` demonstrates how JavaScript's implicit property invocation rules can be harnessed to achieve explicit context binding.",
      keyPoints: [
        "A function invoked via `obj[key]()` has its `this` bound to `obj` via the Reference Record base.",
        "Using `Symbol()` prevents naming collisions with existing object properties.",
        "A `try...finally` block guarantees cleanup of the temporary property even on abrupt error completion.",
        "Non-strict mode requires boxing primitive contexts into objects and falling back to `globalThis`."
      ],
      closingImpression: "Method borrowing via `.call` remains the standard defensive technique for calling Object.prototype methods safely on untrusted input.",
      analogies: ["Like temporarily clipping a name badge onto a visitor's shirt so they can enter the building as a member, and unclipping it as they leave."]
    },
    commonMistakes: [
      {
        mistake: "Using a hardcoded string like context.__fn__ = this.",
        why: "Hardcoded string keys can overwrite existing object properties or cause collisions in concurrent operations.",
        correct: "Always use Symbol('fn') to guarantee key uniqueness."
      }
    ],
    followUpDeepDive: [
      {
        question: "Why was Object.hasOwn() introduced in ES2022 to replace Object.prototype.hasOwnProperty.call?",
        answer: "Calling `Object.prototype.hasOwnProperty.call(obj, 'prop')` is verbose and cumbersome. ES2022 introduced `Object.hasOwn(obj, 'prop')` as a direct static method. It avoids walking the prototype chain to lookup `hasOwnProperty` and works seamlessly on null-prototype objects without method borrowing.",
        specReference: "ECMA-262 §20.1.2.13 Object.hasOwn"
      }
    ]
  },

  "this-hard": {
    interviewCrossQuestions: [
      {
        question: "When a function returned by bind() is called with the 'new' operator, what happens to the bound this?",
        answer: "When a bound function is invoked with `new` (`new boundFn()`), the originally bound `this` argument is completely IGNORED! Instead, a new object is created and its prototype is linked to the target constructor's prototype (`targetFn.prototype`). Any curried arguments passed to `bind()` are still prepended to the constructor invocation.",
        difficulty: "advanced",
        whyAsked: "The gold standard question for Function.prototype.bind polyfills (ECMA-262 §10.4.1.1)."
      },
      {
        question: "How does a bind polyfill detect if it was invoked via 'new' vs standard invocation?",
        answer: "Inside the bound function wrapper, check `this instanceof boundFn` (or in modern JS, `new.target`). If `this instanceof boundFn` is true, the function was invoked as a constructor via `new`, so you use `this` (the newly allocated instance). Otherwise, you use the closed-over `boundThis`.",
        difficulty: "advanced",
        whyAsked: "Tests understanding of constructor instantiation semantics and prototype chain checking."
      },
      {
        question: "How do you ensure 'instanceof targetFn' still returns true for instances created from the bound function?",
        answer: "You must establish a prototype chain between the bound function and the original target function. By setting `boundFn.prototype = Object.create(targetFn.prototype)`, any object constructed with `new boundFn()` inherits from `targetFn.prototype`, ensuring `instance instanceof targetFn` evaluates to true.",
        difficulty: "advanced",
        whyAsked: "Tests precision in prototypal inheritance wiring."
      },
      {
        question: "Can you re-bind a function that has already been bound with .bind()?",
        answer: "No! Once a function is bound via `const b = fn.bind(objA)`, calling `b.bind(objB)` will NOT change `this`. The exotic bound function object wraps the original function and always forwards `objA` as `[[BoundThis]]`. However, secondary calls to `.bind()` can still curry additional arguments.",
        difficulty: "intermediate",
        whyAsked: "Tests awareness of the immutability of bound function context."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Functional Currying and Dependency Injection",
        description: "Services pre-bind configuration dependencies or database handles at application startup, distributing clean parameterless action triggers to handlers.",
        companies: "Koa, Express, Redux",
        codeSnippet: "const logInfo = logger.log.bind(logger, 'INFO');"
      },
      {
        scenario: "Class-like Constructor Hardening",
        description: "Library authors bind constructors to ensure instances created without `new` still instantiate the correct prototype without breaking.",
        companies: "Moment.js, Chart.js",
        codeSnippet: "function Chart(config) { if (!(this instanceof Chart)) return new Chart(config); }"
      }
    ],
    howToExplain: {
      opening: "A specification-compliant `bind` polyfill must handle two major responsibilities: partial application (currying) and constructor override behavior when invoked with the `new` operator.",
      keyPoints: [
        "bind returns an exotic function enclosing boundThis and prepended bound arguments.",
        "When invoked normally, it dispatches targetFn.apply(boundThis, allArgs).",
        "When invoked with new, boundThis is discarded in favor of the newly constructed this instance.",
        "The prototype chain must link boundFn.prototype to Object.create(targetFn.prototype) to preserve instanceof checks."
      ],
      closingImpression: "The fact that the `new` operator overrides a bound `this` proves that constructor instantiation is the highest priority rule in JavaScript's call-site hierarchy.",
      analogies: ["Like a VIP pass: the bound this lets you into the club under your sponsor's name, but if you buy the club (new operator), your sponsor's name no longer matters — you own the room."]
    },
    commonMistakes: [
      {
        mistake: "Simply returning (...args) => target.apply(boundThis, [...boundArgs, ...args]).",
        why: "Arrow functions cannot be constructed with new! Using an arrow function throws 'TypeError: bound is not a constructor' when someone executes new boundFn().",
        correct: "You must use a standard function declaration with prototype inheritance to support the new operator."
      }
    ],
    followUpDeepDive: [
      {
        question: "What does ECMA-262 specify regarding the .length and .name properties of a bound function?",
        answer: "Per ECMA-262 §20.2.3.2, a bound function has a `.length` equal to `Math.max(0, target.length - boundArgs.length)` (representing remaining expected parameters). Its `.name` property is prefixed with 'bound ' (e.g. `'bound ' + target.name`).",
        specReference: "ECMA-262 §20.2.3.2 Function.prototype.bind properties"
      }
    ]
  }
};
