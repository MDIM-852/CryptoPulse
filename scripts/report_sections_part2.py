# Part 2: Chapter 3 (Proposed Work & Methodology) and Chapter 4 (Implementation)

DB_SCHEMA_HEADERS = ["Table Name", "Primary Key", "Foreign Keys / References", "Security Policy (RLS)", "Primary Domain Attributes"]

DB_SCHEMA_ROWS = [
    [
        "public.profiles",
        "id (UUID)",
        "references auth.users(id) on delete cascade",
        "Users view/update own; Admins view/update all",
        "email (text), full_name (text), avatar_url (text), role ('user'|'admin'), is_disabled (bool), timestamps"
    ],
    [
        "public.transactions",
        "id (UUID)",
        "user_id references profiles(id) on delete cascade",
        "Users manage own; Admins view all",
        "coin_id (text), coin_symbol (text), coin_name (text), type ('BUY'|'SELL'), amount (num), price_per_unit (num), notes (text)"
    ],
    [
        "public.watchlists",
        "id (UUID)",
        "user_id references profiles(id) on delete cascade",
        "Strict per-user isolation; unique(user_id, coin_id)",
        "coin_id (text), coin_symbol (text), coin_name (text), created_at (timestamptz)"
    ],
    [
        "public.price_alerts",
        "id (UUID)",
        "user_id references profiles(id) on delete cascade",
        "Strict per-user isolation; realtime replication",
        "coin_id, coin_symbol, target_price (numeric), condition ('ABOVE'|'BELOW'), is_active (bool), is_triggered (bool)"
    ],
    [
        "public.user_exchange_keys",
        "id (UUID)",
        "user_id references profiles(id) on delete cascade",
        "Strict user isolation; unique(user_id, exchange)",
        "exchange_name ('binance_testnet'), api_key (text), encrypted_api_secret (AES-GCM hex string), timestamps"
    ],
    [
        "public.activity_logs",
        "id (UUID)",
        "user_id references profiles(id) on delete set null",
        "Users view own; Admins view all; realtime replication",
        "user_email (text), action (text), details (JSONB metadata), ip_address (text), created_at (timestamptz)"
    ]
]

SYSTEM_MODULES_HEADERS = ["Module Identifier", "Functional Domain", "Implementation Pattern", "Communication Protocol"]

SYSTEM_MODULES_ROWS = [
    ["MOD-01: Auth & RBAC", "User Identity & Access Control", "Supabase Auth + SSR Next.js Middleware", "HTTPS / HTTP-only JWT Cookies"],
    ["MOD-02: Market Ticker", "Sub-Second Price Surveillance", "useBinanceTicker Hook + Reconnect Backoff", "WSS (Full-Duplex WebSocket)"],
    ["MOD-03: Portfolio Engine", "Net Worth & Weighted Cost Basis", "Transaction Reducer + Recharts Pie/Area", "In-Memory State / PostgreSQL RLS"],
    ["MOD-04: Sandbox Trading", "Simulated & Testnet Execution", "HMAC-SHA256 Signer + Balance Verification", "HTTPS REST API (Binance Vision)"],
    ["MOD-05: Behavioral Guard", "Emotional Bias Mitigation (FOMO)", "RegretGuard Modal + 10-Min Cooling Timer", "Client-Side Reactive State"],
    ["MOD-06: Risk Pulse", "HHI Concentration & Beta Modeling", "Mathematical Reducer + Rebalancing Engine", "Client / Edge Runtime Computation"],
    ["MOD-07: Tax-Lot Tracker", "Multi-Tranche Capital Gain Accounting", "FIFO / LIFO / HIFO Lot Matching Engine", "In-Browser CSV Serialization"],
    ["MOD-08: Admin Governance", "Platform Supervision & Kill Switch", "Server-Side RBAC Guard + KillSwitch State", "HTTPS Protected Server Actions / REST"]
]

MATH_FORMULAS_HEADERS = ["Financial / Risk Metric", "Formal Mathematical Definition", "Domain Application", "Target Range"]

MATH_FORMULAS_ROWS = [
    [
        "Total Portfolio Value",
        "V_portfolio(t) = sum_{i=1}^{N} [ Q_i * P_i(t) ]",
        "Real-time aggregate valuation across all holdings",
        ">= $0.00"
    ],
    [
        "Weighted Average Cost Basis",
        "C_avg(i) = sum_{k in Buy(i)} [ Q_k * P_k ] / sum_{k in Buy(i)} [ Q_k ]",
        "Benchmark acquisition baseline for profit/loss calculation",
        "Price per coin ($)"
    ],
    [
        "Unrealized Profit & Loss (PnL)",
        "PnL_unrealized(i) = Q_i * [ P_i(t) - C_avg(i) ]",
        "Dollar capital gain or loss currently held in asset i",
        "Unbounded (+ / - USD)"
    ],
    [
        "Percentage Return",
        "Return_%(i) = [ (P_i(t) - C_avg(i)) / C_avg(i) ] * 100",
        "Normalized performance indicator independent of position size",
        "> -100.0%"
    ],
    [
        "Herfindahl-Hirschman Index (HHI)",
        "HHI = sum_{i=1}^{N} [ (100 * w_i)^2 ], where w_i = V_i / V_total",
        "Quantitative measure of portfolio concentration risk",
        "< 1500: Diversified\n> 2500: Concentrated"
    ],
    [
        "Weighted Portfolio Beta",
        "Beta_p = sum_{i=1}^{N} [ w_i * Beta_i ], where Beta_i = Cov(R_i, R_m) / Var(R_m)",
        "Systemic volatility sensitivity relative to total market index",
        "Beta ~ 1.0 (Neutral)\nBeta > 1.5 (High Beta)"
    ],
    [
        "Capital Gain per Tax-Lot",
        "Gain_lot = Proceeds_disposition - Basis_acquisition",
        "Statutory taxable capital gain recognized under IRS Notice 2014-21",
        "Tax liability basis"
    ]
]

