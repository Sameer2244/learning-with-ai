// Comprehensive Interview Cross-Questions & Deep Preparation Data
// Domain: Advanced JavaScript Internals (18 Questions)
// Topics: GC, Proxy/Reflect, Iterators/Generators, V8 Hidden Classes, Binary Buffers, Modules

module.exports = {
  "gc-weakmap-cache-basic": {
    interviewCrossQuestions: [
      {
        question: "Why do WeakMaps hold keys weakly, and why can primitives NOT be WeakMap keys?",
        answer: "A `WeakMap` holds 'weak' references to its keys, meaning an object's presence as a WeakMap key does NOT count as a reachability path for V8's Garbage Collector. If no other live references to the key object exist, V8 reclaims the object and silently removes the key-value pair from the WeakMap. Primitives (strings, numbers) cannot be keys because primitives are immutable values that do not have distinct object identities and are never garbage collected.",
        difficulty: "intermediate",
        whyAsked: "Tests understanding of garbage collection reachability graphs and memory retention."
      },
      {
        question: "Why is WeakMap non-iterable (no .keys(), no .size, no for...of)?",
        answer: "Because garbage collection is non-deterministic! If WeakMap exposed `.size` or `.keys()`, the number of elements returned would depend on the unpredictable timing of when V8's GC runs (Scavenger / Mark-Sweep). To preserve deterministic language execution semantics, WeakMap hides enumeration entirely.",
        difficulty: "advanced",
        whyAsked: "Checks understanding of language design invariants regarding GC non-determinism."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "DOM Node Metadata Associated Storage",
        description: "Storing custom component metadata or event handlers associated with DOM elements without leaking memory when elements are removed from the DOM.",
        companies: "jQuery, Google Closure Library, Web Components",
        codeSnippet: "const nodeMeta = new WeakMap(); nodeMeta.set(domElement, { clicks: 0 });"
      },
      {
        scenario: "Private State in ES6 Classes",
        description: "Before private fields (#field), WeakMap was the standard pattern for truly private instance variables.",
        companies: "Babel, TypeScript transpilers",
        codeSnippet: "const privates = new WeakMap(); class User { constructor() { privates.set(this, { password: 'secret' }); } }"
      }
    ],
    howToExplain: {
      opening: "WeakMap associates ephemeral metadata with object keys without preventing garbage collection, eliminating memory leaks when target objects are discarded.",
      keyPoints: [
        "Keys must be objects; values can be arbitrary types.",
        "Keys are held weakly: if no external references remain, entries are garbage collected.",
        "Non-iterable by design to prevent non-deterministic GC timing exposure.",
        "The standard mechanism for DOM metadata association and private state."
      ],
      closingImpression: "WeakMap is the only data structure in JavaScript that coordinates directly with the engine's garbage collection lifecycle.",
      analogies: ["A coat check ticket: if the person leaves the venue forever without their coat, the coat check tag becomes meaningless and the locker is emptied automatically."]
    },
    commonMistakes: [
      {
        mistake: "Attempting to use a string or number as a WeakMap key.",
        why: "WeakMap keys must be objects; passing a primitive throws TypeError: Invalid value used as weak map key.",
        correct: "Use Map for primitives, or WeakMap strictly for object instances."
      }
    ],
    followUpDeepDive: [
      {
        question: "What is an Ephemeron in computer science and how does WeakMap implement it?",
        answer: "An Ephemeron is a key-value pair where the value is reachable if and only if the key is reachable. Even if the value contains a reference back to the key (a cycle), V8's GC recognizes that the key is unreachable from roots and reclaims both.",
        specReference: "Barry Hayes: Ephemerons: A New Mechanism for Weak Associates (1997)"
      }
    ]
  },

  "gc-weakref-registry-medium": {
    interviewCrossQuestions: [
      {
        question: "What is the difference between WeakRef and FinalizationRegistry?",
        answer: "`WeakRef` allows holding a weak reference to an object while still allowing dereferencing it via `.deref()` (which returns the object if still alive, or `undefined` if collected). `FinalizationRegistry` allows registering a cleanup callback that executes AFTER an object has been reclaimed by the garbage collector.",
        difficulty: "intermediate",
        whyAsked: "Tests understanding of ES2021 advanced memory management APIs."
      },
      {
        question: "Why should FinalizationRegistry callbacks NEVER be relied upon for critical business logic?",
        answer: "The ECMAScript specification explicitly gives zero timing guarantees for finalizers. A finalizer might run after seconds, hours, or NEVER (e.g. if the process exits before a GC pass). It should only be used for secondary resource cleanup (like closing background buffer handles), never for transactional logic.",
        difficulty: "advanced",
        whyAsked: "Tests safety and reliability discernment."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Image and Texture Memory Caching",
        description: "Caching large image bitmaps via WeakRef: the cache returns the image if in memory, but allows V8 to reclaim the memory under heavy heap pressure.",
        companies: "Figma, Canvas Engines",
        codeSnippet: "const ref = cache.get(id); if (ref && ref.deref()) return ref.deref();"
      }
    ],
    howToExplain: {
      opening: "WeakRef and FinalizationRegistry (ES2021) provide low-level memory inspection, allowing caches to retain references without preventing GC and trigger cleanup hooks.",
      keyPoints: [
        "WeakRef.deref() returns the object if alive, or undefined if collected.",
        "FinalizationRegistry runs callbacks after objects are garbage collected.",
        "Provides memory-sensitive cache eviction under high heap pressure.",
        "Must be used conservatively due to GC non-determinism."
      ],
      closingImpression: "WeakRef allows building memory-sensitive caches that naturally yield RAM during high memory pressure.",
      analogies: ["A library book on reserve: you can check if it's still on the shelf (deref); if someone took it, you order a new copy."]
    },
    commonMistakes: [
      {
        mistake: "Relying on FinalizationRegistry to close database transactions.",
        why: "GC timing is completely non-deterministic; the transaction might remain open indefinitely.",
        correct: "Use explicit try...finally cleanup blocks for critical resources."
      }
    ],
    followUpDeepDive: [
      {
        question: "What is the 'Held Value' in FinalizationRegistry and why must it NOT reference the target object?",
        answer: "The held value is passed to the finalizer callback. If the held value itself holds a strong reference to the target object, the object will NEVER be garbage collected (a circular uncollectable leak).",
        specReference: "ECMA-262 §26.2 FinalizationRegistry Objects"
      }
    ]
  },

  "gc-cycle-detector-hard": {
    interviewCrossQuestions: [
      {
        question: "Can modern JavaScript Garbage Collectors collect circular references?",
        answer: "YES! Modern engines (V8, SpiderMonkey, JSC) use 'Mark-and-Sweep' and 'Tri-color Marking' algorithms based on REACHABILITY from GC roots (Global object, Call Stack, active timers). If two detached objects reference each other (`A.next = B; B.prev = A`) but have no active path from GC roots, the GC marks them as unreachable and sweeps both into free memory. The old 'Reference Counting' leak myth only applied to legacy IE6/7 COM objects.",
        difficulty: "advanced",
        whyAsked: "Tests whether candidate understands modern tracing garbage collectors vs obsolete reference counting."
      },
      {
        question: "What are the Generational GC spaces in V8 (Scavenger vs Mark-Sweep)?",
        answer: "V8 divides heap memory into two generations based on the 'Weak Generational Hypothesis' (most objects die young): 1) New Space (Young Generation): small (1-64MB), managed by the high-speed Cheney 'Scavenger' collector using semi-spaces. Surviving objects are promoted. 2) Old Space (Old Generation): large, managed by the 'Major GC' (Mark-Sweep-Compact), which performs incremental marking, concurrent sweeping, and memory compaction.",
        difficulty: "advanced",
        whyAsked: "The gold standard V8 memory internals question."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Detecting Detached DOM Node Leaks",
        description: "Memory profiling tools detect DOM elements removed from the document tree that are still retained by JavaScript closure references.",
        companies: "Chrome DevTools Memory Profiler",
        codeSnippet: "// Detached HTMLButtonElement retained by window.buttonRef"
      }
    ],
    howToExplain: {
      opening: "Modern V8 garbage collection is a generational tracing collector that evaluates object reachability from roots, naturally reclaiming circular references that lack root connections.",
      keyPoints: [
        "Reachability determines collection, not reference counting.",
        "Unrooted circular references are reclaimed safely by Mark-and-Sweep.",
        "Generational collection splits memory into Young (Scavenger) and Old (Mark-Sweep) spaces.",
        "Detached DOM nodes retained by long-lived closures are the #1 source of real-world leaks."
      ],
      closingImpression: "Circular references do not leak in modern JavaScript; un-severed root references do.",
      analogies: ["An island that drifts away from the mainland: even if the towns on the island have bridges connecting each other, nobody on the mainland can reach the island, so the whole island is forgotten."]
    },
    commonMistakes: [
      {
        mistake: "Claiming that setting objA.ref = null and objB.ref = null is required to prevent circular leaks in modern JS.",
        why: "Modern mark-and-sweep collectors collect detached cycles automatically.",
        correct: "Clarify that severing the reference from the ROOT (window or long-lived scope) is what matters."
      }
    ],
    followUpDeepDive: [
      {
        question: "What is Tri-Color Marking in V8's Major GC?",
        answer: "Objects are colored: 1) White: unvisited (candidates for collection). 2) Grey: visited, but child pointers not yet scanned. 3) Black: visited and all child pointers scanned. V8 incrementally scans grey objects concurrently on background threads to avoid main-thread freeze pauses.",
        specReference: "V8 Dev Blog: Trash talk: the Orinoco garbage collector"
      }
    ]
  },

  "proxy-negative-index-basic": {
    interviewCrossQuestions: [
      {
        question: "How does Proxy [[Get]] intercept numeric array indexing?",
        answer: "When `array[-1]` is evaluated, the runtime passes property key `'-1'` (as a string) to the Proxy's `get(target, prop, receiver)` trap. The trap converts `prop` to a number: if negative, it computes `target.length + Number(prop)` and retrieves the corresponding element from `target`.",
        difficulty: "intermediate",
        whyAsked: "Tests understanding of Proxy property trap mechanics and Python-style indexing."
      },
      {
        question: "Why was Array.prototype.at() introduced in ES2022 instead of changing array[-1] natively?",
        answer: "In JavaScript, arrays are objects where `arr['-1']` has always meant accessing an object property with string key `'-1'`. Changing `arr[-1]` natively would break backward compatibility with legacy web code that stored negative or custom properties on arrays. `arr.at(-1)` provides clean negative indexing without breaking property access semantics.",
        difficulty: "intermediate",
        whyAsked: "Tests web compatibility and language evolution history."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Python-Style Array Slicing & Access in Data Libraries",
        description: "Math and matrix libraries providing intuitive negative array index lookups.",
        companies: "Danfo.js, TensorFlow.js",
        codeSnippet: "const arr = createNegativeArray([10, 20, 30]); arr[-1]; // 30"
      }
    ],
    howToExplain: {
      opening: "A Proxy intercepts fundamental language operations on an object via traps, allowing custom behaviors like negative index normalization.",
      keyPoints: [
        "Proxy get trap intercepts property reads.",
        "Converts negative numeric strings to length-offset indices.",
        "Uses Reflect.get to forward valid property access cleanly.",
        "Demonstrates metaprogramming capabilities in modern ECMAScript."
      ],
      closingImpression: "Proxies allow reshaping standard language behavior to create domain-specific ergonomics.",
      analogies: ["A security guard at a building: instead of walking directly into an office, every visitor must state their business to the guard, who decides how to route them."]
    },
    commonMistakes: [
      {
        mistake: "Forgetting that property names in get traps are always strings or symbols.",
        why: "`arr[-1]` passes prop as string `'-1'`, not number `-1`.",
        correct: "Always parse or convert prop to a number before checking `< 0`."
      }
    ],
    followUpDeepDive: [
      {
        question: "What is the performance overhead of wrapping arrays in Proxies?",
        answer: "Proxy property accesses cannot be inlined by V8's TurboFan compiler, bypassing Monomorphic Inline Caches and running ~10x-50x slower in tight numeric loops than raw array indexing.",
        specReference: "V8 Optimization Guide: Proxy trap performance costs"
      }
    ]
  },

  "proxy-reactive-observable-medium": {
    interviewCrossQuestions: [
      {
        question: "How does Vue 3 use Proxies to achieve fine-grained reactivity compared to Vue 2's Object.defineProperty?",
        answer: "Vue 2 used `Object.defineProperty`, which required recursively walking object properties at initialization time to define getters/setters, failing to detect dynamically added properties or array index mutations (`arr[0] = x`). Vue 3 wraps objects in a `Proxy`, which intercepts property reads (`get`) for automatic dependency tracking and property writes (`set`) for update triggers, supporting dynamic properties and arrays with zero pre-walk overhead.",
        difficulty: "advanced",
        whyAsked: "Universal frontend framework architecture question."
      },
      {
        question: "Why should you always use Reflect inside Proxy traps instead of target[prop] = value?",
        answer: "1) `Reflect.set()` returns a boolean indicating success/failure instead of throwing in strict mode. 2) Passing `receiver` (`Reflect.get(target, prop, receiver)`) ensures that getters on prototype chains have their `this` correctly bound to the proxy instance, preserving reactive tracking across inherited properties.",
        difficulty: "advanced",
        whyAsked: "Tests deep mastery of Proxy invariants and the Reflect API."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Vue 3 Reactive System (reactive() & ref())",
        description: "The core reactive state engine powering Vue 3, VitePress, and Nuxt 3.",
        companies: "Vue.js Core, Nuxt",
        codeSnippet: "const state = reactive({ count: 0 });"
      },
      {
        scenario: "Immer.js Copy-on-Write State Immutability",
        description: "Immer records mutations made on a temporary Proxy draft and produces a frozen immutable next state tree.",
        companies: "Redux Toolkit, React Flow",
        codeSnippet: "const nextState = produce(baseState, draft => { draft.user.age++; });"
      }
    ],
    howToExplain: {
      opening: "A reactive Proxy intercepts get and set operations to automatically track which UI components depend on specific properties and notify them upon mutation.",
      keyPoints: [
        "get trap collects active effect dependencies (track).",
        "set trap triggers registered listener callbacks (trigger).",
        "Reflect ensures proper prototype receiver binding.",
        "Replaces Object.defineProperty with superior performance and array support."
      ],
      closingImpression: "Proxy-based reactivity is the foundation of modern declarative frameworks including Vue 3, MobX, and Solid.js.",
      analogies: ["A smart doorbell: ringing it (get) writes your name on the visitor list; dropping off a package (set) sounds the chime to notify the homeowner."]
    },
    commonMistakes: [
      {
        mistake: "Failing to return true from the set trap.",
        why: "In strict mode, a Proxy set trap returning false (or undefined) throws a TypeError: 'set' on proxy: trap returned falsish.",
        correct: "Always return `true` or `Reflect.set(...)` from set traps."
      }
    ],
    followUpDeepDive: [
      {
        question: "What are Proxy Invariants in ECMA-262?",
        answer: "Proxy traps cannot violate underlying target invariants: for example, if a target property is non-configurable and non-writable, the proxy `get` trap MUST return the exact same value as the target, or the engine throws a TypeError.",
        specReference: "ECMA-262 §10.5.8 [[Get]] Invariants"
      }
    ]
  },

  "proxy-schema-validator-hard": {
    interviewCrossQuestions: [
      {
        question: "What is a Revocable Proxy and what is its security use case?",
        answer: "Created via `Proxy.revocable(target, handler)`, it returns `{ proxy, revoke }`. When `revoke()` is called, the proxy is permanently disconnected from the target. Any future operation on the proxy immediately throws a `TypeError`. It is used in sandboxes to grant temporary access to capabilities (like file handles or credentials) and revoke them once the operation completes.",
        difficulty: "advanced",
        whyAsked: "Tests advanced security sandboxing knowledge."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Salesforce LWC Locker Service Sandboxing",
        description: "Sandboxing third-party JavaScript widgets to prevent unauthorized DOM and global access in enterprise CRM platforms.",
        companies: "Salesforce, Google Caja",
        codeSnippet: "const { proxy, revoke } = Proxy.revocable(api, handler); runUserCode(proxy); revoke();"
      }
    ],
    howToExplain: {
      opening: "Enforced schema validators use Proxies to validate types at runtime on property assignment, while revocable proxies allow permanent permission revocation.",
      keyPoints: [
        "set trap validates incoming values against schema contracts before assignment.",
        "Throws descriptive errors immediately on invalid assignments.",
        "Proxy.revocable provides a kill switch for sandboxed references.",
        "Guarantees runtime data integrity in dynamic systems."
      ],
      closingImpression: "Proxies provide defensive runtime barriers for enterprise applications handling untrusted third-party inputs.",
      analogies: ["A temporary electronic keycard: it validates your badge access level at every door, and the security desk can deactivate the card instantly at 5 PM."]
    },
    commonMistakes: [
      {
        mistake: "Allowing prototype pollution through unguarded set traps.",
        why: "Failing to check for __proto__ or constructor keys allows malicious assignments to corrupt global prototypes.",
        correct: "Block assignments to __proto__ and constructor in validator traps."
      }
    ],
    followUpDeepDive: [
      {
        question: "What happens when an operation is attempted on a revoked Proxy?",
        answer: "Per ECMA-262 §10.5, any internal method call on a revoked proxy immediately throws a `TypeError: Cannot perform operation on a revoked Proxy`.",
        specReference: "ECMA-262 §10.5.1 [[GetPrototypeOf]] on revoked proxies"
      }
    ]
  },

  "generator-fibonacci-basic": {
    interviewCrossQuestions: [
      {
        question: "How does a generator implement the Iterable protocol via Symbol.iterator?",
        answer: "A generator object is both an Iterator AND an Iterable. It implements `[Symbol.iterator]() { return this; }`. This allows a generator instance to be passed directly to `for...of` loops, spread operators (`[...gen]`), and destructuring syntax (`const [a, b] = gen`).",
        difficulty: "basic",
        whyAsked: "Tests understanding of the dual Iterable/Iterator protocol."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Infinite Sequence Generation",
        description: "Generating mathematical sequences, mock IDs, or infinite series on demand with O(1) memory overhead.",
        companies: "Simulation engines, Testing libraries",
        codeSnippet: "for (const num of fibonacci()) { if (num > 1000) break; }"
      }
    ],
    howToExplain: {
      opening: "An infinite generator produces mathematical sequences lazily, evaluating numbers on demand without allocating arrays in memory.",
      keyPoints: [
        "while(true) with yield pauses execution without blocking the thread.",
        "Implements [Symbol.iterator] returning this.",
        "Consumes O(1) memory regardless of sequence length.",
        "Consumed ergonomically via for...of loops with break conditions."
      ],
      closingImpression: "Generators turn infinite mathematical concepts into practical, memory-safe JavaScript code.",
      analogies: ["A water tap: you turn the valve to get a glass of water; the ocean doesn't flood your kitchen all at once."]
    },
    commonMistakes: [
      {
        mistake: "Using spread [...fibonacci()] on an infinite generator.",
        why: "The spread operator attempts to consume the entire sequence into an array, resulting in an infinite loop and OOM crash.",
        correct: "Always consume infinite generators with explicit bounds or break conditions."
      }
    ],
    followUpDeepDive: [
      {
        question: "How do BigInt values prevent numeric overflow in Fibonacci generators?",
        answer: "JavaScript numbers are IEEE 754 double-precision floats that lose integer precision past `Number.MAX_SAFE_INTEGER` (2^53 - 1, around Fibonacci #78). Using `0n` and `1n` BigInts allows calculating arbitrary-precision numbers.",
        specReference: "ECMA-262 §21.2 BigInt Objects"
      }
    ]
  },

  "generator-bidirectional-medium": {
    interviewCrossQuestions: [
      {
        question: "How do values passed into .next(val) get received inside a generator?",
        answer: "The argument passed to `.next(val)` becomes the return value of the `yield` expression that paused the generator: `const response = yield 'ping';`. When resumed via `.next('pong')`, `response` is assigned `'pong'`.",
        difficulty: "intermediate",
        whyAsked: "Tests bidirectional coroutine communication."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Cooperative State Machines & Game AI",
        description: "AI bot decision trees: yielding action queries to the game engine and receiving environment states back.",
        companies: "Game AI, Chatbot conversational flows",
        codeSnippet: "const decision = yield queryEnvironment();"
      }
    ],
    howToExplain: {
      opening: "Bidirectional generators establish a two-way communication channel between caller and generator, exchanging values at each yield boundary.",
      keyPoints: [
        "yield emits data outward to caller.",
        ".next(val) feeds data inward to generator.",
        ".throw(err) injects exceptions into generator try/catch.",
        "Provides true cooperative coroutine multitasking."
      ],
      closingImpression: "Bidirectional generators allow writing complex state machines as simple sequential code.",
      analogies: ["A walkie-talkie conversation: you talk and say 'over' (yield), wait for the other person to reply, and use their response to decide what to say next."]
    },
    commonMistakes: [
      {
        mistake: "Passing an argument to the very first .next() call.",
        why: "The first .next() starts the generator; there is no yield awaiting an input, so the argument is discarded.",
        correct: "Pass arguments starting on the second .next() invocation."
      }
    ],
    followUpDeepDive: [
      {
        question: "What does the generator .return(val) method do?",
        answer: "Calling `gen.return(val)` immediately terminates the generator as if a `return val` statement was evaluated at the yield point, executing any enclosing `finally` blocks before returning `{ value: val, done: true }`.",
        specReference: "ECMA-262 §27.5.3.3 Generator.prototype.return"
      }
    ]
  },

  "async-generator-pipeline-hard": {
    interviewCrossQuestions: [
      {
        question: "How does an Async Generator pipeline implement streaming backpressure?",
        answer: "An async generator does not pull or yield the next item until the consumer explicitly awaits `.next()`. If a consumer is slow (e.g. slow database writes), the upstream generator remains suspended at `yield`, pausing data reads from the source socket.",
        difficulty: "advanced",
        whyAsked: "Tests deep systems understanding of stream flow control."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Streaming ETL & CSV Export",
        description: "Exporting 5 million database rows to S3: query generator pulls 1,000 rows, transforms them, and streams to S3 multipart upload with bounded memory.",
        companies: "Stripe, Snowflake",
        codeSnippet: "for await (const chunk of etlPipeline(dbStream)) { await s3.write(chunk); }"
      }
    ],
    howToExplain: {
      opening: "Async generator pipelines combine streaming transformation stages with automatic backpressure, keeping memory bounded regardless of dataset scale.",
      keyPoints: [
        "Combines async/await with generator suspension.",
        "Naturally throttles upstream data generation to consumer speed.",
        "Handles batching, filtering, and asynchronous mapping cleanly.",
        "The standard pattern for modern stream processing in Node.js 18+."
      ],
      closingImpression: "Async streaming pipelines prevent memory exhaustion when processing datasets larger than available RAM.",
      analogies: ["A bucket brigade fighting a fire: nobody passes a bucket until the person in front is ready to catch it."]
    },
    commonMistakes: [
      {
        mistake: "Loading entire dataset into memory before starting pipeline.",
        why: "Defeats the entire purpose of streaming, risking Out-Of-Memory crashes.",
        correct: "Stream item by item or in small fixed batches."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does Node.js stream.pipeline() integrate with Async Generators?",
        answer: "Node.js `stream.pipeline` natively accepts async generators as pipeline stages: `pipeline(sourceStream, async function* (source) { ... }, destStream)`.",
        specReference: "Node.js Streams Documentation: stream.pipeline with async iterators"
      }
    ]
  },

  "v8-shape-stabilizer-basic": {
    interviewCrossQuestions: [
      {
        question: "What is a Hidden Class (Shape/Map) in V8 and why does property initialization order matter?",
        answer: "In V8, JavaScript objects do not store property keys in individual hash tables. Instead, V8 assigns each object an internal hidden class (called a `Map` or `Shape`). When properties are added, the object transitions to a new Shape. If two objects are created with properties added in different orders (`{a:1, b:2}` vs `{b:2, a:1}`), V8 creates TWO DIFFERENT hidden classes, forcing inline caches into a slow polymorphic or megamorphic state.",
        difficulty: "advanced",
        whyAsked: "High-signal performance engineering question regarding V8 JIT internals."
      },
      {
        question: "Why does the 'delete' operator deoptimize objects in V8?",
        answer: "`delete obj.prop` mutates the shape transition tree, forcing V8 to abandon fast property access and demote the object to 'Dictionary Mode' (slow hash table lookup), slowing down property access by 10x-50x.",
        difficulty: "intermediate",
        whyAsked: "Tests understanding of V8 property representation modes."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "High-Frequency Trading & Physics Engines",
        description: "Initializing particle vectors with consistent constructors to ensure monomorphic inline cache optimization in TurboFan.",
        companies: "Figma Canvas, Three.js",
        codeSnippet: "class Point { constructor(x, y) { this.x = x; this.y = y; } } // stable shape"
      }
    ],
    howToExplain: {
      opening: "V8 optimizes object property access using Hidden Classes (Shapes). Objects initialized with identical property keys in identical order share the same shape, enabling blazing-fast Monomorphic Inline Caching.",
      keyPoints: [
        "Objects share shapes when properties are initialized in the exact same order.",
        "Always initialize all properties in constructors, even with null values.",
        "Avoid using delete; assign null or undefined instead to preserve object shape.",
        "Stable shapes enable TurboFan JIT compiler to emit direct memory offset reads."
      ],
      closingImpression: "Writing shape-friendly code allows JavaScript to run at speeds approaching compiled C++.",
      analogies: ["A standard car assembly line: every car receives doors, then wheels, then paint. Changing the order for one car disrupts the whole robotic factory line."]
    },
    commonMistakes: [
      {
        mistake: "Adding properties to objects dynamically outside constructors based on conditional logic.",
        why: "Creates branching shape transition trees that turn monomorphic inline caches polymorphic.",
        correct: "Always initialize all properties in the constructor (e.g. this.prop = null)."
      }
    ],
    followUpDeepDive: [
      {
        question: "What are In-Object Properties vs Descriptor Arrays in V8?",
        answer: "V8 reserves space for initial properties directly inside the object's contiguous heap allocation ('In-Object Properties'). Properties added later overflow into an external property array, requiring an extra pointer dereference.",
        specReference: "V8 Dev Blog: Fast Properties in V8"
      }
    ]
  },

  "v8-inline-cache-simulator-medium": {
    interviewCrossQuestions: [
      {
        question: "Explain the three states of an Inline Cache (IC): Monomorphic, Polymorphic, and Megamorphic.",
        answer: "1) **Monomorphic** (1 shape observed): TurboFan inlines a direct C++ memory offset read with a single shape check (fastest, near-native CPU speed). 2) **Polymorphic** (2 to 4 shapes): the engine executes a small switch statement checking shapes linearly. 3) **Megamorphic** (5+ shapes): V8 gives up on inline caching and falls back to a global hash table lookup (slowest).",
        difficulty: "advanced",
        whyAsked: "The definitive compiler-level question for JavaScript optimization."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Framework Hot-Path Functions",
        description: "React and Lodash keep internal node descriptors monomorphic so that property reads in hot loops compile to single-cycle machine instructions.",
        companies: "Meta, Lodash, Fastify",
        codeSnippet: "function getX(point) { return point.x; } // monomorphic if point shape is stable"
      }
    ],
    howToExplain: {
      opening: "Inline Caching (IC) is V8's primary optimization for dynamic property access, caching property memory offsets at bytecode call-sites.",
      keyPoints: [
        "Monomorphic ICs cache 1 shape, achieving direct memory offset access.",
        "Polymorphic ICs handle 2-4 shapes with small branch checks.",
        "Megamorphic ICs (5+ shapes) degrade to slow dictionary lookups.",
        "Functions should accept objects with consistent shapes to stay monomorphic."
      ],
      closingImpression: "Maintaining monomorphic call-sites is the secret behind high-throughput JavaScript libraries like Fastify.",
      analogies: ["A key rack: if you only ever drive one car, you grab the single key instantly; if you drive 50 cars, you must search through a giant drawer of keys."]
    },
    commonMistakes: [
      {
        mistake: "Passing objects with varying shapes to hot utility functions.",
        why: "Quickly pushes the function's inline cache into the megamorphic state.",
        correct: "Normalize object shapes before passing them into high-frequency loops."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does TurboFan deoptimize when an IC becomes megamorphic?",
        answer: "TurboFan generates optimized machine code assuming the monomorphic shape check holds. If a new shape is encountered, the check fails (Bailout), and TurboFan deoptimizes the function back to Ignition bytecode interpretation.",
        specReference: "V8 TurboFan Compilation Pipeline: Deoptimization and Bailout"
      }
    ]
  },

  "v8-array-element-kind-hard": {
    interviewCrossQuestions: [
      {
        question: "Explain the V8 Array Elements Kinds lattice (PACKED_SMI -> HOLEY_DOUBLE).",
        answer: "V8 tracks array contents via 'Elements Kinds': 1) `PACKED_SMI_ELEMENTS`: dense array of Small Integers (-2^31 to 2^31-1). 2) `PACKED_DOUBLE_ELEMENTS`: dense array containing floating point numbers. 3) `PACKED_ELEMENTS`: dense array containing objects/strings. 4) `HOLEY_*`: contains unassigned holes (`[1, , 3]`). Transitions are strictly ONE-WAY: once an array is demoted to HOLEY or DOUBLE, it can NEVER be promoted back to PACKED_SMI!",
        difficulty: "advanced",
        whyAsked: "Top-tier V8 performance question."
      },
      {
        question: "Why are HOLEY arrays significantly slower than PACKED arrays?",
        answer: "When reading an index from a PACKED array, V8 does a simple bounds check and memory read. In a HOLEY array, if the slot is empty, V8 is forced to walk the prototype chain (`Array.prototype`, then `Object.prototype`) to verify whether a property with that numeric key was defined on the prototype!",
        difficulty: "advanced",
        whyAsked: "Connects array performance to prototype chain lookups."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Audio & Graphics Buffer Processing",
        description: "Keeping audio sample arrays in PACKED_SMI or using TypedArrays to prevent prototype chain walking during 44.1kHz audio synthesis.",
        companies: "Spotify, WebAudio engines",
        codeSnippet: "const samples = new Float32Array(1024); // natively packed"
      }
    ],
    howToExplain: {
      opening: "V8 classifies arrays into Elements Kinds based on element types and presence of holes, transitioning down a one-way lattice from fast PACKED_SMI to slow HOLEY_ELEMENTS.",
      keyPoints: [
        "PACKED_SMI is the fastest array kind (contiguous small integers).",
        "Introducing a decimal demotes to DOUBLE; an object demotes to PACKED.",
        "Creating holes (sparse arrays) forces prototype chain lookups on reads.",
        "Transitions are strictly one-way and cannot be reversed."
      ],
      closingImpression: "Avoiding holes and type mixing in arrays ensures V8 compiles array loops into vectorizable C-like loops.",
      analogies: ["A paved road: driving on a packed road is fast; driving on a road full of potholes (holes) requires stopping and checking every bump."]
    },
    commonMistakes: [
      {
        mistake: "Creating an array with new Array(3) and populating it via index: arr[0]=1, arr[2]=3.",
        why: "new Array(3) creates a HOLEY array immediately.",
        correct: "Use Array.from(), array literals, or push() to keep arrays PACKED."
      }
    ],
    followUpDeepDive: [
      {
        question: "Why are TypedArrays (Float64Array, Int32Array) immune to Elements Kind demotions?",
        answer: "TypedArrays are backed by fixed raw contiguous binary buffers (`ArrayBuffer`), having zero prototype lookup overhead and impossible hole representation.",
        specReference: "ECMA-262 §23.2 TypedArray Objects"
      }
    ]
  },

  "binary-dataview-packet-basic": {
    interviewCrossQuestions: [
      {
        question: "What is the difference between TypedArrays and DataView regarding Endianness?",
        answer: "TypedArrays (`Uint16Array`, `Int32Array`) always read and write data using the host CPU's native endianness (almost always Little-Endian on modern x86/ARM processors). `DataView` allows developers to explicitly specify endianness per operation via a boolean flag (`dataView.getUint16(byteOffset, isLittleEndian)`), which is mandatory when decoding network packets (which use Big-Endian / Network Byte Order).",
        difficulty: "intermediate",
        whyAsked: "Crucial binary protocols and networking question."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "WebSocket Binary Packet Serialization",
        description: "Encoding custom game state packets or financial market feeds with explicit headers over WebSockets.",
        companies: "Multiplayer Web Games, Trading Platforms",
        codeSnippet: "view.setUint8(0, OP_CODE); view.setUint32(1, payloadSize, false); // Big-Endian"
      }
    ],
    howToExplain: {
      opening: "DataView provides low-level, heterogeneous binary read/write access to ArrayBuffers with explicit control over endianness and byte alignment.",
      keyPoints: [
        "ArrayBuffer represents raw fixed-length binary memory.",
        "TypedArrays are homogeneous and use host-native endianness.",
        "DataView allows reading multiple types (uint8, uint16, float32) from the same buffer.",
        "Explicit endianness flag is essential for network packet protocol decoding."
      ],
      closingImpression: "DataView is the standard tool for parsing custom binary file formats and networking protocols in JavaScript.",
      analogies: ["A microscope with different lenses: the raw buffer is the slide; DataView lets you inspect 1 byte as a char, 2 bytes as a short, or 4 bytes as an int."]
    },
    commonMistakes: [
      {
        mistake: "Omitting the littleEndian flag on DataView methods.",
        why: "DataView defaults to Big-Endian when the parameter is omitted, which corrupts data when communicating with Little-Endian systems.",
        correct: "Explicitly specify true or false for the littleEndian argument."
      }
    ],
    followUpDeepDive: [
      {
        question: "What is Network Byte Order?",
        answer: "Network Byte Order is standard Big-Endian (most significant byte at lowest memory address), standardized by IP/TCP protocols.",
        specReference: "IETF RFC 1700 Network Byte Order Standard"
      }
    ]
  },

  "binary-base64-buffer-medium": {
    interviewCrossQuestions: [
      {
        question: "How does Base64 encoding map 3 binary bytes to 4 ASCII characters?",
        answer: "3 binary bytes contain 24 bits (3 * 8). Base64 partitions these 24 bits into 4 groups of 6 bits each (4 * 6 = 24). Each 6-bit value (0 to 63) maps to an ASCII character from the 64-character table (`A-Z`, `a-z`, `0-9`, `+`, `/`). Padding `=` is appended if input bytes are not a multiple of 3.",
        difficulty: "intermediate",
        whyAsked: "Tests understanding of binary arithmetic and bitwise shifting."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Data URL Image Decoding in Canvas",
        description: "Decoding Base64 data URLs (`data:image/png;base64,...`) into Uint8Array for WebGL texture uploads.",
        companies: "Three.js, Canvas Web Apps",
        codeSnippet: "const binary = base64ToUint8Array(dataUrl.split(',')[1]);"
      }
    ],
    howToExplain: {
      opening: "Base64 decodes 6-bit ASCII representations back into contiguous 8-bit binary bytes using bitwise shifting and masking.",
      keyPoints: [
        "Encodes 3 bytes (24 bits) into 4 characters (6 bits each).",
        "Bitwise shifting (<< 18, << 12, << 6) reconstructs 24-bit integers.",
        "Bitwise masking (& 0xff) extracts individual 8-bit bytes.",
        "Essential for embedding binary data in text-only JSON and HTTP payloads."
      ],
      closingImpression: "Bitwise manipulation in JavaScript operates on 32-bit integers, providing efficient binary parsing.",
      analogies: ["Re-packing 3 eight-slice pizzas into 4 six-slice boxes for easier delivery."]
    },
    commonMistakes: [
      {
        mistake: "Using atob() on Node.js without polyfill.",
        why: "Legacy Node.js lacked atob; Node 16+ added it, but Buffer.from(str, 'base64') is the native Node pattern.",
        correct: "Use Buffer.from in Node or typed bitwise decoders for portable code."
      }
    ],
    followUpDeepDive: [
      {
        question: "Why does Base64 increase data size by 33%?",
        answer: "Because 3 bytes of raw data become 4 bytes of text characters: 4 / 3 = 1.333 (a 33.3% bandwidth overhead).",
        specReference: "IETF RFC 4648 The Base16, Base32, and Base64 Data Encodings"
      }
    ]
  },

  "binary-ring-buffer-hard": {
    interviewCrossQuestions: [
      {
        question: "How does a Circular Ring Buffer achieve lockless O(1) reads and writes?",
        answer: "A Ring Buffer uses a fixed-size TypedArray with two integer pointers: `head` (read index) and `tail` (write index). Pointers advance using modulo arithmetic (`(tail + 1) % capacity`). In single-producer single-consumer scenarios, writes and reads never contend for the same memory slot, operating in lockless O(1) time without garbage collection.",
        difficulty: "advanced",
        whyAsked: "Classic systems engineering data structure question."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Web Audio Worklet Audio Streaming",
        description: "Streaming audio PCM chunks from the main thread to an AudioWorkletProcessor thread via a SharedArrayBuffer ring buffer.",
        companies: "Zoom Web, Discord Voice",
        codeSnippet: "ringBuffer.write(audioChunk); // lockless transfer"
      }
    ],
    howToExplain: {
      opening: "A circular ring buffer uses a fixed-size typed array and wrapping pointers to provide a lockless, zero-allocation FIFO queue.",
      keyPoints: [
        "Fixed-size array eliminates dynamic memory allocation and GC churn.",
        "Modulo arithmetic wraps head and tail pointers seamlessly.",
        "Distinguishes full from empty states by tracking element count.",
        "Ideal for real-time audio processing and high-frequency message streams."
      ],
      closingImpression: "Ring buffers provide deterministic latency by eliminating memory re-allocation in critical audio and networking paths.",
      analogies: ["A sushi conveyor belt: the chef places plates at the tail, customers pick plates from the head; the belt loops in a circle without needing to expand."]
    },
    commonMistakes: [
      {
        mistake: "Confusing an empty buffer with a full buffer when head === tail.",
        why: "When head === tail, the buffer could be either 100% empty or 100% full.",
        correct: "Maintain an explicit `count` variable, or leave one slot empty as a guard."
      }
    ],
    followUpDeepDive: [
      {
        question: "How do Atomics and SharedArrayBuffer enable multi-threaded ring buffers in Web Workers?",
        answer: "`SharedArrayBuffer` allows two threads to share memory. `Atomics.wait()` and `Atomics.notify()` allow the consumer thread to sleep until the producer notifies it of new data, implementing true zero-CPU thread synchronization.",
        specReference: "ECMA-262 §25.4 Atomics"
      }
    ]
  },

  "cjs-module-cache-basic": {
    interviewCrossQuestions: [
      {
        question: "How does require() caching work in CommonJS?",
        answer: "When `require(path)` is called: 1) Resolves absolute file path. 2) Checks `require.cache[resolvedPath]`. If present, returns `require.cache[resolvedPath].exports` immediately. 3) If not present, creates a fresh module object `{ id: resolvedPath, exports: {}, loaded: false }`, executes the module code inside a wrapper function, marks `loaded = true`, and returns `module.exports`.",
        difficulty: "intermediate",
        whyAsked: "Core Node.js runtime mechanics question."
      },
      {
        question: "What is the CommonJS module wrapper function?",
        answer: "Node.js wraps every CJS file in an invisible IIFE before execution: `(function(exports, require, module, __filename, __dirname) { ... });`. This is why variables declared at the top of a file are NOT global, and why `__dirname` is available.",
        difficulty: "basic",
        whyAsked: "Universal Node.js developer knowledge check."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Singleton Pattern in Backend Services",
        description: "Database connection clients export a single instantiated client: `require('./db')` returns the exact same cached instance across all controllers.",
        companies: "Node.js, Express backend services",
        codeSnippet: "module.exports = new DatabasePool();"
      }
    ],
    howToExplain: {
      opening: "CommonJS uses a synchronous module loader with an in-memory require.cache map, ensuring each module executes only once and shares its exports as singletons.",
      keyPoints: [
        "require.cache stores evaluated modules by resolved absolute path.",
        "Subsequent requires return the cached exports object in O(1) time.",
        "Modules are wrapped in an invisible function providing exports, require, module.",
        "Deleting require.cache[path] forces re-execution on next require."
      ],
      closingImpression: "CommonJS module caching provides effortless singleton patterns across large Node.js architectures.",
      analogies: ["A library lending desk: the first person to ask for a book triggers the librarian buying it; everyone else borrows the same book from the shelf."]
    },
    commonMistakes: [
      {
        mistake: "Reassigning exports = {} instead of module.exports = {}.",
        why: "exports is just a variable pointing to module.exports. Reassigning exports breaks the reference, leaving module.exports empty.",
        correct: "Always assign to `module.exports = ...` or mutate `exports.prop = ...`."
      }
    ],
    followUpDeepDive: [
      {
        question: "How do you hot-reload a CommonJS module in development?",
        answer: "By deleting its entry from the cache: `delete require.cache[require.resolve('./module')]` and calling `require('./module')` again.",
        specReference: "Node.js Modules Documentation: Caching"
      }
    ]
  },

  "esm-live-binding-medium": {
    interviewCrossQuestions: [
      {
        question: "What is the critical difference between CommonJS exports and ESM live bindings?",
        answer: "CommonJS copies values: when a module exports a primitive (`let count = 0; module.exports = count`), the consumer receives a static COPY of `0`. Mutating `count` inside the module later does NOT update the consumer's variable. In ESM, `export let count = 0` creates a **Live Binding** (a reference into the module's lexical environment): when the exporter increments `count++`, consumers immediately see the updated value!",
        difficulty: "advanced",
        whyAsked: "The definitive technical difference between CJS and ESM."
      },
      {
        question: "Can an importer reassign an imported ESM variable?",
        answer: "NO! Imported identifiers are **read-only views**. Attempting to write `import { count } from './m'; count = 5;` throws a compile-time/runtime `TypeError: Assignment to constant variable`.",
        difficulty: "intermediate",
        whyAsked: "Verifies knowledge of ESM import immutability."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Tree-Shaking in Bundlers (Vite / Rollup / Webpack)",
        description: "Because ESM imports are static and declarative, bundlers construct static dependency graphs and eliminate dead exported code (tree-shaking), which is impossible with dynamic CommonJS requires.",
        companies: "Vite, Rollup, Webpack",
        codeSnippet: "import { usedFn } from './utils'; // unusedFn is pruned from bundle"
      }
    ],
    howToExplain: {
      opening: "ECMAScript Modules (ESM) use static live bindings where imported variables are dynamic, read-only references to the exporter's lexical environment.",
      keyPoints: [
        "CommonJS copies values; ESM creates live reference bindings.",
        "Mutations inside the exporting module are reflected in real time across all importers.",
        "Imports are strictly read-only for consumers.",
        "Static structure enables dead-code elimination (tree-shaking) during bundling."
      ],
      closingImpression: "Live bindings allow circular dependencies and real-time state synchronization to work seamlessly in modern JavaScript.",
      analogies: ["CommonJS is printing a balance on a paper receipt (static snapshot); ESM is looking at your live banking app (live binding updates automatically)."]
    },
    commonMistakes: [
      {
        mistake: "Assuming ESM imports can be conditionally declared inside if statements.",
        why: "Static import statements must be top-level. Dynamic imports must use `import()` returning a Promise.",
        correct: "Use static imports at file top, or `await import('./module')` for dynamic loading."
      }
    ],
    followUpDeepDive: [
      {
        question: "What are the three phases of ESM module loading in ECMA-262?",
        answer: "1) Construction: parse files, build Module Graph. 2) Instantiation: allocate memory slots for live bindings (linking exports to imports). 3) Evaluation: execute code to populate those slots.",
        specReference: "ECMA-262 §16.2.1.5 ModuleEvaluation"
      }
    ]
  },

  "module-graph-cycle-hard": {
    interviewCrossQuestions: [
      {
        question: "How do CommonJS and ESM handle circular dependencies differently?",
        answer: "In CommonJS, circular requires return an **incomplete, partial copy** of `module.exports` because execution is synchronous and pauses mid-file. If module A requires B before defining an export, B sees an empty `{}`. In ESM, the Module Graph is parsed and instantiated BEFORE evaluation; live bindings are linked in memory ahead of time, allowing circular references to resolve correctly as long as exported functions/variables are evaluated before access.",
        difficulty: "advanced",
        whyAsked: "Highest-level module architecture question."
      },
      {
        question: "What algorithm is used to evaluate cyclic module dependency graphs?",
        answer: "ECMA-262 uses a **Depth-First Search (DFS) Post-Order Traversal** with Tarjan's strongly connected components algorithm, assigning DFS index and lowlink numbers to evaluate circular modules safely without infinite loops.",
        difficulty: "advanced",
        whyAsked: "Tests computer science graph algorithm knowledge in language runtimes."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Circular Dependency Detection in CI/CD (Madge)",
        description: "Linting build pipelines using Madge to detect circular module cycles that could cause TDZ errors during bundling.",
        companies: "Stripe, Airbnb",
        codeSnippet: "npx madge --circular src/"
      }
    ],
    howToExplain: {
      opening: "Evaluating module dependency graphs requires cycle detection and topological sorting to guarantee modules evaluate in safe dependency order.",
      keyPoints: [
        "ESM instantiates live binding pointers across the graph before executing code.",
        "CommonJS returns partial exports when circular requires occur mid-file.",
        "Graph traversal uses DFS post-order evaluation.",
        "Architectures should avoid circular cycles by extracting shared dependencies."
      ],
      closingImpression: "Understanding module graph cycles is critical for diagnosing 'cannot access property of undefined' crashes in complex production bundles.",
      analogies: ["A chicken-and-egg problem: ESM builds the coop and registers both the chicken and egg before either starts moving."]
    },
    commonMistakes: [
      {
        mistake: "Assuming circular dependencies in ESM never throw errors.",
        why: "If a module accesses a circular imported let/const variable during module top-level evaluation before its declaration line runs, it throws a TDZ ReferenceError.",
        correct: "Clarify that top-level execution can still trigger TDZ errors in circular imports."
      }
    ],
    followUpDeepDive: [
      {
        question: "What does the 'type': 'module' field in package.json do?",
        answer: "It tells Node.js to treat all `.js` files within that package boundary as ECMAScript Modules (ESM) rather than legacy CommonJS.",
        specReference: "Node.js Package.json 'type' field documentation"
      }
    ]
  }
};
