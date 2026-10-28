// Comprehensive Interview Cross-Questions & Deep Preparation Data
// Domain: 2. Asynchronous JS & Concurrency & 3. Prototypes, Objects & Type System (18 Questions)
// Questions: event-loop-basic, event-loop-medium, event-loop-hard,
//            promise-basic, promise-medium, promise-hard,
//            generators-basic, generators-medium, generators-hard,
//            proto-basic, proto-medium, proto-hard,
//            coercion-basic, coercion-medium, coercion-hard,
//            clone-basic, clone-medium, clone-hard

module.exports = {
  "event-loop-basic": {
    interviewCrossQuestions: [
      {
        question: "What is the exact execution priority between Microtasks, Macrotasks, and requestAnimationFrame?",
        answer: "Execution proceeds as: 1) Synchronous code runs to completion on the Call Stack. 2) The entire Microtask Queue is drained to exhaustion (Promises, queueMicrotask, MutationObserver). 3) If rendering is due (typically 60Hz/120Hz refresh interval), the browser executes requestAnimationFrame callbacks, followed by Style calculation, Layout, and Paint. 4) The event loop picks exactly ONE task from the Macrotask Queue (setTimeout, setInterval, I/O), after which it immediately checks and drains any new microtasks again.",
        difficulty: "intermediate",
        whyAsked: "Tests comprehensive understanding of the HTML Living Standard event loop lifecycle."
      },
      {
        question: "Why does Promise.resolve().then() run before setTimeout(fn, 0)?",
        answer: "Promises schedule jobs into the Microtask Queue (ECMAScript Job Queue), whereas `setTimeout` schedules tasks into the host Macrotask Queue. Per HTML specification §8.1.6, the 'microtask checkpoint' runs immediately at the end of the current script task before the event loop advances to the next task in the macrotask queue.",
        difficulty: "basic",
        whyAsked: "The universal junior-to-mid interviewer filter question."
      },
      {
        question: "What happens if a microtask recursively enqueues another microtask?",
        answer: "The event loop stays trapped in the microtask checkpoint until the queue is 100% empty. Recursive microtasks cause 'Microtask Starvation' (infinite loop), completely freezing the browser tab or Node.js process: user clicks cannot register, rendering cannot occur, and macrotasks (like timers and I/O) are starved indefinitely.",
        difficulty: "advanced",
        whyAsked: "Tests understanding of microtask queue draining behavior vs macrotask single-item execution."
      },
      {
        question: "How does process.nextTick in Node.js compare to queueMicrotask?",
        answer: "`process.nextTick` is specific to Node.js and runs in its own dedicated Next Tick Queue, which has HIGHER priority than the standard Promise microtask queue. In Node.js, the nextTick queue is drained immediately after the current operation finishes, BEFORE the Promise microtask queue.",
        difficulty: "intermediate",
        whyAsked: "Tests Node.js libuv runtime knowledge vs browser web standards."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "React Batching & State Flush Timing",
        description: "React batches multiple setState updates and schedules a single re-render pass via a microtask, collapsing 50 synchronous state updates into 1 DOM reconciliation.",
        companies: "Meta, Vercel",
        codeSnippet: "queueMicrotask(() => flushWork());"
      },
      {
        scenario: "Asynchronous Cache Normalization (Zalgo Prevention)",
        description: "Libraries that return cached data synchronously wrap responses in `queueMicrotask` to guarantee that API callbacks always execute asynchronously, preventing race conditions.",
        companies: "Node.js Core, Axios",
        codeSnippet: "function getData(cb) { if (cache) queueMicrotask(() => cb(cache)); else fetch(cb); }"
      }
    ],
    howToExplain: {
      opening: "The JavaScript event loop coordinates code execution, event handling, and task scheduling. Synchronous code runs on the Call Stack, while asynchronous work is partitioned into Microtasks and Macrotasks.",
      keyPoints: [
        "Microtasks (Promises, queueMicrotask) have strict priority and drain completely before any macrotask.",
        "Macrotasks (setTimeout, I/O) execute one at a time per event loop cycle.",
        "Browser rendering (rAF, style, layout) occurs between macrotask turns when the display is ready.",
        "Recursive microtasks starve the event loop, freezing rendering and I/O."
      ],
      closingImpression: "Knowing the microtask-to-macrotask priority is fundamental for building stutter-free 60fps UIs and high-throughput Node.js servers.",
      analogies: ["Microtasks are VIP backstage guests who all get served before the door opens for the next general admission ticket holder (macrotask)."]
    },
    commonMistakes: [
      {
        mistake: "Saying 'setTimeout(0) runs immediately after the current line'.",
        why: "setTimeout(0) only queues a macrotask. All synchronous statements and ALL queued microtasks will execute before the timer fires.",
        correct: "Explain that setTimeout(0) must wait for the current call stack to clear AND all microtasks to drain."
      }
    ],
    followUpDeepDive: [
      {
        question: "Why does setTimeout have a minimum 4ms clamping delay in browsers?",
        answer: "Per the HTML Living Standard §8.6, when a timer nesting level exceeds 5 (e.g. 5 nested `setTimeout` calls), browsers enforce a minimum clamping delay of 4 milliseconds to prevent background timers from spinning the CPU at 100% utilization.",
        specReference: "HTML Living Standard §8.6 Timers: 'If nesting level is greater than 5, and timeout is less than 4, set timeout to 4.'"
      }
    ]
  },

  "event-loop-medium": {
    interviewCrossQuestions: [
      {
        question: "Why is microtask batching superior to macrotask (setTimeout) batching for UI frameworks?",
        answer: "Microtasks execute before the browser paints the next screen frame. If you batch DOM updates using `queueMicrotask`, the browser reconciles all updates in a single paint cycle without visual flashing (FOUC). If you used `setTimeout(0)`, the browser might paint intermediate states across multiple frames, causing noticeable UI flickering and layout thrashing.",
        difficulty: "intermediate",
        whyAsked: "Tests understanding of how event loop queues integrate with browser rendering engines."
      },
      {
        question: "How does a microtask batcher ensure thread safety in a single-threaded language?",
        answer: "Because JavaScript is single-threaded and non-preemptive (run-to-completion), synchronous calls to `.add()` populate an in-memory queue without interleaving. The boolean flag `isScheduled` is checked and set synchronously, guaranteeing that exactly one microtask flush is enqueued for that turn.",
        difficulty: "basic",
        whyAsked: "Validates grasp of single-threaded run-to-completion invariants."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Vue.js nextTick & Reactive Watcher Queue",
        description: "Vue batches component re-renders triggered by reactive property mutations into a microtask queue, flushing all watchers once per event loop turn.",
        companies: "Vue.js Core, Nuxt",
        codeSnippet: "function queueWatcher(watcher) { queue.push(watcher); if (!waiting) { waiting = true; nextTick(flushQueue); } }"
      },
      {
        scenario: "Database Transaction Batching (DataLoader)",
        description: "GraphQL DataLoader collects individual item IDs requested during the synchronous resolver tree execution and fires a single `SELECT * WHERE id IN (...)` SQL query on the microtask tick.",
        companies: "Meta, Apollo GraphQL",
        codeSnippet: "loader.load(1); loader.load(2); // coalesced into single SQL batch"
      }
    ],
    howToExplain: {
      opening: "A microtask batcher aggregates multiple synchronous operations occurring within the same tick into a single coordinated execution, eliminating redundant recalculations.",
      keyPoints: [
        "A synchronous boolean flag guarantees only one flush job is scheduled per tick.",
        "Items accumulate in an array during synchronous code execution.",
        "The microtask runs immediately after the synchronous turn before rendering occurs.",
        "This pattern is the foundation of modern state batching in React, Vue, and GraphQL."
      ],
      closingImpression: "Coalescing synchronous operations into microtasks is the primary design pattern for achieving high performance in UI frameworks and data loaders.",
      analogies: ["Like an office mail room: instead of running to the post office for every single letter dropped in the outgoing tray, you collect letters all morning and make a single trip at noon."]
    },
    commonMistakes: [
      {
        mistake: "Forgetting to reset the scheduled flag inside the flush handler.",
        why: "If the flag is not reset, future calls to add() in subsequent turns will never schedule a flush, dropping future batches.",
        correct: "Always reset `isScheduled = false` at the very beginning of the flush function."
      }
    ],
    followUpDeepDive: [
      {
        question: "How did React 18 change batching semantics compared to React 17?",
        answer: "In React 17, batching was limited to React event handlers. Updates inside `setTimeout`, `fetch`, or native events were not batched and triggered multiple renders. In React 18, 'Automatic Batching' uses internal microtask and lane scheduling to batch ALL updates, regardless of where they originate.",
        specReference: "React 18 Architecture: Automatic Batching RFC"
      }
    ]
  },

  "event-loop-hard": {
    interviewCrossQuestions: [
      {
        question: "How does scheduler.yield() in modern browsers improve upon setTimeout(0) for task interleaving?",
        answer: "`scheduler.yield()` (W3C Prioritized Task Scheduling API) yields control back to the browser to process high-priority input (clicks, keypresses) and rendering, but immediately resumes the yielded task ahead of lower-priority macrotasks. Unlike `setTimeout(0)`, it avoids the 4ms clamping penalty and preserves task priority inheritance.",
        difficulty: "advanced",
        whyAsked: "Tests cutting-edge web performance knowledge and familiarity with modern W3C standards."
      },
      {
        question: "Why does long-running JavaScript cause dropped frames (jank)?",
        answer: "At 60Hz, the browser must render a new frame every 16.6ms (at 120Hz, every 8.3ms). Because JavaScript execution runs on the exact same main thread as style recalculation, layout, and painting, any JavaScript task that runs longer than ~5ms risks blocking the render step, resulting in a dropped frame and visible animation stutter.",
        difficulty: "intermediate",
        whyAsked: "Connects JavaScript execution times directly to web performance metrics (INP / FID)."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "React Concurrent Mode & Time Slicing",
        description: "React's Scheduler chunks large component trees into 5ms slices using `MessageChannel.port1.postMessage`, yielding to the browser between chunks to keep the page responsive.",
        companies: "Meta, Vercel, Shopify",
        codeSnippet: "if (shouldYieldToHost()) { scheduleCallback(continueWork); break; }"
      },
      {
        scenario: "Syntax Highlighting on Large Documents",
        description: "Monaco Editor and Prism.js chunk tokenization of 100,000-line files across multiple animation frames to prevent editor UI freezing.",
        companies: "VS Code, GitHub",
        codeSnippet: "while (lines.length && performance.now() - start < 10) tokenize(lines.shift());"
      }
    ],
    howToExplain: {
      opening: "A Fair Task Scheduler breaks long synchronous computations into small time slices, voluntarily yielding the thread back to the event loop to allow user inputs and rendering to interleave.",
      keyPoints: [
        "Monopolizing the main thread causes microtask starvation and input latency.",
        "Chunking tasks with a ~5ms frame budget preserves 60fps responsiveness.",
        "Yielding can be accomplished via MessageChannel, scheduler.yield(), or setTimeout(0).",
        "React Fiber and browser editors rely on this pattern to perform massive computations without freezing the tab."
      ],
      closingImpression: "Writing code that plays nicely with the browser's render pipeline is what separates senior frontend engineers from average developers.",
      analogies: ["Like letting a person with one item cut ahead of you at the grocery register when you have three full shopping carts."]
    },
    commonMistakes: [
      {
        mistake: "Using requestAnimationFrame to yield long tasks.",
        why: "rAF is synchronized with the display refresh rate (16ms) and runs BEFORE paint. Calling rAF in a processing loop throttles throughput to 60 items per second.",
        correct: "Use MessageChannel or scheduler.yield() which yield to the macrotask queue without waiting for display v-sync."
      }
    ],
    followUpDeepDive: [
      {
        question: "Why did React choose MessageChannel over setTimeout(0) for its scheduler polyfill?",
        answer: "`setTimeout(0)` has a 4ms clamp after 5 nested calls and prioritizes timer wheel bookkeeping. `MessageChannel.port1.postMessage` schedules an immediate macrotask without the 4ms clamp, providing near-instant thread resumption while still yielding to inputs and rendering.",
        specReference: "React source: packages/scheduler/src/forks/Scheduler.js"
      }
    ]
  },

  "promise-basic": {
    interviewCrossQuestions: [
      {
        question: "Why does Promise.race not cancel the slower promise after timeout occurs?",
        answer: "JavaScript promises are eager and non-cancellable once instantiated. `Promise.race` simply settles its returned promise with the first settlement; the losing promise continues running in the background until completion. In production, you must use an `AbortController` signal to actively abort underlying network requests or timers.",
        difficulty: "intermediate",
        whyAsked: "Crucial question separating candidates who understand Promise immutability from those who assume race halts execution."
      },
      {
        question: "What happens if you forget to clearTimeout in a Promise timeout wrapper?",
        answer: "If the primary promise resolves quickly, the un-cleared `setTimeout` timer continues running in the background. In Node.js, active timers keep the event loop alive, preventing server processes or serverless functions from exiting. In browsers, it wastes memory and timer wheel slots.",
        difficulty: "intermediate",
        whyAsked: "Tests resource leak awareness in backend and serverless environments."
      },
      {
        question: "What are the three internal states of a Promise according to ECMA-262?",
        answer: "1) `pending`: initial state, neither fulfilled nor rejected. 2) `fulfilled`: operation completed successfully with a value. 3) `rejected`: operation failed with a reason. State transitions are strictly one-way and irreversible: once settled, a promise can never transition again.",
        difficulty: "basic",
        whyAsked: "Validates core Promise specification definitions."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Resilient Microservice HTTP Requests",
        description: "API gateways wrap downstream RPC and REST calls with a strict timeout wrapper (e.g. 2000ms) to prevent cascading failures when third-party services hang.",
        companies: "Netflix, Uber, Amazon",
        codeSnippet: "const res = await withTimeout(fetch(url), 2000, 'Gateway Timeout');"
      },
      {
        scenario: "Database Query Circuit Breakers",
        description: "Database clients timeout slow queries to prevent connection pools from becoming exhausted by hanging locks.",
        companies: "Prisma, MongoDB Driver",
        codeSnippet: "const user = await withTimeout(db.query(), 5000);"
      }
    ],
    howToExplain: {
      opening: "A safe Promise timeout wrapper races an asynchronous operation against an explicit timer, rejecting if the operation fails to settle within the allotted duration while ensuring timer cleanup.",
      keyPoints: [
        "Promise.race settles with whichever promise completes first.",
        "Timers must be cleared via clearTimeout upon resolution or rejection to prevent resource leaks.",
        "Promises are immutable once settled; subsequent resolutions from the losing promise are ignored.",
        "For true network cancellation, pair Promise timeout with AbortController."
      ],
      closingImpression: "Defensive timeout wrapping is essential for building fault-tolerant distributed systems that never hang indefinitely.",
      analogies: ["A countdown timer on a quiz show: if you answer before the buzzer, you get the points; if the buzzer sounds first, your turn is over."]
    },
    commonMistakes: [
      {
        mistake: "Assuming Promise.race stops the slower async operation.",
        why: "Promise.race only ignores the result; the background operation continues executing.",
        correct: "Clarify that promises cannot be canceled externally without AbortController signals."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does Promise.resolve(x) handle an argument that is already a Promise vs a thenable?",
        answer: "Per ECMA-262 §27.2.4.5, if `x` is already an authentic Promise, `Promise.resolve(x)` returns `x` directly without creating a new object. However, if `x` is a 'thenable' (an object with a `.then` method), it wraps it in a new promise and calls `.then` asynchronously inside a microtask.",
        specReference: "ECMA-262 §27.2.4.5 Promise.resolve"
      }
    ]
  },

  "promise-medium": {
    interviewCrossQuestions: [
      {
        question: "How does Promise.allSettled differ from Promise.all in failure scenarios?",
        answer: "`Promise.all` fast-fails: if any single promise rejects, the returned promise immediately rejects with that error, ignoring all other pending or resolved promises. In contrast, `Promise.allSettled` NEVER rejects; it waits for every single promise to settle and returns an array of descriptors: `{ status: 'fulfilled', value }` or `{ status: 'rejected', reason }`.",
        difficulty: "basic",
        whyAsked: "Foundational Promise combinator question."
      },
      {
        question: "How do you ensure results in a custom allSettled maintain input order?",
        answer: "By pre-allocating an array of the exact input length (`const results = new Array(promises.length)`) and populating each index `i` when that specific promise resolves (`results[i] = descriptor`). A separate counter tracks `settledCount++`. When `settledCount === promises.length`, the outer promise resolves with `results`.",
        difficulty: "intermediate",
        whyAsked: "Tests understanding of async ordering and array index stability."
      },
      {
        question: "What is the difference between Promise.any and Promise.race?",
        answer: "`Promise.race` settles with the FIRST promise to settle (whether fulfilled OR rejected). `Promise.any` ignores rejections and settles with the FIRST FULFILLED promise. It only rejects if ALL input promises reject, throwing an `AggregateError`.",
        difficulty: "intermediate",
        whyAsked: "Checks knowledge of all 4 ES2020/ES2021 Promise combinators (all, race, allSettled, any)."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Bulk Notification Dispatch (Email / SMS)",
        description: "Sending 10,000 notifications in parallel: failure to deliver to 5 users should not abort or obscure successful delivery to the other 9,995 users.",
        companies: "Twilio, SendGrid",
        codeSnippet: "const results = await Promise.allSettled(notifications.map(send));"
      },
      {
        scenario: "Multi-Source Analytics Dashboards",
        description: "A dashboard fetching metrics from 5 independent microservices renders partial widgets for services that succeeded while displaying retry buttons for failed widgets.",
        companies: "Datadog, Grafana",
        codeSnippet: "const [cpu, mem, disk] = await Promise.allSettled([getCpu(), getMem(), getDisk()]);"
      }
    ],
    howToExplain: {
      opening: "Promise.allSettled is a concurrency combinator that guarantees complete outcome tracking by awaiting all promises without short-circuiting on failure.",
      keyPoints: [
        "Never rejects; always fulfills with an array of outcome descriptors.",
        "Each outcome conforms strictly to { status: 'fulfilled', value } or { status: 'rejected', reason }.",
        "Preserves exact input order even when promises settle out of order.",
        "Essential for batch operations where partial success is acceptable."
      ],
      closingImpression: "Using allSettled instead of all prevents one failing non-critical request from crashing an entire page.",
      analogies: ["A teacher grading exams: they don't stop grading the whole class just because one student failed; they grade everyone and hand back the full report card."]
    },
    commonMistakes: [
      {
        mistake: "Pushing results into an array using array.push() on completion.",
        why: "Pushing as promises resolve scrambles the order: a fast 10ms promise will appear before a slow 100ms promise regardless of their original array order.",
        correct: "Store results by index: `results[i] = descriptor`."
      }
    ],
    followUpDeepDive: [
      {
        question: "What is an AggregateError and which Promise combinator throws it?",
        answer: "Introduced in ES2021 alongside `Promise.any`, `AggregateError` is a native error subclass that wraps multiple individual errors into an `.errors` array property when all promises passed to `Promise.any` reject.",
        specReference: "ECMA-262 §20.5.7 AggregateError Objects & §27.2.4.3 Promise.any"
      }
    ]
  },

  "promise-hard": {
    interviewCrossQuestions: [
      {
        question: "Why is running Promise.all on a large array (e.g. 5,000 requests) dangerous?",
        answer: "Firing 5,000 requests concurrently exhausts operating system file descriptors / socket handles (`EMFILE` error), overwhelms DNS resolution, saturates network bandwidth, and triggers HTTP 429 (Too Many Requests) or server crashes. A concurrency pool bounds active parallel work to a safe limit (e.g. 5 concurrent workers).",
        difficulty: "intermediate",
        whyAsked: "Tests understanding of system-level resource constraints (sockets, memory, rate limits)."
      },
      {
        question: "How does a Worker Pool architecture maintain constant concurrency without idle gaps?",
        answer: "Instead of chunking work into distinct batches of 5 (where worker 1 might finish in 10ms and sit idle waiting for worker 5 to finish in 1000ms), a true pool uses a shared task iterator cursor. The moment ANY worker finishes its current task, it immediately pulls the next available task from the queue, maintaining 100% worker saturation.",
        difficulty: "advanced",
        whyAsked: "Distinguishes naive chunking (`Promise.all(batch)`) from true dynamic worker queues (`p-limit`)."
      },
      {
        question: "How should errors be handled in a concurrency pool?",
        answer: "Two options depending on requirement: 1) Fast-fail: any error immediately rejects the outer promise and stops pulling new tasks from the queue. 2) Resilient: errors are caught, recorded as rejected outcomes, and remaining queued tasks continue executing.",
        difficulty: "intermediate",
        whyAsked: "Tests architectural flexibility in fault tolerance."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Web Scraper & Crawler Concurrency Limiting",
        description: "Crawlers traverse sitemaps with strict limits (e.g. 4 concurrent requests per domain) to respect robots.txt and avoid IP banning.",
        companies: "Googlebot, Crawlee",
        codeSnippet: "const limit = pLimit(4); urls.map(url => limit(() => fetch(url)));"
      },
      {
        scenario: "Bulk Image Processing & Cloud Storage Uploads",
        description: "Processing 500 images via Sharp and uploading to S3: bounding concurrency to CPU core count prevents out-of-memory (OOM) crashes.",
        companies: "Cloudinary, Unsplash",
        codeSnippet: "const pool = new ConcurrencyPool(os.cpus().length);"
      }
    ],
    howToExplain: {
      opening: "A concurrency pool throttles asynchronous task execution to a fixed maximum window, maintaining constant throughput while protecting system memory and network sockets.",
      keyPoints: [
        "Unbounded concurrency triggers OS socket exhaustion and HTTP 429 rate limits.",
        "Dynamic worker queues eliminate idle gaps by having workers pull the next item immediately upon completion.",
        "Output array preserves original input index mapping regardless of task completion timing.",
        "This is the production architecture implemented by libraries like p-limit and async.queue."
      ],
      closingImpression: "Concurrency limiting is the first line of defense against self-inflicted Denial of Service (DoS) in Node.js microservices.",
      analogies: ["A bank with 3 teller windows: customers wait in a single line, and the moment any teller is free, the next customer steps up."]
    },
    commonMistakes: [
      {
        mistake: "Chunking using `for (let i=0; i<arr.length; i+=limit)` with `Promise.all`.",
        why: "Chunking forces the entire batch to wait for the slowest task in that chunk before starting the next batch, wasting CPU time.",
        correct: "Use a shared index cursor where individual workers pull the next task immediately upon completion."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does Node.js libuv threadpool size affect asynchronous concurrency?",
        answer: "In Node.js, network I/O is handled non-blockingly by OS epoll/kqueue. However, file system operations (`fs`), DNS lookups, and crypto hashing are executed on libuv's internal C++ worker threadpool, which defaults to ONLY 4 threads (`UV_THREADPOOL_SIZE=4`). Launching 100 concurrent `fs.readFile` calls will queue up on those 4 threads.",
        specReference: "Node.js Documentation: libuv Threadpool Architecture"
      }
    ]
  },

  "generators-basic": {
    interviewCrossQuestions: [
      {
        question: "What is the difference between a Generator Function and a Generator Object?",
        answer: "A Generator Function (`function*`) is the constructor definition. When invoked, it does NOT execute its body; instead, it returns a Generator Object. The Generator Object conforms to both the Iterable protocol (`[Symbol.iterator]()`) and the Iterator protocol (`.next()`, `.return()`, `.throw()`). Execution only begins when `.next()` is called.",
        difficulty: "basic",
        whyAsked: "Tests understanding of generator instantiation vs execution."
      },
      {
        question: "How does the 'yield*' operator differ from standard 'yield'?",
        answer: "`yield` emits a single value and pauses. `yield*` delegates iteration to another iterable or generator: it iterates through the target iterable, yielding each of its values sequentially, and evaluates to the return value of the delegated generator.",
        difficulty: "intermediate",
        whyAsked: "Tests knowledge of generator composition and recursion."
      },
      {
        question: "Can an infinite generator cause a memory leak?",
        answer: "No! Unlike an infinite array (which would exhaust memory), an infinite generator evaluates lazily on demand. It stores only its current execution context on the heap and consumes O(1) memory, advancing only when `.next()` is explicitly called by a consumer.",
        difficulty: "basic",
        whyAsked: "Checks understanding of lazy evaluation vs eager memory allocation."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "ID & UUID Generation",
        description: "Generating incremental or algorithmic sequence numbers lazily without holding pre-allocated IDs in memory.",
        companies: "MongoDB ObjectID, Snowflake ID generator",
        codeSnippet: "function* idGen() { let id = 1; while (true) yield id++; }"
      },
      {
        scenario: "Pagination Traversal",
        description: "Abstracting paginated API endpoints so consumers can loop using `for...of` without knowing about page boundaries.",
        companies: "AWS SDK, Stripe SDK",
        codeSnippet: "for (const item of listUsers()) { process(item); }"
      }
    ],
    howToExplain: {
      opening: "Generators are functions that can be paused and resumed on demand, implementing the Iterable and Iterator protocols to enable memory-efficient lazy evaluation.",
      keyPoints: [
        "Invoking a generator function returns an exotic GeneratorObject without executing code.",
        "yield pauses execution and returns { value, done: false }.",
        "Calling .next() resumes execution from the exact point of suspension.",
        "Generators allow representing infinite data streams in O(1) memory."
      ],
      closingImpression: "Generators bring coroutine semantics to JavaScript, laying the architectural foundation for async/await and streaming iterators.",
      analogies: ["A DVD player: you press 'Play' (next), watch until a chapter marker, press 'Pause' (yield), and come back later to resume from the exact same frame."]
    },
    commonMistakes: [
      {
        mistake: "Using for...of on a generator without a termination condition, expecting it to stop.",
        why: "A for...of loop on an infinite generator will loop forever and freeze the thread.",
        correct: "Always break out of infinite generator loops using a break statement or limit condition."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does V8 implement generator suspension and resumption in bytecode?",
        answer: "V8's Ignition interpreter uses dedicated bytecodes: `SuspendGenerator` snapshots local registers into the heap-allocated GeneratorObject. When `.next()` is called, `ResumeGenerator` restores registers onto the Call Stack and jumps directly to the saved bytecode offset.",
        specReference: "V8 Ignition Bytecode: SuspendGenerator & ResumeGenerator"
      }
    ]
  },

  "generators-medium": {
    interviewCrossQuestions: [
      {
        question: "What is Backpressure and how do Async Generators handle it natively?",
        answer: "Backpressure occurs when a data producer produces data faster than a downstream consumer can process it. Async generators (`async function*`) solve this natively through 'pull-based' iteration: the upstream generator pauses at `yield` and NEVER produces the next chunk until the consumer calls `await iterator.next()`, preventing memory buffer bloat.",
        difficulty: "advanced",
        whyAsked: "High-level systems question on stream flow control."
      },
      {
        question: "What does [Symbol.asyncIterator] return compared to [Symbol.iterator]?",
        answer: "`[Symbol.iterator]` returns an iterator whose `.next()` returns `{ value, done }`. `[Symbol.asyncIterator]` returns an async iterator whose `.next()` returns a `Promise<{ value, done }>`, consumed via `for await (const x of stream)`.",
        difficulty: "basic",
        whyAsked: "Verifies standard async iterator protocol knowledge."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Streaming Large CSV / JSON Lines Files",
        description: "Node.js pipelines parse 10GB log files line-by-line using async generators without loading the file into memory.",
        companies: "Snowflake, ElasticSearch",
        codeSnippet: "for await (const line of readLines(file)) { process(line); }"
      },
      {
        scenario: "AI LLM Token Streaming (OpenAI / Gemini)",
        description: "Modern chat applications use async generators to yield LLM response tokens to the UI as they arrive over HTTP SSE streams.",
        companies: "OpenAI, Google DeepMind, Vercel AI SDK",
        codeSnippet: "for await (const chunk of streamText()) { appendToUI(chunk); }"
      }
    ],
    howToExplain: {
      opening: "Async Pipeline Generators combine async/await with generators to create pull-based streaming pipelines with built-in backpressure.",
      keyPoints: [
        "Async iterables implement [Symbol.asyncIterator] and return promises for each iteration step.",
        "Naturally throttles producers to match consumer processing speed (backpressure).",
        "Consumed seamlessly with for await...of loops.",
        "Ideal for streaming large datasets, file I/O, and LLM token responses."
      ],
      closingImpression: "Pull-based async iteration eliminates out-of-memory crashes when processing data streams that exceed physical RAM.",
      analogies: ["Drinking through a straw: you pull a sip when you're ready to swallow; the cup doesn't dump all the liquid down your throat at once."]
    },
    commonMistakes: [
      {
        mistake: "Using standard Array.prototype.forEach with async callbacks.",
        why: "forEach does not await async callbacks; it fires all iterations concurrently and ignores returned promises.",
        correct: "Use for await...of or sequential while loops with async generators."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does the WHATWG ReadableStream integrate with Async Iterators?",
        answer: "Modern browsers and Node 18+ implement `ReadableStream.prototype[Symbol.asyncIterator]`, allowing any fetch response body stream (`response.body`) to be directly consumed via `for await (const chunk of response.body)`.",
        specReference: "WHATWG Streams Standard §3.3.4 Async iteration"
      }
    ]
  },

  "generators-hard": {
    interviewCrossQuestions: [
      {
        question: "How does async/await relate to generators and promises under the hood?",
        answer: "`async/await` is syntactic sugar over generator coroutines driven by a promise runner (like TJ Holowaychuk's `co` library). When Babel transpiles `async function`, it transforms it into `function*` wrapped by `_asyncToGenerator()`. Every `await` becomes a `yield`, and the runner attaches `.then()` to resume the generator via `gen.next(value)` or throw errors via `gen.throw(error)`.",
        difficulty: "advanced",
        whyAsked: "The classic compiler-internals question testing deep comprehension of async/await."
      },
      {
        question: "How does passing a value to gen.next(val) work?",
        answer: "When `.next(val)` is called with an argument, that argument becomes the evaluation result of the `yield` expression where the generator was currently paused: `const x = yield 10;` -> `x` receives `val`.",
        difficulty: "intermediate",
        whyAsked: "Tests understanding of bidirectional generator communication."
      },
      {
        question: "What does gen.throw(err) do inside a suspended generator?",
        answer: "`gen.throw(err)` raises an exception at the exact `yield` expression where the generator is currently suspended. If the generator has wrapped that `yield` in a `try...catch` block, the catch handler catches `err`! If not caught, the error bubbles out of `.throw()`.",
        difficulty: "advanced",
        whyAsked: "Tests understanding of exception injection into suspended coroutines."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Babel & SWC Async Transpilation",
        description: "Compiling modern async/await code for legacy ES5/ES6 environments uses generator coroutine runners.",
        companies: "Babel, SWC, TypeScript",
        codeSnippet: "const _asyncToGenerator = fn => function() { return co(fn.apply(this, arguments)); };"
      },
      {
        scenario: "Redux-Saga Middleware",
        description: "Sagas use generator coroutine runners to intercept yielded effect objects (`call`, `put`, `select`), executing them and feeding results back via `gen.next()`.",
        companies: "Netflix, Target",
        codeSnippet: "function* fetchUser() { try { const user = yield call(api); yield put(success(user)); } catch (e) { yield put(fail(e)); } }"
      }
    ],
    howToExplain: {
      opening: "Before async/await was standardized, generator coroutine runners paired generators with promises to achieve synchronous-looking asynchronous code.",
      keyPoints: [
        "async/await is equivalent to a generator whose yielded promises drive a recursive step runner.",
        "gen.next(val) injects resolved promise values into the LHS of yield expressions.",
        "gen.throw(err) injects promise rejections into generator try/catch blocks.",
        "This bidirectional communication protocol enables complete cooperative multitasking."
      ],
      closingImpression: "Understanding generator coroutine runners demystifies async/await, proving that JavaScript's concurrency model is built on simple composable primitives.",
      analogies: ["A worker and a manager: the worker pauses and hands an order slip to the manager (yield); the manager gets the supplies from the warehouse and hands them back to the worker (next), who resumes work."]
    },
    commonMistakes: [
      {
        mistake: "Assuming the first call to gen.next(val) can pass a value to the generator.",
        why: "The first call to .next() starts the generator and runs up to the first yield. There is no yield expression awaiting an input value yet, so arguments to the initial .next() are completely ignored.",
        correct: "Clarify that arguments to .next() only take effect starting on the SECOND invocation."
      }
    ],
    followUpDeepDive: [
      {
        question: "What is the ECMAScript formal specification relation between AsyncFunction and Generators?",
        answer: "ECMA-262 §27.7 formally defines AsyncFunction evaluation using the 'AsyncFunctionStart' abstract operation, which uses the exact same internal Execution Context suspension and resumption steps as GeneratorStart.",
        specReference: "ECMA-262 §27.7.5.1 AsyncFunctionStart"
      }
    ]
  },

  "proto-basic": {
    interviewCrossQuestions: [
      {
        question: "What is the difference between __proto__ and prototype?",
        answer: "`prototype` is a property found exclusively on constructor functions (and classes); it defines the object that will become the `[[Prototype]]` of all instances created with `new`. `__proto__` is an accessor property (getter/setter on `Object.prototype`) exposing an instance's internal `[[Prototype]]` link. Modern code should always use `Object.getPrototypeOf(obj)` and `Object.setPrototypeOf(obj)` instead of `__proto__`.",
        difficulty: "basic",
        whyAsked: "The universal test for prototypal inheritance clarity."
      },
      {
        question: "What is at the very end of the JavaScript prototype chain?",
        answer: "At the end of every standard prototype chain is `Object.prototype`. The `[[Prototype]]` of `Object.prototype` is strictly `null`. Attempting to look up a property on `null` terminates the prototype walk and returns `undefined`.",
        difficulty: "basic",
        whyAsked: "Verifies knowledge of the terminal prototype boundary."
      },
      {
        question: "Why is Object.create(null) useful?",
        answer: "`Object.create(null)` creates a dictionary object with NO prototype (`[[Prototype]] === null`). It has zero inherited properties: no `toString`, no `hasOwnProperty`, no `constructor`. It is safe from prototype pollution attacks and makes a pure key-value hash map.",
        difficulty: "intermediate",
        whyAsked: "Tests security awareness and dictionary object design."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Prototype Pollution Defense",
        description: "Config parsers create `Object.create(null)` containers to ensure malicious payloads containing `__proto__` cannot inject properties into global prototypes.",
        companies: "Fastify, Lodash, Snyk",
        codeSnippet: "const safeDict = Object.create(null);"
      },
      {
        scenario: "Inheritance Traversal in ORMs",
        description: "ORMs walk prototype chains to inspect entity class decorators and metadata across base models.",
        companies: "TypeORM, Prisma",
        codeSnippet: "let curr = entity.constructor; while (curr && curr !== Object) { inspect(curr); curr = Object.getPrototypeOf(curr); }"
      }
    ],
    howToExplain: {
      opening: "JavaScript uses prototypal inheritance where objects have an internal [[Prototype]] link to another object. Property lookups walk this chain upwards until found or until reaching null.",
      keyPoints: [
        "Every object links to a prototype object via its internal [[Prototype]] slot.",
        "Standard objects inherit from Object.prototype, whose prototype is null.",
        "constructor.prototype defines what instances will link to.",
        "Object.getPrototypeOf is the standard accessor; Object.create(null) creates pure dictionary maps."
      ],
      closingImpression: "Unlike classical class-based languages with rigid vtables, JavaScript inheritance is a dynamic linked-list traversal.",
      analogies: ["Like asking for help: if you don't know the answer, you ask your manager; if they don't know, they ask their director, until you reach the CEO (Object.prototype), after which there is no one left (null)."]
    },
    commonMistakes: [
      {
        mistake: "Using __proto__ in production code.",
        why: "__proto__ is a legacy Annex B feature with performance deoptimizations in modern JIT engines.",
        correct: "Use Object.getPrototypeOf(obj) and Object.setPrototypeOf(obj)."
      }
    ],
    followUpDeepDive: [
      {
        question: "What performance penalty does Object.setPrototypeOf incur in V8?",
        answer: "In V8, mutating an object's prototype via `Object.setPrototypeOf` alters the object's hidden class (Map/Shape) transition tree, immediately invalidating all inline caches (ICs) across the entire codebase that touch that object shape.",
        specReference: "V8 Dev Blog: Fast Properties in V8"
      }
    ]
  },

  "proto-medium": {
    interviewCrossQuestions: [
      {
        question: "How does the 'instanceof' operator actually work according to the specification?",
        answer: "Per ECMA-262 §13.10.2, `a instanceof B` evaluates `B[Symbol.hasInstance](a)`. The default `Symbol.hasInstance` implementation extracts `B.prototype` and walks the prototype chain of `a`: `let proto = Object.getPrototypeOf(a)`. It loops: if `proto === B.prototype`, return `true`; if `proto === null`, return `false`; else `proto = Object.getPrototypeOf(proto)`.",
        difficulty: "intermediate",
        whyAsked: "Tests understanding of the underlying Symbol.hasInstance algorithm."
      },
      {
        question: "Why does 'instanceof' fail across iframe or worker boundaries?",
        answer: "Each iframe or window context has its own distinct execution realm with its own distinct built-in constructors (`windowA.Array !== windowB.Array`). An array created in iframe B has `Object.getPrototypeOf(arr) === windowB.Array.prototype`. Checking `arr instanceof windowA.Array` returns `false`! This is why `Array.isArray()` was introduced to check identity across realms.",
        difficulty: "advanced",
        whyAsked: "The classic multi-realm / iframe trap question."
      },
      {
        question: "Can an object customize its own instanceof behavior?",
        answer: "Yes! Any class or constructor can define a static `[Symbol.hasInstance](instance)` method to override the default prototype walking behavior and implement custom type checking logic.",
        difficulty: "intermediate",
        whyAsked: "Tests ES6 metaprogramming awareness."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Cross-Realm Safe Type Checking (Array.isArray)",
        description: "Checking whether an object received from an iframe, foreign realm, or worker is an Array using internal slot checks rather than instanceof.",
        companies: "Lodash, React Core",
        codeSnippet: "Array.isArray(foreignArray); // true across all realms"
      },
      {
        scenario: "Custom Structural Type Checking",
        description: "Creating duck-typing classes where `instanceof` checks for specific interface methods rather than prototype links.",
        companies: "TypeScript runtime validators, Zod",
        codeSnippet: "class IterableType { static [Symbol.hasInstance](x) { return x != null && typeof x[Symbol.iterator] === 'function'; } }"
      }
    ],
    howToExplain: {
      opening: "The instanceof operator is not a class check; it is a prototype chain equality walk that tests whether a constructor's .prototype exists anywhere in an instance's prototype chain.",
      keyPoints: [
        "instanceof executes Symbol.hasInstance on the right-hand constructor.",
        "Walks the prototype chain of the left operand using Object.getPrototypeOf.",
        "Fails across different iframes/realms because each realm has independent constructor identities.",
        "Symbol.hasInstance allows custom runtime type checks."
      ],
      closingImpression: "Knowing that instanceof is just prototype walking explains why it fails across iframes and why Array.isArray is necessary.",
      analogies: ["Checking someone's lineage: you walk up their family tree parent by parent to see if a specific ancestor's name appears."]
    },
    commonMistakes: [
      {
        mistake: "Using instanceof to check primitive strings or numbers.",
        why: "'hello' instanceof String returns false because primitives are not objects and do not have prototype chain wrappers until boxed.",
        correct: "Use typeof for primitives or Object(val) instanceof String."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does Array.isArray verify an array across realms without prototype walking?",
        answer: "Per ECMA-262 §23.1.2.1, `Array.isArray` inspects the internal `[[Class]]` / `[[ArrayData]]` slot of the object. If the object is an exotic Array object, it returns true regardless of which realm or prototype it belongs to.",
        specReference: "ECMA-262 §23.1.2.1 Array.isArray"
      }
    ]
  },

  "proto-hard": {
    interviewCrossQuestions: [
      {
        question: "What is the difference between classical mixins and the Class Factory Mixin pattern?",
        answer: "Legacy classical mixins (`Object.assign(Target.prototype, Mixin)`) copy method references onto an existing prototype, flattening hierarchy and breaking `super` calls. The modern Class Factory Mixin pattern uses higher-order functions returning subclass extensions (`const Mixin = Base => class extends Base { ... }`), creating a clean, parameterized prototype chain where `super` and `instanceof` work seamlessly.",
        difficulty: "advanced",
        whyAsked: "Tests modern ES6 architectural patterns for method composition."
      },
      {
        question: "How does the 'super' keyword resolve methods in ES6 classes?",
        answer: "`super.method()` uses an internal slot `[[HomeObject]]` bound statically to the class prototype when the method is defined. At runtime, `super` looks up the prototype of `[[HomeObject]]` (`Object.getPrototypeOf(HomeObject)`), completely bypassing the dynamic `this` receiver to prevent circular call loops.",
        difficulty: "advanced",
        whyAsked: "One of the most technical questions regarding ES6 class semantics."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Composable Game Engine Components",
        description: "Game engines use mixin factories to compose behaviors onto entity base classes: `class Player extends Movable(Damageable(Entity))`.",
        companies: "Phaser, Unity WebGL, Babylon.js",
        codeSnippet: "const Flying = Base => class extends Base { fly() {} };"
      },
      {
        scenario: "Custom HTML Web Components",
        description: "Mixing accessibility, theming, and reactive state capabilities onto `HTMLElement`.",
        companies: "Lit, Stencil, Shoelace",
        codeSnippet: "class MyButton extends Focusable(Themeable(HTMLElement)) {}"
      }
    ],
    howToExplain: {
      opening: "Class factory mixins provide clean multiple-inheritance semantics in JavaScript by chaining dynamic subclass extensions, preserving prototype hierarchy and super dispatch.",
      keyPoints: [
        "Object.assign mixins mutate prototypes and break super calls.",
        "Class factory mixins (Base => class extends Base) preserve strict linear prototype chains.",
        "super dispatch relies on static [[HomeObject]] binding to avoid recursion bugs.",
        "instanceof works transparently for every mixin in the chain."
      ],
      closingImpression: "Composition over inheritance is best expressed in JavaScript via functional class factory mixins.",
      analogies: ["Like stacking Russian nesting dolls: each mixin wraps the base class in a new layer, creating a clear chain of command."]
    },
    commonMistakes: [
      {
        mistake: "Using Object.assign to mix methods that use super.",
        why: "Copying a method with Object.assign strips its [[HomeObject]], causing super calls inside that method to throw a runtime TypeError.",
        correct: "Use class factory functions to preserve [[HomeObject]] bindings."
      }
    ],
    followUpDeepDive: [
      {
        question: "What is [[HomeObject]] in ECMA-262 and why can it not be reassigned?",
        answer: "Per ECMA-262 §15.7.14, methods defined using concise syntax (`method() {}`) inside class bodies or object literals have an immutable internal slot `[[HomeObject]]` pointing to the enclosing class prototype. It is set at parse time and cannot be reassigned.",
        specReference: "ECMA-262 §15.7.14 Runtime Semantics: MethodDefinitionEvaluation"
      }
    ]
  },

  "coercion-basic": {
    interviewCrossQuestions: [
      {
        question: "What is the difference between explicit conversion and implicit coercion?",
        answer: "Explicit conversion occurs when a developer deliberately calls a constructor function without `new` to convert types (e.g. `Number('42')`, `Boolean(x)`, `String(123)`). Implicit coercion occurs automatically when operators (`+`, `-`, `==`, `if(x)`) force operands into different types according to ECMAScript coercion rules.",
        difficulty: "basic",
        whyAsked: "Baseline terminology check."
      },
      {
        question: "Why does [] + [] evaluate to '' while [] + {} evaluates to '[object Object]'?",
        answer: "The `+` operator triggers `ToPrimitive` on both operands. For arrays, `ToPrimitive` calls `toString()`, which produces an empty string `''`. Therefore `'' + '' === ''`. For `{}`, its `toString()` returns `'[object Object]'`, so `'' + '[object Object]' === '[object Object]'`.",
        difficulty: "intermediate",
        whyAsked: "Classic JS trivia that tests ToPrimitive algorithm knowledge."
      },
      {
        question: "What are the exact falsy values in JavaScript?",
        answer: "There are exactly 8 falsy values in modern ECMAScript: `false`, `0`, `-0`, `0n` (BigInt zero), `''` (empty string), `null`, `undefined`, and `NaN`. All other values (including `[]`, `{}`, `'0'`, and `'false'`) are strictly truthy.",
        difficulty: "basic",
        whyAsked: "Every developer must know the complete falsy list."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Form Input Sanitization & Serialization",
        description: "HTML `<input>` values are always strings. Converting form state to typed payloads requires explicit numeric/boolean conversions.",
        companies: "Formik, React Hook Form",
        codeSnippet: "const age = Number(input.value);"
      },
      {
        scenario: "Boolean Flag Normalization in Environment Variables",
        description: "Reading `process.env.ENABLE_FEATURE`: strings like `'true'`, `'1'` must be normalized explicitly rather than relying on `Boolean(process.env.VAR)` (which evaluates `'false'` to `true`!).",
        companies: "Next.js, Express",
        codeSnippet: "const isEnabled = process.env.FEATURE === 'true' || process.env.FEATURE === '1';"
      }
    ],
    howToExplain: {
      opening: "Type coercion in JavaScript is governed by formal abstract operations defined in ECMA-262: ToBoolean, ToNumber, ToString, and ToPrimitive.",
      keyPoints: [
        "Explicit conversion (Number(), Boolean(), String()) is clear, predictable, and maintainable.",
        "Implicit coercion occurs automatically during binary operations and loose equality.",
        "There are exactly 8 falsy values in JavaScript; all objects and arrays are truthy.",
        "Always prefer explicit conversions to prevent subtle production bugs."
      ],
      closingImpression: "Coercion is not random magic; it follows strict mathematical rules laid out in the ECMAScript specification.",
      analogies: ["Like currency exchange: explicit conversion is going to an exchange booth; implicit coercion is the store automatically converting your foreign cash at the register with hidden fees."]
    },
    commonMistakes: [
      {
        mistake: "Using Boolean('false') expecting it to be false.",
        why: "Any non-empty string in JavaScript is truthy. Boolean('false') evaluates to true!",
        correct: "Compare strings explicitly: `str === 'true'`."
      }
    ],
    followUpDeepDive: [
      {
        question: "Why does document.all evaluate as falsy in browsers despite being an object?",
        answer: "For web compatibility (Annex B.3.7), `document.all` has an exotic internal `[[IsHTMLDDA]]` slot that forces `ToBoolean(document.all)` to evaluate to `false` and `typeof document.all === 'undefined'`, allowing legacy code detecting IE to branch correctly while still allowing property access.",
        specReference: "ECMA-262 Annex B.3.7 The [[IsHTMLDDA]] Internal Slot"
      }
    ]
  },

  "coercion-medium": {
    interviewCrossQuestions: [
      {
        question: "How does the Symbol.toPrimitive protocol work?",
        answer: "When an object needs to be converted to a primitive (e.g. for `+`, `==`, or template literals), JavaScript checks if the object has a `[Symbol.toPrimitive](hint)` method. If present, it calls it with a string `hint`: `'number'`, `'string'`, or `'default'`. If absent, it falls back to calling `.valueOf()` and `.toString()`.",
        difficulty: "intermediate",
        whyAsked: "Tests modern ES6 object-to-primitive customization."
      },
      {
        question: "What is the difference in fallback order between 'number' hint and 'string' hint?",
        answer: "For a `'string'` hint: the engine tries `.toString()` first; if that returns a primitive it uses it, otherwise it tries `.valueOf()`. For a `'number'` or `'default'` hint: the engine tries `.valueOf()` first; if that returns a primitive it uses it, otherwise it tries `.toString()`. If neither returns a primitive, it throws TypeError.",
        difficulty: "advanced",
        whyAsked: "Tests exact specification order of the OrdinaryToPrimitive algorithm."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Custom Currency / Decimal Value Objects",
        description: "Financial libraries define Money objects that format to strings in template literals (`$100.00`) while coercing to raw cents in arithmetic calculations.",
        companies: "Stripe, Square, PayPal",
        codeSnippet: "[Symbol.toPrimitive](hint) { return hint === 'string' ? `$${this.cents/100}` : this.cents; }"
      },
      {
        scenario: "Date Object Coercion",
        description: "Built-in `Date` overrides Symbol.toPrimitive: with hint `'string'` or `'default'`, it returns a date string; with hint `'number'`, it returns epoch milliseconds.",
        companies: "Native ECMAScript Specification",
        codeSnippet: "const d = new Date(); +d; // milliseconds; `${d}` // string"
      }
    ],
    howToExplain: {
      opening: "Symbol.toPrimitive is the standardized ES6 protocol that grants objects full control over how they convert into primitives across number, string, and default contexts.",
      keyPoints: [
        "Overrides legacy valueOf() and toString() fallback mechanics.",
        "Receives a hint parameter: 'number', 'string', or 'default'.",
        "Arithmetic '+' uses 'default' hint; unary '+' uses 'number' hint; template literals use 'string' hint.",
        "Must return a primitive value, or a TypeError is thrown."
      ],
      closingImpression: "Symbol.toPrimitive allows domain value objects (like Money or Units) to behave naturally with native JavaScript operators.",
      analogies: ["A passport with multiple visas: when asked for identity at the bank you show your photo (string); at the sports club you show your membership number (number)."]
    },
    commonMistakes: [
      {
        mistake: "Returning an object from Symbol.toPrimitive.",
        why: "The specification mandates that Symbol.toPrimitive MUST return a primitive. Returning an object throws TypeError: Cannot convert object to primitive value.",
        correct: "Always return a string, number, boolean, symbol, or bigint."
      }
    ],
    followUpDeepDive: [
      {
        question: "Which native JavaScript built-in objects implement Symbol.toPrimitive?",
        answer: "Only two built-in standard objects implement `Symbol.toPrimitive` by default: `Date.prototype[Symbol.toPrimitive]` and `Symbol.prototype[Symbol.toPrimitive]`.",
        specReference: "ECMA-262 §21.4.3.4 Date.prototype[Symbol.toPrimitive]"
      }
    ]
  },

  "coercion-hard": {
    interviewCrossQuestions: [
      {
        question: "Walk through the exact 12-step algorithm for Abstract Equality Comparison (==).",
        answer: "ECMA-262 §7.2.14 specifies: 1) Same type -> Strict Equality (===). 2) null == undefined -> true. 3) Number == String -> ToNumber(String). 4) Boolean == any -> ToNumber(Boolean) == any. 5) BigInt == String -> StringToBigInt. 6) Object == String/Number/BigInt -> ToPrimitive(Object) == primitive. 7) Any other combination -> false.",
        difficulty: "advanced",
        whyAsked: "The definitive test of JavaScript specification mastery."
      },
      {
        question: "Why does [] == ![] evaluate to true?",
        answer: "Step 1: `![]` evaluates unary NOT first; since arrays are truthy, `![]` becomes `false`. Expression is now `[] == false`. Step 2: Boolean on right triggers Rule 4: `ToNumber(false) === 0`. Expression is now `[] == 0`. Step 3: Object on left triggers Rule 6: `ToPrimitive([])` calls `[].toString()` which is `''`. Expression is now `'' == 0`. Step 4: String on left triggers Rule 3: `ToNumber('') === 0`. Expression is now `0 == 0`, which is `true`!",
        difficulty: "advanced",
        whyAsked: "The most famous JavaScript interview puzzle; testing whether candidate guesses or walks the formal spec."
      },
      {
        question: "Why is === preferred in 100% of modern enterprise codebases?",
        answer: "`===` (Strict Equality) performs NO coercion: if types differ, it immediately returns `false`. This eliminates the O(N) multi-step coercion cascades, improves JIT compiler inline caching, and prevents catastrophic bugs.",
        difficulty: "basic",
        whyAsked: "Ensures practical engineering judgment accompanies theoretical spec knowledge."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "TypeScript & ESLint Rule (eqeqeq)",
        description: "Linters enforce strict equality across codebases to eliminate coercion vulnerabilities during code reviews.",
        companies: "Every major tech company",
        codeSnippet: "// eslint: 'eqeqeq': ['error', 'always']"
      },
      {
        scenario: "Checking Nullish Values (x == null)",
        description: "The one accepted idiomatic exception in some codebases: `x == null` checks if `x` is either `null` OR `undefined` in a single check.",
        companies: "React Core, Node.js Core",
        codeSnippet: "if (val == null) return; // handles both null and undefined"
      }
    ],
    howToExplain: {
      opening: "The Abstract Equality Comparison algorithm (==) performs recursive type conversions until types match, following strict priority rules defined in ECMA-262 §7.2.14.",
      keyPoints: [
        "Booleans are always coerced to numbers first (true -> 1, false -> 0).",
        "Objects are coerced to primitives using ToPrimitive (valueOf then toString).",
        "null and undefined equal each other and nothing else under ==.",
        "Always use === to avoid the multi-step coercion pipeline and ensure type safety."
      ],
      closingImpression: "Understanding the exact steps of the equality algorithm turns apparent JavaScript quirks into predictable mechanical evaluations.",
      analogies: ["A multi-stage translation pipeline: English and French speakers translating through Latin until both speak the same dialect."]
    },
    commonMistakes: [
      {
        mistake: "Assuming [] == true evaluates to true because [] is truthy.",
        why: "In `[] == true`, `true` is coerced to `1`, and `[]` is coerced to `0`. `0 == 1` evaluates to `false`!",
        correct: "Remember that the == algorithm coerces booleans to numbers first, it does NOT evaluate truthiness."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does SameValueZero differ from Strict Equality (===)?",
        answer: "Strict equality (`===`) treats `NaN === NaN` as `false`, and `+0 === -0` as `true`. `SameValueZero` (used by `Map`, `Set`, and `Array.prototype.includes`) treats `NaN` as equal to `NaN`, allowing Maps to look up `NaN` keys accurately.",
        specReference: "ECMA-262 §7.2.11 SameValueZero"
      }
    ]
  },

  "clone-basic": {
    interviewCrossQuestions: [
      {
        question: "Why does Object.assign or spread {...obj} fail to preserve property descriptors?",
        answer: "`Object.assign` and spread use standard `[[Get]]` and `[[Set]]` operations. They read only enumerable own properties and assign them as simple values, completely stripping custom getters, setters, `writable: false`, `enumerable: false`, and `configurable: false` flags. True property preservation requires `Object.getOwnPropertyDescriptors(obj)` paired with `Object.defineProperties()`.",
        difficulty: "intermediate",
        whyAsked: "Tests understanding of Property Descriptors vs simple property assignment."
      },
      {
        question: "How do you clone Symbol-keyed properties?",
        answer: "Standard `Object.keys()` only returns string keys. `Object.getOwnPropertyDescriptors()` and `Reflect.ownKeys()` capture both string keys AND symbol keys, ensuring complete own property preservation.",
        difficulty: "intermediate",
        whyAsked: "Checks awareness of ES6 Symbol property enumeration."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Cloning Objects with Getters and Setters",
        description: "Cloning reactive objects (e.g. Vue reactive proxies or MobX observables) without prematurely executing or flattening getter properties.",
        companies: "Vue.js, MobX",
        codeSnippet: "const clone = Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj));"
      },
      {
        scenario: "Immutable Object Freezing",
        description: "Cloning and sealing security configurations where non-writable, non-configurable security flags must remain intact.",
        companies: "Node.js Crypto, AWS SDK",
        codeSnippet: "Object.defineProperties(newObj, Object.getOwnPropertyDescriptors(source));"
      }
    ],
    howToExplain: {
      opening: "A faithful shallow clone copies not just values, but the complete property descriptors (getters, setters, writability, configurability, and symbols) using Object.getOwnPropertyDescriptors.",
      keyPoints: [
        "Spread {...obj} and Object.assign only copy values and strip descriptors.",
        "Object.getOwnPropertyDescriptors captures value, writable, get, set, enumerable, and configurable.",
        "Reflect.ownKeys captures both string and symbol property keys.",
        "Object.defineProperties applies descriptors accurately without triggering getter invocations."
      ],
      closingImpression: "Copying descriptors rather than invoking getters is essential when dealing with reactive state containers and classes.",
      analogies: ["Photocopying a document (Object.assign) vs duplicating the digital template file with all security permissions and formulas intact (defineProperties)."]
    },
    commonMistakes: [
      {
        mistake: "Assuming spread {...obj} clones getters as getters.",
        why: "Spread evaluates the getter immediately and assigns the returned value as a static, plain property.",
        correct: "Use Object.getOwnPropertyDescriptors to copy the getter function itself."
      }
    ],
    followUpDeepDive: [
      {
        question: "What is the difference between a Data Descriptor and an Accessor Descriptor?",
        answer: "A Data Descriptor contains `value` and `writable`. An Accessor Descriptor contains `get` and `set`. A property descriptor can NEVER contain both `value`/`writable` and `get`/`set` simultaneously; doing so throws TypeError.",
        specReference: "ECMA-262 §6.1.7.1 Property Attributes"
      }
    ]
  },

  "clone-medium": {
    interviewCrossQuestions: [
      {
        question: "Why does JSON.parse(JSON.stringify(obj)) fail as a general deep clone solution?",
        answer: "JSON serialization has severe limitations: 1) Dates become strings (losing Date prototype methods). 2) RegExps, Maps, Sets, and TypedArrays become empty objects `{}`. 3) Functions, `undefined`, and Symbols are omitted or converted to `null`. 4) Circular references throw `TypeError: Converting circular structure to JSON`.",
        difficulty: "basic",
        whyAsked: "The universal baseline check for deep cloning knowledge."
      },
      {
        question: "How do you deep clone Date and RegExp instances correctly?",
        answer: "By detecting instance types: for `Date`, return `new Date(obj.getTime())`. For `RegExp`, return `new RegExp(obj.source, obj.flags)`. Re-instantiating them preserves their internal slots and prototype behaviors.",
        difficulty: "intermediate",
        whyAsked: "Tests understanding of built-in exotic objects that cannot be cloned via simple property loops."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Redux State Snapshotting for Time-Travel Debugging",
        description: "Redux DevTools snapshots application state trees to enable stepping backwards and forwards through user actions without state contamination.",
        companies: "Redux, Vuex",
        codeSnippet: "const snapshot = deepClone(currentState);"
      },
      {
        scenario: "Configuration Merging in Build Tools",
        description: "Webpack and Vite deep merge user configuration overrides over default presets without mutating default objects.",
        companies: "Webpack, Vite, Rollup",
        codeSnippet: "const config = deepMerge(defaultConfig, userConfig);"
      }
    ],
    howToExplain: {
      opening: "A robust deep clone recursively traverses object graphs, constructing fresh copies while explicitly handling specialized built-ins like Dates, RegExps, and Arrays.",
      keyPoints: [
        "JSON.stringify fails on Dates, RegExps, undefined, and functions.",
        "Recursive traversal must branch based on object type (Array vs Date vs RegExp vs Plain Object).",
        "Preserves correct prototypes and internal slot values.",
        "Forms the foundation for immutable state management."
      ],
      closingImpression: "Writing an explicit recursive cloner ensures domain objects retain their methods and prototype integrity across deep copies.",
      analogies: ["Rebuilding a Lego castle brick by brick from fresh pieces rather than simply moving the castle to a new table."]
    },
    commonMistakes: [
      {
        mistake: "Treating typeof obj === 'object' as sufficient check for plain objects.",
        why: "`typeof null === 'object'`, and Dates, RegExps, and Arrays are all 'object'.",
        correct: "Check `obj !== null`, and use `Array.isArray` or `instanceof Date` to branch specifically."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does structuredClone handle Dates and RegExps compared to custom cloners?",
        answer: "The native `structuredClone` algorithm natively replicates Date and RegExp instances, preserving internal timestamps and regex flags. However, attempting to pass a function to `structuredClone` throws a DOMException `DataCloneError`.",
        specReference: "HTML Living Standard §2.7 StructuredClone"
      }
    ]
  },

  "clone-hard": {
    interviewCrossQuestions: [
      {
        question: "How do you detect and clone circular references in an object graph?",
        answer: "By maintaining a `WeakMap` (or `Map`) that tracks visited objects during recursion: `visited = new WeakMap()`. Before recursing into an object, check `visited.has(obj)`. If true, return `visited.get(obj)` (the previously cloned reference). If false, instantiate the new clone object, immediately store it `visited.set(obj, clone)`, and then recursively populate its properties.",
        difficulty: "advanced",
        whyAsked: "The gold standard interview question for graph traversal algorithms in JavaScript."
      },
      {
        question: "Why must you use a WeakMap instead of an Array or Set for visited tracking?",
        answer: "A `WeakMap` holds weak references to its object keys, preventing the cloner from leaking memory if the traversal is retained. More importantly, WeakMap provides O(1) key lookup by object reference, whereas an Array would require O(N) linear scans (`indexOf`) on every object visited.",
        difficulty: "intermediate",
        whyAsked: "Tests data structure selection and memory leak prevention."
      },
      {
        question: "Why must you store the cloned reference in the WeakMap BEFORE recursing into children?",
        answer: "If you recurse into children before saving the parent clone in the map (`visited.set(obj, clone)`), a circular child pointing back to the parent will find no visited entry for the parent, triggering infinite recursion and a Call Stack Overflow.",
        difficulty: "advanced",
        whyAsked: "Checks if candidate actually understands graph cycle breaking mechanics."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "DOM Node & Graph Structure Cloning",
        description: "Cloning complex interconnected data graphs (e.g. parent-child DOM trees where children have `.parentElement` pointers back to the parent).",
        companies: "Figma, Canvas Engines",
        codeSnippet: "const clone = universalClone(scenegraphNode);"
      },
      {
        scenario: "Web Worker Message Passing (Structured Clone Algorithm)",
        description: "Browsers serialize complex state trees passed between Web Workers and the main thread via postMessage using circular graph cloning.",
        companies: "Chrome Engine, WebKit",
        codeSnippet: "worker.postMessage(deepGraphData);"
      }
    ],
    howToExplain: {
      opening: "A universal deep clone solves the cyclic graph traversal problem using a WeakMap memoization table to map original objects to their cloned counterparts, breaking circular loops in O(N) time.",
      keyPoints: [
        "Circular structures cause naive recursive cloners to crash with Maximum call stack size exceeded.",
        "A WeakMap memoizes visited objects: visited.set(source, clone).",
        "The clone must be registered in the map BEFORE traversing children to resolve cycles.",
        "WeakMap guarantees O(1) reference lookup and zero memory leakage."
      ],
      closingImpression: "This is the exact algorithm executed by the browser's native structuredClone and Lodash's cloneDeep.",
      analogies: ["Leaving breadcrumbs in a maze: before you enter a room, you leave a sign with your forward address so if you loop back to the room, you take the exit instead of circling forever."]
    },
    commonMistakes: [
      {
        mistake: "Placing `visited.set(obj, clone)` after the child property loop.",
        why: "This causes immediate infinite recursion on any cyclic reference.",
        correct: "Always register the cloned instance in the map immediately after instantiation, before recursing."
      }
    ],
    followUpDeepDive: [
      {
        question: "What types cannot be cloned by the HTML Structured Clone Algorithm?",
        answer: "Functions, DOM nodes, Error objects (in some older specs), WeakMaps, WeakSets, and Symbol properties cannot be cloned by `structuredClone()` and will throw `DataCloneError`.",
        specReference: "HTML Living Standard §2.7.1 StructuredSerializeInternal"
      }
    ]
  }
};