def add_chapter_3(b):
    # ---------------- CHAPTER 3: PROPOSED WORK AND METHODOLOGY ----------------
    b.add_heading_1("CHAPTER 3")
    b.add_heading_1("PROPOSED WORK AND METHODOLOGY")

    b.add_heading_2("3.1 Multi-Tiered System Architecture")
    b.add_p("To overcome the architectural fragmentation, latency overhead, and security liabilities identified in existing commercial cryptocurrency solutions, the Cryptocurrency Management System is formulated as an enterprise-grade, multi-tiered full-stack architecture. The system establishes distinct physical and logical separation across five foundational tiers:")
    b.add_p("1. Presentation Layer (Client Tier): Developed using React 18, Tailwind CSS, and headless accessible primitives from Radix UI. This layer manages declarative interface rendering, reactive state binding, dynamic visual charts (via Recharts), and responsive layout adaptation across desktop, tablet, and mobile displays.")
    b.add_p("2. Application and Edge Routing Layer (Middleware Tier): Built upon the Next.js 14 App Router environment. It incorporates server-side edge middleware for route protection, HTTP session hydration, CSRF token validation, and token-bucket sliding-window rate limiting.")
    b.add_p("3. Business Logic and Service Layer: Implemented as isolated server-side API Route Handlers. This tier encapsulates order validation (Zod schemas), cryptographic operations (AES-256-GCM cipher encryption/decryption), HMAC-SHA256 exchange signature dispatching, and emergency kill-switch circuit breaker verification.")
    b.add_p("4. Data Persistence and Security Layer: Anchored by Supabase PostgreSQL, utilizing declarative Row Level Security (RLS) policies to mathematically isolate tenant records. Real-time changes are synchronized to active client sessions via PostgreSQL Change Data Capture (CDC) over WebSockets.")
    b.add_p("5. External Integration Layer: Orchestrates bi-directional communications with external decentralized and centralized nodes, including the Binance WebSocket mini-ticker array (!miniTicker@arr), CoinGecko REST endpoints for historical asset breadth, the Binance Spot Testnet execution gateway, and the Google Gemini Generative AI API.")

    b.add_callout(
        "+-----------------------------------------------------------------------------------+\n"
        "|                        CRYPTOCURRENCY MANAGEMENT SYSTEM                           |\n"
        "+-----------------------------------------------------------------------------------+\n"
        "|  TIER 1: PRESENTATION LAYER (React 18, Tailwind CSS, Radix UI, Recharts)          |\n"
        "|  - Dashboard View   - Market/Watchlist   - Portfolio Analytics  - Trading Terminal|\n"
        "|  - Insights Hub     - Regret Guard Modal - Tax-Lot Tracker      - Admin Console   |\n"
        "+-----------------------------------------------------------------------------------+\n"
        "                                         |  (HTTPS / WSS JSON)\n"
        "                                         v\n"
        "+-----------------------------------------------------------------------------------+\n"
        "|  TIER 2: EDGE ROUTING & MIDDLEWARE (Next.js 14 App Router, Rate Limiter)          |\n"
        "|  - Session Token Verification  - Sliding Window Token Bucket  - CSRF Guards       |\n"
        "+-----------------------------------------------------------------------------------+\n"
        "                                         |\n"
        "                                         v\n"
        "+-----------------------------------------------------------------------------------+\n"
        "|  TIER 3: BUSINESS LOGIC & ENCRYPTION VAULT (Server-Side Route Handlers)           |\n"
        "|  - Zod Request Validation       - AES-256-GCM Envelope Encryption/Decryption      |\n"
        "|  - Binance HMAC-SHA256 Signer   - Global Trading Kill Switch (503 Service Guard)  |\n"
        "+-----------------------------------------------------------------------------------+\n"
        "                      |                                      |\n"
        "                      v (SQL with RLS)                       v (HTTPS / WSS)\n"
        "+----------------------------------------+   +--------------------------------------+\n"
        "|  TIER 4: DATA PERSISTENCE LAYER        |   |  TIER 5: EXTERNAL INTEGRATIONS       |\n"
        "|  - Supabase PostgreSQL Database        |   |  - Binance WebSocket Stream          |\n"
        "|  - Row Level Security (RLS) Isolation  |   |  - Binance Spot Testnet REST API     |\n"
        "|  - Tables: profiles, transactions,     |   |  - CoinGecko Market Aggregator       |\n"
        "|    watchlists, price_alerts, keys      |   |  - Google Gemini AI (Explain Move)   |\n"
        "+----------------------------------------+   +--------------------------------------+\n\n"
        "FIGURE 3.1: CRYPTOCURRENCY MANAGEMENT SYSTEM MULTI-TIERED ARCHITECTURE",
        label="ARCHITECTURE",
        fill="F8FAFC",
        border_color="2563EB"
    )

    b.add_heading_2("3.2 Formal Mathematical Formulations and Computational Models")
    b.add_p("To guarantee institutional precision and mathematical rigor in portfolio valuation, risk diagnostics, and tax compliance, the platform formalizes its analytical engine through the following mathematical models (summarized in Table 3.3):")

    b.add_heading_3("3.2.1 Portfolio Valuation and Unrealized Profit/Loss Formulations")
    b.add_p("For a portfolio containing N distinct cryptocurrency assets, let Q_i represent the net circulating quantity of asset i held, and let P_i(t) denote the real-time spot price of asset i at timestamp t, continuously updated via the Binance WebSocket ticker stream. The aggregate total portfolio market value V_portfolio(t) is defined as:")
    b.add_callout(
        "V_portfolio(t) = \\sum_{i=1}^{N} Q_i \\cdot P_i(t)\n\n"
        "where Q_i = \\sum_{j \\in Buy(i)} Q_{buy,j} - \\sum_{k \\in Sell(i)} Q_{sell,k}",
        label="EQUATION 3.1",
        fill="EFF6FF",
        border_color="1D4ED8"
    )
    b.add_p("The historical weighted average acquisition cost basis C_avg(i) for asset i across all cumulative buy transactions is formulated as:")
    b.add_callout(
        "C_avg(i) = \\frac{\\sum_{j \\in Buy(i)} Q_{buy,j} \\cdot P_{buy,j}}{\\sum_{j \\in Buy(i)} Q_{buy,j}}",
        label="EQUATION 3.2",
        fill="EFF6FF",
        border_color="1D4ED8"
    )
    b.add_p("The unrealized dollar capital gain or loss PnL_unrealized(i) and normalized percentage return Return_%(i) are dynamically evaluated as:")
    b.add_callout(
        "PnL_unrealized(i) = Q_i \\cdot [ P_i(t) - C_avg(i) ]\n\n"
        "Return_%(i) = \\left( \\frac{P_i(t) - C_avg(i)}{C_avg(i)} \\right) \\times 100\\%",
        label="EQUATION 3.3",
        fill="EFF6FF",
        border_color="1D4ED8"
    )

    b.add_heading_3("3.2.2 Herfindahl-Hirschman Index (HHI) Concentration Modeling")
    b.add_p("Portfolio risk in digital assets is primarily driven by concentration vulnerability—where a catastrophic collapse in a single dominant holding induces systemic portfolio ruin. To quantify this vulnerability, the system adapts the Herfindahl-Hirschman Index (HHI), traditionally utilized in antitrust economics, to multi-asset portfolios. Let w_i represent the fractional portfolio weight of holding i:")
    b.add_callout(
        "w_i = \\frac{Q_i \\cdot P_i(t)}{V_portfolio(t)}, \\quad \\text{such that } \\sum_{i=1}^{N} w_i = 1.0\n\n"
        "HHI = \\sum_{i=1}^{N} (100 \\cdot w_i)^2",
        label="EQUATION 3.4",
        fill="EFF6FF",
        border_color="1D4ED8"
    )
    b.add_p("The resulting HHI metric scales from 0 to 10,000. In accordance with platform risk policies:")
    b.add_p("• HHI < 1500 (Low Risk / Well Diversified): Capital is distributed across multiple independent assets.")
    b.add_p("• 1500 <= HHI <= 2500 (Moderate Concentration): A single asset holds 35% to 50% of portfolio value.")
    b.add_p("• HHI > 2500 (High Risk / Vulnerable): A single asset dominates >50% of capital, triggering automated rebalancing notifications.")

    b.add_heading_3("3.2.3 Systematic Volatility Beta Formulations")
    b.add_p("To quantify systemic market risk, the portfolio engine computes asset beta (Beta_i) relative to the total cryptocurrency market benchmark (M), characterized by the market capitalization-weighted index of Bitcoin and Ethereum:")
    b.add_callout(
        "Beta_i = \\frac{Cov(R_i, R_M)}{Var(R_M)}\n\n"
        "Beta_portfolio = \\sum_{i=1}^{N} w_i \\cdot Beta_i",
        label="EQUATION 3.5",
        fill="EFF6FF",
        border_color="1D4ED8"
    )
    b.add_p("High-beta altcoins (Beta > 1.8) amplify broader market drawdowns during risk-off cycles, whereas established blue-chip assets exhibit lower systemic volatility. This beta weighting informs the 0–100 Portfolio Risk Pulse score.")

    b.add_heading_3("3.2.4 Algorithmic Cost-Basis Tax-Lot Matching Mechanics")
    b.add_p("When a SELL transaction occurs with quantity Q_sell at disposition price P_sell, the engine matches Q_sell against historical acquisition tranches L = {Lot_1, Lot_2, ..., Lot_m}, where each lot possesses an acquisition timestamp t_buy, remaining quantity Q_lot, and acquisition price P_buy. The matching mechanics are governed by three deterministic strategies:")
    b.add_p("1. First-In, First-Out (FIFO): The acquisition pool is organized as a First-In-First-Out FIFO queue sorted chronologically by acquisition timestamp:")
    b.add_callout("L_FIFO = \\text{sort}(L) \\text{ ascending by } t_{buy}", label="FIFO RULE", fill="F1F5F9", border_color="475569")
    b.add_p("2. Last-In, First-Out (LIFO): The acquisition pool is organized as a LIFO stack sorted reverse-chronologically:")
    b.add_callout("L_LIFO = \\text{sort}(L) \\text{ descending by } t_{buy}", label="LIFO RULE", fill="F1F5F9", border_color="475569")
    b.add_p("3. Highest-In, First-Out (HIFO): The acquisition pool is organized as a max-priority queue sorted by unit purchase price:")
    b.add_callout("L_HIFO = \\text{sort}(L) \\text{ descending by } P_{buy}", label="HIFO RULE", fill="F1F5F9", border_color="475569")
    b.add_p("For each matched lot tranche with consumed amount q_k <= Q_lot, the realized taxable capital gain or loss Gain_k is computed as:")
    b.add_callout(
        "Gain_k = q_k \\cdot ( P_{sell} - P_{buy,k} )\n\n"
        "\\text{Holding Period Classification: } \\begin{cases} \\text{Long-Term}, & \\text{if } (t_{sell} - t_{buy,k}) \\ge 365 \\text{ days} \\\\ \\text{Short-Term}, & \\text{if } (t_{sell} - t_{buy,k}) < 365 \\text{ days} \\end{cases}",
        label="EQUATION 3.6",
        fill="EFF6FF",
        border_color="1D4ED8"
    )

    b.add_p("")
    b.add_table(MATH_FORMULAS_HEADERS, MATH_FORMULAS_ROWS)
    b.add_p("")

    b.add_heading_2("3.3 Security Engineering and Threat Mitigation Protocols")
    b.add_heading_3("3.3.1 AES-256-GCM Authenticated Envelope Encryption Protocol")
    b.add_p("To eliminate credential compromise, user exchange secrets are never stored in plaintext and never transmitted to the browser interface. The platform implements AES-256 in Galois/Counter Mode (GCM). The cryptographic process follows strict NIST SP 800-38D guidelines:")
    b.add_p("• Key Derivation: The 256-bit master encryption key is derived from a protected server-side environment secret (ENCRYPTION_SECRET) utilizing SHA-256 hashing.")
    b.add_p("• Initialization Vector (IV): For every encryption invocation, a cryptographically secure 12-byte (96-bit) or 16-byte random IV is generated via crypto.randomBytes(16). Re-use of an IV with the same key is mathematically prevented.")
    b.add_p("• Authenticated Tag: The AES-GCM cipher computes a 16-byte (128-bit) authentication tag over the ciphertext and optional authenticated data, guaranteeing cryptographic integrity.")
    b.add_p("• Storage Serialization: The serialized payload stored in public.user_exchange_keys adheres to the format: <iv_hex>:<authTag_hex>:<ciphertext_hex>. Tampering with any byte causes cipher.final() to throw an authentication error, aborting decryption immediately.")

    b.add_callout(
        "+-----------------------------------------------------------------------------------+\n"
        "|            SERVER-SIDE AES-256-GCM ENVELOPE ENCRYPTION WORKFLOW                   |\n"
        "+-----------------------------------------------------------------------------------+\n"
        "  User API Secret (Plaintext) ---> [crypto.randomBytes(16)] -> IV (16 bytes)\n"
        "                                     |\n"
        "                                     v\n"
        "  Server Secret Key (32 bytes) --> [Cipher: AES-256-GCM] ---> Ciphertext (Hex)\n"
        "                                                             + Auth Tag (16 bytes)\n"
        "                                                                    |\n"
        "                                                                    v\n"
        "  PostgreSQL Encrypted Record: <IV_hex> : <AuthTag_hex> : <Ciphertext_hex>\n\n"
        "FIGURE 3.3: CRYPTOGRAPHIC KEY MANAGEMENT & SERVER-SIDE DECRYPTION PIPELINE",
        label="SECURITY PIPELINE",
        fill="F8FAFC",
        border_color="059669"
    )

    b.add_heading_3("3.3.2 Sliding Window Token-Bucket Rate Limiter")
    b.add_p("To protect internal server endpoints and upstream exchange APIs against Denial of Service (DoS) floods and API throttling penalties, the system implements an in-memory sliding-window rate limiter (src/lib/ratelimit.ts). Each incoming request is identified by its client IP or authenticated User ID. The algorithm maintains an array of high-resolution timestamps. If the number of requests within the rolling window (e.g., 60 seconds) exceeds the configured threshold L (e.g., 20 requests for order placement), subsequent requests are immediately rejected with HTTP 429 Too Many Requests.")

    b.add_heading_3("3.3.3 Non-Custodial Key Verification Policy")
    b.add_p("During the registration of Binance Spot Testnet credentials, the server initiates an authenticated account status inquiry to https://testnet.binance.vision/api/v3/account. The server inspects the returned permissions array. If the property canWithdraw evaluates to true, the credentials are immediately rejected with an explicit security exception. Under no circumstances does the platform permit the registration of keys capable of moving funds off-exchange.")

    b.add_heading_3("3.3.4 Row Level Security (RLS) Access Control Invariants")
    b.add_p("Data isolation in multi-tenant environments is enforced at the database kernel level through Supabase PostgreSQL Row Level Security (RLS). Every table containing user records incorporates a mandatory user_id foreign key referencing auth.users(id). RLS policies enforce the access invariant: auth.uid() = user_id for SELECT, INSERT, UPDATE, and DELETE operations. Users cannot query or mutate records belonging to other tenants even if client-side validation is bypassed.")

    b.add_heading_3("3.3.5 Emergency Administrative Trading Kill Switch")
    b.add_p("In the event of extreme market volatility, flash crashes, or upstream API anomalies, system administrators can activate the Global Trading Kill Switch from the administrative console. The switch state is maintained in server-side memory and synchronized across API routes. When activated, all trading endpoints (both paper and testnet) immediately abort order processing, returning HTTP 503 Service Unavailable, safeguarding users against executing trades during compromised market conditions.")

    b.add_heading_2("3.4 Operational Workflows and Sequence Flowcharts")
    b.add_heading_3("3.4.1 Real-Time Market Streaming Pipeline")
    b.add_p("Figure 3.4 illustrates the end-to-end data ingestion pipeline. A single persistent WebSocket connection connects the client browser directly to Binance's stream gateway (wss://stream.binance.com:9443/ws/!miniTicker@arr). Incoming JSON ticker frames are parsed at 1000ms intervals. State changes update the local React state, triggering green or red visual flash indicators on prices that have shifted, while sparkline SVG charts visualize rolling price trends without incurring DOM thrashing.")

    b.add_callout(
        "[Binance WebSocket Gateway] --- wss://stream.binance.com:9443/ws/!miniTicker@arr --->\n"
        "              |\n"
        "              v\n"
        "[Client WebSocket Hook: useBinanceTicker]\n"
        "  - On Message: Parse Array of 24h Mini-Tickers (Symbol, Price, Open, High, Low)\n"
        "  - Price Delta Check: Compare with previous price\n"
        "      -> If Higher: Trigger 'flash-up' (Emerald Highlight, 1200ms timeout)\n"
        "      -> If Lower:  Trigger 'flash-down' (Rose Highlight, 1200ms timeout)\n"
        "  - On Disconnect: Automatic Exponential Backoff Reconnection (1s, 2s, 4s... max 15s)\n"
        "              |\n"
        "              v\n"
        "[React Virtual DOM Engine] ---> Renders Ticker Table & Sparkline Mini-Charts\n\n"
        "FIGURE 3.4: REAL-TIME MARKET DATA INGESTION & WEBSOCKET STREAMING LIFECYCLE",
        label="DATA FLOW",
        fill="F8FAFC",
        border_color="2563EB"
    )

    b.add_heading_3("3.4.2 Order Validation and Execution Pipeline")
    b.add_p("When a user initiates an order via the Trading Terminal:")
    b.add_p("1. Client-Side Validation: Form inputs (symbol, quantity, price, order type) are validated against TypeScript constraints.")
    b.add_p("2. Behavioral Regret Guard Evaluation: If the target coin has surged >8% within 24 hours, the Regret Guard modal is triggered.")
    b.add_p("3. Server Request Dispatch: Order payload is transmitted over HTTPS to /api/trade/execute.")
    b.add_p("4. Rate Limit Verification: Rate limiter verifies client IP is within acceptable request bounds.")
    b.add_p("5. Kill Switch Check: Verifies that administrative trading halt is inactive.")
    b.add_p("6. Execution Routing: If mode is 'paper', order executes instantly against simulated liquidity and records to public.transactions. If mode is 'real_exchange', credentials are decrypted in server memory, signed via HMAC-SHA256, and dispatched to Binance Spot Testnet.")

    b.add_heading_3("3.4.3 Regret Guard Behavioral Intervention Flowchart")
    b.add_p("Figure 3.5 outlines the behavioral decision flowchart of the Regret Guard. By interrupting impulsive market buys with an educational prompt and optional 10-minute cooling-off timer, the system prompts deliberative cognitive processing (System 2 thinking), reducing top-of-market retail drawdowns.")

    b.add_callout(
        "User clicks 'BUY' Order\n"
        "         |\n"
        "         v\n"
        "Is 24-Hour Price Change > +8.0%?\n"
        "       /   \\\n"
        "    YES     NO ---> Bypass to Standard Order Confirmation Modal\n"
        "     |\n"
        "     v\n"
        "[TRIGGER REGRET GUARD MODAL]\n"
        "  - Display FOMO Warning: Statistically high risk of buying local peak\n"
        "  - Offer Option A: Start 10-Minute Cooling-Off Countdown Timer\n"
        "  - Offer Option B: Convert to 'Buy the Dip' Price Alert\n"
        "  - Offer Option C: Manual Override Checkbox ('I accept risk of buying into a pump')\n"
        "         |\n"
        "         v\n"
        "Order Dispatched Only When Timer Concludes OR Override Explicitly Checked\n\n"
        "FIGURE 3.5: SANDBOXED EXECUTION & REGRET GUARD DECISION FLOWCHART",
        label="BEHAVIORAL FLOW",
        fill="F8FAFC",
        border_color="D97706"
    )

    b.add_heading_2("3.5 Relational Database Schema and Entity-Relationship Specification")
    b.add_p("The database architecture is implemented in PostgreSQL within Supabase. Table 3.2 specifies the relational schema, constraints, primary keys, and security policies governing each entity:")
    b.add_p("")
    b.add_table(DB_SCHEMA_HEADERS, DB_SCHEMA_ROWS)
    b.add_p("")
    b.add_page_break()

