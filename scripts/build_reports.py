#!/usr/bin/env python3
import os
import zipfile
import html

def xml_escape(text):
    return (text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace('"', "&quot;")
                .replace("'", "&apos;"))

class DocxBuilder:
    def __init__(self):
        self.body_elements = []

    def add_p(self, text="", align="both", bold=False, italic=False, size=24, space_before=100, space_after=100, line_spacing=360):
        # size in half-points: 24 = 12pt, 28 = 14pt, 32 = 16pt
        p_pr = f'''<w:pPr>
            <w:jc w:val="{align}"/>
            <w:spacing w:before="{space_before}" w:after="{space_after}" w:line="{line_spacing}" w:lineRule="auto"/>
        </w:pPr>'''
        r_pr = f'''<w:rPr>
            <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
            <w:sz w:val="{size}"/>
            <w:szCs w:val="{size}"/>
            {"<w:b/>" if bold else ""}
            {"<w:i/>" if italic else ""}
        </w:rPr>'''
        escaped_text = xml_escape(text)
        self.body_elements.append(f'''<w:p>{p_pr}<w:r>{r_pr}<w:t xml:space="preserve">{escaped_text}</w:t></w:r></w:p>''')

    def add_runs_p(self, runs, align="both", space_before=100, space_after=100, line_spacing=360):
        # runs is a list of tuples: (text, bold, italic, size)
        p_pr = f'''<w:pPr>
            <w:jc w:val="{align}"/>
            <w:spacing w:before="{space_before}" w:after="{space_after}" w:line="{line_spacing}" w:lineRule="auto"/>
        </w:pPr>'''
        runs_xml = []
        for text, bold, italic, size in runs:
            r_pr = f'''<w:rPr>
                <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
                <w:sz w:val="{size}"/>
                <w:szCs w:val="{size}"/>
                {"<w:b/>" if bold else ""}
                {"<w:i/>" if italic else ""}
            </w:rPr>'''
            runs_xml.append(f'''<w:r>{r_pr}<w:t xml:space="preserve">{xml_escape(text)}</w:t></w:r>''')
        self.body_elements.append(f'''<w:p>{p_pr}{"".join(runs_xml)}</w:p>''')

    def add_page_break(self):
        self.body_elements.append('''<w:p><w:r><w:br w:type="page"/></w:r></w:p>''')

    def add_heading_1(self, text, align="center"):
        self.add_p(text, align=align, bold=True, size=32, space_before=240, space_after=180)

    def add_heading_2(self, text, align="left"):
        self.add_p(text, align=align, bold=True, size=28, space_before=200, space_after=140)

    def add_heading_3(self, text, align="left"):
        self.add_p(text, align=align, bold=True, italic=False, size=26, space_before=160, space_after=100)

    def add_heading_4(self, text, align="left"):
        self.add_p(text, align=align, bold=True, italic=True, size=24, space_before=120, space_after=80)

    def add_table(self, headers, rows, col_widths=None):
        # headers: list of strings
        # rows: list of list of strings
        tbl_pr = '''<w:tblPr>
            <w:tblW w:w="5000" w:type="pct"/>
            <w:jc w:val="center"/>
            <w:tblBorders>
                <w:top w:val="single" w:sz="6" w:space="0" w:color="555555"/>
                <w:left w:val="single" w:sz="6" w:space="0" w:color="555555"/>
                <w:bottom w:val="single" w:sz="6" w:space="0" w:color="555555"/>
                <w:right w:val="single" w:sz="6" w:space="0" w:color="555555"/>
                <w:insideH w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
                <w:insideV w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
            </w:tblBorders>
        </w:tblPr>'''

        table_xml = [f'<w:tbl>{tbl_pr}']
        
        # Header row
        table_xml.append('<w:tr><w:trPr><w:tblHeader/></w:trPr>')
        for idx, h in enumerate(headers):
            table_xml.append(f'''<w:tc>
                <w:tcPr>
                    <w:shd w:val="clear" w:color="auto" w:fill="E8EEF5"/>
                    <w:tcMar><w:top w:w="120" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:left w:w="140" w:type="dxa"/><w:right w:w="140" w:type="dxa"/></w:tcMar>
                </w:tcPr>
                <w:p>
                    <w:pPr><w:jc w:val="center"/><w:spacing w:before="60" w:after="60"/></w:pPr>
                    <w:r>
                        <w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="22"/></w:rPr>
                        <w:t xml:space="preserve">{xml_escape(h)}</w:t>
                    </w:r>
                </w:p>
            </w:tc>''')
        table_xml.append('</w:tr>')

        # Data rows
        for r_idx, r in enumerate(rows):
            bg_color = "F9FBFC" if r_idx % 2 == 1 else "FFFFFF"
            table_xml.append('<w:tr>')
            for idx, c in enumerate(r):
                align = "left" if idx > 0 else "center"
                table_xml.append(f'''<w:tc>
                    <w:tcPr>
                        <w:shd w:val="clear" w:color="auto" w:fill="{bg_color}"/>
                        <w:tcMar><w:top w:w="100" w:type="dxa"/><w:bottom w:w="100" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tcMar>
                    </w:tcPr>
                    <w:p>
                        <w:pPr><w:jc w:val="{align}"/><w:spacing w:before="40" w:after="40"/><w:line w:line="280" w:lineRule="auto"/></w:pPr>
                        <w:r>
                            <w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="20"/></w:rPr>
                            <w:t xml:space="preserve">{xml_escape(str(c))}</w:t>
                        </w:r>
                    </w:p>
                </w:tc>''')
            table_xml.append('</w:tr>')

        table_xml.append('</w:tbl>')
        self.body_elements.append("".join(table_xml))

    def save(self, filepath):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        content_types = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
    <Default Extension="xml" ContentType="application/xml"/>
    <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
    <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>'''

        rels = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>'''

        doc_rels = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>'''

        styles_xml = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:docDefaults>
        <w:rPrDefault>
            <w:rPr>
                <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
                <w:sz w:val="24"/>
                <w:szCs w:val="24"/>
                <w:lang w:val="en-US"/>
            </w:rPr>
        </w:rPrDefault>
        <w:pPrDefault>
            <w:pPr>
                <w:spacing w:line="360" w:lineRule="auto"/>
                <w:jc w:val="both"/>
            </w:pPr>
        </w:pPrDefault>
    </w:docDefaults>
</w:styles>'''

        doc_xml = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
    <w:body>
        {"".join(self.body_elements)}
        <w:sectPr>
            <w:pgSz w:w="12240" w:h="15840"/>
            <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
        </w:sectPr>
    </w:body>
