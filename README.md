# JS.DEPTH — End-to-End JavaScript & React Architecture Mastery Platform

> **Stop Playing the Guessing Game in Senior Interviews.**  
> Master JavaScript and React runtime engine internals, mental models, and subtle interviewer traps with authoritative architectural knowledge guides and staff-level concept questions.

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
- **Design System Architecture**: **[http://localhost:3000/design-system](http://localhost:3000/design-system)**
- **System Design & Servers**: **[http://localhost:3000/system-design](http://localhost:3000/system-design)**
- **Interview Problem Solving Arena**: **[http://localhost:3000/problems](http://localhost:3000/problems)** (Monaco Editor & Automated Test Runner)

You can also seamlessly toggle between tracks at any time using the **Track Switcher** in the top navigation bar!

---

## ⚡ 100% Concept-Based & Zero-Friction Learning

The platform is designed specifically for deep conceptual understanding without problem-solving editor distraction:
- **No Coding Puzzles or Test Runners**: Pure focus on reading, internalizing mental models, and mastering engine internals.
- **Interactive Staff-Level Concept Questions**: 10–15 deep architectural interview questions per topic with expandable expert answers.
- **100% Offline & Instant**: Zero external or local LLM dependencies, running instantly on any machine.
- **Dedicated Knowledge Information Arena**: Clean 2-column interface featuring Production Impact banners, Mental Models, Senior Traps, and Masterclass Guides with Prism syntax highlighting.

---

## 📚 Curriculum Structure

### JavaScript Mastery Track (12 Categories, 24 Topics)
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

### React.js Mastery Track (8 Categories, 19 Topics)
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
2. **The Interview Trap Decoded**: Revealing why typical candidates guess wrong and what mental model is required to answer correctly.
3. **Interactive Concept Question Cards**: Expand and collapse staff-level questions to read the question, why interviewers ask it, and the comprehensive answer.
4. **Architectural Knowledge Guides**:
   - In-depth mental models and step-by-step lifecycles
   - V8 / SpiderMonkey / React Fiber engine low-level mechanics
   - Big-O algorithmic and space complexity analysis
   - Online specifications and standards verification
5. **Local Persistence**: Saves your mastered progress automatically in browser storage.
6. **Strict Single JSON File Storage**:
   - All user-saved knowledge guides are persisted in `knowledge.json` with in-place updates.
   - Dedicated Saved Guides Panel to search, filter, view, and delete saved guides.
