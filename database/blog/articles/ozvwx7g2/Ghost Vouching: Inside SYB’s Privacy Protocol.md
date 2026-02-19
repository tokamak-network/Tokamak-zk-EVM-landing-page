---
base: "[[blog-index.base]]"
ArticleId: ozvwx7g2
Title: "Ghost Vouching: Inside SYB’s Privacy Protocol"
Slug: ghost-vouching-protocol
Description: "Introduces SYB’s vouching protocol."
Published: Staging
PublishDate: "December 22, 2025"
Tags:
  - Algorithm
  - Mathematics
  - Technology
Author: "Nil Soroush"
CoverImage: "Ghost%20Vouching%20Inside%20SYB%E2%80%99s%20Privacy%20Protocol/ghost_vouching_4-1.png"
ReadTimeMinutes: 15
Status: "Ready to Publish"
---

# Ghost Vouching: Inside SYB’s Privacy Protocol


In Part 1, we identified the core privacy failure of reputation systems on public ledgers: **metadata leakage**. Even when endorsement content is strongly encrypted, the surrounding signals—who interacted with whom, how often, and when—remain visible. At scale, this information is sufficient to reconstruct trust relationships and exploit them. Identifying the problem, however, is only the beginning.

The remaining question is purely an engineering one: **how can such a system be built on a fully transparent ledger without encoding those relationships into the public state?**

Concretely, how can **Alice** vouch for **Bob** in a way that reveals neither who sent the endorsement, who received it, nor whether it is related to any other endorsement—while still allowing the system to verify that the vouch is valid?

This post answers that question. We present **Ghost Vouching**, the protocol used by SYB to issue and receive endorsements while preserving the privacy guarantees defined in Part 1.

What follows is a concrete construction. Each component exists to enforce a specific constraint already discussed. Rather than restating those constraints, we focus on how the protocol satisfies them in practice.

<aside>

At a high level, Ghost Vouching relies on three core ideas, which will appear throughout the construction:

- **duality**, separating the ability to see from the ability to act;
- **dual data representations**, separating what the system verifies from what the recipient learns; and
- **a shared anonymity set**, where endorsements are hidden inside a global Merkle tree.
</aside>

We begin with the first building block: how a sender issues an endorsement without ever revealing who they are.

## 1. The Disguised Identity (Ephemeral Keys)

When Alice wants to vouch for Bob in **SYB Network**, she never uses her long-term identity to send the message. If she did, every vouch she issued could be linked back to her wallet.  Instead, the protocol generates a fresh, **ephemeral key pair,**  $\mathsf{key_{eph.A}}$, for every single vouch. Alice generates a random secret key, $\mathsf{sk_{eph.A}}$ and derives a corresponding public key:

$$
\mathsf{key_{eph.A}} = (\mathsf{sk_{eph.A}}, \mathsf{pk_{eph.A}}):\qquad \mathsf{sk_{eph.A}} \leftarrow \mathbb{Z}_p\;,\;
\mathsf{pk_{eph.A}} = \mathsf{sk_{eph.A}} \cdot \mathsf{G}.
$$

- **One-Time Use:** This key is used exactly once to seal the vouch and is then immediately erased.
- **Unlinkable:** To the outside world, the sender isn't Alice. It is just a random cryptographic address $\mathsf{pk}_{\mathsf{eph.A}}$ that appears once and never again.

This provides strong **sender unlinkability**. An observer can look at the blockchain all day, but they will never be able to tie two different vouches back to the same person.

## 2. No Handshakes Required

In many secure messaging apps, Alice and Bob need to perform a "*handshake*" to establish a shared secret. That back-and-forth traffic is a privacy leak—it shows that Alice and Bob are talking.

**SYB** avoids this using non-interactive key exchange as follows:

- **Bob** publishes a viewing key, $\mathsf{pk}_{\mathsf{view.B}}$.
- **Alice** takes that key and, using her ephemeral identity, $\mathsf{sk_{eph.A}}$,computes a shared secret entirely on her own :

$$
\mathsf{ss}_{A,B} = \text{ECDH}(\mathsf{sk_{eph.A}}, \mathsf{pk_{view.B}}),\quad\;\quad \\\mathsf{K}_{A,B} = \text{HKDF}\!\left(
\mathsf{ss}_{A,B}, \mathsf{pk_{eph.A}}
, \mathsf{pk_{view.B}}
, \mathsf{pk_{spend.B}}
\right).
$$

