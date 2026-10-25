// Additional In-Depth React Mastery Categories (Categories 6 to 8)
// Covering Controlled vs Uncontrolled, Custom Hooks & State Reducer,
// Suspense Internals & Error Boundaries, RSC & Streaming Hydration,
// React Compiler (Forget) Mechanics, and Custom Host Reconcilers.

module.exports = [
  {
    id: "component-architecture-state",
    category: "6. Component Architecture & State Management",
    badge: "Architecture & State",
    description: "Master controlled vs uncontrolled components, synthetic event dispatching, custom state machines, and the state reducer pattern.",
    topics: [
      {
        id: "controlled-uncontrolled",
        title: "Controlled vs Uncontrolled & Synthetic Events",
        tag: "Forms & Events",
        summary: "Value synchronization, defaultValue, event pooling, synthetic event normalization, and zero re-render forms.",
        mentalModel: "A controlled component's single source of truth is React state; an uncontrolled component delegates state to the DOM node via a ref. Bridging both requires synchronizing internal fallback state with incoming prop state.",
        traps: "Switching from uncontrolled to controlled (undefined -> value) triggers React console warnings and breaks cursor position.",
        challenges: {
          Basic: {
            id: "controlled-state-sync-basic",
            title: "Universal Input Controller Sync",
            difficulty: "Basic",
            concept: "Props vs State Controlled-to-Uncontrolled Synchronization",
            description: "Implement `createInputController({ value, defaultValue, onChange })` that correctly determines if an input is controlled (`value !== undefined`), manages an internal fallback state when uncontrolled, and synchronizes changes without triggering warnings.",
            starterCode: `/**
 * Manages dual controlled/uncontrolled input state cleanly.
 */
function createInputController({ value, defaultValue = '', onChange } = {}) {
  const isControlled = value !== undefined;
  let internalValue = defaultValue;

  return {
    isControlled() {
      return isControlled;
    },
    getValue() {
      return isControlled ? value : internalValue;
    },
    setValue(nextVal) {
      if (!isControlled) {
        internalValue = nextVal;
      }
      if (typeof onChange === 'function') {
        onChange(nextVal);
      }
    }
  };
}
`,
            interviewTrap: "If an input starts with value={undefined} and later receives a string, React logs: 'A component is changing an uncontrolled input to be controlled'. Setting defaultValue or an empty string fallback prevents this.",
            testCases: [
              {
                id: 1,
                name: "Manages internal state when uncontrolled",
                input: "uncontrolled input updates internal value",
                expected: "Hello",
                testFn: "const ctrl = createInputController({ defaultValue: '' }); ctrl.setValue('Hello'); return ctrl.getValue();"
              },
              {
                id: 2,
                name: "Defers to prop value when controlled",
                input: "controlled input always returns prop value",
                expected: "ControlledText",
                testFn: "const ctrl = createInputController({ value: 'ControlledText' }); return ctrl.getValue();"
              },
              {
                id: 3,
                name: "Invokes onChange callback on value change",
                input: "onChange triggered on setValue",
                expected: "NewVal",
                testFn: "let captured = ''; const ctrl = createInputController({ onChange: v => captured = v }); ctrl.setValue('NewVal'); return captured;"
              }
            ]
          },
          Medium: {
            id: "custom-use-controlled-medium",
            title: "Custom useControlled State Hook (Radix / MUI Pattern)",
            difficulty: "Medium",
            concept: "Derived State & Controlled Prop Inversion",
            description: "Implement `useControlledState({ controlled, default: defaultVal })` that mimics the standard pattern used in Radix UI and Material UI, returning `[currentValue, setValue]`.",
            starterCode: `/**
 * Reusable controlled/uncontrolled state helper for polymorphic UI widgets.
 */
function useControlledState({ controlled, default: defaultVal } = {}) {
  const isControlled = controlled !== undefined;
  let state = isControlled ? controlled : defaultVal;

  function setState(updater) {
    const nextVal = typeof updater === 'function' ? updater(state) : updater;
    if (!isControlled) {
      state = nextVal;
    }
    return nextVal;
  }

  return [state, setState];
}
`,
            interviewTrap: "Components often need to be either controlled by a parent or self-contained. The useControlled pattern allows reusable UI widgets (accordion, modal, combobox) to support both flawlessly.",
            testCases: [
              {
                id: 1,
                name: "Uncontrolled mode updates internal value",
                input: "setState updates default state",
                expected: "opened",
                testFn: "const [val, setVal] = useControlledState({ default: 'closed' }); return setVal('opened');"
              },
              {
                id: 2,
                name: "Controlled mode reflects external prop value",
                input: "controlled: 'fixed'",
                expected: "fixed",
                testFn: "const [val] = useControlledState({ controlled: 'fixed', default: 'ignored' }); return val;"
              },
              {
                id: 3,
                name: "Supports functional updater syntax",
                input: "setVal(prev => prev + 1)",
                expected: 6,
                testFn: "const [val, setVal] = useControlledState({ default: 5 }); return setVal(prev => prev + 1);"
              }
            ]
          },
          Hard: {
            id: "zero-rerender-form-hard",
            title: "Zero Re-render Form State Engine (React Hook Form Core)",
            difficulty: "Hard",
            concept: "Uncontrolled Refs with Event Subscriptions for High-Performance Forms",
            description: "Implement `createFormEngine(initialValues)` that registers input fields via refs, tracks touched and dirty states, validates fields without re-rendering parent components, and returns serialized values on submit.",
            starterCode: `/**
 * Micro form engine utilizing uncontrolled ref subscriptions to eliminate re-renders.
 */
function createFormEngine(initialValues = {}) {
  const values = { ...initialValues };
  const touched = new Set();
  const errors = {};

  return {
    register(name, validator) {
      return {
        name,
        onChange(val) {
          values[name] = val;
          touched.add(name);
          if (validator) {
            const err = validator(val);
            if (err) errors[name] = err;
            else delete errors[name];
          }
        },
        onBlur() {
          touched.add(name);
        }
      };
    },
    getValues() {
      return { ...values };
    },
    getErrors() {
      return { ...errors };
    },
    isValid() {
      return Object.keys(errors).length === 0;
    }
  };
}
`,
            interviewTrap: "Storing form values in top-level useState forces the entire form component tree to re-render on every keystroke. Using uncontrolled ref-based subscription isolated to inputs scales to thousands of inputs smoothly.",
            testCases: [
              {
                id: 1,
                name: "Updates field value on change without external rerenders",
                input: "email field updated to alex@test.com",
                expected: { email: "alex@test.com" },
                testFn: "const form = createFormEngine(); const emailField = form.register('email'); emailField.onChange('alex@test.com'); return form.getValues();"
              },
              {
                id: 2,
                name: "Validates field and records error message",
                input: "password field fails length validator",
                expected: { password: "Too short" },
                testFn: "const form = createFormEngine(); const pass = form.register('password', val => val.length < 8 ? 'Too short' : null); pass.onChange('123'); return form.getErrors();"
              },
              {
                id: 3,
                name: "Accurately calculates overall form validity status",
                input: "check isValid() when errors exist vs cleared",
                expected: true,
                testFn: "const form = createFormEngine(); const name = form.register('name', v => !v ? 'Required' : null); name.onChange('Antigravity'); return form.isValid();"
              }
            ]
          }
        }
      },
      {
        id: "custom-hooks-reducer",
        title: "Custom Hooks & State Reducer Pattern",
        tag: "State Reducer",
        summary: "Inversion of control with useReducer, action interceptors, state machines, and headless hook logic.",
        mentalModel: "The State Reducer pattern allows the consumer of a custom hook to intercept and customize state transitions before they are committed, giving developers total control without modifying hook internals.",
        traps: "Mutating state inside a reducer violates pure function rules and causes React to miss re-renders.",
        challenges: {
          Basic: {
            id: "use-counter-constraints-basic",
            title: "Bounded Counter Hook with Step & Clamp Constraints",
            difficulty: "Basic",
            concept: "Custom Hook Composition & State Guards",
            description: "Implement `createCounter({ min, max, initial, step })` with `increment()`, `decrement()`, `reset()`, and `setValue(val)` ensuring the value is strictly clamped between `min` and `max`.",
            starterCode: `/**
 * Creates a bounded counter state manager respecting min/max clamps.
 */
function createCounter({ min = 0, max = 100, initial = 0, step = 1 } = {}) {
  let val = Math.min(Math.max(initial, min), max);

  return {
    get value() { return val; },
    increment() {
      val = Math.min(val + step, max);
      return val;
    },
    decrement() {
      val = Math.max(val - step, min);
      return val;
    },
    setValue(next) {
      val = Math.min(Math.max(next, min), max);
      return val;
    },
    reset() {
      val = Math.min(Math.max(initial, min), max);
      return val;
    }
  };
}
`,
            interviewTrap: "Failing to clamp the initial value or direct setValue input leads to invalid boundary violations in child consumers.",
            testCases: [
              {
                id: 1,
                name: "Increments and decrements within bounds",
                input: "increment from 0 with step 5",
                expected: 5,
                testFn: "const c = createCounter({ min: 0, max: 10, initial: 0, step: 5 }); return c.increment();"
              },
              {
                id: 2,
                name: "Clamps strictly at maximum threshold",
                input: "incrementing past max limit",
                expected: 10,
                testFn: "const c = createCounter({ min: 0, max: 10, initial: 8, step: 5 }); return c.increment();"
              },
              {
                id: 3,
                name: "Resets cleanly to initial value",
                input: "modify value then call reset()",
                expected: 2,
                testFn: "const c = createCounter({ min: 0, max: 10, initial: 2 }); c.setValue(9); c.reset(); return c.value;"
              }
            ]
          },
          Medium: {
            id: "use-undo-redo-medium",
            title: "Undo/Redo State Machine with History Stack",
            difficulty: "Medium",
            concept: "Immutable History State Reducer",
            description: "Implement `createUndoRedo(initialPresent)` supporting `set(newPresent)`, `undo()`, `redo()`, `canUndo()`, and `canRedo()`. Setting a new value clears the future stack.",
            starterCode: `/**
 * Manages an immutable past/present/future history timeline.
 */
function createUndoRedo(initialPresent) {
  let past = [];
  let present = initialPresent;
  let future = [];

  return {
    get present() { return present; },
    set(newPresent) {
      if (newPresent === present) return;
      past.push(present);
      present = newPresent;
      future = []; // Clear redo stack on new action
    },
    undo() {
      if (past.length === 0) return false;
      future.unshift(present);
      present = past.pop();
      return true;
    },
    redo() {
      if (future.length === 0) return false;
      past.push(present);
      present = future.shift();
      return true;
    },
    canUndo() { return past.length > 0; },
    canRedo() { return future.length > 0; }
  };
}
`,
            interviewTrap: "A common bug is forgetting to clear the future/redo stack when a new mutation is made after an undo, resulting in corrupted parallel history timelines.",
            testCases: [
              {
                id: 1,
                name: "Performs basic undo and restores previous state",
                input: "set 1, set 2, undo()",
                expected: 1,
                testFn: "const hist = createUndoRedo(0); hist.set(1); hist.set(2); hist.undo(); return hist.present;"
              },
              {
                id: 2,
                name: "New mutation after undo clears the redo stack",
                input: "undo, then set 3 -> canRedo must be false",
                expected: false,
                testFn: "const hist = createUndoRedo(0); hist.set(1); hist.undo(); hist.set(99); return hist.canRedo();"
              },
              {
                id: 3,
                name: "Redo restores undone state",
                input: "undo then redo",
                expected: 1,
                testFn: "const hist = createUndoRedo(0); hist.set(1); hist.undo(); hist.redo(); return hist.present;"
              }
            ]
          },
          Hard: {
            id: "state-reducer-inversion-hard",
            title: "Inversion of Control via Custom State Reducer",
            difficulty: "Hard",
            concept: "State Reducer Pattern & Middleware Action Interception",
            description: "Implement `createReducibleStore(baseReducer, initialState, customReducer)` where state transitions run through `customReducer(state, action, defaultNextState)` before updating, allowing callers to override or prevent specific actions.",
            starterCode: `/**
 * Downshift-style State Reducer enabling consumer action overrides.
 */
function createReducibleStore(baseReducer, initialState, customReducer) {
  let state = initialState;

  return {
    getState() { return state; },
    dispatch(action) {
      const defaultNextState = baseReducer(state, action);
      if (typeof customReducer === 'function') {
        state = customReducer(state, action, defaultNextState);
      } else {
        state = defaultNextState;
      }
      return state;
    }
  };
}
`,
            interviewTrap: "The State Reducer pattern (popularized by Downshift) empowers library users to block specific internal actions (e.g. preventing a dropdown from closing on Enter) without forking the component.",
            testCases: [
              {
                id: 1,
                name: "Executes default reducer transitions normally",
                input: "dispatch INCREMENT",
                expected: { count: 1 },
                testFn: "const base = (s, a) => a.type === 'INC' ? { count: s.count + 1 } : s; const store = createReducibleStore(base, { count: 0 }); store.dispatch({ type: 'INC' }); return store.getState();"
              },
              {
                id: 2,
                name: "User custom reducer intercepts and overrides specific actions",
                input: "custom reducer blocks decrement below zero",
                expected: { count: 0 },
                testFn: "const base = (s, a) => a.type === 'DEC' ? { count: s.count - 1 } : s; const custom = (s, a, next) => next.count < 0 ? s : next; const store = createReducibleStore(base, { count: 0 }, custom); store.dispatch({ type: 'DEC' }); return store.getState();"
              },
              {
                id: 3,
                name: "Preserves state identity when actions are blocked",
                input: "verify state object reference equality when action is prevented",
                expected: true,
                testFn: "const base = (s) => ({ ...s }); const custom = (s) => s; const initial = { val: 1 }; const store = createReducibleStore(base, initial, custom); store.dispatch({ type: 'TEST' }); return store.getState() === initial;"
              }
            ]
          }
        }
      }
    ]
  },
  {
    id: "suspense-error-boundaries-ssr",
    category: "7. Suspense, Error Boundaries & Streaming SSR",
    badge: "Suspense & Server",
    description: "Master Promise throwing suspension, error boundaries, streaming SSR, and Selective Hydration.",
    topics: [
      {
        id: "suspense-error-boundaries",
        title: "Suspense Internals & Error Boundaries",
        tag: "Suspense",
        summary: "Promise suspension protocol, componentDidCatch, getDerivedStateFromError, fallback boundaries, and recovery.",
        mentalModel: "When a component suspends, it throws a Promise up the Fiber tree. React catches the promise, pauses the render phase for that branch, renders the nearest Suspense fallback, and resumes when the promise resolves.",
        traps: "Suspense cannot catch errors inside event handlers or setTimeout. Calling wrapPromise inside the render function creates a new promise every render, causing infinite suspend loops.",
        challenges: {
          Basic: {
            id: "suspense-resource-wrapper-basic",
            title: "Suspense Resource Promise Wrapper (wrapPromise)",
            difficulty: "Basic",
            concept: "Suspense Protocol: Throwing Promises on Pending State",
            description: "Implement `wrapPromise(promise)` that returns an object with a `read()` method. If the promise is pending, `read()` MUST throw the promise itself. If rejected, it throws the error. If resolved, it returns the resolved data.",
            starterCode: `/**
 * Converts a native Promise into a React Suspense-compatible resource.
 */
function wrapPromise(promise) {
  let status = 'pending';
  let result;
  const suspender = promise.then(
    res => {
      status = 'success';
      result = res;
    },
    err => {
      status = 'error';
      result = err;
    }
  );

  return {
    read() {
      if (status === 'pending') {
        throw suspender;
      } else if (status === 'error') {
        throw result;
      } else if (status === 'success') {
        return result;
      }
    }
  };
}
`,
            interviewTrap: "Throwing a promise is how React Suspense detects async loading. If wrapPromise is instantiated inside the render body instead of cached, a new Promise is created on every render, locking the UI in an infinite suspension loop.",
            testCases: [
              {
                id: 1,
                name: "Throws the suspender promise while pending",
                input: "resource.read() on pending promise throws Promise",
                expected: true,
                testFn: "const p = new Promise(() => {}); const resource = wrapPromise(p); try { resource.read(); return false; } catch (thrown) { return thrown instanceof Promise; }"
              },
              {
                id: 2,
                name: "Returns data synchronously once resolved",
                input: "resource.read() after promise resolution",
                expected: "DataLoaded",
                testFn: "const p = Promise.resolve('DataLoaded'); const resource = wrapPromise(p); return p.then(() => resource.read());"
              },
              {
                id: 3,
                name: "Throws error when rejected",
                input: "resource.read() on rejected promise",
                expected: "NetworkFail",
                testFn: "const p = Promise.reject(new Error('NetworkFail')); const resource = wrapPromise(p); return p.catch(() => {}).then(() => { try { resource.read(); return false; } catch (e) { return e.message; } });"
              }
            ]
          },
          Medium: {
            id: "resilient-error-boundary-medium",
            title: "Resilient Error Boundary State Machine with Reset Trigger",
            difficulty: "Medium",
            concept: "Error Boundary Lifecycle & Recovery Coordination",
            description: "Implement `createErrorBoundaryManager({ fallbackRenderer, onError })` that intercepts component exceptions, transitions to an error state with the captured error info, and provides a `reset()` method to restore normal rendering.",
            starterCode: `/**
 * Simulates the Error Boundary state lifecycle and recovery mechanics.
 */
function createErrorBoundaryManager({ fallbackRenderer, onError } = {}) {
  let state = { hasError: false, error: null };

  return {
    getState() { return state; },
    catchError(error) {
      state = { hasError: true, error };
      if (typeof onError === 'function') onError(error);
    },
    reset() {
      state = { hasError: false, error: null };
    },
    render(childRenderer) {
      if (state.hasError) {
        return fallbackRenderer ? fallbackRenderer(state.error, () => this.reset()) : null;
      }
      return childRenderer();
    }
  };
}
`,
            interviewTrap: "Error boundaries do NOT catch errors in: event handlers, asynchronous code (setTimeout), server-side rendering, or errors thrown in the error boundary itself.",
            testCases: [
              {
                id: 1,
                name: "Catches runtime error and activates fallback renderer",
                input: "catchError then render",
                expected: "Fallback: Crash",
                testFn: "const eb = createErrorBoundaryManager({ fallbackRenderer: (err) => 'Fallback: ' + err.message }); eb.catchError(new Error('Crash')); return eb.render(() => 'Child');"
              },
              {
                id: 2,
                name: "Reset method clears error state and restores child renderer",
                input: "reset restores child rendering",
                expected: "ChildHealthy",
                testFn: "const eb = createErrorBoundaryManager({ fallbackRenderer: (err, reset) => { reset(); return 'resetting'; } }); eb.catchError(new Error('Crash')); eb.reset(); return eb.render(() => 'ChildHealthy');"
              },
              {
                id: 3,
                name: "Invokes onError callback with diagnostic error",
                input: "captured error passed to onError",
                expected: "LoggedError",
                testFn: "let logged = ''; const eb = createErrorBoundaryManager({ onError: e => logged = e.message }); eb.catchError(new Error('LoggedError')); return logged;"
              }
            ]
          },
          Hard: {
            id: "suspense-cache-dedup-hard",
            title: "Concurrent Suspense Resource Cache with Deduplication",
            difficulty: "Hard",
            concept: "Resource Keying, Concurrent Request Deduplication & Invalidation",
            description: "Implement `createSuspenseCache()` with `get(key, fetcher)` that deduplicates in-flight promises across concurrent suspended components, caches resolved results, and supports selective `invalidate(key)`.",
            starterCode: `/**
 * Shared Suspense resource cache with concurrent promise deduplication.
 */
function createSuspenseCache() {
  const cache = new Map();

  return {
    get(key, fetcher) {
      if (cache.has(key)) {
        return cache.get(key);
      }
      const record = { status: 'pending', value: null, promise: null };
      record.promise = fetcher()
        .then(val => {
          record.status = 'success';
          record.value = val;
        })
        .catch(err => {
          record.status = 'error';
          record.value = err;
        });

      record.read = function() {
        if (record.status === 'pending') throw record.promise;
        if (record.status === 'error') throw record.value;
        return record.value;
      };

      cache.set(key, record);
      return record;
    },
    invalidate(key) {
      cache.delete(key);
    },
    clear() {
      cache.clear();
    }
  };
}
`,
            interviewTrap: "Without request deduplication in a shared Suspense cache, three child components suspending on the same user ID will fire three redundant network requests simultaneously.",
            testCases: [
              {
                id: 1,
                name: "Deduplicates multiple calls for identical key to single fetch invocation",
                input: "two calls to cache.get('u1')",
                expected: 1,
                testFn: "const cache = createSuspenseCache(); let fetches = 0; const fetcher = () => { fetches++; return Promise.resolve(42); }; cache.get('u1', fetcher); cache.get('u1', fetcher); return fetches;"
              },
              {
                id: 2,
                name: "Invalidation causes subsequent call to fetch fresh data",
                input: "invalidate('u1') forces re-fetch",
                expected: 2,
                testFn: "const cache = createSuspenseCache(); let fetches = 0; const fetcher = () => { fetches++; return Promise.resolve(42); }; cache.get('u1', fetcher); cache.invalidate('u1'); cache.get('u1', fetcher); return fetches;"
              },
              {
                id: 3,
                name: "Suspends correctly on pending record",
                input: "record.read() throws pending promise",
                expected: true,
                testFn: "const cache = createSuspenseCache(); const record = cache.get('u2', () => new Promise(() => {})); try { record.read(); return false; } catch (p) { return p instanceof Promise; }"
              }
            ]
          }
        }
      },
      {
        id: "rsc-streaming-hydration",
        title: "React Server Components (RSC) & Streaming Hydration",
        tag: "RSC & SSR",
        summary: "RSC flight data wire format, Server vs Client boundary, module references, and Selective Hydration.",
        mentalModel: "React Server Components execute strictly on the server and stream a JSON-like Flight wire format (not HTML, not JS bundle). Client components are represented as module references ($L/esm) that hydrate selectively.",
        traps: "Passing non-serializable values (functions, class instances) across the RSC boundary throws serialization errors.",
        challenges: {
          Basic: {
            id: "rsc-flight-parser-basic",
            title: "RSC Flight Wire Format Parser",
            difficulty: "Basic",
            concept: "RSC Serialization Protocol & Client Reference Deserialization",
            description: "Implement `parseRscFlightPayload(wireText)` that parses RSC stream chunks into an element dictionary.",
            starterCode: `/**
 * Parses React Server Component Flight wire format stream chunks.
 */
function parseRscFlightPayload(wireText) {
  const lines = wireText.trim().split(/[\\r\\n]+/);
  const chunks = {};

  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const id = line.slice(0, colonIdx);
    const jsonStr = line.slice(colonIdx + 1);
    chunks[id] = JSON.parse(jsonStr);
  }

  return chunks;
}
`,
            interviewTrap: "RSC does not replace SSR. SSR sends initial static HTML for fast First Contentful Paint. RSC sends an interactive component model that avoids bundling server dependencies into the client JavaScript bundle.",
            testCases: [
              {
                id: 1,
                name: "Parses single flight chunk",
                input: "0:{\"type\":\"div\"}",
                expected: { "0": { type: "div" } },
                testFn: "return parseRscFlightPayload('0:{\"type\":\"div\"}');"
              },
              {
                id: 2,
                name: "Parses multiple indexed flight chunks across newlines",
                input: "0:{\"a\":1}\\n1:{\"b\":2}",
                expected: { "0": { a: 1 }, "1": { b: 2 } },
                testFn: "return parseRscFlightPayload(['0:{\"a\":1}', '1:{\"b\":2}'].join(String.fromCharCode(10)));"
              },
              {
                id: 3,
                name: "Correctly parses client module reference string tokens",
                input: "M1:\"$LClient\"",
                expected: "$LClient",
                testFn: "const res = parseRscFlightPayload('M1:\"$LClient\"'); return res.M1;"
              }
            ]
          },
          Medium: {
            id: "selective-hydration-queue-medium",
            title: "Selective Hydration Priority Queue Simulator",
            difficulty: "Medium",
            concept: "Event-Driven Hydration Prioritization (React 18 Selective Hydration)",
            description: "Implement `createHydrationScheduler(chunks)` that hydrates chunks in background order unless a user click event occurs on a specific chunk, which immediately elevates that chunk to the front of the hydration queue.",
            starterCode: `/**
 * Simulates React 18 event-driven selective hydration prioritization.
 */
function createHydrationScheduler(initialChunks = []) {
  let queue = [...initialChunks];
  const hydrated = new Set();

  return {
    userInteractedWith(chunkId) {
      const idx = queue.indexOf(chunkId);
      if (idx > -1) {
        queue.splice(idx, 1);
        queue.unshift(chunkId);
      }
    },
    hydrateNext() {
      if (queue.length === 0) return null;
      const next = queue.shift();
      hydrated.add(next);
      return next;
    },
    getPending() { return [...queue]; },
    isHydrated(chunkId) { return hydrated.has(chunkId); }
  };
}
`,
            interviewTrap: "In traditional SSR, the user must wait for the entire page to hydrate before any button responds. React 18 Selective Hydration intercepts clicks on un-hydrated islands and hydrates them synchronously before dispatching the event.",
            testCases: [
              {
                id: 1,
                name: "Hydrates chunks in sequential queue order by default",
                input: "hydrateNext from ['c1', 'c2']",
                expected: "c1",
                testFn: "const sched = createHydrationScheduler(['c1', 'c2']); return sched.hydrateNext();"
              },
              {
                id: 2,
                name: "User interaction jumps chunk to front of hydration queue",
                input: "click on c3 moves it ahead of c1 and c2",
                expected: "c3",
                testFn: "const sched = createHydrationScheduler(['c1', 'c2', 'c3']); sched.userInteractedWith('c3'); return sched.hydrateNext();"
              },
              {
                id: 3,
                name: "Correctly records and tracks hydrated chunks",
                input: "isHydrated('c1') after hydrateNext()",
                expected: true,
                testFn: "const sched = createHydrationScheduler(['c1', 'c2']); sched.hydrateNext(); return sched.isHydrated('c1');"
              }
            ]
          },
          Hard: {
            id: "rsc-boundary-serialization-hard",
            title: "RSC Server-to-Client Boundary Serialization Validator",
            difficulty: "Hard",
            concept: "Boundary Serialization Rules & Non-Serializable Props Rejection",
            description: "Implement `validateRscBoundaryProps(props)` that recursively inspects props passed to a Client Component from a Server Component. It must return `{ valid: true }` for JSON-serializable primitives/arrays/objects and throw a descriptive TypeError if a function or non-serializable symbol is detected.",
            starterCode: `/**
 * Validates props passed across the React Server Component boundary.
 */
function validateRscBoundaryProps(props) {
  function check(val, path) {
    if (val === null || val === undefined) return;
    if (typeof val === 'function') {
      throw new TypeError('Cannot pass function across Server-to-Client boundary at prop: ' + path);
    }
    if (typeof val === 'symbol') {
      throw new TypeError('Cannot pass symbol across Server-to-Client boundary at prop: ' + path);
    }
    if (typeof val === 'object') {
      for (const [k, v] of Object.entries(val)) {
        check(v, path ? path + '.' + k : k);
      }
    }
  }

  check(props, '');
  return { valid: true };
}
`,
            interviewTrap: "You cannot pass an onClick handler function from a Server Component to a Client Component because Server Components cannot send executable JavaScript across the network wire.",
            testCases: [
              {
                id: 1,
                name: "Validates JSON-serializable data structures cleanly",
                input: "{ title: 'Hello', count: 42, tags: ['a', 'b'] }",
                expected: true,
                testFn: "return validateRscBoundaryProps({ title: 'Hello', count: 42, tags: ['a', 'b'] }).valid;"
              },
              {
                id: 2,
                name: "Throws TypeError when passing functions across boundary",
                input: "{ onClick: () => {} }",
                expected: "Cannot pass function across Server-to-Client boundary at prop: onClick",
                testFn: "try { validateRscBoundaryProps({ onClick: () => {} }); return 'no-error'; } catch (e) { return e.message; }"
              },
              {
                id: 3,
                name: "Detects deeply nested non-serializable properties with exact path",
                input: "{ config: { callback: fn } }",
                expected: "Cannot pass function across Server-to-Client boundary at prop: config.callback",
                testFn: "try { validateRscBoundaryProps({ config: { callback: () => {} } }); return 'no-error'; } catch (e) { return e.message; }"
              }
            ]
          }
        }
      }
    ]
  },
  {
    id: "compiler-custom-reconciler",
    category: "8. React Internals: Compiler & Custom Reconcilers",
    badge: "Compiler & Internals",
    description: "Explore the React Compiler (Forget) auto-memoization mechanics and custom host renderers via react-reconciler.",
    topics: [
      {
        id: "compiler-forget-internals",
        title: "React Compiler (Forget) & Static Analysis",
        tag: "React Compiler",
        summary: "Auto-memoization, reactive scope inference, memo cache slots, and purity rule enforcement.",
        mentalModel: "The React Compiler analyzes the Control Flow Graph (CFG) at build time, identifying reactive values and automatically wrapping computations and JSX in memo caches, rendering manual useMemo and useCallback obsolete.",
        traps: "Mutating props, mutating state, or calling impure functions breaks the compiler's static safety guarantees.",
        challenges: {
          Basic: {
            id: "compiler-purity-linter-basic",
            title: "Static Purity Rule Analyzer for React Compiler",
            difficulty: "Basic",
            concept: "Rules of React Violation Detection for Compiler Optimization",
            description: "Implement `analyzeHookPurity(codeString)` that scans a function body for illegal mutations like `props.x =` or direct `state.x =` mutations, returning `{ compilable: boolean, violations: string[] }`.",
            starterCode: `/**
 * Statically detects purity violations that disqualify components from React Compiler optimizations.
 */
function analyzeHookPurity(codeString) {
  const violations = [];
  if (/props\\.[a-zA-Z0-9_$]+(\\s*)=/.test(codeString)) {
    violations.push('Direct mutation of props');
  }
  if (/state\\.[a-zA-Z0-9_$]+(\\s*)=/.test(codeString)) {
    violations.push('Direct mutation of state');
  }
  return {
    compilable: violations.length === 0,
    violations
  };
}
`,
            interviewTrap: "If a component mutates existing props or state objects, the React Compiler marks the component as 'un-optimizable' and falls back to standard non-memoized compilation.",
            testCases: [
              {
                id: 1,
                name: "Approves clean pure functional component code",
                input: "const double = count * 2; return double;",
                expected: true,
                testFn: "return analyzeHookPurity('const double = count * 2; return double;').compilable;"
              },
              {
                id: 2,
                name: "Catches direct props mutation violation",
                input: "props.name = 10",
                expected: ["Direct mutation of props"],
                testFn: "return analyzeHookPurity('function Comp(props) { props.name = 10; }').violations;"
              },
              {
                id: 3,
                name: "Catches direct state mutation violation",
                input: "state.count = 10",
                expected: false,
                testFn: "return analyzeHookPurity('function Comp() { state.count = 10; }').compilable;"
              }
            ]
          },
          Medium: {
            id: "compiler-memo-cache-medium",
            title: "Compiler Memo Cache Slot Simulator (c[0], c[1])",
            difficulty: "Medium",
            concept: "React Compiler $empty Cache Slot Reuse Mechanics",
            description: "Implement `createMemoCache(size)` that provides `useMemoBlock(slotIndex, inputs, computeFn)` emulating the compiled output of the React Compiler with cache slot checks.",
            starterCode: `/**
 * Simulates React Compiler indexed memo cache slot array.
 */
function createMemoCache(size = 10) {
  const cache = new Array(size);
  const EMPTY = Symbol('empty');
  for (let i = 0; i < size; i++) cache[i] = EMPTY;

  return {
    useMemoBlock(slotIndex, inputs, computeFn) {
      const slot = cache[slotIndex];
      if (slot !== EMPTY && Array.isArray(slot.inputs)) {
        const inputsUnchanged = inputs.every((val, i) => val === slot.inputs[i]);
        if (inputsUnchanged) {
          return slot.result;
        }
      }
      const result = computeFn();
      cache[slotIndex] = { inputs: [...inputs], result };
      return result;
    }
  };
}
`,
            interviewTrap: "The React Compiler transforms complex components into indexed memo cache lookups: let t0 = $empty; if ($[0] !== a) { t0 = compute(a); $[0] = a; $[1] = t0; }, minimizing allocation overhead.",
            testCases: [
              {
                id: 1,
                name: "Computes and returns value on initial slot read",
                input: "useMemoBlock with 2 + 2",
                expected: 4,
                testFn: "const c = createMemoCache(4); return c.useMemoBlock(0, [2], () => 2 + 2);"
              },
              {
                id: 2,
                name: "Returns cached result without invoking compute function when inputs match",
                input: "second call with identical input [2]",
                expected: 1,
                testFn: "const c = createMemoCache(4); let runs = 0; c.useMemoBlock(0, [2], () => { runs++; return 4; }); c.useMemoBlock(0, [2], () => { runs++; return 4; }); return runs;"
              },
              {
                id: 3,
                name: "Re-computes value when input changes",
                input: "input changes from [2] to [3]",
                expected: 6,
                testFn: "const c = createMemoCache(4); c.useMemoBlock(0, [2], () => 4); return c.useMemoBlock(0, [3], () => 6);"
              }
            ]
          },
          Hard: {
            id: "reconciler-dirty-subgraph-hard",
            title: "Reconciler Minimal Dirty Sub-tree Invalidation",
            difficulty: "Hard",
            concept: "Fiber Invalidation Propagation & Bailout Detection",
            description: "Implement `calculateDirtySubtree(rootFiber, changedFiberId)` that traverses a tree of fiber nodes and returns a list of fiber IDs that must re-render, bailing out of branches whose props and state did not change.",
            starterCode: `/**
 * Computes minimal dirty fiber nodes invalidation list.
 */
function calculateDirtySubtree(root, targetId) {
  const dirty = [];

  function markAndCollect(node) {
    if (!node) return;
    if (node.id === targetId || node.hasChanged) {
      dirty.push(node.id);
      for (const child of node.children || []) {
        if (!child.isMemoized) {
          dirty.push(child.id);
        }
      }
      return;
    }
    for (const child of node.children || []) {
      markAndCollect(child);
    }
  }

  markAndCollect(root);
  return dirty;
}
`,
            interviewTrap: "React's bailout mechanism skips an entire subtree only if both props AND context AND state have reference equality with workInProgress fiber counterparts.",
            testCases: [
              {
                id: 1,
                name: "Identifies changed node and non-memoized children",
                input: "node A changes with un-memoized child B",
                expected: ["A", "B"],
                testFn: "const tree = { id: 'root', children: [{ id: 'A', children: [{ id: 'B', isMemoized: false }] }] }; return calculateDirtySubtree(tree, 'A');"
              },
              {
                id: 2,
                name: "Bails out on memoized child nodes",
                input: "node A changes with memoized child C",
                expected: ["A"],
                testFn: "const tree = { id: 'root', children: [{ id: 'A', children: [{ id: 'C', isMemoized: true }] }] }; return calculateDirtySubtree(tree, 'A');"
              },
              {
                id: 3,
                name: "Unaffected sibling branches are completely untouched",
                input: "mutation in A does not touch branch D",
                expected: false,
                testFn: "const tree = { id: 'root', children: [{ id: 'A', children: [] }, { id: 'D', children: [] }] }; const dirty = calculateDirtySubtree(tree, 'A'); return dirty.includes('D');"
              }
            ]
          }
        }
      },
      {
        id: "custom-reconciler",
        title: "Custom Reconcilers: Host Config & react-reconciler",
        tag: "Custom Reconciler",
        summary: "createInstance, appendInitialChild, commitUpdate, and host config implementations for non-DOM platforms.",
        mentalModel: "React Reconciler is platform-agnostic. By defining a Host Config object with methods like createInstance, createTextInstance, and appendChild, React can render to Canvas, Three.js, PDF, or Terminal.",
        traps: "Mutating the host instance during the render phase causes visual tearing and concurrent mode corruption. Mutations belong strictly in the commit phase.",
        challenges: {
          Basic: {
            id: "custom-reconciler-mini-basic",
            title: "Mini JSON Virtual Tree Host Reconciler",
            difficulty: "Basic",
            concept: "Host Config Interface: createInstance & appendChild",
            description: "Implement `createMiniReconciler()` with `createInstance(type, props)`, `createTextInstance(text)`, and `appendChild(parent, child)` producing a pure JavaScript object tree representing the host structure.",
            starterCode: `/**
 * Implements the core Host Config abstraction for custom rendering.
 */
function createMiniReconciler() {
  return {
    createInstance(type, props = {}) {
      return {
        type,
        props: { ...props },
        children: []
      };
    },
    createTextInstance(text) {
      return {
        type: 'TEXT',
        text: String(text)
      };
    },
    appendChild(parent, child) {
      parent.children.push(child);
    }
  };
}
`,
            interviewTrap: "React separates the reconciliation algorithm (reconciler) from the host mutation operations (renderer). This abstraction powers React Native, React Three Fiber, and Ink.",
            testCases: [
              {
                id: 1,
                name: "Creates host element instance with props",
                input: "createInstance('view', { color: 'blue' })",
                expected: { type: "view", props: { color: "blue" }, children: [] },
                testFn: "const r = createMiniReconciler(); return r.createInstance('view', { color: 'blue' });"
              },
              {
                id: 2,
                name: "Creates text instance",
                input: "createTextInstance('Hello')",
                expected: { type: "TEXT", text: "Hello" },
                testFn: "const r = createMiniReconciler(); return r.createTextInstance('Hello');"
              },
              {
                id: 3,
                name: "Appends children into tree hierarchy accurately",
                input: "append text child to container",
                expected: 1,
                testFn: "const r = createMiniReconciler(); const parent = r.createInstance('container'); const text = r.createTextInstance('Hi'); r.appendChild(parent, text); return parent.children.length;"
              }
            ]
          },
          Medium: {
            id: "canvas-grid-reconciler-medium",
            title: "Terminal / Canvas 2D Text Buffer Reconciler",
            difficulty: "Medium",
            concept: "Host Config Mutation & Canvas Grid Painting",
            description: "Implement `createGridRenderer(width, height)` that mounts instances with `{ x, y, char }` props onto a 2D character buffer and renders the composed screen string via `renderScreen()`.",
            starterCode: `/**
 * Renders virtual React elements onto an ASCII 2D grid matrix.
 */
function createGridRenderer(width = 10, height = 5) {
  const grid = Array.from({ length: height }, () => Array(width).fill('.'));

  return {
    createInstance(type, props) {
      return { type, props: { ...props } };
    },
    commitMount(instance) {
      const { x, y, char = '#' } = instance.props;
      if (y >= 0 && y < height && x >= 0 && x < width) {
        grid[y][x] = char;
      }
    },
    renderScreen() {
      return grid.map(row => row.join('')).join('|');
    }
  };
}
`,
            interviewTrap: "Host configs provide commitMount or finalizeInitialChildren to perform post-insertion side-effects like focusing inputs or painting coordinates.",
            testCases: [
              {
                id: 1,
                name: "Mounts character at specific x, y coordinate",
                input: "place '@' at x: 1, y: 1 in 3x3 grid",
                expected: "...|.@.|...",
                testFn: "const r = createGridRenderer(3, 3); const node = r.createInstance('char', { x: 1, y: 1, char: '@' }); r.commitMount(node); return r.renderScreen();"
              },
              {
                id: 2,
                name: "Renders composite 2D grid screen string with multiple instances",
                input: "render two chars on screen",
                expected: "X.O",
                testFn: "const r = createGridRenderer(3, 1); r.commitMount(r.createInstance('c', { x: 0, y: 0, char: 'X' })); r.commitMount(r.createInstance('c', { x: 2, y: 0, char: 'O' })); return r.renderScreen();"
              },
              {
                id: 3,
                name: "Ignores out-of-bounds coordinates safely without crash",
                input: "place char at x: 99, y: 99",
                expected: "...",
                testFn: "const r = createGridRenderer(3, 1); r.commitMount(r.createInstance('c', { x: 99, y: 99, char: 'Z' })); return r.renderScreen();"
              }
            ]
          },
          Hard: {
            id: "transactional-reconciler-commit-hard",
            title: "Transactional Commit Queue with Rollback Support",
            difficulty: "Hard",
            concept: "Two-Phase Commit & Rollback on Host Mutation Failures",
            description: "Implement `createTransactionalReconciler()` that stages host mutations in a queue. If any mutation in the batch throws during commit, all previously executed mutations in that batch MUST be rolled back to their previous state.",
            starterCode: `/**
 * Reconciler commit queue with atomic rollback on mutation failure.
 */
function createTransactionalReconciler() {
  const operations = [];

  return {
    stage(op) {
      operations.push(op);
    },
    commit() {
      const executed = [];
      try {
        for (const op of operations) {
          op.execute();
          executed.push(op);
        }
        operations.length = 0;
        return { success: true };
      } catch (err) {
        while (executed.length > 0) {
          const op = executed.pop();
          op.rollback();
        }
        operations.length = 0;
        return { success: false, error: err.message };
      }
    }
  };
}
`,
            interviewTrap: "During Concurrent Mode, if React aborts a render, work-in-progress fibers are simply discarded without touching the host DOM. But once the commit phase starts, mutations must either succeed cleanly or trigger an error boundary.",
            testCases: [
              {
                id: 1,
                name: "Commits staged mutations successfully",
                input: "stage 2 ops and commit",
                expected: true,
                testFn: "let a = 0; const r = createTransactionalReconciler(); r.stage({ execute: () => a += 1, rollback: () => a -= 1 }); const res = r.commit(); return res.success && a === 1;"
              },
              {
                id: 2,
                name: "Rolls back previously executed mutations if an error occurs mid-commit",
                input: "first op modifies val, second op throws -> val restored",
                expected: 0,
                testFn: "let state = 0; const r = createTransactionalReconciler(); r.stage({ execute: () => state = 10, rollback: () => state = 0 }); r.stage({ execute: () => { throw new Error('DOM Error'); }, rollback: () => {} }); r.commit(); return state;"
              },
              {
                id: 3,
                name: "Clears staged operations queue after execution",
                input: "re-committing empty queue succeeds with no extra operations",
                expected: true,
                testFn: "const r = createTransactionalReconciler(); r.stage({ execute: () => {}, rollback: () => {} }); r.commit(); return r.commit().success;"
              }
            ]
          }
        }
      }
    ]
  }
];
