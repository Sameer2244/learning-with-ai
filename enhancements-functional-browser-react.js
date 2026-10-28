// Comprehensive Interview Cross-Questions & Deep Preparation Data
// Domain: 4. Functional Patterns & 5. Browser Engine & 6. React Internals (24 Questions)

module.exports = {
  "curry-basic": {
    interviewCrossQuestions: [
      {
        question: "What is the difference between Currying and Partial Application?",
        answer: "Currying transforms a function of arity N into a chain of N unary functions (each taking exactly 1 argument): `f(a, b, c)` -> `f(a)(b)(c)`. Partial Application takes a function and fixes a subset of its arguments, returning a function that accepts the remaining arguments in a single call: `f(a, b, c)` -> `f(a)(b, c)`.",
        difficulty: "intermediate",
        whyAsked: "Universal functional programming terminology check."
      },
      {
        question: "How do default parameters affect fn.length in currying?",
        answer: "`fn.length` reports the number of formal parameters up to the FIRST parameter with a default value or rest parameter (`...args`). If a function is `(a, b = 1, c) => {}`, `fn.length` is strictly `1`, not 3. Currying algorithms relying purely on `fn.length` will fail if default parameters are present.",
        difficulty: "advanced",
        whyAsked: "Tests understanding of ECMA-262 function arity reflection."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Redux Middleware Architecture",
        description: "Redux middlewares are curried functions composed together: `store => next => action => next(action)`.",
        companies: "Redux Core",
        codeSnippet: "const logger = store => next => action => { console.log(action); return next(action); };"
      },
      {
        scenario: "Configurable API Endpoint Handlers",
        description: "Pre-configuring authorization tokens and base URLs before passing route-specific handlers.",
        companies: "Axios, Express",
        codeSnippet: "const withAuth = token => endpoint => fetch(endpoint, { headers: { Authorization: token } });"
      }
    ],
    howToExplain: {
      opening: "Currying is a functional transformation that decomposes a multi-argument function into a sequence of nested single-argument functions using closures.",
      keyPoints: [
        "Currying enables point-free function composition and partial argument reuse.",
        "Accumulates arguments in closure scope until the target arity is satisfied.",
        "fn.length is used to dynamically detect expected parameter count.",
        "Redux middlewares and Ramda rely fundamentally on currying."
      ],
      closingImpression: "Currying turns static multi-argument functions into flexible, composable building blocks.",
      analogies: ["An espresso machine where you first set the grind size, then lock in the temperature, and finally press brew."]
    },
    commonMistakes: [
      {
        mistake: "Assuming rest parameters count towards fn.length.",
        why: "Rest parameters (...args) have a length of 0.",
        correct: "Check arguments dynamically or allow passing an explicit arity parameter."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does Ramda implement curry with placeholder support (R.__)?",
        answer: "Ramda checks for a sentinel Symbol (`R.__`). If present, it records the argument slot as unfilled, allowing subsequent curried calls to fill the gap before invoking the target function.",
        specReference: "Ramda.js internal curry implementation"
      }
    ]
  },

  "curry-medium": {
    interviewCrossQuestions: [
      {
        question: "How does generalized dynamic currying handle multiple arguments passed in a single step (e.g. curry(fn)(1, 2)(3))?",
        answer: "A generalized dynamic curry checks `accumulatedArgs.length >= fn.length`. On each invocation, it concatenates new arguments: `const nextArgs = [...accumulatedArgs, ...newArgs]`. If `nextArgs.length >= fn.length`, it immediately executes `fn.apply(this, nextArgs)`; otherwise, it returns a new closure holding `nextArgs`.",
        difficulty: "intermediate",
        whyAsked: "Tests practical currying implementation flexibility."
      },
      {
        question: "How do you preserve the 'this' context across curried invocations?",
        answer: "In the final execution step, you must call `fn.apply(this, nextArgs)` and avoid arrow functions where the outer receiver could be lost, or explicitly capture and forward `this`.",
        difficulty: "intermediate",
        whyAsked: "Checks method currying context retention."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Validation Rule Pipelines",
        description: "Composing reusable validators: `const isGreaterThan = curry((min, val) => val > min)`.",
        companies: "Zod, Yup, Joi",
        codeSnippet: "const minAge = isGreaterThan(18);"
      }
    ],
    howToExplain: {
      opening: "Dynamic generalized currying inspects the function's arity via fn.length and recursively accumulates arguments across arbitrary call boundaries until all parameters are supplied.",
      keyPoints: [
        "Combines currying with partial application flexibility.",
        "Preserves this binding across multi-step execution.",
        "Supports passing 1, 2, or all arguments in any single step.",
        "Essential for utility toolkits like Lodash and Ramda."
      ],
      closingImpression: "Dynamic arity checking provides an ergonomic developer experience while retaining mathematical functional purity.",
      analogies: ["A vending machine that takes coins one by one or in handfuls, only dispensing the snack once total price is reached."]
    },
    commonMistakes: [
      {
        mistake: "Mutating an internal arguments array rather than creating fresh copies.",
        why: "Mutating shared arrays causes branches of curried functions to cross-contaminate each other's state.",
        correct: "Always use spread or slice to keep each curried closure branch immutable."
      }
    ],
    followUpDeepDive: [
      {
        question: "What is the ECMAScript specification rule for Function.prototype.length?",
        answer: "Per ECMA-262 §20.2.2.2, `length` is an accessor property configured as non-writable and configurable. It counts the number of formal parameters before the first default parameter.",
        specReference: "ECMA-262 §20.2.2.2 Function.prototype.length"
      }
    ]
  },

  "curry-hard": {
    interviewCrossQuestions: [
      {
        question: "How does pipeAsync handle error recovery in a point-free asynchronous pipeline?",
        answer: "In `pipeAsync(...fns)`, the pipeline folds functions via `fns.reduce((accPromise, fn) => accPromise.then(val => fn(val)).catch(errorHandler))`. An error recovery handler can intercept errors at specific pipeline stages, returning fallback data to allow subsequent stages to continue or re-throwing to abort.",
        difficulty: "advanced",
        whyAsked: "Tests understanding of async Promise chaining and error propagation."
      },
      {
        question: "Why is compose right-to-left while pipe is left-to-right?",
        answer: "`compose(f, g)(x)` mirrors mathematical notation `f(g(x))` (right-to-left). `pipe(f, g)(x)` mirrors Unix pipeline streams `x | f | g` (left-to-right), which is significantly more intuitive for developers reading sequential data transformations.",
        difficulty: "basic",
        whyAsked: "Validates functional design conventions."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Express/Koa Middleware Onion Model",
        description: "Koa pipelines compose asynchronous middlewares into an onion-layered Promise execution chain.",
        companies: "Koa, Fastify",
        codeSnippet: "const pipeline = compose([auth, validate, handler]);"
      }
    ],
    howToExplain: {
      opening: "An asynchronous pipeline sequentially chains synchronous and asynchronous functions together, passing the resolved output of each stage to the next.",
      keyPoints: [
        "Uses Promise.resolve(x) to normalize synchronous and asynchronous return values.",
        "pipe executes left-to-right; compose executes right-to-left.",
        "Error handling can be unified or handled per-stage.",
        "Standard architecture for data ETL pipelines and server middleware."
      ],
      closingImpression: "Point-free asynchronous pipelines turn complex nested async logic into clean, readable linear flows.",
      analogies: ["A factory conveyor belt: raw materials enter step 1, get painted at step 2, and packaged at step 3."]
    },
    commonMistakes: [
      {
        mistake: "Using forEach instead of reduce for async pipelines.",
        why: "forEach cannot wait for promises between steps.",
        correct: "Use reduce with Promise chaining or an async for...of loop."
      }
    ],
    followUpDeepDive: [
      {
        question: "What is the TC39 Pipeline Operator (|>) proposal?",
        answer: "The Stage 2 Pipeline Operator proposal introduces native syntax: `value |> fnA(%) |> await fnB(%)`, eliminating the need for userland pipe/compose functions.",
        specReference: "TC39 Proposal: The Pipeline Operator"
      }
    ]
  },

  "debounce-basic": {
    interviewCrossQuestions: [
      {
        question: "What is the fundamental difference between Debounce and Throttle?",
        answer: "Debounce delays execution until a specified quiet period has elapsed with NO new calls (ideal for search input typing). Throttle guarantees execution at a steady, fixed rate (at most once every N milliseconds), regardless of how frequently events are fired (ideal for window resize or scroll).",
        difficulty: "basic",
        whyAsked: "The #1 classic frontend interview question."
      },
      {
        question: "Why must debounce preserve 'this' and argument forwarding?",
        answer: "Because debounced functions are frequently attached as DOM event handlers. If `this` is not forwarded via `fn.apply(this, args)`, the handler loses access to the DOM element (`event.currentTarget`) or class instance.",
        difficulty: "intermediate",
        whyAsked: "Tests attention to callback receiver context."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Search Autocomplete Input",
        description: "Waiting for user to stop typing for 300ms before firing expensive backend autocomplete queries.",
        companies: "Google, Amazon, Algolia",
        codeSnippet: "input.addEventListener('input', debounce(fetchSuggestions, 300));"
      },
      {
        scenario: "Auto-Saving Form State",
        description: "Saving document edits to cloud storage 1 second after user stops typing.",
        companies: "Google Docs, Notion",
        codeSnippet: "editor.on('change', debounce(saveDocument, 1000));"
      }
    ],
    howToExplain: {
      opening: "Debounce groups a burst of rapid events into a single invocation by resetting an internal timer on each trigger, executing only when a quiet window has elapsed.",
      keyPoints: [
        "Clears existing timer on every incoming call using clearTimeout.",
        "Sets a new timer for the specified delay.",
        "Preserves this context and arguments via closure.",
        "Prevents overwhelming servers and UI threads with high-frequency events."
      ],
      closingImpression: "Debouncing is essential for reducing network load and preventing rate limiting on search endpoints.",
      analogies: ["An elevator door: every time someone steps in, the door timer resets. The elevator only moves once people stop entering for 5 seconds."]
    },
    commonMistakes: [
      {
        mistake: "Creating a new debounced function inside a React component render body.",
        why: "On every re-render, a fresh debounce instance is created with its own timer, breaking debouncing completely.",
        correct: "Wrap debounce in useMemo, useCallback, or useRef to keep a stable instance."
      }
    ],
    followUpDeepDive: [
      {
        question: "How do you test a debounced function in Jest without waiting real time?",
        answer: "Use Jest's fake timers: `jest.useFakeTimers()`, invoke the debounced function, call `jest.advanceTimersByTime(delay)`, and assert the mock was invoked.",
        specReference: "Jest Documentation: Timer Mocks"
      }
    ]
  },

  "throttle-medium": {
    interviewCrossQuestions: [
      {
        question: "Explain the two common throttling strategies: leading edge vs trailing edge.",
        answer: "Leading edge (leading: true) executes immediately on the first call, then locks execution for N ms. Trailing edge (trailing: true) queues the last call received during the quiet window and fires it once the window expires. Lodash throttle supports enabling both simultaneously.",
        difficulty: "intermediate",
        whyAsked: "Separates simple throttle implementations from production-grade requirements."
      },
      {
        question: "What is the difference between timestamp-based throttling and timer-based throttling?",
        answer: "Timestamp throttling (`Date.now() - lastRun >= limit`) gives instant leading execution with zero timer overhead, but drops trailing calls. Timer throttling (`setTimeout`) naturally supports trailing execution, but delays the initial call. Combining both achieves leading + trailing precision.",
        difficulty: "advanced",
        whyAsked: "Tests understanding of timing algorithms."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Infinite Scroll & Viewport Visibility",
        description: "Checking scroll position at 60fps (throttled to ~16ms) to trigger fetching next pages.",
        companies: "Twitter, Instagram, Pinterest",
        codeSnippet: "window.addEventListener('scroll', throttle(checkScrollPosition, 100));"
      },
      {
        scenario: "Interactive Canvas Drag & Drop",
        description: "Throttling mousemove updates to keep canvas redraws aligned with display frame rates.",
        companies: "Figma, Canva",
        codeSnippet: "canvas.on('mousemove', throttle(updateCoordinates, 16));"
      }
    ],
    howToExplain: {
      opening: "Throttling enforces a maximum execution frequency, guaranteeing a function runs at most once in a specified time window regardless of invocation volume.",
      keyPoints: [
        "Guarantees periodic progress during continuous high-frequency events.",
        "Can execute on the leading edge (immediately) or trailing edge (at window end).",
        "Essential for scroll, resize, and mousemove listeners.",
        "Differs from debounce by guaranteeing regular updates during long continuous activity."
      ],
      closingImpression: "Throttling prevents high-frequency DOM events from starving the main thread and dropping frame rates.",
      analogies: ["A machine gun firing rate limiter: no matter how fast you pull the trigger, the gun only fires at a fixed cyclic rate."]
    },
    commonMistakes: [
      {
        mistake: "Dropping trailing events on scroll listeners.",
        why: "If trailing edge is disabled, the final scroll position when the user stops scrolling is never reported, leaving UI in an incomplete state.",
        correct: "Always ensure the trailing edge executes with the freshest coordinates."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does throttling compare to requestAnimationFrame for animation loops?",
        answer: "Throttling operates on clock milliseconds (e.g. 100ms). For visual animations, `requestAnimationFrame` is superior because it synchronizes directly with the GPU display v-sync cycle, automatically pausing when the browser tab is hidden.",
        specReference: "W3C Timing control for script-based animations (rAF)"
      }
    ]
  },

  "debounce-hard": {
    interviewCrossQuestions: [
      {
        question: "Why does a production debounce function need .cancel() and .flush() methods?",
        answer: "`.cancel()` cleans up pending timers when components unmount (preventing memory leaks and state updates on unmounted components). `.flush()` forces immediate execution of any pending deferred call (essential on form submission or navigation before timers expire).",
        difficulty: "intermediate",
        whyAsked: "Tests production-grade lifecycle integration (the Lodash pattern)."
      },
      {
        question: "What is maxWait in Lodash debounce?",
        answer: "`maxWait` guarantees that a continuously triggered debounced function will still be forced to execute at least once every `maxWait` milliseconds, preventing indefinite execution starvation during nonstop typing.",
        difficulty: "advanced",
        whyAsked: "Tests deep familiarity with industry-standard utility libraries."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Component Unmount Cleanup in React",
        description: "Canceling pending debounced API calls inside useEffect cleanup to prevent memory leaks.",
        companies: "Every major React production codebase",
        codeSnippet: "useEffect(() => () => debouncedSearch.cancel(), []);"
      },
      {
        scenario: "Form Submission Flush",
        description: "Flushing pending debounced validation or draft save when user clicks Submit immediately.",
        companies: "Stripe Checkout, Shopify",
        codeSnippet: "function onSubmit() { debouncedSave.flush(); submitForm(); }"
      }
    ],
    howToExplain: {
      opening: "A production-grade debounce combines leading/trailing triggers with explicit lifecycle controls (.cancel, .flush) and starvation limits (maxWait).",
      keyPoints: [
        "Supports leading execution for immediate feedback and trailing for final state capture.",
        ".cancel() prevents memory leaks on component unmount.",
        ".flush() guarantees immediate settlement before navigation.",
        "maxWait prevents continuous event streams from postponing execution indefinitely."
      ],
      closingImpression: "Advanced debounce is not just a timer utility; it is a full lifecycle state machine.",
      analogies: ["An emergency door release: it normally waits for authorization, but the fire alarm (.flush) opens it immediately, and the power switch (.cancel) disarms it."]
    },
    commonMistakes: [
      {
        mistake: "Forgetting to clear timer references inside .cancel().",
        why: "Leaving the timer ID uncleared can cause stale checks or prevent garbage collection.",
        correct: "Call clearTimeout(timer) and reset timer = null."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does Lodash share code between debounce and throttle?",
        answer: "In Lodash source code, `throttle` is actually implemented directly on top of `debounce` by simply passing `{ leading: true, trailing: true, maxWait: wait }` to the debounce engine.",
        specReference: "Lodash source: lodash.js - throttle implementation"
      }
    ]
  },

  "array-basic": {
    interviewCrossQuestions: [
      {
        question: "How do Array.prototype.myMap and myFilter handle sparse arrays (holes)?",
        answer: "Per ECMA-262 §23.1.3.14, `map` and `filter` must inspect whether the index is an 'own property' using `k in array` (or `Object.prototype.hasOwnProperty.call(array, k)`). If an array is sparse (e.g. `[1, , 3]`), index 1 is a hole; the callback MUST NOT be invoked for index 1, and the resulting array must preserve the hole for `map`.",
        difficulty: "advanced",
        whyAsked: "The #1 trap question when implementing array polyfills."
      },
      {
        question: "What should map and filter do if thisArg is provided?",
        answer: "The callback must be invoked using `callback.call(thisArg, array[k], k, array)` so that any `this` references inside the callback point to the passed `thisArg`.",
        difficulty: "basic",
        whyAsked: "Checks complete adherence to the standard API signature."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Data Normalization in Redux Reducers",
        description: "Transforming backend API arrays into normalized entity maps or filtered UI view collections.",
        companies: "All web applications",
        codeSnippet: "const activeUsers = users.filter(u => u.active).map(u => u.id);"
      }
    ],
    howToExplain: {
      opening: "Specification-compliant map and filter polyfills iterate over elements while strictly respecting sparse array holes and thisArg binding.",
      keyPoints: [
        "Checks 'k in array' before invoking the callback to skip holes in sparse arrays.",
        "Passes element, index, and original array to callback.",
        "Supports optional thisArg binding.",
        "Creates a fresh array without mutating the source."
      ],
      closingImpression: "Respecting sparse array holes is what distinguishes an amateur polyfill from a specification-grade implementation.",
      analogies: ["Walking down a street: if a house number is an empty lot (hole), the mail carrier skips it without trying to deliver a letter."]
    },
    commonMistakes: [
      {
        mistake: "Checking array[k] !== undefined instead of k in array.",
        why: "An array can contain an explicit `undefined` element `[undefined]`, which is NOT a hole and MUST be processed.",
        correct: "Use `k in array` to test for slot existence."
      }
    ],
    followUpDeepDive: [
      {
        question: "What is an exotic Array object in ECMA-262?",
        answer: "An exotic Array object has a customized internal `[[DefineOwnProperty]]` method that automatically updates the `.length` property when numeric indices are added, and truncates elements when `.length` is decreased.",
        specReference: "ECMA-262 §10.4.2 Array Exotic Objects"
      }
    ]
  },

  "array-medium": {
    interviewCrossQuestions: [
      {
        question: "What happens if reduce() is called on an empty array without an initialValue?",
        answer: "Per ECMA-262 §23.1.3.24, calling `reduce` on an empty array without an `initialValue` MUST throw a `TypeError: Reduce of empty array with no initial value`.",
        difficulty: "intermediate",
        whyAsked: "Classic boundary edge case test."
      },
      {
        question: "If no initialValue is provided, what is used as the initial accumulator?",
        answer: "The first non-empty element in the array is used as the initial accumulator, and iteration begins at the NEXT index (index 1 if index 0 was populated).",
        difficulty: "intermediate",
        whyAsked: "Verifies initial value resolution logic."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Grouping and Aggregating Data (groupBy polyfill)",
        description: "Reducing a flat list of transactions into category totals.",
        companies: "Stripe, QuickBooks",
        codeSnippet: "const totals = txs.reduce((acc, t) => { acc[t.cat] = (acc[t.cat] || 0) + t.amount; return acc; }, {});"
      }
    ],
    howToExplain: {
      opening: "Array.prototype.reduce accumulates elements into a single value, requiring careful handling of initial accumulator resolution and empty array validation.",
      keyPoints: [
        "Throws TypeError if array is empty and no initialValue is supplied.",
        "If initialValue is omitted, the first non-empty element becomes accumulator.",
        "Skips sparse array holes during iteration.",
        "Capable of implementing map, filter, and flat through reduction."
      ],
      closingImpression: "reduce is the universal catamorphism of arrays: almost all other array methods can be expressed as a reduction.",
      analogies: ["A snowball rolling down a hill: it starts with an initial core (initialValue) and picks up snow with every turn until it reaches the bottom."]
    },
    commonMistakes: [
      {
        mistake: "Defaulting initialValue to 0 or null when omitted.",
        why: "When initialValue is omitted, the FIRST array element must be used as the accumulator.",
        correct: "Track whether an initial value was provided by checking arguments.length > 1."
      }
    ],
    followUpDeepDive: [
      {
        question: "Why is Array.prototype.reduceRight needed?",
        answer: "`reduceRight` iterates in reverse (from length-1 down to 0). It is essential for function composition pipelines (`compose`) where functions evaluate right-to-left.",
        specReference: "ECMA-262 §23.1.3.25 Array.prototype.reduceRight"
      }
    ]
  },

  "array-hard": {
    interviewCrossQuestions: [
      {
        question: "How does Array.prototype.flat handle sparse array holes?",
        answer: "Per ECMA-262 §23.1.3.11, `flat()` automatically strips empty slots (holes) in sparse arrays, compacting the resulting array without holes.",
        difficulty: "intermediate",
        whyAsked: "Tests knowledge of modern ES2019 array flattening specification."
      },
      {
        question: "How can deep recursive array flattening defend against circular references?",
        answer: "If an array contains a circular reference to itself (`arr[0] = arr`), naive recursion triggers a call stack overflow. Maintaining a `Set` of visited array references prevents cyclic recursion loops.",
        difficulty: "advanced",
        whyAsked: "Tests defensive programming in recursive algorithms."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Flattening Nested Category Hierarchies",
        description: "Flattening nested comment reply threads or e-commerce taxonomy trees into flat lists for UI rendering.",
        companies: "Reddit, Amazon",
        codeSnippet: "const flatComments = comments.flat(Infinity);"
      }
    ],
    howToExplain: {
      opening: "Array.prototype.flat creates a new array with sub-array elements concatenated up to a specified depth, stripping sparse holes.",
      keyPoints: [
        "Recursively flattens nested arrays up to specified depth limit.",
        "Automatically strips sparse array holes.",
        "Depth defaults to 1; Infinity flattens completely.",
        "Circular reference detection ensures robustness against recursive cycles."
      ],
      closingImpression: "Flattening nested structures with depth guards is fundamental for processing hierarchical JSON responses.",
      analogies: ["Unpacking nested shipping boxes: depth 1 opens the outer box; depth Infinity opens every nested box until only items remain."]
    },
    commonMistakes: [
      {
        mistake: "Decreasing depth after the recursive call.",
        why: "Depth must decrement as you descend: `recurse(item, depth - 1)`.",
        correct: "Pass depth - 1 to recursive child calls."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does flatMap differ from map followed by flat?",
        answer: "`flatMap` maps each element using a mapping function and flattens the result by depth 1 in a single combined traversal, which is more memory efficient than creating an intermediate array.",
        specReference: "ECMA-262 §23.1.3.12 Array.prototype.flatMap"
      }
    ]
  },

  "event-basic": {
    interviewCrossQuestions: [
      {
        question: "What is Event Delegation and why is it memory efficient?",
        answer: "Event Delegation attaches a single event listener to a common parent element rather than attaching separate listeners to hundreds of child elements. It leverages the Event Bubbling phase: events originating on children bubble up to the parent, where `event.target` identifies the originating element. It drastically reduces memory footprint and automatically handles dynamically added children without re-binding.",
        difficulty: "basic",
        whyAsked: "Universal frontend interview question."
      },
      {
        question: "What is the difference between event.target and event.currentTarget?",
        answer: "`event.target` is the actual innermost DOM element where the event originated (the clicked button). `event.currentTarget` is the element to which the event handler is currently attached (the parent listener). In event delegation, `target` is the child, `currentTarget` is the parent.",
        difficulty: "basic",
        whyAsked: "Essential distinction for DOM event programming."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Virtual Lists & Dynamic Table Rows",
        description: "Attaching a single click handler to a 10,000-row table instead of attaching 10,000 individual event listeners.",
        companies: "AG Grid, Slack",
        codeSnippet: "table.addEventListener('click', e => { const row = e.target.closest('tr'); if (row) handleRow(row); });"
      }
    ],
    howToExplain: {
      opening: "Event delegation harnesses the DOM event bubbling mechanism to handle events at a parent container level, optimizing memory and simplifying dynamic element handling.",
      keyPoints: [
        "Attaches one listener to parent instead of N listeners to children.",
        "event.target points to clicked element; event.currentTarget points to listener element.",
        "Uses Element.closest() to resolve target matching nested child spans or icons.",
        "Automatically handles dynamically inserted or deleted child nodes."
      ],
      closingImpression: "Event delegation is the primary technique for maintaining lightweight DOM memory profiles in high-density web apps.",
      analogies: ["A company reception desk: one receptionist signs for all incoming packages rather than delivery drivers wandering to every employee desk."]
    },
    commonMistakes: [
      {
        mistake: "Using e.target.matches('button') when buttons contain inner <span> or <svg> elements.",
        why: "Clicking the icon makes e.target the svg, causing matches('button') to return false.",
        correct: "Use `e.target.closest('button')` to walk up to the button container."
      }
    ],
    followUpDeepDive: [
      {
        question: "Which DOM events do NOT bubble?",
        answer: "`focus`, `blur`, `load`, `unload`, `mouseenter`, and `mouseleave` do NOT bubble. However, `focusin` and `focusout` do bubble and can be delegated.",
        specReference: "W3C UI Events Specification §3.1 Event dispatch and DOM tree"
      }
    ]
  },

  "event-medium": {
    interviewCrossQuestions: [
      {
        question: "How does EventEmitter prevent memory leaks from forgotten subscriptions?",
        answer: "By enforcing an unsubscribe mechanism (returning an unsubscribe function or calling `.off()`). In Node.js, EventEmitter sets a default warning limit (`defaultMaxListeners = 10`): adding more than 10 listeners triggers a memory leak warning to alert developers to uncleaned handlers.",
        difficulty: "intermediate",
        whyAsked: "Tests understanding of memory leak prevention in Pub/Sub systems."
      },
      {
        question: "How does the 'once' modifier work in an EventEmitter?",
        answer: "It wraps the user callback in a proxy function: when invoked, the proxy first unsubscribes itself from the event emitter, and then executes the original user callback.",
        difficulty: "intermediate",
        whyAsked: "Tests wrapper closure design."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Node.js Stream & HTTP Socket Management",
        description: "Node.js core modules (HTTP, Net, Streams) inherit from EventEmitter to notify callers of data chunks and connection events.",
        companies: "Node.js Core, Express",
        codeSnippet: "server.on('request', (req, res) => {});"
      }
    ],
    howToExplain: {
      opening: "A custom EventEmitter implements the Observer pattern, decoupling event producers from consumers with support for single-shot listeners and clean unsubscribe teardowns.",
      keyPoints: [
        "Maintains an in-memory Map of event names to listener arrays.",
        "once wraps callback in a self-removing closure.",
        "Returning an unsubscribe function provides clean teardown for React useEffect hooks.",
        "Prevents memory leaks by ensuring event handlers are discarded when no longer needed."
      ],
      closingImpression: "EventEmitters are the core messaging spine of asynchronous Node.js backend systems.",
      analogies: ["A magazine subscription service: you subscribe to issues, can cancel your subscription, or sign up for a single free trial issue."]
    },
    commonMistakes: [
      {
        mistake: "Mutating the listener array while iterating during emit().",
        why: "If a listener unsubscribes itself during emit, mutating the array in-place causes the loop to skip the next listener.",
        correct: "Iterate over a shallow copy: `const listeners = [...(events[name] || [])]`."
      }
    ],
    followUpDeepDive: [
      {
        question: "What is EventTarget in modern browsers and how does it compare to EventEmitter?",
        answer: "`EventTarget` is the standardized Web API (`addEventListener`, `removeEventListener`, `dispatchEvent`) implemented by DOM nodes and available in Node 16+ as `globalThis.EventTarget`.",
        specReference: "WHATWG DOM Standard §2.7 Interface EventTarget"
      }
    ]
  },

  "event-hard": {
    interviewCrossQuestions: [
      {
        question: "What are the three distinct phases of DOM event propagation?",
        answer: "1) Capturing Phase: event trickles down from `Window` -> `Document` -> `<html>` -> `<body>` down to the target's parent. 2) Target Phase: event arrives at the target element. 3) Bubbling Phase: event bubbles back up from the target element back up to `Window`.",
        difficulty: "basic",
        whyAsked: "Fundamental browser DOM architecture question."
      },
      {
        question: "What is the difference between event.stopPropagation() and event.stopImmediatePropagation()?",
        answer: "`stopPropagation()` prevents the event from traveling further up (or down) the DOM tree, but allows any OTHER event listeners registered on the CURRENT element to still execute. `stopImmediatePropagation()` stops tree propagation AND immediately blocks any remaining listeners on the CURRENT element from firing.",
        difficulty: "intermediate",
        whyAsked: "Tests precise understanding of propagation halting."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Modal Backdrop Click Dismissal",
        description: "Stopping click propagation on modal content boxes so clicking inside doesn't trigger backdrop close listeners.",
        companies: "Tailwind UI, Bootstrap",
        codeSnippet: "modalContent.addEventListener('click', e => e.stopPropagation());"
      }
    ],
    howToExplain: {
      opening: "DOM event propagation follows a strict bidirectional pipeline: descending during the capture phase, reaching the target, and ascending during bubbling.",
      keyPoints: [
        "Capturing descends; bubbling ascends.",
        "addEventListener third parameter `{ capture: true }` listens during capture phase.",
        "stopPropagation halts tree traversal; stopImmediatePropagation also halts sibling listeners.",
        "preventDefault cancels default browser actions (link navigation, form submit) without stopping propagation."
      ],
      closingImpression: "Mastering event phases allows surgical interception of user actions before child components receive them.",
      analogies: ["A scuba diver descending to the ocean floor (capture), touching the sunken treasure (target), and floating back to the surface (bubble)."]
    },
    commonMistakes: [
      {
        mistake: "Assuming stopPropagation() prevents the browser default action.",
        why: "stopPropagation only halts event traversal; it does NOT stop default actions like checkbox checking or link navigation.",
        correct: "Use e.preventDefault() to cancel default browser behaviors."
      }
    ],
    followUpDeepDive: [
      {
        question: "What are Passive Event Listeners ({ passive: true }) and why do they improve scroll performance?",
        answer: "By passing `{ passive: true }`, the developer guarantees the listener will never call `e.preventDefault()`. This allows browser compositors to scroll the page immediately on the GPU thread without blocking to wait for the JavaScript thread to evaluate.",
        specReference: "W3C DOM Level 3 Events & Chrome Scrolling Performance"
      }
    ]
  },

  "render-basic": {
    interviewCrossQuestions: [
      {
        question: "What is Layout Thrashing (Forced Synchronous Layout)?",
        answer: "Layout Thrashing occurs when JavaScript alternately reads and writes DOM geometric properties in a loop (e.g. `element.style.width = x; const h = element.offsetHeight;`). Writing invalidates the layout tree; reading forces the browser engine to stop and execute synchronous recalculation of layout before continuing, dropping FPS to single digits.",
        difficulty: "intermediate",
        whyAsked: "Crucial web performance and browser engine question."
      },
      {
        question: "Which DOM properties trigger forced layout recalculation when read?",
        answer: "Reading geometric or scroll properties forces layout: `offsetWidth`, `offsetHeight`, `offsetTop`, `offsetLeft`, `scrollTop`, `scrollWidth`, `getBoundingClientRect()`, and `getComputedStyle()`. Browsers must flush pending layout queues to return accurate pixel values.",
        difficulty: "intermediate",
        whyAsked: "Tests knowledge of browser layout triggers."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "FastDOM / Read-Write Batching Libraries",
        description: "Coordinating UI animations across large teams by batching all DOM reads into `requestAnimationFrame` before scheduling DOM writes.",
        companies: "Wilson Page FastDOM, Google Chrome team",
        codeSnippet: "fastdom.measure(() => { const h = el.offsetHeight; fastdom.mutate(() => { el.style.height = h*2; }); });"
      }
    ],
    howToExplain: {
      opening: "Layout thrashing is eliminated by separating DOM reads from DOM writes into distinct batches, preventing repetitive forced synchronous reflows.",
      keyPoints: [
        "Reading geometric properties flushes pending layout queues.",
        "Alternating reads and writes causes multiple expensive layout passes per frame.",
        "Batch all reads first (measure), then execute all writes (mutate).",
        "Use requestAnimationFrame to synchronize mutations with display refresh."
      ],
      closingImpression: "Eliminating forced synchronous layouts is the #1 way to restore smooth 60fps animations in complex web apps.",
      analogies: ["A contractor measuring a house: measure all 10 rooms first with your tape measure, then cut all 10 boards at the saw, rather than measuring one room, cutting one board, and walking back 10 times."]
    },
    commonMistakes: [
      {
        mistake: "Reading offsetHeight inside a for loop that sets style.top.",
        why: "Forces N synchronous layout passes, turning an O(N) loop into an O(N^2) CPU bottleneck.",
        correct: "Read all heights into an array first, then apply all top styles in a second pass."
      }
    ],
    followUpDeepDive: [
      {
        question: "How do modern CSS containment properties (contain: layout paint) help layout performance?",
        answer: "`contain: layout` tells the browser layout engine that the element's internal layout has zero influence on the rest of the page, scoping reflow recalculations strictly to that subtree.",
        specReference: "W3C CSS Containment Module Level 2"
      }
    ]
  },

  "render-medium": {
    interviewCrossQuestions: [
      {
        question: "What is a Virtual DOM element and why is creating it faster than creating a real DOM node?",
        answer: "A Virtual DOM element is a plain, lightweight JavaScript object: `{ type: 'div', props: { className: 'box' }, children: [] }`. Creating 10,000 plain JS objects takes ~2ms and allocates minimal heap memory. In contrast, a real HTML DOM node (`HTMLDivElement`) carries over 300 built-in properties, event listeners, layout boxes, and C++ engine bindings, making real DOM instantiation 100x slower.",
        difficulty: "basic",
        whyAsked: "Fundamental architectural reasoning behind React and Vue."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "React React.createElement & JSX Runtime",
        description: "JSX transforms compile directly into Virtual DOM factory calls: `<div />` -> `React.createElement('div')`.",
        companies: "Meta, Next.js",
        codeSnippet: "const vnode = h('div', { className: 'card' }, 'Hello');"
      }
    ],
    howToExplain: {
      opening: "The Virtual DOM abstracts the physical browser DOM into lightweight JavaScript object representations, enabling declarative UI programming and in-memory diffing.",
      keyPoints: [
        "Real DOM nodes have heavy C++ bindings and hundreds of properties.",
        "Virtual DOM nodes are pure JS objects: { type, props, children }.",
        "VDOM tree mounts into real DOM via recursive document.createElement.",
        "Decouples UI description from host platform (enabling React Native, SSR).",
      ],
      closingImpression: "Virtual DOM trades a fraction of memory for declarative code and cross-platform flexibility.",
      analogies: ["An architectural blueprint: drafting and revising a blueprint on paper is fast and free; tearing down real brick walls is expensive and slow."]
    },
    commonMistakes: [
      {
        mistake: "Believing Virtual DOM is always faster than direct real DOM manipulation.",
        why: "A targeted direct DOM update (`el.textContent = 'x'`) is always faster than creating a VDOM, diffing it, and updating. VDOM's advantage is developer productivity and declarative consistency at scale.",
        correct: "Clarify that VDOM is 'fast enough' while providing immense maintainability benefits."
      }
    ],
    followUpDeepDive: [
      {
        question: "How do compile-time frameworks like Svelte avoid Virtual DOM entirely?",
        answer: "Svelte compiles reactive state assignments directly into targeted surgical DOM mutations (`p.data = count`) at build time, bypassing runtime VDOM tree allocation and diffing entirely.",
        specReference: "Svelte Architecture: Virtual DOM is pure overhead"
      }
    ]
  },

  "render-hard": {
    interviewCrossQuestions: [
      {
        question: "How does React achieve O(N) tree diffing when the general tree edit distance problem is O(N^3)?",
        answer: "General tree diffing (Levenshtein edit distance for trees) is O(N^3). React and modern VDOM engines achieve O(N) linear time using two heuristic assumptions: 1) Two elements of different types will produce different trees (replaces old tree entirely). 2) The developer can hint which child elements remain stable across renders using the `key` prop.",
        difficulty: "advanced",
        whyAsked: "The classic algorithmic computer science question in frontend interviews."
      },
      {
        question: "Why should you NEVER use array index as a key in dynamic lists?",
        answer: "Using index keys (`key={index}`) breaks identity when items are prepended, deleted, or reordered. React matches the old index 0 fiber to the new index 0 item, preserving the old component's internal state (uncontrolled input text, animations) on the WRONG item.",
        difficulty: "intermediate",
        whyAsked: "High-frequency bug source in production React apps."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "React Child Reconciliation (reconcileChildrenArray)",
        description: "Diffing lists using key-based Map lookups to emit minimal DOM insertion, deletion, and relocation operations.",
        companies: "Meta, Preact",
        codeSnippet: "const existing = new Map(oldChildren.map(c => [c.key, c]));"
      }
    ],
    howToExplain: {
      opening: "A VDOM diff engine solves the tree reconciliation problem in linear O(N) time using heuristic type-checking and key-based child mapping.",
      keyPoints: [
        "O(N^3) general diff is reduced to O(N) via type comparison and keys.",
        "Different element types unmount and recreate the subtree completely.",
        "Same element types patch changed props and diff children.",
        "Keys allow identifying reordered nodes without recreating DOM elements."
      ],
      closingImpression: "Reconciliation minimizes physical DOM mutations, which are the slowest part of browser rendering.",
      analogies: ["Moving house: if you label your moving boxes (keys), the movers put each box directly in the right room instead of unpacking everything into the living room and guessing."]
    },
    commonMistakes: [
      {
        mistake: "Assuming diffing modifies the real DOM immediately during tree traversal.",
        why: "Diffing accumulates a list of patches (Render Phase); mutations are applied in a single synchronous commit batch (Commit Phase).",
        correct: "Explain the separation between diffing (Render phase) and mutation (Commit phase)."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does Preact's diffing algorithm differ from React Fiber?",
        answer: "Preact diffs directly against the live real DOM tree without an intermediate Fiber linked list, making it ~3KB in size compared to React's ~40KB Fiber reconciler.",
        specReference: "Preact source: src/diff/index.js"
      }
    ]
  },

  "fiber-basic": {
    interviewCrossQuestions: [
      {
        question: "What is a Fiber Node in React and what are its core pointers?",
        answer: "A Fiber Node is a plain JavaScript object representing a unit of work. It replaces recursive call stack frames with linked-list pointers: `child` (points to first child), `sibling` (points to next sibling), and `return` (points to parent fiber). This structure allows React to traverse, pause, resume, and abort rendering loops without call stack limitations.",
        difficulty: "intermediate",
        whyAsked: "Core React internal architecture check."
      },
      {
        question: "What is the purpose of the 'alternate' pointer on a Fiber node?",
        answer: "The `alternate` pointer links the currently rendered Fiber (`current`) to its counterpart being constructed in memory (`workInProgress`). React uses a Double Buffering strategy: it recycles the alternate fiber on re-renders, avoiding garbage collection object churn.",
        difficulty: "advanced",
        whyAsked: "Tests understanding of React's memory allocation and double-buffering strategy."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "React 16-19 Reconciler Engine",
        description: "The internal representation of all components in React applications.",
        companies: "Meta, Next.js, Gatsby",
        codeSnippet: "function FiberNode(tag, pendingProps, key) { this.child = null; this.sibling = null; this.return = null; }"
      }
    ],
    howToExplain: {
      opening: "A Fiber node is a unit of work with child, sibling, and return linked-list pointers that transforms component hierarchy into an interruptible work queue.",
      keyPoints: [
        "Replaced the synchronous recursive Stack Reconciler in React 16.",
        "Linked-list pointers (child, sibling, return) enable iterative tree traversal.",
        "Stores memoizedState, memoizedProps, and pending work flags.",
        "Alternate pointer provides double buffering to minimize GC overhead."
      ],
      closingImpression: "Fiber transformed React from a synchronous UI library into an asynchronous UI operating system.",
      analogies: ["A git repository: 'current' is the main production branch; 'workInProgress' is a feature branch where you make changes, merging (committing) when complete."]
    },
    commonMistakes: [
      {
        mistake: "Confusing Fiber nodes with React Elements.",
        why: "React Elements are ephemeral objects created by JSX on every render. Fibers are persistent, stateful nodes that survive across renders.",
        correct: "Clarify that Elements are transient descriptors; Fibers are persistent units of work."
      }
    ],
    followUpDeepDive: [
      {
        question: "How do React Lanes replace expiration times in Fiber priority scheduling?",
        answer: "In React 17+, Lanes use 31-bit integers where each bit represents a priority lane (SyncLane, InputContinuousLane, DefaultLane). Bitwise operators (`&`, `|`) allow React to combine, check, and defer priority groups in O(1) CPU operations.",
        specReference: "React source: packages/react-reconciler/src/ReactFiberLane.js"
      }
    ]
  },

  "fiber-medium": {
    interviewCrossQuestions: [
      {
        question: "How does React link sibling chains when a parent returns multiple children?",
        answer: "During `reconcileChildren`, React iterates through the children array: the first child is attached to `parent.child`. Each subsequent child is linked to the previous child via `prevChild.sibling = currentChild`. All children have their `return` pointer pointed back to the parent.",
        difficulty: "intermediate",
        whyAsked: "Tests linked-list construction mechanics."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "React Fragments (<>...</>)",
        description: "Fragments return arrays of sibling fibers without creating extra wrapper DOM elements.",
        companies: "Meta",
        codeSnippet: "<> <Header /> <Main /> </>"
      }
    ],
    howToExplain: {
      opening: "Fiber linking transforms standard child arrays into a singly-linked list of siblings connected to a shared parent via return pointers.",
      keyPoints: [
        "First child becomes parent.child.",
        "Subsequent children link via sibling pointers.",
        "All children link back to parent via return pointers.",
        "Enables non-recursive traversal across multi-child trees."
      ],
      closingImpression: "Singly-linked pointer trees eliminate array re-allocation during traversal.",
      analogies: ["A row of houses: the road connects to the first house (child); each house has a side gate to its neighbor (sibling); all have the street address on the deed (return)."]
    },
    commonMistakes: [
      {
        mistake: "Assigning all children to parent.children array on a fiber.",
        why: "Fiber does not use children arrays; it uses a single `child` pointer to the head of a sibling linked list.",
        correct: "Only the first child is linked to parent.child."
      }
    ],
    followUpDeepDive: [
      {
        question: "What is the return pointer on a Fiber node and why is it not called parent?",
        answer: "It is called `return` because it represents the execution context that work returns to upon completing the current node, directly mirroring function return mechanics on call stacks.",
        specReference: "Andrew Clark: A Cartoon Intro to Fiber"
      }
    ]
  },

  "fiber-hard": {
    interviewCrossQuestions: [
      {
        question: "Walk through the workLoop algorithm using child, sibling, and return pointers.",
        answer: "1) `beginWork(node)`: descend to `node.child` if it exists. 2) If no child, `completeWork(node)`: check `node.sibling`. If sibling exists, pivot to sibling and repeat step 1. 3) If no sibling, ascend to `node.return`, complete parent, and check parent's sibling. 4) Terminate when reaching root with no siblings.",
        difficulty: "advanced",
        whyAsked: "The ultimate React Fiber traversal algorithm question."
      },
      {
        question: "How does this iterative traversal allow React to pause work during Concurrent Mode?",
        answer: "Because traversal is an iterative `while` loop tracking a single global pointer `workInProgress`, pausing is as simple as saving the current pointer and breaking out of the loop: `if (shouldYield()) break;`. When the browser has idle time, React calls `workLoop()` and picks up exactly from `workInProgress` without unwinding.",
        difficulty: "advanced",
        whyAsked: "Tests understanding of how linked lists enable cooperative multitasking."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "React Concurrent workLoop (workLoopConcurrent)",
        description: "The core engine loop driving React 18/19 concurrent rendering.",
        companies: "Meta",
        codeSnippet: "while (workInProgress !== null && !shouldYield()) { workInProgress = performUnitOfWork(workInProgress); }"
      }
    ],
    howToExplain: {
      opening: "React reconciles components using an iterative Depth-First Search over child, sibling, and return pointers, enabling interruptible, time-sliced rendering.",
      keyPoints: [
        "beginWork descends down child pointers.",
        "completeWork bubbles up return pointers.",
        "Pivots laterally across sibling pointers.",
        "Can pause at any unit of work and resume without losing position."
      ],
      closingImpression: "By removing recursive call frames, React achieved the holy grail of UI engineering: interruptible rendering.",
      analogies: ["Exploring a cave with a rope: you walk in (child), check side passages (sibling), and backtrack along the rope (return). You can drop the rope for lunch and pick it up right where you stood."]
    },
    commonMistakes: [
      {
        mistake: "Using recursion to traverse Fibers.",
        why: "Recursion defeats the entire purpose of Fiber: recursive calls cannot be paused or yielded.",
        correct: "Always use an iterative while loop with pointer assignments."
      }
    ],
    followUpDeepDive: [
      {
        question: "What are Effect Flags (flags & subtreeFlags) in modern React Fibers?",
        answer: "In React 18+, `flags` stores bitwise mutations (Placement, Update, Deletion) on the fiber. `subtreeFlags` aggregates whether any descendant in the subtree has pending mutations, allowing React to skip traversing entire clean subtrees in O(1) time.",
        specReference: "React source: packages/react-reconciler/src/ReactFiberFlags.js"
      }
    ]
  },

  "stale-basic": {
    interviewCrossQuestions: [
      {
        question: "How does usePrevious capture the previous render value using a ref?",
        answer: "`useRef` returns a mutable object `{ current: val }` whose identity persists across renders. In `usePrevious(value)`, we create `const ref = useRef()`. Inside `useEffect(() => { ref.current = value; })`, we update the ref AFTER rendering completes. During the render phase, `ref.current` still holds the value from the PREVIOUS render pass, returning it safely.",
        difficulty: "intermediate",
        whyAsked: "Tests understanding of React lifecycle and effect execution timing."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Transition Animations & Value Comparison",
        description: "Comparing `prevProps` vs `currentProps` in functional components to trigger entrance/exit animations.",
        companies: "Framer Motion, React Spring",
        codeSnippet: "const prevCount = usePrevious(count); if (count > prevCount) triggerGlow();"
      }
    ],
    howToExplain: {
      opening: "usePrevious leverages the fact that useEffect executes after the render and commit phase, allowing a mutable ref to return the previous value during render before being updated.",
      keyPoints: [
        "useRef holds a persistent value across renders without triggering re-renders.",
        "Render phase returns the current ref value.",
        "useEffect updates ref.current after the browser paints.",
        "Enables clean previous-value tracking in functional components."
      ],
      closingImpression: "Understanding the delay between render evaluation and effect execution is key to mastering React hooks.",
      analogies: ["Taking a snapshot: you look at the photo you took yesterday during the day, and at night (effect) you replace it with today's photo."]
    },
    commonMistakes: [
      {
        mistake: "Updating ref.current directly in the render body instead of in useEffect.",
        why: "Updating ref during render violates pure rendering rules and breaks in Concurrent Mode where renders can be aborted.",
        correct: "Always mutate refs inside useEffect or event handlers."
      }
    ],
    followUpDeepDive: [
      {
        question: "Why does React documentation advise against reading/writing refs during render?",
        answer: "In Concurrent Mode, React may render a component multiple times before committing, or abandon an in-flight render. Mutating refs during render produces non-deterministic side effects.",
        specReference: "React Docs: Referencing Values with Refs"
      }
    ]
  },

  "stale-medium": {
    interviewCrossQuestions: [
      {
        question: "Why does setInterval inside useEffect capture stale state?",
        answer: "If `useEffect` has an empty dependency array `[]`, the effect callback runs only once on mount. The interval callback closes over state variables from that initial render pass (e.g. `count = 0`). Every time the interval fires, it reads that stale captured variable. Using functional updates (`setCount(prev => prev + 1)`) or Dan Abramov's `useInterval` with a mutable callback ref solves this.",
        difficulty: "intermediate",
        whyAsked: "The single most famous React Hooks interview trap."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Live Stock Tickers & Countdown Timers",
        description: "Running persistent intervals that access latest state and props without resetting the timer on every keystroke.",
        companies: "Robinhood, Bloomberg",
        codeSnippet: "useInterval(() => fetchLatestQuote(symbol), 1000);"
      }
    ],
    howToExplain: {
      opening: "Stale closures in timers occur when an asynchronous callback captures a snapshot of state from an older render pass. Functional state updates bypass closure capture by reading from React's pending update queue.",
      keyPoints: [
        "setInterval setup once on mount captures initial render closure.",
        "Adding state to effect dependency array resets the timer on every tick.",
        "Functional updaters (prev => prev + 1) read fresh state without dependencies.",
        "useInterval uses a mutable callback ref to read fresh functions dynamically."
      ],
      closingImpression: "Separating timer duration lifecycle from callback execution prevents timer resetting bugs in React.",
      analogies: ["A wall clock with a speaker: instead of recording a message on day 1 that plays forever, the clock calls a live hotline (ref) to ask what to say every minute."]
    },
    commonMistakes: [
      {
        mistake: "Writing setCount(count + 1) inside an interval with [] dependencies.",
        why: "count is captured as 0; 0 + 1 is always 1, so count never increments past 1.",
        correct: "Use setCount(prev => prev + 1)."
      }
    ],
    followUpDeepDive: [
      {
        question: "How will React 19's useEffectEvent solve this natively?",
        answer: "`useEffectEvent` creates a non-reactive event function that always sees fresh props and state but is omitted from effect dependency arrays, preventing unwanted timer resets.",
        specReference: "React RFC: useEffectEvent"
      }
    ]
  },

  "stale-hard": {
    interviewCrossQuestions: [
      {
        question: "How does React store hook state on a Fiber node?",
        answer: "Hooks are stored as a singly-linked list of Hook nodes on `fiber.memoizedState`. Each Hook node has `{ memoizedState, next, queue }`. On every render, React resets a pointer (`workInProgressHook = fiber.memoizedState`) and advances step-by-step through the list as hooks are called.",
        difficulty: "advanced",
        whyAsked: "Reveals whether candidate knows the underlying hook implementation."
      },
      {
        question: "Why does the 'Rule of Hooks' forbid calling hooks inside if statements or loops?",
        answer: "Because React identifies hooks strictly by their sequential call order! If an `if` statement skips a hook on render 2, the linked list pointer gets out of alignment: hook 3 reads state belonging to hook 2, corrupting component state and throwing invariant errors.",
        difficulty: "intermediate",
        whyAsked: "The foundational reasoning behind React's Rules of Hooks."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "React Fiber Hooks Dispatcher (ReactFiberHooks.js)",
        description: "The internal state machine powering useState, useEffect, and useMemo in React.",
        companies: "Meta",
        codeSnippet: "workInProgressHook = workInProgressHook.next;"
      }
    ],
    howToExplain: {
      opening: "React hooks are implemented as a singly-linked list attached to fiber.memoizedState, relying strictly on invocation order to synchronize state across renders.",
      keyPoints: [
        "Each hook is a node in a singly-linked list on the fiber.",
        "Mount phase allocates nodes; update phase traverses existing nodes.",
        "Conditional hooks alter linked list order and corrupt state.",
        "Object.is compares dependency arrays to determine if effects/memos re-run."
      ],
      closingImpression: "Hooks are not magic; they are simple linked-list cursors tied to component render passes.",
      analogies: ["A pill organizer with compartments labeled Monday through Sunday: you must take them in exact order; skipping a day mixes up all your medications."]
    },
    commonMistakes: [
      {
        mistake: "Assuming hooks are stored in a key-value Map by hook name.",
        why: "Hooks have no names; React has no idea what variable name you assign to useState.",
        correct: "State clearly that hooks are stored in a sequential linked list on the fiber."
      }
    ],
    followUpDeepDive: [
      {
        question: "How do HooksDispatcherOnMount and HooksDispatcherOnUpdate differ?",
        answer: "React switches global dispatchers: during initial mount, `ReactCurrentDispatcher.current = HooksDispatcherOnMount` (which creates nodes). During re-renders, it switches to `HooksDispatcherOnUpdate` (which reads and updates existing nodes).",
        specReference: "React source: packages/react-reconciler/src/ReactFiberHooks.js"
      }
    ]
  },

  "rerender-basic": {
    interviewCrossQuestions: [
      {
        question: "How does shallowEqual differ from Object.is?",
        answer: "`Object.is(a, b)` checks if two references are identical. `shallowEqual(objA, objB)` first checks `Object.is(objA, objB)`. If false, it verifies that both are non-null objects with the same number of keys, and checks that every key in `objA` passes `Object.is(objA[k], objB[k])` against `objB`. It does NOT recurse into nested objects.",
        difficulty: "intermediate",
        whyAsked: "Tests understanding of React.memo and PureComponent comparison mechanics."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "React.memo & PureComponent Prop Comparison",
        description: "Skipping component re-renders when passed props are shallowly equal to previous props.",
        companies: "Meta, Airbnb",
        codeSnippet: "export default React.memo(MyComponent);"
      }
    ],
    howToExplain: {
      opening: "shallowEqual compares objects at depth 1, checking reference identity for each top-level key without recursing into nested structures.",
      keyPoints: [
        "Checks Object.is on the root objects first.",
        "Compares key count and checks Object.is on every top-level property.",
        "O(K) comparison where K is top-level property count.",
        "The default comparison function in React.memo and PureComponent."
      ],
      closingImpression: "Shallow equality provides fast O(1) bailouts for component memoization.",
      analogies: ["Checking passport covers: you check if two people hold matching blue US passports, without opening the pages to inspect travel stamps."]
    },
    commonMistakes: [
      {
        mistake: "Passing inline object literals <Component style={{ color: 'red' }} /> to a memoized component.",
        why: "A new object reference is created on every render, causing shallowEqual to fail every time.",
        correct: "Memoize objects with useMemo or extract them outside the component."
      }
    ],
    followUpDeepDive: [
      {
        question: "Why does Object.is differ from === regarding NaN and -0?",
        answer: "`Object.is(NaN, NaN)` is `true` (whereas `NaN === NaN` is false). `Object.is(+0, -0)` is `false` (whereas `+0 === -0` is true). React uses `Object.is` for state change detection.",
        specReference: "ECMA-262 §7.2.12 SameValue"
      }
    ]
  },

  "rerender-medium": {
    interviewCrossQuestions: [
      {
        question: "When should you NOT use React.memo?",
        answer: "1) Components that render cheaply (the overhead of shallowEqual can exceed render cost). 2) Components that almost always receive different props (memoization check runs and fails 100% of the time, wasting CPU). 3) Components accepting un-memoized object literals or functions as props.",
        difficulty: "intermediate",
        whyAsked: "Tests practical performance profiling discernment vs premature optimization."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Large Data Grid Cells",
        description: "Wrapping cell components in React.memo so updating row 5 doesn't re-render 500 other visible rows.",
        companies: "Google Sheets Web, Notion",
        codeSnippet: "const Cell = React.memo(({ value }) => <td>{value}</td>);"
      }
    ],
    howToExplain: {
      opening: "React.memo is a higher-order component that skips rendering when incoming props are shallowly equal to previous props, recycling the previous Fiber.",
      keyPoints: [
        "Wraps component and intercepts render dispatch.",
        "Uses shallowEqual by default; accepts custom comparator.",
        "Only checks props; internal state changes (useState) still trigger re-renders.",
        "Must be paired with useMemo and useCallback on parent props to be effective."
      ],
      closingImpression: "React.memo is a surgical tool for expensive components, not a blanket wrapper for every component.",
      analogies: ["A cache of printed documents: if the content didn't change, hand out another copy instead of running the printing press again."]
    },
    commonMistakes: [
      {
        mistake: "Assuming React.memo prevents re-renders when internal state updates.",
        why: "React.memo ONLY checks props. If the component's own useState or useContext updates, it re-renders unconditionally.",
        correct: "Clarify that memoization only skips renders caused by parent updates."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does the upcoming React Compiler (React Forget) change the need for React.memo?",
        answer: "The React Compiler automatically injects fine-grained memoization at the Babel/build step, memoizing values and component JSX blocks automatically, largely eliminating manual `React.memo`, `useMemo`, and `useCallback`.",
        specReference: "React Labs: The React Compiler Architecture"
      }
    ]
  },

  "rerender-hard": {
    interviewCrossQuestions: [
      {
        question: "How do selector stores (Zustand / Redux) prevent unnecessary re-renders compared to React Context?",
        answer: "React Context triggers re-renders on ALL consuming components whenever the context value reference changes, even if a component only consumes a small property. Selector stores use external subscriptions outside of React (`useSyncExternalStore`): components pass a selector `state => state.user.name`. The store checks if the selector output changed via `Object.is`; if not, the component skips re-rendering entirely.",
        difficulty: "advanced",
        whyAsked: "High-level state management architecture question."
      },
      {
        question: "How does useSyncExternalStore prevent 'Tearing' in Concurrent React?",
        answer: "'Tearing' occurs in Concurrent Mode when a component starts rendering with state version 1, yields to the browser, an external store mutates to version 2, and a sibling component renders version 2, resulting in an inconsistent UI. `useSyncExternalStore` detects external store mutations during render and forces a synchronous fallback to guarantee consistent UI snapshots.",
        difficulty: "advanced",
        whyAsked: "Tests React 18 concurrency safety knowledge."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Zustand & Redux Toolkit State Selectors",
        description: "Subscribing to fine-grained state slices in enterprise apps without context re-render cascades.",
        companies: "Discord, Uber, Shopify",
        codeSnippet: "const username = useStore(state => state.user.name);"
      }
    ],
    howToExplain: {
      opening: "Fine-grained selector stores bypass React Context re-render cascades by maintaining external subscriptions and notifying only components whose selected slice has changed.",
      keyPoints: [
        "Context re-renders all consumers on any value change.",
        "Selector stores evaluate slice equality (Object.is) before scheduling component renders.",
        "useSyncExternalStore integrates external stores safely with Concurrent React.",
        "Achieves O(1) targeted renders in massive state trees."
      ],
      closingImpression: "Fine-grained subscriptions scale state management to hundreds of thousands of updates without performance degradation.",
      analogies: ["A news subscription: instead of receiving the entire 500-page Sunday paper when you only care about sports, you receive a text message alert only when your favorite team scores."]
    },
    commonMistakes: [
      {
        mistake: "Returning a new object literal in a selector without equality comparison: state => ({ a: state.a, b: state.b }).",
        why: "Returning a new object reference on every state change causes the selector to fail equality checks, forcing re-renders on every action.",
        correct: "Use shallow equality or split into multiple separate selector hooks."
      }
    ],
    followUpDeepDive: [
      {
        question: "What is the three-argument signature of useSyncExternalStore?",
        answer: "`useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)`. `subscribe` registers listeners, `getSnapshot` returns the current client state, and `getServerSnapshot` returns initial SSR state for hydration consistency.",
        specReference: "React Documentation: useSyncExternalStore"
      }
    ]
  }
};