**Alice** uses $\mathsf{K}_{A,B}$ to create a sealed, private envelope, including a **note** and a **memo,** that only **Bob** can open. The vouch is inside, and only **Bob** can decrypt it. Bob doesn't need to be online. No network observer sees a handshake or link between them.

## 3. Hiding in the Forest (The Commitment)

So, **Alice** has generated a disguised identity and created a sealed vouch. Where does she put it?

She posts a **commitment** to the global Merkle Tree. She does not post the data plainly; she wraps it inside a cryptographic function that hides the recipient and the value :

$$
\bigl(\mathsf{Comitt(note)},\;
\mathsf{pk_{eph.A}},\;
\mathsf{Enc_{K_{A,B}}(memo)}\bigr).
$$

![Ghostprotocol.png](Ghost%20Vouching%20Inside%20SYB%E2%80%99s%20Privacy%20Protocol/2b962e03-e1d8-4eb0-910d-e28606d9e5ca.png)

This hides both the recipient and the (vouch) value. She posts this commitment to the global Merkle tree. The tree acts like a giant forest of sealed envelopes. Alice’s note becomes just one leaf among thousands — and it is mathematically impossible to distinguish her note from anyone else’s. This provides a massive anonymity set.

## **4.** Silent **discovery**

Bob’s device periodically scans new notes on the ledger. For each one, it tries to decrypt using his viewing key:

