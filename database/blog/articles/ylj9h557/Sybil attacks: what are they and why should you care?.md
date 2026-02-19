---
base: "[[blog-index.base]]"
ArticleId: ylj9h557
Title: "Sybil attacks: what are they and why should you care?"
Slug: sybil-attacks-what-are-they-and-why-should-you-care
Description: "We discuss here the notion of a Sybil attack and explain why systems should be sybil-resistant through some examples."
Published: Staging
PublishDate: "November 27, 2025"
Tags:
  - Education
  - Technical
  - Technology
Author: "Luca Dall'Ava & Jamie Judd"
CanonicalURL: "https://syb.tokamak.network/blog/sybil-attacks-what-are-they-and-why-should-you-care"
ReadTimeMinutes: 10
Status: "Ready to Publish"
CoverImageAlt: "Illustration depicting the concept of Sybil attacks in distributed networks"
---

# Sybil attacks: what are they and why should you care?


---

<aside>

We discuss here the notion of a Sybil attack and explain why systems should be sybil-resistant through some examples.

</aside>

---

# Sybil attacks: Definition and Origin

A **Sybil attack** occurs when a single adversary controls multiple fake identities (nodes/accounts) on a peer-to-peer network to gain disproportionate influence. The term was introduced the first time in the early 2000s, by John R. Douceur in the seminal paper [**[D02]](https://www.notion.so/Sybil-attacks-what-are-they-and-why-should-you-care-30c30540582c8108a95ee17ed949836f?pvs=21)** (by suggestion of Brian Zill).

A Sybil attack is an attack based on forging multiple identities in order to control or skew the reputation of a system.

In simple terms, it is a **"sockpuppet" attack** applied to digital networks: while one user typically equals one vote or one unit of reputation, a Sybil attacker (the *puppeteer)* subverts this by creating thousands of pseudonymous "users" (the *puppets)* that are actually controlled by the attacker itself.

![](Sybil%20attacks%20what%20are%20they%20and%20why%20should%20you%20car/Gemini_Generated_Image_1q1pok1q1pok1q1p.png)

Sybil resistance is critical for blockchain ecosystems, DAOs, and DeFi protocols, as these digital environments need robust identity verification and reputation mechanisms to maintain integrity and trust, as we can see in the following examples.

# The threats posed by a Sybil attack

The goal of a Sybil attack is to subvert the **reputation system** or **consensus mechanism** of a network.

By forging identities, an attacker can:

- **Skew Governance:** Outvote honest participants in DAOs (Decentralized Autonomous Organizations).
- **Defraud Systems:** "Farm" airdrops or rewards intended for unique humans.
- **Compromise Privacy:** Monitor traffic and de-anonymize users (common in privacy networks like Tor).
- **Disrupt Service:** Launch Denial of Service (DoS) attacks by flooding the network with requests from fake accounts.

These are real occurrences of Sybil attacks! Let us discuss them with precise examples in mind.

# Real-world examples

## **Skew Governance:** Consensus Threats (51% Attacks)

If a Sybil attacker creates enough fake nodes (miners or validators) to control over 50% of the network's computing power or stake, they can rewrite transaction history and double-spend funds.

- **The Aragon Vote Manipulation (2023) study case: [**Case Study (Aragon):** Aragon's Blog - [Aragon Association Takes Action to Safeguard the Mission of the Aragon Project and its Community of Builders](https://www.notion.so/2b0d96a400a3809880b8e3f4151be2f7?pvs=21)](https://www.notion.so/Case-Study-Aragon-Aragon-s-Blog-Aragon-Association-Takes-Action-to-Safeguard-the-Mission-of-the-30c30540582c818b9788ecb3ef94f0ef?pvs=21).** What happened: Aragon, a major tool for building DAOs, faced a governance attack where a group of users (allegedly "risk-free value raiders") accumulated tokens to force a vote that would liquidate the project's treasury for their own profit. While not a "fake identity" attack in the traditional sense, it highlighted the fragility of token-based governance against coordinated "Sybil-like" swarms.
- **Ethereum Classic (ETC) Attacks (2019 & 2020):** 
[**Coinbase:** [What is a 51% attack and what are the risks?](https://www.coinbase.com/en-it/learn/crypto-glossary/what-is-a-51-percent-attack-and-what-are-the-risks)](https://www.notion.so/Coinbase-What-is-a-51-attack-and-what-are-the-risks-30c30540582c81658291d48690689da6?pvs=21), [**Ethereum Classic Blog:** [What Is a 51% Attack? - Ethereum Classic](https://ethereumclassic.org/blog/2023-11-21-what-is-a-51-attack)](https://www.notion.so/Ethereum-Classic-Blog-What-Is-a-51-Attack-Ethereum-Classic-30c30540582c8103bb4cc768b1ab7560?pvs=21). Ethereum Classic suffered *three* separate 51% attacks in August 2020 alone. In one instance, an attacker reorganized over 3,000 blocks and successfully double-spent approximately $5.6 million worth of ETC. This proved that even top-20 cryptocurrencies (*at the time*) were vulnerable if their hashrate dropped low enough for an attacker to rent computing power (via services like NiceHash) to overwhelm the honest miners.

<aside>

*Sybil attacks can overrule honest users and skew the governance.*

</aside>

## **Defraud Systems:**

Attackers frequently automate the creation of thousands of fake wallets to unfairly claim airdrops or governance tokens distributed to early users.

- A **study case** is that of **Optimism** and **Uniswap** airdrops where malicious actors farmed tokens through multiple accounts: [**Case Study (Airdrops):** *Sybil attackers loot airdrops for millions* - [DL News](https://www.dlnews.com/articles/defi/sybil-attackers-loot-airdrops-for-millions-with-fake-wallets/)](https://www.notion.so/Case-Study-Airdrops-Sybil-attackers-loot-airdrops-for-millions-DL-News-30c30540582c81339c2ac8018a5ee07f?pvs=21). What happened: Let's focus on the **Optimism Case**. In the Optimism airdrop, data scientists identified over 17,000 Sybil addresses that had farmed millions of tokens. These attackers used complex scripts to simulate "human" activity across multiple wallets.
- A very recent study case, uncovered by the blockchain analytics firm [Bubblemaps](https://bubblemaps.io) is t**he aPriopri study case (Nov. 2025): [**Case Study (aPriori):** *Pantera-backed aPriori silent after one entity claims 60% of airdrop* - [Cointelegraph](https://cointelegraph.com/news/pantera-web3-startup-apriori-silent-entity-claims-60-airdrop)](https://www.notion.so/Case-Study-aPriori-Pantera-backed-aPriori-silent-after-one-entity-claims-60-of-airdrop-Cointel-30c30540582c818e8f59db38de30fc09?pvs=21).** What happened:
    1. The "Sockpuppet" Army: The attacker generated **14,000 separate crypto wallets**.
    2. The Funding (The "Paper Trail"): To make these wallets functional (they need a small amount of crypto to pay for transaction fees), the attacker funded them all from a *centralized* source. Specifically, they withdrew funds from the Binance exchange, sending exactly 0.001 BNB to each of the 14,000 wallets.
        
        <aside>
        
        **Remarks:**
        
        - This "funding pattern" is often the mistake that gets Sybil attackers caught. It links thousands of "unrelated" wallets back to a single source.
        - As of 18 Nov. 2025, a 0.001 BNB roughly corresponds to $0.906 (USD), therefore, amounting for a total of $12,684.00 (USD).
        </aside>
        
    3. The Harvest: All 14,000 wallets claimed their free APR tokens.
    4. The Consolidation: Instead of keeping the tokens in 14,000 places, the wallets immediately forwarded the claimed tokens to a small set of "control" wallets owned by the attacker.

<aside>

*Sybil attacks can (not only) dilute the value for legitimate users but also undermines trust in the ecosystem.*

</aside>

## **Compromise Privacy:**

Sybil attacks can be used to unmask anonymous users.

**The 2014 Tor Attack is an example:** [**Case Study (Tor):** *Tor network attacked by unknown group* - [BBC News](https://www.bbc.com/news/technology-28573625)](https://www.notion.so/Case-Study-Tor-Tor-network-attacked-by-unknown-group-BBC-News-30c30540582c81d3ad10c353a0379802?pvs=21). Attackers flooded the Tor network with roughly 115 fast relays. By controlling both the "entry" and "exit" points of user traffic, they could use traffic confirmation techniques to de-anonymize users and link their private browsing to real-world IP addresses.

Similarly, blockchain networks may face attacks where fake nodes attempt to sway consensus, block transactions, or link private user data to their real-world identities.

<aside>

*Sybil attacks can disrupt network privacy and performance.*

</aside>

## **Disrupt Service:**

In a Sybil-based DoS, the attacker does not necessarily need massive bandwidth (like a traditional DDoS using a botnet). Instead, they exploit the **protocol's logic**. By creating thousands of fake identities, they occupy the limited "slots" or "attention" that the network allocates to peers, effectively crowding out legitimate users.

**The Solana "Bot" Congestion (2021-2022): [**Solana News:** [9-14 Network Outage Initial Overview](https://solana.com/news/9-14-network-outage-initial-overview)](https://www.notion.so/Solana-News-9-14-Network-Outage-Initial-Overview-30c30540582c8171bfbdd153c6311b04?pvs=21).** While often described as "spam," this was effectively a Sybil attack on network resources.

- **The Mechanism:** During high-value NFT mints or IDOs, attackers used scripts to create massive numbers of requests from different accounts to flood the validators.
- **The Attack:** In one instance, bots flooded the network with *4 million transactions per second*. These weren't legitimate users; they were automated scripts trying to ensure their transaction was processed first.
- **The Result:** The sheer volume of packet processing overwhelmed the validators' memory, causing the network to fork or halt completely for hours. Legitimate users could not move funds.

<aside>

*A Sybil attack can disrupt a system.*

</aside>

# Core Strategies and Features

These attacks highlight how critical it is for decentralized platforms to adopt robust Sybil resistance mechanisms to preserve security, fairness, and trustworthiness; these practical contexts demonstrate why Sybil resistance is not just a theoretical problem but a crucial pillar for the healthy growth and security of blockchain ecosystems and decentralized networks.

<aside>

**Impossibility Results:**

In is important to notice that, Douceur, in [**[D02]](https://www.notion.so/Sybil-attacks-what-are-they-and-why-should-you-care-30c30540582c8108a95ee17ed949836f?pvs=21),** proved that in a peer-to-peer network without a central authority (like a bank) to verify identities, it is impossible to prevent a user from creating infinite fake identities unless you impose an external cost (like burning energy in **Proof of Work**) or require a trusted chain of certification.

</aside>

Therefore, effective Sybil resistance leverages mechanisms like decentralized identity proofs, economic disincentives, and cryptographic verification (including zero-knowledge proofs) to distinguish genuine users from malicious ones.

Among them we have

1. **Economic Disincentives (The "Cost" Barrier):** This is the most common defense in blockchains.
    - **Proof of Work (PoW):** Identities are tied to computing power. Creating a million identities is useless unless you have the hardware to back them.
    - **Proof of Stake (PoS):** Identities are tied to financial capital. To run multiple validator nodes, an attacker must lock up (stake) large amounts of capital, making attacks prohibitively expensive.
2. **Proof of Personhood (PoP):** Protocols that verify a user is a unique human without necessarily revealing their legal identity.
    - **Biometrics:** Scanning irises or fingerprints (e.g., [WorldID](https://world.org), [Humanity Protocol](https://www.humanity.org)).
    - **Social Graphs:** Analyzing the "web of trust." Real users tend to be connected to other real users; Sybils often form isolated clusters (e.g., [BrightID](https://www.brightid.org)).
3. **Cryptographic & Behavioral Analysis:**
    - **Zero-Knowledge Proofs (ZKPs):** Allowing users to prove they are unique/eligible without revealing *who* they are.
    - **Heuristic Analysis:** Analyzing on-chain data to find wallet clusters that move funds simultaneously or interact with contracts in identical, robotic patterns. Even with AI-aided tools.

### The Tokamak Network (and the Tokamak Network SYB Project) approach

For the [**Tokamak Network SYB Project**](https://www.notion.so/Tokamak-Sybil-Resistance-Overview-30c30540582c815e9f9fc4509cbcbf24?pvs=21), the Sybil resistance is strived for via:

- **(Tokamak Network) Staking Mechanisms:** Tokamak relies on crypto-economics. Operators must stake **TON** (Tokamak Network Token) to participate. This ensures that creating "fake" operators is not just difficult, but financially irrational—an attacker would lose their staked assets if caught acting maliciously.
- **(Tokamak Network SYB Project) Reputation Score:** Each user is assigned a reputation score which identifies how reliable a user. The scoring system aims to detect Sybil attacks and grant these fake users a low score, making it impossible for them to gain control over the network.

You can learn more about the [**Tokamak Network SYB Project**](https://www.notion.so/Tokamak-Sybil-Resistance-Overview-30c30540582c815e9f9fc4509cbcbf24?pvs=21) on the official website [**SYB Tokamak Network**](https://syb.tokamak.network).

---

### References:

- **[D02]** - John R. Douceur, The Sybil Attack (Microsoft Research) - [Read Paper](https://www.microsoft.com/en-us/research/publication/the-sybil-attack/)
- **Wikipedia:** [https://en.wikipedia.org/wiki/Sybil_attack](https://en.wikipedia.org/wiki/Sybil_attack)
- **Case Study (Airdrops):** *Sybil attackers loot airdrops for millions* - [DL News](https://www.dlnews.com/articles/defi/sybil-attackers-loot-airdrops-for-millions-with-fake-wallets/)
- **Case Study (aPriori):** *Pantera-backed aPriori silent after one entity claims 60% of airdrop* - [Cointelegraph](https://cointelegraph.com/news/pantera-web3-startup-apriori-silent-entity-claims-60-airdrop)
- **Case Study (Tor):** *Tor network attacked by unknown group* - [BBC News](https://www.bbc.com/news/technology-28573625)
- **Case Study (Aragon):** Aragon's Blog - [Aragon Association Takes Action to Safeguard the Mission of the Aragon Project and its Community of Builders](https://www.notion.so/2b0d96a400a3809880b8e3f4151be2f7?pvs=21)
- **Coinbase:** [What is a 51% attack and what are the risks?](https://www.coinbase.com/en-it/learn/crypto-glossary/what-is-a-51-percent-attack-and-what-are-the-risks)
- **Ethereum Classic Blog:** [What Is a 51% Attack? - Ethereum Classic](https://ethereumclassic.org/blog/2023-11-21-what-is-a-51-attack)
- **Solana News:** [9-14 Network Outage Initial Overview](https://solana.com/news/9-14-network-outage-initial-overview)

---

---

Date: 27th of November, 2025

Author(s): Luca Dall'Ava & Jamie Judd — ZKP Researcher & Core Researcher at Tokamak Network

---