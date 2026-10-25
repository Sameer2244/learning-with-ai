// Additional In-Depth JavaScript Mastery Categories (Categories 7 to 12)
// Covering Garbage Collection, Proxy & Metaprogramming, Iterators & Generators,
// V8 Hidden Classes & Inline Caches, Binary Data & TypedArrays, and Module Systems.

module.exports = [
  {
    id: "memory-gc-internals",
    category: "7. Garbage Collection & Memory Management",
    badge: "Memory Systems",
    description: "Master V8 Mark-and-Sweep garbage collection, reference retention, WeakMap, WeakSet, and FinalizationRegistry.",
    topics: [
      {
        id: "gc-weak-refs",
        title: "Garbage Collection, Memory Leaks & Weak References",
        tag: "Memory",
        summary: "Mark-and-sweep mechanics, root reachability, object retention trees, WeakMap for metadata caching, and WeakRef.",
        mentalModel: "Objects remain allocated in the V8 heap as long as they are reachable from GC Roots (Global Object, Call Stack, DOM Trees). Weak references allow referencing an object without incrementing its reachability count, preventing memory leaks when targets are discarded.",
        traps: "Retaining DOM nodes in closures, detached DOM trees, accumulating keys in regular Map/Set, and relying on FinalizationRegistry for deterministic cleanup.",
        challenges: {
          Basic: {
            id: "gc-weakmap-cache-basic",
            title: "Leak-Free Object Metadata Cache with WeakMap",
            difficulty: "Basic",
            concept: "WeakMap Ephemeral Key Lifecycle & Garbage Collection",
            description: "Implement a metadata tracking cache `createMetadataStore()` that allows attaching metadata (such as access counts and labels) to arbitrary target objects without preventing the target objects from being garbage collected. Provide methods: `set(target, key, value)`, `get(target, key)`, and `has(target, key)`.",
            starterCode: `/**
 * Creates an ephemeral metadata store using WeakMap to prevent memory leaks.
 */
function createMetadataStore() {
  const store = new WeakMap();
  return {
    set(target, key, val) {
      if (!store.has(target)) {
        store.set(target, {});
      }
      store.get(target)[key] = val;
    },
    get(target, key) {
      const meta = store.get(target);
      return meta ? meta[key] : undefined;
    },
    has(target, key) {
      const meta = store.get(target);
      return meta ? Object.prototype.hasOwnProperty.call(meta, key) : false;
    }
  };
}
`,
            interviewTrap: "Using a standard Map or plain object keeps strong references to target objects in memory, causing silent memory leaks when DOM elements or temporary objects are removed from the page.",
            testCases: [
              {
                id: 1,
                name: "Sets and retrieves metadata for an object",
                input: "store.set(obj, 'visited', true); store.get(obj, 'visited')",
                expected: true,
                testFn: "const store = createMetadataStore(); const obj = { id: 1 }; store.set(obj, 'visited', true); return store.get(obj, 'visited');"
              },
              {
                id: 2,
                name: "Handles multiple independent objects without cross-contamination",
                input: "store.set(objA, 'tag', 'A'); store.set(objB, 'tag', 'B')",
                expected: "A-B",
                testFn: "const store = createMetadataStore(); const a = {}; const b = {}; store.set(a, 'tag', 'A'); store.set(b, 'tag', 'B'); return store.get(a, 'tag') + '-' + store.get(b, 'tag');"
              },
              {
                id: 3,
                name: "Returns undefined and false for non-existent keys",
                input: "store.has(obj, 'missing') and store.get(obj, 'missing')",
                expected: false,
                testFn: "const store = createMetadataStore(); const obj = {}; return store.has(obj, 'nonExistent');"
              }
            ]
          },
          Medium: {
            id: "gc-weakref-registry-medium",
            title: "Ephemeral Cache with WeakRef & Memory Reclamation",
            difficulty: "Medium",
            concept: "WeakRef Dereferencing & Manual Cache Cleanup",
            description: "Implement an ephemeral in-memory cache `createEphemeralCache()` that stores objects using `WeakRef`. Methods: `set(key, obj)`, `get(key)` (returns the dereferenced object or `undefined` if garbage collected or missing), and `cleanup()` (removes entries whose references have been cleared).",
            starterCode: `/**
 * Creates an ephemeral cache storing objects through WeakRef.
 */
function createEphemeralCache() {
  const map = new Map();
  return {
    set(key, obj) {
      map.set(key, new WeakRef(obj));
    },
    get(key) {
      const ref = map.get(key);
      if (!ref) return undefined;
      const target = ref.deref();
      if (!target) {
        map.delete(key);
        return undefined;
      }
      return target;
    },
    cleanup() {
      let cleaned = 0;
      for (const [key, ref] of map.entries()) {
        if (!ref.deref()) {
          map.delete(key);
          cleaned++;
        }
      }
      return cleaned;
    },
    size() {
      return map.size;
    }
  };
}
`,
            interviewTrap: "A WeakRef object itself is a strong heap reference if stored in a Map. Without a cleanup pass or FinalizationRegistry, dead keys accumulate in the Map structure even though the targets are collected.",
            testCases: [
              {
                id: 1,
                name: "Stores and dereferences live object",
                input: "cache.set('user', user); cache.get('user').name",
                expected: "Antigravity",
                testFn: "const cache = createEphemeralCache(); const user = { name: 'Antigravity' }; cache.set('user', user); return cache.get('user').name;"
              },
              {
                id: 2,
                name: "Returns undefined for non-existent keys",
                input: "cache.get('unknown')",
                expected: true,
                testFn: "const cache = createEphemeralCache(); return cache.get('unknown') === undefined;"
              },
              {
                id: 3,
                name: "Reports accurate map size",
                input: "cache.set('a', a); cache.set('b', b); cache.size()",
                expected: 2,
                testFn: "const cache = createEphemeralCache(); const a = {}; const b = {}; cache.set('a', a); cache.set('b', b); return cache.size();"
              }
            ]
          },
          Hard: {
            id: "gc-cycle-detector-hard",
            title: "Retained Memory Cycle & Detached Node Detector",
            difficulty: "Hard",
            concept: "Object Graph Reachability & Circular Memory Reference Detection",
            description: "Implement `findRetainedCycles(root)` that traverses an arbitrary object graph and identifies all circular reference paths that retain memory. Return an array of detected cycle paths formatted as strings, e.g. `['root.child.parent -> root']`.",
            starterCode: `/**
 * Detects circular memory retention paths within an object graph.
 * @param {object} root - Root object of the graph
 * @returns {string[]} Array of string path representations of cycles
 */
function findRetainedCycles(root) {
  const cycles = [];
  const visited = new Map(); // object -> path

  function traverse(curr, path) {
    if (!curr || typeof curr !== 'object') return;
    if (visited.has(curr)) {
      cycles.push(path + ' -> ' + visited.get(curr));
      return;
    }
    visited.set(curr, path);
    for (const key of Object.keys(curr)) {
      traverse(curr[key], path + '.' + key);
    }
    visited.delete(curr);
  }

  traverse(root, 'root');
  return cycles;
}
`,
            interviewTrap: "Cycles between orphaned objects are collected by modern Mark-and-Sweep GC, but if any node in the cycle is retained by a root closure or global event listener, the entire graph remains pinned in memory.",
            testCases: [
              {
                id: 1,
                name: "Detects direct circular self-reference",
                input: "obj.self = obj",
                expected: ["root.self -> root"],
                testFn: "const obj = {}; obj.self = obj; return findRetainedCycles(obj);"
              },
              {
                id: 2,
                name: "Detects multi-hop circular reference across children",
                input: "parent.child.parent = parent",
                expected: ["root.child.parent -> root"],
                testFn: "const p = { child: {} }; p.child.parent = p; return findRetainedCycles(p);"
              },
              {
                id: 3,
                name: "Returns empty array on clean acyclic object graph",
                input: "{ a: { b: 1 }, c: 2 }",
                expected: [],
                testFn: "const clean = { a: { b: 1 }, c: 2 }; return findRetainedCycles(clean);"
              }
            ]
          }
        }
      }
    ]
  },
  {
    id: "metaprogramming-proxy-reflect",
    category: "8. Metaprogramming: Proxy & Reflect",
    badge: "Metaprogramming",
    description: "Intercept fundamental language operations: property access, assignment, function invocation, and define reactive data patterns.",
    topics: [
      {
        id: "proxy-reflect",
        title: "Metaprogramming with Proxy & Reflect",
        tag: "Proxy & Reflect",
        summary: "Internal traps ([[Get]], [[Set]], [[Delete]]), Reflect forwarding, receiver binding, and reactive property observation.",
        mentalModel: "A Proxy wraps a target object and re-routes internal engine operations through handler traps. Using Reflect inside traps ensures correct 'this' receiver binding and preserves default language invariants.",
        traps: "Failing to pass receiver to Reflect.get/set breaks prototype property inheritance and accessor getters. Invariant violations crash at runtime.",
        challenges: {
          Basic: {
            id: "proxy-negative-index-basic",
            title: "Python-style Negative Indexing with Proxy",
            difficulty: "Basic",
            concept: "Proxy [[Get]] and [[Set]] Trap Interception",
            description: "Implement `createSmartArray(...initialItems)` that returns a Proxied array supporting negative index reads and writes (e.g., `arr[-1]` accesses the last item, `arr[-2] = 99` modifies the second to last item). Standard positive indices, array methods (`push`, `pop`, `length`), and properties must continue working seamlessly.",
            starterCode: `/**
 * Creates an array proxy that supports Python-style negative indexing.
 */
function createSmartArray(...items) {
  const target = [...items];
  return new Proxy(target, {
    get(t, prop, receiver) {
      if (typeof prop === 'string') {
        const idx = Number(prop);
        if (Number.isInteger(idx) && idx < 0) {
          const resolved = t.length + idx;
          return Reflect.get(t, resolved, receiver);
        }
      }
      return Reflect.get(t, prop, receiver);
    },
    set(t, prop, val, receiver) {
      if (typeof prop === 'string') {
        const idx = Number(prop);
        if (Number.isInteger(idx) && idx < 0) {
          const resolved = t.length + idx;
          return Reflect.set(t, resolved, val, receiver);
        }
      }
      return Reflect.set(t, prop, val, receiver);
    }
  });
}
`,
            interviewTrap: "Directly accessing target[resolved] instead of Reflect.get(t, resolved, receiver) breaks subclassed arrays and getters. Also, handling non-numeric properties like 'length' or 'slice' must be preserved.",
            testCases: [
              {
                id: 1,
                name: "Reads last element with index -1",
                input: "smartArr[-1] on [10, 20, 30]",
                expected: 30,
                testFn: "const arr = createSmartArray(10, 20, 30); return arr[-1];"
              },
              {
                id: 2,
                name: "Mutates element via negative index",
                input: "smartArr[-2] = 99 on [10, 20, 30]",
                expected: [10, 99, 30],
                testFn: "const arr = createSmartArray(10, 20, 30); arr[-2] = 99; return [arr[0], arr[1], arr[2]];"
              },
              {
                id: 3,
                name: "Preserves native array methods and length property",
                input: "push(40) then verify length and -1 access",
                expected: 40,
                testFn: "const arr = createSmartArray(10, 20, 30); arr.push(40); return arr[-1];"
              }
            ]
          },
          Medium: {
            id: "proxy-reactive-observable-medium",
            title: "Deep Reactive Observable Store with Change Listeners",
            difficulty: "Medium",
            concept: "Recursive Proxy Trapping & Mutation Notification",
            description: "Implement `createObservable(initialState, onChange)` that returns a deeply reactive proxy. Whenever any property at any depth is modified or added, `onChange({ path, oldValue, newValue })` must be synchronously triggered. Nested objects accessed or modified must also be reactive.",
            starterCode: `/**
 * Creates a deeply observable reactive object triggering onChange on mutations.
 */
function createObservable(initialState, onChange) {
  const proxyMap = new WeakMap();

  function wrap(target, currentPath) {
    if (!target || typeof target !== 'object') return target;
    if (proxyMap.has(target)) return proxyMap.get(target);

    const proxy = new Proxy(target, {
      get(t, prop, receiver) {
        const val = Reflect.get(t, prop, receiver);
        if (typeof prop === 'symbol') return val;
        if (val && typeof val === 'object') {
          const nextPath = currentPath ? currentPath + '.' + String(prop) : String(prop);
          return wrap(val, nextPath);
        }
        return val;
      },
      set(t, prop, val, receiver) {
        const oldValue = Reflect.get(t, prop, receiver);
        if (oldValue === val) return true;
        const res = Reflect.set(t, prop, val, receiver);
        const fullPath = currentPath ? currentPath + '.' + String(prop) : String(prop);
        onChange({ path: fullPath, oldValue, newValue: val });
        return res;
      }
    });

    proxyMap.set(target, proxy);
    return proxy;
  }

  return wrap(initialState, '');
}
`,
            interviewTrap: "Shallow proxies fail to notify mutations on nested properties (e.g., store.user.profile.name = 'Alex'). Recursively wrapping targets on get and preserving object identity via WeakMap is essential.",
            testCases: [
              {
                id: 1,
                name: "Triggers on top-level property mutation",
                input: "store.count = 1",
                expected: { path: "count", oldValue: 0, newValue: 1 },
                testFn: "let change = null; const store = createObservable({ count: 0 }, c => change = c); store.count = 1; return change;"
              },
              {
                id: 2,
                name: "Triggers on deeply nested mutation with exact dot path",
                input: "store.user.profile.city = 'Tokyo'",
                expected: "user.profile.city:Tokyo",
                testFn: "let log = ''; const store = createObservable({ user: { profile: { city: 'Paris' } } }, c => log = c.path + ':' + c.newValue); store.user.profile.city = 'Tokyo'; return log;"
              },
              {
                id: 3,
                name: "Does not trigger listener when setting identical value",
                input: "store.value = store.value",
                expected: 0,
                testFn: "let calls = 0; const store = createObservable({ val: 42 }, () => calls++); store.val = 42; return calls;"
              }
            ]
          },
          Hard: {
            id: "proxy-schema-validator-hard",
            title: "Enforced Schema Invariants & Revocable Sandboxed Proxy",
            difficulty: "Hard",
            concept: "Proxy Invariants, Revocable Proxies & Type Guards",
            description: "Implement `createSecureSchemaProxy(schema, initialData)` that validates data against a schema on write, throws TypeErrors for unknown properties or type mismatches, and exposes a `revoke()` method that permanently disables all further read/write access.",
            starterCode: `/**
 * Creates a revocable proxy enforcing a strict property schema.
 */
function createSecureSchemaProxy(schema, initialData) {
  const target = { ...initialData };
  for (const [key, type] of Object.entries(schema)) {
    if (target[key] !== undefined && typeof target[key] !== type) {
      throw new TypeError('Initial property ' + key + ' must be ' + type);
    }
  }

  const { proxy, revoke } = Proxy.revocable(target, {
    get(t, prop, receiver) {
      if (prop === 'revoke') return revoke;
      return Reflect.get(t, prop, receiver);
    },
    set(t, prop, val, receiver) {
      if (typeof prop === 'string' && !(prop in schema)) {
        throw new TypeError('Property ' + String(prop) + ' is not allowed by schema');
      }
      const expectedType = schema[prop];
      if (typeof val !== expectedType) {
        throw new TypeError('Property ' + String(prop) + ' must be of type ' + expectedType);
      }
      return Reflect.set(t, prop, val, receiver);
    }
  });

  return proxy;
}
`,
            interviewTrap: "Failing to handle non-configurable or non-writable invariant checks in Proxy handlers will cause the JS engine to throw an uncatchable runtime TypeError. Revocable proxies are critical for security sandboxes.",
            testCases: [
              {
                id: 1,
                name: "Allows valid property update conforming to schema",
                input: "proxy.age = 30 where schema expects number",
                expected: 30,
                testFn: "const proxy = createSecureSchemaProxy({ name: 'string', age: 'number' }, { name: 'Alice', age: 25 }); proxy.age = 30; return proxy.age;"
              },
              {
                id: 2,
                name: "Throws TypeError on forbidden property addition",
                input: "proxy.hack = true",
                expected: "Property hack is not allowed by schema",
                testFn: "const proxy = createSecureSchemaProxy({ name: 'string' }, { name: 'Bob' }); try { proxy.hack = true; return 'no-error'; } catch (e) { return e.message; }"
              },
              {
                id: 3,
                name: "Permanently disables proxy access once revoked",
                input: "proxy.revoke(); then reading proxy.name throws",
                expected: true,
                testFn: "const proxy = createSecureSchemaProxy({ name: 'string' }, { name: 'Eve' }); proxy.revoke(); try { const x = proxy.name; return false; } catch (e) { return true; }"
              }
            ]
          }
        }
      }
    ]
  },
  {
    id: "iterators-generators-coroutines",
    category: "9. Iterators, Generators & Async Iteration",
    badge: "Language Grammar",
    description: "Master the iteration protocol, generator coroutines, yield delegation, and async generators for streaming pipelines.",
    topics: [
      {
        id: "iterators-generators",
        title: "Iterators, Generators & Async Iteration",
        tag: "Generators",
        summary: "Iterable and Iterator protocols, Symbol.iterator, yield state suspension, bidirectional communication, and async streams.",
        mentalModel: "Generators are re-entrant state machines. When yield is encountered, the generator's execution context is suspended and pushed out of the call stack. Calling .next() re-attaches the context and resumes evaluation.",
        traps: "First .next(val) call cannot receive a value because it only starts the generator. Forgetting yield* delegation wraps iterables into single yielded items.",
        challenges: {
          Basic: {
            id: "generator-fibonacci-basic",
            title: "Infinite Sequence Generator with Symbol.iterator",
            difficulty: "Basic",
            concept: "Generator State Suspension & Iterable Protocol",
            description: "Implement an iterable object `createFibonacciSequence(limit)` that yields Fibonacci numbers up to `limit`. It must support `for...of` iteration and array spreading `[...createFibonacciSequence(50)]`.",
            starterCode: `/**
 * Creates an iterable yielding Fibonacci numbers up to limit.
 */
function createFibonacciSequence(limit = 100) {
  return {
    *[Symbol.iterator]() {
      let a = 0, b = 1;
      while (a <= limit) {
        yield a;
        const next = a + b;
        a = b;
        b = next;
      }
    }
  };
}
`,
            interviewTrap: "Returning a plain iterator without Symbol.iterator makes an object non-iterable in for...of loops and spread syntax.",
            testCases: [
              {
                id: 1,
                name: "Generates Fibonacci sequence up to limit 20",
                input: "[...createFibonacciSequence(20)]",
                expected: [0, 1, 1, 2, 3, 5, 8, 13],
                testFn: "return [...createFibonacciSequence(20)];"
              },
              {
                id: 2,
                name: "Handles limit of 0 correctly",
                input: "[...createFibonacciSequence(0)]",
                expected: [0],
                testFn: "return [...createFibonacciSequence(0)];"
              },
              {
                id: 3,
                name: "Works seamlessly in standard for...of loop",
                input: "sum of elements up to 10",
                expected: 20,
                testFn: "let sum = 0; for (const n of createFibonacciSequence(10)) sum += n; return sum;"
              }
            ]
          },
          Medium: {
            id: "generator-bidirectional-medium",
            title: "Bidirectional Coroutine Task Runner",
            difficulty: "Medium",
            concept: "Bidirectional Generator Communication via .next(val)",
            description: "Implement `runConversation(generatorFn, responses)` that steps through a generator function and supplies sequential response values from the `responses` array into each successive `yield` expression, returning an array of all yielded questions and the final return value.",
            starterCode: `/**
 * Feeds responses into a generator coroutine step-by-step.
 */
function runConversation(generatorFn, responses = []) {
  const gen = generatorFn();
  const yielded = [];
  let step = gen.next();
  let idx = 0;

  while (!step.done) {
    yielded.push(step.value);
    const inputVal = idx < responses.length ? responses[idx] : undefined;
    idx++;
    step = gen.next(inputVal);
  }

  return { yielded, result: step.value };
}
`,
            interviewTrap: "The argument passed to the FIRST .next() call is silently discarded by V8 because execution has not yet reached a yield expression. Passing input starts on the second .next(val) invocation.",
            testCases: [
              {
                id: 1,
                name: "Feeds inputs into yielded expressions",
                input: "coroutine receives name and age",
                expected: { yielded: ["What is your name?", "What is your age?"], result: "Profile: Alex, 28" },
                testFn: "function* dialog() { const name = yield 'What is your name?'; const age = yield 'What is your age?'; return 'Profile: ' + name + ', ' + age; } return runConversation(dialog, ['Alex', 28]);"
              },
              {
                id: 2,
                name: "Handles immediate return without yields",
                input: "generator with no yield",
                expected: { yielded: [], result: 42 },
                testFn: "function* direct() { return 42; } return runConversation(direct, ['ignore']);"
              },
              {
                id: 3,
                name: "Handles fewer responses than yield requests",
                input: "yields 2 times but only 1 response provided",
                expected: "Done with undefined",
                testFn: "function* dialog() { const a = yield 1; const b = yield 2; return 'Done with ' + b; } return runConversation(dialog, ['first']).result;"
              }
            ]
          },
          Hard: {
            id: "async-generator-pipeline-hard",
            title: "Async Streaming Pipeline with Backpressure & Batching",
            difficulty: "Hard",
            concept: "Async Generators & Flow Control Backpressure",
            description: "Implement `async function* batchAsyncStream(asyncIterable, batchSize)` that reads from an async iterable source and yields arrays of items chunked by `batchSize`. Any remaining items when the stream closes must be yielded in a final partial batch.",
            starterCode: `/**
 * Chunks an async iterable stream into fixed-size batches.
 */
async function* batchAsyncStream(asyncIterable, batchSize = 3) {
  let batch = [];
  for await (const item of asyncIterable) {
    batch.push(item);
    if (batch.length >= batchSize) {
      yield batch;
      batch = [];
    }
  }
  if (batch.length > 0) {
    yield batch;
  }
}
`,
            interviewTrap: "Failing to handle trailing remaining items when an async iterator completes causes silent data loss. Consuming without backpressure risks memory ballooning.",
            testCases: [
              {
                id: 1,
                name: "Chunks stream into equal batches",
                input: "Stream of [1, 2, 3, 4] with batchSize 2",
                expected: [[1, 2], [3, 4]],
                testFn: "async function* src() { yield 1; yield 2; yield 3; yield 4; } const res = []; for await (const b of batchAsyncStream(src(), 2)) res.push(b); return res;"
              },
              {
                id: 2,
                name: "Flushes remaining items on stream completion",
                input: "Stream of [1, 2, 3, 4, 5] with batchSize 2",
                expected: [[1, 2], [3, 4], [5]],
                testFn: "async function* src() { yield 1; yield 2; yield 3; yield 4; yield 5; } const res = []; for await (const b of batchAsyncStream(src(), 2)) res.push(b); return res;"
              },
              {
                id: 3,
                name: "Yields nothing for empty stream",
                input: "Empty source stream",
                expected: [],
                testFn: "async function* src() {} const res = []; for await (const b of batchAsyncStream(src(), 2)) res.push(b); return res;"
              }
            ]
          }
        }
      }
    ]
  },
  {
    id: "v8-engine-hidden-classes",
    category: "10. V8 Engine Internals & Hidden Classes",
    badge: "V8 Internals",
    description: "Understand how Google's V8 JIT compiles JavaScript, manages Hidden Classes (Shapes/Maps), optimizes Inline Caches, and avoids deoptimizations.",
    topics: [
      {
        id: "v8-internals-optimization",
        title: "V8 Internals: Hidden Classes & Inline Caches",
        tag: "V8 Engine",
        summary: "Object shapes, property transition trees, monomorphic vs polymorphic inline caches, SMI arrays, and TurboFan deoptimization.",
        mentalModel: "V8 assigns a Hidden Class (Map) to every object. Adding properties in different orders or using 'delete' splits the transition tree and degrades inline caches from Monomorphic (fastest) to Megamorphic (hash table lookup fallback).",
        traps: "Deleting properties creates slow dictionary-mode objects. Inserting undefined holes into arrays converts packed SMI elements into slow hash lookups.",
        challenges: {
          Basic: {
            id: "v8-shape-stabilizer-basic",
            title: "Object Shape Stabilizer for Monomorphic Inline Caching",
            difficulty: "Basic",
            concept: "Hidden Class Transition Tree Alignment",
            description: "Implement `stabilizeObjectShape(obj, fieldOrder)` that produces a normalized object containing the specified fields in deterministic declaration order, ensuring all instances share the exact same V8 Hidden Class transition chain.",
            starterCode: `/**
 * Normalizes object property initialization order to preserve V8 Hidden Classes.
 */
function stabilizeObjectShape(obj, fieldOrder) {
  const normalized = {};
  for (const field of fieldOrder) {
    normalized[field] = Object.prototype.hasOwnProperty.call(obj, field) ? obj[field] : null;
  }
  return normalized;
}
`,
            interviewTrap: "Initializing { a: 1, b: 2 } vs { b: 2, a: 1 } creates two separate V8 Hidden Classes. When passed to a shared function, the call site becomes polymorphic, doubling lookup overhead.",
            testCases: [
              {
                id: 1,
                name: "Orders properties deterministically according to fieldOrder",
                input: "{ y: 2, x: 1 } with fieldOrder ['x', 'y']",
                expected: ["x", "y"],
                testFn: "const normalized = stabilizeObjectShape({ y: 2, x: 1 }, ['x', 'y']); return Object.keys(normalized);"
              },
              {
                id: 2,
                name: "Populates missing schema properties with null",
                input: "{ x: 10 } with fieldOrder ['x', 'y', 'z']",
                expected: { x: 10, y: null, z: null },
                testFn: "return stabilizeObjectShape({ x: 10 }, ['x', 'y', 'z']);"
              },
              {
                id: 3,
                name: "Produces identical key sequence across differently constructed inputs",
                input: "compare key order of two objects",
                expected: true,
                testFn: "const a = stabilizeObjectShape({ a: 1, b: 2 }, ['a', 'b']); const b = stabilizeObjectShape({ b: 2, a: 1 }, ['a', 'b']); return JSON.stringify(Object.keys(a)) === JSON.stringify(Object.keys(b));"
              }
            ]
          },
          Medium: {
            id: "v8-inline-cache-simulator-medium",
            title: "Inline Cache (IC) State Machine Simulator",
            difficulty: "Medium",
            concept: "Monomorphic, Polymorphic, and Megamorphic IC Transitions",
            description: "Implement `createInlineCache(maxPolymorphic = 4)` that tracks property lookups across observed object shapes. Return an object with `access(shapeId)` and `getCacheState()` returning 'UNINITIALIZED', 'MONOMORPHIC', 'POLYMORPHIC', or 'MEGAMORPHIC'.",
            starterCode: `/**
 * Simulates the state transitions of a V8 Inline Cache (IC).
 */
function createInlineCache(maxPolymorphic = 4) {
  const observedShapes = new Set();
  return {
    access(shapeId) {
      observedShapes.add(shapeId);
    },
    getCacheState() {
      const count = observedShapes.size;
      if (count === 0) return 'UNINITIALIZED';
      if (count === 1) return 'MONOMORPHIC';
      if (count <= maxPolymorphic) return 'POLYMORPHIC';
      return 'MEGAMORPHIC';
    }
  };
}
`,
            interviewTrap: "Once an inline cache transitions to Megamorphic, V8 abandons inline machine code stub lookups and falls back to a global hash table lookup, permanently losing optimization for that call site.",
            testCases: [
              {
                id: 1,
                name: "Single shape stays Monomorphic",
                input: "access('ShapeA') 5 times",
                expected: "MONOMORPHIC",
                testFn: "const ic = createInlineCache(4); ic.access('ShapeA'); ic.access('ShapeA'); return ic.getCacheState();"
              },
              {
                id: 2,
                name: "Multiple shapes up to limit transition to Polymorphic",
                input: "access ShapeA, ShapeB, ShapeC",
                expected: "POLYMORPHIC",
                testFn: "const ic = createInlineCache(4); ic.access('A'); ic.access('B'); ic.access('C'); return ic.getCacheState();"
              },
              {
                id: 3,
                name: "Exceeding threshold triggers Megamorphic fallback",
                input: "access 5 different shapes with maxPolymorphic 4",
                expected: "MEGAMORPHIC",
                testFn: "const ic = createInlineCache(4); ['A', 'B', 'C', 'D', 'E'].forEach(s => ic.access(s)); return ic.getCacheState();"
              }
            ]
          },
          Hard: {
            id: "v8-array-element-kind-hard",
            title: "Array Hole Elimination & Packed SMI Preserver",
            difficulty: "Hard",
            concept: "V8 Array Elements Kinds: PACKED_SMI vs HOLEY_DOUBLE",
            description: "Implement `compactAndPackSmiArray(sparseArray)` that detects and removes holes from a sparse array while ensuring all remaining values are strictly 31-bit signed Small Integers (SMIs), returning a dense contiguous array.",
            starterCode: `/**
 * Removes array holes and verifies strict Small Integer (SMI) compliance.
 */
function compactAndPackSmiArray(sparseArray) {
  const result = [];
  const MIN_SMI = -1073741824; // -2^30
  const MAX_SMI = 1073741823;  // 2^30 - 1

  for (let i = 0; i < sparseArray.length; i++) {
    if (i in sparseArray) {
      const val = sparseArray[i];
      if (typeof val === 'number' && Number.isInteger(val) && val >= MIN_SMI && val <= MAX_SMI) {
        result.push(val);
      }
    }
  }
  return result;
}
`,
            interviewTrap: "A single arr[100] = 1 in an empty array causes V8 to permanently demote the array from PACKED_SMI_ELEMENTS to HOLEY_SMI_ELEMENTS. Once demoted to HOLEY, element reads must check the prototype chain for every hole.",
            testCases: [
              {
                id: 1,
                name: "Eliminates sparse holes without prototype lookup",
                input: "sparse array [1, empty, 3]",
                expected: [1, 3],
                testFn: "const arr = [1]; arr[3] = 3; return compactAndPackSmiArray(arr);"
              },
              {
                id: 2,
                name: "Filters out floating-point doubles to preserve SMI packing",
                input: "[10, 20.5, 30, 'string']",
                expected: [10, 30],
                testFn: "return compactAndPackSmiArray([10, 20.5, 30, 'invalid']);"
              },
              {
                id: 3,
                name: "Handles already packed dense array unchanged",
                input: "[1, 2, 3, 4, 5]",
                expected: [1, 2, 3, 4, 5],
                testFn: "return compactAndPackSmiArray([1, 2, 3, 4, 5]);"
              }
            ]
          }
        }
      }
    ]
  },
  {
    id: "binary-typed-arrays-buffers",
    category: "11. Binary Data, Buffers & Memory Systems",
    badge: "Binary & Buffers",
    description: "Direct memory manipulation with ArrayBuffer, TypedArrays, DataView, byte packing, and multi-threaded worker communication.",
    topics: [
      {
        id: "binary-data-buffers",
        title: "Binary Data, TypedArrays & Memory Buffers",
        tag: "Binary & Buffers",
        summary: "ArrayBuffer allocation, TypedArray views, DataView endianness handling, bitwise packing, and zero-copy Transferables.",
        mentalModel: "An ArrayBuffer is a contiguous chunk of raw heap memory. TypedArrays (Uint8Array, Int32Array) and DataViews provide structured lenses over the buffer. Endianness matters when parsing multi-byte integers across platforms.",
        traps: "Mixing little-endian and big-endian reads in DataView corrupts multi-byte numbers. Modifying a TypedArray view mutates the shared underlying buffer.",
        challenges: {
          Basic: {
            id: "binary-dataview-packet-basic",
            title: "Binary Header Packet Encoder & Decoder",
            difficulty: "Basic",
            concept: "DataView Explicit Endianness & Byte Serialization",
            description: "Implement `encodePacket(id, statusCode, payloadLength)` and `decodePacket(arrayBuffer)` where the packet structure is: 2 bytes for uint16 ID, 1 byte for uint8 statusCode, 4 bytes for uint32 payloadLength (all Big-Endian).",
            starterCode: `/**
 * Encodes a 7-byte binary header packet using DataView.
 */
function encodePacket(id, statusCode, payloadLength) {
  const buffer = new ArrayBuffer(7);
  const view = new DataView(buffer);
  view.setUint16(0, id, false); // Big-Endian
  view.setUint8(2, statusCode);
  view.setUint32(3, payloadLength, false); // Big-Endian
  return buffer;
}

/**
 * Decodes a 7-byte binary header packet using DataView.
 */
function decodePacket(buffer) {
  const view = new DataView(buffer);
  return {
    id: view.getUint16(0, false),
    statusCode: view.getUint8(2),
    payloadLength: view.getUint32(3, false)
  };
}
`,
            interviewTrap: "TypedArrays (e.g., Uint16Array) use the CPU's native endianness (almost always Little-Endian on x86/ARM), which breaks cross-platform network protocol compliance. Always use DataView for explicit endianness control.",
            testCases: [
              {
                id: 1,
                name: "Correctly encodes and decodes round-trip packet",
                input: "encode(1001, 200, 65536)",
                expected: { id: 1001, statusCode: 200, payloadLength: 65536 },
                testFn: "const buf = encodePacket(1001, 200, 65536); return decodePacket(buf);"
              },
              {
                id: 2,
                name: "Handles boundary 16-bit and 32-bit integer limits",
                input: "id: 65535, statusCode: 255, payload: 4294967295",
                expected: { id: 65535, statusCode: 255, payloadLength: 4294967295 },
                testFn: "const buf = encodePacket(65535, 255, 4294967295); return decodePacket(buf);"
              },
              {
                id: 3,
                name: "Enforces exact 7-byte buffer size allocation",
                input: "encodePacket byteLength check",
                expected: 7,
                testFn: "const buf = encodePacket(1, 1, 1); return buf.byteLength;"
              }
            ]
          },
          Medium: {
            id: "binary-base64-buffer-medium",
            title: "Base64 to Uint8Array Binary Decoder",
            difficulty: "Medium",
            concept: "Bitwise Shifting & Byte Array Construction",
            description: "Implement `base64ToUint8Array(b64String)` that decodes a standard Base64 string directly into a `Uint8Array` using bitwise operations.",
            starterCode: `/**
 * Decodes a Base64 string directly into a Uint8Array byte buffer.
 */
function base64ToUint8Array(b64) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) lookup[chars.charCodeAt(i)] = i;

  const clean = b64.replace(/=+$/, '');
  const len = clean.length;
  const byteLen = Math.floor((len * 3) / 4);
  const bytes = new Uint8Array(byteLen);

  let p = 0;
  for (let i = 0; i < len; i += 4) {
    const c0 = lookup[clean.charCodeAt(i)];
    const c1 = lookup[clean.charCodeAt(i + 1)];
    const c2 = i + 2 < len ? lookup[clean.charCodeAt(i + 2)] : 0;
    const c3 = i + 3 < len ? lookup[clean.charCodeAt(i + 3)] : 0;

    bytes[p++] = (c0 << 2) | (c1 >> 4);
    if (p < byteLen) bytes[p++] = ((c1 & 15) << 4) | (c2 >> 2);
    if (p < byteLen) bytes[p++] = ((c2 & 3) << 6) | c3;
  }
  return bytes;
}
`,
            interviewTrap: "Using atob() creates an intermediate binary string in memory where each byte is stored as a 16-bit UTF-16 code point, doubling memory consumption.",
            testCases: [
              {
                id: 1,
                name: "Decodes 'SGVsbG8=' to ASCII byte values of 'Hello'",
                input: "base64ToUint8Array('SGVsbG8=')",
                expected: [72, 101, 108, 108, 111],
                testFn: "const bytes = base64ToUint8Array('SGVsbG8='); return Array.from(bytes);"
              },
              {
                id: 2,
                name: "Decodes multiple blocks accurately",
                input: "base64ToUint8Array('AQIDBAU=')",
                expected: [1, 2, 3, 4, 5],
                testFn: "return Array.from(base64ToUint8Array('AQIDBAU='));"
              },
              {
                id: 3,
                name: "Handles empty string input",
                input: "base64ToUint8Array('')",
                expected: [],
                testFn: "return Array.from(base64ToUint8Array(''));"
              }
            ]
          },
          Hard: {
            id: "binary-ring-buffer-hard",
            title: "Lockless Circular Ring Buffer with TypedArrays",
            difficulty: "Hard",
            concept: "Ring Buffer Head/Tail Pointers & Modulo Addressing",
            description: "Implement `createCircularBuffer(capacity)` that manages a fixed-size byte buffer. Methods: `write(byte)` (returns false if full), `read()` (returns byte or null if empty), `isFull()`, and `isEmpty()`.",
            starterCode: `/**
 * Fixed-capacity circular byte buffer implemented over Uint8Array.
 */
function createCircularBuffer(capacity = 8) {
  const buffer = new Uint8Array(capacity + 1);
  let head = 0;
  let tail = 0;
  const size = capacity + 1;

  return {
    write(byte) {
      if ((tail + 1) % size === head) return false; // Full
      buffer[tail] = byte & 0xFF;
      tail = (tail + 1) % size;
      return true;
    },
    read() {
      if (head === tail) return null; // Empty
      const val = buffer[head];
      head = (head + 1) % size;
      return val;
    },
    isFull() {
      return (tail + 1) % size === head;
    },
    isEmpty() {
      return head === tail;
    }
  };
}
`,
            interviewTrap: "In shared-memory multi-threaded Web Worker architectures, circular buffers prevent lock contention between audio/compute threads and the UI thread.",
            testCases: [
              {
                id: 1,
                name: "Writes and reads bytes in FIFO order",
                input: "write 42, 84 then read both",
                expected: [42, 84],
                testFn: "const ring = createCircularBuffer(4); ring.write(42); ring.write(84); return [ring.read(), ring.read()];"
              },
              {
                id: 2,
                name: "Detects full condition and rejects overflow writes",
                input: "write 3 items into capacity 2",
                expected: false,
                testFn: "const ring = createCircularBuffer(2); ring.write(1); ring.write(2); return ring.write(3);"
              },
              {
                id: 3,
                name: "Wraps around head and tail pointers seamlessly",
                input: "write 2, read 2, write 2 more",
                expected: [30, 40],
                testFn: "const ring = createCircularBuffer(2); ring.write(10); ring.write(20); ring.read(); ring.read(); ring.write(30); ring.write(40); return [ring.read(), ring.read()];"
              }
            ]
          }
        }
      }
    ]
  },
  {
    id: "module-systems-esm-cjs",
    category: "12. Module Systems: ESM vs CommonJS",
    badge: "Modules",
    description: "Deep dive into static ESM vs dynamic CommonJS, live export bindings, module caches, and circular dependency resolution.",
    topics: [
      {
        id: "module-systems",
        title: "Module Systems: ESM vs CommonJS & Circular Dependencies",
        tag: "Modules",
        summary: "Two-phase execution (Parsing vs Evaluation), live bindings vs value copies, circular reference caching, and tree shaking.",
        mentalModel: "CommonJS exports are evaluated at runtime and copied by value into a module.exports object. ESM exports are live references bound during static analysis, meaning changes in the exporter reflect immediately in the importer.",
        traps: "In CommonJS circular dependencies, an importing module gets an incomplete snapshot of module.exports. In ESM, accessing uninitialized hoisted live bindings before evaluation triggers a ReferenceError TDZ.",
        challenges: {
          Basic: {
            id: "cjs-module-cache-basic",
            title: "Simulate CommonJS Module Cache & require()",
            difficulty: "Basic",
            concept: "CommonJS module.exports & require cache mechanics",
            description: "Implement `createModuleEnvironment()` that exposes `defineModule(id, fn)` and `require(id)`. Modules must only be evaluated once; subsequent `require` calls must return the cached `module.exports` object.",
            starterCode: `/**
 * Simulates the CommonJS runtime module registry and require() cache.
 */
function createModuleEnvironment() {
  const registry = new Map();
  const cache = new Map();

  return {
    defineModule(id, factory) {
      registry.set(id, factory);
    },
    require(id) {
      if (cache.has(id)) {
        return cache.get(id).exports;
      }
      if (!registry.has(id)) {
        throw new Error('Module ' + id + ' not found');
      }
      const mod = { exports: {} };
      cache.set(id, mod);
      const factory = registry.get(id);
      factory(mod.exports, mod, (depId) => this.require(depId));
      return mod.exports;
    }
  };
}
`,
            interviewTrap: "Forgetting to populate cache.set(id, mod) BEFORE calling the module factory causes infinite recursion on circular dependencies.",
            testCases: [
              {
                id: 1,
                name: "Exports and requires a module successfully",
                input: "define math module and require('math').add(2, 3)",
                expected: 5,
                testFn: "const env = createModuleEnvironment(); env.defineModule('math', (exports) => { exports.add = (a, b) => a + b; }); return env.require('math').add(2, 3);"
              },
              {
                id: 2,
                name: "Subsequent requires return cached instance without re-evaluating",
                input: "verify factory is only invoked once",
                expected: 1,
                testFn: "const env = createModuleEnvironment(); let calls = 0; env.defineModule('counter', (exports) => { calls++; exports.val = 42; }); env.require('counter'); env.require('counter'); return calls;"
              },
              {
                id: 3,
                name: "Throws descriptive error on unknown module ID",
                input: "require('unknown')",
                expected: "Module unknown not found",
                testFn: "const env = createModuleEnvironment(); try { env.require('unknown'); return 'no-error'; } catch (e) { return e.message; }"
              }
            ]
          },
          Medium: {
            id: "esm-live-binding-medium",
            title: "ESM Live Binding vs CJS Value Copy Simulator",
            difficulty: "Medium",
            concept: "Live Reference Bindings vs Copied Primitive Values",
            description: "Implement `createLiveBindingStore()` that demonstrates the fundamental difference between ESM live bindings (which reflect exported counter changes when incremented) and CJS value copies (which remain frozen at the initial value).",
            starterCode: `/**
 * Demonstrates ESM live bindings vs CommonJS value snapshots.
 */
function createLiveBindingStore() {
  let counter = 0;
  // CJS export snapshot (value copy)
  const cjsExport = { counter };
  // ESM export accessor (live binding)
  const esmExport = {
    get counter() { return counter; }
  };

  return {
    increment() {
      counter++;
    },
    getCjsCounter() {
      return cjsExport.counter;
    },
    getEsmCounter() {
      return esmExport.counter;
    }
  };
}
`,
            interviewTrap: "Candidates often assume ESM exports work like objects with values. In reality, ESM generates pointer references in the module record, so mutating the internal variable changes what importers see without re-exporting.",
            testCases: [
              {
                id: 1,
                name: "Both start at initial value 0",
                input: "getCjsCounter() and getEsmCounter() before increment",
                expected: "0:0",
                testFn: "const store = createLiveBindingStore(); return store.getCjsCounter() + ':' + store.getEsmCounter();"
              },
              {
                id: 2,
                name: "After increment, CJS stays 0 while ESM updates to 1",
                input: "store.increment()",
                expected: { cjs: 0, esm: 1 },
                testFn: "const store = createLiveBindingStore(); store.increment(); return { cjs: store.getCjsCounter(), esm: store.getEsmCounter() };"
              },
              {
                id: 3,
                name: "Multiple increments continue updating ESM counter live",
                input: "store.increment() 3 times",
                expected: 3,
                testFn: "const store = createLiveBindingStore(); store.increment(); store.increment(); store.increment(); return store.getEsmCounter();"
              }
            ]
          },
          Hard: {
            id: "module-graph-cycle-hard",
            title: "Module Dependency Graph Cycle Detector & Topological Evaluator",
            difficulty: "Hard",
            concept: "Topological Sorting & Circular Module Graph Resolution",
            description: "Implement `resolveEvaluationOrder(graph)` that accepts a directed module dependency graph (e.g. `{ A: ['B', 'C'], B: ['C'], C: [] }`) and returns the strict evaluation order array, or throws an Error if a circular dependency is detected.",
            starterCode: `/**
 * Computes deterministic module evaluation order or detects circular cycles.
 */
function resolveEvaluationOrder(graph) {
  const order = [];
  const visited = new Set();
  const visiting = new Set();

  function visit(node) {
    if (visiting.has(node)) {
      throw new Error('Circular dependency detected at module: ' + node);
    }
    if (visited.has(node)) return;

    visiting.add(node);
    const deps = graph[node] || [];
    for (const dep of deps) {
      visit(dep);
    }
    visiting.delete(node);
    visited.add(node);
    order.push(node);
  }

  for (const node of Object.keys(graph)) {
    if (!visited.has(node)) {
      visit(node);
    }
  }

  return order;
}
`,
            interviewTrap: "ESM parses the entire module dependency graph statically using Post-Order DFS before executing a single line of module code, whereas CommonJS resolves modules dynamically at runtime.",
            testCases: [
              {
                id: 1,
                name: "Resolves linear and diamond dependencies in topological order",
                input: "{ A: ['B'], B: ['C'], C: [] }",
                expected: ["C", "B", "A"],
                testFn: "return resolveEvaluationOrder({ A: ['B'], B: ['C'], C: [] });"
              },
              {
                id: 2,
                name: "Throws on circular cycle between modules",
                input: "{ A: ['B'], B: ['A'] }",
                expected: "Circular dependency detected at module: A",
                testFn: "try { resolveEvaluationOrder({ A: ['B'], B: ['A'] }); return 'no-error'; } catch (e) { return e.message; }"
              },
              {
                id: 3,
                name: "Resolves diamond graph correctly",
                input: "{ A: ['B', 'C'], B: ['D'], C: ['D'], D: [] }",
                expected: true,
                testFn: "const order = resolveEvaluationOrder({ A: ['B', 'C'], B: ['D'], C: ['D'], D: [] }); return order[0] === 'D' && order[order.length - 1] === 'A';"
              }
            ]
          }
        }
      }
    ]
  }
];
