// System Design Enhancements Module 1: Infrastructure, Networking, Containers & Rendering (8 topics)
module.exports = {
  'dns-tcp-tls-lifecycle': {
    interviewCrossQuestions: [
      {
        question: "Trace the exact DNS resolution steps when resolving an uncached domain. Where do Root, TLD, and Authoritative servers fit in?",
        answer: "When a browser requests a domain (e.g. app.stripe.com): 1) Local browser cache and OS hosts/resolver cache are checked. 2) The query goes to the Recursive Resolver (ISP or 1.1.1.1/8.8.8.8). 3) If not cached, the recursive resolver queries a Root Name Server (one of 13 root server IPs using Anycast), which responds with the .com TLD Name Server referral. 4) The recursive resolver queries the .com TLD server, which returns the Authoritative Name Server NS records for stripe.com. 5) The resolver queries Stripe's Authoritative server (e.g., Route53), which returns the A/AAAA record with a TTL. 6) The recursive resolver caches this record and returns the IP to the OS, which returns it to the browser.",
        difficulty: "advanced",
        whyAsked: "Tests foundational Internet architecture knowledge and distinguishes between recursive vs iterative DNS resolution."
      },
      {
        question: "How does TLS 1.3 reduce handshake latency compared to TLS 1.2, and what are the security trade-offs of 0-RTT resumption?",
        answer: "TLS 1.2 required 2 full round trips (2-RTT) before application data could flow: 1 RTT for TCP SYN/ACK, then ClientHello/ServerHello, Certificate, Key Exchange (2 RTTs for TLS). TLS 1.3 reduces the handshake to 1-RTT by mandating Diffie-Hellman Ephemeral (ECDHE) and having the client send its public key shares speculatively in the ClientHello. For returning clients, TLS 1.3 offers 0-RTT Early Data using a Pre-Shared Key (PSK) derived from a prior session ticket. However, 0-RTT data is vulnerable to Replay Attacks because an attacker can capture and retransmit the initial packet. Therefore, production systems must restrict 0-RTT to idempotent GET requests and never allow non-idempotent POST/PATCH state mutations in 0-RTT payloads.",
        difficulty: "staff",
        whyAsked: "Evaluates cryptographic understanding, modern RFC 8446 protocol mechanics, and replay attack prevention."
      },
      {
        question: "What is Anycast routing in DNS, and how does it provide DDoS resilience and geographic latency reduction?",
        answer: "Anycast assigns the exact same BGP IP address to multiple geographically distributed servers across the globe. Internet routers use BGP (Border Gateway Protocol) to route packets to the topologically closest server with the lowest AS hop count. For DNS, Anycast delivers two huge benefits: 1) Low Latency: Clients resolve DNS queries against the nearest edge node in under 10ms. 2) DDoS Mitigation: Volumetric attack traffic is localized and absorbed by the nearest edge clusters rather than overwhelming a single centralized origin server cluster.",
        difficulty: "advanced",
        whyAsked: "Validates high-scale global infrastructure design and BGP network topology understanding."
      },
      {
        question: "What happens during TCP Slow Start, and why is `tcp_slow_start_after_idle` critical for low-latency web services?",
        answer: "TCP does not transmit at full bandwidth immediately. It initializes a Congestion Window (initcwnd, modern default 10 packets ~14KB) and doubles cwnd every RTT upon receiving ACKs until packet loss occurs or ssthresh is hit. When an HTTP connection remains idle across keep-alive timeouts, the Linux kernel default resets cwnd back to initcwnd (`tcp_slow_start_after_idle = 1`). For API servers with bursts of requests, this causes latency spikes because subsequent requests must re-ramp their window. Setting `sysctl -w net.ipv4.tcp_slow_start_after_idle=0` prevents window collapse on idle keep-alive connections.",
        difficulty: "advanced",
        whyAsked: "Tests Linux kernel networking tuning and TCP congestion control mechanics at high scale."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Global Edge API Gateway at Stripe/Cloudflare",
        architecture: "Anycast DNS resolution directs client traffic to the nearest Point of Presence (PoP). TLS termination occurs at the edge PoP with TLS 1.3 session tickets. TCP connections from the edge PoP to origin data centers are pre-warmed, persistent, and multiplexed, eliminating 3-way handshakes for upstream requests.",
        impact: "Reduced global p99 API handshake latency from 320ms to 24ms."
      },
      {
        scenario: "Preventing 0-RTT Replay Attacks on Banking APIs",
        architecture: "Reverse proxy terminates TLS 1.3 0-RTT. Nginx/Envoy inspects the `Early-Data` header. If the incoming request is non-idempotent (e.g. POST /transfer), the proxy responds with HTTP 425 'Too Early' to force the client to replay the request over a confirmed 1-RTT handshake.",
        impact: "Zero financial duplicate transactions under adversary packet capture."
      }
    ],
    howToExplain: {
      opening: "I evaluate web networking as a layered progression: starting with DNS hierarchical resolution to discover the IP, followed by the TCP 3-way handshake to establish reliable byte-stream transport, and finalized by TLS 1.3 to authenticate the host and negotiate forward-secret symmetric keys.",
      keyPoints: [
        "DNS: Recursive vs Iterative resolution across Root, TLD, and Authoritative servers with Anycast BGP routing.",
        "TCP: 3-way handshake (SYN, SYN-ACK, ACK) combined with congestion control (initcwnd and Slow Start).",
        "TLS 1.3: 1-RTT key exchange via ECDHE public shares; strict idempotency guardrails on 0-RTT early data.",
        "Edge Termination: Terminating TCP and TLS at edge PoPs isolates latency from long-haul origin round-trips."
      ],
      closingImpression: "By terminating TLS at the Anycast edge and reusing persistent origin pools, we compress multi-round-trip handshakes into a single localized hop.",
      analogies: "DNS is the international phone book directory; TCP is dialing the number and confirming both sides can hear each other; TLS is closing the soundproof booth door and agreeing on a one-time secret language."
    },
    commonMistakes: [
      {
        mistake: "Assuming DNS lookups happen on every single HTTP request.",
        whyWrong: "Operating systems, browsers, local routers, and recursive resolvers cache DNS records according to the TTL header; subsequent requests reuse the cached IP or the open keep-alive TCP socket.",
        correctApproach: "Clarify that DNS resolution occurs only when no unexpired socket or DNS cache entry exists in the local resolver cache."
      },
      {
        mistake: "Believing TLS 1.3 0-RTT can be safely used for all API endpoints.",
        whyWrong: "0-RTT early data lacks replay protection; an attacker replaying a captured 0-RTT POST request can cause double billing or unauthorized duplicate orders.",
        correctApproach: "Specify that 0-RTT must only be permitted for idempotent GET requests, or rejected with HTTP 425 Too Early."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does EDNS Client Subnet (ECS, RFC 7871) solve geolocation routing when users utilize third-party DNS resolvers like 1.1.1.1?",
        deepDiveAnswer: "When a user in Tokyo uses a public DNS resolver hosted in Singapore, standard DNS would return Singapore IPs. RFC 7871 allows the resolver to append the client's anonymized IP subnet (/24) in the EDNS payload to the authoritative server, allowing Route53/Cloudflare to return Tokyo IPs without exposing full client PII.",
        rfcOrSourceReference: "IETF RFC 7871 (Client Subnet in DNS Queries) & RFC 8446 (The Transport Layer Security (TLS) Protocol Version 1.3)"
      }
    ]
  },

  'http-evolution-quic': {
    interviewCrossQuestions: [
      {
        question: "What is Head-of-Line (HoL) blocking, and how did HTTP/2 solve it at the application layer while leaving it at the transport layer?",
        answer: "In HTTP/1.1, HoL blocking occurs because a single TCP connection can only process one request-response cycle at a time; if one slow request blocks the pipe, all subsequent requests must queue up. HTTP/2 solved application-layer HoL blocking by introducing binary framing and stream multiplexing over a single TCP connection: requests and responses are split into independent frames tagged with Stream IDs. However, TCP is a byte-stream protocol that guarantees in-order packet delivery. If a single TCP packet drops on a lossy cellular network, the OS TCP stack pauses ALL multiplexed streams until the missing packet is retransmitted (Transport-layer HoL blocking). HTTP/3 eliminates transport-layer HoL blocking by running over QUIC (UDP), where each stream has independent packet tracking.",
        difficulty: "advanced",
        whyAsked: "The gold standard interview question distinguishing surface-level HTTP knowledge from deep networking expertise."
      },
      {
        question: "How does QUIC achieve Connection Migration, and why is this revolutionary for mobile devices?",
        answer: "Traditional TCP connections are identified by a 4-tuple: (Source IP, Source Port, Destination IP, Destination Port). When a smartphone switches from Wi-Fi to 5G cellular, its IP address changes, which immediately breaks the 4-tuple and forces all active TCP sockets and TLS sessions to tear down and reconnect. QUIC replaces IP-based identification with a 64-bit Connection ID (CID) negotiated during connection setup. When the client's IP changes, packets continue flowing seamlessly with the same CID, enabling zero-interruption connection migration for live video streams and active downloads.",
        difficulty: "advanced",
        whyAsked: "Assesses mobile-first systems thinking and modern UDP-based transport protocols."
      },
      {
        question: "Compare HTTP/2 HPACK vs HTTP/3 QPACK header compression. Why was HPACK unsuitable for QUIC?",
        answer: "HTTP/2 HPACK uses static and dynamic compression tables where each header is encoded as an index. HPACK relies strictly on in-order frame delivery: both client and server update their dynamic tables synchronously. Because QUIC delivers streams out of order (no transport-layer HoL blocking), a stream referencing a dynamic index from an earlier packet might arrive before that packet does, causing decoding deadlocks. HTTP/3 QPACK resolves this by decoupling the stream data from the table updates using dedicated unidirectional encoder and decoder control streams, allowing out-of-order decoding with controlled head-of-line blocking only when explicit dependencies exist.",
        difficulty: "staff",
        whyAsked: "Tests understanding of distributed synchronization and stateful compression under out-of-order packet delivery."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Uber/DoorDash Real-Time Driver Tracking on Fluctuating Networks",
        architecture: "Mobile apps use HTTP/3 (QUIC) to communicate with API gateways. When a courier drives through tunnels or transitions between Wi-Fi and cell towers, QUIC Connection Migration prevents socket resets, maintaining continuous telemetry streams without app-level retry churn.",
        impact: "Reduced mobile reconnection failure rate by 82% in transit dead zones."
      },
      {
        scenario: "E-Commerce High-Density Asset Loading (Shopify)",
        architecture: "CDN serves product media over HTTP/2 and HTTP/3 with prioritized streaming. Hero images and critical CSS receive high priority stream dependencies; non-critical script assets run on lower-weight streams.",
        impact: "Improved Largest Contentful Paint (LCP) by 450ms across cellular connections."
      }
    ],
    howToExplain: {
      opening: "HTTP evolution is the story of maximizing network pipeline efficiency: HTTP/1.1 introduced persistent connections but suffered application HoL blocking; HTTP/2 multiplexed streams over a single TCP pipe via binary framing; and HTTP/3 moved to QUIC over UDP to eliminate transport-layer HoL blocking and enable zero-RTT connection migration.",
      keyPoints: [
        "HTTP/1.1: Text-based, one request per connection at a time, required domain sharding hack.",
        "HTTP/2: Binary framing layer, stream multiplexing, HPACK compression, but TCP packet loss stalls all streams.",
        "HTTP/3 (QUIC): Built on UDP, independent stream packet accounting, 1-RTT combined transport+crypto handshake, Connection ID migration."
      ],
      closingImpression: "HTTP/3 solves the fundamental impedance mismatch between application-level concurrency and TCP's monolithic sequential byte-stream guarantee.",
      analogies: "HTTP/1.1 is a one-lane highway with one car at a time. HTTP/2 is a single highway lane with multiple cars merged bumper-to-bumper; if the front car gets a flat tire, everyone stops. HTTP/3 is a multi-lane highway over UDP where each car has its own lane; a flat tire in lane 1 doesn't slow down lane 2."
    },
    commonMistakes: [
      {
        mistake: "Claiming HTTP/3 is unreliable because it runs over UDP.",
        whyWrong: "QUIC implements its own connection state machine, packet sequence numbers, selective acknowledgments (SACK), and congestion control (BBR/Cubic) entirely in user space on top of UDP datagrams.",
        correctApproach: "Explain that QUIC provides all the reliability and ordered delivery of TCP, but with per-stream granularity."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does the BBR (Bottleneck Bandwidth and RTT) congestion control algorithm differ from loss-based Cubic in HTTP/3?",
        deepDiveAnswer: "Cubic treats packet loss as the sole signal of congestion, scaling back transmission window sharply even when packets are lost to transient Wi-Fi noise. BBR builds an explicit physical model of the network by measuring maximum delivery rate and minimum round-trip time, pacing packets to keep queues empty and sustaining high throughput on lossy networks without bufferbloat.",
        rfcOrSourceReference: "IETF RFC 9000 (QUIC: A UDP-Based Multiplexed and Secure Transport) & RFC 9114 (HTTP/3)"
      }
    ]
  },

  'reverse-proxy-load-balancing': {
    interviewCrossQuestions: [
      {
        question: "How does Nginx achieve 100,000+ concurrent connections on a single server, and what is the difference between epoll and select/poll?",
        answer: "Traditional web servers (like Apache MPM Prefork) used a thread-per-connection model where OS context switching, thread stack allocations (typically 2MB-8MB per thread), and memory thrashing limited concurrency to a few thousand clients. Nginx uses an asynchronous, single-threaded (per CPU core) event loop powered by OS I/O multiplexing: `epoll` on Linux or `kqueue` on BSD. With `select`/`poll`, the kernel iterates over an O(N) array of all file descriptors to check readiness. With `epoll` (epoll_create, epoll_ctl, epoll_wait), the kernel uses an internal red-black tree to track descriptors and a ready-list linked list populated by hardware interrupts, providing O(1) event notification regardless of total connection count.",
        difficulty: "advanced",
        whyAsked: "Examines low-level OS kernel primitives, system call complexity, and high-concurrency architecture."
      },
      {
        question: "Compare Layer 4 (Transport) vs Layer 7 (Application) load balancing. When would you choose Envoy or HAProxy over an AWS NLB?",
        answer: "Layer 4 (L4) load balancing operates at the TCP/UDP layer without decrypting or parsing the payload. It routes packets based on IP address and TCP port (e.g. AWS NLB, IPVS). It delivers ultra-high throughput (millions of packets/sec) with sub-millisecond latency and zero TLS decryption CPU overhead. Layer 7 (L7) load balancing operates at the application layer: it decrypts TLS, parses HTTP headers, cookies, and URL paths (e.g. Envoy, Nginx, ALB). L7 is required for path-based routing (/api/checkout vs /api/search), header-based canary deployments, rate limiting, and sticky sessions, but incurs TLS decryption and buffer parsing compute costs.",
        difficulty: "advanced",
        whyAsked: "Core architectural decision interviewers use to test trade-offs between raw throughput and application-aware routing."
      },
      {
        question: "How does Consistent Hashing work in load balancing, and why is it preferred over `hash(key) % N` for caching clusters?",
        answer: "In a naive modulo hash `hash(key) % N`, adding or removing a single server node changes the divisor from N to N+1 or N-1. This causes nearly 100% (specifically N/(N+1)) of all cache keys to map to different servers, resulting in a catastrophic cache stampede that overwhelms backend databases. Consistent Hashing maps both servers and cache keys onto an abstract 360-degree ring (0 to 2^32-1). Keys are assigned to the first server encountered moving clockwise. When a server is added or removed, only K/N keys are remapped on average. To ensure uniform load distribution and avoid hotspots, each physical server is represented by 100-200 'virtual nodes' placed pseudo-randomly around the ring.",
        difficulty: "staff",
        whyAsked: "Tests distributed systems partitioning, caching resiliency, and mathematical algorithms."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Netflix Global Ingress with Envoy Proxy",
        architecture: "Envoy acts as the front-door L7 edge proxy. It terminates TLS, evaluates JWT headers for authentication, performs rate limiting via a gRPC ratelimit service, and routes traffic dynamically to regional microservices based on canary routing tags.",
        impact: "Processes over 2 million RPS with dynamic traffic shifting and sub-second health-check failover."
      },
      {
        scenario: "Sticky WebSocket Gateway with Consistent Hashing",
        architecture: "Nginx load balancer hashes client user IDs to pin them to the same real-time gateway instance. If an instance crashes, only the users connected to that specific instance migrate clockwise to the neighboring node; all other connections remain undisturbed.",
        impact: "Eliminated cross-node broadcast messaging overhead by 70%."
      }
    ],
    howToExplain: {
      opening: "A reverse proxy acts as an intermediary between public clients and private backend services, providing SSL termination, caching, compression, and request routing. Load balancing distributes traffic across backend pools using Layer 4 connection-level or Layer 7 content-aware routing algorithms.",
      keyPoints: [
        "Concurrency Model: Event-driven non-blocking I/O (`epoll`/`kqueue`) scales to 100K+ connections on minimal RAM.",
        "L4 vs L7: L4 routes raw TCP packets for raw speed; L7 inspects HTTP headers, paths, and cookies for intelligent routing.",
        "Balancing Algorithms: Round Robin, Least Connections, Weighted Response Time, and Consistent Hashing for stateful affinity.",
        "Resilience: Passive and active health checks, circuit breaking, and keep-alive backend connection pooling."
      ],
      closingImpression: "Selecting between L4 and L7 is a deliberate trade-off between throughput and packet efficiency versus intelligent application routing and security policy enforcement.",
      analogies: "L4 is an airport runway controller directing planes to open gates based strictly on flight numbers and gate availability. L7 is customs and passport control, inspecting baggage and passports to direct passengers to specific specialized terminals."
    },
    commonMistakes: [
      {
        mistake: "Placing SSL termination on every individual internal microservice.",
        whyWrong: "Internal microservices waste significant CPU on repeated TLS handshakes; reverse proxies should terminate external TLS and communicate over private VPC networks or lightweight mTLS.",
        correctApproach: "Terminate public TLS at the edge reverse proxy/ingress controller to simplify certificate rotation and offload cryptographic operations from application nodes."
      }
    ],
    followUpDeepDive: [
      {
        question: "What is SO_REUSEPORT in Linux socket programming, and how does Nginx use it to eliminate accept mutex contention?",
        deepDiveAnswer: "Prior to Linux 3.9, multiple worker processes had to fight over a single listening socket via an accept mutex, leading to lock contention and thundering herd wakeups. `SO_REUSEPORT` allows multiple independent worker processes to bind to the exact same IP and port; the Linux kernel distributes incoming SYN packets across workers using an in-kernel round-robin hash, completely eliminating user-space lock contention.",
        rfcOrSourceReference: "Linux kernel commit c617f398edd0 (net: SO_REUSEPORT implementation) & Nginx Architecture Guide"
      }
    ]
  },

  'docker-multistage-builds': {
    interviewCrossQuestions: [
      {
        question: "How do Docker Multi-Stage builds work, and what is the difference between build-time layers and runtime layers?",
        answer: "Every instruction in a Dockerfile (RUN, COPY, ADD) creates an immutable read-only layer in the image. In single-stage builds, compilers, build toolchains (gcc, node-gyp, python), devDependencies, and test suites are baked permanently into the final image, bloating images to 1-2GB and expanding the CVE attack surface. Multi-stage builds use multiple `FROM` instructions in a single Dockerfile. Intermediate stages compile assets and run linters. The final runtime stage starts with a pristine, minimal base image (e.g. `node:alpine` or `gcr.io/distroless/nodejs`) and selectively copies only the compiled production artifacts using `COPY --from=builder /app/dist /app/dist`. The intermediate build layers and compiler toolchains are discarded from the final image.",
        difficulty: "medium",
        whyAsked: "Assesses production DevOps standards, image footprint minimization, and cloud cost efficiency."
      },
      {
        question: "Why should you NEVER run containerized Node.js applications as `root` (UID 0), and how do you configure proper user isolation?",
        answer: "By default, Docker executes processes inside containers as UID 0 (root). If an attacker exploits a remote code execution (RCE) vulnerability in an npm dependency or a container escape vulnerability (e.g. Dirty COW or runc CVEs), they gain root privileges on the underlying host OS. Best practice mandates creating an unprivileged user or using the built-in `node` user: `USER node` in the Dockerfile. Furthermore, Kubernetes manifests must enforce `securityContext: runAsNonRoot: true`, `readOnlyRootFilesystem: true`, and drop all Linux capabilities (`drop: ['ALL']`).",
        difficulty: "advanced",
        whyAsked: "Crucial web security and container hardening question for senior engineers."
      },
      {
        question: "What is the PID 1 zombie process problem in Docker, and why is `dumb-init` or `tini` needed for Node.js?",
        answer: "In Linux, PID 1 (init) is responsible for two critical tasks: 1) Reaping zombie orphan child processes when their parent terminates. 2) Handling OS signals (SIGTERM, SIGINT) and forwarding them to child processes. Node.js was not designed to run as PID 1; by default, it does not reap adopted zombie processes, leading to PID exhaustion over time. Furthermore, Node.js ignores SIGTERM by default when run as PID 1, preventing graceful shutdown when Kubernetes scales down a pod (leading to Kubernetes issuing a violent SIGKILL after 30 seconds). Using an init wrapper like `dumb-init` or Docker's `--init` (tini) ensures clean signal forwarding and automatic zombie reaping.",
        difficulty: "staff",
        whyAsked: "Separates senior engineers who understand Linux process semantics from junior container users."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Next.js / Node.js Production Docker Optimization",
        architecture: "Stage 1 (deps): Installs full dependencies with npm ci. Stage 2 (builder): Compiles TypeScript and runs Next.js build. Stage 3 (runner): Minimal Google Distroless Node image, copying only `.next/standalone` and `node_modules`. Runs as unprivileged user `nodejs` with dumb-init.",
        impact: "Reduced container image size from 1.4GB to 76MB; deployment download time dropped from 45s to 3s."
      }
    ],
    howToExplain: {
      opening: "Docker multi-stage builds separate the build environment from the execution environment in a single Dockerfile, ensuring that development dependencies, compilers, and source files never enter production container images.",
      keyPoints: [
        "Layer Caching: Order instructions from least-frequently changed (package.json) to most-frequently changed (source code).",
        "Minimal Runtimes: Use Alpine or Distroless to eliminate unnecessary shells, package managers, and vulnerable binaries.",
        "Security: Enforce non-root execution (`USER node`) and drop Linux capabilities.",
        "Process Management: Use `dumb-init` or `tini` for PID 1 signal forwarding and zombie process reaping."
      ],
      closingImpression: "A production container should be an immutable, minimalist appliance containing only the executable binary and its production runtime dependencies.",
      analogies: "A multi-stage build is like building a house with scaffolding and cranes, but removing all the scaffolding before the family moves in so they only live in the finished house."
    },
    commonMistakes: [
      {
        mistake: "Copying all project source code before running `npm install` in the Dockerfile.",
        whyWrong: "Any single character edit in any source file invalidates Docker's layer cache for `COPY . .`, forcing a full, slow re-run of `npm install` on every single build.",
        correctApproach: "Copy `package.json` and `package-lock.json` first, run `npm ci`, and only then copy the remaining application source code."
      }
    ],
    followUpDeepDive: [
      {
        question: "How do Distroless container images prevent shell injection attacks?",
        deepDiveAnswer: "Distroless images contain only your application runtime (e.g. Node.js binary and libc/libssl). They contain no package manager (apt/apk), no shell (`/bin/sh`, `/bin/bash`), and no core utilities (curl, wget). Even if an attacker executes arbitrary code via command injection, they cannot spawn an interactive shell or download external malicious payload binaries.",
        rfcOrSourceReference: "GoogleContainerTools/distroless & OCI Image Specification v1.0"
      }
    ]
  },

  'deployment-strategies-blue-green-canary': {
    interviewCrossQuestions: [
      {
        question: "Compare Blue-Green vs Canary vs Rolling deployments across cost, rollback speed, and database schema compatibility.",
        answer: "1) Blue-Green: Runs two identical production environments (Blue=active, Green=idle). New release deploys to Green; router/DNS flips 100% traffic to Green. Pros: Instant zero-downtime cutover and instant 1-click rollback. Cons: Doubles infrastructure costs; risky if database schema has breaking changes. 2) Canary: Deploys the new version to a small subset of instances (e.g. 2%), routing 2% of real user traffic via service mesh (Envoy/Istio). Monitors error rates and p99 latency; if green, scales up to 10%, 50%, 100%. Pros: Minimal blast radius; catches production bugs before all users are impacted. Cons: Requires traffic splitting infrastructure; complex telemetry. 3) Rolling Update: Gradually replaces old pods with new pods one by one. Pros: Zero additional infrastructure cost. Cons: Both versions run simultaneously for extended periods; rollback requires another rolling deployment.",
        difficulty: "advanced",
        whyAsked: "Core architectural question assessing reliability engineering, cost awareness, and release safety."
      },
      {
        question: "How do you handle Database Migrations during zero-downtime deployments without locking tables or breaking running older instances?",
        answer: "Zero-downtime deployments mandate the Expand and Contract (Parallel Run) pattern across 3 distinct phases: 1) Expand: Deploy backward-compatible database schema changes (e.g. add a new nullable column `phone_number_v2`). The existing application version continues reading the old column. 2) Deploy: Roll out the new application version (Blue-Green or Canary) which writes to both old and new columns and reads from the new column. Run a background data backfill script. 3) Contract: Once all legacy application instances are terminated and data is synchronized, deploy a final migration to drop the old column `phone_number`. Never execute destructive schema migrations (e.g. renaming columns or dropping constraints) in the same release as code changes.",
        difficulty: "staff",
        whyAsked: "Separates engineers who understand continuous delivery at scale from those whose deployments require scheduled maintenance windows."
      },
      {
        question: "What metrics should trigger an Automated Canary Rollback, and what is the difference between p99 latency and mean latency in detection?",
        answer: "Canary rollbacks must be driven by automated telemetry thresholds: 1) HTTP 5xx error rate (e.g. >0.1% increase over baseline). 2) Application unhandled exceptions via Sentry. 3) P99/P95 latency percentiles. Mean (average) latency hides catastrophic tail degradations; if 1% of users experience 30-second database timeouts while 99% get 10ms responses, the mean remains seemingly healthy (~310ms), but the service is deeply broken. P99 reflects the worst 1% user experience and immediately detects threadpool starvation, database lock contention, or memory GC pauses.",
        difficulty: "advanced",
        whyAsked: "Tests understanding of statistical observability and automated safety guardrails."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Automated Canary Analysis at Netflix (Kayenta)",
        architecture: "New release deploys alongside a control cluster running the baseline version. Kayenta evaluates 50+ health metrics (CPU, GC pauses, error rates, p99 latency) over 60 minutes. If the statistical confidence score drops below 80, the canary automatically terminates and traffic returns to baseline.",
        impact: "Prevented over 120 production-wide outages per year from reaching 100% of subscribers."
      }
    ],
    howToExplain: {
      opening: "Deployment strategies dictate how new software is released to users while preserving system availability. The choice between Blue-Green, Canary, and Rolling updates depends on cost tolerance, rollback speed, and traffic routing sophistication.",
      keyPoints: [
        "Blue-Green: Instant switchover and instant rollback, but requires 2x idle infrastructure.",
        "Canary: Incremental percentage-based traffic routing, minimizing blast radius through automated metric gating.",
        "Rolling: Resource-efficient pod-by-pod replacement in Kubernetes via `maxSurge` and `maxUnavailable`.",
        "Database Migrations: Always follow the Expand and Contract pattern across backward-compatible releases."
      ],
      closingImpression: "A deployment strategy is only as good as its automated rollback trigger; without automated telemetry gating, manual human verification will fail under pressure.",
      analogies: "Blue-Green is opening a new bridge right next to an old bridge and swinging the traffic cones over instantly. Canary is sending a few test vehicles across the bridge with sensors before allowing full commuter traffic."
    },
    commonMistakes: [
      {
        mistake: "Renaming a database column in the same deployment step as updating the application code.",
        whyWrong: "During a rolling or canary update, both old and new code versions run concurrently; the old version crashes when it cannot find the old column, and rolling back immediately crashes the new version.",
        correctApproach: "Decouple schema changes into Add (Expand), Write to both, Backfill, Read from new, and Drop (Contract) phases."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does Envoy Proxy implement weighted traffic splitting for Canary releases?",
        deepDiveAnswer: "In Envoy's route configuration, a route can specify `weighted_clusters`. For example, `cluster_production` has weight 95 and `cluster_canary` has weight 5. Envoy hashes request attributes or uses an in-memory random distribution to split requests precisely at the connection or request level without DNS caching delays.",
        rfcOrSourceReference: "Envoy Proxy Route Configuration (weighted_clusters) & Netflix Kayenta Canary Specification"
      }
    ]
  },

  'ci-cd-pipelines-github-actions': {
    interviewCrossQuestions: [
      {
        question: "How do you secure secrets in GitHub Actions and prevent unauthorized workflows or malicious PRs from exfiltrating credentials?",
        answer: "1) Never use long-lived cloud credentials (e.g. AWS Access Key / Secret Key). Instead, configure OIDC (OpenID Connect) federation: GitHub Actions requests a short-lived OIDC JWT token which AWS/GCP IAM validates and exchanges for a temporary 15-minute STS credential scoped to the specific repository and branch. 2) For pull requests from public forks, GitHub Actions defaults to `pull_request` triggers where secrets are strictly omitted; never use `pull_request_target` carelessly with an explicit `checkout` of untrusted PR code, as that grants malicious PRs access to production repository secrets. 3) Enforce environment protection rules with required manual approval before deploying to production.",
        difficulty: "staff",
        whyAsked: "High-priority security question addressing software supply chain attacks and CI/CD credential exfiltration."
      },
      {
        question: "How do you optimize a CI/CD pipeline to reduce execution time from 25 minutes to under 3 minutes?",
        answer: "1) Dependency Caching: Cache `~/.npm` or `node_modules` keyed by `package-lock.json` hash. 2) Pipeline Parallelization: Split linting, unit tests, end-to-end tests, and security scans into independent concurrent matrix jobs. 3) Test Sharding: Use Jest or Playwright test sharding (`--shard=1/4`) across 4 parallel runner nodes. 4) Remote Build Caching: Use tools like Turborepo or Nx to cache build and test outputs; unchanged packages execute in 0 milliseconds. 5) Multi-stage Docker Caching: Utilize GitHub Actions cache backend (`type=gha`) for Docker BuildKit layer reuse.",
        difficulty: "advanced",
        whyAsked: "Tests developer productivity engineering and pipeline parallelization optimization."
      },
      {
        question: "What is SLSA (Supply-chain Levels for Software Artifacts) and why are cryptographic artifact attestations important?",
        answer: "SLSA is a security framework that protects against tampering across the build pipeline. Even if code is reviewed, a compromised CI runner could inject malware into the compiled Docker image or npm package. SLSA Level 3 requires provenance generation: the build platform cryptographically signs the generated artifact (e.g. using Sigstore/Cosign) with an attestation verifying the exact git commit, build workflow, and repository that produced it. Production deployment systems verify this cryptographic signature before admitting the container into Kubernetes.",
        difficulty: "staff",
        whyAsked: "Evaluates modern DevSecOps standards and zero-trust build systems."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Zero-Secret AWS Deployments with OIDC Federation",
        architecture: "GitHub Actions workflow requests an ambient OIDC token from GitHub's token service. AWS IAM AssumeRoleWithWebIdentity validates the token's `sub` claim (matching `repo:org/app:ref:refs/heads/main`) and assumes a scoped IAM role. Zero static AWS keys are stored in GitHub repository secrets.",
        impact: "Completely eliminated credential leak risks from stale developer API keys."
      }
    ],
    howToExplain: {
      opening: "A production CI/CD pipeline is the automated assembly line for software delivery. It validates correctness through fast feedback loops, builds immutable artifacts, enforces security policies, and deploys to target environments with zero human intervention.",
      keyPoints: [
        "Fast Feedback: Parallel matrix jobs, dependency caching, and test sharding reduce feedback times to minutes.",
        "Security & OIDC: Zero long-lived cloud keys; short-lived federated tokens via OpenID Connect.",
        "Artifact Immutability: Build once, test, and promote the exact same container image digest across Staging and Production.",
        "Gated Approvals: Branch protection rules, required status checks, and environment review approvals."
      ],
      closingImpression: "CI/CD should be treated as production code: version-controlled, tested, monitored for performance, and locked down with least-privilege security controls.",
      analogies: "CI/CD is like an automated vehicle crash test and quality inspection facility; every vehicle is rigorously tested on the factory line before it is cleared for the public highway."
    },
    commonMistakes: [
      {
        mistake: "Rebuilding container images separately for Staging and Production.",
        whyWrong: "Building twice creates two different image digests with potential dependency drift or timing discrepancies; what passed testing in staging is not identical to what runs in production.",
        correctApproach: "Build and sign the container image once in CI, push it to the registry, and deploy that exact same immutable cryptographic SHA digest across Staging and Production."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does GitHub Actions OIDC token claim validation prevent unauthorized fork attacks?",
        deepDiveAnswer: "The GitHub OIDC token contains JWT claims such as `repository`, `ref`, and `actor`. AWS IAM trust policies enforce conditions like `\"token.actions.githubusercontent.com:sub\": \"repo:myorg/myapp:ref:refs/heads/main\"`. If an attacker forks the repository and runs the workflow, the `sub` claim will reflect `repo:attacker/myapp`, causing AWS IAM to reject the token exchange instantly.",
        rfcOrSourceReference: "OpenID Connect Core 1.0 & GitHub Actions OIDC Documentation"
      }
    ]
  },

  'rendering-strategies-csr-ssr-rsc': {
    interviewCrossQuestions: [
      {
        question: "Break down the architectural trade-offs between CSR, SSR, SSG, ISR, and React Server Components (RSC).",
        answer: "1) CSR (Client-Side Rendering): Server returns empty HTML shell; browser downloads JavaScript, fetches data, and renders UI. Pros: Zero server rendering CPU; instant subsequent page navigations. Cons: Slow FCP/LCP; blank screen on slow mobile devices. 2) SSR (Server-Side Rendering): Server renders HTML on every request. Pros: Fast FCP and optimal SEO. Cons: High server CPU load; Time-to-Interactive (TTI) delayed by heavy hydration. 3) SSG (Static Site Generation): HTML rendered once at build time. Pros: Sub-10ms TTFB via CDN edge caching. Cons: Stale data; build times scale linearly with page count. 4) ISR (Incremental Static Regeneration): CDN serves static HTML and regenerates pages in the background on traffic via `stale-while-revalidate`. 5) RSC (React Server Components): Server renders components to a streaming binary Flight format. Zero server code or heavy libraries (markdown parsers, date formatters) ship in the client bundle; client merges server UI directly into the existing client DOM state without destructive re-mounting.",
        difficulty: "advanced",
        whyAsked: "The definitive full-stack frontend architecture question covering performance, scalability, and UX."
      },
      {
        question: "What is the Hydration Mismatch problem in SSR, and why does hydration make SSR expensive?",
        answer: "In traditional SSR, the server generates HTML strings and sends them to the browser. The browser displays the HTML immediately (fast FCP), but it is completely non-interactive. The browser must download the entire JavaScript bundle, parse it, execute it, recreate the Virtual DOM tree in memory, and walk the entire DOM to attach event listeners ('Hydration'). A Hydration Mismatch occurs when the server-rendered HTML does not match the client-rendered output (e.g. using `window`, `localStorage`, or localized timestamps). React detects the discrepancy, logs an error, and in worst cases tears down the server DOM and recreates it from scratch, destroying performance and causing visible UI flicker.",
        difficulty: "advanced",
        whyAsked: "Tests understanding of the DOM reconciliation boundary between server and client."
      },
      {
        question: "How does the RSC Flight Protocol stream UI to the client, and why is it superior to sending raw JSON or raw HTML?",
        answer: "Raw HTML cannot preserve client component state (e.g. form inputs, active modals) during re-renders. Raw JSON requires the client to download the component template and rendering logic in the JS bundle. The RSC Flight wire format is a streaming, newline-delimited format containing: 1) Client component module references (`$L1`), 2) Serialized server component element trees, and 3) Streamed Suspense chunks. The client reconciles this wire format directly into the React tree, streaming completed UI sections without waiting for the entire page to finish data fetching and with zero hydration cost for server-only components.",
        difficulty: "staff",
        whyAsked: "Evaluates cutting-edge Next.js / React 19 architecture and streaming wire protocols."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Global E-Commerce Product Listing at Vercel/Next.js Scale",
        architecture: "Product layout and marketing navigation use SSG/ISR cached on global CDN. Product details use React Server Components to fetch from internal database with zero client JS overhead. Stock availability and Add-to-Cart button use Client Components (`'use client'`) with selective hydration.",
        impact: "Reduced client JavaScript bundle by 54%; improved Core Web Vitals (INP and LCP) by 38%."
      }
    ],
    howToExplain: {
      opening: "Rendering strategies govern where and when data is transformed into UI: on the client at runtime (CSR), on the server per request (SSR), at build time (SSG), asynchronously in the background (ISR), or split along the server-client component boundary (RSC).",
      keyPoints: [
        "CSR: Interactive apps (dashboards, authenticated tools) where SEO is secondary.",
        "SSR: Dynamic, user-personalized pages requiring instant FCP and SEO.",
        "SSG/ISR: High-traffic public content (blogs, documentation, e-commerce catalog) where TTFB must be sub-50ms.",
        "RSC: The modern hybrid; keeps heavy dependencies and data fetching on the server while streaming interactive islands to the client."
      ],
      closingImpression: "Architecture is not one-size-fits-all; modern systems blend static edge caching for shells with streaming server components for personalized data.",
      analogies: "CSR is shipping raw ingredients to the customer's house for them to cook. SSR is cooking the meal in a restaurant kitchen and delivering it hot. SSG is buying canned food made at the factory last week. RSC is having the chef cook the steak in the kitchen while you mix your own drink at the table."
    },
    commonMistakes: [
      {
        mistake: "Assuming Server-Side Rendering (SSR) always improves page load speed.",
        whyWrong: "SSR shifts computation to the origin server. If database queries or external API calls take 800ms, the user stares at a blank screen waiting for TTFB. Furthermore, hydration can lock the main thread on mobile devices, degrading Time-to-Interactive.",
        correctApproach: "Combine SSR with streaming Suspense so the page shell and cached content render instantly while slow data fetches stream in progressively."
      }
    ],
    followUpDeepDive: [
      {
        question: "How does React 18 Selective Hydration leverage HTML streaming and Suspense?",
        deepDiveAnswer: "With `renderToPipeableStream`, React streams HTML chunks wrapped in Suspense boundaries immediately. When HTML arrives, React begins hydrating completed subtrees before the rest of the page has finished downloading. If a user clicks on an unhydrated component, React prioritizes hydrating that specific subtree immediately to respond to user input.",
        rfcOrSourceReference: "React Working Group: Architectural Overview of React 18 Streaming SSR"
      }
    ]
  },

  'cdn-cache-control-headers': {
    interviewCrossQuestions: [
      {
        question: "Explain the exact semantics of `Cache-Control: public, max-age=31536000, immutable`. Where and when should it be used?",
        answer: "`public` allows both browser and shared intermediate caches (CDNs, reverse proxies) to store the response. `max-age=31536000` caches the asset for 1 full year (31,536,000 seconds). `immutable` indicates that the resource's content will NEVER change during its lifetime; when the user refreshes or navigates, the browser does not even send a conditional `If-Modified-Since` or `If-None-Match` 304 revalidation request. This header should ONLY be used for content-hashed assets (e.g. `main.a8f9c1.js`, `styles.99b2e3.css`). Using it on `index.html` is disastrous because users would never receive code updates.",
        difficulty: "medium",
        whyAsked: "Tests practical production HTTP caching standards and prevention of cache poisoning."
      },
      {
        question: "How does `stale-while-revalidate` (RFC 5861) eliminate latency for dynamic API responses?",
        answer: "With `Cache-Control: max-age=60, stale-while-revalidate=600`: During the first 60 seconds, requests are served fresh directly from cache. Between 60 and 660 seconds (the stale window), when a request arrives, the CDN or browser immediately returns the cached stale response with 0ms latency, while asynchronously in the background firing a revalidation request to the origin server to refresh the cache. Users never experience origin latency, and subsequent requests receive the newly cached content.",
        difficulty: "advanced",
        whyAsked: "High-value caching pattern for modern web performance and e-commerce applications."
      },
      {
        question: "How do Cache-Tags / Surrogate-Keys work, and how do they enable instant purge of 100,000 pages on a CMS update?",
        answer: "URLs are often an ineffective way to invalidate cache (e.g. a product price change affects the product page, category listing, homepage, and search results). When origin servers generate responses, they attach a `Surrogate-Key` header (e.g. `Surrogate-Key: product-1234 category-electronics`). The CDN strips this header before sending to the client, but indexes the cached objects by those tags. When product 1234 is updated in the CMS, the backend sends a single API call to the CDN: `PURGE /tags/product-1234`. The CDN instantly invalidates all associated URLs globally across hundreds of edge locations in under 150ms.",
        difficulty: "staff",
        whyAsked: "Tests understanding of modern CDN edge architecture (Fastly, Cloudflare, Akamai) at enterprise scale."
      }
    ],
    realWorldUseCases: [
      {
        scenario: "Global Breaking News Site (NYTimes, BBC)",
        architecture: "Article pages cached at CDN edge with `Cache-Control: s-maxage=30, stale-while-revalidate=300`. CDN absorbs 99.8% of traffic spikes during breaking news. Editorial CMS triggers instantaneous Cache-Tag purges for immediate correction propagation.",
        impact: "Origin server capacity handled 50x traffic surges with zero downtime and sub-20ms edge latency."
      }
    ],
    howToExplain: {
      opening: "HTTP caching operates on a two-tier strategy: immutable, permanently-cached assets referenced by content hashes, and dynamic HTML/API responses managed via short TTLs, `stale-while-revalidate`, and tag-based edge invalidation.",
      keyPoints: [
        "Content Hashing: Asset files (JS/CSS) get `max-age=1year, immutable`; `index.html` gets `no-cache` to force revalidation.",
        "Browser vs Shared Caches: `max-age` dictates browser cache; `s-maxage` overrides for shared edge CDNs.",
        "Asynchronous Revalidation: `stale-while-revalidate` returns cached data immediately while updating in the background.",
        "Targeted Invalidation: Surrogate-Keys / Cache-Tags decouple invalidation from strict URL paths."
      ],
      closingImpression: "The fastest request is the one that never hits your origin server. Proper HTTP headers turn global CDNs into high-speed application shields.",
      analogies: "Immutable caching is like printing a book with an ISBN number; once published, it never changes. Stale-while-revalidate is like a convenience store clerk handing you the morning newspaper from the stack while their delivery driver restocks the new edition in the background."
    },
    commonMistakes: [
      {
        mistake: "Setting `Cache-Control: max-age=3600` on the root `index.html` file.",
        whyWrong: "When a new deployment occurs with new hashed asset filenames, users who visited within the last hour have the old `index.html` cached; they continue requesting old/deleted JS chunks, leading to runtime 404 errors and broken apps.",
        correctApproach: "Always set `Cache-Control: no-cache` or `no-store` on `index.html` so the browser always verifies freshness against the origin or CDN."
      }
    ],
    followUpDeepDive: [
      {
        question: "What is the difference between `no-cache` and `no-store` in HTTP Cache-Control?",
        deepDiveAnswer: "`no-store` forbids the browser and CDN from storing any copy of the response on disk or in memory (strictly required for sensitive banking data). `no-cache` allows the browser to store the response, but mandates that the browser MUST revalidate with the origin (via ETag / If-None-Match) before using it. If the content has not changed, the origin returns HTTP 304 Not Modified without sending the body.",
        rfcOrSourceReference: "IETF RFC 7234 (Hypertext Transfer Protocol -- Caching) & RFC 5861 (HTTP Cache-Control Extensions for Stale Content)"
      }
    ]
  }
};
