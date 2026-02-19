---
notion-id: 30b30540-582c-81bf-ac5b-c7cac60403ee
base: "[[blog-index.base]]"
AuthorEmail: luca@tokamak.network
Slug: scaling-tokamak-batched-verification
CoverImage:
  - "[[Gemini_Generated_Image_4iab7i4iab7i4iab.png]]"
PublishDate: 2025-12-16
CanonicalURL: https://zkp.tokamak.network/blog/scaling-tokamak-batched-verification
Status: Published
Author: Luca Dall’Ava
Tags:
  - Technical
  - Cryptography
ReadTimeMinutes: 6
Description: Discover how batched verification reduces on-chain costs for Tokamak zk-SNARKs by replacing expensive sequential pairing operations with efficient aggregated checks, enabling high-throughput scalability.
CoverImageAlt: ""
Published: Prod
---
**Zero-Knowledge Succinct Non-Interactive Arguments of Knowledge (zk-SNARKs)** have revolutionized blockchain scalability and privacy. They allow a prover to convince a verifier that a computation is correct without revealing the underlying data. However, as transaction volumes on the Tokamak Network increase, we face a fundamental challenge: can we increase the transaction throughput?

Even though SNARKs are succinct, i.e. small proofs and fast verification, **fast is relative:** 

> [!note] 📌
> Verifying a single proof is cheap, but verifying thousands of proofs *sequentially* becomes a significant computational bottleneck.

## The Challenge of Reiterated Verification

In a high-throughput environment, we are constantly reiterating SNARK verifications. If we have $N$ transactions, we traditionally run the verification algorithm $N$ times. This process burdens the system, as the verification often happens on-chain; for example, in the Tokamak Network ZKP Channels the verification is handled on the Ethereum blockchain.

The *Holy Grail* solution to this problem is *Incremental Verifiable Computation* (IVC). In an IVC scheme, a proof attests not only to the current step of computation but also to the validity of the previous proof. This allows us to fold an infinite chain of computations into a single, verify-once proof. However, IVC schemes are complex; they require specialized cycle of curves or recursive aggregation techniques that are heavy to implement and currently a **work in progress** for many protocols, *including ours*. Moreover, in an IVC we trade off verification improvements for a prover’s overhead, which might not be feasible in each system.

While we build toward that future, we need **immediate, practical scalability.**

## Batched Verification

This brings us to **Batched Verification**. Instead of verifying $N$ proofs individually, what if we could verify them all simultaneously?

We have released a new technical note, [***Batched Verification for Tokamak SNARK***](placeholder), which mathematically proves that we can aggregate the verification of several proofs outputted by the Tokamak SNARK prover more efficiently than the sequential verification.

![[Gemini_Generated_Image_9lc1eh9lc1eh9lc1.png|Gemini-generated image visualizing the sequential and batched processes.]]

### How It Works

The core idea relies on checking a random linear combination of the verification equations. By utilizing the **Schwartz-Zippel lemma**, we know that if this aggregated, randomized equation holds true, then the individual proofs are valid with overwhelming probability.

In our protocol, we define a batched verifier, $\widetilde{\mathsf{Verify}}_4$, which takes $N$ distinct transcripts and aggregates their verification.

More precisely, the verification of a single Tokamak SNARK proof requires checking a pairing equation involving elliptic curve operations. These pairing operations (bilinear maps) are computationally expensive, especially on-chain.

In the naive sequential approach, verifying $N$ proofs requires $10 \cdot N$ pairing operations, but our proposed protocol reduces this drastically. The batched verifier requires only a **constant number of pairing operations** (specifically, $10$), regardless of the batch size $N$.

Whether we are verifying $5$ proofs or $5,000$, the number of expensive pairing checks remains the same.

### Security and Soundness

Optimizing for speed is useless if we sacrifice security. In the technical note we provide rigorous proofs demonstrating that our batched protocol maintains:

- **Statistical Completeness:** Honest provers will always pass the check.
- **Witness-Extended Emulation:** Ensures knowledge soundness against adversarial provers.
- **Zero-Knowledge:** The privacy properties of the original SNARK are preserved.

> [!note] 📌
> For those interested in the deep mathematical proofs and the precise algebraic construction of the $\widetilde{\mathsf{Verify}}_4$ algorithm, you can download the full PDF of the technical note [here](placeholder).

## The Trade-off: Multi-Scalar Multiplications (MSMs)

There is no such thing as a free lunch in cryptography. While we have eliminated the $O(N)$ pairing operations, we have shifted some of the complexity elsewhere.

<!-- Column 1 -->
The batched verification protocol requires an increased number of **Multi-Scalar Multiplications (MSMs)** and group operations. Specifically, the complexity analysis shows that the verifier must compute roughly $36 + l$ MSMs of length $N$ (here $l$ is roughly the number of input and output wires in the circuit), along with some additional group operations.

<!-- Column 2 -->
![[Gemini_Generated_Image_ulcxcwulcxcwulcx.png|Gemini-generated image visualizing the weight trade off between parings and MSMs.]]


However, even though MSMs do scale linearly with the batch size, they are fundamentally different from pairings:

1. They are generally faster than pairings on standard hardware.
2. They are highly parallelizable.

### The Path Forward

This shift toward MSMs opens up a fascinating possibility, namely, that of d**elegation**.

Because MSMs are computationally intensive but structured, they don't necessarily have to be performed by the entity that requires the final validity check. We can potentially offload these massive MSM operations to specialized provers or hardware accelerators, leaving the verifier with a lightweight task.

We are currently exploring how to *efficiently* and *safely* delegate these operations to further reduce the load on the Tokamak Network verifier. 

> [!note] 📌
> We will discuss more on this fascinating problem in a separate blog post, stay tuned!

---

**Summary:** By moving from sequential to batched verification, Tokamak Network can amortize the heavy cost of SNARK pairings. This provides a crucial scalability bridge as we continue to research advanced recursive techniques like IVC.

---

*Many thanks to Jehyuk Jang for feedback on this post.*

---





---

Date: 16th of December, 2025

Author(s): Luca Dall’Ava — ZKP Researcher at Tokamak Network

---