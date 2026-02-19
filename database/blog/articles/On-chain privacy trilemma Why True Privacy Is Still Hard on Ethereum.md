---
base: "[[blog-index.base]]"
AuthorEmail: ""
Slug: On-chain-privacy-trilemma-Why-True-Privacy-Is-Still-Hard-on-Ethereum
PublishDate: 2025-11-16
Status: Published
Author: Mehdi
Tags:
  - Technology
  - Education
Description: "How the pursuit of privacy collides with usability and security — and how new protocols like Tokamak Channels might resolve it."
CoverImageAlt: ""
Published: Prod
ArticleId: 5
---

This article extends the presentation "*The Privacy Trilemma" *by Wei Dai at* DC Privacy Summit 2025* — [YouTube](https://www.youtube.com/watch?v=b1RjuJrOt3A).

# Introduction

![[image 256.png]]

Article 12 of the [*Universal Declaration of Human Rights*](https://www.un.org/en/about-us/universal-declaration-of-human-rights) states:

> *“No one shall be subjected to arbitrary interference with their privacy, family, home or correspondence… Everyone has the right to the protection of the law against such interference or attacks.”*

Likewise, Article 17 guarantees the right to own property and not be arbitrarily deprived of it:

> *“Everyone has the right to own property alone as well as in association with others. No one shall be arbitrarily deprived of his property.”*

These two articles—privacy and property—are at the heart of what we might call **self-sovereign assets**: assets that you truly own and control, along with the right to decide when and how information about them is revealed.

In traditional finance, privacy is enforced by legal and institutional walls. On public blockchains, however,** **every transaction is transparent by default. Anyone can see where assets flow, how much, and between whom.

This radical transparency is both the strength and the Achilles’ heel of decentralized systems. It enables open, permissionless coordination—but it also means that privacy, a basic human right, is missing from the foundation of on-chain finance.

And this brings us to the On-Chain Privacy Trilemma—a fundamental tension that defines the limits of blockchain privacy today.

The goal of this article is to clarify why achieving true privacy on public blockchains such as Ethereum remains an unresolved challenge. It addresses the fundamental *on-chain privacy trilemma, *the tension between self-sovereign privacy, maximal usefulness, and threat resistance—and analyzes why no existing protocol can fully satisfy all three. The article examines how different privacy models, from Zcash to Tornado Cash and custodial systems, navigate these trade-offs, and how emerging architectures like Tokamak Channels may begin to reconcile them. The key result is a clear conceptual framework for understanding the limits and possibilities of on-chain privacy today, along with a perspective on how hybrid, zero-knowledge–based systems might “bend” the trilemma. This paper is recommended for blockchain developers, privacy researchers, policymakers, and DeFi architects seeking to design or evaluate privacy-preserving systems. Readers will gain a structured understanding of the core trade-offs shaping blockchain privacy and insights into promising directions for future protocol design.

# **The On-Chain Privacy Trilemma**

As first articulated by Wei Dai, research partner at 1kx, the On-Chain Privacy Trilemma states a simple but powerful claim:

> No on-chain system can simultaneously achieve (1) self-sovereign privacy, (2) maximal usefulness, and (3) strong threat resistance.

To understand why, we first examine the three pillars.

![[Capture_decran_2025-11-09_a_08.08.54.png|source: on-chain trilemma]]

Let’s unpack these three pillars.

## **Self-Sovereign Privacy**

Self-sovereignty means users maintain full control over both their assets and their privacy. No intermediary can forcibly reveal, freeze, or manage their information.

In Eric Hughes’ 1993 *Cypherpunk Manifesto*, he wrote:

> *“Since we desire privacy, we must ensure that each party to a transaction have knowledge only of that which is directly necessary for that transaction… An anonymous system empowers individuals to reveal their identity when desired and only when desired.”*

This captures the essence of self-sovereign privacy: the freedom to selectively disclose.

In decentralized finance (DeFi), this concept extends beyond simple anonymity. It includes:

- **Anonymity:** The sender or receiver’s identity remains hidden.
- **Confidentiality:** Transaction amounts or asset types remain secret.
- **Function privacy:** Even the application logic can remain opaque to outsiders.

In short: users and apps can choose what to reveal, and to whom.

## **Maximally Useful**

For a privacy-preserving system to be maximally useful, it must preserve all the benefits of open finance:

- Permissionless access (no KYC barriers)
- Composability with existing DeFi protocols
- Unlimited velocity and frequency of transactions
- Compatibility with new addresses and wallets (sybil-tolerant)

In practice, this means that privacy must not slow down the system, restrict liquidity, or fragment the user experience.

## **Threat-Resistant**

Finally, a threat-resistant system must allow tracing and mitigation of malicious activity such as hacks, exploits, and money laundering.

Every public blockchain today is somewhat threat-resistant because all transactions are visible.

Investigators can follow the trail of stolen funds, and exchanges can freeze or reject tainted assets.

An ideal privacy-preserving system would maintain that ability—allowing hacked funds to be traced without compromising ordinary users’ privacy.

# **The Impossibility: You Can’t Have All Three**

The trilemma arises because these three goals inherently conflict. 

It is important to clarify that the trilemma primarily applies to *privacy-preserving* systems built on top of public blockchains, not to Ethereum itself. Ethereum, as a public ledger, achieves maximal usefulness, threat resistance, and self-sovereignty precisely because it sacrifices privacy. All transactions are transparent and verifiable, enabling permissionless access while allowing regulators, auditors, and security researchers to trace malicious activity (see [Chainalysis Crypto Crime Report 2025](https://www.chainalysis.com/blog/crypto-hacking-stolen-funds-2025)). In this sense, Ethereum is a fully *threat-resistant* and *self-sovereign* system — but not a *private* one. The on-chain privacy trilemma becomes relevant only when we attempt to introduce privacy layers or L2 protocols that conceal transaction details while preserving Ethereum’s openness and security guarantees.

Let’s sketch the logic.

### **Step 1: Self-sovereign and Maximally useful**

A system that aims to be maximally useful cannot rely on global identity registration.

Blockchain addresses are arbitrary strings generated locally without permission; requiring KYC or identity linkage would eliminate the open-access property that defines public blockchains.

Zcash and Monero illustrate this clearly. Anyone can generate an address and transact immediately—no KYC, no centralized gatekeeping, and complete user control. This preserves both self-sovereignty and usefulness: all users can interact at high speed, use fresh addresses at will, and enjoy frictionless participation.

But the moment a privacy system introduces provenance proofs or attestation requirements to prevent abuse, the openness that enables maximal usefulness begins to degrade. This leads directly into the next conflict.

### **Step 2: Self-sovereign and Threat-resistant**

If transactions are private by default for self-sovereignty, the system would lose threat resistance, since it cannot distinguish between legitimate and malicious activity. A hacker can simply move stolen funds into new private addresses, erasing the link to the crime. Systems that try to preserve both self-sovereignty and threat resistance almost always sacrifice maximal usefulness.

 A good example is Tornado Cash combined with post-sanctions mechanisms like Proof of Innocence or Privacy Pools. These designs allow users to retain self-sovereign control over their keys while adding optional proofs that their funds do not originate from sanctioned or hacked addresses (introducing a degree of threat resistance without relying on custodians or identity checks).

However, this comes at a clear usability cost. Before a withdrawal can be accepted, users may need to generate heavy zero-knowledge proofs, wait through challenge windows, or rely on slow verification steps. The resulting delays reduce transaction velocity, make real-time trading or arbitrage impractical, and prevent seamless integration with DeFi protocols that expect instant finality. Liquidity becomes fragmented across private pools, and composability is significantly reduced.

In short, the more a private system tries to resist threats without compromising self-sovereignty, the more it must slow down or constrain user activity, demonstrating why self-sovereign + threat-resistant systems cannot also remain maximally useful.

### **Step 3: Maximally useful and Threat-resistant**

Maximal usefulness (instant finality, universal composability, permissionless access) together with strong threat resistance (robust tracing, rapid freezing of tainted funds, regulator/auditor access) is achievable in practice, but only by introducing a party or mechanism that can override pure user control. In other words, you get both utility and strong security by sacrificing self-sovereignty.

A clear, real-world example is centralized exchanges (CEXs) such as Binance or Coinbase. These platforms provide high throughput, immediate settlement against their internal order books, and extensive compliance tooling that lets them block, freeze, or reverse accounts associated with illicit activity. That combination makes them both maximally useful (fast, liquid, highly composable within their ecosystems) and threat-resistant (they can act on taint lists and comply with law enforcement). The trade-off is obvious: users on a CEX do not retain full self-sovereignty. Funds and privacy are subject to the exchange’s custody, policies, and legal obligations.

Formally: to guarantee high velocity and enforceable remediation at the same time, a system must either rely on trusted parties or decryptable records (compromising self-sovereignty), or accept the usability and liquidity costs of decentralized accountability mechanisms (sacrificing maximal usefulness). There is no practical way to enforce both instant, permissionless composability and cryptographic, user-exclusive privacy and full threat remediation simultaneously — which is exactly the trilemma’s point.

# **Mapping the Current Landscape**

Different privacy protocols position themselves at different points within the trilemma. Broadly, they fall into three categories, each optimizing for two pillars at the expense of the third.

| **Example Protocols** | **Focused on** | **Self-Sovereign Privacy** | **Maximal Usefulness** | **Threat-Resistance** |
| --- | --- | --- | --- | --- |
| *Zcash*, *Monero* | Idealized Privacy | High | High | No |
| *Tornado Cash* + Proof of Innocence | Pragmatic Privacy | Medium | Low | Yes |
| *Binance* | Privacy with Information Custodians | No | High | Yes |

source: [Wei Dai - The Privacy Trilemma | DC Privacy Summit 2025](https://www.youtube.com/watch?v=b1RjuJrOt3A)

Below, we examine each category in detail.

# **Category A: Idealized Privacy**

Protocols such as Zcash and Monero prioritize self-sovereign privacy above all else. Their techniques, zero-knowledge proofs (Zcash) and ring signatures (Monero), enable:

- hidden sender and receiver identities
- confidential transaction amounts
- fungible, privacy-preserving assets
- fully permissionless address generation

These systems offer near-perfect on-chain privacy, but with a significant trade-off: they eliminate threat resistance. Once funds enter a shielded pool or ring set, the transaction graph becomes non-recoverable.

If stolen assets are deposited, neither victims nor regulators have meaningful tools to trace or intervene.

<u>Verdict</u>: Excellent privacy, high usability within the protocol’s own boundaries, but effectively zero threat resistance.

# **Category B: Pragmatic Privacy**

Projects such as Tornado Cash with Proof of Innocence and the more recent Privacy Pools represent a pragmatic attempt to balance privacy with accountability. Instead of offering unconditional anonymity, these systems impose additional verification steps that allow users to demonstrate the legitimacy of their funds without exposing their full transaction history. In practice, this means that users may be required to prove that their deposits or withdrawals are not tied to blacklisted addresses, or that their interactions within the pool fall within an approved subset of the transaction graph.

These safeguards provide a measure of threat resistance but introduce noticeable friction. Zero-knowledge proofs must often be generated before withdrawal, and these proofs can be computationally heavy. Some protocols introduce challenge periods or verification delays, slowing down settlements. Moreover, liquidity becomes fragmented across separate privacy pools, making high-frequency trading, arbitrage, and other DeFi-native activities difficult or infeasible. What emerges is a system that is safer and more accountable than idealized privacy models, yet also meaningfully slower and less composable.

<u>Verdict</u>**:** pragmatic and more responsible, but at the cost of speed, liquidity, and seamless DeFi integration.

# **Category C: Privacy with Information Custodians**

The third category consists of systems that prioritize threat resistance by introducing some form of information custodian, though the degree of custodial control varies significantly. The first subgroup relies on trusted operators, such as centralized exchanges or custodial mixers. These platforms provide fast settlement, operational simplicity, and strong threat resistance because the operator can freeze suspicious accounts, inspect historical transfers, or comply with regulatory requests. However, this efficiency comes at the expense of self-sovereignty: user data and assets are ultimately governed by the custodian’s infrastructure, policies, and legal obligations.

A contrasting subgroup uses cryptographic committees built on multi-party computation (MPC) or fully homomorphic encryption (FHE). Here, no single party can decrypt or alter user data, and any disclosure requires collective agreement among committee members. This model preserves self-sovereignty and still enables partial threat resistance through consensual transparency. Yet the computational cost of MPC and FHE is high, resulting in slower transaction throughput and limited real-time composability with existing DeFi systems. In practice, these designs remain significantly less usable than transparent, high-velocity networks.

**Verdict:** either highly useful but non-sovereign (trusted operators), or self-sovereign but slow and less composable (MPC/FHE committees).

# **Enter Tokamak Channels: A Promising New Path**

Can we break the trilemma (or at least bend it)?

The Tokamak Channels Protocol proposes a novel architecture that combines state channels, zero-knowledge proofs (ZKPs), and on-chain verification to approach all three pillars of the on-chain privacy trilemma.

Tokamak Network itself has long focused on scalable Layer-2 infrastructure for Ethereum, pioneering hybrid rollups and plasma solutions that maintain Ethereum-level security while reducing costs. The Channels initiative builds directly on that foundation, extending the vision of scalability to privacy-preserving state transitions.

### **Background: From Rollups to Private Channels**

Traditional rollups and plasma chains improve scalability by batching transactions and submitting proofs to Ethereum. However, they remain publicly visible. Every transaction inside a rollup is traceable once data is posted on-chain.

Tokamak Channels take a different route: instead of making every transaction visible to everyone, they use off-chain private channels secured by on-chain commitments and ZK verification.

Users lock assets in a smart contract, open bilateral or multilateral channels, and transact privately off-chain. Each state update is cryptographically proven valid on-chain without revealing underlying data.

When participants settle their channels, a ZK-proof attests that all intermediate transitions followed protocol rules. This preserves privacy while ensuring Ethereum-level finality and security.

### **Design Goals and Core Mechanisms**

Tokamak Channels are built to satisfy the three privacy pillars as follows:

| **Property** | **Strength** |
| --- | --- |
| **Self-Sovereign Privacy** | ✅ Strong |
| **Threat Resistance** | ⚠ Partial |
| **Maximally Useful** | ⚠ Partial |

Channel participants transact privately off-chain, and only the users involved can reveal their data. There are no custodians, operators, or decryptable logs, meaning privacy remains fully user-controlled. This matches Ethereum’s self-custodial security model: users remain responsible for their own keys.

Moreover, Tokamak Channels do not allow funds to be “stolen” through protocol-level vulnerabilities.

All state transitions are verified through zero-knowledge proofs, so the channel itself cannot be forged or manipulated by other participants.

The only realistic threat scenarios are the same as Ethereum:

- a participant’s L2 private key is compromised,
- they sign a malicious transaction due to social engineering,
- or their signing environment is compromised (malware, phishing, etc.).

In these cases, an attacker can move the victim’s funds within the channel network.

However, every state transition is cryptographically linked and ZK-verified, so the full path of those transfers is traceable, with the consent of affected channel participants.

This enables post-incident analysis and recovery attempts, while still preserving privacy for normal users.

Finally, Tokamak Channels retain partial usefulness:

- Channels are EVM-compatible. However, liquidity is distributed across many channels, which limits seamless DeFi composability.
- Additionally, channel settlement and committee-based ZK verification (when applicable) introduce computational overhead, making throughput slower than public Ethereum transactions.

So while the system preserves privacy and provides a path toward accountability, it still falls short of Ethereum-level velocity and universal composability.

Essentially, Tokamak Channels keep most activity off-chain, using ZK proofs to verify state updates on-chain without revealing private details. Because funds move within provable, cryptographically linked channels, malicious behavior remains traceable through the channel graph, preserving accountability without sacrificing privacy.

# **The Road Ahead**

Breaking the on-chain privacy trilemma may require entirely new primitives:

- **Accountable mixers** with verifiable disclosures
- **Hybrid rollups** combining public settlement with private execution
- **Selective disclosure standards** at the wallet layer
- **On-chain reputation systems** compatible with privacy-preserving identities

Each innovation moves us closer to the ultimate goal:

> A world where individuals control their assets and their privacy— yet society retains the tools to prevent abuse.

Until then, the trilemma remains the most important design constraint in blockchain privacy.

And understanding it is the first step toward overcoming it.

# Source

- Tokamak zk-EVM — [https://github.com/tokamak-network/Tokamak-zk-EVM](https://github.com/tokamak-network/Tokamak-zk-EVM)
- *A Cypherpunk’s Manifesto* (Eric Hughes, 1993) — [activism.net/cypherpunk/manifesto.html](https://www.activism.net/cypherpunk/manifesto.html)
- *The Privacy Trilemma | DC Privacy Summit 2025* — [YouTube](https://www.youtube.com/watch?v=b1RjuJrOt3A)
- Beal & Fisch, *Derecho: Privacy Pools for Accountable Mixing*, ACM 2024 — [dl.acm.org/doi/pdf/10.1145/3658644.3670270](https://dl.acm.org/doi/pdf/10.1145/3658644.3670270)
- Chainalysis 2025 Crypto Hacking Report — [chainalysis.com/blog/crypto-hacking-stolen-funds-2025](https://www.chainalysis.com/blog/crypto-hacking-stolen-funds-2025)