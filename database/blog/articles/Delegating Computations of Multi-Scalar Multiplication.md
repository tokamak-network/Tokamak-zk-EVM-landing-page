---
base: "[[blog-index.base]]"
AuthorEmail: luca@tokamak.network
Slug: delegating-computations-of-msms
CoverImage:
  - "[[Gemini_Generated_Image_m79icum79icum79i (1).png]]"
PublishDate: 2026-01-05
CanonicalURL: https://zkp.tokamak.network/blog/delegating-computations-of-msms
Status: Published
Author: Luca Dall’Ava
Tags:
  - Cryptography
  - Research
  - Technical
  - Technology
ReadTimeMinutes: 15
Description: The aim of this technical blog post is to review various attempts and solutions to remove a very challenging cryptographic bottleneck, crucial to most web3 applications, namely, the possibility to delegate computation (of MSMs) to an untrusted party. The scenario considered is that of an on-chain verifier trying to delegate the computation of an MSM.
CoverImageAlt: ""
Published: Prod
---
---

The aim of this technical blog post is to review various attempts and solutions to remove a very challenging cryptographic bottleneck, crucial to most web3 applications, namely, the possibility to delegate computation (of MSM) to an untrusted party. The scenario considered is that of an on-chain verifier trying to delegate MSM.

---

![[Gemini_Generated_Image_m79icum79icum79i_(1).png]]

