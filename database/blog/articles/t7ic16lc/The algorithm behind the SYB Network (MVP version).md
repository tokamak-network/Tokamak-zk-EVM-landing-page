---
base: "[[blog-index.base]]"
ArticleId: t7ic16lc
Title: "The algorithm behind the SYB Network (MVP version)"
Slug: the-algorithm-behind-the-syb-network-mvp-version
Description: "We describe here the algorithm behind the reputation score in the SYB Network (MVP version) and present a few simple examples of a small network."
Published: Staging
PublishDate: "November 27, 2025"
Tags:
  - Algorithm
  - Education
  - Mathematics
  - Technical
Author: "Luca Dall'Ava"
CanonicalURL: "https://syb.tokamak.network/blog/the-algorithm-behind-the-syb-network-mvp-version"
ReadTimeMinutes: 15
Status: Draft
CoverImageAlt: "Diagram illustrating the SYB Network reputation algorithm with nodes and vouching relationships"
---

# The algorithm behind the SYB Network (MVP version)


---

<aside>

We describe here the algorithm behind the reputation score in the SYB Network (MVP version) and present a few simple examples of a small network.

</aside>

---

# Introduction and Motivation

## How to prevent sybil attacks: The Tokamak Network SYB project

A Sybil attack is an attack based on forging multiple identities in order to control or skew the reputation of a system. Sybil resistance is critical for blockchain ecosystems, DAOs, and DeFi protocols, as these digital environments need robust identity verification and reputation mechanisms to maintain integrity and trust. You can learn more about this topic here: https://syb.tokamak.network/blog/sybil-attacks-what-are-they-and-why-should-you-care.

The Tokamak Network Sybil Resistance Project (in short, SYB) aims to develop a framework for defending decentralized applications against Sybil attacks. 

The core of the the SYB Project, as well as the final goals of the project, is to answer the following questions.

<aside>

**Questions:** 

1. Given a group of users, is it possible to devise a reputation system? 
2. More precisely, is it possible to understand how reliable a user is, based on a vouching system?
3. Furthermore, is it possible to devise it with sybil resistant properties?
</aside>

# The algorithm

