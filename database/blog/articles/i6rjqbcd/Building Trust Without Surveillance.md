---
base: "[[blog-index.base]]"
ArticleId: i6rjqbcd
Title: "Building Trust Without Surveillance"
Slug: building-trust-without-surveillance
Description: "Defines SYB’s privacy model and sets the constraints needed to protect the trust graph on a public ledger."
Published: Staging
PublishDate: "December 22, 2025"
Tags:
  - Algorithm
  - Technical
  - Technology
Author: "Nil Soroush"
CoverImage: "Building%20Trust%20Without%20Surveillance/Anonymouse_network_4to1.png"
ReadTimeMinutes: 12
Status: "Ready to Publish"
---

# Building Trust Without Surveillance


## Introducing SYB’s Privacy-First Trust System

<aside>

Online reputation systems currently demand a steep price for trust: **your privacy**. To prove you are trustworthy, these systems force you to expose everything—*who endorsed you*, *who you interact with, how often, and in what context*. Over time, your social graph becomes public property. Your relationships are reduced to data points, and your reputation effectively becomes a form of surveillance.

</aside>

![Anonymouse network.png](Building%20Trust%20Without%20Surveillance/Anonymouse_network.png)

But this trade-off is not inherent to trust itself. It is a consequence of how reputation systems are designed today. What if people could privately vouch for each other—and still build a trustworthy, verifiable reputation—without revealing their connections?

This is the vision driving the next evolution of the SYB Network. While our current MVP establishes trust through public staking, we are now developing a privacy-preserving layer that keeps trust relationships confidential, unlinkable, and untraceable—without sacrificing public verifiability. The real challenge is not merely encrypting content; it is eliminating the metadata that exposes *who trusts whom*.

In this post, we define what privacy means in the context of SYB, specify the information we aim to protect, and explain why achieving this level of privacy is fundamentally difficult. In a follow-up post, we introduce the protocol designed to satisfy these constraints.

# The Core Problem: Metadata, Not Messages

The fundamental weakness in most reputation systems is not weak encryption—it is **metadata leakage**.

Even if the content of an endorsement is protected by strong cryptography, the system often still reveals critical signals: who sent it, who received it, and when it occurred. In isolation, these signals may appear harmless. Together, they act as breadcrumbs that allow observers to reconstruct a user’s social graph.

Consider a simple example: Alice vouches for Bob on-chain. An observer may not know the value or contents of that endorsement, but they immediately learn that Alice and Bob are connected. As similar interactions repeat, patterns emerge. Frequency, directionality, and timing reveal the relative importance of that connection. At scale, this structural information is often more sensitive—and more revealing—than the message content itself.

This is why simply “adding encryption” is a band-aid, not a cure. As long as identities and interaction patterns are visible, the trust graph remains exposed.

To achieve meaningful privacy, a trust network must do more than hide what is being said. It must eliminate these signals entirely, removing the ability for outsiders to infer who trusts whom.

# What Privacy Means in the SYB Network

Privacy in SYB is not about absolute secrecy. It is **selective, intentional, and precisely scoped**. SYB does not attempt to hide reputation outcomes. Instead, it protects the underlying relationships that produce them.

## What SYB Protects

At its core, SYB is designed to keep the **trust graph private**. Specifically, the system protects:

- **Relationship confidentiality:** No observer should be able to determine whether a specific endorsement exists between two users.
- **Neighbor sets:** A user’s incoming and outgoing trust relationships remain hidden from public view. Exposing trust networks enables graph reconstruction and creates real attack surfaces. Once trusted connections are visible, adversaries can exploit them through targeted social engineering, impersonation of trusted peers, coercion, or reputation-based manipulation. Protecting neighbor sets is therefore not only a privacy goal, but a direct security requirement.
- **Unlinkability:** Multiple endorsements cannot be linked to the same sender, the same receiver, or the same underlying relationship.
- **Anonymity of action:** Endorsements cannot be attributed to identifiable senders or recipients by external observers.

In short, the structure of the trust graph remains invisible, even though the system operates on a public ledger.

## What SYB Intentionally Reveals

To maintain utility and verifiability, SYB allows certain information to be public or provably disclosed:

- **Reputation scores**, or zero-knowledge proofs (ZKPs) about those scores
- **Derived statements** (e.g., “this user’s score is at least *k*”)
- **Aggregate participation metrics**, such as the number of vouches a user has issued or the total stake they have committed that endorsements are valid and economically backed
- **Aggregate participation metrics**, such as the number of vouches a user has issued or the total stake they have committed

Publishing a score necessarily leaks a small amount of coarse information. This leakage is intentional and unavoidable. SYB’s privacy guarantee is that **nothing is revealed beyond what is logically implied by the disclosed aggregates and scores**.

## What SYB Does Not Attempt to Hide

To clearly define technical boundaries, SYB has explicit non-goals. The system does not attempt to:

- Hide information mathematically implied by a disclosed score or aggregate participation metric
- Prevent inference based on off-chain behavior or external context
- Obfuscate score or activity distributions across the network
- Prevent users from voluntarily disclosing their own trust data

