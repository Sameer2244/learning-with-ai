// Curated System Design & Web Architecture Topics for Modern Developers
// Covers Server Fundamentals, Deployments, CI/CD, Cloud, Databases, Caching,
// API Design, Security, Real-Time Web, Observability, and Scalability.

module.exports = [
  {
    id: "sys-servers-networking",
    category: "1. Server Fundamentals & Web Networking",
    badge: "Servers & Network",
    description: "DNS resolution, TCP/IP vs UDP, TLS 1.3 handshake, HTTP/1.1 vs HTTP/2 vs HTTP/3 (QUIC), and reverse proxies (Nginx).",
    topics: [
      {
        id: "dns-tcp-tls-lifecycle",
        title: "DNS Resolution, TCP Handshake & TLS 1.3 Lifecycle",
        tag: "Networking",
        summary: "Step-by-step lifecycle of what happens when a user types a URL into the browser until the first encrypted byte is sent.",
        importance: "Understanding connection latency, TCP slow start, and TLS handshakes is critical for optimizing Time to First Byte (TTFB) and debugging production network bottlenecks.",
        mentalModel: "Browser Cache -> OS Resolver -> Recursive DNS Server -> Root / TLD / Authoritative DNS -> IP resolved -> TCP 3-Way Handshake (SYN, SYN-ACK, ACK) -> TLS 1.3 1-RTT Handshake (ClientHello + KeyShare -> ServerHello + Finished).",
        traps: "Assuming DNS lookups are free; ignoring DNS TTL values; failing to leverage TLS 1.3 0-RTT session resumption for repeat visitors.",
        interviewQuestions: [
          "Explain the complete lifecycle from typing a URL in the browser to the server processing the HTTP request.",
          "How did TLS 1.3 reduce handshake latency compared to TLS 1.2?"
        ],
        defaultGuide: `## 🌐 The Complete Connection Lifecycle

When a client initiates an HTTPS request to \`https://api.example.com/v1/users\`:

\`\`\`
1. DNS Resolution:
   Browser Cache ──> OS Hosts File ──> Local DNS Resolver ──> Root (.) ──> TLD (.com) ──> Authoritative DNS

2. TCP Connection (3-Way Handshake):
   Client ──[ SYN ]──────────────> Server
   Client <─[ SYN-ACK ]─────────── Server
   Client ──[ ACK + Data ]───────> Server

3. TLS 1.3 Handshake (1-RTT):
   Client ──[ ClientHello + Supported Keyshares ]─────────> Server
   Client <─[ ServerHello + Chosen Keyshare + Finished ]── Server
   (Secure Symmetric AES-GCM Channel Established!)
\`\`\`

### 1. DNS Resolution Mechanics
- **Recursive Resolver**: Queries up the DNS tree on the client's behalf.
- **TTL (Time to Live)**: Dictates how long intermediate caches hold the DNS record. Short TTLs (60s) allow rapid failover; long TTLs (86400s) minimize DNS lookup latency.
- **DNS Anycast**: Routes users to the topologically closest DNS nameserver using BGP routing.

### 2. TLS 1.2 vs TLS 1.3 Handshake Latency
- **TLS 1.2 (2-RTT)**: Required 2 full round trips (ClientHello, ServerHello/Certificate, KeyExchange, Finished) before application data could be sent.
- **TLS 1.3 (1-RTT)**: Client sends its Diffie-Hellman key share in the very first \`ClientHello\`. Secure data can be sent after just 1 round trip.
- **TLS 1.3 0-RTT (Early Data)**: Repeat visitors can send encrypted HTTP requests in the initial packet using a pre-shared key (PSK).`
      },
      {
        id: "http-evolution-quic",
        title: "HTTP Evolution: HTTP/1.1 vs HTTP/2 Multiplexing vs HTTP/3 (QUIC)",
        tag: "Protocols",
        summary: "Head-of-Line blocking, binary framing, multiplexed streams over single TCP connections, and UDP-based QUIC.",
        importance: "Selecting the right protocol and configuring server transport drastically impacts web performance on mobile networks and asset-heavy applications.",
        mentalModel: "HTTP/1.1: 1 request per TCP connection (or 6 parallel connections per domain). HTTP/2: Multiple bi-directional streams multiplexed over 1 TCP connection. HTTP/3: Multiplexing over UDP via QUIC, completely eliminating TCP Head-of-Line blocking.",
        traps: "Domain sharding (e.g. assets1.cdn.com, assets2.cdn.com) is an HTTP/1.1 anti-pattern that hurts HTTP/2 and HTTP/3 performance by splitting TCP/QUIC connection state.",
        interviewQuestions: [
          "What is Head-of-Line (HoL) blocking, and how does HTTP/3 solve it compared to HTTP/2?",
          "Why did HTTP/3 switch from TCP to UDP?"
        ],
        defaultGuide: `## 🚀 HTTP Evolution: 1.1 -> 2 -> 3

### Comparison Matrix
| Feature | HTTP/1.1 | HTTP/2 | HTTP/3 |
| :--- | :--- | :--- | :--- |
| **Transport Layer** | TCP | TCP | UDP (via QUIC) |
| **Format** | Plain Text | Binary Framing | Binary |
| **Multiplexing** | ❌ (1 req/conn) | ⭐ Yes (streams) | ⭐⭐ Yes (independent streams) |
| **Head-of-Line Blocking** | At HTTP layer | At TCP layer (packet loss) | ❌ Eliminated completely |
| **Handshake Latency** | 2-3 RTT (TCP + TLS) | 2-3 RTT (TCP + TLS) | 0-1 RTT (QUIC + TLS 1.3 combined) |
| **Connection Migration** | ❌ (IP:Port bound) | ❌ (IP:Port bound) | ⭐ Yes (Connection ID based) |

### The TCP Head-of-Line Trap in HTTP/2
In HTTP/2, all streams travel over a single TCP socket. If a single packet is dropped over Wi-Fi/cellular:
- TCP stops the entire pipeline while requesting a re-transmission of that single packet.
- **All streams are blocked**, even though data for other streams has already arrived!

### The HTTP/3 QUIC Solution
HTTP/3 runs on top of **QUIC (UDP)**. Each stream is completely independent at the transport layer. A dropped packet in Stream 2 does NOT block Stream 1 or Stream 3!`
      },
      {
        id: "reverse-proxy-load-balancing",
        title: "Reverse Proxies, Load Balancing & Nginx Architecture",
        tag: "Web Servers",
        summary: "Nginx event-driven architecture, reverse proxying, SSL termination, and load balancing algorithms (Round Robin, Least Connections, IP Hash).",
        importance: "Reverse proxies sit at the front door of all production web infrastructures, protecting origin servers, terminating TLS, and distributing traffic.",
        mentalModel: "Client connects to Reverse Proxy (Nginx / HAProxy / Cloudflare) -> Proxy terminates TLS, compresses responses, and forwards request via internal VPC to an upstream pool of application instances.",
        traps: "Confusing a Forward Proxy (protects and anonymizes the client) with a Reverse Proxy (protects, caches, and load-balances the backend servers).",
        interviewQuestions: [
          "Explain the difference between L4 (Transport) and L7 (Application) load balancing.",
          "How does Nginx's asynchronous event-driven worker architecture handle 50,000 concurrent connections with minimal RAM?"
        ],
        defaultGuide: `## 🛡️ Reverse Proxies & Load Balancing

\`\`\`
Clients (Internet)
   │
   ▼
[ Nginx Reverse Proxy / Load Balancer ] ──> SSL Termination, Gzip, Rate Limiting
   ├───> Upstream Node.js Instance 1 (Port 3001)
   ├───> Upstream Node.js Instance 2 (Port 3002)
   └───> Upstream Node.js Instance 3 (Port 3003)
\`\`\`

### Key Responsibilities of a Reverse Proxy
1. **SSL / TLS Termination**: Offloads expensive cryptographic handshakes from application servers.
2. **Load Balancing**: Distributes incoming requests across multiple app instances:
   - **Round Robin**: Sequential distribution.
   - **Least Connections**: Routes to the server currently handling the fewest active requests.
   - **IP Hash**: Consistently routes the same client IP to the same upstream (sticky sessions).
3. **Security & WAF**: Hides internal backend IP addresses, enforces rate-limiting, and blocks DDoS attacks.
4. **Static File Serving**: Serves HTML, JS, CSS, and images directly from disk using the \`sendfile\` system call without touching Node.js or Python.

### Minimal Production Nginx Configuration
\`\`\`nginx
upstream backend_nodes {
    least_conn;
    server 127.0.0.1:3001 max_fails=3 fail_timeout=10s;
    server 127.0.0.1:3002 max_fails=3 fail_timeout=10s;
}

server {
    listen 443 ssl http2;
    server_name api.example.com;

    ssl_certificate /etc/ssl/certs/bundle.crt;
    ssl_certificate_key /etc/ssl/private/privkey.pem;

    location / {
        proxy_pass http://backend_nodes;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
\`\`\``
      }
    ]
  },
  {
    id: "sys-deployment-cicd",
    category: "2. Deployments, Containers & CI/CD Pipelines",
    badge: "Deployments & DevOps",
    description: "Docker multi-stage builds, Blue-Green vs Canary deployments, Kubernetes architecture, GitHub Actions, and rollback strategies.",
    topics: [
      {
        id: "docker-multistage-builds",
        title: "Docker Multi-Stage Builds & Container Image Optimization",
        tag: "Containers",
        summary: "Shrinking production Docker container images from 1.5GB to 80MB using multi-stage builds, Alpine/Distroless bases, and layer caching.",
        importance: "Bloated container images slow down CI/CD builds, increase deployment times, waste bandwidth, and introduce hundreds of security vulnerabilities.",
        mentalModel: "Separate the Build Environment (Node.js, build tools, devDependencies, compilers) from the Runtime Environment (minimal Linux kernel + compiled output). Copy only the compiled dist artifacts to the final stage.",
        traps: "Leaving build tools, TypeScript compilers, and `node_modules` test dependencies inside the final production container image.",
        interviewQuestions: [
          "How do multi-stage Docker builds reduce container image size and eliminate security attack vectors?",
          "How does Docker layer caching work, and why should `package.json` be copied before the rest of the application code?"
        ],
        defaultGuide: `## 🐳 Production Docker Multi-Stage Build

### ❌ The Flawed Single-Stage Dockerfile (Size: ~1.4 GB)
\`\`\`dockerfile
FROM node:20
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
CMD ["node", "dist/server.js"]
\`\`\`
*(Leaves devDependencies, TypeScript, compilers, and source files in production!)*

### ✅ The Optimized Multi-Stage Dockerfile (Size: ~75 MB)
\`\`\`dockerfile
# Stage 1: Build & Compilation
FROM node:20-alpine AS builder
WORKDIR /app

# Cache dependencies layer
COPY package*.json ./
RUN npm ci

# Copy source and compile
COPY . .
RUN npm run build

# Stage 2: Minimal Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy only compiled output from builder
COPY --from=builder /app/dist ./dist

# Non-root security user
USER node
EXPOSE 3000

CMD ["node", "dist/server.js"]
\`\`\`

### Docker Layer Caching Strategy
Docker caches each instruction line. Put lines that change **least frequently** at the top (\`COPY package*.json\`, \`RUN npm ci\`) and lines that change **frequently** (\`COPY . .\`) near the bottom!`
      },
      {
        id: "deployment-strategies-blue-green-canary",
        title: "Deployment Strategies: Blue-Green vs Canary vs Rolling Updates",
        tag: "Deployments",
        summary: "Zero-downtime deployment patterns, traffic routing mechanisms, and automated instant rollback triggers.",
        importance: "Shipping code directly over running production instances causes downtime, dropped database connections, and user-facing 502 Bad Gateway errors.",
        mentalModel: "Blue-Green: Two identical environments; router flips 100% traffic instantly from Blue to Green. Canary: Slowly routes 5% -> 25% -> 100% of user traffic to the new version while monitoring error rates.",
        traps: "Failing to design backward-compatible database schema migrations before doing a Blue-Green deployment.",
        interviewQuestions: [
          "Compare Blue-Green deployments with Canary deployments in terms of infrastructure cost and risk mitigation.",
          "How do you handle database migrations during a rolling zero-downtime deployment?"
        ],
        defaultGuide: `## 🚀 Zero-Downtime Deployment Strategies

### 1. Rolling Deployment
- **Mechanism**: Incrementally replaces instances of version A with version B one-by-one.
- **Pros**: Zero extra infrastructure cost; smooth transitions.
- **Cons**: Version A and Version B run simultaneously during the rollout, requiring APIs and databases to be strictly backward-compatible.

### 2. Blue-Green Deployment
\`\`\`
                    [ Load Balancer / Router ]
                                │
                 ┌──────────────┴──────────────┐
                 ▼ (Active: 100%)              ▼ (Idle: 0%)
           [ Blue Cluster ]              [ Green Cluster ]
           Version 1.0 (Live)            Version 2.0 (Deploy & Test)
\`\`\`
- **Mechanism**: Spin up a complete duplicate cluster (Green) with Version 2.0. Run smoke tests on Green. Flip the router to point 100% traffic to Green.
- **Rollback**: Instant! If an issue occurs, flip router back to Blue in 1 second.
- **Trade-off**: Requires 2x server infrastructure during deployment.

### 3. Canary Deployment
- **Mechanism**: Route a tiny percentage of live traffic (e.g. 2% -> 10% -> 50% -> 100%) to the new version.
- **Metrics Gate**: CI monitors error rates, p99 latency, and crash logs. If error rates exceed 0.1%, automated rollback aborts the canary.`
      },
      {
        id: "ci-cd-pipelines-github-actions",
        title: "Production CI/CD Pipelines: Testing, Artifacts & Secrets Management",
        tag: "CI/CD",
        summary: "Architecting resilient automated CI/CD pipelines with linting, unit tests, integration tests, container builds, and deployment gates.",
        importance: "A broken or slow CI/CD pipeline bottlenecks the entire engineering team and allows breaking bugs to slip into production.",
        mentalModel: "Trigger (Push/PR) -> Parallel Jobs (Lint, Typecheck, Unit Test) -> Integration Test -> Build Docker Image -> Scan Vulnerabilities (Trivy) -> Deploy to Staging -> Smoke Tests -> Production Gate.",
        traps: "Storing production secrets or API keys in plain text in git repositories or hardcoding them in Dockerfiles.",
        interviewQuestions: [
          "How do you design a CI/CD pipeline that runs tests in under 5 minutes on large monorepos?",
          "How should production secrets be securely injected into deployed containers?"
        ],
        defaultGuide: `## ⚙️ Production CI/CD Pipeline Architecture

\`\`\`
[ Developer Git Push ]
         │
         ▼
[ Stage 1: Fast Parallel Verification ]
├── Job A: ESLint & Prettier check
├── Job B: TypeScript typecheck (\`tsc --noEmit\`)
└── Job C: Jest / Vitest Unit Tests
         │
         ▼
[ Stage 2: Containerization & Security Scan ]
├── Build multi-stage Docker image
├── Run \`trivy\` security vulnerability scanner
└── Push container to AWS ECR / GitHub Packages
         │
         ▼
[ Stage 3: Deployment & Verification ]
├── Deploy to Staging Environment
├── Run Cypress / Playwright E2E Smoke Tests
└── Deploy to Production via Canary Rollout
\`\`\`

### Secrets Management Best Practices
1. Never commit \`.env\` files to git.
2. Use **OIDC (OpenID Connect)** for GitHub Actions to authenticate with AWS/GCP without permanent hardcoded access keys.
3. Fetch secrets at runtime from cloud vaults (AWS Secrets Manager, HashiCorp Vault) rather than baking them into image layers.`
      }
    ]
  },
  {
    id: "sys-rendering-cdn",
    category: "3. Rendering Architecture & CDN Caching",
    badge: "Web Rendering & CDN",
    description: "CSR vs SSR vs SSG vs ISR vs RSC, CDN edge caching, Cache-Control headers, and stale-while-revalidate.",
    topics: [
      {
        id: "rendering-strategies-csr-ssr-rsc",
        title: "Rendering Strategies: CSR vs SSR vs SSG vs ISR vs Server Components (RSC)",
        tag: "Rendering Architecture",
        summary: "Architectural comparison of Client-Side Rendering, Server-Side Rendering, Static Generation, Incremental Regeneration, and React Server Components.",
        importance: "Choosing the wrong rendering pattern causes terrible SEO, slow Time to Interactive (TTI), server over-utilization, and stale data.",
        mentalModel: "CSR: Client downloads empty HTML + big JS bundle. SSR: Server renders HTML on every request. SSG: HTML generated once at build time. ISR: SSG with background cache revalidation. RSC: Components execute on the server and stream serialized UI primitives without adding to client JS bundle.",
        traps: "Using SSR for static marketing pages (wasting server CPU on every request) or using pure CSR for public e-commerce stores (hurting SEO and Web Vitals).",
        interviewQuestions: [
          "How do React Server Components (RSC) differ from traditional SSR?",
          "When should you choose Incremental Static Regeneration (ISR) over traditional SSR?"
        ],
        defaultGuide: `## 🏗️ Modern Web Rendering Architecture

### Architectural Trade-offs
| Pattern | TTFB (Initial) | FCP (First Contentful Paint) | TTI (Time to Interactive) | Server Cost | SEO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CSR (SPA)** | ⭐ Fast | ❌ Slow | ❌ Slow | ⭐ Zero server CPU | ⚠️ Difficult |
| **SSR** | ⚠️ Moderate | ⭐ Fast | ⚠️ Hydration lag | ❌ High server CPU | ⭐ Excellent |
| **SSG** | ⭐ Blazing | ⭐ Blazing | ⭐ Fast | ⭐ Lowest (CDN) | ⭐ Excellent |
| **ISR** | ⭐ Blazing | ⭐ Blazing | ⭐ Fast | ⭐ Low | ⭐ Excellent |
| **RSC** | ⭐ Fast | ⭐ Fast | ⭐ Zero hydration for server nodes | ⚠️ Moderate | ⭐ Excellent |

### React Server Components (RSC) Paradigm
In traditional SSR, all components must still be bundled and sent to the browser for **hydration**.
In **RSC**:
- Server components **never download to the client**. Their libraries (e.g. Markdown parsers, database clients) add **0 bytes** to the browser JavaScript bundle!
- They stream a compact serialized UI representation directly into the client tree.`
      },
      {
        id: "cdn-cache-control-headers",
        title: "CDN Architecture, Cache-Control & `stale-while-revalidate`",
        tag: "Caching & CDN",
        summary: "Leveraging Content Delivery Networks (Cloudflare, CloudFront), edge caching, HTTP cache headers, and cache invalidation.",
        importance: "Serving cached responses from edge CDNs reduces server load by 95% and drops global response latency from 600ms to 20ms.",
        mentalModel: "Client Request -> Closest CDN Edge Point of Presence (PoP) -> If Cache Hit, respond immediately. If Cache Miss, fetch from origin server, store at edge, and respond.",
        traps: "Caching dynamic user-specific HTML pages containing private user data or session tokens at a public shared CDN edge.",
        interviewQuestions: [
          "Explain how `Cache-Control: public, max-age=0, s-maxage=86400, stale-while-revalidate=3600` behaves.",
          "How do content-hashed asset filenames (e.g., `main.a8f2b.js`) enable immutable caching?"
        ],
        defaultGuide: `## ⚡ CDN Edge Caching & HTTP Headers

### Key Cache-Control Directives
\`\`\`http
Cache-Control: public, max-age=3600, s-maxage=86400, stale-while-revalidate=600
\`\`\`
1. **\`public\`**: Can be cached by public intermediaries (CDNs, proxies).
2. **\`private\`**: Only allowed to be cached in the end user's personal browser (e.g. user dashboards).
3. **\`max-age=3600\`**: Browser caches response for 1 hour.
4. **\`s-maxage=86400\`**: Shared CDN edge caches response for 24 hours (overrides \`max-age\` for CDNs).
5. **\`stale-while-revalidate=600\`**: If the cache has expired, the CDN immediately serves the stale version to the user with 0ms latency, while triggering a background fetch to update the cache!

### The Immutable Asset Strategy
For compiled JavaScript, CSS, and images with content hashes in the filename:
\`\`\`http
Cache-Control: public, max-age=31536000, immutable
\`\`\`
Because the filename changes whenever code changes (\`app.v2.3.js\`), you can safely cache files for 1 entire year without risk of users seeing stale code.`
      }
    ]
  },
  {
    id: "sys-api-protocols",
    category: "4. API Design, Protocols & Real-Time Communication",
    badge: "APIs & Real-Time",
    description: "REST vs GraphQL vs gRPC vs tRPC, WebSockets, Server-Sent Events (SSE), and idempotency keys.",
    topics: [
      {
        id: "api-paradigms-rest-graphql-grpc",
        title: "API Protocols: REST vs GraphQL vs gRPC vs tRPC",
        tag: "API Architecture",
        summary: "Selecting the right communication protocol for public APIs, internal microservices, and mobile applications.",
        importance: "Protocol choice dictates developer velocity, network payload size, type-safety, and client-server decoupling.",
        mentalModel: "REST: Resource-based standard over HTTP. GraphQL: Single endpoint where client asks for exact fields. gRPC: High-performance binary Protocol Buffers over HTTP/2 for internal microservices. tRPC: End-to-end fullstack TypeScript type safety without code generation.",
        traps: "Exposing gRPC directly to public web browsers (browsers lack low-level HTTP/2 framing controls; requires gRPC-Web proxy).",
        interviewQuestions: [
          "When should you choose gRPC over REST for microservice communication?",
          "What are the N+1 problem in GraphQL and the solutions (DataLoader)?"
        ],
        defaultGuide: `## 📡 API Paradigms Architectural Guide

### Comparison Overview
- **REST**: Best for public APIs, partner integrations, and standard web apps. Highly cacheable via standard HTTP caching.
- **GraphQL**: Best for complex client apps with disparate data requirements (e.g. mobile apps over slow cellular connections). Prevents over-fetching and under-fetching.
- **gRPC**: Best for internal service-to-service (microservices) communication. Uses binary Protocol Buffers (\`protobuf\`), serializing 5-10x faster than JSON with 70% smaller payloads.
- **tRPC**: Best for fullstack TypeScript monorepos (Next.js + Node). Zero schema generation; frontend inherits backend types directly.

### The GraphQL N+1 Problem
If a query fetches 100 posts and their authors:
- 1 SQL query for posts.
- 100 individual SQL queries for each author (\`SELECT * FROM users WHERE id = ?\`).
- **Solution: DataLoader**: Batches all 100 author IDs into a single \`SELECT * FROM users WHERE id IN (...)\` query within a single event loop tick.`
      },
      {
        id: "realtime-websockets-sse",
        title: "Real-Time Web: WebSockets vs Server-Sent Events (SSE) vs Long Polling",
        tag: "Real-Time",
        summary: "Architecting real-time communication for chat apps, live stock tickers, AI streaming, and collaborative tools.",
        importance: "Using WebSockets where SSE is sufficient wastes server connection resources and complicates load balancing and proxying.",
        mentalModel: "Long Polling: Client keeps opening HTTP requests. SSE: Unidirectional stream from server to client over standard HTTP. WebSockets: Full-duplex bidirectional persistent TCP socket connection.",
        traps: "Using WebSockets for AI LLM streaming (like ChatGPT) where communication is purely server-to-client; SSE is simpler, runs over standard HTTP, and supports automatic reconnection out of the box.",
        interviewQuestions: [
          "Why is Server-Sent Events (SSE) preferred over WebSockets for AI token streaming?",
          "How do you scale WebSockets horizontally across multiple load-balanced server instances?"
        ],
        defaultGuide: `## ⚡ Real-Time Architectures: WebSockets vs SSE

### Technical Comparison
| Feature | Long Polling | Server-Sent Events (SSE) | WebSockets |
| :--- | :--- | :--- | :--- |
| **Directionality** | Client pull | Server -> Client (Unidirectional) | Full Duplex (Bidirectional) |
| **Protocol** | Standard HTTP | Standard HTTP/1.1 or HTTP/2 | \`ws://\` or \`wss://\` (TCP) |
| **Reconnection** | Manual in JS | Built-in native browser auto-reconnect | Manual reconnection logic required |
| **Firewall / Proxy** | Works everywhere | Works everywhere | Can be blocked by corporate proxies |
| **Best Use Case** | Legacy fallback | AI Streaming, Stock Tickers, Notifications | Collaborative Canvas, Multiplayer Games, Chat |

### Horizontal Scaling of WebSockets
Because WebSockets maintain a persistent stateful connection to a specific server instance:
- If Client A is connected to Server 1, and Client B is connected to Server 2:
- Server 1 cannot directly send a message to Client B!
- **Solution: Redis Pub/Sub**: Servers publish socket messages to a shared Redis channel. All socket servers subscribe and forward messages to their locally connected clients.`
      }
    ]
  },
  {
    id: "sys-databases-caching",
    category: "5. Databases, Caching & Data Systems",
    badge: "Databases & Caching",
    description: "SQL vs NoSQL, CAP theorem, database indexing, read replicas, Redis caching patterns, and cache stampede prevention.",
    topics: [
      {
        id: "sql-vs-nosql-cap-theorem",
        title: "Databases: SQL vs NoSQL, ACID vs BASE & the CAP Theorem",
        tag: "Databases",
        summary: "Choosing between relational (PostgreSQL) and non-relational (MongoDB, DynamoDB, Cassandra) data stores.",
        importance: "Picking the wrong database model is one of the most expensive architectural mistakes to fix once data scales past millions of records.",
        mentalModel: "SQL: Relational tables, rigid schemas, ACID transactions, complex joins, vertical scaling. NoSQL: Flexible documents/key-values, eventual consistency (BASE), horizontal partitioning. CAP: A distributed data store can guarantee at most two of: Consistency, Availability, Partition Tolerance.",
        traps: "Choosing NoSQL under the misconception that 'SQL cannot scale'; modern PostgreSQL with read replicas and partitioning scales to millions of users.",
        interviewQuestions: [
          "Explain the CAP Theorem and why Partition Tolerance (P) is mandatory in distributed networks.",
          "When would you choose PostgreSQL over DynamoDB or MongoDB?"
        ],
        defaultGuide: `## 💾 Database Architecture & CAP Theorem

### ACID vs BASE
- **ACID (SQL / PostgreSQL)**:
  - **Atomicity**: All or nothing transaction.
  - **Consistency**: Data adheres to all constraints and schemas.
  - **Isolation**: Concurrent transactions do not interfere with each other.
  - **Durability**: Committed data survives system crashes.
- **BASE (NoSQL / DynamoDB, Cassandra)**:
  - **Basically Available**: System guarantees availability.
  - **Soft State**: State may change over time without user input.
  - **Eventual Consistency**: Replicas will converge to the same data eventually.

### The CAP Theorem Invariant
In any distributed network, network splits (**Partition Tolerance (P)**) are guaranteed to happen:
\`\`\`
             Consistency (C)
                 ▲
                / \\
               /   \\
              /  ▲  \\
             /  CA   \\
            /         \\
Availability (A) ═════ Partition Tolerance (P)
         CP (e.g. MongoDB, Redis)
         AP (e.g. Cassandra, DynamoDB, CouchDB)
\`\`\`
- If the network partitions:
  - **Choose CP**: Reject writes until partition heals to maintain strict data consistency.
  - **Choose AP**: Accept writes on both sides; reconcile conflicting data later (eventual consistency).`
      },
      {
        id: "redis-caching-patterns",
        title: "Distributed Caching with Redis & Cache Stampede Mitigation",
        tag: "Caching",
        summary: "Cache-Aside, Write-Through, Write-Behind patterns, Redis data structures, TTL strategies, and the thundering herd problem.",
        importance: "Databases are the most expensive resource to scale. A well-designed Redis caching layer shields databases from 90%+ of read spikes.",
        mentalModel: "Cache-Aside: App reads from Redis. On miss, app reads from DB, writes to Redis, and returns. Cache Stampede: When a popular key expires, 10,000 concurrent requests hammer the DB simultaneously.",
        traps: "Setting identical TTLs on thousands of cached keys, causing them all to expire at the same second and crashing the database.",
        interviewQuestions: [
          "How do you implement the Cache-Aside pattern, and how do you handle cache invalidation?",
          "How do you prevent a Cache Stampede (Thundering Herd) when a hot cache key expires?"
        ],
        defaultGuide: `## 🏎️ Redis Distributed Caching Architecture

### 1. The Cache-Aside Pattern
\`\`\`
Client ──> App Server ──(1. Get Key)──> [ Redis Cache ]
               │                                │
               │ (Cache Miss)                   │ (Cache Hit)
               ▼                                ▼
         [ PostgreSQL ] ──(2. Return Data)──> Return to Client
               │
               └───(3. Store in Redis with TTL)───> [ Redis Cache ]
\`\`\`

### 2. Cache Invalidation Strategies
- **TTL (Time to Live)**: Every cached key must have an expiration.
- **Write Invalidation**: When user updates their profile in DB, delete \`user:123\` from Redis.

### 3. Mitigating Cache Stampede (Thundering Herd)
1. **Jitter (Randomized TTL)**:
   Instead of \`TTL = 3600\`, use \`TTL = 3600 + Math.random() * 300\`. This staggers key expirations across time.
2. **Mutex Locking (Distributed Lock)**:
   The first process to detect a cache miss acquires a Redis lock (\`SET key value NX EX 5\`) to query the DB and repopulate the cache. All other requests wait or return stale data.`
      }
    ]
  },
  {
    id: "sys-security-auth",
    category: "6. Web Security & Modern Authentication",
    badge: "Security & Auth",
    description: "OAuth 2.0 & OIDC, JWTs vs Server Sessions, CORS preflight, CSP headers, XSS, CSRF, and SQL injection prevention.",
    topics: [
      {
        id: "auth-sessions-vs-jwts-oauth",
        title: "Authentication Architecture: State Sessions vs JWTs vs OAuth 2.0 / OIDC",
        tag: "Authentication",
        summary: "Comparing stateful database sessions with stateless JSON Web Tokens (JWT), token revocation, and OAuth 2.0 PKCE flow.",
        importance: "Authentication architectural flaws lead to hijacked sessions, inability to revoke compromised tokens, and security breaches.",
        mentalModel: "Sessions: Server stores session in Redis; client holds session ID in httpOnly cookie. Revocation is instantaneous. JWT: Client holds signed payload; server validates cryptographic signature without DB lookup. Revocation requires token blacklisting.",
        traps: "Storing sensitive JWT access tokens in browser `localStorage`, making them vulnerable to extraction via Cross-Site Scripting (XSS).",
        interviewQuestions: [
          "Where should JWT tokens be stored in a web browser, and why is localStorage unsafe?",
          "How do you revoke a stateless JWT before its expiration time?"
        ],
        defaultGuide: `## 🔐 Authentication Architectures

### Sessions vs JWTs
| Dimension | Server Sessions (Redis) | Stateless JWTs |
| :--- | :--- | :--- |
| **Storage Location** | Server (Redis) + \`httpOnly\` Cookie | Browser Cookie or Memory |
| **Verification** | DB / Cache lookup on every request | Fast cryptographic signature check |
| **Revocation** | Instant (delete from Redis) | Difficult (requires blacklist or short TTL) |
| **Payload Size** | Tiny (32-character session ID) | Large (hundreds of bytes sent on every request) |
| **Horizontal Scale** | Requires shared Redis cluster | Zero shared state required |

### The Secure Token Pattern
1. **Access Token**: Short-lived (5-15 minutes). Stored in JavaScript memory or \`httpOnly, SameSite=Strict, Secure\` cookie.
2. **Refresh Token**: Long-lived (7-30 days). Stored in a strict \`httpOnly\` cookie restricted to \`/api/auth/refresh\`.
3. Storing tokens in \`localStorage\` exposes them to any third-party script via XSS!`
      },
      {
        id: "web-vulnerabilities-cors-xss-csrf",
        title: "Web Security Defense: CORS, CSP, XSS, CSRF & SQL Injection",
        tag: "Security",
        summary: "Hardening production web applications against the OWASP Top 10 vulnerabilities with headers and defensive programming.",
        importance: "Security is non-negotiable for senior engineers. One misconfigured CORS header or unescaped query can compromise millions of user records.",
        mentalModel: "CORS: Browser security mechanism restricting cross-origin AJAX requests. CSP: Header telling the browser which domains scripts/images are allowed to load from. XSS: Injecting malicious JS into other users' browsers. CSRF: Tricking authenticated users into executing unwanted actions.",
        traps: "Setting `Access-Control-Allow-Origin: *` combined with `Access-Control-Allow-Credentials: true` (the browser will reject it for security).",
        interviewQuestions: [
          "Explain what CORS is and why setting `Access-Control-Allow-Origin: *` is dangerous.",
          "How does the `SameSite` cookie attribute prevent Cross-Site Request Forgery (CSRF)?"
        ],
        defaultGuide: `## 🛡️ Enterprise Web Security Architecture

### 1. Cross-Origin Resource Sharing (CORS)
CORS is enforced **by the browser**, not the server. For non-simple requests (e.g. \`POST\` with \`application/json\`), the browser sends an \`OPTIONS\` preflight request:
\`\`\`http
OPTIONS /api/data HTTP/1.1
Origin: https://app.example.com
Access-Control-Request-Method: POST
\`\`\`
The server must explicitly authorize the origin:
\`\`\`http
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
\`\`\`

### 2. Preventing XSS (Cross-Site Scripting)
- Never use \`dangerouslySetInnerHTML\` with un-sanitized user input.
- Enforce a strict **Content Security Policy (CSP)**:
  \`\`\`http
  Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted.cdn.com; object-src 'none';
  \`\`\`

### 3. Preventing CSRF (Cross-Site Request Forgery)
- Set \`SameSite=Lax\` or \`SameSite=Strict\` on all authentication session cookies.
- Use anti-CSRF tokens for sensitive state-mutating requests.`
      }
    ]
  },
  {
    id: "sys-observability-reliability",
    category: "7. Observability, Monitoring & System Reliability",
    badge: "Observability & SRE",
    description: "The 3 pillars of observability (Metrics, Logs, Traces), Prometheus & Grafana, OpenTelemetry, and circuit breakers.",
    topics: [
      {
        id: "observability-metrics-logs-traces",
        title: "The Three Pillars of Observability: Metrics, Logs & Distributed Tracing",
        tag: "Observability",
        summary: "Instrumenting production web services with OpenTelemetry, Prometheus metrics, structured JSON logging, and Jaeger distributed tracing.",
        importance: "When a production outage strikes at 3 AM, distributed tracing is what allows engineers to pinpoint which microservice failed in 30 seconds instead of 4 hours.",
        mentalModel: "Metrics: Numeric aggregations over time (CPU, p99 latency, request rate). Logs: Detailed chronological records of discrete events. Traces: Following a single user request across 10 distributed microservices with span IDs.",
        traps: "Using `console.log('Error occurred')` unstructured strings instead of structured JSON logs with correlation IDs (`trace_id`).",
        interviewQuestions: [
          "What is the difference between monitoring and observability?",
          "How does distributed tracing track a request across multiple microservices?"
        ],
        defaultGuide: `## 📊 The 3 Pillars of Observability

\`\`\`
                    [ Observability ]
                 ┌──────────┼──────────┐
                 ▼          ▼          ▼
            [ Metrics ]  [ Logs ]   [ Traces ]
             Aggregate    Discrete   Request flow
            health data   event log  across microservices
\`\`\`

### 1. Metrics (Prometheus / Datadog)
- Focuses on the **Golden Signals**: Latency (p50, p95, p99), Traffic (requests/sec), Errors (4xx/5xx rate), and Saturation (CPU, Memory).
- Lightweight and fast for real-time alerting.

### 2. Structured Logging (JSON)
\`\`\`json
{
  "timestamp": "2026-10-25T11:50:00Z",
  "level": "error",
  "service": "checkout-service",
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
  "user_id": 9821,
  "message": "Payment gateway timeout after 5000ms",
  "duration_ms": 5012
}
\`\`\`

### 3. Distributed Tracing (OpenTelemetry / Jaeger)
When an HTTP request enters the gateway, an OpenTelemetry header (\`traceparent\`) is generated and propagated downstream across every HTTP and message queue call.
Engineers can view a visual waterfall diagram showing exactly how many milliseconds each service spent processing that specific user request.`
      },
      {
        id: "resilience-circuit-breaker-rate-limiting",
        title: "Resilience Patterns: Circuit Breakers, Retries with Jitter & Rate Limiting",
        tag: "Reliability",
        summary: "Preventing cascading system failures using the Circuit Breaker pattern, exponential backoff with jitter, and token bucket rate limiting.",
        importance: "Without circuit breakers, one struggling third-party API or downstream database will exhaust all thread connections and crash your entire server fleet.",
        mentalModel: "Circuit Breaker States: Closed (normal traffic flows) -> Open (trips when failure threshold exceeded; immediately fails fast without calling broken dependency) -> Half-Open (tests probe requests to see if dependency recovered).",
        traps: "Retrying failed requests immediately without exponential backoff or jitter, inadvertently launching a self-inflicted DDoS attack on your own database.",
        interviewQuestions: [
          "Explain how the Circuit Breaker pattern protects a system from cascading failures.",
          "Why is adding random jitter essential when implementing exponential backoff retries?"
        ],
        defaultGuide: `## ⚡ System Resilience & Circuit Breakers

### The Circuit Breaker State Machine
\`\`\`
          [ CLOSED ] (Normal operations)
              │
              │ (Failure rate > 50%)
              ▼
           [ OPEN ] (Fails fast immediately, 0 calls to backend)
              │
              │ (Cooldown timeout e.g. 30s elapsed)
              ▼
        [ HALF-OPEN ] (Sends 3 trial requests)
        ├── If Successful ──> Back to [ CLOSED ]
        └── If Failed ──────> Back to [ OPEN ]
\`\`\`

### Retries with Exponential Backoff and Jitter
When a network call fails, retry using:
\`\`\`javascript
const delay = Math.min(maxDelay, baseDelay * Math.pow(2, attempt)) + Math.random() * 100;
\`\`\`
The \`+ Math.random() * 100\` is **jitter**. Without jitter, 5,000 requests that failed at the exact same moment will all retry at the exact same millisecond, crushing the recovering service!`
      }
    ]
  }
];
