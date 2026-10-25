# JS.DEPTH — End-to-End JavaScript & React Mastery Platform

> **Stop Playing the Guessing Game in Interviews.**  
> Master JavaScript and React runtime engine internals, mental models, and subtle interviewer traps with your local LLM (`Qwen2.5-7B-Instruct-Q4_K_M.gguf`).

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

## 🧠 Local LLM Setup & Integration

Your model is located at:
`D:\ai agents meeting\models\Qwen2.5-7B-Instruct-Q4_K_M.gguf`

The application connects to your local GPU-accelerated Ollama runtime serving `qwen2.5:7b-instruct` on `http://127.0.0.1:11434`.
- **100% Offline & Private**: Zero API keys, zero cloud costs.
- **Hardware Acceleration**: Automatically offloads layers to your NVIDIA GTX 1660 GPU for instant ~20 tok/sec generation.

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
2. **Dynamic AI Challenge Generator**: Generates novel interview problems targeting the exact tricky edge cases tested at top tech companies.
3. **The Interview Trap Decoded**: Revealing why typical candidates guess wrong and what mental model is required to solve it.
4. **In-Browser Execution Sandbox**: Live execution capturing `console.log`, return values, and timing without leaving the page.
5. **Senior Architect Post-Mortem**:
   - Correctness & edge cases evaluation
   - Step-by-step V8 / Fiber engine breakdown
   - "What to say to the interviewer" talking points
   - Clean production refactor with complexity analysis
6. **Local Persistence**: Saves your code solutions and completion progress automatically in browser storage.
7. **Dual Knowledge Storage (Local JSON vs SQLite DB)**:
   - **Interactive Storage Toggle**: Seamlessly choose whether generated knowledge guides are saved into a **Local JSON File** (`knowledge.json`) or an **SQLite DB** (`knowledge.db`).
   - **Automatic No-SQLite Fallback**: If SQLite is not installed or supported in your Node environment, the application automatically falls back to local JSON storage without errors or crashes.
   - **Instant Loading**: Previously saved guides load instantly from your selected storage without waiting on LLM re-generation.
   - **Dedicated Saved Guides Panel**: Search, filter, view, and delete saved guides from either JSON or SQLite with a single click.