We describe and explain here a simple approach to the [above questions](https://www.notion.so/Preliminary-Version-The-algorithm-behind-the-SYB-Network-MVP-version-30c30540582c8174933ffb3a93782304?pvs=21) and explain how the scoring algorithm considered in the Sybil Network (MVP version) works: we begin by formalizing the setting and then describe the reputation system.

## Abstracting the setting

For this purpose, we should first model the network as a **directed** graph (link to Wikipedia Page: https://en.wikipedia.org/wiki/Directed_graph)

$$
G= (V,E)
$$

for $V$ a set of nodes and $E$ a set of edges. Given two nodes $v$ and $w$, we denote by $(v,w)$ the edge (if present in $E$) joining $v$ and $w$ with orientation “from $v$ to $w$”.

![Figure 1: Example of a graph with 4 vertices and 5 edges. Each node has an assigned score.](The%20algorithm%20behind%20the%20SYB%20Network%20(MVP%20version)/basic_directed_graph.png)

Figure 1: Example of a graph with 4 vertices and 5 edges. Each node has an assigned score.

In the graph:

- each node represents a user (or an address), and
- each edge represents a connection that the user made.

**Notation:** We will refer to this graph as of the *Network.*

## The reputation system

The **reputation system** is implemented (in the MVP version) based on:

- **Vouches:** users can **vouch** for other addresses (creating a graph where each address is a node),

- **Quantities:** based on the vouches, the smart contract calculates
    - **rank**,
    - **in-neighbor weight**, and
    - **Outdegree Score Boost**
    
    for each user, to quantify their **reputation score** within this network.
    

- **Initialization process:** the system behaves differently in its early stages by design.

We discuss these notions in the presentation order.

### What is the rank of a node?

The **rank** is a numerical value (a non-negative integer) representing a node's (user's) **status**. 

<aside>

**Note:** having a lower rank is better!

</aside>

There are a few particular values:

- **Rank $0$:** The rank for any not yet initialized node.
- **Default Rank:** A node that has never been vouched for (that is, we say that has $0$ in-neighbors) has a `DEFAULT_RANK` of $6$.
    
    As soon as a node is initialized, the function `_rankOrDefault`  is called and, if the rank of the node is $0$, it updates it to `DEFAULT_RANK`.
    

<aside>

**Remark:** We stress that the very first few nodes in the graph are given a `rank` of $1$ to bootstrap the system; we discuss further this **seeded rank** procedure in the following section [Initialization: first steps of the network](https://www.notion.so/Initialization-first-steps-of-the-network-30c30540582c8100a909c909eac160f3?pvs=21). 

</aside>

**How is the rank computed?** A node's rank is determined *entirely by the ranks of the nodes that vouch for it* (its "in-neighbors"). 

Let $v\in V$ be a fixed node. When a new vouch is received, the node's rank ($\mathsf{rank}_v$) is re-calculated via the following procedure:

1. Find $k_v$, the **minimum (best) rank** among all of the node's in-neighbors. In formulas:
    
    $$
    k_v := \min_{w \in V\ :\ e=(w,v)\in E} \{\mathsf{rank}_w\}.
    $$
    
2. Find $m_v$, the **multiplicity** (count) of nodes that have that exact minimum rank $k_v$. In formulas, if we consider $\mathbf{1}_{y}$ to be the indicator function defined by
    
    $$
    \mathbf{1}_{y}(t):=
    \begin{cases}
    	1 & \text{ if } t=y,\\
    	0 & \text{ if } t\neq y,
    \end{cases}
    $$
    
    we can define
    
    $$
    m_v := \sum_{w \in V\ :\ e=(w,v)\in E} \mathbf{1}_{k_v}(\mathsf{rank}_w) .
    $$
    
3. The new rank is calculated as:
    
    $$
    \mathsf{rank}_v = 3k_v + 1 - \min\{m_v,3\}.
    $$
    
    Note that this always results in a positive number.
    

<aside>

**Example:**

Let us assume that:

- Daniel is vouched for by three people Alice, Bob, and Charlie, with ranks $5$, $5$, and $8$.
- The minimum rank $k_v$ is $5$.
- The multiplicity $m$ of rank $5$ is $2$.
- The minimum between $2$ and $3$ is $\min\{2,3\}=2$.
- Your new rank is $3 \times 5 + 1 - 2 = 14$.
</aside>

![Figure 2: Example [](https://www.notion.so/30c30540582c817d9269f1090a8ab938?pvs=21).](The%20algorithm%20behind%20the%20SYB%20Network%20(MVP%20version)/figure_2.png)

Figure 2: Example [](https://www.notion.so/30c30540582c817d9269f1090a8ab938?pvs=21).

### What is the **In-Neighbor Weight?**

The reputation, or score, of a node $v\in V$ is related to the number of in-neighbors (the nodes $w$ that vouch *for* the node $v$) and their ranks. More precisely, the contribution is measured by the  **In-Neighbor Weight**, a weight based on the rank.

Fixed $R=5$, we define the **In-Neighbor Weight function** $W(r)$ as

$$
W(\mathsf{rank}_w):=
\begin{cases}
	2^{(R - \mathsf{rank}_w)} & \text{ if } \mathsf{rank}_w \le R,\\
\\
0 & \text{ if } \mathsf{rank}_w > R \text{ or $\mathsf{rank}_w=$\verb|DEFAULT_RANK|}.
\end{cases}
$$

<aside>

**Note:** a lower-ranked in-neighbor gives an *exponentially higher* weight to your score.

</aside>

<aside>

**Example:**

Let us go back to the above [](https://www.notion.so/30c30540582c8194994cf8c3bf4b7d14?pvs=21).

- We have 4 nodes with ranks: $5$, $5$, $8$, and $14$.
- Their In-Neighbor Weigh is, in the order,
    - $R=6\geq 5 \Rightarrow 2^{6-5}=2$,
    - $R=6\geq 5 \Rightarrow 2^{6-5}=2$,
    - $R=6<8 \Rightarrow 0$,
    - $R=6<14 \Rightarrow 0$.
</aside>

![Figure 3: Example [](https://www.notion.so/30c30540582c812fa1cbc01c66067a9b?pvs=21) & [](https://www.notion.so/30c30540582c812fa1cbc01c66067a9b?pvs=21).](The%20algorithm%20behind%20the%20SYB%20Network%20(MVP%20version)/figure_2%201.png)

Figure 3: Example [](https://www.notion.so/30c30540582c812fa1cbc01c66067a9b?pvs=21) & [](https://www.notion.so/30c30540582c812fa1cbc01c66067a9b?pvs=21).

### What is the **Outdegree Score Boost?**

Vouching for some other nodes is rewarded. The algorithm provides you with a small, fixed bonus for each node you vouch for (your "outdegree").

- **Score Boost:** `SCOREBOOST_OUT` (set to $1$) for each out-vouch.
- **Cap:** This score boost is capped at `SCOREBOOST_CAP` which is defined as the In-Neighbor function $W$ (recall [What is the **In-Neighbor Weight?**](https://www.notion.so/What-is-the-In-Neighbor-Weight-30c30540582c8143b650eef12d59728d?pvs=21)); you get a greater boost the higher your own rank is.

In formulas, the outdegree is computed as

$$
\mathsf{OutDegree}(v):= \Big|\{e\in E \ : \ e=(v,w) \}\Big|,
$$

while the `SCOREBOOST_CAP` as $\mathsf{SCOREBOOST\_CAP}(v):= W(v)$.

<aside>

**Note:** a node with rank $1$ has a higher `SCOREBOOST_CAP` than the one with lower rank, and that nodes with rank bigger than $6$ have no score boost at all.

</aside>

Finally, the Outdegree Score Boost is obtained as

$$
\mathsf{OutDegreeScoreBoost}(v):=\min\{\mathsf{OutDegree}(v),\mathsf{SCOREBOOST\_CAP}\}.
$$

<aside>

**Example:** 

Let’s go back to the above [](https://www.notion.so/30c30540582c810386d0dc44bd320171?pvs=21). In this setting, we have that

- Alice and Bob have
    
    $\mathsf{OutDegreeScoreBoost}(v)= \min\{\mathsf{OutDegree}(v)=1,W(v)=2\} = 1$.
    
- Charlie has
    
    $\mathsf{OutDegreeScoreBoost}(v)= \min\{\mathsf{OutDegree}(v)=1,W(v)=0\}=0$.
    
- David has
    
    $\mathsf{OutDegreeScoreBoost}(v)= \min\{\mathsf{OutDegree}(v)=0,W(v)=0\}=0$.
    
</aside>

## The Reputation Score

The **reputation score** is the value that measures a node's "importance" based on both who vouches for it and who it vouches for. 

The score is the sum of two components:

- the In-Neighbor Weight and
- the Outdegree Score Boost.

### **Final Score Formula**

We can then compute the reputation score $x(v)$ of each node $v\in V$ as 

$$
x(v) := \left(\sum_{w \in IN(v)} W(\mathsf{rank}_w)\right) + \mathsf{OutDegreeScoreBoost}(v),
$$

for $IN(v):=\{e\in E \ : \ e=(w,v) \}$ the set of In-Neigbors nodes.

<aside>

**Example:** 

Let’s conclude the example in the above [](https://www.notion.so/30c30540582c81c4a5fbec6d36987412?pvs=21). In this setting, we have that

- Alice and Bob have score $0 + 1 = 1$.
- Charlie has score $0 + 0 = 0$.
- David has score $(2 + 2 + 0) + 0 = 4$.
</aside>

### A couple of considerations about the reputation

The reputation score of a node is high if 

- **low-rank (i.e . important) nodes vouch for you**,
- and you it gets a fixed bonus for **vouching for others** (up to $15$ vouches).

![Figure 4: Example of a SYB Network.](The%20algorithm%20behind%20the%20SYB%20Network%20(MVP%20version)/vouch_minimal_colored_by_rank.png)

Figure 4: Example of a SYB Network.

## Network  initialization and updates

The algorithm updates ranks and reputation scores *locally*, but its form differs in the initialization step. The re-computations are based on the formulas in the above sections [What is the rank of a node?](https://www.notion.so/What-is-the-rank-of-a-node-30c30540582c81c69fc4f59db174cb54?pvs=21) and [The Reputation Score](https://www.notion.so/The-Reputation-Score-30c30540582c81f59c2bfbdefa82d118?pvs=21).

### Initialization: first steps of the network

The first few steps in the network’s life have to be handled with care, as we can’t simply update a previous vector of scores and ranks.

- **Rank:** As mentioned above (cf. [**Remark:** We stress that the very first few nodes in the graph are given a `rank` of $1$ to bootstrap the system; we discuss further this **seeded rank** procedure in the following section [Initialization: first steps of the network](https://www.notion.so/Initialization-first-steps-of-the-network-30c30540582c8100a909c909eac160f3?pvs=21). ](https://www.notion.so/Remark-We-stress-that-the-very-first-few-nodes-in-the-graph-are-given-a-rank-of-1-to-bootstrap-the--30c30540582c8132bd96ee1699c93681?pvs=21)) the first few nodes in the network are seeded to have all rank $1$. This is indeed necessary in order to get the system to start.
    
    More precisely, we set the following rule.
    
    <aside>
    
    The initial $5$ vouches in a new-born network fix, by default, the rank of both nodes (voucher and vouchee) to $1$.
    
    </aside>
    
    Therefore, we notice that we can seed the rank of at least $4$ nodes to $1$ (and up to $10$ nodes).
    
- **Score:** We initialize all scores to $0$, but, as soon as we include them in the network, we update their score accordingly to the scoring formula presented in the above [**Final Score Formula**](https://www.notion.so/Final-Score-Formula-30c30540582c817792d6dc58afe1b769?pvs=21).

Therefore, the network, until the first $5$ vouches count is reached, it obeys the following rules:

<aside>

**Vouch:** If the node $w$ vouches for the node $v$, 

1. the *rank* of *both* nodes is updated to $1$,
2. *both* the *score* of node $w$ is updated following formula .
</aside>

<aside>

**Un-vouch:** If the node $w$ un-vouches for the node $v$, 

- *both* the *rank* and the *score* of node $v$ are updated, but
- *only* the *score* of node $w$ is updated.
</aside>

### Updates: the rank and reputation score re-computation

Passed the mark of 5 vouches, the network is its mature form and updates ranks and scores  accordingly. More precisely, the update of the network obeys the following rule.

<aside>

**Vouch/Un-vouch:** If the node $w$ vouches (or un-vouches) for the node $v$, 

- *both* the *rank* and the *score* of node $v$ are updated, but
- *only* the *score* of node $w$ is updated.

The updated are based on the formulas: 

</aside>

---

# Examples

We consider here three illustrative examples for a 5-node network. Let's name our 5 nodes **A**lice, **B**ob, **C**harlie, **D**avid, and **E**ve.

---

### **Example 1: Initialization & Seeding**

The global setting is:

- **Initial State:** All Ranks $= 6$, All Scores $= 0$.
- **Seed Rule:** First $5$ vouches set Rank to $1$.
- **Weight constant:** For Rank $1$, $W(1) = 2^{5-1} = 16$.

We connect the network via $5$ sequential "Seed Vouches."

**Step-by-Step Actions**

| **Step** | **Action** | **Voucher Update (Outdegree Score Boost)** | **Vouchee Update (Rank & In-Weight)** |
| --- | --- | --- | --- |
| **1.1** | **A$\to$B** | **Alice:** 
OutDegree $= 1$.  Score $= 1$. | **Bob:** 
Rank$\to 1$. Score $= 16$ (from A). |
| **1.2** | **A$\to$C** | **Alice:** 
OutDegree $= 2$. Score $= 2$. | **Charlie:** 
Rank$\to 1$. Score $= 16$ (from A). |
| **1.3** | **B$\to$D** | **Bob:** 
OutDegree $= 1$. Score $=16+1=17$. | **David:** 
Rank$\to 1$. Score $= 16$ (from B). |
| **1.4** | **C$\to$E** | **Charlie:** 
OutDegree $= 1$. Score $=16+1=17$. | **Eve:** 
Rank$\to 1$. Score $= 16$ (from C). |
| **1.5** | **E$\to$D** | **Eve:** 
OutDegree $= 1$. Score $=16+1=17$. | **David:** 
Rank$\to 1$. Score $=16+16 = 32$ (from B and E). |

**Final State (End of Seeding)**

| **Node** | **Rank** | **Score** | **Summary** |
| --- | --- | --- | --- |
| **Alice** | $1$ | $2$ | Seed source. 
Vouches for B, C. |
| **Bob** | $1$ | $17$ | Vouched by A. 
Vouches for D. |
| **Charlie** | $1$ | $17$ | Vouched by A. 
Vouches for E. |
| **David** | $1$ | **$32$** | Vouched by B, E. |
| **Eve** | $1$ | $17$ | Vouched by C. 
Vouches for D. |

![Figure 5: Graph at the end of Example 1.](The%20algorithm%20behind%20the%20SYB%20Network%20(MVP%20version)/figure_4.png)

Figure 5: Graph at the end of Example 1.

---

### **Example 2: Update (New Vouch)**

**Action:** Alice vouches for David (Edge A $\to$ D). Seed phase is over; standard rank re-calculation applies.

<aside>

- **Voucher (Alice):**
    - Out-degree increases to $3$ (Bob, Charlie, David).
    - **New Score:** $\min\{3, 16 = 2^{5-1}\} = 3$.
</aside>

<aside>

- **Vouchee (David):**
    - **Inputs:** Bob, Eve, Alice (All Rank 1).
    - Rank Calculation: Minimal rank $k=1$, count $m=3$:
        
        $$
        \mathsf{rank} = 3(1) + 1 - \min\{3,3\} = 1
        $$
        
    - **New Score:** $W(1) \times 3 = 16 + 16 + 16 = 48$.
</aside>

**Network State Changes**

| **Node** | **Rank** | **Score** | **Change** |
| --- | --- | --- | --- |
| Alice | $1$ | $3$ | Score increased due to Score Boost. |
| David | $1$ | $48$ | Score increased due to new neighbor A. |
| Others | $1$ | $17$ | No change. |

![Figure 6: Graph at the end of Example 2 (Alice→David vouch added).](The%20algorithm%20behind%20the%20SYB%20Network%20(MVP%20version)/figure_5.png)

Figure 6: Graph at the end of Example 2 (Alice→David vouch added).

---

### **Example 3: Update (Un-vouch)**

**Action:** Alice un-vouches David (Edge A $\to$ D removed).

<aside>

- **Voucher (Alice):**
    - Out-degree decreases to $2$ (Bob, Charlie).
    - **New Score:** $\min\{2, 16=2^{5-1}\} = 2$.
</aside>

<aside>

- **Vouchee (David):**
    - **Inputs:** Reverts to Bob, Eve (All Rank 1).
    - Rank Calc: Min rank $k=1$, count $m=2$.
        
        $$
        \mathsf{rank} = 3(1) + 1 - \min\{2, 3\} = 2
        $$
        
    - **New Score:** $W(1) \times 2 = 16 + 16 = 32$.
</aside>

**Network State Changes**

| **Node** | **Rank** | **Score** | **Change** |
| --- | --- | --- | --- |
| Alice | $1$ | $2$ | Reverted to previous state. |
| David | $2$ | $32$ | Rank degraded (insufficient links for Rank 1). |
| Others | $1$ | $17$ | No change. |

![Figure 7: Graph at the end of Example 3 (Alice un-vouches for David).](The%20algorithm%20behind%20the%20SYB%20Network%20(MVP%20version)/figure_6.png)

Figure 7: Graph at the end of Example 3 (Alice un-vouches for David).

**Note:** The network topology has reverted to the state in Example 1, but David's rank is calculated differently because the "Seed Rule" no longer applies.

---

---

Date: 27th of November, 2025

Author(s): Luca Dall’Ava — ZKP Researcher at Tokamak Network

---