$$
\mathsf{ss}'_{A,B} = \text{ECDH}(\mathsf{sk_{view.B}}, \mathsf{pk_{eph.A}}),\\ \quad \mathsf{K}_{A,B}' = \text{HKDF}\!\left(
\mathsf{ss}_{A,B}', \mathsf{pk_{eph.A}}
, \mathsf{pk_{view.B}}
, \mathsf{pk_{spend.B}}
\right).\\  \mathsf{memo} = \mathsf{Dec}_{\mathsf{K}_{A,B}'}(\mathsf{CT})
$$

Most envelopes stay sealed  — they are not for him. But when the math lines up, the note decrypts cleanly. Bob learns the vouch. To the outside world, Bob has simply scanned a public list of random envelopes, like everyone else.

## **5. Deep Dive:** The Power of Duality

Before we walk through the step-by-step protocol, it is helpful to understand the core design philosophy of SYB. To achieve maximum privacy without sacrificing usability, we rely on the concept of **duality** in two specific ways: splitting the *keys* and splitting the *data*.

### 1. Dual Keys: Seeing vs. Acting

Most blockchains give you a single private key that controls everything. **SYB network** adopts a safer *dual-key* architecture, a pattern pioneered by advanced privacy protocols like [Zcash](https://zechub.wiki/zcash-tech/viewing-keys) and [Penumbra](https://protocol.penumbra.zone/main/addresses_keys.html). We split your identity into two distinct parts:

- **The View Key ($\mathsf{sk_{view}}$):** This key allows you to **"see."** Your wallet uses it to scan the public ledger and decrypt incoming private vouches. It grants read-only access to your history but has absolutely no power to alter your state.
- **The Spend Key ($\mathsf{sk_{spend}}$):** This is the **"action"** key. It is the only key capable of generating the proofs required to use or "spend" your reputation. Because it is never needed for receiving or viewing messages, it can be kept strictly offline in cold storage.

**Why this matters:** You can keep your **View Key** on a phone or browser to check your score daily without ever exposing the **Spend Key** that controls your assets. Even if your viewing device is compromised, your reputation cannot be stolen or impersonated.

### 2. Dual Data: The Note & The Memo

The second duality is in how we package the vouch itself. Because Alice generates the session key without ever talking to Bob (non-interactive), she creates a *sealed envelope* that consists of two mathematically linked parts:

- **The Note (The Integrity):** This is the cryptographic object the system sees. It contains the commitment to the value and recipient. It ensures the system allows the vouch to be used exactly once, without revealing anything to the public.
- **The Memo (The Information):** This is the encrypted letter inside the envelope. It contains the data Bob needs to actually read and use the note (like the randomness factor and the amount).

Together, they function as a perfect digital envelope: The **Note** provides the lock that ensures global integrity, while the **Memo** provides the key that allows only Bob to unlock the truth. This separation allows the protocol to be simple, asynchronous, and completely private.

![ghost vouching protocol.png](Ghost%20Vouching%20Inside%20SYB%E2%80%99s%20Privacy%20Protocol/ghost_vouching_protocol.png)

## 6. The Protocol: Step-by-Step

Here is exactly how Alice creates a Ghost Vouch for Bob, step by step:

1. **Ephemeral ID:** Alice generates a one-time keypair:
    
    $$
    \mathsf{sk_{eph.A}} \leftarrow \mathbb{Z}_p, \quad \mathsf{pk_{eph.A}} = \mathsf{sk_{eph.A}} \cdot \mathsf{G}.
    $$
    
    - **Privacy Benefit:** Sender appears as a random entity; no link to Alice.
2. **Shared Secret:** Alice computes the secret without contact:
    
    $$
    \mathsf{ss}_{A,B} = \text{ECDH}(\mathsf{sk_{eph.A}}, \mathsf{pk_{view.B}}),\\ \mathsf{K}_{A,B} = \text{HKDF}\!\left(
    \mathsf{ss}_{A,B}, \mathsf{pk_{eph.A}}
    , \mathsf{pk_{view.B}}
    , \mathsf{pk_{spend.B}}
    \right).
    $$
    
    - **Privacy Benefit:** No handshake; Bob doesn't need to be online.
3. **Commitment:** Alice commits to the note and encrypts the memo:
    
    $$
    \bigl(\mathsf{Comitt(note)},\;
    \mathsf{pk_{eph.A}},\;
    \mathsf{Enc_{K_{A,B}}(memo)}\bigr).
    $$
    
    - **Privacy Benefit:** No one can tell who the note is for or what it contains.
4. **Signature:** Alice signs the vouch inside the encrypted memo:

$$
\sigma = \text{Sign}_{\mathsf{sk.A}}(\mathsf{C_{note}}
\parallel \mathsf{com.pk_{spend.B}}
\parallel \mathsf{v}
\parallel \mathsf{user.id_A}).
$$

- **Privacy Benefit:** Bob knows it's authentic; observers see nothing.
1. **Tree Insertion:** The commitment is added to the global state:
    
    $$
    \mathsf{root_{new}} = \text{Update}(\mathcal{T}, \mathsf{Comitt(note)}).
    $$
    
    - **Privacy Benefit:** The note is lost inside a very large anonymity set.
2. **Discovery:** Bob attempts to decrypt using his view key:
    
    $$
    \mathsf{ss}'_{A,B} = \text{ECDH}(\mathsf{sk_{view.B}}, \mathsf{pk_{eph.A}}),\\ \mathsf{K}_{A,B}' = \text{HKDF}\!\left(
    \mathsf{ss}_{A,B}', \mathsf{pk_{eph.A}}
    , \mathsf{pk_{view.B}}
    , \mathsf{pk_{spend.B}}
    \right).
    $$
    
    - **Privacy Benefit:** Only Bob knows which note belongs to him.

## 7. From Private Vouches to Public Scores

At this point, Bob has a wallet full of invisible vouches. He knows he is trustworthy—but the trust graph that produced this reputation remains completely private. The remaining challenge is not collecting endorsements, but **proving reputation to others without revealing how it was formed**.

This brings us to the final piece of the system: the **zero-knowledge scoring engine**.

In **SYB Network**, reputation scores are computed as functions over the hidden trust graph. The values, weights, and individual endorsements remain private, while the resulting score—or statements about it—can be verified publicly using zero-knowledge proofs. This allows Bob to prove properties such as meeting a required reputation threshold without revealing who vouched for him or how the score was calculated.

Designing this scoring function and the accompanying proofs introduces additional constraints and trade-offs, which are orthogonal to Ghost Vouching itself. 

**In our next post, we will explain the math behind the scoring formula and how Bob proves his reputation without leaking his private data. until then :**

- **Stay Tuned:** The scoring deep dive is coming next.
- **Join the Research:** We are discussing these circuits openly. Join our [**Telegram**](https://t.me/+HOQmpdZqr4gyZjc8).
- **Try the MVP:** Connect your wallet and explore the public staking graph on the [**Sepolia Testnet**](https://syb.tokamak.network/).

---

Date: 22th of December , 2025
Author: **Nil Soroush** — ZKP Researcher at Tokamak Network