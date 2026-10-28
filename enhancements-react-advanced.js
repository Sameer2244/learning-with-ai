// Comprehensive Interview Cross-Questions & Deep Preparation Data
// Track: React.js Mastery
// Domain: 6. Component Architecture & 7. Suspense/SSR/RSC & 8. React Compiler & Custom Reconcilers (18 Questions)

module.exports = {
  "controlled-state-sync-basic": {
    interviewCrossQuestions: [
      {
        question: "What is the difference between a Controlled component and an Uncontrolled component in React?",
        answer: "In a Controlled component, the form element's value is driven by React state (`value={state}`, `onChange={e => setState(e.target.value)}`), making React the single source of truth. In an Uncontrolled component, the value is managed internally by the browser DOM itself, and React accesses values on demand via a `ref` (`ref.current.value`). Controlled components allow instant validation and formatting; uncontrolled components offer superior performance for high-frequency input.",
        difficulty: "basic",
        whyAsked: "Universal React forms fundamentals question."
      },
      {
        question: "Why does React warn 'A component is changing an uncontrolled input to be controlled'?",
        answer: "This warning occurs when an input's initial value is `undefined` (making it uncontrolled by default) and later updates to a defined string value. React warns because switching modes mid-lifecycle causes state synchronization bugs. Fix it by always initializing state with an empty string `''` rather than `undefined` or `null`.",
        difficulty: "intermediate",
        whyAsked: "Tests understanding of controlled component lifecycle invariants."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Universal Input Fields in UI Libraries",
        description: "Building text inputs that support being used as either controlled (`value` + `onChange`) or uncontrolled (`defaultValue`).",
        companies: "MUI, Ant Design, Chakra UI",
        codeSnippet: "const isControlled = props.value !== undefined; const value = isControlled ? props.value : internalState;"
      }
    ],
    howToExplain: {
      opening: "Controlled components treat React state as the single source of truth, while uncontrolled components delegate state to the browser DOM.",
      keyPoints: [
        "Controlled: value prop + onChange handler.",
        "Uncontrolled: defaultValue prop + ref access.",
        "Never switch between controlled and uncontrolled mid-lifecycle.",
        "Always default controlled input states to '' instead of undefined."
      ],
      closingImpression: "Understanding the controlled/uncontrolled boundary is critical for designing robust form architectures and design system inputs.",
      analogies: ["A puppet on strings (controlled) vs a wind-up toy (uncontrolled): the puppet moves only when you pull the strings; the wind-up toy moves on its own and you just check where it stopped."]
    },
    commonMistakes: [
      {
        mistake: "Passing value={data.name} where data.name is initially undefined.",
        why: "Causes React to mount the input as uncontrolled, and warn when data loads.",
        correct: "Use value={data.name ?? ''}."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does React synchronize the real DOM input selection/cursor position in controlled inputs?",
        answer: "In `ReactDOMInput.js`, React records `selectionStart` and `selectionEnd` before updating the DOM node value and restores the cursor position immediately after to prevent the cursor jumping to the end on every keystroke.",
        specReference: "packages/react-dom-bindings/src/client/ReactDOMInput.js: updateWrapper"
      }
    ]
  },

  "custom-use-controlled-medium": {
    interviewCrossQuestions: [
      {
        question: "How does Radix UI and MUI's useControlled hook work?",
        answer: "`useControlled({ controlled, default, name })` manages state that can be either controlled by the caller or uncontrolled internally. It creates an internal `useState(default)`. If `controlled !== undefined`, it returns `[controlled, setControlled]`; if `controlled === undefined`, it returns `[internalState, setInternalState]`. It warns in development if a component switches between the two modes.",
        difficulty: "intermediate",
        whyAsked: "Core design system state abstraction question."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Radix UI Primitives (Accordion, Switch, Dialog)",
        description: "Radix primitives supporting both controlled (`open` + `onOpenChange`) and uncontrolled (`defaultOpen`) modes.",
        companies: "Radix UI, Shadcn/ui",
        codeSnippet: "const [isOpen, setIsOpen] = useControllableState({ prop: open, defaultProp: defaultOpen, onChange: onOpenChange });"
      }
    ],
    howToExplain: {
      opening: "useControlled allows UI primitives to seamlessly support both controlled and uncontrolled usage without duplicating state logic.",
      keyPoints: [
        "Inspects whether the controlled prop is defined.",
        "Falls back to internal state if controlled prop is omitted.",
        "Dispatches external onChange callbacks in both modes.",
        "Standard architecture for headless UI libraries (Radix, MUI)."
      ],
      closingImpression: "useControlled gives component consumers the flexibility to choose between simple drop-in usage and tight external control.",
      analogies: ["A car with dual-mode transmission: you can drive in automatic mode (uncontrolled internal state) or switch to paddle shifters (controlled external state)."]
    },
    commonMistakes: [
      {
        mistake: "Syncing controlled props to internal state using useEffect.",
        why: "Creates an unnecessary extra render pass and causes visual desynchronization.",
        correct: "Derive state directly during render: `const value = prop !== undefined ? prop : internalState`."
      }
    ],
    followUpDeepDive: [
      {
        question: "Why does the React team discourage deriving state from props (getDerivedStateFromProps)?",
        answer: "Duplicating props into state creates two sources of truth that frequently become desynchronized. React recommends either fully controlled components or fully uncontrolled components with a key.",
        specReference: "React Blog: You Probably Don't Need Derived State"
      }
    ]
  },

  "zero-rerender-form-hard": {
    interviewCrossQuestions: [
      {
        question: "How does React Hook Form achieve zero-rerender form typing performance?",
        answer: "React Hook Form uses **Uncontrolled Components with Mutable Refs**! When a user types into an input registered via `register('email')`, React does NOT call `setState` and does NOT re-render the form. The DOM node updates natively at 60fps. React Hook Form listens to native DOM `input` events, updates an internal in-memory object ref, and only triggers targeted re-renders on components that explicitly subscribe via `useWatch` or when validation errors occur.",
        difficulty: "advanced",
        whyAsked: "High-performance React form architecture question."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Massive 200-Field Enterprise Data Entry Forms",
        description: "Complex insurance or medical forms with hundreds of fields where controlled state causes typing lag.",
        companies: "Stripe, Intuit, Epic Systems",
        codeSnippet: "const { register, handleSubmit } = useForm(); <input {...register('firstName')} />"
      }
    ],
    howToExplain: {
      opening: "React Hook Form achieves zero re-renders during typing by embracing uncontrolled DOM inputs and managing state in mutable refs with isolated subscriptions.",
      keyPoints: [
        "Controlled forms re-render the entire component on every keystroke.",
        "Uncontrolled inputs update natively in the browser DOM.",
        "Refs capture values without triggering React render passes.",
        "Subscriptions (useWatch) selectively re-render only dependent fields."
      ],
      closingImpression: "Bypassing React re-renders for high-frequency typing is why React Hook Form outperformed Formik and Redux Form.",
      analogies: ["Directly writing notes on a physical paper form instead of dictating every letter over the phone to someone typing in another room."]
    },
    commonMistakes: [
      {
        mistake: "Using watch() at the top-level form component in React Hook Form.",
        why: "Calling watch() without arguments forces the entire form to re-render on every keystroke, destroying the zero-rerender advantage.",
        correct: "Use useWatch() in isolated child components."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does React Hook Form integrate with schema validators like Zod?",
        answer: "It uses a `resolver` wrapper (`@hookform/resolvers/zod`): on submit or blur, it passes the form ref data to `zodSchema.safeParseAsync()`, mapping validation issues to form error states.",
        specReference: "React Hook Form: Custom Resolver Architecture"
      }
    ]
  },

  "use-counter-constraints-basic": {
    interviewCrossQuestions: [
      {
        question: "How should state clamps (min, max, step) be enforced in reusable custom hooks?",
        answer: "By creating bounded setter functions that enforce constraints before calling the underlying state updater: `Math.min(max, Math.max(min, nextValue))`. Exposing bounded modifiers (`increment`, `decrement`, `set(val)`) guarantees the component state can never violate domain invariant boundaries.",
        difficulty: "basic",
        whyAsked: "Tests custom hook encapsulation and state invariant enforcement."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "E-Commerce Quantity Selectors",
        description: "Quantity steppers that enforce inventory limits (`max: item.stock`) and minimum purchase limits (`min: 1`).",
        companies: "Amazon, Shopify",
        codeSnippet: "const { count, increment, decrement } = useCounter({ min: 1, max: stock, step: 1 });"
      }
    ],
    howToExplain: {
      opening: "Custom hooks encapsulate state transitions behind bounded modifier functions, guaranteeing domain constraints are never violated.",
      keyPoints: [
        "Clamps values between min and max bounds.",
        "Supports dynamic step increments.",
        "Exposes clean, declarative control methods.",
        "Enforces single source of truth for business logic."
      ],
      closingImpression: "Encapsulating constraints inside custom hooks prevents UI components from duplicating validation logic.",
      analogies: ["A thermostat: you can press up or down, but the device physically clamps the temperature between 50°F and 90°F to protect the furnace."]
    },
    commonMistakes: [
      {
        mistake: "Allowing external callers to pass raw unclamped numbers to set().",
        why: "Allows callers to bypass min/max invariants.",
        correct: "Clamp values inside the set() method as well."
      }
    ],
    followUpDeepDive: [
      {
        question: "How do you handle floating point rounding issues in stepped counters (e.g. 0.1 + 0.2)?",
        answer: "Use integer arithmetic (scale up by power of 10) or format using `Number(val.toFixed(precision))` to avoid IEEE 754 precision artifacts like `0.30000000000000004`.",
        specReference: "IEEE 754 Floating-Point Arithmetic in JavaScript"
      }
    ]
  },

  "use-undo-redo-medium": {
    interviewCrossQuestions: [
      {
        question: "What is the State Machine structure of an immutable Undo/Redo hook?",
        answer: "State is an object: `{ past: [], present: T, future: [] }`. 1) **Set**: pushes `present` onto `past`, sets new `present`, clears `future`. 2) **Undo**: pops previous from `past`, moves `present` to `future`, sets previous as `present`. 3) **Redo**: pops next from `future`, moves `present` to `past`, sets next as `present`.",
        difficulty: "intermediate",
        whyAsked: "Classic data structure state machine question."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Rich Text Editors & Document Builders",
        description: "Maintaining undo/redo history stacks in WYSIWYG editors.",
        companies: "Notion, Google Docs Web",
        codeSnippet: "const { state, set, undo, redo, canUndo, canRedo } = useUndo(initialText);"
      }
    ],
    howToExplain: {
      opening: "An undo/redo state machine partitions history into past, present, and future stacks, maintaining strict immutability across transitions.",
      keyPoints: [
        "State shape: { past: [], present, future: [] }.",
        "New action pushes to past and clears future.",
        "Undo shifts from past to future; redo shifts from future to past.",
        "useReducer provides clean, predictable state transitions."
      ],
      closingImpression: "Implementing undo/redo with useReducer ensures state history transitions remain atomic and testable.",
      analogies: ["A browser history: clicking a new link clears your forward history; back moves you to previous pages; forward moves you back ahead."]
    },
    commonMistakes: [
      {
        mistake: "Forgetting to clear the future array when a new state update occurs.",
        why: "Making a new edit after an undo invalidates all subsequent redo states.",
        correct: "Always reset future: [] on new actions."
      }
    ],
    followUpDeepDive: [
      {
        question: "How do you bound memory consumption in an undo stack?",
        answer: "Enforce a maximum history limit (e.g. `maxHistory = 50`) using `past.slice(-maxHistory)` to evict oldest entries and prevent unbounded memory growth.",
        specReference: "Redux Documentation: Implementing Undo History"
      }
    ]
  },

  "state-reducer-inversion-hard": {
    interviewCrossQuestions: [
      {
        question: "What is Kent C. Dodds' State Reducer pattern and what problem does it solve?",
        answer: "The State Reducer pattern allows consumers of a custom hook to intercept and modify internal state changes before they are applied. The hook accepts an optional `stateReducer(state, action)` function from the user. Inside the hook's reducer, it passes the default proposed state change to the user's reducer: `userReducer(state, action) ?? defaultState`. This gives users 100% control over state transitions without forking the hook.",
        difficulty: "advanced",
        whyAsked: "Advanced component architecture pattern popularized in Downshift."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Downshift Autocomplete Menu Prevention",
        description: "Preventing a dropdown menu from closing when a specific item is selected, by intercepting the `ItemClick` action in the state reducer.",
        companies: "PayPal, Stripe",
        codeSnippet: "const { isOpen } = useSelect({ stateReducer: (state, action) => { if (action.type === 'ITEM_CLICK') return { ...state, isOpen: true }; } });"
      }
    ],
    howToExplain: {
      opening: "The State Reducer pattern inverts control by allowing consumers to intercept, modify, or cancel internal state transitions before they are applied.",
      keyPoints: [
        "Hook accepts an optional user-provided stateReducer function.",
        "Internal actions are exposed with descriptive action.type strings.",
        "User can return modified state or fall back to default behavior.",
        "Eliminates the need to add dozens of special-case boolean props."
      ],
      closingImpression: "State Reducers provide infinite extensibility for custom hooks without bloating the core API.",
      analogies: ["A customs border checkpoint: goods pass through automatically unless the border agent (state reducer) inspects and reroutes a specific crate."]
    },
    commonMistakes: [
      {
        mistake: "Throwing an error when user reducer does not handle an action.",
        why: "User reducers only handle actions they care about; all other actions must fall back to the default state.",
        correct: "Always return default changes if the user reducer returns undefined."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does the State Reducer pattern compare to Redux Middlewares?",
        answer: "Middlewares intercept actions before they hit reducers; State Reducers intercept the resulting state transition itself, acting as a post-processor for state changes.",
        specReference: "Kent C. Dodds: The State Reducer Pattern with React Hooks"
      }
    ]
  },

  "suspense-resource-wrapper-basic": {
    interviewCrossQuestions: [
      {
        question: "How does React Suspense work under the hood? What does a component throw?",
        answer: "React Suspense relies on **throwing Promises**! When a component attempts to read data that is not yet ready, the resource reader literally throws the pending Promise: `throw promise;`. React catches the thrown Promise inside its render work loop (via `throwException`), suspends rendering of that component subtree, mounts the nearest `<Suspense fallback={...}>` fallback to the screen, and attaches `.then()` to the promise. When the promise resolves, React restarts the render pass!",
        difficulty: "advanced",
        whyAsked: "The #1 core architectural question for React Suspense."
      },
      {
        question: "What are the three states of a Suspense resource wrapper?",
        answer: "1) `pending`: reading throws the Promise. 2) `success`: reading returns the resolved data. 3) `error`: reading throws the caught Error instance (caught by nearest Error Boundary).",
        difficulty: "intermediate",
        whyAsked: "Tests understanding of the wrapPromise protocol."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Relay & React 19 use() Hook",
        description: "The underlying protocol driving React 19's `use(promise)` hook and Relay's data-driven Suspense queries.",
        companies: "Meta, Next.js",
        codeSnippet: "function Profile() { const user = use(fetchUserPromise); return <h1>{user.name}</h1>; }"
      }
    ],
    howToExplain: {
      opening: "React Suspense works by catching thrown Promises during the render phase, pausing component rendering and displaying a fallback until the Promise resolves.",
      keyPoints: [
        "Components throw a Promise when data is pending.",
        "React catches the Promise and mounts the Suspense fallback.",
        "Attaches .then() to re-trigger rendering upon resolution.",
        "Standardized in React 19 as the native use(promise) hook."
      ],
      closingImpression: "Suspense turns asynchronous data fetching into declarative synchronous-looking code.",
      analogies: ["A waiter at a restaurant: you ask for soup; the waiter says 'the soup is simmering, here is some bread (fallback) while you wait', and brings the soup when ready."]
    },
    commonMistakes: [
      {
        mistake: "Creating a new fetch promise inside the render body without caching.",
        why: "On every render retry, a fresh promise is instantiated, causing infinite suspense loops.",
        correct: "Cache promises outside render or use React.cache / SWR / TanStack Query."
      }
    ],
    followUpDeepDive: [
      {
        question: "Where in React reconciler source is the thrown Promise caught?",
        answer: "In `packages/react-reconciler/src/ReactFiberWorkLoop.js` inside `throwException()`, which marks the fiber with `ShouldCapture` and finds the nearest `SuspenseComponent`.",
        specReference: "packages/react-reconciler/src/ReactFiberWorkLoop.js: throwException"
      }
    ]
  },

  "resilient-error-boundary-medium": {
    interviewCrossQuestions: [
      {
        question: "Why must Error Boundaries still be Class Components in React 18/19?",
        answer: "Because React hooks do NOT have an equivalent for the `componentDidCatch` or `getDerivedStateFromError` lifecycle methods. `getDerivedStateFromError` updates state synchronously during the render phase to show fallback UI, while `componentDidCatch` runs during the commit phase to log errors to monitoring services (Sentry).",
        difficulty: "intermediate",
        whyAsked: "Universal React Error Boundary question."
      },
      {
        question: "What types of errors do Error Boundaries NOT catch?",
        answer: "Error Boundaries do NOT catch: 1) Event handler errors (`onClick`). 2) Asynchronous callbacks (`setTimeout`, `requestAnimationFrame`). 3) Server-Side Rendering errors. 4) Errors thrown within the Error Boundary component itself (rather than its children).",
        difficulty: "intermediate",
        whyAsked: "Tests understanding of Error Boundary limitations."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Sentry / Datadog Exception Monitoring",
        description: "Capturing component stack traces and logging them to APM tools while rendering recovery UI.",
        companies: "Sentry, Datadog",
        codeSnippet: "componentDidCatch(error, info) { Sentry.captureException(error, { extra: info }); }"
      }
    ],
    howToExplain: {
      opening: "Error Boundaries catch JavaScript exceptions anywhere in their child component tree during rendering, lifecycle methods, and constructors, rendering a fallback UI.",
      keyPoints: [
        "getDerivedStateFromError updates state to render fallback.",
        "componentDidCatch logs error info and component stack traces.",
        "Does not catch event handler or async callback errors.",
        "Reset keys (resetErrorBoundary) allow users to retry failed subtrees."
      ],
      closingImpression: "Error boundaries prevent a single JavaScript error in a non-critical widget from crashing the entire web application.",
      analogies: ["Firedoors in a submarine: if one compartment floods (crashes), the firedoors seal that room to keep the rest of the submarine afloat."]
    },
    commonMistakes: [
      {
        mistake: "Expecting Error Boundaries to catch errors inside onClick handlers.",
        why: "Event handlers do not run during the render phase; errors there must be caught with standard try...catch.",
        correct: "Use try...catch in event handlers."
      }
    ],
    followUpDeepDive: [
      {
        question: "How do you trigger an Error Boundary from an async callback?",
        answer: "By setting state with a throwing function: `const [_, setError] = useState(); setError(() => { throw error; });` — this throws during the subsequent render phase, allowing the Error Boundary to catch it.",
        specReference: "React FAQ: Error Boundaries & Async Errors"
      }
    ]
  },

  "suspense-cache-dedup-hard": {
    interviewCrossQuestions: [
      {
        question: "How does React.cache deduplicate requests within a single render cycle?",
        answer: "In React 18/19 Server Components, `React.cache(fn)` memoizes function calls based on argument identity for the duration of a single server request. If 5 different components call `getUser(id)` with the same `id` during the render pass, `getUser` executes exactly ONCE and the cached Promise is shared among all 5 components, eliminating duplicate network/database calls.",
        difficulty: "advanced",
        whyAsked: "Core data architecture question for modern Next.js / React Server Components."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Next.js App Router Request Memoization",
        description: "Sharing database and fetch queries between layout.js, page.js, and metadata generators without prop drilling.",
        companies: "Next.js, Vercel",
        codeSnippet: "export const getItem = cache(async (id) => db.item.findUnique({ where: { id } }));"
      }
    ],
    howToExplain: {
      opening: "Suspense cache deduplication pools concurrent resource requests by key, sharing in-flight promises and caching resolved results.",
      keyPoints: [
        "Deduplicates in-flight requests made by multiple components.",
        "Scoped to the lifetime of a single request in RSC.",
        "Eliminates duplicate SQL/HTTP queries across component hierarchies.",
        "Replaces manual prop drilling of fetched data."
      ],
      closingImpression: "Request deduplication allows components to fetch their own data independently without worrying about duplicate network requests.",
      analogies: ["A carpool: instead of 5 coworkers driving 5 cars to the same meeting, they all ride in the same car."]
    },
    commonMistakes: [
      {
        mistake: "Assuming React.cache persists across different user HTTP requests.",
        why: "React.cache is scoped strictly to a single request lifecycle; it is not a global Redis cache.",
        correct: "Clarify that cache is per-request to prevent cross-user data leaks."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does React.cache compare to TanStack Query (React Query)?",
        answer: "React.cache is built for Server Components during request rendering. TanStack Query manages client-side caching, background polling, mutations, and cache invalidation in the browser.",
        specReference: "React Documentation: React.cache"
      }
    ]
  },

  "rsc-flight-parser-basic": {
    interviewCrossQuestions: [
      {
        question: "What is the React Flight protocol and wire format?",
        answer: "React Flight is the streaming wire format used to transmit React Server Components (RSC) to the client. It is a line-delimited stream where each line represents a chunk: 1) Model chunks (`M`): represent Client Component references (`{ id, chunks, name }`). 2) JSON chunks (`J`): represent element trees with props, children, and slots. 3) Promise chunks (`P`): represent suspended promises. The browser reconstructs the VDOM tree progressively without loading server-only JavaScript packages.",
        difficulty: "advanced",
        whyAsked: "The cutting-edge Next.js App Router / RSC architecture question."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Next.js Streaming RSC Hydration",
        description: "Streaming server-rendered component trees over HTTP without sending server-side dependencies (like markdown parsers or database drivers) to the browser.",
        companies: "Vercel, Next.js, Remix",
        codeSnippet: "// Flight Wire line: 0:[\"$\",\"div\",null,{\"children\":\"Hello\"}]"
      }
    ],
    howToExplain: {
      opening: "The React Flight wire format is a line-delimited JSON stream that serializes Server Component trees, allowing clients to reconstruct UI progressively.",
      keyPoints: [
        "Zero bundle impact: server libraries are never sent to the browser.",
        "Streams UI chunks as data resolves on the server.",
        "Client component boundaries are serialized as module references ($).",
        "Enables progressive streaming and concurrent hydration."
      ],
      closingImpression: "React Flight decouples backend computational complexity from client JavaScript bundle sizes.",
      analogies: ["Prefabricated housing: the factory builds and paints the walls on-site, shipping finished panels to the lot rather than shipping raw timber and sawmills."]
    },
    commonMistakes: [
      {
        mistake: "Thinking RSC returns raw HTML.",
        why: "RSC returns the Flight stream (virtual DOM descriptions), NOT raw HTML. HTML is generated by SSR. Flight allows updating client state without losing client component state.",
        correct: "Clarify that RSC returns Flight JSON data, not HTML."
      }
    ],
    followUpDeepDive: [
      {
        question: "Where in React source is the Flight Client implemented?",
        answer: "In `packages/react-client/src/ReactFlightClient.js` inside `parseModel()`, which converts wire strings into React elements.",
        specReference: "packages/react-client/src/ReactFlightClient.js"
      }
    ]
  },

  "selective-hydration-queue-medium": {
    interviewCrossQuestions: [
      {
        question: "What is Selective Hydration in React 18?",
        answer: "In traditional SSR, hydration was all-or-nothing: the browser had to download all JavaScript and hydrate the entire page before ANY component became interactive. In React 18, wrapping components in `<Suspense>` breaks the page into independent hydration chunks. React streams HTML first, and hydrates components as their JS scripts download. If a user clicks on an unhydrated component, React **prioritizes hydrating that specific component first**, making it interactive immediately!",
        difficulty: "advanced",
        whyAsked: "Core React 18 SSR streaming architecture question."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "E-Commerce Product Page Streaming SSR",
        description: "Hydrating the 'Buy Now' button immediately when the user clicks it, even if the heavy 'Reviews' component further down the page is still downloading.",
        companies: "Shopify, Amazon",
        codeSnippet: "<Suspense fallback={<ReviewsSkeleton />}><Reviews /></Suspense>"
      }
    ],
    howToExplain: {
      opening: "Selective Hydration allows React to stream HTML progressively and prioritize hydrating the specific components the user interacts with first.",
      keyPoints: [
        "Replaces all-or-nothing legacy hydration.",
        "Suspense boundaries define independent hydration islands.",
        "User interactions (clicks) boost hydration priority for target subtrees.",
        "Eliminates TTI (Time to Interactive) bottlenecks on heavy pages."
      ],
      closingImpression: "Selective Hydration bridges the gap between fast server rendering and instant user interactivity.",
      analogies: ["An amusement park: instead of waiting for all 50 rides to be inspected before opening the park gates, the most popular roller coaster opens first so guests can start riding immediately."]
    },
    commonMistakes: [
      {
        mistake: "Believing hydration must wait for all Suspense boundaries to resolve.",
        why: "React hydrates each Suspense boundary independently as soon as its code and data arrive.",
        correct: "State that Suspense boundaries decouple hydration across the tree."
      }
    ],
    followUpDeepDive: [
      {
        question: "What is Event Replaying in Selective Hydration?",
        answer: "If a user clicks a button before its hydration completes, React intercepts and queues the event, prioritizes hydrating that button, and then REPLAYS the click event on the newly hydrated component.",
        specReference: "React 18 Architecture: Selective Hydration & Event Replaying"
      }
    ]
  },

  "rsc-boundary-serialization-hard": {
    interviewCrossQuestions: [
      {
        question: "What types can and CANNOT be passed as props across the Server-to-Client component boundary in RSC?",
        answer: "Props passed from Server Components to Client Components ('use client') MUST be serializable by the Flight protocol: strings, numbers, booleans, null, undefined, plain objects, arrays, Dates, Maps, Sets, TypedArrays, and Server Actions (`'use server'`). You CANNOT pass functions (like `onClick`), class instances, or Symbols across the boundary; doing so throws a serialization error.",
        difficulty: "advanced",
        whyAsked: "Crucial boundary enforcement question for Next.js App Router."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "RSC Server Action Prop Passing",
        description: "Passing an asynchronous server action (`'use server'`) as an action prop to a client form component.",
        companies: "Vercel, Next.js",
        codeSnippet: "// Server Component passes server action to Client Button: <ClientButton onAction={serverAction} />"
      }
    ],
    howToExplain: {
      opening: "The Server-to-Client boundary requires strict serialization of props because data traverses an HTTP network boundary between server and client.",
      keyPoints: [
        "Primitives, plain objects, arrays, and Dates are serializable.",
        "Functions and class instances cannot cross the boundary.",
        "Server Actions ('use server') are serializable as endpoint IDs.",
        "Enforces clean separation between server computation and client UI."
      ],
      closingImpression: "Understanding serialization boundaries prevents runtime Flight crashes when mixing server and client components.",
      analogies: ["Shipping goods through international customs: raw ingredients (serializable data) pass through inspection; living animals or hazardous machinery (functions/closures) are stopped at the border."]
    },
    commonMistakes: [
      {
        mistake: "Passing an event handler onClick={() => {}} from a Server Component to a Client Component.",
        why: "Functions cannot be serialized over the wire; throws 'Functions cannot be passed directly to Client Components'.",
        correct: "Declare the event handler inside the Client Component."
      }
    ],
    followUpDeepDive: [
      {
        question: "How do Server Actions bypass the function serialization restriction?",
        answer: "A Server Action is not serialized as code; it is transformed by the compiler into an opaque action ID string (`$$typeof: Symbol.for('react.server.reference')`). When invoked on the client, React sends an HTTP POST request with that action ID back to the server.",
        specReference: "React RFC: Server Actions & Server References"
      }
    ]
  },

  "compiler-purity-linter-basic": {
    interviewCrossQuestions: [
      {
        question: "What are the core Rules of React enforced by the React Compiler (React Forget)?",
        answer: "1) **Components and Hooks must be Pure**: rendering must not mutate external variables, global objects, or passed props. 2) **No mutation of values after passing to JSX**: mutating an object after passing it to children breaks compiler memoization. 3) **Hooks must follow the Rules of Hooks**: called unconditionally at the top level. 4) **Side effects belong in effects or event handlers**.",
        difficulty: "advanced",
        whyAsked: "Checks familiarity with React 19's compiler and strict purity constraints."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Automated Memoization in React 19",
        description: "The React Compiler automatically analyzing components and memoizing JSX and values, eliminating manual useMemo and useCallback.",
        companies: "Meta (Instagram Web), Vercel",
        codeSnippet: "// Compiler transforms: let x; if (c[0] !== a) { x = expensive(a); c[0] = a; c[1] = x; } else { x = c[1]; }"
      }
    ],
    howToExplain: {
      opening: "The React Compiler automatically optimizes memoization at build time, requiring components to strictly adhere to the Rules of React.",
      keyPoints: [
        "Eliminates manual useMemo, useCallback, and React.memo.",
        "Static analysis verifies pure rendering contracts.",
        "Re-computes values only when source inputs change.",
        "Impure side effects during render disable compiler optimization."
      ],
      closingImpression: "The React Compiler proves that adhering to functional purity unlocks automated compiler-level performance.",
      analogies: ["A smart compiler like gcc -O3: write clean, standard code, and the compiler handles register allocation and loop unrolling automatically."]
    },
    commonMistakes: [
      {
        mistake: "Mutating props directly: props.items.push(newItem).",
        why: "Mutating props violates purity, causing the React Compiler to bail out and producing stale render bugs.",
        correct: "Treat props and state as strictly immutable."
      }
    ],
    followUpDeepDive: [
      {
        question: "What is eslint-plugin-react-compiler?",
        answer: "The official ESLint plugin that surfaces static violations of the Rules of React, identifying code patterns that prevent the compiler from optimizing components.",
        specReference: "React Documentation: ESLint Plugin React Compiler"
      }
    ]
  },

  "compiler-memo-cache-medium": {
    interviewCrossQuestions: [
      {
        question: "How does the React Compiler's internal memo cache array (c[0], c[1]) work?",
        answer: "The React Compiler injects a dedicated cache hook: `useMemoCache(size)`. It allocates a flat array `c` of slots. For each memoized block: it compares current inputs with cached inputs in `c[0]`. If changed, it recomputes the value and stores it in `c[1]`. A special sentinel symbol (`Symbol.for('react.memo_cache_sentinel')`) represents uninitialized empty slots (`$empty`).",
        difficulty: "advanced",
        whyAsked: "Tests deep knowledge of React Compiler bytecode/AST generation."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Automated Fine-Grained Component Memoization",
        description: "Compiled Instagram web components running with automated slot caching.",
        companies: "Meta",
        codeSnippet: "const $ = useMemoCache(4);"
      }
    ],
    howToExplain: {
      opening: "The React Compiler replaces manual useMemo hooks with an efficient flat cache slot array (useMemoCache), drastically reducing hook linked-list overhead.",
      keyPoints: [
        "useMemoCache allocates a flat array of memory slots.",
        "Slot comparisons check if inputs changed before recalculating.",
        "Avoids allocating separate Hook linked-list nodes for every memoization.",
        "Achieves finer granularity than human developers could manually write."
      ],
      closingImpression: "Flat cache slot arrays provide compiler-level memoization with near-zero runtime allocation cost.",
      analogies: ["A CPU L1 cache: small, indexed register slots that check if memory is fresh before executing a cycle."]
    },
    commonMistakes: [
      {
        mistake: "Calling useMemoCache manually in application code.",
        why: "useMemoCache is a low-level compiler runtime internal, not a public userland hook.",
        correct: "Let the React Compiler inject useMemoCache during build."
      }
    ],
    followUpDeepDive: [
      {
        question: "What is the react.memo_cache_sentinel symbol?",
        answer: "It is the uninitialized slot marker in `ReactFiberHooks.js` used to distinguish an un-computed slot from an explicit `undefined` return value.",
        specReference: "packages/react-reconciler/src/ReactFiberHooks.js: useMemoCache"
      }
    ]
  },

  "reconciler-dirty-subgraph-hard": {
    interviewCrossQuestions: [
      {
        question: "How does React reconciler bailout on a clean subtree during beginWork?",
        answer: "During `beginWork`, React checks two conditions: 1) `oldProps === newProps` and no state/context updates on the fiber. 2) `!includesSomeLane(wipLanes, renderLanes)`. If true, the component itself has no work. React then checks `includesSomeLane(childLanes, renderLanes)`: if false, NO descendant in the entire subtree has pending work! React calls `bailoutOnAlreadyFinishedWork()` and completely skips traversing the entire subtree in O(1) time.",
        difficulty: "advanced",
        whyAsked: "The core performance bailout logic in the React reconciler engine."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Large Enterprise Tree Invalidation Skipping",
        description: "Skipping reconciliation on 10,000 clean fibers when an update only affects a single small component leaf.",
        companies: "Meta, Salesforce",
        codeSnippet: "if (!checkScheduledUpdateOrContext(current, renderLanes)) return bailoutOnAlreadyFinishedWork(wip);"
      }
    ],
    howToExplain: {
      opening: "React achieves sub-millisecond updates in massive trees by bailing out on clean subtrees when lane priority bitmasks indicate no pending work.",
      keyPoints: [
        "Fiber checks if its own lanes match the current render lane.",
        "Checks childLanes to see if any descendant needs work.",
        "If childLanes has no matching work, skips the entire subtree in O(1).",
        "Propagates dirty lane flags upwards during completeWork."
      ],
      closingImpression: "Lane-based dirty subtree skipping is how React renders massive applications at 60fps.",
      analogies: ["An inspection team: before entering a 50-story building, they check the sensor board in the lobby; if all green lights show on floors 10-50, they skip taking the elevator to those floors."]
    },
    commonMistakes: [
      {
        mistake: "Assuming React always visits every fiber node in the tree on every setState.",
        why: "React skips clean subtrees in O(1) time using childLanes bitmasks.",
        correct: "Explain that childLanes enables early bailout without tree traversal."
      }
    ],
    followUpDeepDive: [
      {
        question: "What is bailoutOnAlreadyFinishedWork in ReactFiberBeginWork.js?",
        answer: "It clones the fiber's child from `current.child` to `workInProgress.child` and returns null, instructing the work loop to ascend rather than descend.",
        specReference: "packages/react-reconciler/src/ReactFiberBeginWork.js: bailoutOnAlreadyFinishedWork"
      }
    ]
  },

  "custom-reconciler-mini-basic": {
    interviewCrossQuestions: [
      {
        question: "What is react-reconciler and what are the essential HostConfig methods?",
        answer: "`react-reconciler` is the core package that powers ReactDOM, React Native, and React Three Fiber. To create a custom renderer, you supply a `HostConfig` implementing host environment methods: `createInstance(type, props)` (creates host element), `createTextInstance(text)`, `appendChild(parent, child)`, `removeChild(parent, child)`, `insertBefore(parent, child, before)`, and `commitUpdate(instance, updatePayload)`.",
        difficulty: "advanced",
        whyAsked: "Tests understanding of how React decouples reconciliation from host platform rendering."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "React Three Fiber (WebGL Scene Graph Rendering)",
        description: "Compiling JSX into 3D Three.js scene graphs (`<mesh><boxGeometry /></mesh>`) instead of DOM nodes.",
        companies: "Poimandres, Three.js",
        codeSnippet: "const reconciler = ReactReconciler({ createInstance(type) { return new THREE[type](); } });"
      },
      {
        scenario: "Ink (Interactive CLI Terminal Applications)",
        description: "Rendering React components into interactive command line terminal output using ANSI escape sequences.",
        companies: "Vercel, Prisma CLI",
        codeSnippet: "import { render, Text } from 'ink'; render(<Text color='green'>Hello CLI</Text>);"
      }
    ],
    howToExplain: {
      opening: "react-reconciler decouples declarative React component diffing from host platform rendering via a pluggable HostConfig interface.",
      keyPoints: [
        "HostConfig bridges React Fiber to any platform (DOM, WebGL, Terminal, Mobile).",
        "createInstance instantiates native platform objects.",
        "appendChild and removeChild manage physical tree structure.",
        "commitUpdate applies prop changes during the commit phase."
      ],
      closingImpression: "React is not a DOM library; React is a reconciliation engine that can render to any platform.",
      analogies: ["A universal adapter: React Fiber is the standard power outlet; HostConfig is the adapter plug that converts it to US, UK, or European sockets."]
    },
    commonMistakes: [
      {
        mistake: "Assuming ReactDOM is where React's diffing algorithm lives.",
        why: "ReactDOM is just a thin HostConfig wrapper around react-reconciler.",
        correct: "Clarify that react-reconciler contains the diffing engine; ReactDOM only handles browser DOM mutations."
      }
    ],
    followUpDeepDive: [
      {
        question: "What is supportsMutation vs supportsPersistence in HostConfig?",
        answer: "`supportsMutation: true` indicates a mutable host tree (like browser DOM where nodes are mutated in place). `supportsPersistence: true` indicates an immutable host tree (where trees are cloned on every change, like some graphics renderers).",
        specReference: "packages/react-reconciler/src/forks/ReactFiberHostConfig.dom.js"
      }
    ]
  },

  "canvas-grid-reconciler-medium": {
    interviewCrossQuestions: [
      {
        question: "How does a Canvas or Terminal Buffer Reconciler handle layout and character cell painting?",
        answer: "A terminal or 2D canvas reconciler maintains an in-memory 2D character buffer (e.g. `grid[y][x] = { char, style }`). In `commitUpdate` and `appendChild`, it calculates bounding box offsets (x, y) and writes character cells into the 2D grid array. At the end of the commit phase, it flushes the grid to the terminal using ANSI escape codes or paints to the `<canvas>` via 2D context fillText.",
        difficulty: "advanced",
        whyAsked: "Tests custom host tree mutation and frame rendering."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Interactive Terminal CLI Dashboards (Ink)",
        description: "Building rich CLI setup wizards and server dashboards using React components.",
        companies: "Gatsby CLI, Claude Code CLI, Vercel",
        codeSnippet: "<Box borderStyle='round'><Text>Deploying...</Text></Box>"
      }
    ],
    howToExplain: {
      opening: "A custom canvas/terminal reconciler translates React element trees into 2D grid matrix buffers, flushing assembled frames to terminal or canvas targets.",
      keyPoints: [
        "Maintains in-memory 2D coordinate matrix buffer.",
        "HostConfig methods map element props to grid cell coordinates.",
        "Commit phase flushes updated cells to screen in one unified draw call.",
        "Enables declarative React development in non-browser environments."
      ],
      closingImpression: "Custom reconcilers prove that React's component model scales far beyond the web browser.",
      analogies: ["An LED dot matrix display: components specify which coordinate lights up; the reconciler turns on the exact grid pixels at 60fps."]
    },
    commonMistakes: [
      {
        mistake: "Directly writing to stdout or canvas on every appendChild.",
        why: "Flushing on every child causes severe screen flickering.",
        correct: "Buffer changes in memory and flush in resetAfterCommit."
      }
    ],
    followUpDeepDive: [
      {
        question: "What is resetAfterCommit in React Reconciler?",
        answer: "HostConfig hook called once at the conclusion of the commit phase after all mutations are done, ideal for repainting canvas frames or writing terminal buffers.",
        specReference: "React Reconciler HostConfig: resetAfterCommit"
      }
    ]
  },

  "transactional-reconciler-commit-hard": {
    interviewCrossQuestions: [
      {
        question: "How does a Transactional Two-Phase Commit reconciler handle host mutation failures?",
        answer: "A Transactional Reconciler records an 'undo log' (inverse mutation operations) during the commit phase. If a host mutation fails (e.g. out-of-memory or invalid host node state), the reconciler intercepts the exception in a `try...catch`, halts forward mutations, and replays the undo log in reverse order, rolling back all previously applied host mutations to leave the host tree in a clean, consistent prior state.",
        difficulty: "advanced",
        whyAsked: "High-level database/systems reliability question in custom renderer design."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Embedded Hardware & Robotics UI Systems",
        description: "Controlling microcontrollers or industrial displays where hardware write failures must roll back to safe default states.",
        companies: "Tesla, Medical Device UIs",
        codeSnippet: "try { commitMutations(); } catch (e) { rollbackTransaction(); }"
      }
    ],
    howToExplain: {
      opening: "A transactional reconciler brings database-style ACID rollbacks to React commit phases, maintaining an inverse mutation journal to restore host consistency if mutations fail.",
      keyPoints: [
        "Records inverse operations before executing host mutations.",
        "Catches mutation errors during the commit phase.",
        "Replays rollback log in reverse order to restore previous state.",
        "Guarantees all-or-nothing host state integrity under failure."
      ],
      closingImpression: "Transactional commits prevent corrupt, partially-applied UI states in mission-critical hardware and financial renderers.",
      analogies: ["A bank wire transfer: if debiting Account A succeeds but crediting Account B fails, the system rolls back the debit so money is never lost."]
    },
    commonMistakes: [
      {
        mistake: "Replaying the rollback log in forward order.",
        why: "Rollbacks must execute in reverse order (LIFO) to properly unwind dependent tree mutations.",
        correct: "Iterate the rollback log in reverse order."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does React Fiber handle errors thrown during commitMutationEffects?",
        answer: "React wraps the commit phase in error handlers; if a mutation throws, React captures it, schedules an unmount of the failed root, and invokes Error Boundaries.",
        specReference: "packages/react-reconciler/src/ReactFiberWorkLoop.js: commitMutationEffects"
      }
    ]
  }
};