</w:document>'''

        with zipfile.ZipFile(filepath, "w", zipfile.ZIP_DEFLATED) as z:
            z.writestr("[Content_Types].xml", content_types)
            z.writestr("_rels/.rels", rels)
            z.writestr("word/_rels/document.xml.rels", doc_rels)
            z.writestr("word/styles.xml", styles_xml)
            z.writestr("word/document.xml", doc_xml)
        print(f"Generated successfully: {filepath}")

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
        "100% Free Tier Architecture (Zero-Cost Educational Platform)"
    ]
]

def build_chapter_2_only():
    b = DocxBuilder()
    
    b.add_heading_1("CHAPTER 2")
    b.add_heading_1("LITERATURE REVIEW")
    b.add_p("")
    
    b.add_heading_2("2.1 JAVA PROGRAMMING LANGUAGE")
    
    b.add_heading_3("2.1.1 Overview and Architectural Foundations of Java")
    b.add_p("Java is a high-level, class-based, object-oriented, concurrent, and robust programming language originally conceived by James Gosling at Sun Microsystems (subsequently acquired by Oracle Corporation). Formulated around the foundational design ethos of \"Write Once, Run Anywhere\" (WORA), Java achieves architectural neutrality through the compilation of human-readable source code into platform-independent intermediate representations known as bytecode (.class files). This intermediate bytecode is executed within the Java Virtual Machine (JVM), an abstract computing machine that provides hardware-level virtualization across operating systems, including Linux, macOS, and Microsoft Windows.")
    b.add_p("In computational finance and distributed enterprise platforms, Java has established itself as the preeminent standard for executing high-throughput, low-latency transactional workflows. The execution lifecycle within modern JVM implementations is optimized through a sophisticated Multi-Tiered Just-In-Time (JIT) compiler (HotSpot C1 and C2 compilers) combined with adaptive optimization techniques. The JIT dynamically monitors method invocation frequencies and runtime control flow, compiling hot bytecode segments into native processor machine instructions during execution. Furthermore, Java incorporates automated garbage collection (GC) subsystems—such as the Garbage-First (G1) collector, Z Garbage Collector (ZGC), and Shenandoah GC—which eliminate manual memory allocation vulnerabilities by reclaiming unreachable heap allocations with deterministic sub-millisecond pauses.")

    b.add_heading_3("2.1.2 Object-Oriented Programming (OOP) Paradigms in Financial Software Engineering")
    b.add_p("The modeling of modern financial platforms necessitates an architectural paradigm capable of handling domain complexity, high cohesion, and loose coupling. Object-Oriented Programming (OOP) decomposes complex real-world financial ecosystems into self-contained objects encapsulating both state and behavioral procedures. In designing cryptocurrency management and trading platforms, the four cardinal pillars of OOP provide critical structural guarantees:")
    
    b.add_runs_p([
        ("1. Encapsulation: ", True, False, 24),
        ("Encapsulation enforces data hiding and state integrity by restricting direct read/write access to internal variables through private access modifiers. Internal variables—such as account balances, cryptographic keys, order book quantities, and executed transaction prices—are accessed exclusively through strictly validated accessor (getter) and mutator (setter) methods. This design pattern ensures that invalid or malicious state transitions (e.g., negative token quantities, zero-price limit executions, or unauthorized balance alterations) are programmatically rejected at the object boundary.", False, False, 24)
    ])
    
    b.add_runs_p([
        ("2. Inheritance: ", True, False, 24),
        ("Inheritance facilitates hierarchical domain modeling and code reusability through subclass specialization. A generalized base entity, such as AbstractOrder or FinancialInstrument, encapsulates universal attributes (e.g., timestamp, unique transaction identifier, asset symbol, and base currency). Derived subclasses, such as MarketOrder, LimitOrder, SpotInstrument, and DerivativeInstrument, inherit common properties while augmenting specialized behavioral logic (e.g., limit price triggers, expiration bounds, and fee tier adjustments), thereby eliminating code duplication and standardizing system extensibility.", False, False, 24)
    ])

    b.add_runs_p([
        ("3. Polymorphism: ", True, False, 24),
        ("Polymorphism enables uniform interfaces to represent diverse runtime behaviors. Through method overriding (dynamic/runtime polymorphism) and method overloading (static/compile-time polymorphism), a single execution invocation—such as order.execute() or riskEngine.calculateExposure()—can dynamically adapt its operational pipeline based on the instantiated object type. For example, executing a PaperOrder alters virtual ledger balances in memory, whereas executing a TestnetExchangeOrder constructs an HMAC-SHA256 signed REST packet dispatched to an external matching engine.", False, False, 24)
    ])

    b.add_runs_p([
        ("4. Abstraction: ", True, False, 24),
        ("Abstraction isolates system interfaces from operational complexities. Complex operations, such as low-level TCP socket multiplexing, cryptographic signature generation (HMAC/AES-GCM), and asynchronous database connection pooling, are abstracted behind concise interface definitions (e.g., ExchangeClient, WalletRepository, and TaxLotCalculator). Presentation and business logic layers interact strictly with these high-level contracts without coupling to concrete vendor-specific implementations.", False, False, 24)
    ])

    b.add_heading_3("2.1.3 Concurrency, Multithreading, and Asynchronous Event-Driven Architectures")
    b.add_p("Financial market interfaces demand non-blocking concurrency to process thousands of continuous price ticks, order confirmations, and user interface updates concurrently. Java delivers robust primitives for concurrent computing via the java.util.concurrent framework:")
    b.add_p("• Executor Services and Thread Pooling: Rather than incurring prohibitive operating system overhead via unbounded thread creation, fixed and cached ExecutorService thread pools reuse worker threads to execute incoming order processing and analytical calculations in parallel.")
    b.add_p("• Thread Synchronization and Lock-Free Primitives: High-frequency shared state—such as portfolio valuations and order book depths—is safeguarded through lightweight synchronization constructs (ReentrantLock, ReadWriteLock) and hardware-assisted lock-free atomic variables (AtomicReference, AtomicLong, DoubleAdder) utilizing low-level Compare-And-Swap (CAS) CPU instructions to prevent race conditions without thread contention latency.")
    b.add_p("• Asynchronous Futures and Reactive Streams: The CompletableFuture API and Reactive Streams specification (Flow.Publisher, Flow.Subscriber) allow developers to compose asynchronous, non-blocking pipelines. Market feed ingestion, order validation, database audit logging, and client notifications execute concurrently across non-blocking event loops, optimizing processor utilization on modern multicore architectures.")

    b.add_heading_3("2.1.4 Networking, Socket Streaming, and WebSocket Communication")
    b.add_p("Cryptocurrency assets trade continuously across global liquidity venues. RESTful HTTP polling introduces unacceptable network latency and bandwidth overhead due to redundant header exchanges. Java solves this through low-level non-blocking I/O (java.nio) and full-duplex WebSocket protocols (JSR 356 Java API for WebSockets):")
    b.add_p("• Non-Blocking I/O (NIO Selector Pattern): The NIO architecture enables a single thread to multiplex and monitor multiple network channels (SocketChannel) via a Selector. When market data packets arrive from an exchange, the selector flags the channel as ready for reading, drastically scaling the application's ability to maintain thousands of persistent outbound and inbound streaming connections.")
    b.add_p("• WebSocket Full-Duplex Channels: Real-time price distribution utilizes persistent TCP connections established via an initial HTTP handshake and upgraded to bidirectional WebSocket frames. The client application subscribes to multi-ticker aggregate streams (e.g., Binance mini-ticker array feeds), allowing sub-millisecond price delivery with minimal serialization overhead.")

    b.add_heading_3("2.1.5 Enterprise Security, Cryptographic Providers, and Memory Safety")
    b.add_p("The Java platform incorporates defensive security mechanisms engineered specifically to safeguard high-value computational applications:")
    b.add_p("• Java Cryptography Architecture (JCA) and JCE: Java provides a comprehensive cryptographic abstraction framework through the javax.crypto package. Sensitive financial artifacts—including API keys, exchange secrets, and authentication tokens—are protected using hardware-accelerated Advanced Encryption Standard (AES) in Galois/Counter Mode (GCM). AES-256-GCM delivers both confidentiality through 256-bit symmetric encryption and authenticity via a 128-bit authentication tag, detecting any unauthorized ciphertext tampering.")
    b.add_p("• Bytecode Verification and Sandbox Execution: Before executing any compiled class, the JVM Bytecode Verifier analyzes the bytecode sequence to guarantee that code does not violate access control rules, perform illicit memory pointer arithmetic, or cause stack overflow conditions.")
    b.add_p("• Memory Safety: Unlike unmanaged languages (such as C/C++) that permit manual pointer arithmetic and arbitrary memory access, Java disallows raw memory pointers. Buffer overflow exploits, array index violations, and memory corruption vulnerabilities are intercepted at runtime by explicit bounds checking and type-safety validations.")

    b.add_heading_2("2.2 LITERATURE REVIEW")

    b.add_heading_3("2.2.1 Evolution of Cryptocurrency Ecosystems and Asset Management Platforms")
    b.add_p("The advent of decentralized cryptographic currencies began in 2008 with the publication of Satoshi Nakamoto's seminal whitepaper introducing Bitcoin, a peer-to-peer electronic cash system based on Proof-of-Work (PoW) consensus and distributed blockchain ledgers. Subsequent developments, particularly the launch of Ethereum by Vitalik Buterin in 2015, introduced Turing-complete smart contracts, catalyzing the proliferation of decentralized finance (DeFi), tokenized liquidity protocols, and thousands of alternative digital assets (altcoins).")
    b.add_p("Unlike traditional equity markets, which operate within discrete geographic exchange hours and centralized clearing houses, the digital asset market operates continuously on a 24/7/365 global schedule across hundreds of geographically disparate centralized exchanges (CEXs) and decentralized automated market makers (AMMs). Research by Gandal et al. (2018) and Corbet et al. (2019) demonstrated that the fragmented, multi-venue nature of cryptocurrency trading generates extreme intraday price volatility, liquidity discrepancies, and informational asymmetry. Early retail market participants relied on manual spreadsheets or static portfolio tracking websites to track their financial exposure. However, empirical studies in personal finance technology (Puschmann, 2017) highlight that manual tracking exhibits substantial error rates, lacks real-time risk visibility, and fails to capture sudden market drawdowns. Consequently, the financial technology literature has increasingly emphasized the necessity for unified, automated, and real-time portfolio management systems capable of aggregating heterogeneous data streams into a cohesive decision-support architecture.")

    b.add_heading_3("2.2.2 Real-Time Financial Streaming and Asynchronous Data Architectures")
    b.add_p("The transmission of financial market data has evolved dramatically from traditional pull-based polling mechanisms to push-based asynchronous event-driven streaming. In conventional web systems, client applications repeatedly issue HTTP GET requests at predetermined polling intervals to query updated quotes. As demonstrated in architectural benchmarks by Fette and Melnikov (IETF RFC 6455, 2011), standard HTTP requests carry significant header overhead (often between 500 to 2,000 bytes per request) and induce high server loads, network saturation, and connection setup latency.")
    b.add_p("To address these inefficiencies, modern financial streaming architectures have standardized on the WebSocket protocol. Once an initial HTTP handshake completes with an Upgrade: websocket header, a single long-lived, full-duplex TCP socket connection is established. Subsequent data packets are framed with a minimal overhead of only 2 to 10 bytes per message. Comparative research by Grigorik (2013) on high-performance web networking confirmed that WebSocket-based event streaming reduces network latency by upwards of 85% compared to periodic polling under identical network conditions. In the context of cryptocurrency market surveillance, top-tier venues (such as Binance, Coinbase, and Kraken) publish multi-ticker WebSocket channels that push tick-by-tick order book updates and 24-hour summary metrics directly to subscribing clients. The integration of WebSocket protocols with client-side state managers and reactive user interface libraries guarantees that visual indicators, such as instantaneous price flash animations and dynamic sparkline charts, reflect the true state of global order books with negligible latency.")

    b.add_heading_3("2.2.3 Security Paradigms: Non-Custodial Trading and Cryptographic Key Protection")
    b.add_p("Security represents the most critical engineering challenge within digital asset software systems. The cryptocurrency domain is historically plagued by catastrophic security breaches resulting from the centralized custody of user funds and exchange private keys (Moore & Christin, 2013). Centralized exchange failures and custodial platform insolvencies emphasize the foundational cryptographic adage: \"Not your keys, not your coins.\"")
    b.add_p("Recent academic literature in financial security (Bonneau et al., 2015; Zohar, 2015) advocates for non-custodial and trade-only interface architectures. In a trade-only API model:")
    b.add_p("1. The user creates exchange API credentials restricted exclusively to reading balances and executing spot orders (canTrade = true), while explicitly revoking fund withdrawal capabilities (canWithdraw = false).")
    b.add_p("2. The management platform validates credentials during registration, immediately rejecting any key pair possessing withdrawal permissions to ensure that user funds can never be exfiltrated from the platform.")
    b.add_p("3. Cryptographic secret storage must comply with NIST Special Publication 800-38D standards. Storing plaintext credentials in application databases introduces critical single points of failure. High-assurance systems implement authenticated symmetric encryption using AES-256-GCM. Unlike legacy cipher modes (e.g., Electronic Codebook - ECB, or Cipher Block Chaining - CBC without integrity checks), AES-256-GCM generates a cryptographically random 12-byte initialization vector (IV/nonce) for every encryption operation and produces a 16-byte authentication tag (authTag). This design ensures that any unauthorized bit modification or ciphertext tampering is immediately detected during decryption, preventing chosen-ciphertext attacks.")
    b.add_p("4. Database architectures reinforce security boundaries through Row Level Security (RLS) policies within PostgreSQL. RLS ensures that each database query is bounded to the authenticated tenant (user_id = auth.uid()), preventing cross-tenant data exfiltration even in the event of client-side logic manipulation.")

    b.add_heading_3("2.2.4 Behavioral Finance, Emotional Biases, and Decision-Support Systems")
    b.add_p("Standard economic models predicated on the Efficient Market Hypothesis (EMH) assume that market participants act as rational utility maximizers. However, the foundational works of Daniel Kahneman and Amos Tversky on Prospect Theory (1979) established that human decision-making under risk exhibits systematic cognitive biases, loss aversion, and heuristic shortcuts. In volatile financial environments like cryptocurrencies, behavioral finance research (Biais et al., 2005; Barber & Odean, 2008) reveals that retail investors frequently succumb to two destructive psychological traps:")
    b.add_p("• Fear of Missing Out (FOMO): Driven by herd behavior and upward price momentum, investors execute impulsive market buy orders at local asset peaks after observing rapid price escalations.")
    b.add_p("• Panic Selling: Driven by asymmetric loss aversion (where the psychological pain of a loss is quantified as roughly twice as intense as the pleasure of an equivalent gain), investors liquidate holdings during market drawdowns, locking in catastrophic capital losses.")
    b.add_p("To mitigate these irrational behavioral impulses, recent human-computer interaction (HCI) and financial technology literature explores the implementation of automated \"nudges\" and algorithmic cooling-off mechanisms (Thaler & Sunstein, 2008; Caraban et al., 2019). Architectural features such as Regret Guard systematically detect when an asset has appreciated by an abnormal threshold (e.g., exceeding an 8% gain within a 24-hour window) and enforce a mandatory 10-minute deliberation timer before trade confirmation. Concurrently, incorporating an Emotional Trade Journal allows market participants to tag their affective states (Conviction, Calm, FOMO, Panic, Greed) alongside quantitative transaction parameters. Retrospective analytics correlate emotional profiles with historical trade performance, fostering metacognitive discipline and institutional risk awareness.")

    b.add_heading_3("2.2.5 Quantitative Portfolio Risk Modeling and Asset Allocation")
    b.add_p("Modern Portfolio Theory (MPT), originally pioneered by Nobel laureate Harry Markowitz (1952), demonstrates that asset risk should not be assessed in isolation, but rather through an asset's contribution to overall portfolio variance, correlation, and covariance. Within cryptocurrency markets, where cross-asset correlations fluctuate rapidly during macro liquidity shocks (Bouri et al., 2017), naïve portfolio tracking fails to provide sufficient risk transparency.")
    b.add_p("Advanced portfolio monitoring systems integrate quantitative risk metrics, primarily:")
    b.add_p("1. Herfindahl-Hirschman Index (HHI) for Concentration Risk: Derived from antitrust and economic market concentration models, the HHI calculates the sum of squared portfolio allocation weights. An HHI value approaching 1.0 indicates extreme single-asset concentration risk (e.g., a portfolio dominated entirely by Bitcoin), whereas a lower HHI reflects balanced diversification.")
    b.add_p("2. Asset Beta (β) and Volatility Weighting: The systemic sensitivity of individual crypto-assets relative to benchmark market indices (such as Bitcoin or Ethereum) is quantified through beta coefficients. Integrating volatility ratings directly into interactive interfaces allows real-time calculation of composite portfolio risk scores (0–100 scale), providing automated portfolio rebalancing recommendations when single-asset concentration exceeds predefined risk tolerances.")

    b.add_heading_3("2.2.6 Automated Cost-Basis and Tax-Lot Accounting Methodologies")
    b.add_p("Taxation authorities globally—including the United States Internal Revenue Service (IRS Notice 2014-21) and international revenue agencies—classify cryptocurrencies as property rather than fiat currency. Consequently, every disposition of digital assets (including crypto-to-fiat sales, crypto-to-crypto trades, and payment settlements) triggers a taxable capital gains or losses recognition event.")
    b.add_p("Calculating tax liability across hundreds of fragmented transactions requires systematic tax-lot matching algorithms. The accounting and computational finance literature identifies three primary cost-basis methodologies:")
    b.add_p("• First-In, First-Out (FIFO): Assumes that the earliest acquired asset lots are liquidated first. In secular bull markets characterized by long-term price appreciation, FIFO systematically yields higher recognized capital gains and elevated short-term tax liabilities.")
    b.add_p("• Last-In, First-Out (LIFO): Assumes that the most recently acquired asset lots are liquidated first, which can compress recognized gains during continuous upward price trends.")
    b.add_p("• Highest-In, First-Out (HIFO): A tax-minimization methodology that matches dispositions against the highest purchase-price inventory lots available in the investor's balance pool. HIFO maximizes the cost basis, minimizes immediate net capital gains, and optimizes tax efficiency.")
    b.add_p("Automating these tax-lot calculations within a centralized portfolio engine eliminates laborious manual reconciliation, provides real-time estimates of short-term versus long-term capital liabilities, and enables standard export compliant with IRS Form 8949 reporting guidelines.")

    b.add_heading_3("2.2.7 Comparative Analysis of Existing Solutions and Methodologies")
    b.add_p("Table 2.1 presents a comprehensive comparative analysis of existing commercial and academic digital asset tracking and portfolio management platforms against the proposed Cryptocurrency Management System:")
    b.add_p("")
    b.add_p("TABLE 2.1 COMPARATIVE ANALYSIS OF CRYPTOCURRENCY MANAGEMENT PLATFORMS", align="center", bold=True, size=22)
    b.add_table(COMPARATIVE_HEADERS, COMPARATIVE_ROWS)
    b.add_p("")

    b.add_heading_3("2.2.8 Identified Research and Engineering Gaps")
    b.add_p("A critical synthesis of the reviewed literature and existing commercial platforms reveals several prominent gaps:")
    b.add_p("1. Dichotomy Between Pure Trackers and Custodial Exchanges: Existing solutions are fundamentally split between passive trackers (which display market metrics without execution capabilities) and custodial exchanges (which demand complete custody over user funds and private keys). There is a distinct absence of unified, non-custodial systems that enable real-time tracking, risk modeling, and controlled sandbox testnet trading within a single zero-risk environment.")
    b.add_p("2. Neglect of Behavioral and Psychological Trading Biases: While commercial applications focus predominantly on technical chart indicators, they universally omit cognitive and behavioral safeguards. The absence of automated emotional intervention tools allows retail traders to fall victim to FOMO buying and panic selling during volatile market events.")
    b.add_p("3. Monetization and Proprietary Lock-In of Tax and Risk Tools: Essential analytical capabilities—such as tax-lot optimization (HIFO/LIFO) and quantitative concentration risk modeling—are predominantly locked behind expensive commercial paywalls, limiting their accessibility for students, academic researchers, and retail investors.")
    b.add_p("4. Transparent, Zero-Cost Academic Reference Architectures: The academic literature lacks an open, reproducible full-stack architecture that combines modern modular web frameworks (Next.js, TypeScript, Tailwind CSS), serverless database isolation (PostgreSQL RLS), and dual-feed financial streaming (CoinGecko REST + Binance WebSockets) engineered entirely upon free-tier infrastructure.")
    b.add_p("The Cryptocurrency Management System developed in this project directly addresses these identified gaps by providing an integrated, secure, non-custodial, and behaviorally cognizant platform.")

    b.save("/Users/mohammedibrahim/Downloads/OOPS PROJECT/docs/CHAPTER_2_LITERATURE_REVIEW.docx")

def build_full_report():
    b = DocxBuilder()
    
    # ---------------- PAGE 1: TITLE PAGE ----------------
    b.add_p("ANNA UNIVERSITY", align="center", bold=True, size=24, space_before=100, space_after=100)
    b.add_p("EASWARI ENGINEERING COLLEGE", align="center", bold=True, size=28, space_before=50, space_after=50)
    b.add_p("RAMAPURAM, CHENNAI (AUTONOMOUS)", align="center", bold=True, size=22, space_before=50, space_after=300)
    
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
    b.add_p("ANNA UNIVERSITY: CHENNAI 600 025", align="center", bold=True, size=24, space_before=50, space_after=50)
    b.add_p("JULY-NOV 2026", align="center", bold=True, size=24, space_before=50, space_after=50)
    b.add_page_break()

    # ---------------- PAGE 2: BONAFIDE CERTIFICATE ----------------
    b.add_heading_1("BONAFIDE CERTIFICATE")
    b.add_p("Certified that this project report titled \"CRYPTOCURRENCY MANAGEMENT SYSTEM\" is the Bonafide work of \"MOHAMMED IBRAHIM T (310625243133), MUNESKUMAR S (310625243138)\" who carried out the project work under our supervision.")
    b.add_p("")
    b.add_p("")
    
    # Signatures
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
        ("Dept. of AIADS                                                     ", False, False, 22),
        ("Dept. of AIADS", False, False, 22)
    ], align="left", space_before=0, space_after=50)
    b.add_runs_p([
        ("Easwari Engineering College                              ", False, False, 22),
        ("Easwari Engineering College", False, False, 22)
    ], align="left", space_before=0, space_after=50)
    b.add_runs_p([
        ("Ramapuram                                                         ", False, False, 22),
        ("Ramapuram", False, False, 22)
    ], align="left", space_before=0, space_after=400)

    b.add_p("Submitted for the project work examination held on .....................................................")
    b.add_p("")
    b.add_runs_p([
        ("INTERNAL EXAMINER                                    ", True, False, 24),
        ("EXTERNAL EXAMINER", True, False, 24)
    ], align="left", space_before=300, space_after=100)
    b.add_page_break()

    # ---------------- PAGE 3: ABSTRACT ----------------
    b.add_heading_1("ABSTRACT")
    b.add_p("This project presents the development of a web-based Cryptocurrency Management System designed to help users monitor cryptocurrency markets, maintain a digital portfolio, record transactions, create watchlists and price alerts, and explore trading and analytical tools through a unified interface. The uploaded implementation uses Next.js, React, TypeScript and Tailwind CSS, with Supabase providing authentication and PostgreSQL persistence when configured. Market information is obtained through cryptocurrency data services, while Binance WebSocket support is used for live ticker information. The system supports paper trading as the default safe mode and provides an optional Binance Spot Testnet integration for sandbox execution. Modular software design is reflected through reusable React components, typed data models, service modules, validation schemas and separated API routes. Security is strengthened through server-side authentication, Row Level Security, rate limiting, encrypted exchange secrets using AES-256-GCM, and an administrator-controlled global trading kill switch. Additional modules provide portfolio risk analysis, trade journaling, multi-condition alerts, historical simulations, market-move explanations, privacy-safe sharing and tax-lot calculations. The resulting system demonstrates how modern full-stack technologies can be combined to provide a structured and user-friendly cryptocurrency management platform.")
    b.add_page_break()

    # ---------------- PAGE 4: ACKNOWLEDGEMENT ----------------
    b.add_heading_1("ACKNOWLEDGEMENT")
    b.add_p("We thank the Almighty GOD for the abundant blessings showered on us.")
    b.add_p("We extend our deepest love and gratitude to our dear parents who supported our education and encouraged us throughout the project.")
    b.add_p("We thank our management and our Principal Dr. P. Deiva Sundari for providing the academic environment and opportunities required for our career development.")
    b.add_p("We feel indebted to the Head of the Department Dr. Kalai Selvi, Professor, Department of Artificial Intelligence and Data Science, Easwari Engineering College, for the encouragement and support provided during our work.")
    b.add_p("We express our deepest gratitude to the internal guide Mrs. V. Sangeetha, Assistant Professor, Department of Artificial Intelligence and Data Science, Easwari Engineering College, for her valuable guidance, ideas and continuous support.")
    b.add_p("We would like to thank all faculty members of the department for their help, suggestions and encouragement throughout the development of this project.")
    b.add_p("Finally, we thank our friends and everyone who encouraged us, reviewed our work and helped us complete the Cryptocurrency Management System successfully.")
    b.add_page_break()

    # ---------------- PAGE 5: TABLE OF CONTENTS ----------------
    b.add_heading_1("TABLE OF CONTENTS")
    toc_data = [
        ("ABSTRACT", "iii"),
        ("ACKNOWLEDGEMENT", "iv"),
        ("LIST OF TABLES", "vi"),
        ("LIST OF FIGURES", "vii"),
        ("1. INTRODUCTION", "1"),
        ("   1.1 Problem Statement and Contextual Analysis", "1"),
        ("      1.1.1 Limitations of Manual Cryptocurrency Tracking", "2"),
        ("      1.1.2 Scope of Digitization", "3"),
        ("   1.2 Project Objectives", "3"),
        ("   1.3 Sustainable Development Goal Alignment", "4"),
        ("2. LITERATURE REVIEW", "6"),
        ("   2.1 Java Programming Language", "7"),
        ("      2.1.1 Overview and Architectural Foundations of Java", "7"),
        ("      2.1.2 Object-Oriented Programming (OOP) Paradigms in Financial Systems", "7"),
        ("      2.1.3 Concurrency, Multithreading, and Asynchronous Processing", "8"),
        ("      2.1.4 Networking, Socket Streaming, and WebSocket Communication", "9"),
        ("      2.1.5 Enterprise Security, Cryptographic Providers, and Memory Safety", "9"),
        ("   2.2 Literature Review", "10"),
        ("      2.2.1 Evolution of Cryptocurrency Ecosystems and Asset Management", "10"),
        ("      2.2.2 Real-Time Financial Streaming and Asynchronous Data Architectures", "11"),
        ("      2.2.3 Security Paradigms: Non-Custodial Trading and Cryptographic Key Protection", "12"),
        ("      2.2.4 Behavioral Finance, Emotional Biases, and Decision-Support Systems", "13"),
        ("      2.2.5 Quantitative Portfolio Risk Modeling and Asset Allocation", "14"),
        ("      2.2.6 Automated Cost-Basis and Tax-Lot Accounting Methodologies", "15"),
        ("      2.2.7 Comparative Analysis of Existing Platforms (Table 2.1)", "16"),
        ("      2.2.8 Identified Research and Engineering Gaps", "17"),
        ("3. PROPOSED WORK AND METHODOLOGY", "18"),
        ("   3.1 Overall System Architecture", "18"),
        ("   3.2 Authentication and Data Module", "19"),
        ("   3.3 Market Data and Watchlist Module", "20"),
        ("   3.4 Portfolio and Transaction Module", "21"),
        ("   3.5 Trading and Security Module", "22"),
        ("   3.6 System Architecture Diagram", "23"),
        ("4. IMPLEMENTATION", "24"),
        ("   4.1 Implementation", "24"),
        ("   4.2 Source Code", "25"),
        ("      4.2.1 Login and Authentication Module", "25"),
        ("      4.2.2 Home / Dashboard Module", "27"),
        ("      4.2.3 Market and Watchlist Module", "29"),
        ("      4.2.4 Portfolio Module", "31"),
        ("      4.2.5 Trade Module", "33"),
        ("   4.3 Insights and Admin Module", "36"),
        ("5. RESULT AND DISCUSSION", "40"),
        ("   5.1 Overview", "40"),
        ("   5.2 Login Page", "40"),
        ("   5.3 Dashboard Page", "41"),
        ("   5.4 Market / Watchlist Page", "42"),
        ("   5.5 Portfolio Page", "43"),
        ("   5.6 Trade Page", "44"),
        ("   5.7 Insights Page", "45"),
        ("   5.8 Admin Page", "46"),
        ("   5.9 Discussion of Result", "47"),
        ("6. CONCLUSION AND FUTURE ENHANCEMENT", "49"),
        ("   6.1 Conclusion", "49"),
        ("   6.2 Future Enhancement", "50"),
        ("7. REFERENCES", "52")
    ]
    for title, page in toc_data:
        dots = " ." * int((70 - len(title)) / 2)
        b.add_runs_p([
            (title, False, False, 22),
            (dots + " ", False, False, 20),
            (page, True, False, 22)
        ], align="both", space_before=30, space_after=30, line_spacing=280)
    b.add_page_break()

    # ---------------- PAGE 6: LIST OF TABLES & LIST OF FIGURES ----------------
    b.add_heading_1("LIST OF TABLES")
    tables_list = [
        ("TABLE NO.", "TITLE", "PAGE NO."),
        ("2.1", "COMPARATIVE ANALYSIS OF CRYPTOCURRENCY PLATFORMS", "16"),
        ("3.1", "SYSTEM MODULES", "19"),
        ("3.2", "DATABASE ENTITIES", "21")
    ]
    t_headers = ["TABLE NO.", "TITLE", "PAGE NO."]
    t_rows = [
        ["2.1", "COMPARATIVE ANALYSIS OF CRYPTOCURRENCY PLATFORMS", "16"],
        ["3.1", "SYSTEM MODULES", "19"],
        ["3.2", "DATABASE ENTITIES", "21"]
    ]
    b.add_table(t_headers, t_rows)
    b.add_p("")
    b.add_p("")

    b.add_heading_1("LIST OF FIGURES")
    f_headers = ["FIGURE NO.", "TITLE", "PAGE NO."]
    f_rows = [
        ["3.6", "SYSTEM ARCHITECTURE", "23"],
        ["5.2", "LOGIN PAGE", "40"],
        ["5.3", "DASHBOARD PAGE", "41"],
        ["5.4", "MARKET / WATCHLIST PAGE", "42"],
        ["5.5", "PORTFOLIO PAGE", "43"],
        ["5.6", "TRADE PAGE", "44"],
        ["5.7", "INSIGHTS PAGE", "45"],
        ["5.8", "ADMIN PAGE", "46"]
    ]
    b.add_table(f_headers, f_rows)
    b.add_page_break()

    # ---------------- CHAPTER 1: INTRODUCTION ----------------
    b.add_heading_1("CHAPTER 1")
    b.add_heading_1("INTRODUCTION")
    b.add_heading_2("1.1 Problem Statement and Contextual Analysis")
    b.add_p("Cryptocurrency markets generate large volumes of continuously changing information, including asset prices, market movements, portfolio values and transaction records. Users who manage digital assets often depend on several disconnected services to monitor prices, maintain holdings, record transactions and understand portfolio risk. This separation makes it difficult to maintain a consistent view of personal holdings and trading activity.")
    b.add_p("The Cryptocurrency Management System addresses this problem by providing a centralized web application for market monitoring, portfolio management, watchlists, alerts, paper trading and analytical features. The system is intended as an educational and management platform rather than a custodial wallet. It does not hold user funds; instead, it records portfolio activity and, when configured, communicates with the Binance Spot Testnet for sandbox trading.")
    
    b.add_heading_3("1.1.1 Limitations of Manual Cryptocurrency Tracking")
    b.add_p("Manual tracking through spreadsheets or separate exchange dashboards introduces several practical limitations. Transaction records can become inconsistent, portfolio values require repeated calculations, and users may miss important price movements when monitoring multiple assets. Manual tax-lot calculations and risk evaluation are also time-consuming. A centralized application can automate these repetitive activities while presenting information through a consistent interface.")
    b.add_p("Another issue is security. Exchange credentials must never be exposed to the browser or stored as plain text. The project therefore places sensitive trade operations on server-side routes, validates request data, applies rate limiting, encrypts exchange secrets and provides an administrator-controlled kill switch. These controls are designed to reduce accidental misuse while keeping the system suitable for controlled demonstration and testing.")

    b.add_heading_3("1.1.2 Scope of Digitization")
    b.add_p("The scope of the system covers user authentication, cryptocurrency market discovery, watchlist management, portfolio transactions, price alerts, paper trading, Binance Spot Testnet integration, portfolio analytics and administrator functions. The application also includes analytical tools such as Time Machine simulations, Explain the Move, Portfolio Risk Pulse, Trade Journal, multi-condition alerts, privacy-safe sharing and tax-lot tracking.")
    b.add_p("The platform is implemented as a modular Next.js application. The interface is composed of reusable React components, while API routes provide server-side operations. Supabase can be used for persistent authentication and PostgreSQL storage, with Row Level Security policies separating users' records. A local/demo fallback is also available so the project can be demonstrated without mandatory cloud configuration.")

    b.add_heading_2("1.2 Project Objectives")
    b.add_p("The primary objective is to develop a unified Cryptocurrency Management System that makes cryptocurrency monitoring and portfolio administration easier to understand and operate. The system aims to provide clear market information, structured transaction records and analytical tools through a responsive interface.")
    b.add_p("The technical objectives include implementing reusable components, typed data models, client and server separation, validated API requests, secure authentication, persistent data storage, real-time market information and controlled trade execution. The project also demonstrates safe software engineering practices such as secret management, rate limiting, encryption and role-based administration.")

    b.add_heading_2("1.3 Sustainable Development Goal Alignment")
    b.add_p("The project can be related to SDG 4 through technology-oriented financial and digital literacy. By presenting market data, portfolio calculations, transaction histories and risk indicators in a structured interface, the system can support learning about digital assets and responsible software-based financial information management.")
    b.add_p("The application also emphasizes responsible handling of digital credentials and simulated trading. Paper trading and the Binance Spot Testnet provide controlled environments for demonstrating transaction workflows without requiring direct access to real user funds.")
    b.add_page_break()

    # ---------------- CHAPTER 2: LITERATURE REVIEW (UPDATED!) ----------------
    b.add_heading_1("CHAPTER 2")
    b.add_heading_1("LITERATURE REVIEW")
    
    b.add_heading_2("2.1 JAVA PROGRAMMING LANGUAGE")
    b.add_heading_3("2.1.1 Overview and Architectural Foundations of Java")
    b.add_p("Java is a high-level, class-based, object-oriented, concurrent, and robust programming language originally conceived by James Gosling at Sun Microsystems (subsequently acquired by Oracle Corporation). Formulated around the foundational design ethos of \"Write Once, Run Anywhere\" (WORA), Java achieves architectural neutrality through the compilation of human-readable source code into platform-independent intermediate representations known as bytecode (.class files). This intermediate bytecode is executed within the Java Virtual Machine (JVM), an abstract computing machine that provides hardware-level virtualization across operating systems, including Linux, macOS, and Microsoft Windows.")
    b.add_p("In computational finance and distributed enterprise platforms, Java has established itself as the preeminent standard for executing high-throughput, low-latency transactional workflows. The execution lifecycle within modern JVM implementations is optimized through a sophisticated Multi-Tiered Just-In-Time (JIT) compiler (HotSpot C1 and C2 compilers) combined with adaptive optimization techniques. The JIT dynamically monitors method invocation frequencies and runtime control flow, compiling hot bytecode segments into native processor machine instructions during execution. Furthermore, Java incorporates automated garbage collection (GC) subsystems—such as the Garbage-First (G1) collector, Z Garbage Collector (ZGC), and Shenandoah GC—which eliminate manual memory allocation vulnerabilities by reclaiming unreachable heap allocations with deterministic sub-millisecond pauses.")

    b.add_heading_3("2.1.2 Object-Oriented Programming (OOP) Paradigms in Financial Software Engineering")
    b.add_p("The modeling of modern financial platforms necessitates an architectural paradigm capable of handling domain complexity, high cohesion, and loose coupling. Object-Oriented Programming (OOP) decomposes complex real-world financial ecosystems into self-contained objects encapsulating both state and behavioral procedures. In designing cryptocurrency management and trading platforms, the four cardinal pillars of OOP provide critical structural guarantees:")
    b.add_runs_p([
        ("1. Encapsulation: ", True, False, 24),
        ("Encapsulation enforces data hiding and state integrity by restricting direct read/write access to internal variables through private access modifiers. Internal variables—such as account balances, cryptographic keys, order book quantities, and executed transaction prices—are accessed exclusively through strictly validated accessor (getter) and mutator (setter) methods. This design pattern ensures that invalid or malicious state transitions (e.g., negative token quantities, zero-price limit executions, or unauthorized balance alterations) are programmatically rejected at the object boundary.", False, False, 24)
    ])
    b.add_runs_p([
        ("2. Inheritance: ", True, False, 24),
        ("Inheritance facilitates hierarchical domain modeling and code reusability through subclass specialization. A generalized base entity, such as AbstractOrder or FinancialInstrument, encapsulates universal attributes (e.g., timestamp, unique transaction identifier, asset symbol, and base currency). Derived subclasses, such as MarketOrder, LimitOrder, SpotInstrument, and DerivativeInstrument, inherit common properties while augmenting specialized behavioral logic (e.g., limit price triggers, expiration bounds, and fee tier adjustments), thereby eliminating code duplication and standardizing system extensibility.", False, False, 24)
    ])
    b.add_runs_p([
        ("3. Polymorphism: ", True, False, 24),
        ("Polymorphism enables uniform interfaces to represent diverse runtime behaviors. Through method overriding (dynamic/runtime polymorphism) and method overloading (static/compile-time polymorphism), a single execution invocation—such as order.execute() or riskEngine.calculateExposure()—can dynamically adapt its operational pipeline based on the instantiated object type. For example, executing a PaperOrder alters virtual ledger balances in memory, whereas executing a TestnetExchangeOrder constructs an HMAC-SHA256 signed REST packet dispatched to an external matching engine.", False, False, 24)
    ])
    b.add_runs_p([
        ("4. Abstraction: ", True, False, 24),
        ("Abstraction isolates system interfaces from operational complexities. Complex operations, such as low-level TCP socket multiplexing, cryptographic signature generation (HMAC/AES-GCM), and asynchronous database connection pooling, are abstracted behind concise interface definitions (e.g., ExchangeClient, WalletRepository, and TaxLotCalculator). Presentation and business logic layers interact strictly with these high-level contracts without coupling to concrete vendor-specific implementations.", False, False, 24)
    ])

    b.add_heading_3("2.1.3 Concurrency, Multithreading, and Asynchronous Event-Driven Architectures")
    b.add_p("Financial market interfaces demand non-blocking concurrency to process thousands of continuous price ticks, order confirmations, and user interface updates concurrently. Java delivers robust primitives for concurrent computing via the java.util.concurrent framework:")
    b.add_p("• Executor Services and Thread Pooling: Rather than incurring prohibitive operating system overhead via unbounded thread creation, fixed and cached ExecutorService thread pools reuse worker threads to execute incoming order processing and analytical calculations in parallel.")
    b.add_p("• Thread Synchronization and Lock-Free Primitives: High-frequency shared state—such as portfolio valuations and order book depths—is safeguarded through lightweight synchronization constructs (ReentrantLock, ReadWriteLock) and hardware-assisted lock-free atomic variables (AtomicReference, AtomicLong, DoubleAdder) utilizing low-level Compare-And-Swap (CAS) CPU instructions to prevent race conditions without thread contention latency.")
    b.add_p("• Asynchronous Futures and Reactive Streams: The CompletableFuture API and Reactive Streams specification (Flow.Publisher, Flow.Subscriber) allow developers to compose asynchronous, non-blocking pipelines. Market feed ingestion, order validation, database audit logging, and client notifications execute concurrently across non-blocking event loops, optimizing processor utilization on modern multicore architectures.")

    b.add_heading_3("2.1.4 Networking, Socket Streaming, and WebSocket Communication")
    b.add_p("Cryptocurrency assets trade continuously across global liquidity venues. RESTful HTTP polling introduces unacceptable network latency and bandwidth overhead due to redundant header exchanges. Java solves this through low-level non-blocking I/O (java.nio) and full-duplex WebSocket protocols (JSR 356 Java API for WebSockets):")
    b.add_p("• Non-Blocking I/O (NIO Selector Pattern): The NIO architecture enables a single thread to multiplex and monitor multiple network channels (SocketChannel) via a Selector. When market data packets arrive from an exchange, the selector flags the channel as ready for reading, drastically scaling the application's ability to maintain thousands of persistent outbound and inbound streaming connections.")
    b.add_p("• WebSocket Full-Duplex Channels: Real-time price distribution utilizes persistent TCP connections established via an initial HTTP handshake and upgraded to bidirectional WebSocket frames. The client application subscribes to multi-ticker aggregate streams (e.g., Binance mini-ticker array feeds), allowing sub-millisecond price delivery with minimal serialization overhead.")

    b.add_heading_3("2.1.5 Enterprise Security, Cryptographic Providers, and Memory Safety")
    b.add_p("The Java platform incorporates defensive security mechanisms engineered specifically to safeguard high-value computational applications:")
    b.add_p("• Java Cryptography Architecture (JCA) and JCE: Java provides a comprehensive cryptographic abstraction framework through the javax.crypto package. Sensitive financial artifacts—including API keys, exchange secrets, and authentication tokens—are protected using hardware-accelerated Advanced Encryption Standard (AES) in Galois/Counter Mode (GCM). AES-256-GCM delivers both confidentiality through 256-bit symmetric encryption and authenticity via a 128-bit authentication tag, detecting any unauthorized ciphertext tampering.")
    b.add_p("• Bytecode Verification and Sandbox Execution: Before executing any compiled class, the JVM Bytecode Verifier analyzes the bytecode sequence to guarantee that code does not violate access control rules, perform illicit memory pointer arithmetic, or cause stack overflow conditions.")
    b.add_p("• Memory Safety: Unlike unmanaged languages (such as C/C++) that permit manual pointer arithmetic and arbitrary memory access, Java disallows raw memory pointers. Buffer overflow exploits, array index violations, and memory corruption vulnerabilities are intercepted at runtime by explicit bounds checking and type-safety validations.")

    b.add_heading_2("2.2 LITERATURE REVIEW")
    b.add_heading_3("2.2.1 Evolution of Cryptocurrency Ecosystems and Asset Management Platforms")
    b.add_p("The advent of decentralized cryptographic currencies began in 2008 with the publication of Satoshi Nakamoto's seminal whitepaper introducing Bitcoin, a peer-to-peer electronic cash system based on Proof-of-Work (PoW) consensus and distributed blockchain ledgers. Subsequent developments, particularly the launch of Ethereum by Vitalik Buterin in 2015, introduced Turing-complete smart contracts, catalyzing the proliferation of decentralized finance (DeFi), tokenized liquidity protocols, and thousands of alternative digital assets (altcoins).")
    b.add_p("Unlike traditional equity markets, which operate within discrete geographic exchange hours and centralized clearing houses, the digital asset market operates continuously on a 24/7/365 global schedule across hundreds of geographically disparate centralized exchanges (CEXs) and decentralized automated market makers (AMMs). Research by Gandal et al. (2018) and Corbet et al. (2019) demonstrated that the fragmented, multi-venue nature of cryptocurrency trading generates extreme intraday price volatility, liquidity discrepancies, and informational asymmetry. Early retail market participants relied on manual spreadsheets or static portfolio tracking websites to track their financial exposure. However, empirical studies in personal finance technology (Puschmann, 2017) highlight that manual tracking exhibits substantial error rates, lacks real-time risk visibility, and fails to capture sudden market drawdowns. Consequently, the financial technology literature has increasingly emphasized the necessity for unified, automated, and real-time portfolio management systems capable of aggregating heterogeneous data streams into a cohesive decision-support architecture.")

    b.add_heading_3("2.2.2 Real-Time Financial Streaming and Asynchronous Data Architectures")
    b.add_p("The transmission of financial market data has evolved dramatically from traditional pull-based polling mechanisms to push-based asynchronous event-driven streaming. In conventional web systems, client applications repeatedly issue HTTP GET requests at predetermined polling intervals to query updated quotes. As demonstrated in architectural benchmarks by Fette and Melnikov (IETF RFC 6455, 2011), standard HTTP requests carry significant header overhead (often between 500 to 2,000 bytes per request) and induce high server loads, network saturation, and connection setup latency.")
    b.add_p("To address these inefficiencies, modern financial streaming architectures have standardized on the WebSocket protocol. Once an initial HTTP handshake completes with an Upgrade: websocket header, a single long-lived, full-duplex TCP socket connection is established. Subsequent data packets are framed with a minimal overhead of only 2 to 10 bytes per message. Comparative research by Grigorik (2013) on high-performance web networking confirmed that WebSocket-based event streaming reduces network latency by upwards of 85% compared to periodic polling under identical network conditions. In the context of cryptocurrency market surveillance, top-tier venues (such as Binance, Coinbase, and Kraken) publish multi-ticker WebSocket channels that push tick-by-tick order book updates and 24-hour summary metrics directly to subscribing clients. The integration of WebSocket protocols with client-side state managers and reactive user interface libraries guarantees that visual indicators, such as instantaneous price flash animations and dynamic sparkline charts, reflect the true state of global order books with negligible latency.")

    b.add_heading_3("2.2.3 Security Paradigms: Non-Custodial Trading and Cryptographic Key Protection")
    b.add_p("Security represents the most critical engineering challenge within digital asset software systems. The cryptocurrency domain is historically plagued by catastrophic security breaches resulting from the centralized custody of user funds and exchange private keys (Moore & Christin, 2013). Centralized exchange failures and custodial platform insolvencies emphasize the foundational cryptographic adage: \"Not your keys, not your coins.\"")
    b.add_p("Recent academic literature in financial security (Bonneau et al., 2015; Zohar, 2015) advocates for non-custodial and trade-only interface architectures. In a trade-only API model:")
    b.add_p("1. The user creates exchange API credentials restricted exclusively to reading balances and executing spot orders (canTrade = true), while explicitly revoking fund withdrawal capabilities (canWithdraw = false).")
    b.add_p("2. The management platform validates credentials during registration, immediately rejecting any key pair possessing withdrawal permissions to ensure that user funds can never be exfiltrated from the platform.")
    b.add_p("3. Cryptographic secret storage must comply with NIST Special Publication 800-38D standards. Storing plaintext credentials in application databases introduces critical single points of failure. High-assurance systems implement authenticated symmetric encryption using AES-256-GCM. Unlike legacy cipher modes (e.g., Electronic Codebook - ECB, or Cipher Block Chaining - CBC without integrity checks), AES-256-GCM generates a cryptographically random 12-byte initialization vector (IV/nonce) for every encryption operation and produces a 16-byte authentication tag (authTag). This design ensures that any unauthorized bit modification or ciphertext tampering is immediately detected during decryption, preventing chosen-ciphertext attacks.")
    b.add_p("4. Database architectures reinforce security boundaries through Row Level Security (RLS) policies within PostgreSQL. RLS ensures that each database query is bounded to the authenticated tenant (user_id = auth.uid()), preventing cross-tenant data exfiltration even in the event of client-side logic manipulation.")

    b.add_heading_3("2.2.4 Behavioral Finance, Emotional Biases, and Decision-Support Systems")
    b.add_p("Standard economic models predicated on the Efficient Market Hypothesis (EMH) assume that market participants act as rational utility maximizers. However, the foundational works of Daniel Kahneman and Amos Tversky on Prospect Theory (1979) established that human decision-making under risk exhibits systematic cognitive biases, loss aversion, and heuristic shortcuts. In volatile financial environments like cryptocurrencies, behavioral finance research (Biais et al., 2005; Barber & Odean, 2008) reveals that retail investors frequently succumb to two destructive psychological traps:")
    b.add_p("• Fear of Missing Out (FOMO): Driven by herd behavior and upward price momentum, investors execute impulsive market buy orders at local asset peaks after observing rapid price escalations.")
    b.add_p("• Panic Selling: Driven by asymmetric loss aversion (where the psychological pain of a loss is quantified as roughly twice as intense as the pleasure of an equivalent gain), investors liquidate holdings during market drawdowns, locking in catastrophic capital losses.")
    b.add_p("To mitigate these irrational behavioral impulses, recent human-computer interaction (HCI) and financial technology literature explores the implementation of automated \"nudges\" and algorithmic cooling-off mechanisms (Thaler & Sunstein, 2008; Caraban et al., 2019). Architectural features such as Regret Guard systematically detect when an asset has appreciated by an abnormal threshold (e.g., exceeding an 8% gain within a 24-hour window) and enforce a mandatory 10-minute deliberation timer before trade confirmation. Concurrently, incorporating an Emotional Trade Journal allows market participants to tag their affective states (Conviction, Calm, FOMO, Panic, Greed) alongside quantitative transaction parameters. Retrospective analytics correlate emotional profiles with historical trade performance, fostering metacognitive discipline and institutional risk awareness.")

    b.add_heading_3("2.2.5 Quantitative Portfolio Risk Modeling and Asset Allocation")
    b.add_p("Modern Portfolio Theory (MPT), originally pioneered by Nobel laureate Harry Markowitz (1952), demonstrates that asset risk should not be assessed in isolation, but rather through an asset's contribution to overall portfolio variance, correlation, and covariance. Within cryptocurrency markets, where cross-asset correlations fluctuate rapidly during macro liquidity shocks (Bouri et al., 2017), naïve portfolio tracking fails to provide sufficient risk transparency.")
    b.add_p("Advanced portfolio monitoring systems integrate quantitative risk metrics, primarily:")
    b.add_p("1. Herfindahl-Hirschman Index (HHI) for Concentration Risk: Derived from antitrust and economic market concentration models, the HHI calculates the sum of squared portfolio allocation weights. An HHI value approaching 1.0 indicates extreme single-asset concentration risk (e.g., a portfolio dominated entirely by Bitcoin), whereas a lower HHI reflects balanced diversification.")
    b.add_p("2. Asset Beta (β) and Volatility Weighting: The systemic sensitivity of individual crypto-assets relative to benchmark market indices (such as Bitcoin or Ethereum) is quantified through beta coefficients. Integrating volatility ratings directly into interactive interfaces allows real-time calculation of composite portfolio risk scores (0–100 scale), providing automated portfolio rebalancing recommendations when single-asset concentration exceeds predefined risk tolerances.")

    b.add_heading_3("2.2.6 Automated Cost-Basis and Tax-Lot Accounting Methodologies")
    b.add_p("Taxation authorities globally—including the United States Internal Revenue Service (IRS Notice 2014-21) and international revenue agencies—classify cryptocurrencies as property rather than fiat currency. Consequently, every disposition of digital assets (including crypto-to-fiat sales, crypto-to-crypto trades, and payment settlements) triggers a taxable capital gains or losses recognition event.")
    b.add_p("Calculating tax liability across hundreds of fragmented transactions requires systematic tax-lot matching algorithms. The accounting and computational finance literature identifies three primary cost-basis methodologies:")
    b.add_p("• First-In, First-Out (FIFO): Assumes that the earliest acquired asset lots are liquidated first. In secular bull markets characterized by long-term price appreciation, FIFO systematically yields higher recognized capital gains and elevated short-term tax liabilities.")
    b.add_p("• Last-In, First-Out (LIFO): Assumes that the most recently acquired asset lots are liquidated first, which can compress recognized gains during continuous upward price trends.")
    b.add_p("• Highest-In, First-Out (HIFO): A tax-minimization methodology that matches dispositions against the highest purchase-price inventory lots available in the investor's balance pool. HIFO maximizes the cost basis, minimizes immediate net capital gains, and optimizes tax efficiency.")
    b.add_p("Automating these tax-lot calculations within a centralized portfolio engine eliminates laborious manual reconciliation, provides real-time estimates of short-term versus long-term capital liabilities, and enables standard export compliant with IRS Form 8949 reporting guidelines.")

    b.add_heading_3("2.2.7 Comparative Analysis of Existing Solutions and Methodologies")
    b.add_p("Table 2.1 presents a comprehensive comparative analysis of existing commercial and academic digital asset tracking and portfolio management platforms against the proposed Cryptocurrency Management System:")
    b.add_p("")
    b.add_table(COMPARATIVE_HEADERS, COMPARATIVE_ROWS)
    b.add_p("")

    b.add_heading_3("2.2.8 Identified Research and Engineering Gaps")
    b.add_p("A critical synthesis of the reviewed literature and existing commercial platforms reveals several prominent gaps:")
    b.add_p("1. Dichotomy Between Pure Trackers and Custodial Exchanges: Existing solutions are fundamentally split between passive trackers (which display market metrics without execution capabilities) and custodial exchanges (which demand complete custody over user funds and private keys). There is a distinct absence of unified, non-custodial systems that enable real-time tracking, risk modeling, and controlled sandbox testnet trading within a single zero-risk environment.")
    b.add_p("2. Neglect of Behavioral and Psychological Trading Biases: While commercial applications focus predominantly on technical chart indicators, they universally omit cognitive and behavioral safeguards. The absence of automated emotional intervention tools allows retail traders to fall victim to FOMO buying and panic selling during volatile market events.")
    b.add_p("3. Monetization and Proprietary Lock-In of Tax and Risk Tools: Essential analytical capabilities—such as tax-lot optimization (HIFO/LIFO) and quantitative concentration risk modeling—are predominantly locked behind expensive commercial paywalls, limiting their accessibility for students, academic researchers, and retail investors.")
    b.add_p("4. Transparent, Zero-Cost Academic Reference Architectures: The academic literature lacks an open, reproducible full-stack architecture that combines modern modular web frameworks (Next.js, TypeScript, Tailwind CSS), serverless database isolation (PostgreSQL RLS), and dual-feed financial streaming (CoinGecko REST + Binance WebSockets) engineered entirely upon free-tier infrastructure.")
    b.add_p("The Cryptocurrency Management System developed in this project directly addresses these identified gaps by providing an integrated, secure, non-custodial, and behaviorally cognizant platform.")
    b.add_page_break()

    # ---------------- CHAPTER 3: PROPOSED WORK AND METHODOLOGY ----------------
    b.add_heading_1("CHAPTER 3")
    b.add_heading_1("PROPOSED WORK AND METHODOLOGY")
    b.add_heading_2("3.1 Overall System Architecture")
    b.add_p("The Cryptocurrency Management System uses a layered architecture consisting of the presentation layer, application and API layer, data and persistence layer, and external market or trading services. The browser communicates with the Next.js application, while server routes perform authentication, validation and protected operations.")
    b.add_p("The presentation layer contains dashboard pages and reusable React components. The application layer contains contexts, hooks, validation utilities and service modules. Supabase provides authentication and PostgreSQL persistence when enabled. External services supply market information and sandbox trading capabilities.")

    b.add_heading_2("3.2 Authentication and Data Module")
    b.add_p("Authentication supports registration, login, password recovery and reset flows. User profiles contain identity and role information, while Row Level Security policies restrict database access to the authenticated user's records. Administrators receive additional access for controlled management tasks.")

    b.add_heading_2("3.3 Market Data and Watchlist Module")
    b.add_p("The market module displays cryptocurrency information and supports search, watchlists and price alerts. CoinGecko provides market data and Binance WebSocket support provides live ticker updates. Watchlist records are associated with the authenticated user and can be stored in Supabase or represented through the project's demo/local fallback mechanisms.")

    b.add_heading_2("3.4 Portfolio and Transaction Module")
    b.add_p("The portfolio module records BUY and SELL transactions with coin identifiers, quantities, prices, dates and optional notes. Portfolio components calculate holdings and allocation information and present the results using tables and charts. The transaction model is persisted through PostgreSQL when Supabase is configured.")

    b.add_heading_2("3.5 Trading and Security Module")
    b.add_p("Trading supports a default paper-trading mode and an optional Binance Spot Testnet mode. Before an order is executed, the server checks the global kill switch, authenticates the user, verifies account status and validates the order structure with Zod. Exchange credentials are obtained server-side and secrets are decrypted only where required for the testnet request.")
    b.add_p("The security layer encrypts exchange secrets using AES-256-GCM and stores only the encrypted value in the database. Rate limiting is applied to trade execution requests. The architecture is explicitly non-custodial: withdrawal permissions are rejected during key registration and the application does not hold user funds.")

    b.add_heading_2("3.6 System Architecture")
    b.add_p("The high-level architecture below summarizes the interaction between the browser interface, Next.js application, protected APIs, database and external services.")
    b.add_p("")
    b.add_p("[Browser UI: User / Admin] ---> [Next.js App Router (React + TypeScript)] ---> [API & Business Logic (Validation + Auth)] ---> [Supabase (PostgreSQL + RLS)]", align="center", bold=True, size=20)
    b.add_p("                                            |                                                      |", align="center", bold=True, size=20)
    b.add_p("                                            v                                                      v", align="center", bold=True, size=20)
    b.add_p("                              [CoinGecko API + Binance WebSocket]                  [Trade Layer: Paper / Binance Spot Testnet]", align="center", bold=True, size=20)
    b.add_p("")
    b.add_p("FIGURE 3.6 CRYPTOCURRENCY MANAGEMENT SYSTEM ARCHITECTURE", align="center", bold=True, size=22)
    b.add_page_break()

    # ---------------- CHAPTER 4: IMPLEMENTATION ----------------
    b.add_heading_1("CHAPTER 4")
    b.add_heading_1("IMPLEMENTATION")
    b.add_heading_2("4.1 Implementation")
    b.add_p("The implementation is organized into authentication, dashboard, market, portfolio, trading, insights and administration modules. Each module is represented by Next.js pages and reusable React components, while shared state is handled through contexts and custom hooks.")

    b.add_heading_2("4.2 Source Code")
    b.add_heading_3("4.2.1 Login and Authentication Module")
    b.add_p("The authentication module provides registration, login, forgot-password and reset-password flows. Supabase authentication is used when cloud configuration is available, while the application contains a demo mode for local presentation. Authentication state is exposed through a reusable context so that dashboard pages can enforce protected access.")
    b.add_p("CODE IMPLEMENTATION:", bold=True)
    b.add_p("const { data, error } = await supabase.auth.signInWithPassword({\n  email,\n  password,\n});\nif (error) throw error;\nsetUser(data.user);", align="left", size=20, space_before=50, space_after=150)

    b.add_heading_3("4.2.2 Home / Dashboard Module")
    b.add_p("The dashboard is the central workspace after authentication. It brings together market statistics, portfolio summaries, watchlist information, recent activity and navigation to the major management modules. The layout is responsive and uses reusable cards and tables so that the same design language is maintained across the application.")
    b.add_p("CODE IMPLEMENTATION:", bold=True)
    b.add_p("<DashboardLayout>\n  <MarketStatsCards />\n  <PortfolioSummaryCards />\n  <WatchlistCoinsGrid />\n  <TransactionHistoryTable />\n</DashboardLayout>", align="left", size=20, space_before=50, space_after=150)

    b.add_heading_3("4.2.3 Market and Watchlist Module")
    b.add_p("The market module presents cryptocurrency assets with current prices, changes and compact visual indicators. Users can add assets to a personal watchlist and create price alerts with ABOVE or BELOW conditions. The data layer separates market retrieval from presentation so that external API changes do not require rewriting the user interface.")
    b.add_p("CODE IMPLEMENTATION:", bold=True)
    b.add_p("const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();\nconst handleToggle = async (coin) => {\n  if (watchlist.some((item) => item.coin_id === coin.id)) {\n    await removeFromWatchlist(coin.id);\n  } else {\n    await addToWatchlist(coin);\n  }\n};", align="left", size=20, space_before=50, space_after=150)

    b.add_heading_3("4.2.4 Portfolio Module")
    b.add_p("The portfolio module records transactions and derives current holdings from the transaction history. It includes summary cards, an allocation chart, holdings table and transaction history. The design allows the user to understand the relationship between individual transactions and the overall portfolio without manually maintaining a spreadsheet.")
    b.add_p("CODE IMPLEMENTATION:", bold=True)
    b.add_p("type Transaction = {\n  id: string;\n  coin_id: string;\n  coin_symbol: string;\n  coin_name: string;\n  type: 'BUY' | 'SELL';\n  amount: number;\n  price_per_unit: number;\n  transaction_date: string;\n  notes?: string;\n};", align="left", size=20, space_before=50, space_after=150)

    b.add_heading_3("4.2.5 Trade Module")
    b.add_p("The trade module provides paper trading by default and can optionally connect to Binance Spot Testnet. Before an order is sent, the application displays a confirmation dialog containing the order details, estimated fee, slippage information and risk-oriented prompts. The Regret Guard can introduce a cooling-off step for rapid market moves.")
    b.add_p("CODE IMPLEMENTATION:", bold=True)
    b.add_p("const tradeOrderSchema = z.object({\n  mode: z.enum(['paper', 'real_exchange']),\n  symbol: z.string().min(2),\n  side: z.enum(['BUY', 'SELL']),\n  type: z.enum(['MARKET', 'LIMIT']),\n  quantity: z.number().positive(),\n  price: z.number().nonnegative().optional(),\n});", align="left", size=20, space_before=50, space_after=150)

    b.add_heading_2("4.3 Insights and Admin Module")
    b.add_p("The Insights Hub groups the analytical functions that extend the basic portfolio and trading workflow. The module includes Time Machine simulations, Explain the Move, Portfolio Risk Pulse, Trade Journal, multi-condition alerts, privacy-safe share links and an automated tax-lot tracker. These features are implemented as reusable components so that each analytical workflow can be maintained independently.")
    b.add_p("4.3.1 Insights Hub: The Time Machine simulator estimates historical investment outcomes and can model periodic contributions. Explain the Move provides a plain-language market explanation using available market and news inputs.")
    b.add_p("4.3.2 Risk Pulse and Trade Journal: Portfolio Risk Pulse combines concentration and market-volatility-related measures into a quantitative indicator. The Trade Journal allows users to attach emotion tags such as Calm, FOMO, Panic, Conviction, Greed and Disciplined to trades.")
    b.add_p("4.3.3 Alerts and Tax-Lot Tracker: The alert system supports compound conditions involving price, momentum and portfolio allocation. The tax-lot tracker supports FIFO, LIFO and HIFO cost-basis approaches and can generate a CSV representation for further tax reporting workflows.")
    b.add_p("4.3.4 Admin Dashboard: The administrator dashboard provides role-restricted user management and platform controls. Administrators can inspect users, disable accounts where required and operate the global trading kill switch.")
    b.add_p("CODE IMPLEMENTATION:", bold=True)
    b.add_p("if (getGlobalKillSwitch()) {\n  return NextResponse.json(\n    { error: 'Trading is temporarily halted by system administrators.' },\n    { status: 503 }\n  );\n}", align="left", size=20, space_before=50, space_after=150)
    b.add_page_break()

    # ---------------- CHAPTER 5: RESULT AND DISCUSSION ----------------
    b.add_heading_1("CHAPTER 5")
    b.add_heading_1("RESULT AND DISCUSSION")
    b.add_heading_2("5.1 Overview")
    b.add_p("The implemented system provides a unified interface for cryptocurrency market monitoring, portfolio management, controlled trading and analytical review. The following sections describe the principal screens and the behavior demonstrated by the uploaded project implementation.")
    b.add_heading_2("5.2 Login Page")
    b.add_p("The login page provides a controlled entry point to the application. Users can authenticate with their credentials, while demo access can be used for presentation when cloud services are not configured. Protected dashboard routes depend on the current authentication state.")
    b.add_heading_2("5.3 Dashboard Page")
    b.add_p("The dashboard combines market statistics, portfolio summaries, watchlist information and recent activity. Its modular card-based structure allows users to reach the major system functions without navigating through unrelated pages.")
    b.add_heading_2("5.4 Market / Watchlist Page")
    b.add_p("The market and watchlist interface allows users to inspect cryptocurrency information and maintain a personal list of assets. Price alerts can be created using threshold conditions so that the system can represent a user's monitoring requirements.")
    b.add_heading_2("5.5 Portfolio Page")
    b.add_p("The portfolio page presents holdings, allocation and transaction history. Charts and tables provide two complementary views of the same transaction data, allowing users to understand both individual records and the overall portfolio composition.")
    b.add_heading_2("5.6 Trade Page")
    b.add_p("The trade page demonstrates paper trading and supports sandbox exchange execution when Binance Spot Testnet credentials are configured. The server validates orders and applies the global kill switch and rate-limiting controls before an external request is made.")
    b.add_heading_2("5.7 Insights Page")
    b.add_p("The Insights page groups simulation, risk, journaling, alert and tax-lot tools. These features demonstrate how raw portfolio and market data can be transformed into higher-level information for review and learning.")
    b.add_heading_2("5.8 Admin Page")
    b.add_p("The admin page is restricted to administrator roles. It provides user-management operations and platform-level trading controls. Server-side role verification prevents the browser interface alone from granting administrator privileges.")
    b.add_heading_2("5.9 Discussion of Result")
    b.add_p("The completed implementation demonstrates a working architecture for cryptocurrency management with a clear separation between presentation, business logic, persistence and external services. The use of reusable components reduces duplication, while server-side validation and encryption address important security concerns. The application also includes a local/demo pathway, which makes it practical to demonstrate the project without requiring real cryptocurrency funds.")
    b.add_p("The project includes the principal management workflows expected from a cryptocurrency portfolio platform: authentication, market discovery, watchlist management, portfolio transactions, alerts, paper trading, sandbox exchange execution and analytical insights. The architecture is designed so that additional data providers and exchange integrations can be introduced without rewriting the complete interface.")
    b.add_page_break()

    # ---------------- CHAPTER 6: CONCLUSION AND FUTURE ENHANCEMENT ----------------
    b.add_heading_1("CHAPTER 6")
    b.add_heading_1("CONCLUSION AND FUTURE ENHANCEMENT")
    b.add_heading_2("6.1 CONCLUSION")
    b.add_p("The Cryptocurrency Management System successfully combines cryptocurrency market monitoring, portfolio management, transaction tracking, alerts, controlled trading and analytical tools within a single web application. The project demonstrates the practical use of Next.js, React, TypeScript, Supabase, public market APIs and modular component design to build a modern management platform.")
    b.add_p("The implementation also emphasizes security and controlled experimentation. Server-side authentication, Row Level Security, request validation, rate limiting, AES-256-GCM encryption and the administrator kill switch are integrated into the protected trading workflow. Paper trading and Binance Spot Testnet support provide safer environments for demonstrating trade-related features.")

    b.add_heading_2("6.2 FUTURE ENHANCEMENT")
    b.add_p("Future enhancements can include richer historical market datasets, additional exchanges and sandbox environments, more advanced portfolio optimization models, configurable reporting dashboards, improved tax-reporting integrations and expanded notification channels. The architecture can also be extended with stronger observability, automated deployment checks and additional automated security testing.")
    b.add_p("The system can further evolve into a multi-device application with progressive web application support and improved offline behavior. Additional educational modules could explain blockchain concepts, order types, risk measures and portfolio mathematics so that the platform becomes not only a management tool but also a structured learning environment.")
    b.add_page_break()

    # Delegate to full comprehensive report builder
    from build_full_comprehensive_report import build_docx_report
    build_docx_report()


if __name__ == "__main__":
    build_chapter_2_only()
    build_full_report()
