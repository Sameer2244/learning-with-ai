// Comprehensive Interview Cross-Questions & Deep Preparation Data
// Track: React.js Mastery
// Domain: 1. Fiber Architecture & Reconciliation & 2. Hooks State Machine & Closures (18 Questions)
// Questions: fiber-tree-basic, fiber-tree-medium, fiber-tree-hard,
//            keys-basic, keys-medium, keys-hard,
//            phases-basic, phases-medium, phases-hard,
//            hook-core-basic, hook-core-medium, hook-core-hard,
//            stale-effect-basic, stale-effect-medium, stale-effect-hard,
//            effect-timings-basic, effect-timings-medium, effect-timings-hard

module.exports = {
  "fiber-tree-basic": {
    interviewCrossQuestions: [
      {
        question: "What is a Fiber Node in React and how does it differ from a Virtual DOM Element?",
        answer: "A React Element is an ephemeral, immutable snapshot created by `React.createElement` on each render: `{ type, props, key }`. A Fiber Node is a persistent, mutable unit of work allocated in the reconciler (`ReactFiber.js`). Fibers carry state (`memoizedState`), props (`memoizedProps`), effect tags (`flags`), work lanes (`lanes`), and linked-list pointers (`child`, `sibling`, `return`). Elements are recreated on every render; Fibers persist across render cycles and maintain component identity.",
        difficulty: "intermediate",
        whyAsked: "Tests whether candidate understands the boundary between userland JSX elements and internal engine reconciler structures."
      },
      {
        question: "Why did React transition from recursive Stack Reconciler to linked-list Fiber Reconciler?",
        answer: "The legacy Stack Reconciler (pre-React 16) used recursive JavaScript function calls to traverse component trees. Once started, recursion could not be paused, yielded, or aborted until the entire tree evaluated. For large component trees, this blocked the browser's single main thread for 50-100ms, dropping frames and freezing user input. Fiber converts the call stack into a singly-linked list of heap-allocated records, allowing React's work loop to pause after any unit of work and yield the main thread back to the browser.",
        difficulty: "advanced",
        whyAsked: "Tests foundational knowledge of React's architectural history and motivation for React 16+."
      },
      {
        question: "What are the core linked-list pointers on a Fiber node?",
        answer: "1) `child`: points to its first direct child fiber. 2) `sibling`: points to its next sibling fiber under the same parent. 3) `return`: points to its parent fiber (the fiber that work returns to upon completion). 4) `alternate`: points to its counterpart fiber in the dual-buffer tree (current <-> workInProgress).",
        difficulty: "basic",
        whyAsked: "Verifies basic literacy in React internal tree structures."
      },
      {
        question: "What is stored in fiber.stateNode?",
        answer: "`stateNode` holds the reference to the backing instance associated with the fiber: for host DOM components (`div`, `span`), it points to the real `HTMLDivElement` or `HTMLSpanElement`; for class components, it holds the class instance (`this`); for root fibers, it holds the `FiberRootNode`.",
        difficulty: "intermediate",
        whyAsked: "Checks how virtual fibers bridge to real host environment instances."
      },
      {
        question: "How does React avoid memory leaks when Fiber nodes are unmounted?",
        answer: "When a fiber is unmounted, React severs its `child` and `sibling` pointers, detaches its `stateNode`, and cleans up effects. This disconnects the fiber subtree from the active `FiberRootNode` reachability tree, enabling V8's Garbage Collector to sweep the unmounted fibers during the next minor/major GC cycle.",
        difficulty: "advanced",
        whyAsked: "Connects React Fiber tree management with JavaScript engine garbage collection."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "React DevTools Fiber Tree Inspection",
        description: "React DevTools inspects live components by reading `__REACT_DEVTOOLS_GLOBAL_HOOK__` which attaches to the root fiber node.",
        companies: "Meta, Next.js, Vercel",
        codeSnippet: "const rootFiber = domNode._reactRootContainer?._internalRoot?.current;"
      },
      {
        scenario: "Custom Cross-Platform Reconcilers (React Three Fiber, Ink)",
        description: "Libraries create custom Fiber trees targeting WebGL three.js scenes or terminal CLI interfaces instead of the browser DOM.",
        companies: "Poimandres (R3F), Ink CLI (Vercel)",
        codeSnippet: "import ReactReconciler from 'react-reconciler'; const MyRenderer = ReactReconciler(hostConfig);"
      }
    ],
    howToExplain: {
      opening: "A Fiber Node is React's internal representation of a unit of work. It replaces recursive call stack frames with a heap-allocated singly-linked list of pointers.",
      keyPoints: [
        "React Elements are transient descriptors; Fibers are persistent units of work.",
        "Linked-list pointers (child, sibling, return) allow pausing and resuming render passes.",
        "Stores memoizedState (hooks linked list) and memoizedProps.",
        "Alternate pointer enables double buffering without garbage collection churn."
      ],
      closingImpression: "Fiber transformed React from a simple view diffing library into a prioritized, interruptible UI operating system.",
      analogies: ["A book with bookmarks: with recursion, you must read all 500 pages in one sitting; with Fiber, you place a bookmark (pointer) after every page and can close the book to answer the phone."]
    },
    commonMistakes: [
      {
        mistake: "Assuming fiber.children is an array of child fibers.",
        why: "Fiber does not use children arrays; it uses a single `child` pointer to the first child, and subsequent children are connected via `sibling` pointers.",
        correct: "Clarify that Fiber trees use `child` and `sibling` pointers to form a singly-linked list."
      }
    ],
    followUpDeepDive: [
      {
        question: "What is Fiber tag and what are some common WorkTag constants in React source?",
        answer: "In `ReactWorkTags.js`, `tag` is a small integer: `0 = FunctionComponent`, `1 = ClassComponent`, `3 = HostRoot`, `5 = HostComponent` (HTML elements like `div`), `6 = HostText`, `11 = ForwardRef`, `14 = MemoComponent`. Switching on integer tags avoids expensive string comparisons in hot reconciliation loops.",
        specReference: "packages/react-reconciler/src/ReactWorkTags.js"
      }
    ]
  },

  "fiber-tree-medium": {
    interviewCrossQuestions: [
      {
        question: "Explain the exact order of traversal in React's work loop: beginWork vs completeWork.",
        answer: "1) `beginWork`: React descends depth-first down `fiber.child` pointers, calling component render functions and reconciling children until it reaches a leaf node (a fiber with `child === null`). 2) `completeWork`: at the leaf, React creates/updates the real host DOM node and bubbles up effect flags. If `fiber.sibling` exists, React pivots to the sibling and restarts `beginWork`. If no sibling, it bubbles up to `fiber.return`, completes the parent, and checks the parent's sibling.",
        difficulty: "advanced",
        whyAsked: "The #1 core algorithm question asked in senior/staff React engine interviews."
      },
      {
        question: "Why does completeWork run bottom-up while beginWork runs top-down?",
        answer: "Because a parent DOM element cannot append its child DOM nodes until the children have been created! `beginWork` runs top-down to determine what needs to be rendered, but `completeWork` runs bottom-up so leaf DOM nodes are created and appended to parent DOM nodes, assembling the DOM subtree before the commit phase.",
        difficulty: "advanced",
        whyAsked: "Tests understanding of host tree construction and mutation batching."
      },
      {
        question: "How does the iterative loop achieve O(1) auxiliary call stack space?",
        answer: "Standard tree recursion allocates a C++ stack frame for every depth level (O(D) call stack). Fiber's `workLoop` is a single `while (workInProgress !== null)` loop where navigation is executed via simple pointer assignments (`workInProgress = workInProgress.child` or `sibling` or `return`). The Call Stack depth remains constant at 1.",
        difficulty: "intermediate",
        whyAsked: "Tests computer science algorithmic efficiency principles."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "React 18 Concurrent Rendering Work Loop",
        description: "The core `workLoopConcurrent` in React source code traversing components while honoring time-slicing frame deadlines.",
        companies: "Meta, Next.js",
        codeSnippet: "function workLoopConcurrent() { while (workInProgress !== null && !shouldYield()) { performUnitOfWork(workInProgress); } }"
      }
    ],
    howToExplain: {
      opening: "React reconciles components using an iterative Depth-First Search with beginWork on the descent and completeWork on the ascent.",
      keyPoints: [
        "beginWork descends down child pointers, evaluating components.",
        "completeWork ascends up return pointers, building DOM instances.",
        "sibling pointers allow lateral tree traversal without recursion.",
        "Operates in O(N) time with O(1) call stack memory."
      ],
      closingImpression: "This two-pass descent-ascent traversal allows React to construct fully assembled DOM subtrees before committing to the screen in one unified batch.",
      analogies: ["A zipper: beginWork unzips down to inspect the teeth (children); completeWork zips back up, locking the assembled pieces in place."]
    },
    commonMistakes: [
      {
        mistake: "Assuming DOM nodes are attached to the document body during completeWork.",
        why: "completeWork only creates DOM nodes and attaches them to parent DOM nodes in memory (in-memory subtree). The actual insertion into the live document happens during the synchronous Commit Phase.",
        correct: "Clarify that live DOM insertion is strictly deferred to commitMutationEffects."
      }
    ],
    followUpDeepDive: [
      {
        question: "What is subtreeFlags and how does it optimize completeWork bubbling?",
        answer: "In React 18+, `subtreeFlags` is a 32-bit bitmask on each fiber that aggregates all pending mutations of its descendants. When bubbling up in `completeWork`, `parent.subtreeFlags |= (child.flags | child.subtreeFlags)`. If a parent's `subtreeFlags === 0`, React can skip scanning the entire subtree during the commit phase in O(1) time.",
        specReference: "packages/react-reconciler/src/ReactFiberCompleteWork.js"
      }
    ]
  },

  "fiber-tree-hard": {
    interviewCrossQuestions: [
      {
        question: "Explain the Double Buffering pattern in React Fiber.",
        answer: "React maintains at most two Fiber trees at any given time: 1) `current`: the tree currently rendered and visible on screen. 2) `workInProgress` (WIP): the tree being constructed and diffed in memory during the render phase. When work completes and is committed to the DOM, React simply flips a single root pointer: `fiberRoot.current = workInProgress`. The previous `current` tree becomes the pool for the next render's `workInProgress`, completely recycling fiber objects via the `alternate` pointer.",
        difficulty: "advanced",
        whyAsked: "The foundational memory management concept in React Fiber architecture."
      },
      {
        question: "How does createWorkInProgress avoid object allocation churn?",
        answer: "In `ReactFiber.js`, `createWorkInProgress(current, pendingProps)` checks if `current.alternate` already exists from a prior render. If it exists, React recycles that exact object: it resets `flags = NoFlags`, copies `pendingProps`, and reuses its existing memory allocation instead of calling `new FiberNode()`. This reduces V8 heap garbage collection pressure during rapid typing or animations.",
        difficulty: "advanced",
        whyAsked: "Tests understanding of JIT memory optimization in hot UI paths."
      },
      {
        question: "What happens to the workInProgress tree if an update is aborted or superseded by higher-priority work?",
        answer: "If higher-priority work (like user typing) interrupts low-priority work (like data fetching), React simply abandons the `workInProgress` pointer. Because no mutations have touched the host DOM (which only occurs during commit), discarding WIP leaves the visible `current` tree 100% intact with zero visual tearing.",
        difficulty: "intermediate",
        whyAsked: "Highlights the core superpower of Double Buffering in Concurrent Mode."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "High-Frequency Keystroke Input in React 18",
        description: "While a large table renders in a background transition, keystrokes discard incomplete WIP trees and render immediately without lag.",
        companies: "Notion Web, Linear, Google Sheets Web",
        codeSnippet: "startTransition(() => { setFilter(largeQuery); }); // abortable WIP work"
      }
    ],
    howToExplain: {
      opening: "React uses graphics-style Double Buffering: it diffs changes on an in-memory workInProgress tree, and atomically flips the root pointer to commit changes to the screen.",
      keyPoints: [
        "current tree represents what is on screen; workInProgress represents the next frame.",
        "Alternate pointers link corresponding nodes bidirectionally.",
        "Discarding WIP work produces zero screen artifacts (tear-free abortability).",
        "Recycles existing fiber objects to prevent V8 garbage collection stutter."
      ],
      closingImpression: "Double buffering gives React the transactional safety of a database: renders can abort cleanly, or commit atomically in a single pointer swap.",
      analogies: ["A theater stage with two rotating platforms: the audience watches actors on Stage A (current) while crew members assemble the next set on Stage B (WIP) behind the curtain; when ready, the stage rotates instantly."]
    },
    commonMistakes: [
      {
        mistake: "Thinking React allocates a brand new Fiber tree on every setState.",
        why: "React recycles the existing alternate fibers. At any time, there are at most 2 fiber instances per component.",
        correct: "State that React caps memory to two trees and reuses alternate fibers."
      }
    ],
    followUpDeepDive: [
      {
        question: "Where in React source does the atomic root pointer swap occur?",
        answer: "In `packages/react-reconciler/src/ReactFiberWorkLoop.js` inside `commitRootImpl()`, immediately after `commitMutationEffects` finishes and before `commitLayoutEffects`: `root.current = finishedWork;`.",
        specReference: "packages/react-reconciler/src/ReactFiberWorkLoop.js: commitRootImpl"
      }
    ]
  },

  "keys-basic": {
    interviewCrossQuestions: [
      {
        question: "Why does React require keys for sibling elements in an array, but NOT for adjacent elements in JSX?",
        answer: "Adjacent static JSX elements (`<div><Header /><Main /></div>`) have stable, deterministic positions in the component's AST; React identifies them by their hardcoded tree index. In contrast, array children (`items.map(...)`) can dynamically change order, be inserted, or be deleted at runtime. Without keys, React has no way to distinguish whether item 0 was modified or whether a new item was prepended to the list.",
        difficulty: "intermediate",
        whyAsked: "Clarifies why JSX elements don't always need keys, but mapped arrays do."
      },
      {
        question: "What happens under the hood if keys are duplicated among siblings?",
        answer: "React logs a development warning. During reconciliation, React's child mapping table uses keys as hash keys: a duplicate key overwrites previous sibling entries in `existingChildren` Map, causing React to treat the first duplicate as deleted and the second as an update, resulting in lost component state and erratic DOM rendering.",
        difficulty: "intermediate",
        whyAsked: "Tests understanding of key collision consequences."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Resetting Component State via Key Change",
        description: "Passing a different `key` to a form or modal (`<UserForm key={userId} />`) to tell React to discard previous component state and remount cleanly.",
        companies: "Airbnb, Shopify",
        codeSnippet: "<ChatBox key={recipientId} /> // Cleanly unmounts previous conversation state"
      }
    ],
    howToExplain: {
      opening: "Keys provide persistent identity to elements within dynamic lists, enabling React's reconciler to track items across insertions, deletions, and reorders.",
      keyPoints: [
        "Keys must be unique among siblings, but do not need to be globally unique.",
        "Missing keys disable O(1) matching and fall back to fragile index matching.",
        "Changing a key forces React to unmount the old fiber and mount a fresh one.",
        "Keys must be stable: never generate keys with Math.random() in render."
      ],
      closingImpression: "A key is not just an optimization; it is the identity contract that binds React state to a specific logical entity.",
      analogies: ["Social Security Numbers or Passport IDs: even if people change their seats in a theater, their passport ID proves who they are."]
    },
    commonMistakes: [
      {
        mistake: "Using key={Math.random()} to silence React key warnings.",
        why: "Math.random() generates a new key on every render, causing React to completely unmount and recreate the DOM node on every keystroke, destroying focus and state.",
        correct: "Use stable database IDs (item.id)."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does React extract the key prop and why is key omitted from component props?",
        answer: "When `React.createElement(type, config)` evaluates, it explicitly extracts `config.key` and `config.ref`, storing them in internal element slots (`element.key`, `element.ref`) and stripping them from `element.props`. Accessing `props.key` inside a component returns `undefined` and logs a warning.",
        specReference: "packages/react/src/jsx/ReactJSXElement.js"
      }
    ]
  },

  "keys-medium": {
    interviewCrossQuestions: [
      {
        question: "How does React's list reconciliation algorithm work in O(N) time? Explain mapRemainingChildren.",
        answer: "React executes a two-pass algorithm in `ReactChildFiber.js`: 1) **First Pass**: it walks old and new children in parallel. As long as keys match, it updates fibers in-place. If keys mismatch, the loop breaks. 2) **Second Pass**: React puts all remaining old children into a `Map<key, Fiber>` (`mapRemainingChildren`). It then loops over remaining new children, querying the Map in O(1) time. Nodes found in the Map are reused; nodes not found are created as new; nodes left in the Map after the loop are marked for deletion.",
        difficulty: "advanced",
        whyAsked: "The definitive algorithmic question for React list reconciliation."
      },
      {
        question: "What is 'lastPlacedIndex' and how does React detect if a DOM node needs to be MOVED?",
        answer: "`lastPlacedIndex` tracks the highest index in the old list that has been placed in the new list. As React iterates through new children, if a matched old fiber has `oldIndex < lastPlacedIndex`, it means the node originally appeared BEFORE a node that now appears ahead of it, so it must physically MOVE in the DOM (`Placement` flag). If `oldIndex >= lastPlacedIndex`, the relative order is preserved, and `lastPlacedIndex = oldIndex`.",
        difficulty: "advanced",
        whyAsked: "Differentiates surface-level React users from engineers who have read React's reconciler source code."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Drag-and-Drop Kanban Board Reordering",
        description: "Reordering cards between columns with minimal DOM reflows by reusing existing fibers via stable item IDs.",
        companies: "Trello, Jira, Linear",
        codeSnippet: "cards.map(card => <Card key={card.id} data={card} />)"
      }
    ],
    howToExplain: {
      opening: "React solves list diffing in O(N) linear time using a two-pass reconciliation algorithm with a Map for key lookups and lastPlacedIndex for movement tracking.",
      keyPoints: [
        "Fast-path iterates matching keys sequentially.",
        "Slow-path collects remaining old fibers into a Map keyed by key/index.",
        "lastPlacedIndex detects whether matched nodes need physical DOM relocations.",
        "Unvisited fibers in the Map are flagged for deletion in a single batch."
      ],
      closingImpression: "React's list diffing is an elegant engineering compromise that solves a theoretically O(N^3) tree edit distance problem in linear time.",
      analogies: ["Organizing a bookshelf: you slide books over that are already in order, and only physically pick up and relocate the books that were moved to the front."]
    },
    commonMistakes: [
      {
        mistake: "Assuming reversing an array of 10 items moves all 10 items in the DOM.",
        why: "Due to lastPlacedIndex mechanics, React leaves the last item in place and moves the other 9 around it, performing N-1 DOM operations.",
        correct: "Explain that lastPlacedIndex optimizes relative order to minimize physical DOM node re-insertions."
      }
    ],
    followUpDeepDive: [
      {
        question: "Where in React reconciler source is lastPlacedIndex calculated?",
        answer: "In `packages/react-reconciler/src/ReactChildFiber.js` inside the `placeChild(newFiber, lastPlacedIndex, newIndex)` helper function.",
        specReference: "packages/react-reconciler/src/ReactChildFiber.js: placeChild"
      }
    ]
  },

  "keys-hard": {
    interviewCrossQuestions: [
      {
        question: "Why does using array index as key cause state corruption when items are prepended or deleted?",
        answer: "When item 0 is deleted from a list of 3 items, the items that were previously at indices 1 and 2 now have indices 0 and 1. If `key={index}`, React compares old key 0 with new key 0. Because keys match, React reuses old Fiber 0 for new Item 0! The old Fiber's `memoizedState` (local hook state, uncontrolled `<input>` text, internal timers) is retained, displaying the PREVIOUS item's local state on the NEW item.",
        difficulty: "advanced",
        whyAsked: "The classic senior frontend bug diagnostic interview question."
      },
      {
        question: "Is there ever any scenario where using key={index} is acceptable?",
        answer: "Yes, only when all 3 conditions are met: 1) The list and items are completely static (never reordered, filtered, inserted, or deleted). 2) The items have no local state (purely presentational). 3) The items have no uncontrolled inputs or ref attachments.",
        difficulty: "intermediate",
        whyAsked: "Tests nuanced engineering pragmatism over blind dogma."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Dynamic To-Do Lists with Checkboxes",
        description: "Checking item 1 and deleting item 0: with index keys, checkbox 0 stays checked on the wrong task. Using item.id fixes state alignment.",
        companies: "Asana, Todoist",
        codeSnippet: "todos.map(todo => <TodoItem key={todo.id} todo={todo} />)"
      }
    ],
    howToExplain: {
      opening: "Using array indices as keys ties component state to spatial array positions rather than logical entity identity, corrupting internal state whenever lists shift.",
      keyPoints: [
        "React uses key to match fibers in the alternate tree.",
        "Index keys match old fiber index 0 to new item index 0.",
        "Preserves memoizedState (hooks, inputs) on the wrong data entity.",
        "Fix: Always bind keys to immutable entity IDs from your data source."
      ],
      closingImpression: "State corruption from index keys is one of the most insidious production React bugs because tests with static data never catch it.",
      analogies: ["Labeling mailboxes by apartment number (index) instead of resident names (IDs): if Tenant 1 moves out and everyone shifts down, Tenant 2 starts receiving Tenant 1's mail."]
    },
    commonMistakes: [
      {
        mistake: "Thinking index keys only impact performance.",
        why: "Index keys do not just impact performance; they cause active DATA CORRUPTION and UI bugs in stateful components.",
        correct: "Emphasize that index keys violate state correctness, not just speed."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does React 19's Action and optimistic updates interact with key reconciliation?",
        answer: "In React 19 `useOptimistic`, temporary optimistic items must maintain stable synthetic IDs (`temp-id-xyz`) so that when the server responds with the permanent ID, React transitions the key smoothly without remounting the component tree.",
        specReference: "React 19 Documentation: useOptimistic & Key Stability"
      }
    ]
  },

  "phases-basic": {
    interviewCrossQuestions: [
      {
        question: "What is the difference between the Render Phase and Commit Phase in React?",
        answer: "1) **Render Phase**: Pure computation. React calls component functions, calculates Virtual DOM diffs, and computes effect flags. It is side-effect-free, asynchronous, and interruptible (can be paused, restarted, or aborted in Concurrent Mode). 2) **Commit Phase**: DOM mutation and side effects. React synchronously applies calculated mutations to the host DOM (`commitMutationEffects`), runs synchronous layout effects (`useLayoutEffect`), and schedules passive effects (`useEffect`). It is synchronous and un-interruptible.",
        difficulty: "intermediate",
        whyAsked: "Core architectural lifecycle distinction in modern React."
      },
      {
        question: "Why does React StrictMode invoke component render functions twice in development?",
        answer: "`<StrictMode>` intentionally double-invokes component bodies, `useState` initializers, and `useMemo` callbacks in development to detect unintended side-effects (e.g. mutating global variables, modifying props). Pure functions produce identical outputs on repeated calls; impure functions reveal bugs immediately under double rendering.",
        difficulty: "intermediate",
        whyAsked: "Tests understanding of React's purity requirements and developer tooling."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Eliminating Infinite Re-Render Loops",
        description: "Detecting developers accidentally calling `setState` directly inside the render body instead of inside `useEffect`.",
        companies: "All React applications",
        codeSnippet: "function Bad() { setCount(c => c + 1); return null; } // Error: Maximum update depth exceeded"
      }
    ],
    howToExplain: {
      opening: "React separates rendering into an interruptible, side-effect-free Render Phase and a synchronous, atomic Commit Phase.",
      keyPoints: [
        "Render phase calculates diffs and must be 100% pure (idempotent).",
        "Commit phase applies mutations to the real DOM synchronously.",
        "StrictMode double-renders in development to expose impure side-effects.",
        "Side effects must strictly live in useEffect, useLayoutEffect, or event handlers."
      ],
      closingImpression: "Keeping the render phase pure is the prerequisite for React Concurrent Mode and server-side rendering to function correctly.",
      analogies: ["Drafting an email: typing and revising drafts (render) can happen multiple times without anyone seeing; clicking 'Send' (commit) is the irreversible real-world action."]
    },
    commonMistakes: [
      {
        mistake: "Mutating window or global variables directly inside the component body.",
        why: "In Concurrent Mode, renders can be aborted and restarted; global mutations will execute unpredictably multiple times.",
        correct: "Move all observable side effects into useEffect or event handlers."
      }
    ],
    followUpDeepDive: [
      {
        question: "Which component lifecycles / hooks belong to the Render Phase?",
        answer: "Component body execution, `useState` initializers, `useReducer` reducer functions, `useMemo`, and class `render()` and `shouldComponentUpdate()` belong to the Render Phase.",
        specReference: "React Documentation: Render and Commit Phases"
      }
    ]
  },

  "phases-medium": {
    interviewCrossQuestions: [
      {
        question: "What are the three sub-phases of the Commit Phase in React Fiber?",
        answer: "1) **Before Mutation Phase** (`commitBeforeMutationEffects`): runs `getSnapshotBeforeUpdate` and reads host DOM state before mutations occur. 2) **Mutation Phase** (`commitMutationEffects`): synchronously inserts, updates, and deletes real DOM nodes, and runs cleanups for previous layout effects. 3) **Layout Phase** (`commitLayoutEffects`): runs `componentDidMount`, `componentDidUpdate`, and executes `useLayoutEffect` synchronously before the browser paints.",
        difficulty: "advanced",
        whyAsked: "High-signal staff-level question testing precise knowledge of React commit pipeline."
      },
      {
        question: "When are passive effects (useEffect) flushed relative to the commit sub-phases?",
        answer: "`useEffect` cleanups and callbacks are NOT run during the synchronous commit phase. Instead, React schedules a macro/micro task (via `Scheduler.scheduleCallback`) to run passive effects asynchronously AFTER the browser has completed Layout and Paint.",
        difficulty: "advanced",
        whyAsked: "Tests understanding of why useEffect does not block browser painting."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Scroll Position Preservation in Chat Applications",
        description: "Reading scroll position in `getSnapshotBeforeUpdate` before DOM insertion, and adjusting scroll offsets in `useLayoutEffect` before paint to eliminate visual jumping.",
        companies: "Slack, WhatsApp Web",
        codeSnippet: "useLayoutEffect(() => { container.scrollTop = container.scrollHeight - prevHeight; });"
      }
    ],
    howToExplain: {
      opening: "The commit phase executes in three strict sub-phases: Before Mutation, Mutation, and Layout, followed by asynchronous Passive Effect scheduling.",
      keyPoints: [
        "Before Mutation snapshots DOM before changes.",
        "Mutation sub-phase executes host DOM insertions, deletions, and updates.",
        "Layout sub-phase executes useLayoutEffect synchronously before browser paint.",
        "Passive effects (useEffect) are deferred until after paint to prevent frame drops."
      ],
      closingImpression: "This multi-stage commit pipeline guarantees the browser never renders half-updated UI states.",
      analogies: ["A theatrical stage change: turn off lights (before mutation), move the furniture (mutation), actors take their marks (layout), turn on lights (paint), and applaud (passive effects)."]
    },
    commonMistakes: [
      {
        mistake: "Assuming useLayoutEffect runs after paint.",
        why: "useLayoutEffect runs synchronously during the Layout sub-phase BEFORE the browser paints. Heavy work here directly blocks screen updates.",
        correct: "Use useEffect for non-visual tasks; use useLayoutEffect strictly for synchronous DOM measurements."
      }
    ],
    followUpDeepDive: [
      {
        question: "Where in React reconciler source are commit sub-phases defined?",
        answer: "In `packages/react-reconciler/src/ReactFiberCommitWork.js`, implemented across `commitBeforeMutationEffects`, `commitMutationEffects`, and `commitLayoutEffects`.",
        specReference: "packages/react-reconciler/src/ReactFiberCommitWork.js"
      }
    ]
  },

  "phases-hard": {
    interviewCrossQuestions: [
      {
        question: "How does React Concurrent Mode's time-slicing work under the hood?",
        answer: "React's Scheduler assigns a 5ms frame deadline for work. Inside `workLoopConcurrent`, after each unit of work (Fiber), React checks `shouldYieldToHost()`. If `performance.now() >= deadline`, React yields the main thread back to the browser via `MessageChannel.port1.postMessage`, allowing the browser to process clicks, scrolling, and rendering. The remaining fiber work resumes in the next idle slice.",
        difficulty: "advanced",
        whyAsked: "Tests understanding of how React time-slices work on a single thread."
      },
      {
        question: "What is shouldYieldToHost and why does it use MessageChannel instead of setTimeout?",
        answer: "`shouldYieldToHost()` checks if the 5ms budget expired or if a browser input is pending (`navigator.scheduling.isInputPending()`). `MessageChannel` is used because it triggers an immediate macrotask without the 4ms clamping penalty of `setTimeout(0)`, providing near-zero latency resumption.",
        difficulty: "advanced",
        whyAsked: "Tests knowledge of browser scheduling primitives."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Interactive Data Visualizations & Dashboards",
        description: "Filtering a 20,000-node graph in React 18: time-slicing renders the graph in chunks without dropping typing framerates in the search bar.",
        companies: "Datadog, Tableau Web",
        codeSnippet: "startTransition(() => { setGraphData(filteredData); });"
      }
    ],
    howToExplain: {
      opening: "React Concurrent Mode time-slices the render phase by breaking large component trees into 5ms slices, yielding control to the browser when the deadline expires.",
      keyPoints: [
        "Checks shouldYield() between fiber units of work.",
        "Yields to the browser event loop using MessageChannel macrotasks.",
        "Allows user inputs (clicks, keystrokes) to interleave during heavy renders.",
        "Only commits to the screen when all units of work are fully evaluated."
      ],
      closingImpression: "Time-slicing transforms React from a blocking renderer into a cooperative multitasking operating system.",
      analogies: ["A chef preparing a 7-course banquet: between chopping vegetables, the chef checks the front desk to see if an urgent customer order arrived, handling urgent requests before continuing the banquet prep."]
    },
    commonMistakes: [
      {
        mistake: "Believing Concurrent Mode uses Web Workers for multi-threading.",
        why: "React rendering still runs on the single main browser thread. Concurrency is cooperative time-slicing on the main thread, not multi-threaded worker offloading.",
        correct: "Clarify that React concurrency is cooperative multitasking on the main thread."
      }
    ],
    followUpDeepDive: [
      {
        question: "What is navigator.scheduling.isInputPending() and how does React Scheduler use it?",
        answer: "It is a Chromium API that allows JavaScript on the main thread to query whether user inputs (clicks, keypresses) are waiting in the OS queue, allowing React to keep working past 5ms if no user input is waiting.",
        specReference: "W3C Early Input Dispatch / isInputPending Specification"
      }
    ]
  },

  "hook-core-basic": {
    interviewCrossQuestions: [
      {
        question: "How does useState know which component called it without passing a component reference?",
        answer: "React maintains a global internal variable `currentlyRenderingFiber`. When React renders a component (`renderWithHooks`), it sets `currentlyRenderingFiber = workInProgress`. Inside `useState`, React inspects this global pointer and attaches state to the active fiber's `memoizedState` linked list.",
        difficulty: "intermediate",
        whyAsked: "The universal 'magic' demystification question for React Hooks."
      },
      {
        question: "Why does calling setState with the exact same value (Object.is) skip rendering?",
        answer: "Inside `dispatchSetState`, React compares the new value with the current state using `Object.is(eagerState, currentState)`. If identical, React bailouts of scheduling a render (Eager Bailout), saving CPU cycles.",
        difficulty: "intermediate",
        whyAsked: "Tests understanding of React state bailout optimizations."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "React useState Internal State Holder",
        description: "The universal state primitive in modern React applications.",
        companies: "All React applications",
        codeSnippet: "const [count, setCount] = useState(() => expensiveInit());"
      }
    ],
    howToExplain: {
      opening: "React Hooks rely on a module-level currentlyRenderingFiber pointer to bind hook invocations to the currently active component fiber.",
      keyPoints: [
        "currentlyRenderingFiber points to the active component during render.",
        "State is stored in a linked list on fiber.memoizedState.",
        "Eager bailout skips rendering if new state is identical via Object.is.",
        "Lazy initializers useState(() => init) run only on first mount."
      ],
      closingImpression: "Hooks are not magic; they are simple sequential index cursors tied to the active Fiber execution context.",
      analogies: ["A doctor's clipboard: the doctor writes diagnoses on the patient's chart currently open on the desk (currentlyRenderingFiber)."]
    },
    commonMistakes: [
      {
        mistake: "Passing an immediate function call useState(computeExpensive()) instead of lazy callback useState(() => computeExpensive()).",
        why: "Calling the function directly executes the expensive calculation on EVERY render pass, discarding the result on subsequent renders.",
        correct: "Pass a function reference `useState(() => compute())` for lazy evaluation."
      }
    ],
    followUpDeepDive: [
      {
        question: "What is the Eager State optimization in React's dispatchSetState?",
        answer: "If the fiber's update queue is empty, React computes the next state eagerly in the dispatcher. If `Object.is(eagerState, currentState)` is true, React exits immediately without scheduling work on the scheduler.",
        specReference: "packages/react-reconciler/src/ReactFiberHooks.js: dispatchSetState"
      }
    ]
  },

  "hook-core-medium": {
    interviewCrossQuestions: [
      {
        question: "How are different hook types (useState, useMemo, useEffect) stored on the same fiber.memoizedState?",
        answer: "All hooks share the exact same `Hook` node struct: `{ memoizedState, baseState, baseQueue, queue, next }`. What differs is what `memoizedState` holds: for `useState`, it holds the state value; for `useMemo`, it holds `[cachedValue, deps]`; for `useEffect`, it holds the `Effect` ring buffer node; for `useRef`, it holds `{ current: val }`.",
        difficulty: "advanced",
        whyAsked: "Tests architectural understanding of hook node polymorphism."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Multi-Hook State Container in React Reconciler",
        description: "Components combining useState, useMemo, and useRef on a shared singly-linked list.",
        companies: "Meta, Next.js",
        codeSnippet: "fiber.memoizedState -> hook1 -> hook2 -> hook3 -> null"
      }
    ],
    howToExplain: {
      opening: "Hooks are stored as a homogeneous singly-linked list on fiber.memoizedState, where each node's memoizedState property holds hook-specific payloads.",
      keyPoints: [
        "Singly-linked list structure with .next pointers.",
        "useState stores values; useMemo stores [value, deps]; useRef stores { current }.",
        "workInProgressHook cursor steps through nodes in invocation order.",
        "Mount phase creates nodes; update phase reads and reuses existing nodes."
      ],
      closingImpression: "This unified linked list structure is why all hooks obey the exact same ordering rules.",
      analogies: ["Train boxcars: all cars have the same couplers (.next), but car 1 carries coal (state), car 2 carries grain (memo), and car 3 carries tools (ref)."]
    },
    commonMistakes: [
      {
        mistake: "Thinking useRef triggers re-renders when mutated.",
        why: "useRef simply returns a persistent object { current: value }. Mutating .current does not schedule any fiber updates.",
        correct: "Clarify that useRef provides mutable storage without triggering renders."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does React manage the update queue on a useState hook?",
        answer: "`hook.queue.pending` is a circular singly-linked list of update actions. Using a circular list allows React to keep pointers to both the head (for fast traversal) and the tail (for O(1) appends) with a single pointer.",
        specReference: "packages/react-reconciler/src/ReactFiberHooks.js: UpdateQueue"
      }
    ]
  },

  "hook-core-hard": {
    interviewCrossQuestions: [
      {
        question: "What specific internal error does React throw when a hook is called conditionally?",
        answer: "If a component calls fewer hooks than previous render, React throws: `Error: Rendered fewer hooks than during the previous render`. If it calls more, it throws: `Error: Rendered more hooks than during the previous render`. This occurs because `workInProgressHook` cursor hits `null` prematurely or finds unvisited nodes left on the linked list.",
        difficulty: "intermediate",
        whyAsked: "Checks if candidate has encountered and understands real React runtime invariant violations."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "ESLint Rule of Hooks Enforcement (eslint-plugin-react-hooks)",
        description: "Static AST linters verifying that hooks are only called at the top level of component functions.",
        companies: "Every React team",
        codeSnippet: "// eslint: 'react-hooks/rules-of-hooks': 'error'"
      }
    ],
    howToExplain: {
      opening: "The Rule of Hooks exists because React relies exclusively on call order to match hook state to the fiber's linked list across renders.",
      keyPoints: [
        "Skipping a hook misaligns all subsequent hook nodes on the linked list.",
        "Results in state swapping between completely unrelated hooks.",
        "Throws invariant error: Rendered more/fewer hooks than previous render.",
        "Hooks must only be called at the top level, never inside conditions or loops."
      ],
      closingImpression: "The Rules of Hooks are not an arbitrary stylistic guideline; they are an architectural constraint imposed by singly-linked list state storage.",
      analogies: ["A combination lock: you must enter the exact sequence of numbers in order; skipping a number jams the lock."]
    },
    commonMistakes: [
      {
        mistake: "Calling hooks inside early return branches: `if (!user) return null; const [data] = useState();`",
        why: "If user is null on render 1 and present on render 2, the hook count changes, throwing an invariant error.",
        correct: "Move all hook calls above all conditional return statements."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does React detect hook order swaps between different hook types (e.g. useState swapped for useEffect)?",
        answer: "In development mode, React attaches internal tags to hook nodes. If the hook type at index `i` does not match the tag stored during mount, React logs a descriptive warning detailing the exact hook type mismatch.",
        specReference: "packages/react-reconciler/src/ReactFiberHooks.js: renderWithHooks"
      }
    ]
  },

  "stale-effect-basic": {
    interviewCrossQuestions: [
      {
        question: "What is a Stale Closure in React and why does it occur?",
        answer: "A stale closure occurs when a callback or effect captures a state or prop variable from an older render pass's lexical scope. Because that callback was not recreated on subsequent renders, it still references the older snapshot value. Using a functional state updater (`setCount(prev => prev + 1)`) resolves this by reading from the reducer queue rather than the closed-over variable.",
        difficulty: "basic",
        whyAsked: "Universal React mental model question."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Concurrent Button Clicking & Rapid Event Streams",
        description: "Clicking a like button 5 times rapidly: with `setLikes(likes + 1)`, it resolves to 1; with `setLikes(l => l + 1)`, it resolves accurately to 5.",
        companies: "Twitter, Instagram, YouTube",
        codeSnippet: "setCount(prev => prev + 1); // safe from closure capture"
      }
    ],
    howToExplain: {
      opening: "Functional state updates solve stale closures by evaluating against the live update queue rather than the closed-over lexical state snapshot.",
      keyPoints: [
        "Async callbacks hold closure snapshots of state from creation time.",
        "Direct state references (count + 1) overwrite intervening updates.",
        "Functional updaters (prev => prev + 1) guarantee monotonic updates.",
        "Essential for timers, network responses, and WebSocket handlers."
      ],
      closingImpression: "Whenever an update depends on previous state, functional updates are mandatory.",
      analogies: ["A savings account: instead of telling the teller 'make my balance $100' (direct), you tell them 'add $10 to whatever is in the account' (functional)."]
    },
    commonMistakes: [
      {
        mistake: "Using setCount(count + 1) inside async fetch callbacks.",
        why: "By the time the network request returns, count in the closure is stale.",
        correct: "Always use `setCount(c => c + 1)` in async handlers."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does React process pending functional updaters during render?",
        answer: "During update phase, React iterates through `queue.pending`: `newState = typeof action === 'function' ? action(currentState) : action`. It applies them as a mathematical reducer pipeline.",
        specReference: "packages/react-reconciler/src/ReactFiberHooks.js: updateReducer"
      }
    ]
  },

  "stale-effect-medium": {
    interviewCrossQuestions: [
      {
        question: "How does Dan Abramov's useInterval pattern eliminate interval reset thrashing?",
        answer: "A standard `useEffect` tied to `[delay, callback]` resets the browser timer every time `callback` changes (e.g. on every render). The `useInterval` pattern uses a mutable ref: `const savedCallback = useRef(callback)`. Inside `useEffect`, it updates `savedCallback.current = callback` on every render. A separate effect sets up the timer ONCE (`setInterval(() => savedCallback.current(), delay)`). The interval never resets, yet always executes the freshest callback.",
        difficulty: "intermediate",
        whyAsked: "The canonical custom hook design pattern question."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Live Telemetry & Polling Tickers",
        description: "Polling server metrics every 1000ms while accessing live React state without resetting the clock on every state update.",
        companies: "Datadog, AWS Console",
        codeSnippet: "useInterval(() => pollMetrics(activeFilters), isPolling ? 1000 : null);"
      }
    ],
    howToExplain: {
      opening: "The useInterval pattern decouples timer lifecycle from callback state by routing execution through a mutable ref that updates on every render.",
      keyPoints: [
        "Mutable ref holds the latest callback reference.",
        "Updating ref.current does not trigger re-renders or reset effects.",
        "Timer effect depends only on delay, keeping the timer stable.",
        "Passing delay: null pauses the interval cleanly."
      ],
      closingImpression: "This pattern is the foundational model for bridging imperative browser APIs with declarative React lifecycles.",
      analogies: ["A secretary relaying instructions: the boss updates instructions on the memo board daily, but the delivery truck runs on a fixed weekly schedule without changing routes."]
    },
    commonMistakes: [
      {
        mistake: "Adding callback to the interval effect dependency array.",
        why: "Causes the interval to clear and re-create on every render, ruining steady tick timing.",
        correct: "Store callback in a ref and keep the effect dependent only on delay."
      }
    ],
    followUpDeepDive: [
      {
        question: "Why does Dan Abramov call refs a 'bail out' mechanism in declarative React?",
        answer: "Refs provide an escape hatch from pure functional declarative immutability, allowing mutable pointers to persist across renders without participating in the reactive dependency graph.",
        specReference: "Overreacted.io: Making setInterval Declarative with React Hooks"
      }
    ]
  },

  "stale-effect-hard": {
    interviewCrossQuestions: [
      {
        question: "What is useEffectEvent (useEvent) and what architectural problem does it solve?",
        answer: "In React, effects often need to read current state/props to perform an action, but you do NOT want the effect to re-run whenever that state changes. `useEffectEvent` extracts non-reactive logic into an 'Effect Event' function. The returned function has a stable reference identity (can be omitted from effect dependencies), but always sees the freshest state when called inside an effect.",
        difficulty: "advanced",
        whyAsked: "Tests knowledge of upcoming React 19 / official RFC hook architecture."
      },
      {
        question: "Why must Effect Events NEVER be called during the render phase?",
        answer: "Effect Events read from mutable refs that update outside the pure render phase. Calling them during render breaks pure rendering rules and creates non-deterministic output in Concurrent Mode.",
        difficulty: "advanced",
        whyAsked: "Checks understanding of React's strict purity boundaries."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Chat Room Analytics Logging on Connection",
        description: "Re-connecting to chat only when `roomId` changes, but logging the current `theme` without reconnecting when theme changes.",
        companies: "Discord, Slack",
        codeSnippet: "const onConnected = useEffectEvent(() => logConnection(theme)); useEffect(() => { connect(roomId); onConnected(); }, [roomId]);"
      }
    ],
    howToExplain: {
      opening: "useEffectEvent separates reactive dependencies (which trigger effect re-runs) from non-reactive logic (which needs current values on demand).",
      keyPoints: [
        "Returns a stable function reference that never triggers effects.",
        "Always accesses the freshest props and state when invoked.",
        "Must only be called from inside effects or event handlers, never during render.",
        "Solves the eternal dilemma of unnecessary effect re-executions."
      ],
      closingImpression: "Effect Events complete the hooks mental model by making non-reactive side effects first-class citizens in React.",
      analogies: ["An emergency contact card: you only change your wallet when you move homes (roomId), but when called, the contact reads your latest phone number (theme) without forcing you to buy a new wallet."]
    },
    commonMistakes: [
      {
        mistake: "Including useEffectEvent functions in useEffect dependency arrays.",
        why: "Effect Events are non-reactive by definition; React lint rules explicitly forbid listing them in dependencies.",
        correct: "Omit Effect Events from dependency arrays."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does useInsertionEffect help polyfill useEffectEvent?",
        answer: "`useInsertionEffect` runs synchronously before all layout effects and DOM mutations, updating the callback ref before any effect can possibly execute.",
        specReference: "React RFC: Separating Events from Effects with useEffectEvent"
      }
    ]
  },

  "effect-timings-basic": {
    interviewCrossQuestions: [
      {
        question: "What is the exact execution order of useInsertionEffect, useLayoutEffect, and useEffect?",
        answer: "1) Component renders. 2) `useInsertionEffect` cleanups and callbacks run synchronously before DOM mutations (for CSS-in-JS). 3) Host DOM mutations occur. 4) `useLayoutEffect` cleanups and callbacks run synchronously after DOM mutations, before browser paint. 5) Browser paints the screen. 6) `useEffect` cleanups and callbacks run asynchronously after paint.",
        difficulty: "intermediate",
        whyAsked: "The universal test for React effect lifecycle timing."
      },
      {
        question: "Why was useInsertionEffect introduced in React 18?",
        answer: "CSS-in-JS libraries (Emotion, Styled-Components) injecting `<style>` tags during `useLayoutEffect` forced the browser to recalculate CSS styles and layouts multiple times before paint. `useInsertionEffect` runs before DOM mutations, allowing styles to be injected into `<head>` before any layout measurements occur.",
        difficulty: "advanced",
        whyAsked: "Tests understanding of CSS-in-JS runtime engine integration."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "CSS-in-JS Dynamic Style Rule Injection",
        description: "Emotion and Styled-Components injecting runtime CSS classes before elements mount.",
        companies: "Emotion Core, Styled Components",
        codeSnippet: "useInsertionEffect(() => { insertStyleRule(className, rules); }, [rules]);"
      }
    ],
    howToExplain: {
      opening: "React provides three effect hooks targeting different stages of the commit pipeline: Insertion (pre-DOM), Layout (post-DOM pre-paint), and Passive (post-paint).",
      keyPoints: [
        "useInsertionEffect runs before DOM mutations for CSS-in-JS.",
        "useLayoutEffect runs after DOM mutations before browser paint.",
        "useEffect runs asynchronously after browser paint.",
        "Always default to useEffect unless synchronous DOM measurement is required."
      ],
      closingImpression: "Selecting the correct effect hook prevents layout thrashing, style recalculations, and dropped animation frames.",
      analogies: ["Stage lighting: useInsertionEffect sets up light bulbs; useLayoutEffect adjusts spotlights while the curtain is down; useEffect starts playing background music after the curtain rises."]
    },
    commonMistakes: [
      {
        mistake: "Using useLayoutEffect for data fetching.",
        why: "useLayoutEffect blocks browser paint; fetching data here freezes the screen.",
        correct: "Use useEffect for all non-visual operations."
      }
    ],
    followUpDeepDive: [
      {
        question: "Why does useLayoutEffect log a warning during Server-Side Rendering (SSR)?",
        answer: "Because on the server there is no DOM and no paint! `useLayoutEffect` cannot execute on the server, producing a mismatch between client and server renders.",
        specReference: "React Documentation: useLayoutEffect SSR Warning"
      }
    ]
  },

  "effect-timings-medium": {
    interviewCrossQuestions: [
      {
        question: "How do you measure a DOM node's dimensions without causing visual flicker?",
        answer: "By using `useLayoutEffect`. In `useLayoutEffect`, the DOM node has been created and mutated, so `getBoundingClientRect()` returns accurate dimensions. If you set state here, React re-renders synchronously before the browser paints the frame, guaranteeing the user never sees intermediate un-positioned states.",
        difficulty: "intermediate",
        whyAsked: "Practical UI tooltip and popover engineering question."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Floating Tooltips & Popover Positioning",
        description: "Measuring tooltip bounding boxes to align them above or below anchor buttons without flickering.",
        companies: "Floating UI, Radix Primitives",
        codeSnippet: "useLayoutEffect(() => { const rect = el.getBoundingClientRect(); setCoords(calculate(rect)); }, []);"
      }
    ],
    howToExplain: {
      opening: "useLayoutEffect guarantees synchronous execution after DOM mutations but before paint, eliminating visual flicker during geometric measurements.",
      keyPoints: [
        "Runs synchronously after DOM nodes are inserted.",
        "Reading getBoundingClientRect() returns accurate layout dimensions.",
        "Synchronous state updates here re-render before paint.",
        "Eliminates visual popover jumping and layout stutter."
      ],
      closingImpression: "useLayoutEffect is the only place in React where synchronous DOM reads and subsequent state updates can occur without visual tearing.",
      analogies: ["Adjusting a picture frame with your eyes closed: you adjust the tilt while nobody can see, and open your eyes only when it is perfectly straight."]
    },
    commonMistakes: [
      {
        mistake: "Using useEffect for tooltip positioning.",
        why: "Causes the tooltip to render at 0,0 for 1 frame, then jump to the target position, creating a visible flash.",
        correct: "Use useLayoutEffect for positioning."
      }
    ],
    followUpDeepDive: [
      {
        question: "What is the performance consequence of cascading state updates inside useLayoutEffect?",
        answer: "Setting state inside `useLayoutEffect` blocks the browser thread and forces an immediate second synchronous render pass before paint, doubling render time for that frame.",
        specReference: "packages/react-reconciler/src/ReactFiberCommitWork.js: commitLayoutEffects"
      }
    ]
  },

  "effect-timings-hard": {
    interviewCrossQuestions: [
      {
        question: "How does React manage separate queues for layout effects and passive effects internally?",
        answer: "React stores effects as a circular linked list on `fiber.updateQueue`. Each effect node carries bitwise flags: `HookLayout` vs `HookPassive`. During the synchronous commit phase, React iterates and executes `HookLayout` effects. It then calls `scheduleCallback(NormalPriority, flushPassiveEffects)` on the Scheduler to schedule a separate pass for `HookPassive` effects after paint.",
        difficulty: "advanced",
        whyAsked: "Tests low-level understanding of React effect queues."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "React Fiber Commit Work Pipeline",
        description: "The core effect queue scheduler in React reconciler.",
        companies: "Meta",
        codeSnippet: "flushPassiveEffects(); // executes after paint"
      }
    ],
    howToExplain: {
      opening: "React Fiber partitions effects into synchronous layout queues and deferred passive queues using bitwise flags on a circular update queue.",
      keyPoints: [
        "HookLayout effects run synchronously during commitLayoutEffects.",
        "HookPassive effects are scheduled via Scheduler.scheduleCallback.",
        "Circular linked list stores cleanups and creation callbacks.",
        "Guarantees optimal UI responsiveness by deferring non-visual side effects."
      ],
      closingImpression: "Separating effect execution into distinct priority queues ensures browser paint is never delayed by non-visual tasks.",
      analogies: ["Express checkout vs standard shipping: layout effects must be delivered immediately before the store closes; passive effects are shipped overnight."]
    },
    commonMistakes: [
      {
        mistake: "Assuming useEffect cleanup runs immediately when state changes.",
        why: "useEffect cleanup runs asynchronously before the next passive effect pass, after the next render has painted.",
        correct: "Clarify that cleanup execution is also deferred after paint."
      }
    ],
    followUpDeepDive: [
      {
        question: "What happens if a passive effect schedules a synchronous update (flushSync)?",
        answer: "Calling `flushSync` inside a passive effect forces React to flush pending updates synchronously, halting the scheduler and executing an immediate commit.",
        specReference: "packages/react-reconciler/src/ReactFiberWorkLoop.js: flushSync"
      }
    ]
  }
};
