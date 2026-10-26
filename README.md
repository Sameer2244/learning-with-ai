# JS.DEPTH — End-to-End JavaScript & React Architecture Mastery Platform

> **Stop Playing the Guessing Game in Interviews.**  
> Master JavaScript and React runtime engine internals, mental models, and subtle interviewer traps with 100% offline verified test suites and authoritative architectural knowledge guides.

---

## 🚀 Quick Start

### 1. Launch with One Click
Double-click `start.bat` in this folder, or run:
```bash
npm start
```
Then visit:
- **JavaScript Engine Track**: **[http://localhost:3000](http://localhost:3000)**
- **React.js Mastery Track**: **[http://localhost:3000/react](http://localhost:3000/react)**

You can also seamlessly toggle between JavaScript and React at any time using the **Track Switcher** in the top navigation bar!

---

## ⚡ 100% Offline Verified Engine

The platform operates completely standalone with zero external or local LLM dependencies:
- **Zero API Keys or GPU Required**: Runs on any machine instantly.
- **Pre-Generated Verified JSON Answers**: Detailed, online-verified answers for all questions stored in `/json/`.
- **In-Browser Execution Sandbox**: Fast, client-side automated unit testing with immediate feedback.

---

## 📚 Curriculum Structure

### JavaScript Mastery Track (12 Categories, 24 Topics, 72 Questions across Basic/Medium/Hard)
1. **JS Engine & Memory Internals**: Execution Context & Call Stack, Scope Chain & Closures, Hoisting & TDZ, `this` Binding Rules
2. **Asynchronous JS & Concurrency**: Event Loop & Microtasks/Macrotasks, Promise Internals & Combinators, Async/Await Generators
3. **Prototypes, Objects & Type System**: Prototype Chain & Shadowing, Type Coercion Rules, Object Descriptors & Circular Deep Cloning
4. **Functional Patterns & System Polyfills**: Currying & Composition, Debounce/Throttle with leading/trailing edges, Core Array Polyfills
5. **Browser Engine & DOM Internals**: DOM Event Flow (Capturing/Target/Bubbling), Critical Rendering Path (Reflow/Repaint)
6. **React Internals in JS**: Fiber Reconciliation, Stale Closures, Re-render Cascades
7. **Garbage Collection & Memory Management**: Mark-and-Sweep, Heap Reachability, WeakMap Metadata Caches, WeakRef & Cycle Detectors
8. **Metaprogramming: Proxy & Reflect**: Property Interception, Smart Negative Indexing, Deep Reactive Observable Stores, Schema Invariants
9. **Iterators, Generators & Async Iteration**: Symbol.iterator Protocol, Infinite Sequences, Bidirectional Coroutines, Async Stream Backpressure
10. **V8 Engine Internals & Hidden Classes**: Transition Trees, Shape Stabilization, Inline Caching (Monomorphic/Polymorphic/Megamorphic), Packed SMI Arrays
11. **Binary Data, Buffers & Memory Systems**: ArrayBuffer, DataView Explicit Endianness, Base64 Bitwise Decoders, Circular Ring Buffers
12. **Module Systems: ESM vs CommonJS**: CJS require cache, ESM Live Bindings vs Value Snapshots, Circular Dependency Graph Resolution

### React.js Mastery Track (8 Categories, 19 Topics, 57 Questions across Basic/Medium/Hard)
1. **Fiber Architecture & Reconciliation**: Fiber Linked List Traversal, Diffing Algorithm & Key Traps, Render vs Commit Phase
2. **Hooks State Machine & Closures**: Hooks Linked List, Stale Closures & Functional Updates, Effect Timings (`useEffect`/`useLayoutEffect`/`useInsertionEffect`)
3. **Re-render Cascades & Performance**: Re-render Triggers & `React.memo`, Context Churn & Splitting, Component Composition over Memo
4. **Refs, DOM & Imperative Handles**: `useRef` Mutable Container vs State, `forwardRef` & `useImperativeHandle`
5. **Modern React: Concurrency & React 18/19**: `useTransition` & `useDeferredValue`, Automatic Batching vs `flushSync`
6. **Component Architecture & State Management**: Controlled vs Uncontrolled, Custom `useControlledState`, Zero Re-render Form Engines, Bounded Counters, Undo/Redo Timeline, State Reducer Pattern
7. **Suspense, Error Boundaries & Streaming SSR**: `wrapPromise` Protocol, Resilient Error Boundaries, Concurrent Suspense Caches, RSC Flight Wire Format, Selective Hydration Queue, RSC Boundary Validators
8. **React Internals: Compiler & Custom Reconcilers**: React Compiler (Forget) Purity Rules, Memo Cache Slot Arrays, Minimal Dirty Sub-tree Invalidation, Mini Host Reconcilers, 2D Grid Renderers, Transactional Commit Queues

---

## 🛠️ Features

1. **Curriculum Explorer**: Real-time topic search, status tracking, and category grouping.
2. **Curated Comprehensive Challenge Catalog**: Real-world interview problems targeting the exact tricky edge cases tested at top tech companies.
3. **The Interview Trap Decoded**: Revealing why typical candidates guess wrong and what mental model is required to solve it.
4. **In-Browser Execution Sandbox**: Live execution capturing `console.log`, return values, and automated unit test assertions.
5. **Architectural Knowledge Guides**:
   - In-depth mental models and step-by-step lifecycles
   - V8 / Fiber engine low-level mechanics
   - Big-O algorithmic and space complexity analysis
   - Online specifications and standards verification
6. **Local Persistence**: Saves your code solutions and completion progress automatically in browser storage.
7. **Strict Single JSON File Storage & Offline Architecture**:
   - **Strictly One JSON File Per Question**: 171 verified questions (JavaScript, React, System Design, Design System) each stored in exactly one individual JSON file under `./json/`.
   - **Unified Schema**: Consistent question schema across JavaScript, React, System Design, and Design System tracks.
   - **Pure Local JSON Storage**: All user-saved knowledge guides are persisted in `knowledge.json` with in-place updates (zero versioning, zero database overhead).
   - **Dedicated Saved Guides Panel**: Search, filter, view, and delete saved guides from local JSON with a single click.