> [!warning] ⚠️
> 
> ### Initial Disclaimer
> 
> This note is meant to be a **technical** blog post investigating and summarizing the challenges involved in the MSM delegation for on-chain verifiers (as per the [**Tokamak Private App Channels**](https://medium.com/tokamak-network/project-tokamak-zk-evm-67483656fd21)** **[J, T-ZKP, SJ25]). Even though it aims to be as self-contained as possible, it might require some familiarity with high-level concepts (groups, MSM, hash functions, Ethereum blockchain, circuits, and zkSNARKs, among the others). We recommend the reader unfamiliar with some of these terms to keep at hand Thaler’s book [T].

# Introduction and Motivation

## Notation

- $\mathbb{F}$ is a finite field, which we write in additive notation $+$ and multiplicative notation $\cdot$,
- $\mathbb{G}_1, \mathbb{G}_2$ are cyclic groups, which we write in additive notation $\bigoplus$,
- $\mathbb{G}_T$ is a group which we write in multiplicative notation $\cdot$,
- $e$ is an efficient, non-degenerate bilinear (pairing) map $e: \mathbb{G}_1 \times \mathbb{G}_2 \to \mathbb{G}_T$.
- For $\bold{a}\in\mathbb{F}^N$ and $\bold{A}\in\mathbb{G}^N$,  $a_i$ and $A_i$ denote the $i$-th entry, respectively.
- We use notation $\langle \bold{G},\bold{H}\rangle$ for $\bold{G}\in\mathbb{G}_1^N$ and $\bold{H}\in\mathbb{G}_2^N$ to write $\prod_{i=0}^{N-1}e(G_i,H_i)$.
- We use notation $\bold{G}\bullet\bold{h}$ for $\bold{G}\in\mathbb{G}_1^N$ and $\bold{h}\in\mathbb{F}^N$ to write *multi-scalar multiplication (MSM)*:
$$
\bigoplus_{i=0}^{N-1}h_iG_i=\bigoplus_{i=0}^{N-1}\bigoplus_{k=0}^{h_i-1}G_i.
$$

## The Problem

Most web3 applications rely on zero-knowledge succinct non-interactive argument of knowledge (SNARKs) for security; among the others the new and under development [**Tokamak Private App Channels**](https://medium.com/tokamak-network/project-tokamak-zk-evm-67483656fd21)** **[J, T-ZKP, SJ25].

SNARK protocols rely on two parties,

- a Prover, wishing to prove the correctness of a statement (e.g. a computation has been correctly performed or a circuits evaluates to precise outputs given precise inputs), and 
- a Verifier, wishing to verify the Prover’s statement *without *reworking the whole computation in total.

Most SNARKs leverage operations over points of elliptic curves (as well as pairings) in order to prove and verify statements. A crucial operation is that of scalar multiplication of an elliptic curve point, and, more generally, that of multi-scalar multiplication (MSM). 

> [!note] 📌
> 
> > [!note] 📌
> > 
> > **Problem — Delegation of MSM:**
> > 
> > Consider $\bold{P}\bullet\bold{d}$ for $\bold{P}\in\mathbb{G}_1^N$ and $\bold{d}\in\mathbb{F}^N$.
> > 
> > We want a protocol with $\texttt{prove}$ and $\texttt{verify}$ algorithms that allows a Verifier to delegate $\bold{P}\bullet\bold{d}$ to a Prover. The Prover runs $\texttt{prove}$ to produce $Y$ and the corresponding proof $\pi$. The Verifier runs $\texttt{verify}$ to verify $Y$ and $\pi$ such that:
> > 
> > - The Verifier is convinced that $Y=\bold{P}\bullet\bold{d}$ with high probability if and only if $\texttt{verify}(Y,\pi)$ returns true.
> > - The computational cost of $\texttt{verify}(Y,\pi)$ is sublinear in $N$.

We investigate here a few protocols and methods allowing a verifier to delegate MSM to a prover, and analyze their strengths and weaknesses.

## Motivation

Contrary to other projects, [**Tokamak Private App Channels**](https://medium.com/tokamak-network/project-tokamak-zk-evm-67483656fd21) implements its verifier on-chain to ensure a stronger and *trustless* security.

Therefore, we are interested in the setting where the verifier is performed on-chain (Ethereum), while the prover can operate on a L2 level, for example on a user’s machine.

This investigation has been initially motivated by the **Batched Verification for Tokamak zk-SNARKs** as introduced [here](https://medium.com/tokamak-network/scaling-tokamak-network-zkp-a866479130f1) and [here](https://zkp.tokamak.network/blog/scaling-tokamak-batched-verification).

The choice of this scenario comes with several restrictions, as MSMs, Pairings over elliptic curves, and SNARK-friendly hashes are expensive on-chain.

![[Gemini_Generated_Image_6r5u3f6r5u3f6r5u.png]]

Keeping in mind such limitations, we discuss the following protocols/approaches:

- MIPP protocol [BMMTV19],
- Pinkas delegation protocol [P25],
- Approaches based on the GKR protocol [GKR08],
- The recent Encrypted Multi-Scalar Multiplication primitive [AHKM25].

# MIPP protocol

The MIPP protocol has been introduced in [BMMTV19]. In both its variants, the protocol provides a way to delegate an MSM. We focus on the MIPP protocol for Multi-exponentiation with known field vectors; see Section 5.5 of [BMMTV19].

The main building block of the MIPP protocol is the *Generalized Inner Product Argument *(GIPA) introduced in the same paper ([BMMTV19]); this is a generalization of Inner Product Arguments (see for example [F21]) handling inner product structure more general than the [dot product of vectors](https://en.wikipedia.org/wiki/Dot_product).

### Protocol Flow and Delegation

The MIPP protocol utilizes a recursive halving procedure to reduce the size of the statement that needs to be verified. The general flow follows these steps:

1. **Input:** Both the Prover and Verifier receive public inputs.
2. **Computation:** The Prover runs the recursive GIPA/MIPP protocol and generates Pairing Commitments as well as [KZG commitments](https://www.iacr.org/archive/asiacrypt2010/6477178/6477178.pdf) [KZG10].
3. **Proof:** The Prover sends the resulting proof and values to the Verifier.
4. **Verification:** The Verifier checks the proof to ensure honesty.

We call Pairing Commitment: Any commitment which can be obtained as

$$
T = \langle \mathbf{P}, \mathbf{V}\rangle = \prod_{i=0}^{m-1} e(P_i,V_i),
$$

for $\mathbf{V}=(V_i)_{i=0}^{m-1}$, a fixed and trusted trapdoor.

### **The Recursive Halving Step (GIPA)**

Let us focus on the case of $U = \mathbf{P} \bullet \mathbf{d} = \bigoplus_{i=0}^{m-1} d_i\cdot P_i$ and dive further into the recursive step of the **Generalized Inner Product Argument (GIPA)**. The protocol allows a verifier to check a large computation by repeatedly shrinking it until it is small enough to verify easily. Here is how the recursive halving step works:

5. **Split the Data: **The protocol takes vectors of length $m$ and splits them into **Left (**$L$**)** and **Right (**$R$**)** halves of size $m/2$, say $\mathbf{P} = (\mathbf{P}_L, \mathbf{P}_R)$ and $\mathbf{d} = (\mathbf{d}_L, \mathbf{d}_R)$;
6. **Send Cross-Terms: **The prover calculates how these two halves interact and sends these results (the so-called **cross-terms**) to the verifier in form of a commitment; this allows the verifier to keep track of the math as the data is compressed;
7. **The Verifier’s Challenge: **To ensure the prover isn't cheating, the verifier sends a random challenge $x$;
8. **Fold the Statement: **Using the challenge $x$, both parties squash the two halves into a single new vectors that is half the original size:
$$
\mathbf{P}' = \mathbf{P}_L \oplus \left(\mathbf{P}_R \bullet x\right), \quad \mathbf{d}' = \mathbf{d}_L + x^{-1}\cdot \mathbf{d}_R.
$$
9. **Update the Inner Product: **The new inner product $U'=\mathbf{P}' \bullet \mathbf{d}'$ is computed and used to call the recursive step.
10. **Final Base Case:** In the final step, the verifier performs a single scalar multiplication to check the final, reduced statement.

## Verification

Let us now look more closely at the protocol workflow, with a focus on the verifier.

1. **Randomized Combination:** The verifier begins by sampling a random scalar $c$ and sending them to the prover to combine the initial commitments ($T, U$) into a single target pairing value $T'$, linking the proof components securely; this process consists of $1$ hash and $1$ elliptic curve paring, that is, a pairing commitment of size $1$.

2. **Delegated Halving Steps (GIPA):** The verifier executes the Generalized Inner Product Argument (GIPA) but delegates the expensive work of updating commitment to the prover. The verifier receives the final folded commitment $C$ (the $U'$ computed at each halving step), the final message values ($D$, the $d'$ computed at each halving step), and the recursive challenges $\bold{x}$ (the vector of challenges computed at each halving step).

3. **Verification via Polynomials:** To ensure the final commitment provided by the prover is correct, the verifier combine the challenges into a specific polynomial. The verifier checks a (succinct) KZG polynomial opening proof at a random point $z$ to validate them.

4. **Final Equality Check:** The verification concludes by checking if the final commitment $C$ matches the commitment of the final folded values, by checking that $C$ corresponds to a Pairing Commitment (of size $3$); if this equation holds and the above polynomial verification is valid, the verifier accepts the proof.

The Verifier can be sure that the computation has been performed honestly (with the provided values), **only if **the Pairing commitment can be opened and verified.

## The Issue with On-Chain Verification

Unfortunately, this approach is not feasible on the Ethereum blockchain. There are two issues involved in this scenario:

- The high number of random challenges (logarithmic in $N$, the size of the MSM) that the verifier needs to compute is gas-expensive. One could cut down the number of hashes by wrapping the delegation in a SNARK, but this would improve the costs of the prover and the verifier.
- Opening a Pairing Commitment, as well as simply computing elliptic curve pairings, is very expensive on-chain. However, without this extra step, the verifier could not check that the values used during the computation are indeed the ones delegated.
> [!note] 📌
> Note that these cost might appear as manageable, but if we consider the delegation of several MSM computations (as expected in a generic protocol), they easily pile up increasing the costs.

---

# Pinkas’ delegation protocol

**Pinkas’ protocol** [P25] has been presented in February 2025 and it is a fully-fledge delegation protocol.

It is important to notice that the delegation protocol works under the assumption that the prover to which we delegate the MSM computation cannot be trusted and might act maliciously.

The protocol leverages the binary decomposition of the scalars in order to reduce the computation to a smaller MSM with bit-length of the exponents the verifier needs to handle. 

Let’s dive a bit more into it.

### Decomposition and Computation — Prover Side

The prover breaks down each $m$-bit scalar $d_i$ into its binary representation: $d_i = \sum_{j=0}^{m-1} d_{i,j} 2^j$, where $d_{i,j} \in \{0, 1\}$.

The original MSM can then be rewritten as:

$$
Q = \bigoplus_{j=0}^{m-1} 2^j \left( \bigoplus_{i=1}^N d_{i,j} P_i \right).
$$

> [!note] 📌
> **Note: **Let $w_j := \bigoplus_{i=1}^N d_{i,j} P_i$. 

These $w_j$ values are essentially bit-level MSMs, that is, sums of points where the $j$-th bit of the scalar is $1$. 

The prover *computes all *$m$* values* ($w_0, \dots, w_{m-1}$) and *sends* them to the verifier.

### Verification — Verifier Side

> [!note] 📌
> The verifier needs to check that the $w_j$ values are correctly computed.

To do this efficiently, it uses a **random linear combination**:

11. **Challenge:** The verifier picks $m$ random coefficients $r_0, \dots, r_{m-1}$.
12. **Left Side Check:** The verifier computes a *small* MSM of the $w_j$ values: 
$$
W' = \bigoplus_{j=0}^{m-1} r_j w_j.
$$
This is fast <u>because </u>$m$<u> </u><u>*is small*</u><u> (e.g., </u>$256$<u>) </u><u>*compared to *</u>$N$.
13. **Right Side Check:** The verifier computes an $N$-wide MSM:
$$
W'' = \bigoplus_{i=1}^N \left(\bigoplus_{j=0}^{m-1} r_j d_{i,j}\right) P_i
$$
**Note:** This is the main overhead of the whole protocol!
14. **Equality:** If $W' = W''$, the $w_j$ values are correct with high probability.
15. **Final Result:** Once verified, the verifier computes the final $Q$ from $w_j$ using simple doubling and addition:
$$
Q:=\bigoplus_{j=0}^{m-1} 2^j \cdot w_j =w_0\oplus 2\cdot (w_1\oplus 2\cdot( w_2\oplus\cdots \oplus 2 \cdot (w_{m-2}\oplus 2\cdot w_{m-1})\cdots )).
$$

## The issue with On-Chain verification

This approach is most suitable for delegating computations between Layer 2s operators as the Right Side Check improves the performance respect to the full MSM computation. However, the improvement gains for On-Chain verification are zero if not worse than computing the full MSM: this is due to the fact that Ethereum precompiled circuits depend mainly on the size of the MSM; see, for example, [E, VOSS].

Moreover, the verifier still needs to compute $m$ hashes in order to instantiate the Fiat—Shamir Transform securely.

![[Gemini_Generated_Image_fzwibfzwibfzwibf.png]]

---

# The GKR approach

The GKR (Goldwasser-Kalai-Rothblum) protocol, introduced in [GKR08], is an efficient delegation scheme.

The protocol relies on the **Sum-Check protocol** (see [LFKN92]), which is an interactive protocol where the Prover convinces the Verifier that the sum of a (high-dimensional) polynomial is correct without the Verifier having to calculate every term.

In the GKR protocol, Sum-Check is used to link one layer (we describe the notion of layer down below to the next one in an interactive process that reduces an initial claim to a new one, which is easier to check. There are three key points:

- **Recursive Reduction:** The prover makes a claim about the final output. Through several rounds of random challenges from the verifier, that claim is mathematically reduced to a claim about the layer below it. Subsequent papers [CTY11] and [TRMP12] show that each round can be parallelized.
- **The Chain:** This repeats layer by layer until the verifier only needs to check the very first layer (the inputs), which they already have a commitment for.
- **Logarithmic Verification:** The verifier does very little work, while the prover handles the heavy computation. As noted above, each round can be parallelized, which is ideal for GPU implementations; see [CTY11] and [TRMP12].

The Sum-Check protocol is a key piece for understanding the structure of the GKR protocol. We do not recall the protocol here and instead refer readers unfamiliar with the Sum-Check protocol to Section 4.1 of [T]** **and [LFKN92]  for a comprehensive treatment.

### Layers

We have been discussing layers, but what are those layers? The GKR protocol  is tailor-made for layered circuits but it can be applied to every program or computation as long as they *look like* a layered circuit.

A layered circuit is a circuit characterized by:

- **Sequential Layers:** The circuit is divided into a series of distinct layers (Layer $0$, Layer $1$, $\ldots$, Layer $d$).
- **Gates:** Each layer consists of elementary gates such as addition and multiplication gates.
- **One-Way Flow:** Each gate in a given layer can *only* *take its inputs from the layer immediately below it*.
- **Fixed Depth:** The *depth* of the circuit is the total number of layers ($=d+1$). The protocol starts at the output layer and works backward, layer by layer, until it reaches the input.

## **The GKR protocol: Overview**

The protocol works backward, starting from the output and moving toward the input:

16. **The Output Claim:** The Prover claims to the Verifier that *the result of the computation is *$Y$.
17. **Polynomial Representation:** The Verifier treats the values of the gates in each layer as a function. Specifically, they use a **Multilinear Extension (MLE)**. This turns gate values into a polynomial.
More precisely, this is done via the so-called wiring polynomials ($\widetilde{add}_i$ and $\widetilde{mult}_i$), which describe the connections between gates in the circuit at Layer $i$.
18. **Layer Reduction:** To verify the claim about Layer $i$, the Prover and Verifier run a Sum-Check protocol;
    - it reduces the claim about the current layer into a claim about the layer below it (Layer $i+1$), and
    - instead of checking every gate in Layer $i$, the Verifier only has to check the evaluation of $\widetilde{add}_i$ and $\widetilde{mult}_i$ at one randomly chosen point.
19. **The Chain Reaction:** This process repeats layer by layer.
20. **The Final Verification:** Once they reach the final layer (the Input Layer), the Verifier simply checks the remaining claim against the original input data (or a cryptographic commitment to it). If it matches, the entire computation (of $Y$) is proven correct.

## Applying GKR to delegation of MSM

How is the GKR protocol related to the delegation of MSM? By construction, the GKR protocol is a delegation protocol, therefore, we simply need to express the computation of the Multi-Scalar Multiplication of $\bold{P}\bullet\bold{d}$ as a layered arithmetic circuit**. **Without loss of generality (up to padding with trivial values), we can assume that $N$ is a power of $2$, say $N=2^{d-1}$.

> [!note] 📌
> **MSM Layered Circuit (Simplified):**
> -  Layer $d$: 
>     - Gate values: the entries of both $\bold{d}$ and $\bold{P}$ ($2N$ in total).
> - Layer $d-1$: 
>     - Gate values: $N$ points $Q_i^{d-1}$, $i=0,\ldots N-1$.
>     - Wires $d\to d-1$: $Q_i^{d-1} = d_i\cdot P_i$; this are the *Scalar Multiplication Gates*.
> - Layer $d-2$:
>     - Gate values: $N/2$ points $Q_i^{d-2}$, $i=0,\ldots N/2-1$.
>     - Wires $d-1\to d-2$: $Q_i^{d-2} = Q_i^{d-1} \oplus Q_{i+N/2}^{d-1}$.
> $\vdots$
> - Layer $1$:
>     - Gate values: $N/2^{d-2}=2$ points $Q_i^{1}$, $i=0,1$.
>     - Wires $2\to 1$: $Q_i^{1} = Q_i^{2} \oplus Q_{i+2}^{2}$.
> - Layer $0$:
>     - Gate values: $N/2^{d-1}=1$ point $Q^{0}$.
>     - Wires $1\to 0$: $Q^{0} = Q_0^{1} \oplus Q_{1}^{1}$.

> [!warning] ⚠️
> In this high-level description, each *Scalar Multiplication Gate *present in Layer $d-1$ is actually a sub-circuit consisting of point doubling and addition formulas, so the real depth and the description of the layered circuit is slightly different.

Therefore, we can employ the GKR protocol (or its derivatives) for delegating the computation of the MSM.

## The Issue with On-Chain Verification

We begin by listing a series of Pros and Cons of this protocol, as it has several advantages.

**Pros:**

- The GKR approach is extremely fast, especially when the verifier and prover are instantiated on GPUs; [TRMP12].
- It is needed a commitment only to the inputs and the outputs; [V25].
- Some Rust-based libraries are available; [M].

**Cons:**

- The dependance on layered circuits:
    - The verifier’s costs grow logarithmically in the circuit’s size and linearly in the depth, rendering the protocol inapplicable to deep circuits; [TRMP12].
    - Any circuit can be converted into a layered circuit, but occasionally it may require adding redundant gates depending on the original circuit's topology. Therefore, the size and depth of the corresponding layered circuit might explode.
- The GKR protocol is not zero-knowledge: it only handles succinctness, not privacy. To obtain zero-knowledge, one needs to wrap the GKR proof in a ZK-SNARK or ZK-STARK; [V25].
- The Sum-Check and, hence, the GKR protocol, require several verifier’s challenges to the prover. Both protocols can be made non-interactive via the Fiat—Shamir transform, however, the verifier needs to compute the challenges in order to check that the prover is not cheating. This issue might be resolved by wrapping the 
- As addressed in Section 4.6.6 of [T], a possible core issue in the GKR protocol is the difficulty the verifier faces when trying to efficiently evaluate the wiring polynomials ($\widetilde{add}_i$ and $\widetilde{mult}_i$) at a random point. 
For the protocol to remain efficient, the verifier must be able to evaluate them in logarithmic time (time relative to the circuit size), but this is not always straightforward for every circuit.

### The Issue

Can this approach be utilized by an on-chain verifier? Unfortunately no! Let’s analyze the most serious issues:

- The high number of random challenges that the verifier needs to compute is gas-expensive. One could cut down the number of hashes by wrapping the GKR delegation in a SNARK, but this would improve the costs of the prover and verifier.
- In order to (hope to) compute efficiently the evaluation of the wiring polynomials, we would need to hardcode them (hence the circuit) into the smart contract handling verifier’s logic. Once again the gas required increases.

![[Gemini_Generated_Image_3c8c4y3c8c4y3c8c.png]]

---

# Encrypted Multi-Scalar Multiplication

We conclude by briefly discussing the recent and new primitive of *Encrypted Multi-Scalar Multiplication* (EMSM) as introduced in [AHKM25]. We mainly focus on this core primitive and we do not discuss about the whole construction in [AHKM25].

The EMSM is a cryptographic primitive designed to allow a *client* to privately delegate expensive multi-scalar multiplication (MSM) operations to an *untrusted* *server*.

EMSM relies on the homomorphic properties of MSMs and the security provided by the **Learning Parity with Noise (LPN)** problem (see e.g. [Z]).

The goal of the protocol is to compute the MSM $Q=\bold{P}\bullet\bold{d}$ , where  $d\in\mathbb{F}^N$ is a private scalar vector and $\bold{P}\in\mathbb{G}^N$ is a *fixed public group basis*. Note that, if we work with a group of points $\mathbb{G}$ which has prime order, fixing this basis corresponds to pick $N$ distinct (non-trivial) points $P_1,\ldots,P_N$.

The core manipulation uses the fact that MSM is a linear operation: instead of sending the secret vector $\mathbf{d}$ directly, the client sends a cipher-text $\mathbf{v}$:

$$
\mathbf{v} = \mathbf{d} + \mathbf{r} \pmod{p},
$$

where $\mathbf{r}$ is a pseudorandom masking vector and $p$ is the prime order of the field $\mathbb{F}$; here $\mathbf{r}= G\mathbf{e}$ is obtained, via a fixed public matrix $G$ and a randomly chosen vector $\mathbf{e}$ with [low Hamming-weight](https://en.wikipedia.org/wiki/Hamming_weight) (that is, having only a small constant number of non-zero entries).

Because the server receives $\mathbf{v}$, it can compute:

$$
\mathbf{P}\bullet\mathbf{v}  =  \mathbf{P} \bullet\left(\mathbf{d} + \mathbf{r} \right) = \left( \mathbf{P} \bullet\mathbf{d} \right) \oplus \left(\mathbf{P} \bullet \mathbf{r} \right).
$$

This value is sent back to the client which then computes $\mathbf{P} \bullet\mathbf{r}$ and $\mathbf{P} \bullet\mathbf{d}  = \mathbf{P} \bullet\mathbf{v} \oplus \left(- \mathbf{P} \bullet \mathbf{r} \right)$.

For the protocol to be efficient, the client must be able to compute $\mathbf{P} \bullet \mathbf{r}$ much faster than a standard MSM and the magic happens during decryption.

By substituting $\mathbf{r} = G\mathbf{e}$, we get:

$$
\mathbf{P} \bullet \mathbf{r}  = \mathbf{P} \bullet G\mathbf{e} = G^T \mathbf{P} \bullet \mathbf{e} = \mathbf{R} \bullet \mathbf{e}
$$

where $\mathbf{R} = G^T \mathbf{P}$ is a set of points computed once during Setup.

> [!note] 📌
> Since $\mathbf{e}$ is a randomly chosen low-weight vector, the client only needs to perform $O(1)$** group additions** to compute $\mathbf{R} \bullet \mathbf{e}$.

Since this protocol deals with encryption, let us collect all the private and public information in the following table.

| **Element** | **Symbol** | **Knowledge Holder(s)** | **Visibility** |
| --- | --- | --- | --- |
| **Private Scalar Vector** | $\mathbf{d}$ | Client | **Private** |
| **Public Basis (Points)** | $\mathbf{P}$ | Client & Server | **Public** |
| **Generator Matrix** | $G$ | Client & Server | **Public** |
| **Precomputed Points** | $\mathbf{R} = G^T \mathbf{P}$ | Client | **Private** (during Setup) |
| **Low-weight Vector** | $\mathbf{e}$ | Client | **Private** |
| **Masking Vector** | $\mathbf{r} = G\mathbf{e}$ | Client | **Private** |
| **Ciphertext** | $\mathbf{v} = \mathbf{d} + \mathbf{r}$ | Client & Server | **Shared** (sent to Server) |
| **Intermediate Result** | $\mathbf{P} \bullet\mathbf{v}$ | Server & Client | **Shared** (sent to Client) |
| **Final Result** | $Q = \mathbf{P} \bullet\mathbf{d}$ | Client | **Private** (initially) |

## The Issue with On-Chain Verification

Even though the idea behind the EMSM is very clever and provides a practical speed-up, there are a few details which make the protocol not very suitable for on-chain verification. 

First of all, the primitive is defined as a **two-round interactive protocol** between a client and a server, which breaks the non-interactiveness requirement. However, this is does not present an issue when the delegation is considered for a SNARK prover, as it is the use-case of the paper [AHKM25].

Moreover, the Tokamak Network use-case prescribe that the exponent $\mathbf{d}$ is public, which makes $\mathbf{r}$ immediately plain.

![[Gemini_Generated_Image_y3sr3ty3sr3ty3sr.png]]

---

# Conclusions

We have explored, several interesting protocols offer promising theoretical and practical ways to offload these computations to untrusted provers, which however achieve their true strength when all the parties involved with the delegation protocol are off-chain. 

Let us summarize here the discussion of our investigation:

- the **MIPP protocol** provides an elegant recursive structure but incurs prohibitive gas costs of opening pairing commitments on the Ethereum blockchain;
- **Pinkas' Protocol** successfully reduces MSM bit-length for the verifier, yet yields no practical benefits for on-chain environments where Ethereum’s precompiled circuits charge primarily based on total MSM size rather than exponent complexity;
- the **GKR protocol and GKR-based approaches** offer logarithmic verification in ideal conditions but face high gas costs from computing numerous random challenges and the overhead of evaluating wiring polynomials within a smart contract;
- **the Encrypted MSM (EMSM) protocol** introduces a clever privacy-preserving mechanism but currently requires multiple rounds of interaction, which conflicts with the non-interactivity needed for on-chain verification;

which can be further summarized in the following table:

| **Protocol** | **Mechanism** | **On-Chain Hurdle** | **Security/Verification Note** |
| --- | --- | --- | --- |
| **MIPP** | Generalized Inner Product Argument (GIPA) | Computing random challenges and opening pairing commitments is prohibitively expensive on Ethereum. | Ensures honesty only if pairing commitments can be verified. |
| **Pinkas** | Binary decomposition of scalars into bit-level MSMs | Ethereum precompiles charge based on MSM size, not exponent complexity. | The *Right Side Check* is the main overhead for the verifier. |
| **GKR** | Sum-Check protocol over layered circuits | Computing random challenges and evaluating wiring polynomials is gas-heavy. | Verification cost grows logarithmically with circuit size but linearly with depth. |
| **EMSM** | Homomorphic MSMs and Learning Parity with Noise (LPN) | Two-round interaction breaks the non-interactiveness required for on-chain use. | Public exponents in the Tokamak use-case expose the masking vector. |

![[Gemini_Generated_Image_m79icum79icum79i.png]]

### **Tokamak Network: **Tokamak Private App Channels

Despite these challenges, the [**Tokamak Private App Channels**](https://medium.com/tokamak-network/project-tokamak-zk-evm-67483656fd21)** **[J, T-ZKP, SJ25] remains committed to **on-chain verification** to ensure a higher standard of security. While many projects opt for off-chain or optimistic verification to bypass these bottlenecks, performing the verification directly on Ethereum's Layer 1 provides an immutable and trustless anchor for the protocol’s security.

While the cryptographic bottleneck persists, our team is dedicated to finding the most gas-efficient path forward, to further increase verification speed. **Join us on this journey** as we continue to harden the infrastructure of the [**Tokamak Private App Channels**](https://medium.com/tokamak-network/project-tokamak-zk-evm-67483656fd21) [J, T-ZKP, SJ25].

---

> [!note] 📣
> We are always looking to engage with the community and fellow researchers. If you have any questions, comments, or insights regarding these protocols or our approach to on-chain verification, please feel free to **reach out to us**—we would love to hear from you!

---

### Acknowledgments

Many thanks to Nil Soroush, Jake Jang, and Muhammed Ali Bingol (in reverse alphabetic order) for discussions, comments, revisions, and conversations regarding delegation, the single protocols and several engineering topics. Without all their help this Blog Post would not be here. All mistakes and inaccuracies are to be traced back to the author and no one else.

---

# References

- **[AHKM25] - Abbaszadeh K., Hafezi H., Katz J., Meiklejohn S.**, *Single-server private outsourcing of zk-SNARKs.* Cryptology ePrint Archive (2025). Accessed December 22, 2025. [https://eprint.iacr.org/2025/2113](https://eprint.iacr.org/2025/2113)
- **[BMMTV19] - Benedikt Bünz, Mary Maller, Pratyush Mishra, Nirvan Tyagi, and Psi Vesely**, Proofs for Inner Pairing Products and Applications, Cryptology ePrint Archive, 2019, [https://eprint.iacr.org/2019/1177](https://eprint.iacr.org/2019/1177)
- **[CTY11] - Graham Cormode, Justin Thaler, and Ke Yi**, *Verifying computations with streaming interactive proofs*. 2011, Proc. VLDB Endow. 5, 1 (September 2011), 25–36. [https://doi.org/10.14778/2047485.2047488](https://doi.org/10.14778/2047485.2047488)
- **[E] - ***An Ethereum Virtual Machine Opcodes Interactive Reference*, [https://www.evm.codes/precompiled](https://www.evm.codes/precompiled) 
- **[F21] - D. Feist**, *Inner Product Arguments*,* *Blog Post (2021, July 27). [https://dankradfeist.de/ethereum/2021/07/27/inner-product-arguments.html](https://dankradfeist.de/ethereum/2021/07/27/inner-product-arguments.html)
- **[GKR08] - S. Goldwasser, Y. T. Kalai, and G. N. Rothblum**, *Delegating computation: interactive proofs for muggles*. In STOC, pages 113–122, 2008. [https://www.microsoft.com/en-us/research/wp-content/uploads/2016/12/2008-DelegatingComputation.pdf](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/12/2008-DelegatingComputation.pdf)
- **[J] - Jake Jang, ***Project “Tokamak Network ZKP” Verifiable computation of private Ethereum transactions*, Tokamak Network, Medium,  [https://medium.com/tokamak-network/project-tokamak-zk-evm-67483656fd21](https://medium.com/tokamak-network/project-tokamak-zk-evm-67483656fd21)
- **[KZG10] - Kate, A., Zaverucha, G.M., Goldberg, I**, *Constant-Size Commitments to Polynomials and Their Applications.* In: Abe, M. (eds) Advances in Cryptology - ASIACRYPT 2010. ASIACRYPT 2010. Lecture Notes in Computer Science, vol 6477. Springer, Berlin, Heidelberg. [https://doi.org/10.1007/978-3-642-17373-8_11](https://doi.org/10.1007/978-3-642-17373-8_11)
- **[LFKN92] - Carsten Lund, Lance Fortnow, Howard Karloff, and Noam Nisan**, *Algebraic methods for interactive proof systems*. J. ACM, 39:859–868, October 1992.
- **[M] - ** *GKR-MSM* in Morgana Proofs, [https://github.com/morgana-proofs/GKR-MSM/tree/main](https://github.com/morgana-proofs/GKR-MSM/tree/main)
- **[P25] - Benny Pinkas**, *Verifiable Multi-Exponentiation and Multi-Scalar Multiplication (MSM)*. Decentralized Thoughts (2025, February 14). [https://decentralizedthoughts.github.io/2025-02-14-verifiable-MSM/](https://decentralizedthoughts.github.io/2025-02-14-verifiable-MSM/)
- **[T] - Justin Thaler**,* Proofs, Arguments, and Zero-Knowledge*, v. July 18, 2023.
- **[TRMP12] - Justin Thaler, Mike Roberts, Michael Mitzenmacher, and Hanspeter Pfister**, *Verifiable computation with massively parallel interactive proofs*,* *2012. In Proceedings of the 4th USENIX conference on Hot Topics in Cloud Ccomputing (HotCloud'12). USENIX Association, USA, 22. [https://dl.acm.org/doi/10.5555/2342763.2342785](https://dl.acm.org/doi/10.5555/2342763.2342785)
- **[T-ZKP] - Tokamak Network ZKP**, [https://zkp.tokamak.network/](https://zkp.tokamak.network/)
- **[SJ25] - Nil Soroush, Jake Jang**, *Tokamak Private App Channels: A Comparative Analysis*,* *Tokamak Network, (2025, December 30). [https://zkp.tokamak.network/blog/tokamak-private-app-channels-a-comparative-analysis](https://zkp.tokamak.network/blog/tokamak-private-app-channels-a-comparative-analysis)
- **[V25] - Vitalik Buterin**, *A GKR Tutorial*. Vitalik Buterin's website (2025, October 19). [https://vitalik.eth.limo/general/2025/10/19/gkr.html](https://vitalik.eth.limo/general/2025/10/19/gkr.html)
- **[VOSS] - Alex Vlasov, Kelly Olson, Alex Stokes, Antonio Sanso, *****EIP-2537: Precompile for BLS12–381 curve operations, Ethereum Improvement Proposals, no. 2537***, February 2020. [https://eips.ethereum.org/EIPS/eip-2537](https://eips.ethereum.org/EIPS/eip-2537)
- **[Z] -** *Learning Parity with Noise (LPN)* - zkPass - Medium Blog Post. Published March 9, 2023. [https://medium.com/zkpass/learning-parity-with-noise-lpn-55450fd4969c](https://medium.com/zkpass/learning-parity-with-noise-lpn-55450fd4969c)

---





---

Date: 5th of January, 2026

Author(s): Luca Dall’Ava — ZKP Researcher at Tokamak Network

---