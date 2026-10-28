// System Design Enhancements Module 2: APIs, Databases, Security & Observability (8 topics)
module.exports = {
  'api-paradigms-rest-graphql-grpc': {
    interviewCrossQuestions: [
      {
        question: "Compare REST, GraphQL, gRPC, and tRPC. In what architectural scenarios would you choose each?",
        answer: "1) REST: Industry standard for public APIs and third-party integrations; leverages standard HTTP caching, status codes, and tooling, but suffers from over-fetching/under-fetching. 2) GraphQL: Ideal for complex client applications (mobile/web) querying disparate graph entities; client defines exact query shapes, preventing over-fetching, but loses native HTTP edge caching and introduces the N+1 database problem. 3) gRPC: High-throughput internal microservice communication; uses Protocol Buffers (compact binary serialization) over HTTP/2 multiplexed streams, delivering 5-10x performance gains and bidirectional streaming, but lacks native browser support without gRPC-Web proxies. 4) tRPC: End-to-end type safety for full-stack TypeScript monorepos with zero code generation.",
        difficulty: "advanced",
        whyAsked: "Tests architectural protocol selection, performance trade-offs, and communication topology."
      },
      {
        question: "What is the N+1 Query Problem in GraphQL, and how does DataLoader solve it via batching and caching?",
        answer: "When resolving nested relationships (e.g. 50 posts, each with an author), a naive GraphQL resolver executes 1 query for the 50 posts, and then 50 separate queries to fetch each author (`N+1` queries), exhausting database connection pools. DataLoader solves this by utilizing the JavaScript Event Loop microtask queue. As resolver functions call `authorLoader.load(authorId)` synchronously during the execution phase, DataLoader collects all requested IDs. In the next microtask (before I/O), DataLoader batches the collected IDs into a single database query (`SELECT * FROM authors WHERE id IN (...)`) and dispatches the results to the respective promises, reducing 51 round trips to 2.",
        difficulty: "advanced",
        whyAsked: "Essential database optimization and async execution loop question for GraphQL systems."
      },
      {
        question: "Why is Protocol Buffers serialization faster than JSON, and how does field tagging provide backward compatibility?",
        answer: "JSON is human-readable text requiring ASCII/UTF-8 character parsing, string allocation, and repetitive key name serialization (e.g. `\"user_id\": 12345` repeats `user_id` in every record). Protobuf encodes fields into a compact binary format using Varints (variable-length integers) and field tags (combining field number and wire type into 1 byte). Field names are never transmitted over the wire. Backward compatibility is guaranteed because Protobuf identifies fields strictly by integer tags (e.g. `int32 user_id = 1;`). New fields can be added with new tag numbers without breaking legacy clients; legacy clients simply skip unrecognized tags during binary decoding.",
        difficulty: "staff",
        whyAsked: "Examines binary encoding mechanics, serialization efficiency, and schema evolution."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Uber / Airbnb Microservice Mesh Migration to gRPC",
        architecture: "Public web/mobile traffic terminates at an API Gateway (GraphQL/REST). Internal service-to-service calls across 2,000+ backend microservices communicate via gRPC with strict Protobuf schemas, service mesh mTLS, and client-side load balancing.",
        impact: "Reduced internal network bandwidth consumption by 65% and cut p99 RPC latency from 45ms to 6ms."
      }
    ],
    howToExplain: {
      opening: "API protocol selection is driven by client environment, bandwidth constraints, and type contracts: REST for universal public interoperability, GraphQL for flexible client data aggregation, gRPC for high-throughput internal microservices, and tRPC for full-stack TypeScript monorepos.",
      keyPoints: [
        "Public vs Internal: REST/GraphQL for public web clients; gRPC over HTTP/2 for internal service mesh.",
        "Over-fetching vs Complexity: GraphQL eliminates over-fetching but requires DataLoader to prevent N+1 queries.",
        "Serialization Performance: Protobuf binary tags outperform JSON string parsing by orders of magnitude.",
        "Schema Evolution: Protobuf numeric tags and GraphQL schema directives enable non-breaking API evolution."
      ],
      closingImpression: "A mature enterprise architecture rarely uses a single protocol; it uses REST/GraphQL at the edge and gRPC in the internal microservice core.",
      analogies: "REST is like buying a pre-packaged combo meal at a fast-food drive-through. GraphQL is a custom salad bar where you pick exact ingredients. gRPC is a pneumatic tube system shooting compressed coded canisters between bank teller desks."
    },
    commonMistakes: [
      {
        mistake: "Using GraphQL for public high-volume APIs without query complexity analysis or depth limits.",
        whyWrong: "Malicious clients can submit deeply nested circular queries (e.g. `author { posts { author { posts ... } } }`) that generate exponential database queries, causing immediate DoS resource exhaustion.",
        correctApproach: "Implement strict query depth limiting, cost/complexity calculation, and persisted queries in production."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does GraphQL Apollo Federation compose multiple microservice subgraphs into a unified gateway?",
        deepDiveAnswer: "Apollo Federation uses declarative schema directives (`@key`, `@extends`, `@external`). Each microservice owns its domain entities and schema. The Apollo Gateway queries the subgraphs' service capabilities, composes a unified schema AST, and plans optimized parallel execution query plans across subgraphs via `_entities` queries.",
        rfcOrSourceReference: "GraphQL Specification (October 2021) & Apollo Federation 2.0 Core Specification"
      }
    ]
  },

  'realtime-websockets-sse': {
    interviewCrossQuestions: [
      {
        question: "Compare WebSockets vs Server-Sent Events (SSE) vs Long Polling across transport, connection overhead, and firewall traversal.",
        answer: "1) Long Polling: Client opens an HTTP request that the server holds until new data is available; upon receiving data, client immediately opens a new request. High latency, significant HTTP header overhead, and creates connection churn. 2) WebSockets: Initiated via HTTP 101 Upgrade, establishing a persistent, bidirectional, full-duplex TCP connection with a tiny 2-to-10 byte frame overhead. Ideal for multiplayer gaming, live audio/video signaling, and two-way collaborative whiteboards. Downsides: Custom ws:// protocol, bypasses standard HTTP caching and proxies, complex load balancer connection pinning. 3) Server-Sent Events (SSE): Unidirectional server-to-client streaming over standard HTTP/2 or HTTP/3 (`Content-Type: text/event-stream`). Built-in automatic reconnection, event IDs for message replay, traverses enterprise corporate firewalls natively, and supports standard HTTP auth headers. Ideal for live stock feeds, notifications, and AI LLM token streaming.",
        difficulty: "advanced",
        whyAsked: "A favorite senior interview question evaluating protocol mastery and real-time architectural design."
      },
      {
        question: "How do you scale a WebSocket server across a cluster of 50 Node.js instances when users on different servers need to chat?",
        answer: "A client connected to Node instance A has its TCP socket tied to that specific process memory. To communicate with a user on Node instance B: 1) Deploy a distributed Pub/Sub message broker (Redis Pub/Sub, NATS, or Apache Kafka). 2) When user 1 sends a message to room #100 on Node A, Node A publishes the message to Redis channel `room:100`. 3) All 50 Node instances subscribe to active rooms. When Node B receives the Redis message, it iterates over its local sockets belonging to `room:100` and pushes the WebSocket frame down the wire. 4) State storage (user presence, message history) is decoupled into Redis sets and a persistent database (PostgreSQL/Cassandra).",
        difficulty: "staff",
        whyAsked: "Tests distributed systems design, socket state management, and pub/sub message broadcasting."
      },
      {
        question: "Why is heartbeat ping/pong mandatory for production WebSocket connections, and what happens without it?",
        answer: "Intermediate network equipment (home Wi-Fi routers, cellular towers, NAT firewalls, cloud load balancers) maintain connection tracking tables. If a TCP socket remains idle without data transmission, intermediate firewalls silently drop the state entry (typically after 60-120 seconds) without sending a TCP RST or FIN packet. Both client and server believe the connection is alive, but all future packets are silently discarded ('Half-Open Socket'). Heartbeat ping/pong frames (sent every 30s) keep intermediate NAT tables refreshed and allow both sides to detect broken connections and initiate automated reconnects.",
        difficulty: "advanced",
        whyAsked: "Examines low-level network state awareness and connection health management."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "ChatGPT / Claude Real-Time Token Streaming",
        architecture: "LLM completion API streams generated tokens over Server-Sent Events (SSE) using standard HTTP/2 chunked transfer encoding (`text/event-stream`). Client consumes the stream via the Fetch API `ReadableStream` reader.",
        impact: "Zero WebSocket handshake overhead, native HTTP error handling, and sub-10ms initial token rendering."
      },
      {
        scenario: "Slack / Discord Real-Time Gateway Cluster",
        architecture: "Clients maintain persistent WebSocket connections to edge Gateway servers (written in Go/Rust). Gateway translates incoming events into Apache Kafka partitions; worker services consume Kafka, process business logic, and publish back through Redis Pub/Sub clusters to connected gateway nodes.",
        impact: "Maintains 20+ million concurrent persistent connections with sub-50ms message broadcast latency."
      }
    ],
    howToExplain: {
      opening: "Real-time architectures bridge the gap between event generation on the server and instant consumption on the client. The choice comes down to data flow directionality: WebSockets for bidirectional full-duplex communication, and Server-Sent Events (SSE) for unidirectional server-to-client streaming over standard HTTP.",
      keyPoints: [
        "Directionality: WebSockets for bi-directional (chat, gaming); SSE for unidirectional (AI streaming, stock tickers).",
        "Protocol Simplicity: SSE uses plain HTTP/2 text streams with automatic reconnection and event IDs.",
        "Clustering: Decouple stateful TCP sockets from message distribution using Redis Pub/Sub or Kafka.",
        "Connection Health: Mandate application-layer ping/pong heartbeats to prevent silent NAT firewall dropouts."
      ],
      closingImpression: "Do not default to WebSockets for everything. For AI token streaming and notifications, SSE over HTTP/2 is simpler, more resilient, and traverses proxy firewalls cleanly.",
      analogies: "Long polling is checking the mailbox every 5 minutes. WebSockets is a continuous live telephone phone call where both can talk anytime. SSE is a live radio broadcast you tune into; the radio station broadcasts continuously, but you only listen."
    },
    commonMistakes: [
      {
        mistake: "Choosing WebSockets for simple unidirectional notifications or AI LLM token streaming.",
        whyWrong: "WebSockets introduce custom connection handshakes, complicate load balancing, break HTTP/2 multiplexing benefits, and require custom reconnection and heartbeat logic that SSE provides natively.",
        correctApproach: "Use Server-Sent Events (SSE) for server-to-client unidirectional streams and reserve WebSockets for bidirectional interactive collaboration."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does the W3C EventSource protocol achieve automatic stream resumption after a network disconnect?",
        deepDiveAnswer: "Every message sent over SSE can include an `id: <message_id>` field. When a network dropout occurs, the browser's `EventSource` automatically reconnects and includes the `Last-Event-ID: <message_id>` header. The server inspects this header and replays any missed messages from a buffer without losing state.",
        rfcOrSourceReference: "W3C Server-Sent Events Recommendation & IETF RFC 6455 (The WebSocket Protocol)"
      }
    ]
  },

  'sql-vs-nosql-cap-theorem': {
    interviewCrossQuestions: [
      {
        question: "Explain the CAP theorem and why the classic 'pick 2 out of 3' framing is technically misleading in real distributed systems.",
        answer: "The CAP theorem states that in a distributed data store, you can only simultaneously guarantee two of: Consistency (every read receives the most recent write or an error), Availability (every non-failing node returns a non-error response), and Partition Tolerance (the system continues operating despite arbitrary network dropped/delayed packets). The 'pick 2 out of 3' framing is misleading because network partitions (P) are an inevitable physical reality of distributed infrastructure (cables get cut, switches fail). Therefore, a distributed system NEVER gets to choose 'CA without P'. When a network partition occurs, the system must choose between: CP (reject writes or wait for partition to heal to preserve strict consistency, sacrificing availability) or AP (allow writes on partitioned nodes, sacrificing consistency and accepting divergent state).",
        difficulty: "staff",
        whyAsked: "Tests fundamental distributed systems theory and exposes memorized textbook answers."
      },
      {
        question: "What is the PACELC theorem, and how does it extend CAP to normal non-partitioned operation?",
        answer: "CAP only describes system behavior during a network partition. PACELC states: If there is a Partition (P), how does the system trade off Availability (A) and Consistency (C); Else (E), when the network is running normally, how does the system trade off Latency (L) and Consistency (C)? For example: MongoDB is PC/EC (prefers consistency over availability during partitions; prefers consistency over latency during normal operations by routing writes to the primary). DynamoDB / Cassandra is PA/EL (prefers availability during partitions; prefers low latency over strict consistency in normal operations via tunable eventual consistency).",
        difficulty: "advanced",
        whyAsked: "High-level staff architectural question assessing latency vs consistency trade-offs."
      },
      {
        question: "How does PostgreSQL implement Multi-Version Concurrency Control (MVCC), and why does it avoid read locks?",
        answer: "In traditional 2-Phase Locking (2PL), readers lock out writers and writers lock out readers, causing severe concurrency bottlenecks. PostgreSQL MVCC avoids read locks entirely: when a row is updated or deleted, PostgreSQL does not overwrite the existing data in-place. Instead, each row header contains `xmin` (the transaction ID that created the row) and `xmax` (the transaction ID that updated/deleted the row). When a transaction runs, it takes a snapshot of active transaction IDs. Readers evaluate row visibility by comparing their snapshot against `xmin` and `xmax`, reading the version committed before their transaction began. Thus, 'readers never block writers, and writers never block readers'. Old dead row versions are reclaimed asynchronously by the `VACUUM` process.",
        difficulty: "advanced",
        whyAsked: "Tests deep database engine storage internals and concurrency transaction models."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Financial Ledger at Stripe / Revolut",
        architecture: "Strict ACID relational database (PostgreSQL / CockroachDB) with Serializable isolation level. Enforces strict primary key constraints, foreign key referential integrity, and distributed two-phase commit (2PC) to ensure zero double-spending or money creation.",
        impact: "Guarantees 100% mathematical auditability and ledger balance consistency."
      },
      {
        scenario: "Amazon DynamoDB High-Scale Shopping Cart",
        architecture: "AP distributed key-value store using Consistent Hashing and tunable consistency (Read: Eventual, Write: Quorum W=2, R=2). Prioritizes 100% write availability: customers must always be able to add items to their shopping cart even if a data center partition is occurring.",
        impact: "Sustains 100M+ operations per minute during Black Friday with single-digit millisecond latency."
      }
    ],
    howToExplain: {
      opening: "Choosing between SQL and NoSQL is not about trends; it is a mathematical trade-off between strict transactional consistency (ACID) and horizontal scale with partition tolerance (BASE / CAP).",
      keyPoints: [
        "Relational (SQL): Structured schemas, complex JOINs, ACID guarantees, vertical scaling, optimal for financial and transactional cores.",
        "Non-Relational (NoSQL): Document, Key-Value, Columnar, or Graph; denormalized models, horizontal sharding, BASE eventual consistency.",
        "CAP Reality: Partitions are unavoidable in physical networks; you choose between CP (banking, inventory) and AP (social feeds, shopping carts).",
        "PACELC: When healthy, systems must still choose between low latency (replication lag) and synchronous consistency."
      ],
      closingImpression: "Modern enterprise systems embrace Polyglot Persistence: relational SQL for ledger and customer accounts; distributed NoSQL for high-throughput activity logs and time-series telemetry.",
      analogies: "A SQL database is like a Swiss bank vault where every deposit requires a countersigned paper trail and physical verification. An AP NoSQL store is like a whiteboard in a busy kitchen where cooks write orders rapidly; occasional duplicate notes are sorted out later."
    },
    commonMistakes: [
      {
        mistake: "Claiming NoSQL databases do not support ACID transactions.",
        whyWrong: "Modern document and distributed databases (MongoDB 4.0+, DynamoDB, Couchbase) support multi-document ACID transactions, though with distributed coordination overhead.",
        correctApproach: "Clarify that while NoSQL engines can support ACID transactions, doing so incurs distributed consensus latency, diminishing the primary performance benefit of distributed sharding."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does the Quorum equation (R + W > N) guarantee strong consistency in distributed databases like Cassandra?",
        deepDiveAnswer: "In a cluster with replication factor N, R is the number of nodes read from, and W is the number of nodes written to before acknowledging success. If `R + W > N`, the Pigeonhole Principle guarantees that the set of nodes written to and the set of nodes read from must overlap by at least one node. That overlapping node will contain the latest vector clock / timestamp, guaranteeing strong consistency.",
        rfcOrSourceReference: "Werner Vogels: Eventually Consistent (Communications of the ACM, 2009) & Brewer's CAP Conjecture"
      }
    ]
  },

  'redis-caching-patterns': {
    interviewCrossQuestions: [
      {
        question: "Differentiate the three primary caching patterns: Cache-Aside, Write-Through, and Write-Behind (Write-Back).",
        answer: "1) Cache-Aside (Lazy Loading): The application code coordinates between cache and DB. On read: read cache; on miss: read DB, write back to cache, return. On write: write to DB, invalidate (delete) cache key. Pros: Resilient to cache failure, only active data is cached. Cons: Cache miss penalty on first request. 2) Write-Through: The application writes to the cache layer, which synchronously writes through to the DB before returning success. Pros: Cache is always up-to-date. Cons: Write latency increased by dual write. 3) Write-Behind (Write-Back): Application writes to cache immediately; cache asynchronously batches writes to DB in the background. Pros: Ultra-low write latency and write absorption. Cons: Risk of data loss if cache crashes before dirty writes flush to disk.",
        difficulty: "advanced",
        whyAsked: "Core architectural caching question assessing consistency, durability, and latency trade-offs."
      },
      {
        question: "Explain the three catastrophic cache failure modes: Cache Stampede (Thundering Herd), Cache Penetration, and Cache Avalanche. How do you prevent each?",
        answer: "1) Cache Stampede (Thundering Herd): A high-traffic key expires, and 10,000 concurrent requests simultaneously experience a cache miss, all querying the DB at once. Mitigation: Distributed Mutex Lock (via Redis `SET NX EX`), or Probabilistic Early Expiration (XFetch algorithm). 2) Cache Penetration: Malicious requests query non-existent keys (e.g. ID -9999). Every request misses cache and hits DB. Mitigation: Bloom Filter at the edge, or cache empty null values with short TTL. 3) Cache Avalanche: Thousands of keys are set with the exact same 3600s TTL; they all expire simultaneously, causing widespread DB overload. Mitigation: Add random jitter to TTLs (`TTL = baseTTL + random(0, 300)`).",
        difficulty: "staff",
        whyAsked: "The classic system reliability grilling assessing protection against production outages."
      },
      {
        question: "Why should you DELETE a cache key on database updates instead of UPDATING the cache value?",
        answer: "Updating the cache value on DB write introduces severe race conditions under concurrent writes. If Client A updates DB to 1, and Client B updates DB to 2: due to network jitter, Client B's cache write might reach Redis first, followed by Client A's stale cache write. Now the DB has value 2, but the cache permanently has stale value 1. By simply DELETING the cache key (`redis.del(key)`) inside a database transaction, subsequent reads safely repopulate the freshest committed DB value on the next lazy load.",
        difficulty: "advanced",
        whyAsked: "Separates real-world distributed caching practitioners from theoretical candidates."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Twitter / X User Profile Caching",
        architecture: "Uses Cache-Aside with Redis Cluster. Hot celebrity profile keys utilize distributed locks (`SET key val NX EX 10`) on cache misses so only 1 worker queries PostgreSQL while the rest poll or await pub/sub broadcast.",
        impact: "Prevented database connection pool exhaustion during viral global events, absorbing 99.9% of read traffic."
      }
    ],
    howToExplain: {
      opening: "Caching places hot data in fast, volatile in-memory storage (RAM) to bypass disk I/O and expensive database computation. Effective caching requires matching the update pattern to data volatility and systematically defending against stampedes, penetrations, and avalanches.",
      keyPoints: [
        "Pattern Selection: Cache-Aside is the production standard for read-heavy web apps; Write-Behind for write-heavy gaming telemetries.",
        "Key Invalidation: Delete cache keys on write rather than updating values to prevent concurrent race conditions.",
        "Stampede Defense: Guard hot key repopulation with distributed locks (`SET NX`) or probabilistic early refresh.",
        "Jittered TTLs: Always apply random jitter to TTLs to prevent simultaneous cluster-wide expiration avalanches."
      ],
      closingImpression: "A cache is an optimization, not a database. If your system cannot gracefully degrade and survive a sudden cache eviction without taking down the primary database, the architecture is fundamentally flawed.",
      analogies: "Cache-Aside is keeping sticky notes on your desk of frequent phone numbers; when a number changes, you throw the sticky note away and write a new one next time you look it up in the company directory."
    },
    commonMistakes: [
      {
        mistake: "Treating Redis as a primary permanent database without configuring eviction policies and persistence.",
        whyWrong: "When RAM fills up without an eviction policy (e.g. `allkeys-lru`), Redis throws OOM errors on all write operations, halting the application.",
        correctApproach: "Explicitly set `maxmemory` and an appropriate eviction policy (`volatile-lru` or `allkeys-lru`), and configure RDB snapshots + AOF append-only logs for durability."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does the XFetch probabilistic early expiration algorithm prevent cache stampedes without distributed locking?",
        deepDiveAnswer: "XFetch calculates a probabilistic condition based on remaining TTL, delta computation time, and an aggressiveness factor beta: `-(delta * beta * ln(random())) >= remainingTTL`. As a key nears expiration under high read volume, requests probabilistically trigger background cache repopulation before expiration occurs, ensuring the key is never stale and never requires lock synchronization.",
        rfcOrSourceReference: "Optimal Probabilistic Cache Stampede Prevention (Vattani, Chierichetti, Lowenstein, VLDB 2015)"
      }
    ]
  },

  'auth-sessions-vs-jwts-oauth': {
    interviewCrossQuestions: [
      {
        question: "Compare Stateful Database Sessions vs Stateless JWTs. Why is immediate token revocation notoriously hard with JWTs?",
        answer: "1) Stateful Sessions: Client receives an opaque session ID stored in an HttpOnly cookie; session data lives on the server (Redis/DB). Pros: Instant revocation (delete session record in Redis immediately terminates user access). Cons: Requires state lookup on every single request, adding Redis network hops. 2) Stateless JWTs: Token contains signed user claims (payload) encoded in base64url. Server verifies the cryptographic signature (HMAC-SHA256 or RSA/ECDSA) locally without database lookups. Pros: Completely stateless, works across disparate microservices without shared session stores. Cons: Immediate revocation is nearly impossible because the token remains mathematically valid until its `exp` timestamp. If a user changes their password, is banned, or has their laptop stolen, an attacker holding a valid JWT retains access. Workarounds (token blacklists in Redis) destroy the stateless benefit of JWTs.",
        difficulty: "advanced",
        whyAsked: "The single most common security and architectural debate in modern web authentication."
      },
      {
        question: "Where should you store authentication tokens in browser single-page applications, and why is `localStorage` dangerous?",
        answer: "Storing JWTs in `localStorage` or `sessionStorage` exposes tokens directly to JavaScript. Any Cross-Site Scripting (XSS) vulnerability (e.g. in a third-party npm package, CDN script, or markdown renderer) allows an attacker to execute `localStorage.getItem('token')` and instantly exfiltrate credentials to an external server. Best practice mandates storing tokens in `HttpOnly`, `Secure`, `SameSite=Strict` (or `Lax`) cookies. The browser automatically sends the cookie on requests, but the `HttpOnly` flag renders the cookie completely invisible and inaccessible to client-side JavaScript, rendering XSS token exfiltration impossible.",
        difficulty: "advanced",
        whyAsked: "Fundamental web application security requirement distinguishing senior engineers from juniors."
      },
      {
        question: "Explain the OAuth 2.0 Authorization Code Flow with PKCE (Proof Key for Code Exchange). Why is PKCE required for SPAs and mobile apps?",
        answer: "Public clients (SPAs and mobile apps) cannot keep a `client_secret` confidential because their client code can be decompiled or inspected in the browser. In standard Authorization Code flow, an intercepted authorization code could be exchanged by a malicious app for tokens. PKCE (RFC 7636) prevents this: 1) Client creates a cryptographically random secret string called `code_verifier`. 2) Client hashes it with SHA-256 to create `code_challenge`. 3) Client redirects user to Auth server with `code_challenge`. 4) Auth server returns an authorization code. 5) Client exchanges the authorization code for tokens, passing the original plaintext `code_verifier`. 6) Auth server hashes the verifier; if it matches the earlier challenge, it issues tokens. Even if an attacker intercepts the authorization code, they cannot exchange it without the unhashed `code_verifier` held only in client memory.",
        difficulty: "staff",
        whyAsked: "Tests cutting-edge identity standards, OAuth 2.1 RFC compliance, and public client security."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Enterprise Single Sign-On (SSO) with Okta / Auth0",
        architecture: "Client authenticates via OAuth 2.0 / OpenID Connect Authorization Code + PKCE. Browser receives a short-lived (15 min) JWT Access Token and an HttpOnly Refresh Token stored with sliding window rotation.",
        impact: "Enforced zero-trust identity verification across 80+ internal microservices with seamless 1-click SSO."
      }
    ],
    howToExplain: {
      opening: "Authentication verifies who a user is; authorization verifies what they are allowed to do. Choosing between stateful sessions and stateless JWTs is a direct trade-off between instant revocation control and distributed scalability.",
      keyPoints: [
        "Stateful Sessions: Opaque IDs in HttpOnly cookies; server controls revocation, ideal for monolithic and dashboard apps.",
        "Stateless JWTs: Cryptographically signed self-contained tokens; scale across microservices, but revocation requires short TTLs.",
        "Hybrid Token Architecture: Short-lived access tokens (15 mins) paired with stateful refresh tokens stored in Redis for fast revocation.",
        "Token Storage: Always use HttpOnly, Secure, SameSite cookies to neutralize XSS token exfiltration."
      ],
      closingImpression: "Never store sensitive auth tokens in localStorage. The best modern architecture is a hybrid: short-lived stateless access tokens paired with rotating, stateful refresh tokens stored in HttpOnly cookies.",
      analogies: "A stateful session is a hotel room keycard; the front desk computer can deactivate it instantly. A JWT is an airline boarding pass stamped with a flight time; TSA checks the ink signature without calling the airline, but cannot easily cancel it until it expires."
    },
    commonMistakes: [
      {
        mistake: "Setting JWT expiration to 30 days or never expiring tokens.",
        whyWrong: "Stateless JWTs cannot be revoked without maintaining a global distributed blacklist; a compromised 30-day token gives an attacker full access for a month with zero defense.",
        correctApproach: "Set access tokens to short lifespans (5-15 minutes) and issue long-lived refresh tokens stored in HttpOnly cookies with automatic reuse detection."
      }
    ],
    followUpDeepDive: [
      {
        question: "What is the 'alg: none' vulnerability in JWT verification libraries?",
        deepDiveAnswer: "The JWT header specifies the algorithm (e.g. `{\"alg\": \"HS256\"}`). Early library implementations naively trusted the header without verifying against the server's expected algorithm. Attackers modified the header to `{\"alg\": \"none\"}`, stripped the signature, and changed their role claim to `admin`. Flawed libraries accepted the unverified token as valid. Modern libraries require explicit algorithm whitelisting.",
        rfcOrSourceReference: "IETF RFC 7519 (JSON Web Token) & RFC 7636 (PKCE for OAuth 2.0 Public Clients)"
      }
    ]
  },

  'web-vulnerabilities-cors-xss-csrf': {
    interviewCrossQuestions: [
      {
        question: "Explain Cross-Origin Resource Sharing (CORS). Why does CORS provide zero security protection for your backend servers?",
        answer: "CORS is a browser security mechanism, NOT a backend firewall or server defense. The Same-Origin Policy (SOP) forbids browsers from allowing web pages on one origin (domain/protocol/port) to read responses from another origin. When a browser initiates a cross-origin request with custom headers or non-simple HTTP methods (PUT/DELETE/JSON POST), the browser automatically sends a preflight `OPTIONS` request. If the server does not respond with matching `Access-Control-Allow-Origin` headers, the BROWSER blocks the JavaScript application from reading the response. However, non-browser clients (Postman, curl, Python scripts, malicious bots) completely ignore CORS headers and can query backend servers directly. CORS protects users from malicious websites using their browser to read authenticated data, but does not secure the server from direct API attacks.",
        difficulty: "advanced",
        whyAsked: "The #1 misunderstood concept in web development. Distinguishes candidates who truly understand the browser security model."
      },
      {
        question: "Contrast XSS (Cross-Site Scripting) and CSRF (Cross-Site Request Forgery). How does `SameSite` cookie attribute mitigate CSRF?",
        answer: "1) XSS: Attacker injects malicious JavaScript into a trusted website (Stored, Reflected, or DOM-based). When the victim views the page, the script executes in the victim's browser, stealing DOM data, logging keystrokes, or exfiltrating tokens. 2) CSRF: Attacker tricks an authenticated user's browser into submitting an unauthorized HTTP request to a target site where the user is currently logged in. Because browsers automatically attached cookies to cross-site requests historically, the server trusted the request. `SameSite=Strict` cookies completely forbid the browser from attaching the cookie on any cross-site request (even clicking a link). `SameSite=Lax` allows cookies on safe top-level GET navigations (clicking a link) but blocks cookies on cross-site POST/PUT/DELETE forms, neutralizing classical CSRF without requiring anti-CSRF tokens for standard forms.",
        difficulty: "advanced",
        whyAsked: "Assesses mastery of OWASP Top 10 vulnerabilities and modern browser defenses."
      },
      {
        question: "How does a Content Security Policy (CSP) with cryptographic nonces neutralize Stored and Reflected XSS?",
        answer: "A CSP header (`Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-rAnd0m123'`) instructs the browser to refuse execution of any inline `<script>` tags or injected script strings (`eval()`, `innerHTML`) unless the script tag contains an exact matching `nonce=\"rAnd0m123\"` attribute. The server generates a cryptographically random, unique nonce for every single HTTP response and injects it into legitimate server-rendered script tags. Even if an attacker injects a `<script>alert(1)</script>` tag into a database comment or user profile, the browser blocks execution because the injected tag lacks the secret one-time nonce generated for that specific HTTP response.",
        difficulty: "staff",
        whyAsked: "Tests understanding of defense-in-depth security architectures and CSP Level 3 standards."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Banking Platform OWASP Hardening",
        architecture: "Strict Content-Security-Policy with per-request nonces, `X-Frame-Options: DENY` (anti-clickjacking), `X-Content-Type-Options: nosniff`, and `Strict-Transport-Security` (HSTS). All session cookies configured with `SameSite=Strict; Secure; HttpOnly`. Database queries enforce 100% parameterized prepared statements via ORM.",
        impact: "Zero successful XSS, CSRF, or SQL injection incidents across 10 million transactions."
      }
    ],
    howToExplain: {
      opening: "Web security is built on defense-in-depth: the browser's Same-Origin Policy enforces client isolation, CORS negotiates cross-origin resource sharing, CSP neutralizes malicious script execution, and SameSite cookies eliminate cross-site request forgery.",
      keyPoints: [
        "CORS: A browser-enforced reading restriction, not a server-side firewall; backend APIs must enforce their own authentication.",
        "XSS Defense: Context-aware HTML sanitization, avoiding dangerous sinks (`dangerouslySetInnerHTML`), and enforcing strict nonce-based CSP.",
        "CSRF Defense: Modern `SameSite=Lax` or `Strict` cookies combined with anti-CSRF double-submit tokens for state-modifying requests.",
        "SQL Injection: Never concatenate strings into queries; always use parameterized prepared statements."
      ],
      closingImpression: "Security is not an add-on; it is architectural hygiene. Defense-in-depth means if one layer fails (e.g. an unescaped string), subsequent layers (CSP, HttpOnly cookies) prevent exploitation.",
      analogies: "CORS is an embassy guard checking whether a visitor has permission to see classified files. CSRF is a trickster forging a bank withdrawal slip with your signature. XSS is an intruder sneaking a spy microphone inside your living room."
    },
    commonMistakes: [
      {
        mistake: "Setting `Access-Control-Allow-Origin: *` while simultaneously setting `Access-Control-Allow-Credentials: true`.",
        whyWrong: "Browsers strictly reject this combination as a fatal security violation; wildcards can never be used when credentials (cookies, auth headers) are transmitted.",
        correctApproach: "Explicitly reflect the specific validated origin from a whitelist in `Access-Control-Allow-Origin` when credentials are required."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does DOMPurify sanitize untrusted HTML strings to prevent DOM-based XSS attacks in React/Vue?",
        deepDiveAnswer: "DOMPurify builds a DOM tree in an inert `HTMLDocument` using `DOMParser`, walks all nodes, strips forbidden elements (`<script>`, `<iframe>`, `<object>`), inspects all attributes, removes dangerous schemes (`javascript:`, `data:`), and neutralizes mXSS (mutation XSS) before serializing clean HTML back to the DOM.",
        rfcOrSourceReference: "W3C Content Security Policy Level 3 & OWASP Top 10 Web Application Security Risks"
      }
    ]
  },

  'observability-metrics-logs-traces': {
    interviewCrossQuestions: [
      {
        question: "Differentiate the Three Pillars of Observability: Metrics, Logs, and Distributed Tracing. How do they complement each other during an incident?",
        answer: "1) Metrics: Aggregated numeric time-series data measured over intervals (e.g. CPU %, request rate, p99 latency). High-level, low storage cost, ideal for automated alerting and dashboards. Tells you: 'SOMETHING is wrong (p99 latency spiked from 50ms to 4000ms).' 2) Logs: Discrete, structured timestamped event records (JSON format with level, message, user_id). Rich context on specific exceptions or state changes. Tells you: 'WHY it is wrong (Database connection timeout on query X).' 3) Distributed Tracing: Tracks the end-to-end lifecycle of a single request across dozens of microservices, queues, and databases using a unique Trace ID. Tells you: 'WHERE it is wrong (The 3.8s delay occurred specifically inside PaymentService -> Stripe API call, not in AuthService).'",
        difficulty: "advanced",
        whyAsked: "The foundational observability question evaluating systems monitoring maturity."
      },
      {
        question: "How does the W3C TraceContext standard propagate trace context across asynchronous microservices and message queues?",
        answer: "Distributed tracing requires every downstream service call to carry context without breaking protocol encapsulation. W3C TraceContext defines standard HTTP headers: `traceparent` and `tracestate`. The `traceparent` header is formatted as: `version(00)-trace_id(32 hex chars)-parent_span_id(16 hex chars)-trace_flags(01)`. When Service A calls Service B over HTTP or puts a message on a Kafka topic, it injects the `traceparent` header. Service B extracts the header, sets `trace_id` as its root trace, generates a new `span_id`, and sets Service A's span as its `parent_id`. This links all asynchronous operations into a coherent Directed Acyclic Graph (DAG) visualized in Jaeger or Datadog.",
        difficulty: "staff",
        whyAsked: "Tests understanding of open distributed tracing standards (OpenTelemetry / W3C) at enterprise scale."
      },
      {
        question: "Compare Metric Types: Counters, Gauges, and Histograms in Prometheus. Why are Histograms essential for SLA tracking?",
        answer: "1) Counter: Monotonically increasing cumulative metric that only goes up or resets to zero on restart (e.g. `http_requests_total`). 2) Gauge: Value that can go up and down arbitrarily (e.g. `memory_usage_bytes`, `active_websocket_connections`). 3) Histogram: Samples observations (usually request durations or payload sizes) and counts them in configurable bucket intervals (e.g. `<10ms`, `<50ms`, `<200ms`, `<1000ms`). Histograms are mandatory for SLA/SLO tracking because mathematical averages hide tail latency. Using Prometheus's `histogram_quantile(0.99, sum(rate(http_duration_seconds_bucket[5m])) by (le))`, engineers accurately calculate exact p95, p99, and p99.9 latency percentiles across distributed clusters.",
        difficulty: "advanced",
        whyAsked: "Examines statistical metrics instrumentation and SLA engineering."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Microservice Outage Triage with OpenTelemetry (Uber / Datadog)",
        architecture: "All services instrumented with OpenTelemetry SDKs auto-injecting W3C TraceContext headers. When checkout p99 latency alerts fire via Prometheus Alertmanager, engineers click directly from the Grafana metric graph to the slowest exemplar Trace ID, highlighting an unindexed SQL query in the order fulfillment service.",
        impact: "Reduced Mean Time to Resolution (MTTR) from 45 minutes to under 3 minutes."
      }
    ],
    howToExplain: {
      opening: "Observability is the ability to infer the internal state of a complex distributed system based on its external outputs: Metrics detect that a problem exists, Distributed Traces pinpoint where the latency or failure originated, and Structured Logs explain why the error occurred.",
      keyPoints: [
        "Metrics: Low-cost numeric aggregations for real-time dashboards and alerting (Counters, Gauges, Histograms).",
        "Distributed Traces: Unique Trace IDs propagated via W3C TraceContext across network boundaries to construct execution DAGs.",
        "Structured Logs: Machine-readable JSON logs carrying contextual trace and span IDs for seamless correlation.",
        "Sampling: High-scale systems apply head-based or tail-based trace sampling to control storage costs without losing error traces."
      ],
      closingImpression: "Observability is not about collecting terabytes of raw logs; it is about correlating metrics, traces, and logs so an engineer can diagnose an unknown-unknown in minutes.",
      analogies: "Metrics are the dashboard check-engine light and speedometer in your car. Distributed tracing is a GPS map showing exactly which intersection has gridlock traffic. Logs are the black-box flight recorder with detailed timestamped cockpit audio."
    },
    commonMistakes: [
      {
        mistake: "Logging unstructured plain text strings (e.g. `console.log('User logged in ' + userId)`) in microservices.",
        whyWrong: "Unstructured plain text cannot be indexed, queried, or filtered by centralized log aggregators (Elasticsearch/Loki), making multi-service correlation and automated log alerting virtually impossible.",
        correctApproach: "Always emit structured JSON logs with standardized keys (`timestamp`, `level`, `trace_id`, `span_id`, `message`, `context`)."
      }
    ],
    followUpDeepDive: [
      {
        question: "What is Tail-Based Sampling in distributed tracing, and why is it superior to Head-Based Sampling?",
        deepDiveAnswer: "Head-based sampling decides whether to sample a trace at the initial ingress gateway before the request finishes (e.g. sample 1% randomly). If a rare error occurs in the remaining 99%, the trace is lost. Tail-based sampling buffers all spans of a trace in memory until the request completes. If the request results in an HTTP 5xx error or exceeds a 2-second p99 latency threshold, the entire trace is retained and stored; healthy routine traces are discarded, guaranteeing 100% visibility into anomalies at low storage cost.",
        rfcOrSourceReference: "W3C Recommendation: Trace Context Level 1 & OpenTelemetry Architecture Specification"
      }
    ]
  },

  'resilience-circuit-breaker-rate-limiting': {
    interviewCrossQuestions: [
      {
        question: "Explain the three states of the Circuit Breaker pattern (Closed, Open, Half-Open). How does it prevent cascading system failures?",
        answer: "When a downstream microservice or third-party API becomes degraded or slow, callers that continue waiting for timeouts consume threads, sockets, and memory, causing caller exhaustion that cascades upstream until the entire platform crashes. The Circuit Breaker wraps calls with a state machine: 1) Closed: Normal operation. Requests pass through. Failure counts/rates are tracked. 2) Open: If failures exceed a threshold (e.g. 50% errors over 10s), the circuit trips to Open. All incoming requests immediately fail fast with an error or fallback response without calling the downstream service. The downstream service is protected and given time to recover. 3) Half-Open: After a reset timeout (e.g. 30s), the circuit transitions to Half-Open, allowing a small test batch of requests through. If they succeed, the circuit resets to Closed; if any fail, it immediately trips back to Open.",
        difficulty: "advanced",
        whyAsked: "The cornerstone resilience pattern in distributed cloud systems."
      },
      {
        question: "Why must Exponential Backoff ALWAYS include Jitter when implementing automated client retries?",
        answer: "When a centralized database or API experiences a transient glitch, hundreds of thousands of connected clients encounter errors simultaneously. With standard exponential backoff (e.g. retry at 1s, 2s, 4s, 8s), all clients sleep for the exact same duration and retry in lockstep synchronization. This creates massive, periodic waves of traffic ('Thundering Herd' or 'Retry Storm') that continually knock the recovering service back offline. Adding Full Jitter introduces a random distribution to the sleep interval: `sleep = random(0, min(max_backoff, base * 2^attempt))`. Jitter spreads client retries evenly across time, converting sharp spikes into a smooth, manageable stream of traffic.",
        difficulty: "advanced",
        whyAsked: "Core Amazon Web Services (AWS) distributed resilience engineering principle."
      },
      {
        question: "Compare the four Rate Limiting algorithms: Token Bucket, Leaky Bucket, Fixed Window Counter, and Sliding Window Log. Which is preferred for production API gateways?",
        answer: "1) Fixed Window: Counts requests in fixed time blocks (e.g. 100 req/min). Vulnerable to traffic doubling at window boundaries (100 requests at 00:59, 100 at 01:00 = 200 in 2 seconds). 2) Sliding Window Log: Stores timestamp of every request in a Redis sorted set (`ZADD`/`ZREMRANGEBYSCORE`). 100% accurate, but memory-intensive for high throughput. 3) Leaky Bucket: Requests enter a queue that drains at a smooth, constant rate. Enforces constant output rate; drops requests if queue fills. 4) Token Bucket: Tokens replenish at a constant rate up to a max capacity. Allows controlled bursts (up to bucket capacity) while strictly capping long-term sustained rate. In production API gateways (Stripe, Cloudflare), Token Bucket or Sliding Window Counter is preferred because it balances memory efficiency with graceful handling of legitimate client traffic bursts.",
        difficulty: "staff",
        whyAsked: "Tests deep algorithmic knowledge and rate limiting architecture at high scale."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Payment Gateway Integration (Stripe / PayPal)",
        architecture: "Client calls Stripe via Circuit Breaker with 5-second timeout. If Stripe experiences an outage, circuit opens, and the client displays a degraded checkout warning rather than hanging user browser threads. Failed non-critical webhook notifications retry with exponential backoff and full jitter across an asynchronous dead-letter queue (DLQ).",
        impact: "Protected application threadpools from total starvation during third-party payment gateway downtime."
      },
      {
        scenario: "Distributed Rate Limiter in Redis (Cloudflare / GitHub API)",
        architecture: "API Gateway executes an atomic Redis Lua script implementing the Token Bucket algorithm. For user IP or API key, the script calculates token replenishment based on current millisecond timestamp, decrements a token, and returns remaining quota and retry-after headers in 0.8ms.",
        impact: "Defends APIs against volumetric brute-force attacks and noisy neighbors with sub-millisecond overhead."
      }
    ],
    howToExplain: {
      opening: "Distributed systems must be architected under the assumption that dependencies will fail, network partitions will occur, and traffic will spike. Resilience patterns protect the system from self-destruction via circuit breaking, jittered retries, and rate limiting.",
      keyPoints: [
        "Circuit Breaker: Fail fast when downstream dependencies degrade to prevent threadpool starvation and cascading outages.",
        "Exponential Backoff + Jitter: Back off retries with randomized delays to eliminate thundering herd retry storms.",
        "Rate Limiting: Token Bucket algorithm allows bursts while protecting backends from overload.",
        "Bulkheading & Timeouts: Isolate critical thread pools and enforce strict deadlines on all remote I/O operations."
      ],
      closingImpression: "Building reliable distributed systems is not about preventing failures—it is about containing their blast radius and degrading gracefully under pressure.",
      analogies: "A circuit breaker is like an electrical fuse in your home; if a toaster short-circuits, the fuse trips instantly so the entire house doesn't burn down. Jitter is like telling 1,000 employees leaving a crowded stadium to depart over a 15-minute window rather than all rushing the exit doors at the exact same second."
    },
    commonMistakes: [
      {
        mistake: "Configuring aggressive retries with zero backoff or zero jitter on failing database queries.",
        whyWrong: "When a database is struggling under 100% CPU load, aggressive client retries multiply query volume by 3x-5x, turning a minor transient slow-down into a complete, catastrophic outage.",
        correctApproach: "Limit retries to at most 2-3 attempts, apply exponential backoff with full jitter, and only retry idempotent operations."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does the Redis Lua script for Token Bucket guarantee atomic execution without race conditions?",
        deepDiveAnswer: "Because Redis executes Lua scripts as a single atomic transaction on its single-threaded event loop, no other command can run concurrently between reading the current token count and writing back the decremented count. This eliminates distributed lock contention and prevents race conditions under thousands of concurrent requests.",
        rfcOrSourceReference: "Marc Brooker: Exponential Backoff And Jitter (AWS Architecture Blog) & IETF RFC 6585 (Additional HTTP Status Codes: 429 Too Many Requests)"
      }
    ]
  }
};