These limitations are inherent to any system that aims to produce publicly verifiable outcomes.

## Why This Definition Matters

By focusing on **graph protection rather than outcome secrecy**, SYB establishes clear design constraints. Any mechanism that reveals identities, interaction patterns, or neighbor sets—even indirectly—fails to meet this standard. This framing directly drives the protocol design choices explored next.

# Threat Model: Designing for a Transparent World

SYB is designed for a highly transparent, adversarial environment where privacy must hold on a public ledger.

## Adversary Capabilities

We assume a global passive adversary with full access to public state, including the ability to:

- Monitor all on-chain transactions, commitments, and state updates
- Analyze timing, frequency, and ordering of events over time
- Perform large-scale graph and statistical analysis
- Operate without relying on trusted infrastructure such as relayers or private channels

## Adversary Goals

The adversary’s objective is not primarily to decrypt data, but to infer relationships. This includes attempts to:

- Identify who vouches for whom
- Link multiple actions to a single user
- Reconstruct neighbor sets or social circles

## Out of Scope

SYB does not attempt to defend against:

- Active denial-of-service attacks
- Compromise of local devices or private keys
- Correlation with voluntary off-chain disclosures or external data

On a public blockchain, transparency is the default. Any design that relies on obscurity or trusted intermediaries is brittle. SYB is built on the requirement that observable data must not encode the trust graph, even under global analysis.

# Why Existing Approaches Fail

Given the privacy definition and threat model above, many familiar approaches fail—even when they use encryption.

<aside>

- **Public endorsements:** Making sender and recipient identities visible trivially exposes trust edges.
- **Interactive handshakes:** Protocols requiring interaction (e.g., key exchanges) introduce metadata. Even if content is hidden, the existence of the interaction reveals a relationship.
- **Aggregate statistics:** Publishing counts (such as total endorsements received) leaks degree information, enabling inference and graph reconstruction over time.
- **Trusted infrastructure:** Reliance on mixers or relayers introduces single points of failure and contradicts the trustless nature of public ledgers.
</aside>

<aside>

- **Payload encryption without metadata protection:** Encrypting message content while leaving identities public still reveals who interacted with whom. Under metadata analysis, this is sufficient to reconstruct social circles.

</aside>

![SYBNEtwork.png](Building%20Trust%20Without%20Surveillance/SYBNEtwork.png)

## Summary: The Narrow Design Space

Under a global passive adversary, the following holds:

- Exposing identities leaks edges
- Exposing interactions leaks relationships
- Exposing counts leaks degrees

To satisfy SYB’s privacy goals, endorsements must be **non-interactive, unlinkable, and indistinguishable on-chain**, while remaining verifiable and economically meaningful. This observation leads directly to the design constraints below.

# Design Constraints for a Privacy-Preserving Trust Network

The failures above are structural, not accidental. Any system that survives this threat model must satisfy the following non-negotiable constraints:

1. **No visible sender**
    
    Endorsements must never be linkable to a long-term identity.
    
2. **No visible receiver**
    
    Observers must not be able to determine who an endorsement is intended for.
    
3. **No interactive communication**
    
    Endorsements must be created and delivered non-interactively.
    
4. **Unlinkability by default**
    
    Endorsements must not be linkable across time, even without identities.
    
5. **Public verifiability**
    
    The public must be able to verify validity, economic backing, and rule enforcement.
    
6. **One-time use guarantees**
    
    Each endorsement must be usable exactly once to prevent replay and correlation.
    

## A High-Level Mental Model

At a high level, SYB operates over a public, append-only ledger that functions like a global bulletin board. Everything on this board is visible. The challenge is not hiding state, but making its **meaning indistinguishable**.

Endorsements appear as sealed, opaque objects. To an external observer, all such objects look the same: they reveal no sender, no recipient, and no content. The public state exposes no visible edges or interaction patterns.

Users do not receive endorsements through addressed messages. Instead, everyone observes the same public data and privately discovers which endorsements are relevant to them. From the outside, all users behave identically.

Reputation accumulates privately, while trust outcomes remain publicly verifiable. The ledger provides integrity and auditability—but never identity or relationships.

This mental model satisfies the privacy constraints defined above. The next post describes the protocol that realizes it in practice.

# A Trust System That Doesn’t Spy on You

This design enables something new in reputation systems: verifiable trust without social surveillance.  It supports:

- Anonymous yet trustworthy interactions
- Reputation-based access control without doxxing
- Community trust without public exposure

In a world where trust is often built at the cost of privacy, SYB demonstrates that we do not have to choose. We can have both: private connections and verifiable reputation.

In the meantime:

- **Try the MVP:** Connect your wallet and explore the public staking graph on the [**Sepolia Testnet**](https://syb.tokamak.network/).
- **Join the Community:** Be the first to know when the paper drops by joining our [**Telegram**](https://t.me/+HOQmpdZqr4gyZjc8).

---

Date: 22th of December , 2025
Author: **Nil Soroush** — ZKP Researcher at Tokamak Network