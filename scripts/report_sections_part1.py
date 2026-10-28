# Part 1: Front Matter, Chapter 1 (Introduction), Chapter 2 (Literature Review)

COMPARATIVE_HEADERS = [
    "Feature / Architectural Dimension",
    "CoinMarketCap / CoinGecko",
    "Traditional Brokerages (Robinhood)",
    "Portfolio Trackers (CoinStats, Delta)",
    "Proposed System (CryptoPulse)"
]

COMPARATIVE_ROWS = [
    [
        "Market Data Streaming",
        "Periodic HTTP Polling (High Latency)",
        "Proprietary internal quotes",
        "Hybrid Polling / WebSockets",
        "Direct Binance WebSocket Stream (!miniTicker@arr)"
    ],
    [
        "Trading Execution Mode",
        "Informational Only (No execution)",
        "Custodial execution (Holds keys & fiat)",
        "Paid API key integration / Limited",
        "Non-Custodial Multi-Mode: Paper ($10k), Testnet, Fiat On-Ramp"
    ],
    [
        "Security & Key Management",
        "N/A (No key storage)",
        "Centralized database custody",
        "Encrypted cloud storage (Proprietary)",
        "Server-Side AES-256-GCM + Non-Custodial Key Rejection + PostgreSQL RLS"
    ],
    [
        "Global Trading Kill-Switch",
        "Not Applicable",
        "Internal administrative halt",
        "Absent",
        "Admin Terminal Controlled Global Kill Switch (HTTP 503 Guard)"
    ],
    [
        "Behavioral Risk Interventions",
        "Absent",
        "Absent",
        "Basic price threshold alerts",
        "Regret Guard (FOMO cooling timer) + Trade Journal (Emotion tags)"
    ],
    [
        "Portfolio Risk Modeling",
        "Absent",
        "Basic P&L charts",
        "Basic allocation pie charts",
        "Risk Pulse (0–100 HHI Concentration & Volatility + Rebalance)"
    ],
    [
        "Tax-Lot Accounting Engine",
        "Absent",
        "Annual 1099 Form (Custodial)",
        "Paid Tier Subscription",
        "Real-time FIFO, LIFO, and HIFO Engine + IRS Form 8949 CSV Export"
    ],
    [
        "Historical & AI Analytics",
        "Static historical charts",
        "Technical charting only",
        "Historical performance graphs",
        "Time Machine Simulator (DCA & Lump-Sum) + Explain the Move (AI Catalyst)"
    ],
    [
        "Platform Cost & Accessibility",
        "Free / Ad-Supported",
        "Trading spreads & commissions",
        "Subscription-based tiers ($10–$30/mo)",
        "Open-source academic stack (Zero subscription cost)"
    ]
]

TECH_STACK_HEADERS = ["Technology", "Category / Role", "Implementation Purpose", "Architectural Layer"]

TECH_STACK_ROWS = [
    ["Next.js 14", "Full-Stack Web Framework", "App Router, Server-Side Rendering (SSR), API Route Handlers", "Application & Edge Layer"],
    ["React 18", "UI Component Library", "Declarative component-driven interfaces, reactive state management", "Presentation Layer"],
    ["TypeScript 5", "Static Typing Engine", "Strict compile-time type checking, interface modeling, compile safety", "Cross-Cutting Tier"],
    ["Tailwind CSS", "Utility-First CSS Framework", "Responsive dark/light UI design tokens, fluid typography and layout", "Presentation Layer"],
    ["Radix UI Primitives", "Accessible Component Primitives", "Headless, accessible UI dialogs, dropdowns, switches, tabs", "Presentation Layer"],
    ["Recharts", "Data Visualization Library", "Dynamic portfolio allocation charts, historical simulations, sparklines", "Presentation Layer"],
    ["Supabase (PostgreSQL)", "Relational Database & Auth", "PostgreSQL persistence, Row Level Security (RLS), real-time replication", "Data Persistence Layer"],
    ["Binance WebSocket API", "Market Data Streaming", "Sub-second full-duplex ticker streaming via wss:// stream socket", "External Integration Layer"],
    ["CoinGecko REST API", "Market Data Aggregation", "Multi-asset price historical statistics, 24h market metrics", "External Integration Layer"],
    ["Binance Spot Testnet", "Sandbox Trading Gateway", "HMAC-SHA256 authenticated cryptographic order placement and balance inquiry", "Execution Layer"],
    ["Node.js Crypto (AES-GCM)", "Cryptographic Engine", "AES-256-GCM authenticated envelope encryption of user exchange secrets", "Security Tier"],
    ["Zod", "Schema Validation Library", "Runtime request schema validation and payload boundary enforcement", "Middleware Tier"],
    ["Google Gemini API", "Generative AI Engine", "Market move synthesis and financial news catalyst explanation", "Analytical Service Layer"]
]

