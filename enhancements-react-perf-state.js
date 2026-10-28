// Comprehensive Interview Cross-Questions & Deep Preparation Data
// Track: React.js Mastery
// Domain: 3. Re-render Cascades & 4. Refs & DOM & 5. Modern Concurrency 18/19 (21 Questions)

module.exports = {
  "memo-basic": {
    interviewCrossQuestions: [
      {
        question: "Why does passing an inline object or function prop break React.memo?",
        answer: "Every time a parent component re-renders, JavaScript evaluates inline object literals (`style={{ color: 'red' }}`) and inline arrow functions (`onClick={() => doSomething()}`) as BRAND NEW memory references. `React.memo` performs a shallow equality check (`prevProp === nextProp`); because the reference identities differ on every render, the shallow check always returns `false`, causing the memoized child to re-render 100% of the time.",
        difficulty: "basic",
        whyAsked: "The #1 classic junior-to-mid performance pitfall in React applications."
      },
      {
        question: "What is the computational cost of broken memoization?",
        answer: "Broken memoization is strictly WORSE than no memoization at all! When memoization breaks, React executes the full shallow equality comparison on every prop, fails the check, and then executes the component render anyway, wasting CPU cycles on a comparison that never succeeds.",
        difficulty: "intermediate",
        whyAsked: "Tests understanding that memoization is not free and has overhead."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Stabilizing Event Handlers with useCallback",
        description: "Wrapping action dispatchers in `useCallback` to prevent child list item re-renders.",
        companies: "Airbnb, Uber Web",
        codeSnippet: "const handleDelete = useCallback((id) => dispatch(deleteItem(id)), [dispatch]);"
      }
    ],
    howToExplain: {
      opening: "Broken memoization occurs when inline object or function references change identity on every render, defeating shallow prop equality checks.",
      keyPoints: [
        "React.memo relies on Object.is reference stability.",
        "Inline {} and () => {} create fresh references every render.",
        "Stabilize objects with useMemo and callbacks with useCallback.",
        "Extract static objects outside component files."
      ],
      closingImpression: "Memoization requires strict reference discipline across parent and child components.",
      analogies: ["A security guard checking names on a VIP guest list: if your name badge changes spelling every time you walk by, the guard stops and checks your passport every single time."]
    },
    commonMistakes: [
      {
        mistake: "Wrapping children in React.memo without stabilizing parent callback props.",
        why: "The child still re-renders on every parent render because the callback prop changes identity.",
        correct: "Wrap callbacks in useCallback in the parent."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does the React Compiler eliminate the need for manual useCallback?",
        answer: "The React Compiler (React Forget) statically analyzes AST bindings at build time and automatically memoizes function definitions and object literals, maintaining stable references across renders automatically.",
        specReference: "React Labs: The React Compiler Architecture"
      }
    ]
  },

  "memo-medium": {
    interviewCrossQuestions: [
      {
        question: "How do useMemo and useCallback differ internally in React reconciler source?",
        answer: "In `ReactFiberHooks.js`, `useCallback(fn, deps)` is literally implemented as `useMemo(() => fn, deps)`. `useMemo` caches the evaluated return value of the function, while `useCallback` caches the function reference itself. Both store `[cachedValue, deps]` in the hook's `memoizedState`.",
        difficulty: "intermediate",
        whyAsked: "Tests whether candidate understands that useCallback is just syntactic sugar over useMemo."
      },
      {
        question: "When should you NOT use useMemo?",
        answer: "1) Cheap operations (e.g. `a + b` or basic string concatenation) where the cost of storing dependencies and comparing arrays exceeds calculation cost. 2) When values change on almost every render (memoization runs and misses every time). 3) Primitive values which are already compared by value.",
        difficulty: "intermediate",
        whyAsked: "Tests practical performance profiling discernment vs cargo-cult programming."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Filtering and Sorting Large In-Memory Tables",
        description: "Memoizing the sorted output of 5,000 items so typing in an unrelated search input doesn't re-sort the table.",
        companies: "AG Grid, Notion",
        codeSnippet: "const sortedList = useMemo(() => heavySort(items, sortKey), [items, sortKey]);"
      }
    ],
    howToExplain: {
      opening: "useMemo caches computed values across renders by comparing dependency arrays, while useCallback caches function references.",
      keyPoints: [
        "Compares dependency array elements using Object.is.",
        "Returns cached value if dependencies are unchanged.",
        "useCallback(fn, deps) is sugar for useMemo(() => fn, deps).",
        "Only wrap expensive computations or references passed to memoized children."
      ],
      closingImpression: "Use memoization to preserve reference identity for child bails and cache genuinely expensive calculations.",
      analogies: ["A calculator history button: instead of re-entering a 20-digit formula every minute, you store the result in memory (M+) and recall it until the inputs change."]
    },
    commonMistakes: [
      {
        mistake: "Wrapping every single function in useCallback by default.",
        why: "Adds hook linked list allocation overhead and dependency array checks with zero performance benefit if passed to native HTML elements (<button>).",
        correct: "Only use useCallback when passing callbacks to memoized components (React.memo) or hook dependencies."
      }
    ],
    followUpDeepDive: [
      {
        question: "Where in React source are useMemo and useCallback dependencies compared?",
        answer: "In `packages/react-reconciler/src/ReactFiberHooks.js` inside `areHookInputsEqual()`, which executes a linear `Object.is` check across dependency array indices.",
        specReference: "packages/react-reconciler/src/ReactFiberHooks.js: areHookInputsEqual"
      }
    ]
  },

  "memo-hard": {
    interviewCrossQuestions: [
      {
        question: "How does Reselect achieve multi-input memoization in Redux applications?",
        answer: "Reselect's `createSelector` takes an array of input selectors and a result function. It caches the previous inputs and the previous result. On each call, it runs all input selectors and checks if their outputs match previous inputs via shallow reference equality (`===`). If ALL inputs match, it immediately returns the cached result without executing the result function.",
        difficulty: "advanced",
        whyAsked: "Standard Redux / enterprise architecture question."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Redux Normalized Entity Selection",
        description: "Denormalizing relational database records (users, posts, comments) into compound view models with caching.",
        companies: "Discord, Slack, Airbnb",
        codeSnippet: "const selectUserPosts = createSelector([selectUsers, selectPosts], (u, p) => denormalize(u, p));"
      }
    ],
    howToExplain: {
      opening: "Reselect memoizes selector pipelines by checking input selector identity, ensuring complex data transformations only re-calculate when source slices change.",
      keyPoints: [
        "Input selectors extract relevant state slices.",
        "Result function executes only when input references change.",
        "Default cache size is 1 (stores most recent input/output pair).",
        "Prevents unnecessary selector re-computations and component re-renders."
      ],
      closingImpression: "Selector memoization is essential for keeping Redux state derivation fast in massive enterprise state graphs.",
      analogies: ["A chef preparing special salad dressings: if the requested ingredients (oil, vinegar) haven't changed, the chef pours from the batch already made."]
    },
    commonMistakes: [
      {
        mistake: "Creating a new selector instance inside a component body.",
        why: "Creates a brand new selector with an empty cache on every render, defeating all memoization.",
        correct: "Define selectors outside components or wrap in useMemo."
      }
    ],
    followUpDeepDive: [
      {
        question: "What is Reselect 5.0's createSelector with lruMemoize?",
        answer: "Reselect 5.0 replaced the default single-entry memoizer with `lruMemoize`, supporting configurable cache capacity (maxSize) and custom equality checks.",
        specReference: "Reselect 5.0 Release Documentation"
      }
    ]
  },

  "context-basic": {
    interviewCrossQuestions: [
      {
        question: "Why is splitting Context into StateContext and DispatchContext a recommended performance pattern?",
        answer: "Because in React Context, ANY update to the context value forces ALL consuming components (`useContext`) to re-render. If state and dispatch are bundled in one object (`{ state, dispatch }`), every state update creates a new object reference, forcing components that only need `dispatch` (like action buttons) to re-render unnecessarily! Splitting into `StateContext` and `DispatchContext` ensures dispatch consumers never re-render because `dispatch` is referentially stable.",
        difficulty: "intermediate",
        whyAsked: "High-value context optimization question."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Authentication & Theme Provider Splitting",
        description: "Splitting user authentication data from login/logout action dispatchers.",
        companies: "Stripe, Shopify",
        codeSnippet: "const UserStateCtx = createContext(); const UserDispatchCtx = createContext();"
      }
    ],
    howToExplain: {
      opening: "Splitting Context into independent State and Dispatch contexts decouples state consumers from action triggers, eliminating unnecessary re-renders.",
      keyPoints: [
        "Context re-renders all consumers when provider value reference changes.",
        "Dispatch functions from useReducer are referentially stable.",
        "Components needing only dispatch never re-render when state changes.",
        "Simple, native pattern for scalable state management without third-party libraries."
      ],
      closingImpression: "Splitting context provides Redux-like performance using 100% native React primitives.",
      analogies: ["Separating a TV screen from the remote control: the TV screen updates continuously, but the remote control in your hand never needs to change."]
    },
    commonMistakes: [
      {
        mistake: "Passing an inline object literal to Context.Provider value: `<Ctx.Provider value={{ state, dispatch }}>`.",
        why: "Creates a brand new object on every provider render, forcing all consumers to re-render even if state did not change.",
        correct: "Wrap the value object in useMemo."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does React propagate Context updates down the Fiber tree?",
        answer: "When a context value changes, React runs `propagateContextChange` in `ReactFiberNewContext.js`, scanning down the fiber tree and setting lanes on all matching consumer fibers, bypassing `shouldComponentUpdate` and `React.memo` bailouts.",
        specReference: "packages/react-reconciler/src/ReactFiberNewContext.js: propagateContextChange"
      }
    ]
  },

  "context-medium": {
    interviewCrossQuestions: [
      {
        question: "Why does React.memo NOT prevent re-renders when a component consumes Context via useContext?",
        answer: "`React.memo` ONLY checks props passed from the parent component! If a component calls `useContext(MyContext)`, React's context dependency propagation directly marks the component's Fiber as dirty when the context value changes, completely bypassing the `React.memo` bailout.",
        difficulty: "intermediate",
        whyAsked: "Exposes common misconception about React.memo boundaries."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Component Decomposition for Context Isolation",
        description: "Extracting the useContext call into a small wrapper component so heavy sibling UI components don't re-render.",
        companies: "Meta, Next.js",
        codeSnippet: "function ConsumerWrapper() { const data = useContext(Ctx); return <HeavyChild data={data.specific} />; }"
      }
    ],
    howToExplain: {
      opening: "Context updates directly dirty consumer fibers, ignoring React.memo bailouts; selective subscriptions require component extraction or external selector stores.",
      keyPoints: [
        "useContext bypasses React.memo bailouts.",
        "Decomposing components isolates context consumption to small leaf nodes.",
        "Heavy children receive extracted slices as props and use React.memo.",
        "Prevents monolithic context re-render cascades."
      ],
      closingImpression: "Decomposing context consumers into small wrapper components is the cleanest native way to tame context re-renders.",
      analogies: ["An antenna on a roof: the small antenna receives the radio broadcast and sends a clean wire to the speakers, rather than the entire house vibrating."]
    },
    commonMistakes: [
      {
        mistake: "Wrapping a component that calls useContext in React.memo expecting it to skip context updates.",
        why: "React.memo only checks props; context subscriptions trigger independent fiber updates.",
        correct: "Move useContext to a parent and pass the value as a prop to the memoized child."
      }
    ],
    followUpDeepDive: [
      {
        question: "What was the proposed useContextSelector RFC?",
        answer: "A long-standing RFC by Daishi Kato proposed `useContextSelector(Context, state => state.prop)`, which only re-renders when the selected slice changes. This inspired the architecture of Zustand and Jotai.",
        specReference: "React RFC: Context Selectors (#119)"
      }
    ]
  },

  "context-hard": {
    interviewCrossQuestions: [
      {
        question: "How do external selector stores (Zustand / Redux) achieve fine-grained invalidation compared to React Context?",
        answer: "They move state management outside of React's reconciler! The store is a plain JavaScript object maintaining a `Set` of listener callbacks. When state updates, the store iterates listeners, evaluates each subscriber's selector (`state => state.field`), and uses `Object.is` to compare with the previous slice. If equal, it does nothing; if changed, it calls the listener to trigger a targeted update via `useSyncExternalStore`.",
        difficulty: "advanced",
        whyAsked: "High-level state management architecture interview question."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Zustand Micro-Store Architecture",
        description: "Managing thousands of dynamic state properties in 3D canvas and canvas editors with zero context re-renders.",
        companies: "Figma, Linear, Discord",
        codeSnippet: "const bears = useStore(state => state.bears);"
      }
    ],
    howToExplain: {
      opening: "Fine-grained selector stores achieve O(1) targeted re-renders by moving state outside React and notifying only components whose selected slices fail equality checks.",
      keyPoints: [
        "State lives in an external JS store outside React Context.",
        "Selectors extract fine-grained state slices.",
        "useSyncExternalStore coordinates updates without tearing.",
        "Only components with changed slices re-render."
      ],
      closingImpression: "Selector stores solve the context performance dilemma by decoupling state storage from component tree hierarchy.",
      analogies: ["A pager system: instead of shouting over a megaphone to the entire room (context), only the doctor whose pager buzzes (subscriber) stands up."]
    },
    commonMistakes: [
      {
        mistake: "Selecting the entire store state: const state = useStore(state => state).",
        why: "Defeats all fine-grained optimizations by re-rendering on every state change.",
        correct: "Always select the smallest slice needed: `useStore(s => s.user.name)`."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does useSyncExternalStore prevent infinite re-render loops with non-primitive selectors?",
        answer: "`useSyncExternalStore` relies on `Object.is(getSnapshot(), prevSnapshot)`. If a selector returns a new object reference every time (`state => ({ a: state.a })`), React detects an unstable snapshot and throws a Maximum update depth exceeded error.",
        specReference: "React Documentation: useSyncExternalStore Caveats"
      }
    ]
  },

  "comp-basic": {
    interviewCrossQuestions: [
      {
        question: "How does the 'children as props' pattern prevent component re-renders without using React.memo?",
        answer: "When Component A passes `<Child />` to Component B as children (`<B><Child /></B>`), `<Child />` is evaluated in Component A's render scope. When Component B re-renders due to its own internal state changes, Component B receives the exact same `props.children` object reference that was created by Component A. Because the element reference hasn't changed, React bails out of re-rendering `<Child />` during reconciliation!",
        difficulty: "advanced",
        whyAsked: "One of the highest-signal React interview questions; tests deep understanding of element reference stability."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Scroll Position & Theme Container Wrappers",
        description: "Wrapping an entire expensive dashboard in a scroll-listener container without re-rendering the dashboard on scroll.",
        companies: "Meta, Next.js",
        codeSnippet: "function ScrollTracker({ children }) { const [y, setY] = useState(0); return <div onScroll={...}>{children}</div>; }"
      }
    ],
    howToExplain: {
      opening: "The children-as-props pattern isolates component re-renders by lifting children out of the re-rendering component's JSX scope, preserving element reference identity.",
      keyPoints: [
        "JSX elements are objects; child elements are created in the parent scope.",
        "State changes in wrapper component do not recreate props.children.",
        "React bails out of rendering children if element reference is unchanged.",
        "Achieves zero-cost re-render isolation without React.memo."
      ],
      closingImpression: "Component composition is React's natural, built-in optimization tool that should be reached for before using useMemo or React.memo.",
      analogies: ["A picture frame: repainting the wooden frame (wrapper) does not require repainting the artwork inside (children)."]
    },
    commonMistakes: [
      {
        mistake: "Creating children inline inside the wrapper component body.",
        why: "Evaluating JSX inside the wrapper recreates the element on every render, breaking the bailout.",
        correct: "Pass children as props from above."
      }
    ],
    followUpDeepDive: [
      {
        question: "Where in React Fiber reconciler does this element bailout occur?",
        answer: "In `packages/react-reconciler/src/ReactFiberBeginWork.js` inside `checkScheduledUpdateOrContext()`, React checks `oldProps.children === newProps.children` and bails out via `bailoutOnAlreadyFinishedWork()`.",
        specReference: "packages/react-reconciler/src/ReactFiberBeginWork.js"
      }
    ]
  },

  "comp-medium": {
    interviewCrossQuestions: [
      {
        question: "What is the Inversion of Control achieved by the Render Prop pattern?",
        answer: "In standard components, the parent controls rendering and internal state. The Render Prop pattern inverts control by allowing the consumer to decide HOW state is rendered while the provider encapsulates internal behavior (e.g. mouse tracking, scroll detection, data fetching).",
        difficulty: "intermediate",
        whyAsked: "Tests understanding of architectural component patterns."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Headless UI Component State Exposing",
        description: "Downshift / Downshift autocomplete exposing keyboard selection state to custom UI renderers.",
        companies: "PayPal, Radix UI",
        codeSnippet: "<Downshift>{({ isOpen, getItemProps }) => (<div>...</div>)}</Downshift>"
      }
    ],
    howToExplain: {
      opening: "Render props invert control by sharing internal component behavior and state while delegating visual presentation to a consumer-supplied function.",
      keyPoints: [
        "Encapsulates complex logic and state machines.",
        "Consumer provides custom JSX via a render callback.",
        "Precursor to modern Custom Hooks.",
        "Still widely used in slot patterns and virtualization libraries."
      ],
      closingImpression: "Render props separate behavioral state management from visual rendering.",
      analogies: ["A rental car: the rental company manages the engine and maintenance (logic), but you decide where to drive it (render)."]
    },
    commonMistakes: [
      {
        mistake: "Passing inline render props to components expecting memoization.",
        why: "Inline functions break memoization comparisons.",
        correct: "Use custom hooks or stabilized callbacks."
      }
    ],
    followUpDeepDive: [
      {
        question: "How do Custom Hooks compare to Render Props?",
        answer: "Custom Hooks provide the exact same behavioral sharing as render props without adding extra nesting levels to the component tree, solving the 'wrapper hell' problem.",
        specReference: "React Documentation: Hooks vs Render Props"
      }
    ]
  },

  "comp-hard": {
    interviewCrossQuestions: [
      {
        question: "How do Compound Components (Tabs, Select, Accordion) communicate state implicitly?",
        answer: "Compound components use a shared internal React Context. The parent container (`<Tabs>`) holds state (active tab index) and exposes it via Context. Child components (`<Tabs.List>`, `<Tabs.Tab>`, `<Tabs.Panel>`) consume this Context implicitly without requiring the developer to pass props manually down the tree, providing clean and declarative component APIs.",
        difficulty: "advanced",
        whyAsked: "The gold standard design system component architecture question."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Enterprise Design System UI Primitives",
        description: "Building compound Tabs, Menus, Dialogs, and Accordions in design systems.",
        companies: "Radix UI, Headless UI, Material UI",
        codeSnippet: "<Tabs defaultValue='tab1'><Tabs.List><Tabs.Trigger value='tab1' /></Tabs.List><Tabs.Content value='tab1' /></Tabs>"
      }
    ],
    howToExplain: {
      opening: "Compound Components work together as a synchronized unit, sharing implicit state via an internal Context to provide expressive, flexible component APIs.",
      keyPoints: [
        "Parent container manages state and provides internal Context.",
        "Children implicitly consume state without manual prop drilling.",
        "Allows arbitrary JSX composition and flexible markup structure.",
        "Standard design pattern for enterprise UI component libraries."
      ],
      closingImpression: "Compound components offer the ultimate balance between flexible styling and encapsulated behavioral state.",
      analogies: ["An HTML <select> and <option> tag: they work together naturally without needing you to write wiring code between them."]
    },
    commonMistakes: [
      {
        mistake: "Using React.Children.map and cloneElement for compound components.",
        why: "cloneElement only reaches direct children; wrapping a child in a div breaks the entire component.",
        correct: "Use React Context for robust compound component communication."
      }
    ],
    followUpDeepDive: [
      {
        question: "How do Radix Primitives and Ariakit enforce accessibility in compound components?",
        answer: "They combine compound context with WAI-ARIA attributes (`aria-selected`, `aria-controls`, `role='tab'`) and roving tabindex keyboard focus handlers.",
        specReference: "W3C WAI-ARIA Tabs Pattern Specification"
      }
    ]
  },

  "ref-basic": {
    interviewCrossQuestions: [
      {
        question: "What is the difference between useRef and useState?",
        answer: "`useState` stores state that participates in the render cycle: updating state schedules a re-render. `useRef` returns a plain mutable object `{ current: value }` whose reference identity is preserved across renders: mutating `.current` does NOT trigger a re-render. Refs are used for accessing DOM elements or storing mutable values that do not affect UI rendering.",
        difficulty: "basic",
        whyAsked: "Fundamental React hooks check."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Storing Previous Values & Timers",
        description: "Storing timer IDs (`setInterval`) or previous prop snapshots without causing re-renders.",
        companies: "All React applications",
        codeSnippet: "const timerRef = useRef(null); timerRef.current = setInterval(...);"
      }
    ],
    howToExplain: {
      opening: "useRef provides a persistent mutable container whose mutation does not trigger re-renders, ideal for DOM nodes and instance variables.",
      keyPoints: [
        "Returns { current: initialValue } with stable reference identity.",
        "Mutating .current does not trigger component re-renders.",
        "Binds to real DOM elements via ref={myRef}.",
        "Acts like an instance variable in functional components."
      ],
      closingImpression: "useRef is the bridge between React's declarative world and imperative browser APIs.",
      analogies: ["A sticky note on your monitor: you can erase and rewrite notes on it all day without turning off and rebooting your computer."]
    },
    commonMistakes: [
      {
        mistake: "Reading or writing ref.current during the component render phase.",
        why: "Breaks pure rendering rules and produces unpredictable results in Concurrent Mode.",
        correct: "Mutate refs in useEffect, useLayoutEffect, or event handlers."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does React attach host DOM elements to refs during the commit phase?",
        answer: "In `ReactFiberCommitWork.js`, React sets `ref.current = hostDOMNode` during `commitMutationEffects` when mounting, and sets `ref.current = null` when unmounting.",
        specReference: "packages/react-reconciler/src/ReactFiberCommitWork.js: commitAttachRef"
      }
    ]
  },

  "ref-medium": {
    interviewCrossQuestions: [
      {
        question: "How does a useClickOutside hook determine if a click occurred outside an element?",
        answer: "By attaching a document-level event listener (`mousedown` or `click`) and checking `nodeRef.current && !nodeRef.current.contains(event.target)`. If the clicked DOM node (`event.target`) is NOT contained within the ref's DOM hierarchy, it is an outside click and triggers the callback.",
        difficulty: "intermediate",
        whyAsked: "Universal modal/dropdown UI hook question."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Dropdown Menus & Modal Dismissal",
        description: "Closing dropdown menus when user clicks anywhere outside the menu container.",
        companies: "Tailwind UI, Radix UI",
        codeSnippet: "useClickOutside(menuRef, () => setIsOpen(false));"
      }
    ],
    howToExplain: {
      opening: "useClickOutside combines DOM containment checks via Node.contains() with global event listeners to detect clicks outside a referenced element.",
      keyPoints: [
        "Attaches listener to document or window.",
        "node.contains(e.target) checks DOM containment tree.",
        "Cleans up listeners in useEffect return function.",
        "Standard mechanism for closing popovers and dropdowns."
      ],
      closingImpression: "Cleaning up document-level listeners is essential to prevent memory leaks in custom DOM hooks.",
      analogies: ["A security perimeter: sensors alert security if movement is detected anywhere outside the boundary fence."]
    },
    commonMistakes: [
      {
        mistake: "Listening to 'click' instead of 'mousedown' for outside clicks.",
        why: "If a user clicks inside a dropdown and drags outside before mouseup, a 'click' event fires outside, prematurely closing the dropdown.",
        correct: "Listen on mousedown or pointerdown."
      }
    ],
    followUpDeepDive: [
      {
        question: "How do React Portals affect useClickOutside checks?",
        answer: "Portals render DOM nodes outside the parent DOM container. A click inside a portal will fail `nodeRef.current.contains(e.target)` unless the portal node is also tracked.",
        specReference: "React Documentation: Portals & Event Bubbling"
      }
    ]
  },

  "ref-hard": {
    interviewCrossQuestions: [
      {
        question: "Why is implementing an Undo/Redo stack with mutable refs faster than using component state?",
        answer: "Storing 100 history snapshots in `useState` forces the entire component tree to re-evaluate on every undo/redo snapshot push. Storing the history stack in a mutable ref (`historyRef.current`) allows recording actions in memory instantly with O(1) latency without triggering re-renders, re-rendering only when the user explicitly clicks Undo or Redo.",
        difficulty: "advanced",
        whyAsked: "Tests performance optimization using refs as in-memory data buffers."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Canvas & Drawing App Undo/Redo Engine",
        description: "Figma and Excalidraw maintaining stroke histories in memory buffers without re-rendering the whole UI on every mousemove.",
        companies: "Figma, Excalidraw, Canva",
        codeSnippet: "historyRef.current.push(canvasSnapshot);"
      }
    ],
    howToExplain: {
      opening: "Using mutable refs for history buffers decouples rapid data accumulation from component re-renders, providing high-performance undo/redo stacks.",
      keyPoints: [
        "Refs store snapshots in memory without triggering re-renders.",
        "Supports rapid keystroke or mousemove recording.",
        "Component re-renders only on explicit undo/redo actions.",
        "Prevents sluggishness in data-heavy interactive applications."
      ],
      closingImpression: "Refs allow keeping high-frequency transient data in memory without paying the React rendering tax.",
      analogies: ["A flight data recorder: it continuously records thousands of sensor readings to a black box without blinking the cockpit cabin lights."]
    },
    commonMistakes: [
      {
        mistake: "Storing mutable object references directly in the history stack.",
        why: "Mutating the active object will mutate all past snapshots in the stack.",
        correct: "Deep clone or freeze snapshots before pushing to history."
      }
    ],
    followUpDeepDive: [
      {
        question: "What is Immer's patch history mechanism?",
        answer: "Immer produces inverse patches (`applyPatches`), allowing undo/redo to store lightweight JSON patch deltas rather than full state tree snapshots.",
        specReference: "Immer.js Documentation: Patches & History"
      }
    ]
  },

  "forwardref-basic": {
    interviewCrossQuestions: [
      {
        question: "Why does a custom component NOT accept a 'ref' prop by default in React 16-18?",
        answer: "In React 16-18, `ref` is treated as a reserved system attribute (like `key`) and is stripped from `props`. Passing `ref` to a standard function component logs a warning: `Function components cannot be given refs`. `React.forwardRef` was required to intercept the ref and forward it as a secondary parameter: `(props, ref) => {}`.",
        difficulty: "intermediate",
        whyAsked: "Fundamental React component API question."
      },
      {
        question: "How did React 19 change forwardRef?",
        answer: "In React 19, `forwardRef` is DEPRECATED! Function components can now accept `ref` directly as a standard prop: `function MyInput({ ref, ...props })`. React 19 treats `ref` as a normal prop, simplifying component design.",
        difficulty: "advanced",
        whyAsked: "Checks if candidate is up to date with modern React 19 breaking changes."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Reusable Form Input Primitives",
        description: "Allowing parent forms to attach refs to inner `<input>` elements for auto-focus or library integration.",
        companies: "Radix UI, Material UI, Tailwind UI",
        codeSnippet: "const Input = forwardRef((props, ref) => <input ref={ref} {...props} />);"
      }
    ],
    howToExplain: {
      opening: "forwardRef allows components to expose an internal DOM node or instance to parent components via a ref.",
      keyPoints: [
        "In React 16-18, forwardRef forwards ref as second argument (props, ref).",
        "React 19 deprecates forwardRef in favor of ref as a standard prop.",
        "Enables parents to manage focus, scroll, and measurements.",
        "Essential for building reusable design system component primitives."
      ],
      closingImpression: "forwardRef bridges component boundaries to enable imperative DOM interactions when necessary.",
      analogies: ["A mailbox slot: the mail carrier drops the letter through the front door slot (forwardRef) directly into the basket inside."]
    },
    commonMistakes: [
      {
        mistake: "Using forwardRef without setting displayName.",
        why: "In React DevTools, forwardRef components appear as 'Anonymous' unless a displayName is set.",
        correct: "Set MyComponent.displayName = 'MyComponent'."
      }
    ],
    followUpDeepDive: [
      {
        question: "What is WorkTag 11 in React reconciler source?",
        answer: "WorkTag 11 is `ForwardRef`, which executes `renderWithHooks` with `ref` passed as the second argument.",
        specReference: "packages/react-reconciler/src/ReactFiberBeginWork.js: updateForwardRef"
      }
    ]
  },

  "forwardref-medium": {
    interviewCrossQuestions: [
      {
        question: "What does useImperativeHandle do and why is it preferred over exposing raw DOM nodes?",
        answer: "`useImperativeHandle(ref, createHandle, [deps])` customizes the instance value exposed to parent components when using `ref`. Instead of exposing the raw DOM element (which allows parents to arbitrarily mutate styles, classes, and child nodes), `useImperativeHandle` exposes a restricted, curated object with only specific allowed methods (e.g. `{ focus(), reset() }`), enforcing encapsulation.",
        difficulty: "intermediate",
        whyAsked: "Tests understanding of component encapsulation and defensive API design."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Video Player & Canvas Controllers",
        description: "Exposing clean `.play()`, `.pause()`, `.seek()` methods to parent components without exposing raw `<video>` element internals.",
        companies: "Vimeo, Netflix, YouTube Web",
        codeSnippet: "useImperativeHandle(ref, () => ({ play: () => video.play(), pause: () => video.pause() }));"
      }
    ],
    howToExplain: {
      opening: "useImperativeHandle customizes the ref value exposed to parent components, restricting external access to curated methods and preserving encapsulation.",
      keyPoints: [
        "Must be paired with forwardRef (or React 19 ref prop).",
        "Exposes a restricted API object rather than raw DOM nodes.",
        "Prevents parent components from violating child DOM encapsulation.",
        "Ideal for video players, text editors, and modal dialogs."
      ],
      closingImpression: "useImperativeHandle provides the escape hatch of imperative methods while maintaining clean API boundaries.",
      analogies: ["A television remote: it exposes buttons for volume and channel (imperative handle), but does not let you open the back panel and touch the circuitry."]
    },
    commonMistakes: [
      {
        mistake: "Forgetting the dependency array in useImperativeHandle.",
        why: "Causes the handle object to be recreated on every render.",
        correct: "Supply a dependency array matching any closed-over state."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does useImperativeHandle integrate with useLayoutEffect internally?",
        answer: "In `ReactFiberHooks.js`, `useImperativeHandle` is implemented directly using `useLayoutEffect`, ensuring the imperative ref is attached synchronously before the browser paints.",
        specReference: "packages/react-reconciler/src/ReactFiberHooks.js: useImperativeHandle"
      }
    ]
  },

  "forwardref-hard": {
    interviewCrossQuestions: [
      {
        question: "How do virtual scroll containers use imperative handles for smooth scrolling and bounds clamping?",
        answer: "A virtual scroll container exposes imperative methods: `scrollToIndex(index, align)` and `getScrollOffset()`. The imperative handle calculates target pixel offsets, clamps values within scroll boundaries, and executes `element.scrollTo({ top, behavior: 'smooth' })`, shielding consumer components from raw pixel calculations.",
        difficulty: "advanced",
        whyAsked: "High-level performance UI widget engineering question."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Virtual List Library Controllers (TanStack Virtual, React Window)",
        description: "Allowing parent components to programmatically jump to list index 500 in a 100,000-row table.",
        companies: "TanStack, AG Grid",
        codeSnippet: "virtualizerRef.current.scrollToIndex(500, { align: 'center' });"
      }
    ],
    howToExplain: {
      opening: "Imperative handles on virtual scroll containers provide programmatic scroll navigation while encapsulating pixel calculations and bounds clamping.",
      keyPoints: [
        "Exposes scrollToIndex and scrollByOffset methods.",
        "Clamps offsets to prevent scroll container underflow/overflow.",
        "Shields parent components from virtual DOM geometry math.",
        "The standard architecture for high-performance virtualized tables."
      ],
      closingImpression: "Encapsulating virtual scroll math behind an imperative handle keeps parent view components clean and declarative.",
      analogies: ["An elevator floor selector: you press 'Floor 50' (scrollToIndex); the elevator controller handles cable tension, acceleration, and alignment."]
    },
    commonMistakes: [
      {
        mistake: "Allowing unbounded scroll calculations.",
        why: "Scrolling beyond max scroll height causes glitchy bounce artifacts in browsers.",
        correct: "Always clamp scroll targets between 0 and maxScrollOffset."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does React Window manage dynamic row height measurements?",
        answer: "React Window caches measured row heights in an internal index map and uses binary search (`findNearestItem`) to compute scroll positions in O(log N) time.",
        specReference: "React Window: VariableSizeList Architecture"
      }
    ]
  },

  "trans-basic": {
    interviewCrossQuestions: [
      {
        question: "What is the difference between an Urgent update and a Transition update in React 18?",
        answer: "1) **Urgent updates** reflect direct user interactions like typing, clicking, or hovering, where immediate feedback is mandatory to prevent UI lag. 2) **Transition updates** (`startTransition`) represent non-urgent view transitions (e.g. filtering a search list, switching tabs). Urgent updates can INTERRUPT and abort transition updates, ensuring typing stays at 60fps.",
        difficulty: "basic",
        whyAsked: "Core concept of React 18 Concurrency."
      },
      {
        question: "What does useTransition return?",
        answer: "`useTransition()` returns `[isPending, startTransition]`. `isPending` is a boolean indicating whether the transition update is currently executing in the background, allowing the UI to display a subtle spinner or dim the view.",
        difficulty: "basic",
        whyAsked: "Verifies basic API literacy."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Search Input with Heavy Results Filtering",
        description: "Updating the input text value urgently while wrapping the heavy results filter in `startTransition`.",
        companies: "GitHub, Vercel, Algolia",
        codeSnippet: "setInput(val); startTransition(() => setQuery(val));"
      }
    ],
    howToExplain: {
      opening: "useTransition allows developers to mark state updates as non-urgent transitions that yield to urgent user interactions.",
      keyPoints: [
        "Separates urgent UI updates (typing) from heavy transitions (filtering).",
        "isPending flag provides instant visual loading feedback.",
        "Urgent updates can interrupt and discard in-progress transitions.",
        "Eliminates input lag without debounce delays."
      ],
      closingImpression: "Transitions allow React applications to remain responsive even while rendering massive data sets.",
      analogies: ["Priority lanes on a highway: emergency vehicles (urgent typing) pass through instantly, while cargo trucks (transitions) yield and cruise safely."]
    },
    commonMistakes: [
      {
        mistake: "Wrapping the controlled input state update in startTransition.",
        why: "Causes typing lag and cursor jumping in the input field.",
        correct: "Keep input text updates urgent; wrap only the resulting filtered data in startTransition."
      }
    ],
    followUpDeepDive: [
      {
        question: "What lane priority does startTransition assign to updates?",
        answer: "In `ReactFiberLane.js`, transitions are assigned to `TransitionLanes` (Lanes 6 through 21), which have lower priority than `SyncLane` (urgent updates) and `InputContinuousLane`.",
        specReference: "packages/react-reconciler/src/ReactFiberLane.js: TransitionLanes"
      }
    ]
  },

  "trans-medium": {
    interviewCrossQuestions: [
      {
        question: "How does useDeferredValue differ from useTransition?",
        answer: "`startTransition` wraps the state update function at the trigger site (`startTransition(() => setState())`). `useDeferredValue` wraps a value itself (`const deferredQuery = useDeferredValue(query)`). It is used when you do not own the `setState` dispatcher (e.g. receiving a value from props or third-party libraries).",
        difficulty: "intermediate",
        whyAsked: "Tests understanding of when to use which concurrency hook."
      },
      {
        question: "How does useDeferredValue differ from debounce?",
        answer: "Debounce waits for a fixed time delay (e.g. 300ms) before doing any work, introducing an artificial lag even on fast computers. `useDeferredValue` has NO fixed delay: on fast machines, it updates almost instantly; on slow machines, it yields and catches up as soon as the main thread is idle.",
        difficulty: "intermediate",
        whyAsked: "The classic React 18 concurrency vs legacy debounce comparison."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Heavy Graph Chart Updates Driven by External Props",
        description: "Deferring chart redraws when receiving high-frequency telemetry updates from parent props.",
        companies: "Datadog, Grafana",
        codeSnippet: "const deferredData = useDeferredValue(props.data);"
      }
    ],
    howToExplain: {
      opening: "useDeferredValue defers re-rendering non-critical parts of the UI, lagging behind urgent updates without introducing artificial debounce delays.",
      keyPoints: [
        "Wraps values rather than state dispatchers.",
        "Re-renders with previous value first, then schedules background render with new value.",
        "Adapts dynamically to device CPU speed without fixed millisecond timers.",
        "Can be checked via deferredValue !== value to show stale indicators."
      ],
      closingImpression: "useDeferredValue replaces arbitrary debounce timers with intelligent, CPU-aware deferred rendering.",
      analogies: ["A camera autofocus: the viewfinder shows the current view immediately, while the lens adjusts focus smoothly behind it."]
    },
    commonMistakes: [
      {
        mistake: "Using useDeferredValue on a component that is not memoized.",
        why: "If the child component is not wrapped in React.memo, it will re-render anyway when the parent renders, defeating the deferred value bailout.",
        correct: "Pass deferredValue to a component wrapped in React.memo."
      }
    ],
    followUpDeepDive: [
      {
        question: "What is the initialValue parameter in React 19 useDeferredValue?",
        answer: "React 19 added `useDeferredValue(value, initialValue)`: during initial render, it returns `initialValue` and schedules a deferred render with `value`, enabling clean progressive hydration.",
        specReference: "React 19 Release Notes: useDeferredValue initialValue"
      }
    ]
  },

  "trans-hard": {
    interviewCrossQuestions: [
      {
        question: "How does React Lanes scheduling resolve priority conflicts between urgent and transition work?",
        answer: "React represents update priority using a 31-bit bitmask (`Lanes`). When an urgent update (`SyncLane`) arrives while a low-priority transition (`TransitionLane`) is rendering, React detects that `wipLanes` has lower priority than the pending lane. It immediately halts the transition work loop, saves the incomplete work, switches context to `SyncLane`, renders and commits the urgent update to the screen, and then resumes or restarts the transition work.",
        difficulty: "advanced",
        whyAsked: "The pinnacle React 18 scheduler internals question."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Interactive Canvas & Typing Synchronization",
        description: "Keystrokes in an input field preempting 3D WebGL scene rendering updates.",
        companies: "Figma, Canva",
        codeSnippet: "lanes & (SyncLane | InputContinuousLane)"
      }
    ],
    howToExplain: {
      opening: "React Lanes use 31-bit integer bitmasks to represent task priority, allowing urgent tasks to preempt, suspend, and resume transition work.",
      keyPoints: [
        "Lanes replace legacy expiration times with composable bitmasks.",
        "SyncLane (urgent) preempts TransitionLanes (non-urgent).",
        "High-priority updates commit immediately without waiting for background work.",
        "Background work resumes automatically once the main thread is clear."
      ],
      closingImpression: "Bitwise lane scheduling gives React the preemptive prioritization capabilities of a real-time operating system.",
      analogies: ["An air traffic control tower: a commercial airliner on final approach (transition) is told to circle the runway if an emergency medevac flight (urgent) needs to land immediately."]
    },
    commonMistakes: [
      {
        mistake: "Assuming low-priority work can be starved indefinitely.",
        why: "React assigns expiration timestamps to all lanes. If a transition is preempted too many times, it expires and is upgraded to SyncLane, forcing it to commit.",
        correct: "Explain that lane expiration prevents transition starvation."
      }
    ],
    followUpDeepDive: [
      {
        question: "What is getHighestPriorityLane in React reconciler source?",
        answer: "It uses bitwise math: `lane & -lane` (extracts the lowest set bit) to determine the highest priority lane in O(1) CPU operations.",
        specReference: "packages/react-reconciler/src/ReactFiberLane.js: getHighestPriorityLane"
      }
    ]
  },

  "batch-basic": {
    interviewCrossQuestions: [
      {
        question: "What is State Batching in React and how does it prevent render thrashing?",
        answer: "Batching is when React groups multiple state updates (`setCount(c => c + 1); setFlag(f => !f);`) into a single re-render pass instead of re-rendering twice. This prevents intermediate inconsistent UI states and eliminates redundant DOM diffing.",
        difficulty: "basic",
        whyAsked: "Foundational React state update question."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Form Reset Action",
        description: "Resetting 10 form fields in a single event handler triggers exactly 1 re-render pass.",
        companies: "All React applications",
        codeSnippet: "function handleReset() { setName(''); setEmail(''); setAge(0); }"
      }
    ],
    howToExplain: {
      opening: "Batching consolidates multiple state setter calls within an event turn into a single re-render pass, optimizing render performance.",
      keyPoints: [
        "Groups multiple setState calls into one render cycle.",
        "Prevents half-updated, inconsistent UI states.",
        "Processes pending updates via an internal update queue.",
        "A foundational optimization in all React versions."
      ],
      closingImpression: "Batching ensures component re-renders scale with user actions rather than the number of state variables.",
      analogies: ["Ordering at a restaurant: you tell the waiter your appetizer, entree, and drink together; the waiter makes one trip to the kitchen, not three."]
    },
    commonMistakes: [
      {
        mistake: "Assuming state updates immediately after calling setState: `setCount(1); console.log(count); // still 0`.",
        why: "State updates are asynchronous and batched; the variable in the current render closure remains unchanged until the next render pass.",
        correct: "State reflects new values only on the subsequent render pass."
      }
    ],
    followUpDeepDive: [
      {
        question: "How did React 17 batch updates inside event handlers?",
        answer: "React 17 wrapped synthetic event handlers in `discreteUpdates()` which flushed updates at the end of the event handler callback.",
        specReference: "React 17 Event System Architecture"
      }
    ]
  },

  "batch-medium": {
    interviewCrossQuestions: [
      {
        question: "How did React 18's Automatic Batching change update behavior across async boundaries?",
        answer: "In React 17 and earlier, batching ONLY worked inside synthetic React event handlers. Updates inside `setTimeout`, `Promise.then()`, or native `fetch` callbacks were NOT batched, triggering multiple independent re-renders. In React 18, 'Automatic Batching' batches ALL updates universally, regardless of whether they occur inside promises, timeouts, or native event listeners.",
        difficulty: "intermediate",
        whyAsked: "Crucial difference between React 17 and React 18."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Asynchronous Fetch Callback Updates in React 18",
        description: "Updating data, loading, and error states inside a `fetch().then()` block produces exactly 1 render in React 18 vs 3 renders in React 17.",
        companies: "Meta, Vercel",
        codeSnippet: "fetch().then(() => { setData(res); setLoading(false); setError(null); }); // 1 render in React 18!"
      }
    ],
    howToExplain: {
      opening: "React 18 introduced Automatic Batching, extending state batching across all asynchronous boundaries including promises, timeouts, and native events.",
      keyPoints: [
        "React 17 only batched inside synthetic React event handlers.",
        "React 18 batches universally across microtasks and macrotasks.",
        "Reduces re-renders significantly in data-fetching components.",
        "Opt out via flushSync when immediate DOM updates are required."
      ],
      closingImpression: "Automatic batching is one of React 18's greatest out-of-the-box performance upgrades, requiring zero code changes.",
      analogies: ["A bus that waits for all passengers from the delayed train (async promise) to board before departing, instead of driving off with one person at a time."]
    },
    commonMistakes: [
      {
        mistake: "Thinking setTimeout is not batched in React 18.",
        why: "In React 18, updates inside setTimeout ARE batched by default.",
        correct: "Clarify that all asynchronous updates are batched in React 18."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does React 18 schedule automatic batch flushes internally?",
        answer: "Updates are pushed onto the fiber lane queue and scheduled via a microtask (`ensureRootIsScheduled`), collapsing all updates that occur in the same tick.",
        specReference: "packages/react-reconciler/src/ReactFiberWorkLoop.js: ensureRootIsScheduled"
      }
    ]
  },

  "batch-hard": {
    interviewCrossQuestions: [
      {
        question: "What is flushSync and when is it strictly necessary?",
        answer: "`flushSync(fn)` forces React to immediately execute the wrapped update and synchronously flush the entire commit phase to the real DOM. It is strictly necessary when you must read physical DOM measurements (like scroll position, element height) immediately after a state update, before the browser paints.",
        difficulty: "advanced",
        whyAsked: "Tests understanding of the escape hatch for React 18 automatic batching."
      },
      {
        question: "Why should flushSync be used sparingly?",
        answer: "`flushSync` halts React's batching and scheduler, forcing an immediate synchronous render and layout reflow. Overusing it introduces layout thrashing and degrades frame rates.",
        difficulty: "intermediate",
        whyAsked: "Tests performance trade-off awareness."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Auto-Scrolling Chat Messages to Bottom",
        description: "Adding a new message and immediately scrolling to the bottom: `flushSync` ensures the new message DOM node exists before reading `scrollHeight`.",
        companies: "Slack, Discord",
        codeSnippet: "flushSync(() => setMessages(m => [...m, newMsg])); listRef.current.scrollTop = listRef.current.scrollHeight;"
      }
    ],
    howToExplain: {
      opening: "flushSync is the escape hatch that forces React to bypass batching and flush updates synchronously to the DOM immediately.",
      keyPoints: [
        "Bypasses automatic batching.",
        "Forces synchronous render and commit to host DOM.",
        "Guarantees DOM measurements reflect the update immediately.",
        "Use sparingly to prevent layout thrashing and performance degradation."
      ],
      closingImpression: "flushSync gives developers synchronous control when imperative DOM measurements must immediately follow state changes.",
      analogies: ["Pulling the emergency brake on a train: it overrides all scheduled stops and halts immediately at that exact spot."]
    },
    commonMistakes: [
      {
        mistake: "Wrapping every state update in flushSync.",
        why: "Destroys all React batching performance benefits and freezes UI.",
        correct: "Only use flushSync when immediate post-update DOM measurement is mandatory."
      }
    ],
    followUpDeepDive: [
      {
        question: "What lane priority does flushSync execute with?",
        answer: "`flushSync` runs updates at `SyncLane` (Lane 1), the highest possible priority lane in the React reconciler.",
        specReference: "packages/react-reconciler/src/ReactFiberWorkLoop.js: flushSync"
      }
    ]
  }
};