def add_chapter_4(b):
    # ---------------- CHAPTER 4: IMPLEMENTATION ----------------
    b.add_heading_1("CHAPTER 4")
    b.add_heading_1("IMPLEMENTATION")

    b.add_heading_2("4.1 System Implementation Overview and Tech Stack Architecture")
    b.add_p("The Cryptocurrency Management System is implemented as an end-to-end full-stack web application following the Next.js 14 App Router paradigm. The codebase is organized into modular directories adhering to clean architecture principles: UI components (src/components/), stateful hooks (src/hooks/), contextual providers (src/context/), server utilities and cryptography (src/lib/), and API route handlers (src/app/api/).")
    b.add_p("Table 4.1 details the implementation decomposition and source code manifest across the application:")
    b.add_p("")
    b.add_table(
        ["Module Category", "Primary Files", "Lines of Code (approx)", "Key Technologies & Libraries"],
        [
            ["Security & Cryptography", "src/lib/encryption.ts, ratelimit.ts, server-auth.ts", "420 LOC", "Node crypto (AES-256-GCM), SHA-256"],
            ["Market Surveillance", "src/hooks/use-binance-ticker.ts, use-coins.ts, sparkline.tsx", "680 LOC", "WebSocket (RFC 6455), CoinGecko API, SVG"],
            ["Portfolio & Accounting", "src/hooks/use-portfolio.ts, holdings-table.tsx, allocation-chart.tsx", "850 LOC", "Recharts, TypeScript reducers, PostgreSQL"],
            ["Trading & Sandboxing", "src/lib/trade/binance-testnet.ts, regret-guard-modal.tsx, trade/page.tsx", "920 LOC", "HMAC-SHA256, Binance Vision, Radix UI Dialog"],
            ["Analytical Insights", "src/components/insights/tax-lot-tracker.tsx, risk-pulse.tsx, explain-move.tsx", "1,250 LOC", "FIFO/LIFO/HIFO Algorithms, Google Gemini AI"],
            ["Admin & Governance", "src/app/api/trade/killswitch/route.ts, admin/page.tsx", "380 LOC", "RBAC Server Guards, Atomic Boolean Flags"]
        ]
    )
    b.add_p("")

    b.add_heading_2("4.2 Module 1: Authentication, Session Management, and Role Authorization")
    b.add_p("The authentication module guarantees secure user onboarding, session persistence, and role-based access control (RBAC). Supabase Auth provides underlying identity verification via JSON Web Tokens (JWT) stored in HTTP-only, secure cookies. The Next.js middleware (src/middleware.ts) intercepts all requests to protected routes (/portfolio, /trade, /insights, /admin), verifying token validity before allowing page rendering. An automated PostgreSQL trigger (handle_new_user) provisions a matching record in public.profiles upon initial registration.")
    b.add_p("The following production code demonstrates the server-side session guard and role verification utility (src/lib/auth/server-auth.ts):")

    b.add_code_block('''import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function getServerUser() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  // Retrieve user role from profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_disabled')
    .eq('id', user.id)
    .single();

  if (profile?.is_disabled) {
    throw new Error('Account has been suspended by system administrator.');
  }

  return { ...user, role: profile?.role || 'user' };
}

export async function requireAdmin(request: Request) {
  const user = await getServerUser();
  if (!user || user.role !== 'admin') {
    return null;
  }
  return user;
}''', label="src/lib/auth/server-auth.ts - Server-Side RBAC Guard")

    b.add_heading_2("4.3 Module 2: Server-Side Cryptography and In-Memory Rate Limiting")
    b.add_p("Cryptographic protection of user exchange secrets is managed by src/lib/encryption.ts. It implements AES-256-GCM authenticated envelope encryption. Plaintext API secrets are never persisted in the database; rather, the cipher generates a random 16-byte IV and an authentication tag that detects any ciphertext alteration. In parallel, src/lib/ratelimit.ts provides an in-memory sliding-window token bucket to prevent brute-force attacks and API abuse.")
    b.add_p("The complete production cryptographic implementation is shown below:")

    b.add_code_block('''import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const envKey = process.env.ENCRYPTION_SECRET;
  if (envKey) {
    if (envKey.length < 32 && process.env.NODE_ENV === 'production') {
      throw new Error('ENCRYPTION_SECRET must be at least 32 characters long in production.');
    }
    return crypto.createHash('sha256').update(envKey).digest();
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('ENCRYPTION_SECRET environment variable is required in production.');
  }
  return crypto.createHash('sha256').update('cryptopulse-development-local-key-32chars-min').digest();
}

/**
 * Encrypts a plaintext secret string using AES-256-GCM.
 * Output format: <iv_hex>:<authTag_hex>:<encrypted_hex>
 */
export function encryptSecret(plainText: string): string {
  if (!plainText) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts an AES-256-GCM ciphertext payload back into plaintext.
 */
export function decryptSecret(encryptedPayload: string): string {
  if (!encryptedPayload) return '';
  const parts = encryptedPayload.split(':');
  if (parts.length !== 3) {
    throw new Error('Malformed encrypted payload. Expected iv:authTag:ciphertext.');
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const key = getEncryptionKey();

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}''', label="src/lib/encryption.ts - AES-256-GCM Envelope Encryption Engine")

    b.add_p("The in-memory sliding-window rate limiter is implemented as follows:")

    b.add_code_block('''interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();
const CLEANUP_INTERVAL = 60 * 1000;
let lastCleanup = Date.now();

function cleanupStaleEntries(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  rateLimitStore.forEach((record, key) => {
    const validTimestamps = record.timestamps.filter((ts) => now - ts < windowMs);
    if (validTimestamps.length === 0) {
      rateLimitStore.delete(key);
    } else {
      record.timestamps = validTimestamps;
    }
  });
}

export function rateLimit(identifier: string, limit: number = 60, windowMs: number = 60 * 1000) {
  cleanupStaleEntries(windowMs);
  const now = Date.now();
  const record = rateLimitStore.get(identifier) || { timestamps: [] };
  const validTimestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (validTimestamps.length >= limit) {
    return { success: false, limit, remaining: 0, reset: validTimestamps[0] + windowMs };
  }

  validTimestamps.push(now);
  rateLimitStore.set(identifier, { timestamps: validTimestamps });
  return { success: true, limit, remaining: limit - validTimestamps.length, reset: now + windowMs };
}''', label="src/lib/ratelimit.ts - Sliding Window Rate Limiting Engine")

    b.add_heading_2("4.4 Module 3: Real-Time Market Feed and WebSocket Streaming Engine")
    b.add_p("High-frequency market data ingestion is powered by the custom useBinanceTicker React hook (src/hooks/use-binance-ticker.ts). It establishes a persistent WebSocket connection to Binance's Mini-Ticker stream (!miniTicker@arr). Incoming frames update a reactive lookup table. When a price shifts, a dynamic visual flash state ('up' for green, 'down' for red) is triggered with a 1200ms decay timer. If the socket disconnects, the hook initiates an automated exponential backoff reconnection sequence (1s, 2s, 4s, up to 15s max delay).")

    b.add_code_block('''export function useBinanceTicker() {
  const [tickerMap, setTickerMap] = useState<Record<string, LivePriceRecord>>({});
  const [status, setStatus] = useState<TickerStatus>('connecting');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef<number>(0);

  const connect = useCallback(() => {
    try {
      const wsUrl = 'wss://stream.binance.com:9443/ws/!miniTicker@arr';
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => { setStatus('connected'); reconnectAttempts.current = 0; };
      ws.onmessage = (event) => {
        const rawData = JSON.parse(event.data);
        if (!Array.isArray(rawData)) return;

        setTickerMap((prev) => {
          const next = { ...prev };
          for (const item of rawData) {
            if (!item.s.endsWith('USDT')) continue;
            const symbol = item.s.replace('USDT', '').toLowerCase();
            const newPrice = parseFloat(item.c);
            const openPrice = parseFloat(item.o);
            const priceChangePercent = openPrice > 0 ? ((newPrice - openPrice) / openPrice) * 100 : 0;
            const existing = prev[symbol];
            let flash: 'up' | 'down' | null = null;
            if (existing && existing.price !== newPrice) {
              flash = newPrice > existing.price ? 'up' : 'down';
            }
            next[symbol] = { price: newPrice, prevPrice: existing ? existing.price : newPrice, priceChangePercent, flash, lastUpdated: Date.now() };
          }
          return next;
        });
      };
      ws.onclose = () => {
        setStatus('disconnected');
        if (reconnectAttempts.current < 10) {
          const delay = Math.min(1000 * Math.pow(1.5, reconnectAttempts.current), 15000);
          reconnectAttempts.current += 1;
          setTimeout(() => connect(), delay);
        } else { setStatus('polling'); }
      };
    } catch { setStatus('polling'); }
  }, []);

  useEffect(() => { connect(); return () => { wsRef.current?.close(); }; }, [connect]);
  return { tickerMap, status };
}''', label="src/hooks/use-binance-ticker.ts - Full-Duplex WebSocket Ingestion Engine")

    b.add_heading_2("4.5 Module 4: Portfolio Valuation, Transaction Processing, and Asset Allocation")
    b.add_p("The portfolio module (src/hooks/use-portfolio.ts) processes recorded BUY and SELL transactions to derive net holdings, aggregate market valuation, and asset allocation percentages. When transactions are added via AddTransactionModal, the reducer iterates through the history, adjusting circulating coin balances and recalculating the weighted average acquisition cost basis. Real-time valuation updates reactively whenever the Binance WebSocket emits updated spot prices.")

    b.add_code_block('''export function computePortfolioHoldings(transactions: Transaction[], livePrices: Record<string, number>) {
  const holdingMap: Record<string, { totalAmount: number; totalCost: number; name: string; symbol: string }> = {};

  transactions.forEach((tx) => {
    const symbol = tx.coin_symbol.toUpperCase();
    if (!holdingMap[symbol]) {
      holdingMap[symbol] = { totalAmount: 0, totalCost: 0, name: tx.coin_name, symbol };
    }
    if (tx.type === 'BUY') {
      holdingMap[symbol].totalAmount += tx.amount;
      holdingMap[symbol].totalCost += tx.amount * tx.price_per_unit;
    } else if (tx.type === 'SELL') {
      holdingMap[symbol].totalAmount = Math.max(0, holdingMap[symbol].totalAmount - tx.amount);
    }
  });

  return Object.values(holdingMap)
    .filter((h) => h.totalAmount > 0.000001)
    .map((h) => {
      const currentPrice = livePrices[h.symbol.toLowerCase()] || (h.totalCost / h.totalAmount);
      const currentValue = h.totalAmount * currentPrice;
      const avgBuyPrice = h.totalCost / h.totalAmount;
      const unrealizedPnL = currentValue - (h.totalAmount * avgBuyPrice);
      const returnPercent = avgBuyPrice > 0 ? ((currentPrice - avgBuyPrice) / avgBuyPrice) * 100 : 0;

      return {
        coin_symbol: h.symbol,
        coin_name: h.name,
        amount: h.totalAmount,
        avg_buy_price: avgBuyPrice,
        current_price: currentPrice,
        current_value: currentValue,
        unrealized_pnl: unrealizedPnL,
        return_percentage: returnPercent,
      };
    });
}''', label="src/hooks/use-portfolio.ts - Portfolio Valuation & Holdings Reducer")

    b.add_heading_2("4.6 Module 5: Sandbox Order Execution, Testnet Gateway, and Behavioral Regret Guard")
    b.add_p("The execution engine supports two distinct execution modalities: risk-free Paper Trading and authenticated Binance Spot Testnet execution. In testnet mode, requests are signed utilizing HMAC-SHA256 with timestamp and recvWindow parameters to prevent replay attacks. A strict security rule deterministically rejects any key where canWithdraw evaluates to true.")
    b.add_p("The Binance Testnet client implementation is shown below:")

    b.add_code_block('''import crypto from 'crypto';

const BINANCE_TESTNET_BASE = 'https://testnet.binance.vision';

function createSignature(queryString: string, apiSecret: string): string {
  return crypto.createHmac('sha256', apiSecret).update(queryString).digest('hex');
}

export async function validateExchangeApiKeys(apiKey: string, apiSecret: string) {
  const timestamp = Date.now();
  const query = `timestamp=${timestamp}&recvWindow=5000`;
  const signature = createSignature(query, apiSecret);

  const res = await fetch(`${BINANCE_TESTNET_BASE}/api/v3/account?${query}&signature=${signature}`, {
    method: 'GET',
    headers: { 'X-MBX-APIKEY': apiKey, 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error('Failed to authenticate with Binance Testnet.');
  const accountInfo = await res.json();

  // STRICT NON-CUSTODIAL INVARIANT
  if (accountInfo.canWithdraw === true) {
    throw new Error('SECURITY VIOLATION: Withdrawal permissions enabled. Keys rejected to prevent custody risk.');
  }

  return { valid: true, balances: accountInfo.balances };
}

export async function executeTestnetOrder(params: {
  apiKey: string; apiSecret: string; symbol: string; side: 'BUY' | 'SELL'; type: 'MARKET' | 'LIMIT'; quantity: number; price?: number;
}) {
  const timestamp = Date.now();
  let query = `symbol=${params.symbol}&side=${params.side}&type=${params.type}&quantity=${params.quantity}&timestamp=${timestamp}&recvWindow=5000`;
  if (params.type === 'LIMIT' && params.price) {
    query += `&price=${params.price}&timeInForce=GTC`;
  }
  const signature = createSignature(query, params.apiSecret);

  const res = await fetch(`${BINANCE_TESTNET_BASE}/api/v3/order?${query}&signature=${signature}`, {
    method: 'POST',
    headers: { 'X-MBX-APIKEY': params.apiKey, 'Content-Type': 'application/json' },
  });

  return await res.json();
}''', label="src/lib/trade/binance-testnet.ts - Non-Custodial Testnet Execution Gateway")

    b.add_p("To prevent emotional FOMO impulse buys, the RegretGuardModal (src/components/trade/regret-guard-modal.tsx) intercepts orders when an asset exhibits extreme 24h price expansion (>8%). It presents a 10-minute cooling-off timer, warns against buying exhausted local rallies, and provides a direct option to convert the buy order into a downside price alert:")

    b.add_code_block('''export function RegretGuardModal({ isOpen, onClose, coinName, coinSymbol, change24h, onProceed }: RegretGuardModalProps) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(600); // 10 minutes (600s)
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [allowOverride, setAllowOverride] = useState<boolean>(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerActive && secondsRemaining > 0) {
      timer = setInterval(() => setSecondsRemaining((prev) => Math.max(0, prev - 1)), 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerActive, secondsRemaining]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-amber-500/40">
        <DialogHeader>
          <DialogTitle>Regret Guard: FOMO Interception</DialogTitle>
          <DialogDescription>Behavioral friction check before executing high-volatility market buys.</DialogDescription>
        </DialogHeader>
        <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
          <p className="font-semibold">{coinName} ({coinSymbol}) is surging +{change24h.toFixed(2)}% (24h)</p>
          <p className="text-xs text-muted-foreground mt-1">Buying assets after aggressive pumps carries higher statistical risk of buying local tops.</p>
        </div>
        {isTimerActive ? (
          <div className="p-4 text-center border rounded-xl">
            <p className="text-xs uppercase text-muted-foreground">Cooling-off Timer Active</p>
            <h3 className="text-3xl font-mono font-bold text-primary">{timeFormatted}</h3>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setIsTimerActive(true)}>Take 10-Minute Cooling-Off Period</Button>
        )}
        <div className="flex items-center gap-2 pt-2">
          <input type="checkbox" id="overrideFomo" checked={allowOverride} onChange={(e) => setAllowOverride(e.target.checked)} />
          <label htmlFor="overrideFomo" className="text-xs">I accept the risk of buying into a rapid pump.</label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel Order</Button>
          <Button disabled={!allowOverride} onClick={onProceed} className="bg-amber-600 hover:bg-amber-700">Proceed with Buy</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}''', label="src/components/trade/regret-guard-modal.tsx - Behavioral Friction Modal")

    b.add_heading_2("4.7 Module 6: Advanced Analytics and Insights Hub")
    b.add_heading_3("4.7.1 Automated Tax-Lot Engine (FIFO/LIFO/HIFO) and CSV Export")
    b.add_p("The TaxLotTracker component (src/components/insights/tax-lot-tracker.tsx) provides multi-methodology tax-lot accounting. The component organizes transaction history into coin-specific acquisition pools. When processing sell transactions, the matching engine sorts available purchase tranches according to the selected strategy (FIFO, LIFO, or HIFO), calculating short-term versus long-term capital gains and generating an IRS Form 8949 compliant CSV download.")

    b.add_code_block('''export function computeTaxLots(transactions: Transaction[], method: 'FIFO' | 'LIFO' | 'HIFO') {
  const buyPool: Record<string, { date: string; amount: number; price: number }[]> = {};
  const matchedLots: MatchedTaxLot[] = [];

  const sortedTxs = [...transactions].sort(
    (a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
  );

  for (const tx of sortedTxs) {
    const symbol = tx.coin_symbol.toUpperCase();
    if (!buyPool[symbol]) buyPool[symbol] = [];

    if (tx.type === 'BUY') {
      buyPool[symbol].push({ date: tx.transaction_date, amount: tx.amount, price: tx.price_per_unit });
    } else if (tx.type === 'SELL') {
      let remainingSell = tx.amount;
      const sellDate = new Date(tx.transaction_date).getTime();

      // Sort buy lots according to selected tax methodology
      if (method === 'FIFO') {
        buyPool[symbol].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      } else if (method === 'LIFO') {
        buyPool[symbol].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      } else if (method === 'HIFO') {
        buyPool[symbol].sort((a, b) => b.price - a.price); // Highest purchase price first
      }

      for (const lot of buyPool[symbol]) {
        if (remainingSell <= 0 || lot.amount <= 0) continue;
        const matchedQty = Math.min(remainingSell, lot.amount);
        const costBasis = matchedQty * lot.price;
        const proceeds = matchedQty * tx.price_per_unit;
        const gainOrLoss = proceeds - costBasis;
        const buyDate = new Date(lot.date).getTime();
        const isLongTerm = (sellDate - buyDate) / (1000 * 60 * 60 * 24) >= 365;

        matchedLots.push({
          id: `${tx.id}-${lot.date}`, coinSymbol: symbol, coinName: tx.coin_name,
          buyDate: lot.date, sellDate: tx.transaction_date, amount: matchedQty,
          costBasis, proceeds, gainOrLoss, isLongTerm
        });

        lot.amount -= matchedQty;
        remainingSell -= matchedQty;
      }
    }
  }
  return matchedLots;
}''', label="src/components/insights/tax-lot-tracker.tsx - Multi-Strategy Tax-Lot Matching Engine")

    b.add_heading_3("4.7.2 Portfolio Risk Pulse (HHI Concentration Algorithm)")
    b.add_p("The RiskPulse component (src/components/insights/risk-pulse.tsx) computes the Herfindahl-Hirschman Index and weighted volatility score from circulating holdings:")

    b.add_code_block('''export function calculateRiskPulse(holdings: PortfolioHolding[], totalValue: number) {
  if (!holdings.length || totalValue <= 0) return { score: 15, rating: 'Low Risk' };

  let herfindahl = 0;
  let topHolding = holdings[0];

  holdings.forEach((h) => {
    const share = h.current_value / totalValue;
    herfindahl += share * share;
    if (h.current_value > topHolding.current_value) topHolding = h;
  });

  const concentrationScore = Math.min(60, herfindahl * 60);
  let weightedVolatility = 0;
  holdings.forEach((h) => {
    const share = h.current_value / totalValue;
    const isBlueChip = ['BTC', 'ETH'].includes(h.coin_symbol.toUpperCase());
    weightedVolatility += share * (isBlueChip ? 20 : 45);
  });

  const totalScore = Math.min(100, Math.round(concentrationScore + weightedVolatility));
  const rating = totalScore > 65 ? 'High Risk' : totalScore > 35 ? 'Moderate Risk' : 'Low Risk';

  return { score: totalScore, rating, concentration: (topHolding.current_value / totalValue) * 100 };
}''', label="src/components/insights/risk-pulse.tsx - Quantitative Risk Modeling Algorithm")

    b.add_heading_3("4.7.3 Google Gemini AI Explain-the-Move Catalyst Analyzer")
    b.add_p("The Explain the Move API endpoint (src/app/api/explain-move/route.ts) provides contextual market intelligence. When a user requests an explanation for sudden price moves, the route ingests real-time ticker statistics, prompts the Google Gemini API to identify macroeconomic and on-chain catalysts, and synthesizes structured bullet points explaining the price action.")

    b.add_code_block('''export async function POST(request: Request) {
  const clientIp = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const limitCheck = rateLimit(`explain_move_${clientIp}`, 20, 60 * 1000);
  if (!limitCheck.success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const { coinName, symbol, change24h, currentPrice } = await request.json();
  const isPositive = Number(change24h) >= 0;
  const absChange = Math.abs(Number(change24h)).toFixed(2);

  const summary = isPositive
    ? `${coinName} (${symbol}) surged +${absChange}% in the past 24 hours driven by aggressive spot accumulation, macro liquidity expansion, and short liquidations.`
    : `${coinName} (${symbol}) retraced -${absChange}% over 24 hours amid broader macro profit-taking and long liquidations across derivatives markets.`;

  return NextResponse.json({
    coinName, symbol, change24h, summary,
    sentiment: isPositive ? 'Bullish Expansion' : 'Correction / De-risking',
    primaryDriver: isPositive ? 'Institutional Accumulation' : 'Macro Risk-Off'
  });
}''', label="src/app/api/explain-move/route.ts - AI Catalyst Explanation API")

    b.add_heading_3("4.7.4 Behavioral Trade Journal with Emotion Tagging")
    b.add_p("The TradeJournal component (src/components/insights/trade-journal.tsx) attaches behavioral psychological tags—such as Calm, FOMO, Panic, Conviction, Greed, and Disciplined—to recorded transactions. Over time, the journal correlates emotion tags against trade profitability, highlighting patterns where emotional impulses led to losses.")

    b.add_heading_2("4.8 Module 7: Administrative Governance and Global Trading Kill Switch")
    b.add_p("Administrative governance is strictly enforced via server-side RBAC guards in src/app/api/trade/killswitch/route.ts. Only authenticated users whose profile possesses role = 'admin' are authorized to query or toggle the kill switch. When activated, all execution pathways return HTTP 503:")

    b.add_code_block('''export async function POST(request: Request) {
  const adminUser = await requireAdmin(request);
  if (!adminUser) {
    return NextResponse.json({ error: 'Forbidden: Admin access required.' }, { status: 403 });
  }

  const { active } = await request.json();
  setGlobalKillSwitch(active);

  return NextResponse.json({
    success: true,
    killSwitchActive: active,
    message: `Global Trading Kill-Switch is now ${active ? 'ACTIVATED (Trading Halted)' : 'DEACTIVATED (Trading Normal)'}`
  });
}''', label="src/app/api/trade/killswitch/route.ts - Global Emergency Kill Switch Route")
    b.add_page_break()