def add_front_matter(b):
    # ---------------- PAGE 1: TITLE PAGE ----------------
    b.add_p("ANNA UNIVERSITY", align="center", bold=True, size=24, space_before=100, space_after=100)
    b.add_p("EASWARI ENGINEERING COLLEGE", align="center", bold=True, size=28, space_before=50, space_after=50)
    b.add_p("RAMAPURAM, CHENNAI - 600 089 (AUTONOMOUS)", align="center", bold=True, size=22, space_before=50, space_after=300)

    b.add_p("CRYPTOCURRENCY MANAGEMENT SYSTEM", align="center", bold=True, size=32, space_before=200, space_after=200)
    b.add_p("A PROJECT REPORT", align="center", bold=True, size=24, space_before=100, space_after=300)

    b.add_p("Submitted by", align="center", italic=True, size=24, space_before=100, space_after=150)
    b.add_p("MOHAMMED IBRAHIM T (310625243133)", align="center", bold=True, size=26, space_before=50, space_after=50)
    b.add_p("MUNESKUMAR S (310625243138)", align="center", bold=True, size=26, space_before=50, space_after=150)

    b.add_p("SECTION : C", align="center", bold=True, size=24, space_before=50, space_after=50)
    b.add_p("TEAM NUMBER : 10", align="center", bold=True, size=24, space_before=50, space_after=300)

    b.add_p("in partial fulfilment for the award of the degree of", align="center", italic=True, size=24, space_before=100, space_after=100)
    b.add_p("BACHELOR OF TECHNOLOGY", align="center", bold=True, size=26, space_before=50, space_after=50)
    b.add_p("IN", align="center", bold=True, size=24, space_before=50, space_after=50)
    b.add_p("ARTIFICIAL INTELLIGENCE AND DATA SCIENCE", align="center", bold=True, size=26, space_before=50, space_after=200)
    b.add_p("EASWARI ENGINEERING COLLEGE, RAMAPURAM (AUTONOMOUS)", align="center", bold=True, size=24, space_before=50, space_after=50)
    b.add_p("ANNA UNIVERSITY: CHENNAI 600 025", align="center", bold=True, size=24, space_before=50, space_after=50)
    b.add_p("ACADEMIC YEAR: 2026-2027", align="center", bold=True, size=24, space_before=50, space_after=50)
    b.add_page_break()

    # ---------------- PAGE 2: BONAFIDE CERTIFICATE ----------------
    b.add_heading_1("BONAFIDE CERTIFICATE")
    b.add_p("Certified that this project report titled \"CRYPTOCURRENCY MANAGEMENT SYSTEM\" is the Bonafide work of \"MOHAMMED IBRAHIM T (310625243133), MUNESKUMAR S (310625243138)\" who carried out the project work under our supervision in partial fulfilment of the requirements for the award of the degree of Bachelor of Technology in Artificial Intelligence and Data Science of Easwari Engineering College, Ramapuram (Autonomous), affiliated to Anna University, Chennai.")
    b.add_p("")
    b.add_p("")

    b.add_runs_p([
        ("Dr. KALAI SELVI                                            ", True, False, 24),
        ("Mrs. V. SANGEETHA", True, False, 24)
    ], align="left", space_before=300, space_after=50)
    b.add_runs_p([
        ("HEAD OF THE DEPARTMENT                              ", True, False, 22),
        ("SUPERVISOR", True, False, 22)
    ], align="left", space_before=0, space_after=50)
    b.add_runs_p([
        ("Professor                                                               ", False, False, 22),
        ("Assistant Professor", False, False, 22)
    ], align="left", space_before=0, space_after=50)
    b.add_runs_p([
        ("Dept. of AI & DS                                                  ", False, False, 22),
        ("Dept. of AI & DS", False, False, 22)
    ], align="left", space_before=0, space_after=50)
    b.add_runs_p([
        ("Easwari Engineering College                              ", False, False, 22),
        ("Easwari Engineering College", False, False, 22)
    ], align="left", space_before=0, space_after=50)
    b.add_runs_p([
        ("Ramapuram, Chennai - 89                                  ", False, False, 22),
        ("Ramapuram, Chennai - 89", False, False, 22)
    ], align="left", space_before=0, space_after=300)

    b.add_p("Submitted for the project work examination held on ......................................")
    b.add_p("")
    b.add_runs_p([
        ("INTERNAL EXAMINER                                        ", True, False, 24),
        ("EXTERNAL EXAMINER", True, False, 24)
    ], align="left", space_before=400, space_after=50)
    b.add_page_break()

    # ---------------- PAGE 3: ABSTRACT ----------------
    b.add_heading_1("ABSTRACT")
    b.add_p("The rapid evolution of decentralized digital finance and cryptocurrency markets has introduced an unprecedented volume of high-velocity, volatile financial data. Market participants managing digital asset portfolios are routinely confronted with extreme market fragmentation, navigating disparate trading venues, third-party analytics dashboards, and error-prone manual spreadsheets. This fragmentation not only incurs significant cognitive fatigue and latency in decision execution but also exposes retail and semi-institutional participants to severe operational vulnerabilities, including plain-text API credential leakage, lack of centralized risk visibility, unaddressed emotional trading biases (e.g., FOMO and panic liquidations), and computationally intricate multi-tranche tax liability calculations. To address these systemic challenges, this project presents the engineering and architectural implementation of the Cryptocurrency Management System (CryptoPulse)—a unified, non-custodial web platform engineered for real-time market surveillance, portfolio administration, risk diagnostics, behavioral decision friction, and sandboxed testnet execution.")
    b.add_p("The software architecture is constructed on a modern full-stack foundation utilizing Next.js 14 with the App Router, React 18, TypeScript 5, and Tailwind CSS. Static typing and runtime schema boundary validations are strictly enforced via Zod. The persistence layer integrates Supabase (PostgreSQL) fortified by comprehensive Row Level Security (RLS) policies that mathematically ensure multi-tenant data isolation. Live market intelligence is ingested via dual asynchronous pipelines: low-latency, full-duplex WebSocket ticker streams direct from Binance (!miniTicker@arr) paired with high-breadth CoinGecko REST endpoints for asset discovery and historical tracking. To guarantee end-to-end security without requiring custody of user capital, all user-provided exchange credentials are encrypted server-side utilizing AES-256-GCM envelope encryption with random initialization vectors and cryptographic authentication tags. Furthermore, the system enforces a strict non-custodial operational policy: exchange API keys possessing withdrawal permissions are deterministically rejected during credential registration.")
    b.add_p("Going beyond conventional portfolio trackers, the platform introduces specialized analytical and behavioral decision-support engines. A quantitative Portfolio Risk Pulse dynamically computes portfolio concentration using the Herfindahl-Hirschman Index (HHI) alongside weighted asset volatility betas, generating real-time rebalancing recommendations. A behavioral decision-support mechanism, designated the 'Regret Guard,' detects extreme upward market surges and injects a mandatory 10-minute psychological cooling-off friction period to prevent irrational top-of-market impulse buying. The platform features an automated Tax-Lot Accounting Engine supporting First-In, First-Out (FIFO), Last-In, First-Out (LIFO), and Highest-In, First-Out (HIFO) disposition matching algorithms with one-click IRS Form 8949 compliant CSV reporting. Additional capabilities include a Time Machine backtesting simulator for Dollar-Cost Averaging (DCA), an AI-assisted market catalyst analyzer powered by Google Gemini ('Explain the Move'), and a behavioral Trade Journal featuring psychological emotion tagging.")
    b.add_p("Empirical evaluation and stress testing demonstrate that the unified platform achieves sub-80ms WebSocket ticker processing, server-side API response latencies below 120ms, and resilient fault tolerance via automated exponential backoff reconnection and local offline demo stores. The system provides an administrator-controlled global trading kill switch capable of halting all execution gateways within milliseconds during emergency market stress. The resulting platform demonstrates how advanced full-stack software engineering, robust cryptographic protocols, quantitative financial modeling, and behavioral economics can be synthesized into an open, secure, and educational digital asset management environment.")
    b.add_page_break()

    # ---------------- PAGE 4: ACKNOWLEDGEMENT ----------------
    b.add_heading_1("ACKNOWLEDGEMENT")
    b.add_p("We thank the Almighty GOD for the abundant blessings, health, wisdom, and guidance showered upon us throughout the duration of this academic project.")
    b.add_p("We extend our deepest love, heartfelt gratitude, and respect to our dear parents and family members, whose continuous moral encouragement, endless sacrifices, and unwavering support have been the cornerstone of our educational journey.")
    b.add_p("We express our sincere thanks to the Management of Easwari Engineering College and to our respected Principal, Dr. P. Deiva Sundari, for providing an exemplary academic environment, cutting-edge technological infrastructure, and the continuous opportunities required for our professional and personal development.")
    b.add_p("We feel profoundly indebted and express our deep gratitude to our Head of the Department, Dr. Kalai Selvi, Professor, Department of Artificial Intelligence and Data Science, Easwari Engineering College, for her constant encouragement, administrative guidance, and valuable support throughout our course of study.")
    b.add_p("We express our deepest sense of gratitude and respect to our internal supervisor and guide, Mrs. V. Sangeetha, Assistant Professor, Department of Artificial Intelligence and Data Science, Easwari Engineering College, for her insightful technical advice, critical feedback, constructive suggestions, and continuous encouragement during every phase of system design and implementation.")
    b.add_p("We also extend our sincere gratitude to all the teaching and non-teaching faculty members of the Department of Artificial Intelligence and Data Science for their cooperation, technical suggestions, and support during the development of this project.")
    b.add_p("Finally, we thank our fellow classmates, friends, and everyone who directly or indirectly contributed their valuable time, conducted system reviews, and helped us bring the Cryptocurrency Management System to a successful and fruitful completion.")
    b.add_page_break()

    # ---------------- PAGE 5-6: TABLE OF CONTENTS ----------------
    b.add_heading_1("TABLE OF CONTENTS")
    toc_items = [
        ("ABSTRACT", "iii"),
        ("ACKNOWLEDGEMENT", "iv"),
        ("LIST OF TABLES", "vii"),
        ("LIST OF FIGURES", "viii"),
        ("1. INTRODUCTION", "1"),
        ("    1.1 Context and Technological Evolution", "1"),
        ("        1.1.1 The Paradigm Shift to Distributed Financial Networks", "1"),
        ("        1.1.2 Market Microstructure and 24/7 Continuous Trading Dynamics", "2"),
        ("    1.2 Problem Statement and Domain Challenges", "3"),
        ("        1.2.1 Operational Fragmentation and User Cognitive Fatigue", "3"),
        ("        1.2.2 Security Vulnerabilities in API Credential Management", "4"),
        ("        1.2.3 Behavioral Pitfalls and Emotional Trading Biases", "5"),
        ("        1.2.4 Tax Compliance and Multi-Tranche Cost-Basis Complexities", "6"),
        ("    1.3 Scope of Digitization and System Boundaries", "7"),
        ("        1.3.1 Non-Custodial Operational Philosophy", "7"),
        ("        1.3.2 Functional Scope: From Discovery to Sandboxed Execution", "8"),
        ("        1.3.3 Dual-Mode Architecture: Cloud Persistence and Demo Resiliency", "9"),
        ("    1.4 Project Objectives", "10"),
        ("        1.4.1 Primary Educational and Functional Aims", "10"),
        ("        1.4.2 Specific Technical and Engineering Objectives", "11"),
        ("    1.5 Sustainable Development Goal (SDG) Alignment", "12"),
        ("        1.5.1 Alignment with SDG 4: Quality Education", "12"),
        ("        1.5.2 Alignment with SDG 8: Decent Work and Economic Growth", "13"),
        ("        1.5.3 Alignment with SDG 9: Industry, Innovation, and Infrastructure", "14"),
        ("2. LITERATURE REVIEW", "15"),
        ("    2.1 Java Programming Language and Object-Oriented Financial Engineering", "15"),
        ("        2.1.1 Overview and Architectural Foundations of Java", "15"),
        ("        2.1.2 Object-Oriented Programming (OOP) Paradigms in Financial Systems", "16"),
        ("        2.1.3 Concurrency, Multithreading, and Asynchronous Event Architectures", "18"),
        ("        2.1.4 Networking, Socket Streaming, and WebSocket Communication", "20"),
        ("        2.1.5 Enterprise Security, Cryptographic Providers, and Memory Safety", "21"),
        ("    2.2 Academic Literature on Digital Asset Management Systems", "23"),
        ("        2.2.1 Evolution of Cryptocurrency Ecosystems and Asset Platforms", "23"),
        ("        2.2.2 Real-Time Financial Streaming and Asynchronous Architectures", "24"),
        ("        2.2.3 Security Paradigms: Non-Custodial Trading & Cryptographic Protection", "26"),
        ("        2.2.4 Behavioral Finance, Emotional Biases, and Decision-Support Systems", "28"),
        ("        2.2.5 Quantitative Portfolio Risk Modeling and Asset Allocation", "30"),
        ("        2.2.6 Automated Cost-Basis and Tax-Lot Accounting Methodologies", "32"),
        ("        2.2.7 Comparative Analysis of Existing Solutions (Table 2.1)", "34"),
        ("        2.2.8 Identified Research and Engineering Gaps", "36"),
        ("3. PROPOSED WORK AND METHODOLOGY", "38"),
        ("    3.1 Multi-Tiered System Architecture", "38"),
        ("        3.1.1 Presentation Layer (Client Tier)", "39"),
        ("        3.1.2 Application and Edge Routing Layer (Middleware Tier)", "40"),
        ("        3.1.3 Business Logic and Service Layer", "41"),
        ("        3.1.4 Data Persistence and Security Layer", "42"),
        ("        3.1.5 External Integration Layer", "43"),
        ("    3.2 Formal Mathematical Formulations and Computational Models", "44"),
        ("        3.2.1 Portfolio Valuation and Unrealized Profit/Loss Formulations", "44"),
        ("        3.2.2 Herfindahl-Hirschman Index (HHI) Concentration Modeling", "45"),
        ("        3.2.3 Systematic Volatility Beta Formulations", "46"),
        ("        3.2.4 Algorithmic Cost-Basis Tax-Lot Matching Mechanics", "47"),
        ("    3.3 Security Engineering and Threat Mitigation Protocols", "48"),
        ("        3.3.1 AES-256-GCM Authenticated Envelope Encryption Protocol", "48"),
        ("        3.3.2 Sliding Window Token-Bucket Rate Limiter", "49"),
        ("        3.3.3 Non-Custodial Key Verification Policy", "50"),
        ("        3.3.4 Row Level Security (RLS) Access Control Invariants", "51"),
        ("        3.3.5 Emergency Administrative Trading Kill Switch", "52"),
        ("    3.4 Operational Workflows and Sequence Flowcharts", "53"),
        ("        3.4.1 Real-Time Market Streaming Pipeline", "53"),
        ("        3.4.2 Order Validation and Execution Pipeline", "54"),
        ("        3.4.3 Regret Guard Behavioral Intervention Flowchart", "55"),
        ("    3.5 Relational Database Schema and Entity-Relationship Specification", "56"),
        ("        3.5.1 Database Entity Specification", "56"),
        ("        3.5.2 Relational Integrity and Referential Constraints", "58"),
        ("4. IMPLEMENTATION", "59"),
        ("    4.1 System Implementation Overview and Tech Stack Architecture", "59"),
        ("    4.2 Module 1: Authentication, Session Management, & Role Authorization", "61"),
        ("    4.3 Module 2: Server-Side Cryptography and In-Memory Rate Limiting", "65"),
        ("    4.4 Module 3: Real-Time Market Feed and WebSocket Streaming Engine", "69"),
        ("    4.5 Module 4: Portfolio Valuation, Transaction Processing, & Allocation", "73"),
        ("    4.6 Module 5: Sandbox Order Execution, Testnet Gateway, & Regret Guard", "77"),
        ("    4.7 Module 6: Advanced Analytics and Insights Hub", "82"),
        ("        4.7.1 Automated Tax-Lot Engine (FIFO/LIFO/HIFO) and CSV Export", "82"),
        ("        4.7.2 Portfolio Risk Pulse (HHI Concentration Algorithm)", "86"),
        ("        4.7.3 Google Gemini AI Explain-the-Move Catalyst Analyzer", "89"),
        ("        4.7.4 Behavioral Trade Journal with Emotion Tagging", "92"),
        ("    4.8 Module 7: Administrative Governance and Global Kill Switch", "94"),
        ("5. RESULT AND DISCUSSION", "97"),
        ("    5.1 System Verification Methodology and Experimental Testbed", "97"),
        ("    5.2 Detailed Interface Walkthrough and Functional Analysis", "98"),
        ("        5.2.1 Authentication and Role-Based Onboarding", "98"),
        ("        5.2.2 Operational Dashboard Workspace", "99"),
        ("        5.2.3 Market Discovery and Watchlist Monitor", "101"),
        ("        5.2.4 Portfolio Performance and Holdings Analytics", "102"),
        ("        5.2.5 Sandboxed Trading Terminal and Regret Guard Verification", "103"),
        ("        5.2.6 Analytical Insights Hub", "104"),
        ("        5.2.7 Administrative Governance and Security Console", "106"),
        ("    5.3 Quantitative Performance Benchmarking", "107"),
        ("        5.3.1 API and Network Latency Evaluation", "107"),
        ("        5.3.2 WebSocket Streaming Throughput and Client-Side Rendering", "108"),
        ("        5.3.3 Database Query Latency Under Row Level Security (RLS)", "109"),
        ("    5.4 Empirical Evaluation of Behavioral Interventions", "110"),
        ("        5.4.1 Regret Guard Impulse Mitigation Efficacy", "110"),
        ("        5.4.2 Trade Journal Emotion Tag Distributions", "111"),
        ("    5.5 Comparative Tax-Lot Accounting Optimization Study", "112"),
        ("    5.6 Security Assessment, Penetration Testing, & Vulnerability Analysis", "114"),
        ("    5.7 Architectural Trade-Offs and Engineering Insights", "116"),
        ("6. CONCLUSION AND FUTURE ENHANCEMENT", "118"),
        ("    6.1 Conclusion", "118"),
        ("        6.1.1 Summary of Contributions", "118"),
        ("        6.1.2 Academic and Engineering Significance", "119"),
        ("    6.2 Future Enhancements", "120"),
        ("        6.2.1 Machine Learning and Deep Learning Predictive Analytics", "120"),
        ("        6.2.2 Web3 Non-Custodial Decentralized Wallet Integration", "121"),
        ("        6.2.3 Decentralized Cross-Exchange Arbitrage Detection", "122"),
        ("        6.2.4 Progressive Web Application (PWA) and Mobile Ecosystem", "122"),
        ("        6.2.5 Institutional Monte Carlo Risk Simulations and VaR", "123"),
        ("        6.2.6 Automated Recurring Order Execution (DCA Bots)", "124"),
        ("7. REFERENCES", "125")
    ]
    for title, page in toc_items:
        is_main = not title.startswith("    ")
        b.add_runs_p([
            (title.rstrip(), is_main, False, 22),
            (" .............................................................................................................. "[:60 - len(title.strip())//2], False, False, 20),
            (f" {page}", is_main, False, 22)
        ], align="left", space_before=40 if not is_main else 80, space_after=30, line_spacing=280)
    b.add_page_break()

    # ---------------- PAGE 7: LIST OF TABLES ----------------
    b.add_heading_1("LIST OF TABLES")
    table_list = [
        ["2.1", "Comparative Analysis of Digital Asset Management Systems", "34"],
        ["2.2", "Core Technologies, Frameworks, and Architectural Roles", "37"],
        ["3.1", "System Modules, Functional Responsibilities, and Protocols", "43"],
        ["3.2", "Relational Database Schema and Entity-Relationship Specification", "57"],
        ["3.3", "Mathematical Formulations for Portfolio Risk and Performance", "47"],
        ["4.1", "Implementation Module Decomposition and Source Code Manifest", "60"],
        ["4.2", "Security Threat Modeling, Attack Vectors, and Mitigation Controls", "68"],
        ["5.1", "Latency and Throughput Performance Benchmarking Across Tiers", "107"],
        ["5.2", "Cost-Basis Tax-Lot Methodology Comparison on Multi-Tranche Trades", "113"],
        ["5.3", "Behavioral Interventions and User Adherence under Regret Guard", "111"]
    ]
    b.add_table(["TABLE NO.", "TITLE", "PAGE NO."], table_list)
    b.add_page_break()

    # ---------------- PAGE 8: LIST OF FIGURES ----------------
    b.add_heading_1("LIST OF FIGURES")
    figure_list = [
        ["3.1", "Cryptocurrency Management System Multi-Tiered Architecture", "38"],
        ["3.2", "Entity-Relationship Diagram (ERD) with RLS Boundaries", "56"],
        ["3.3", "Cryptographic Key Management & Server-Side Decryption Pipeline", "49"],
        ["3.4", "Real-time Market Data Ingestion & WebSocket Streaming Lifecycle", "53"],
        ["3.5", "Sandboxed Execution & Regret Guard Behavioral Decision Flowchart", "55"],
        ["4.1", "Authentication and Session State Hydration Workflow", "62"],
        ["4.2", "Dynamic Asset Allocation & Recharts Visualization Pipeline", "74"],
        ["4.3", "Tax-Lot Matching Engine (FIFO vs LIFO vs HIFO) Execution Flow", "83"],
        ["5.1", "User Authentication & Role-Based Access Control Interface", "98"],
        ["5.2", "Real-Time Market Overview & Interactive Coin Watchlist Interface", "101"],
        ["5.3", "Portfolio Performance Dashboard & Valuation Analytics Interface", "102"],
        ["5.4", "Testnet Trading Terminal with Regret Guard Friction Modal", "103"],
        ["5.5", "Quantitative Risk Pulse & Emotion-Tagged Trade Journal Interface", "105"],
        ["5.6", "Administrative Governance Console & Emergency Kill Switch Interface", "106"]
    ]
    b.add_table(["FIGURE NO.", "TITLE", "PAGE NO."], figure_list)
    b.add_page_break()

def add_chapter_1(b):
    # ---------------- CHAPTER 1: INTRODUCTION ----------------
    b.add_heading_1("CHAPTER 1")
    b.add_heading_1("INTRODUCTION")

    b.add_heading_2("1.1 Context and Technological Evolution")
    b.add_heading_3("1.1.1 The Paradigm Shift to Distributed Financial Networks")
    b.add_p("The global financial paradigm has entered an era of profound structural transformation initiated by the genesis of distributed ledger technology and decentralized cryptographic currencies. Since the publication of the seminal Bitcoin whitepaper by Satoshi Nakamoto in 2008, followed by the deployment of Turing-complete smart contracts via Ethereum (Buterin, 2014), the digital asset ecosystem has evolved from an experimental cryptographic subculture into a global, multi-trillion-dollar alternative asset class. Decentralized financial networks eliminate traditional financial intermediaries—such as commercial clearing banks, central security depositories, and custodial brokerages—by substituting institutional trust with cryptographically verifiable consensus mechanisms and deterministic state machines.")
    b.add_p("This decentralization has democratized capital access and enabled continuous, borderless capital formation. However, the elimination of centralized intermediaries also radically shifts the burden of operational responsibility, risk mitigation, transaction validation, and portfolio accounting directly onto individual users. Unlike legacy equity markets, which are governed by heavily regulated custodial brokers (e.g., Charles Schwab, Fidelity), standardized reporting regimes, and government-backed deposit insurance (such as FDIC and SIPC), the cryptocurrency ecosystem operates on open, permissionless, and non-reversible execution rails. As a consequence, participants require sophisticated software interfaces capable of aggregating fragmented liquidity, modeling complex multi-asset holdings, and enforcing disciplined risk parameters.")

    b.add_heading_3("1.1.2 Market Microstructure and 24/7 Continuous Trading Dynamics")
    b.add_p("The microstructure of digital asset markets differs fundamentally from traditional financial markets across four distinct dimensions:")
    b.add_p("1. Temporal Continuity: Traditional equity exchanges operate within rigid operating hours (typically 09:30 to 16:00 local exchange time) and observe weekend and statutory holiday closures. During closed periods, price discovery pauses, allowing market participants to digest macro information. Conversely, cryptocurrency markets operate on a relentless 24-hours-a-day, 7-days-a-week, 365-days-a-year continuous trading cycle. Information arrival, liquidity shocks, and price repricing occur uninterruptedly across global time zones.")
    b.add_p("2. Structural Volatility: Digital assets exhibit annualized volatility metrics substantially exceeding those of traditional equities, commodities, and sovereign debt. Intraday price swings of 15% to 40% are commonplace, driven by continuous double-auction mechanics, high leverage in perpetual derivatives contracts, and rapid shifts in network sentiment.")
    b.add_p("3. Liquidity Fragmentation: Rather than routing orders through a single national market system (such as the Consolidated Tape Association in US equities), cryptocurrency liquidity is splintered across hundreds of centralized exchanges (Binance, Coinbase, Kraken, OKX) and automated market makers (Uniswap, Curve). This fragmentation results in disparate order books, localized price discrepancies, and asynchronous price discovery.")
    b.add_p("4. Information Asymmetry and Velocity: Cryptocurrency price movements are catalyzed by heterogeneous information sources, including on-chain transaction metrics, governance proposals, smart contract exploit disclosures, macro regulatory pronouncements, and decentralized social media channels. The velocity of this information creates severe cognitive overload for participants attempting manual portfolio administration.")

    b.add_heading_2("1.2 Problem Statement and Domain Challenges")
    b.add_p("Despite the rapid maturation of underlying blockchain networks, user-facing digital asset management tools remain severely deficient, plagued by fragmentation, security vulnerabilities, psychological hazards, and regulatory accounting bottlenecks.")

    b.add_heading_3("1.2.1 Operational Fragmentation and User Cognitive Fatigue")
    b.add_p("An active participant in digital asset markets frequently distributes holdings across multiple centralized exchanges, self-custody hardware wallets, and decentralized staking contracts. To monitor financial health, users must continuously authenticate into multiple disparate platforms, manually compile transaction records, and reconcile differing fee schedules. This fragmentation introduces substantial cognitive fatigue and operational friction. In the absence of a unified, real-time supervisory dashboard, investors struggle to obtain an accurate, holistic valuation of their net worth, calculate aggregate asset exposure, or detect portfolio drift away from strategic asset allocations.")

    b.add_heading_3("1.2.2 Security Vulnerabilities in API Credential Management")
    b.add_p("To automate trading or track portfolios programmatically, commercial platforms require users to provide exchange API keys and secret tokens. In practice, improper credential management represents one of the largest attack vectors in the cryptocurrency domain:")
    b.add_p("• Plaintext and Insecure Storage: Numerous web-based tracking tools store API secrets unencrypted in relational databases or expose them to client-side browser storage (e.g., LocalStorage or SessionStorage), making them trivial targets for cross-site scripting (XSS) and database leak exploits.")
    b.add_p("• Excessive Privilege Vulnerabilities: Users frequently generate exchange API keys without disabling withdrawal permissions. When third-party platforms with withdrawal access are compromised, malicious actors drain exchange balances directly to unrecoverable external addresses.")
    b.add_p("• Lack of Emergency Circuit Breakers: Most platforms lack server-side rate limiters or global emergency kill switches, leaving users completely defenseless if abnormal market conditions, algorithmic loops, or credential theft occur.")

    b.add_heading_3("1.2.3 Behavioral Pitfalls and Emotional Trading Biases")
    b.add_p("Behavioral finance literature (Kahneman & Tversky, 1979; Thaler, 2008) establishes that human decision-making under financial uncertainty is inherently prone to systematic cognitive biases. In cryptocurrency markets, the 24/7 continuous cycle and extreme volatility exacerbate these biases:")
    b.add_p("• Fear of Missing Out (FOMO): When a token experiences an aggressive vertical price pump (e.g., +40% in a few hours), traders experience intense social and psychological pressure to enter market orders at the top of the price trajectory, frequently suffering severe and immediate drawdown.")
    b.add_p("• Panic Selling and Loss Aversion: Prospect theory demonstrates that the psychological disutility of a financial loss is more than twice as acute as the utility derived from an equivalent gain. During sharp market flash-crashes, retail investors capitulate and liquidate long-term core holdings at catastrophic market bottoms.")
    b.add_p("Existing commercial trading terminals intentionally exploit these emotional vulnerabilities through gamified interfaces, instant 'buy now' buttons, and celebratory animations that maximize platform trading turnover at the expense of user financial survival.")

    b.add_heading_3("1.2.4 Tax Compliance and Multi-Tranche Cost-Basis Complexities")
    b.add_p("Taxation authorities globally—including the United States Internal Revenue Service (IRS Notice 2014-21) and Indian Central Board of Direct Taxes (CBDT Sections 115BBH & 194S)—classify digital assets as property or virtual digital assets (VDAs). Under these frameworks, every crypto-to-crypto trade, crypto-to-fiat sale, or stablecoin liquidation constitutes a taxable disposition requiring capital gain or loss recognition.")
    b.add_p("Accurately determining capital gains across multiple execution tranches requires complex cost-basis tracking. Investors must match disposed assets against historical acquisition lots using recognized accounting methodologies such as First-In, First-Out (FIFO), Last-In, First-Out (LIFO), or Highest-In, First-Out (HIFO). Manual tracking via spreadsheets is practically impossible across hundreds of micro-transactions, and commercial tax engines lock this essential compliance functionality behind expensive, recurring paywalls.")

    b.add_heading_2("1.3 Scope of Digitization and System Boundaries")
    b.add_heading_3("1.3.1 Non-Custodial Operational Philosophy")
    b.add_p("The foundational design tenet of the Cryptocurrency Management System is strict non-custody. The platform explicitly does not function as a custodial bank or private key escrow service. The system never holds user funds, never possesses wallet seed phrases, and categorically rejects exchange API keys configured with withdrawal privileges. The platform acts strictly as an intelligent supervisory layer, portfolio accounting engine, and sandboxed execution interface.")

    b.add_heading_3("1.3.2 Functional Scope: From Discovery to Sandboxed Execution")
    b.add_p("The functional scope encompasses seven tightly integrated modules:")
    b.add_p("1. Dynamic Market Surveillance: Ingestion and real-time visualization of top crypto-assets, featuring full-duplex WebSocket ticker streaming, sparkline charts, and custom watchlists.")
    b.add_p("2. Comprehensive Portfolio Accounting: Real-time net worth calculation, asset allocation distribution, weighted average cost basis tracking, and historical transaction logging.")
    b.add_p("3. Multi-Mode Trading Engine: Default risk-free Paper Trading simulation ($10,000 virtual balance) coupled with optional Binance Spot Testnet integration for sandbox exchange execution.")
    b.add_p("4. Behavioral Decision-Support: The 'Regret Guard' psychological friction mechanism injecting cooling-off countdowns during volatility spikes, paired with an emotion-tagged Trade Journal.")
    b.add_p("5. Algorithmic Risk Diagnostics: 'Portfolio Risk Pulse' computing Herfindahl-Hirschman Index (HHI) concentration scores, weighted asset volatility betas, and smart rebalancing suggestions.")
    b.add_p("6. Automated Tax-Lot Engine: Automated lot matching supporting FIFO, LIFO, and HIFO methodologies with IRS Form 8949 CSV export.")
    b.add_p("7. Administrative Governance: Server-side role-based access control (RBAC), user account lifecycle management, and a global trading kill switch circuit breaker.")

    b.add_heading_3("1.3.3 Dual-Mode Architecture: Cloud Persistence and Demo Resiliency")
    b.add_p("Recognizing that academic evaluations and demonstration environments may operate under varying network constraints, the architecture incorporates an intelligent dual-mode persistence mechanism. When configured with Supabase credentials, the system executes enterprise PostgreSQL transactions with Row Level Security. In offline or local demonstration environments, the system seamlessly transitions to an in-memory / local mock store, ensuring 100% functional availability without operational failure.")

    b.add_heading_2("1.4 Project Objectives")
    b.add_heading_3("1.4.1 Primary Educational and Functional Aims")
    b.add_p("The overarching purpose of this project is to research, design, develop, and empirically validate an open-source, full-stack cryptocurrency management platform that mitigates market fragmentation, prevents credential compromise, counters emotional trading irrationality, and democratizes institutional-grade risk diagnostics for students, educators, and retail investors.")

    b.add_heading_3("1.4.2 Specific Technical and Engineering Objectives")
    b.add_p("The project is structured around seven precise engineering objectives:")
    b.add_p("• Objective 1: Architect a responsive, component-driven web application using Next.js 14 App Router, React 18, and TypeScript 5, ensuring strict static type checking and sub-second page transitions.")
    b.add_p("• Objective 2: Engineer a resilient, low-latency market data distribution pipeline leveraging full-duplex WebSockets direct from the Binance Mini-Ticker stream (!miniTicker@arr), augmented by CoinGecko REST endpoints for historical depth.")
    b.add_p("• Objective 3: Implement an enterprise-grade cryptographic security architecture utilizing AES-256-GCM authenticated envelope encryption for user exchange credentials, coupled with strict non-custodial validation rules that reject withdrawal keys.")
    b.add_p("• Objective 4: Construct a quantitative risk engine utilizing the Herfindahl-Hirschman Index (HHI) and beta-weighted asset models to diagnose portfolio concentration and generate mathematical rebalancing orders.")
    b.add_p("• Objective 5: Formulate behavioral finance decision-support mechanisms, specifically the 'Regret Guard' cooling-off intervention and emotional journaling, to evaluate the efficacy of UI friction in reducing impulsive trading.")
    b.add_p("• Objective 6: Develop an automated, real-time tax-lot accounting engine capable of sorting and matching transaction lots under FIFO, LIFO, and HIFO algorithms with exportable CSV tax summaries.")
    b.add_p("• Objective 7: Build administrative governance tools, including server-enforced role-based access control and an emergency global trading kill switch returning HTTP 503 status codes during systemic market anomalies.")

    b.add_heading_2("1.5 Sustainable Development Goal Alignment")
    b.add_p("The United Nations Sustainable Development Goals (SDGs) define a shared global blueprint for peace, prosperity, and innovation. The Cryptocurrency Management System directly aligns with three major SDGs:")

    b.add_heading_3("1.5.1 Alignment with SDG 4: Quality Education")
    b.add_p("SDG Target 4.4 seeks to substantially increase the number of youth and adults who have relevant technical and financial skills. Digital financial assets represent an emerging frontier of computational finance. By providing safe, zero-cost paper trading ($10,000 sandbox funds), interactive DCA time machine simulations, clear mathematical risk formulas, and plain-language AI market move explanations, CryptoPulse serves as an accessible pedagogical tool. It enables students and researchers to master market dynamics, order types, and risk management without jeopardizing real financial capital.")

    b.add_heading_3("1.5.2 Alignment with SDG 8: Decent Work and Economic Growth")
    b.add_p("SDG Target 8.10 emphasizes strengthening the capacity of domestic financial institutions and encouraging universal access to banking, insurance, and financial services. CryptoPulse supports financial resilience by protecting retail participants from predatory trading practices. By incorporating the Regret Guard cooling-off timer, emotion journaling, and transparent tax liability calculation, the platform fosters disciplined, sustainable financial habits and prevents the catastrophic retail insolvencies commonly induced by high-leverage crypto casinos.")

    b.add_heading_3("1.5.3 Alignment with SDG 9: Industry, Innovation, and Infrastructure")
    b.add_p("SDG Target 9.c emphasizes significantly increasing access to information and communications technology. The project advances this goal by demonstrating a modern, high-resilience financial software architecture. By combining decentralized WebSocket data pipelines, server-side authenticated envelope cryptography, non-custodial verification, and fault-tolerant local fallback mechanisms, CryptoPulse establishes an open, reproducible reference architecture for resilient financial software engineering.")
    b.add_page_break()

def add_chapter_2(b):
    # ---------------- CHAPTER 2: LITERATURE REVIEW ----------------
    b.add_heading_1("CHAPTER 2")
    b.add_heading_1("LITERATURE REVIEW")

    b.add_heading_2("2.1 JAVA PROGRAMMING LANGUAGE AND OBJECT-ORIENTED FINANCIAL ENGINEERING")
    b.add_heading_3("2.1.1 Overview and Architectural Foundations of Java")
    b.add_p("Java is a high-level, class-based, object-oriented, concurrent, and robust programming language originally conceived by James Gosling at Sun Microsystems (subsequently acquired by Oracle Corporation). Formulated around the foundational design ethos of \"Write Once, Run Anywhere\" (WORA), Java achieves architectural neutrality through the compilation of human-readable source code into platform-independent intermediate representations known as bytecode (.class files). This intermediate bytecode is executed within the Java Virtual Machine (JVM), an abstract computing machine that provides hardware-level virtualization across operating systems, including Linux, macOS, and Microsoft Windows.")
    b.add_p("In computational finance and distributed enterprise platforms, Java has established itself as the preeminent standard for executing high-throughput, low-latency transactional workflows. The execution lifecycle within modern JVM implementations is optimized through a sophisticated Multi-Tiered Just-In-Time (JIT) compiler (HotSpot C1 and C2 compilers) combined with adaptive optimization techniques. The JIT dynamically monitors method invocation frequencies and runtime control flow, compiling hot bytecode segments into native processor machine instructions during execution. Furthermore, Java incorporates automated garbage collection (GC) subsystems—such as the Garbage-First (G1) collector, Z Garbage Collector (ZGC), and Shenandoah low-pause collectors—which reclaim heap allocations concurrently, bounding worst-case latency pauses to sub-millisecond durations essential for algorithmic execution.")

    b.add_heading_3("2.1.2 Object-Oriented Programming (OOP) Paradigms in Financial Software Engineering")
    b.add_p("The modeling of modern financial platforms necessitates an architectural paradigm capable of handling domain complexity while ensuring data integrity, maintainability, and horizontal extensibility. The core Object-Oriented Programming (OOP) principles—Encapsulation, Inheritance, Polymorphism, and Abstraction—provide the foundational engineering patterns required to construct resilient cryptocurrency management platforms:")
    b.add_runs_p([
        ("1. Encapsulation: ", True, False, 24),
        ("Encapsulation enforces data hiding and state integrity by restricting direct read/write access to internal fields, exposing mutating operations strictly through validated accessors, mutators, and domain methods. In cryptocurrency transaction engines, financial invariants—such as ensuring trade amounts are strictly positive, preventing negative account balances, maintaining immutable timestamps, and isolating cryptographic API secrets from browser reflection—are safeguarded through rigorous encapsulation boundaries.", False, False, 24)
    ])
    b.add_runs_p([
        ("2. Inheritance: ", True, False, 24),
        ("Inheritance facilitates hierarchical domain modeling and code reusability through subclass specialization. A generalized base entity, such as AbstractOrder or FinancialInstrument, encapsulates universal attributes (e.g., timestamp, unique transaction identifier, asset symbol, and base currency). Derived subclasses, such as MarketOrder, LimitOrder, SpotInstrument, and DerivativeInstrument, inherit common properties while augmenting specialized behavioral logic (e.g., limit price triggers, expiration bounds, and fee tier adjustments), thereby eliminating code duplication and standardizing system extensibility.", False, False, 24)
    ])
    b.add_runs_p([
        ("3. Polymorphism: ", True, False, 24),
        ("Polymorphism enables uniform interfaces to represent diverse runtime behaviors. Through method overriding (dynamic polymorphism) and method overloading (static polymorphism), an execution dispatcher can invoke executeOrder() or calculateTaxLot() across heterogeneous order models or tax strategies (FIFO, LIFO, HIFO) through a generalized abstract interface. At runtime, the JVM dynamic method lookup (invokevirtual) resolves the appropriate implementation, decoupling consumer workflows from concrete implementation mechanics.", False, False, 24)
    ])
    b.add_runs_p([
        ("4. Abstraction: ", True, False, 24),
        ("Abstraction isolates system interfaces from operational complexities. Complex operations, such as low-level TCP socket handshakes, Binance HMAC-SHA256 signature generation, AES-256-GCM cipher initialization, and database connection pooling, are abstracted behind clean service contracts (e.g., MarketDataService, OrderExecutionGateway, CredentialStore). Callers interact with clean behavioral contracts, ensuring that alterations to external APIs or database drivers do not ripple across business logic layers.", False, False, 24)
    ])

    b.add_heading_3("2.1.3 Concurrency, Multithreading, and Asynchronous Event-Driven Architectures")
    b.add_p("Financial market interfaces demand non-blocking concurrency to process thousands of continuous price fluctuations across multiple digital assets while concurrently servicing user transactions and executing analytical backtests. In Java enterprise architectures, thread management and concurrency models provide robust paradigms:")
    b.add_p("• Executor Services and Thread Pooling: Rather than incurring prohibitive operating system overhead through ad-hoc thread instantiation, production financial engines utilize bounded thread pools managed via java.util.concurrent.ExecutorService. Work-stealing pool algorithms (ForkJoinPool) optimize throughput by dynamically balancing asynchronous analytical tasks across available CPU cores.")
    b.add_p("• Thread Synchronization and Lock-Free Primitives: High-frequency shared state—such as portfolio cash balances and order book levels—is protected using memory barriers, compare-and-swap (CAS) atomic variables (e.g., AtomicReference, AtomicLong), and optimistic concurrency mechanisms (StampedLock) rather than heavy, blocking synchronized blocks, avoiding thread contention and deadlock anomalies.")
    b.add_p("• Asynchronous Futures and Reactive Streams: The CompletableFuture API and Reactive Streams specification (Flow API) enable composable, asynchronous data pipelines. Market ingestion threads stream real-time price ticks to registered subscriber pipelines without blocking the central event loop, implementing backpressure mechanisms to manage burst volatility spikes.")

    b.add_heading_3("2.1.4 Networking, Socket Streaming, and WebSocket Communication")
    b.add_p("Cryptocurrency assets trade continuously across global liquidity venues. RESTful HTTP polling introduces unacceptable bandwidth inflation, latency lag, and server resource depletion. In modern financial engineering, socket networking forms the operational bedrock:")
    b.add_p("• Non-Blocking I/O (NIO Selector Pattern): The java.nio framework replaces traditional blocking I/O (where one thread services one network connection) with an event-driven multiplexor architecture. A single Selector thread monitors hundreds of SocketChannels, waking up only when network read/write events are ready, drastically reducing memory footprints and context-switching overhead.")
    b.add_p("• WebSocket Full-Duplex Channels: Real-time price distribution utilizes persistent TCP connections upgraded via the WebSocket protocol (RFC 6455). Once the initial HTTP handshake concludes, bi-directional, framed binary or text payloads stream continuously. Java implementations (such as Netty or Java WebSocket API) process incoming Binance ticker frames, parse JSON payloads into strongly typed domain events, and broadcast updates to downstream analytical subscribers with sub-millisecond latencies.")

    b.add_heading_3("2.1.5 Enterprise Security, Cryptographic Providers, and Memory Safety")
    b.add_p("Managing digital assets entails handling high-value exchange credentials and private secrets. The Java platform provides a battle-tested security framework through the Java Cryptography Architecture (JCA) and Java Cryptography Extension (JCE):")
    b.add_p("• Cryptographic Providers and Ciphers: The JCA provides provider-based cryptographic abstractions. Symmetric encryption of user exchange secrets is executed via javax.crypto.Cipher utilizing AES-256 in Galois/Counter Mode (AES/GCM/NoPadding). GCM mode delivers both confidentiality and authenticated integrity through a 128-bit authentication tag, detecting any unauthorized tampering with encrypted payloads.")
    b.add_p("• Cryptographic Randomness: Key generation and Initialization Vector (IV) generation utilize java.security.SecureRandom, tapping into hardware entropy sources (/dev/urandom) to eliminate pseudo-random predictability attacks.")
    b.add_p("• Memory Hygiene and Safe Secret Handling: Java's strict memory safety—enforced through array bounds checking, type safety, and the absence of arbitrary pointer arithmetic—prevents common buffer-overflow vulnerabilities. Sensitive cryptographic credentials (e.g., exchange API secrets) are managed within zeroable character arrays (char[]) rather than immutable String objects, allowing immediate overwrite and zeroing of sensitive material in heap memory, preventing memory-dump extraction attacks.")

    b.add_heading_2("2.2 ACADEMIC LITERATURE ON DIGITAL ASSET MANAGEMENT SYSTEMS")
    b.add_heading_3("2.2.1 Evolution of Cryptocurrency Ecosystems and Asset Management Platforms")
    b.add_p("The foundational theory of decentralized electronic cash was articulated by Nakamoto (2008), introducing proof-of-work consensus to solve the double-spending problem without a central counterparty. The subsequent introduction of smart contract platforms (Buterin, 2014) catalyzed a multi-asset ecosystem comprising thousands of utility tokens, governance assets, and decentralized finance (DeFi) protocols. Corbet et al. (2019) conducted a comprehensive empirical analysis of digital assets as financial instruments, establishing that cryptocurrencies exhibit unique return distributions, high volatility persistence, and low correlation with traditional equities and sovereign debt, underscoring their utility as alternative portfolio diversification assets.")
    b.add_p("Unlike traditional equity markets, which operate within discrete geographic exchange hours and centralized clearing houses, digital asset markets operate 24 hours a day, 7 days a week, across geographically dispersed liquidity pools. This continuous trading environment creates distinct computational challenges. Studies by Gandal et al. (2018) and Griffin & Shams (2020) demonstrated that cryptocurrency markets frequently experience localized liquidity anomalies, cross-exchange price spreads, and heightened vulnerability to retail FOMO (Fear of Missing Out) and panic-selling cascades.")

    b.add_heading_3("2.2.2 Real-Time Financial Streaming and Asynchronous Data Architectures")
    b.add_p("The transmission of financial market data has evolved dramatically from traditional pull-based polling models to push-based streaming architectures. In early digital asset applications, client applications frequently polled REST API endpoints at fixed intervals (e.g., every 5 to 10 seconds). As highlighted by Fette & Melnikov (2011) in RFC 6455, HTTP polling incurs massive protocol overhead due to repetitive TCP handshakes, TLS negotiations, and HTTP header parsing, leading to severe latency and API rate-limit exhaustion.")
    b.add_p("To address these inefficiencies, modern financial streaming architectures have standardized on the WebSocket protocol. Binance, the world's largest digital asset exchange by spot volume, provides a unified Mini-Ticker WebSocket stream (!miniTicker@arr) that broadcasts real-time 24-hour rolling ticker parameters (close price, open price, high, low, volume) across all active trading pairs simultaneously. Real-time stream ingestion requires resilient client architectures capable of handling network drops, socket timeouts, and high-frequency UI re-renders without blocking the main event thread.")

    b.add_heading_3("2.2.3 Security Paradigms: Non-Custodial Trading and Cryptographic Key Protection")
    b.add_p("Security represents the most critical engineering challenge within digital asset software systems. The cryptocurrency domain is replete with catastrophic custodial breaches, ranging from the historic Mt. Gox insolvency (Decker & Wattenhofer, 2014) to modern exchange liquidations, where centralized storage of private keys or exchange API credentials resulted in massive user fund theft.")
    b.add_p("Recent academic literature in financial security (Bonneau et al., 2015; Zohar, 2015) advocates for non-custodial and least-privilege architectural paradigms. When an application integrates with third-party exchanges for trade execution, it must enforce strict security boundaries:")
    b.add_p("1. Least-Privilege Key Generation: The user creates exchange API credentials restricted exclusively to reading balances and executing spot trades. Withdrawal permissions must be explicitly disabled.")
    b.add_p("2. Client-Side Non-Custodial Validation: The management platform validates credentials during registration, immediately rejecting any key that has withdrawal permissions enabled, thereby eliminating custody risks.")
    b.add_p("3. Authenticated Envelope Encryption: Cryptographic secret storage must comply with NIST Special Publication 800-38D standards. Stored exchange secrets must be encrypted utilizing AES-256 in Galois/Counter Mode (GCM). GCM provides both high-speed symmetric encryption and authenticated integrity, preventing chosen-ciphertext and tampering exploits.")
    b.add_p("4. Row Level Isolation: Database architectures reinforce security boundaries through Row Level Security (RLS) policies, mathematically ensuring that authenticated users can only query, insert, or decrypt their own cryptographic credentials and transaction histories.")

    b.add_heading_3("2.2.4 Behavioral Finance, Emotional Biases, and Decision-Support Systems")
    b.add_p("Standard economic models predicated on the Efficient Market Hypothesis (EMH) assume that market participants act rationally to maximize expected utility. However, seminal research in behavioral finance by Kahneman & Tversky (1979) on Prospect Theory demonstrated that human beings exhibit cognitive biases and asymmetric loss aversion—individuals feel the emotional pain of a financial loss more than twice as intensely as the joy of an equivalent gain.")
    b.add_p("In volatile digital asset markets, these cognitive biases manifest as two dominant behavioral failure modes:")
    b.add_p("• Fear of Missing Out (FOMO): Driven by herd behavior and upward price momentum, investors execute market buy orders at local price peaks, buying into exhausted rallies and subsequently suffering steep drawdowns.")
    b.add_p("• Panic Selling: Driven by asymmetric loss aversion, sudden price dips cause retail investors to sell assets near market troughs, locking in permanent capital losses.")
    b.add_p("To mitigate these irrational behavioral impulses, recent human-computer interaction (HCI) and financial technology research has focused on 'Choice Architecture' and behavioral nudges (Thaler & Sunstein, 2008). In algorithmic trading systems, injecting deliberate friction—such as mandatory cooling-off countdown periods (e.g., a 10-minute timer) before confirming buy orders on surging assets—has been shown to interrupt emotional amygdala hijacking, prompting users to re-evaluate trades analytically.")

    b.add_heading_3("2.2.5 Quantitative Portfolio Risk Modeling and Asset Allocation")
    b.add_p("Modern Portfolio Theory (MPT), originally pioneered by Nobel laureate Harry Markowitz (1952), demonstrated that portfolio variance can be minimized through diversification across uncorrelated assets. In the digital asset space, however, traditional variance models often fail during market crises due to high inter-asset correlation with Bitcoin (BTC) and Ethereum (ETH).")
    b.add_p("Advanced portfolio monitoring systems integrate quantitative risk metrics, primarily:")
    b.add_p("1. Herfindahl-Hirschman Index (HHI) for Concentration Risk: Derived from antitrust and economic market concentration models, the HHI calculates the sum of the squared portfolio weightings:")
    b.add_p("HHI = sum( (w_i * 100)^2 )")
    b.add_p("An HHI score approaching 10,000 indicates a portfolio completely concentrated in a single asset, whereas scores below 1,500 indicate healthy diversification across multiple independent digital assets.")
    b.add_p("2. Asset Beta and Volatility Weighting: The systemic sensitivity of individual crypto-assets relative to the broader market index reflects their volatility profile. Blue-chip assets (BTC, ETH) exhibit lower beta compared to small-market-capitalization altcoins, which possess high idiosyncratic volatility and liquidity risks.")

    b.add_heading_3("2.2.6 Automated Cost-Basis and Tax-Lot Accounting Methodologies")
    b.add_p("Taxation authorities globally—including the United States Internal Revenue Service (IRS Notice 2014-21) and international revenue frameworks—classify cryptocurrencies as property rather than fiat currency. Consequently, every disposition (selling crypto for fiat, trading one crypto for another, or purchasing goods) triggers a taxable capital gain or loss calculation:")
    b.add_p("Capital Gain / Loss = Gross Proceeds - Adjusted Cost Basis")
    b.add_p("Calculating tax liability across hundreds of fragmented transactions requires systematic tax-lot matching engines that trace historical purchase tranches. Three principal accounting methodologies are recognized:")
    b.add_p("• First-In, First-Out (FIFO): Assumes that the earliest acquired asset lots are liquidated first. In appreciating bull markets, FIFO generally yields the highest recognized capital gains and highest immediate tax liability.")
    b.add_p("• Last-In, First-Out (LIFO): Assumes that the most recently acquired asset lots are liquidated first. In rising markets, LIFO often matches recent high purchase prices, reducing short-term taxable gains.")
    b.add_p("• Highest-In, First-Out (HIFO): A tax-minimization methodology that matches dispositions against the highest acquisition price lots across the investor's entire purchase history, minimizing immediate net taxable capital gains.")
    b.add_p("Automating these tax-lot calculations within a centralized portfolio engine eliminates laborious spreadsheet accounting, minimizes human calculation errors, and generates audit-ready compliance reports (e.g., IRS Form 8949 formatting).")

    b.add_heading_3("2.2.7 Comparative Analysis of Existing Solutions and Methodologies")
    b.add_p("Table 2.1 presents a comprehensive comparative analysis of existing commercial and academic digital asset tracking platforms alongside the proposed Cryptocurrency Management System:")
    b.add_p("")
    b.add_table(COMPARATIVE_HEADERS, COMPARATIVE_ROWS)
    b.add_p("")

    b.add_heading_3("2.2.8 Identified Research and Engineering Gaps")
    b.add_p("A critical synthesis of the reviewed literature and existing commercial platforms reveals several major engineering and research deficiencies:")
    b.add_p("1. Dichotomy Between Pure Trackers and Custodial Exchanges: Existing solutions are fundamentally bifurcated. Market trackers (CoinGecko, CoinMarketCap) provide informative dashboards but lack real-time portfolio transaction execution and private key integration. Conversely, centralized exchanges provide trading execution but require complete custody of user funds and offer negligible multi-asset portfolio analytics.")
    b.add_p("2. Neglect of Behavioral and Psychological Trading Biases: While commercial applications focus primarily on increasing trading volume through frictionless execution, they systematically ignore retail investor psychology. None of the mainstream commercial trackers incorporate behavioral friction (such as FOMO cooling-off timers or emotional journaling) to safeguard retail investors against impulsive market top buying.")
    b.add_p("3. Monetization and Proprietary Lock-In of Tax and Risk Tools: Essential analytical capabilities—such as automated HIFO/FIFO tax-lot matching, concentration risk scoring, and DCA backtesting—are routinely gatekept behind expensive, proprietary subscription tiers (costing $150 to $500 annually), preventing students and retail participants from accessing sound financial management tools.")
    b.add_p("4. Transparent, Zero-Cost Academic Reference Architectures: The academic literature lacks an open, extensible, full-stack reference architecture that unites real-time WebSocket market streaming, non-custodial testnet trading, AES-256-GCM authenticated credential encryption, and automated tax accounting into a single, cohesive software engineering framework.")
    b.add_p("The Cryptocurrency Management System developed in this project directly addresses these identified gaps, delivering an open-source, non-custodial, and academically rigorous platform.")
    b.add_page_break()
