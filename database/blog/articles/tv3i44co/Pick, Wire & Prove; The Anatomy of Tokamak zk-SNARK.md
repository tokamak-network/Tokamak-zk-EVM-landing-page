---
base: "[[blog-index.base]]"
ArticleId: tv3i44co
Title: "Pick, Wire & Prove; The Anatomy of Tokamak zk-SNARK"
Slug: pick-wire-and-prove-the-anatomy-of-tokamak-zksnark
Description: "We present a high-level overview of Tokamak zk-SNARK."
Published: Prod
PublishDate: "December 30, 2025"
Tags:
  - Cryptography
  - Technical
  - Technology
Author: "Nil Soroush"
CoverImage: "Pick,%20Wire%20&%20Prove;%20The%20Anatomy%20of%20Tokamak%20zk-SNAR/anatomy_of_TM-ZK-SNARK.png"
---

# Pick, Wire & Prove; The Anatomy of Tokamak zk-SNARK


![anatomy of TM-ZK-SNARK.png](Pick,%20Wire%20&%20Prove;%20The%20Anatomy%20of%20Tokamak%20zk-SNAR/59e165c5-8cb1-4c77-bbf0-4b91c26ad607.png)

SNARKs are the backbone of efficient and private verification in systems like blockchains. They let a prover (who knows the secret inputs, or *witness*) convince a verifier (who only sees the public inputs) that a computation was carried out correctly—without redoing the work.

But there’s a catch: most SNARKs rely on a **setup phase** that preprocesses the circuit (the computation to prove).

- Systems like [**Groth16**](https://eprint.iacr.org/2016/260) are extremely efficient—tiny proofs and fast verification—but they need a *new setup for every circuit*, which doesn’t scale when computations change often.
- Systems like [**PlonK**](https://eprint.iacr.org/2019/953) or [**Marlin**](https://eprint.iacr.org/2019/1047) are *universal*—one setup works for any circuit—but they require bulky preprocessing data that every verifier must handle, slowing things down.

This is a big problem for **dynamic environments**, such as blockchains or RAM-based computations, where the “*program*” (or circuit) keeps changing. Constantly redoing setups or pushing large verifier data becomes a bottleneck.

[***Tokamak zk-SNARK](https://eprint.iacr.org/2024/507)*** offers a hybrid approach:

- As efficient as **Groth16**.
- As universal as **PlonK**.
- But *without the heavy verifier preprocessing.*

<aside>

*Universality* in **Tokamak** means any computation expressible by wiring together copies of a fixed subcircuit (gadget) library, rather than arbitrary ad-hoc circuits that introduce new constraints outside that library.

</aside>

It works for “field-programmable” circuits that can be customized on-the-fly, as well as RAM-style computations (like virtual machines). In some cases, it even skips verifier preprocessing entirely, delivering proofs that are 4–10× smaller than competitors.

### **A Field-Programmable Solution**

In the paper, "An Efficient SNARK for Field-Programmable and RAM Circuits," we present a different way to organize the setup phase. Instead of preparing everything from scratch for each new circuit, they propose a **field-programmable** approach. The core idea is to fix a library of subcircuits—small, reusable building blocks like adders, multipliers, or memory gadgets.

Think of these as **LEGO bricks**: once you have the bricks, you can build many different structures by snapping them together. To represent a new program, you don't design a whole new circuit; you simply place copies of these subcircuits and then define the connections between them. This wiring is described by a **permutation** called the **wire map**.

## The Role of RAM-to-Circuit Reduction

**Tokamak zk-SNARK’s** design is closely related to the **RAM-to-circuit reduction** idea. In RAM-based systems, computations are described as a sequence of instructions acting on memory. A naive approach would be to encode the *entire RAM machine* inside the circuit, but this quickly becomes enormous and inefficient. RAM-to-circuit reductions solve this by only unrolling the *actual program execution* into a circuit, avoiding the need to represent every possible machine state.

**Tokamak-zk-SNARK** follows this philosophy but goes one step further: instead of requiring the verifier to preprocess the whole unrolled trace or all intermediate input/output values (as in earlier RAM reductions), it separates concerns. Arithmetic checks happen inside the subcircuits, while wiring consistency is handled externally through permutation and binding arguments. This shift keeps circuits compact and significantly reduces the verifier’s preprocessing burden.

### Example: Adding Two Numbers ($3 + 6)$

To see the difference between a RAM model and a circuit model, let’s walk through the simple computation $3 + 6$.

<aside>

![ram_circuit.png](Pick,%20Wire%20&%20Prove;%20The%20Anatomy%20of%20Tokamak%20zk-SNAR/604b192b-b4e0-416c-9976-402cdc726cc3.png)

**Circuit Model:**

In a circuit, the same computation is much simpler:

- Feed 3 and 6 into an **adder gate**.
- The gate outputs 9.

That’s it. The circuit is just one gate, no intermediate memory states, no instruction unrolling.

</aside>

<aside>

**RAM Model (like a CPU)**

In a RAM machine, the addition doesn’t happen in one step. Instead, it looks like a sequence of low-level instructions:

1. **LOAD** 3 into register R1.
2. **LOAD** 6 into register R2.
3. **ADD** R1 and R2, store the result in R3.
4. **STORE** R3 into memory cell M0.

Each of these instructions touches memory or registers. To prove correctness in a SNARK, a naive approach would have to encode *all* of these steps and states (register contents, memory updates), which makes the circuit very large.

</aside>

### Why This Matters?

RAM-to-circuit reduction is about collapsing the verbose instruction-by-instruction model (**LOAD**, **STORE**, **ADD**, etc.) into a smaller program-specific circuit (just an ADD gate). **Tokamak-zk-SNARK** applies this idea: it doesn’t force the verifier to preprocess every instruction trace, but instead checks correctness using subcircuits (like adders, multipliers, or EVM opcodes) and external wiring arguments.

### Contrast with Mirage

Another useful comparison is with [**Mirage**](https://eprint.iacr.org/2020/278), which also builds proofs over universal circuits. Mirage enforces wiring consistency by inserting special “wiring subcircuits” directly inside the universal circuit itself. While this works, it means the verifier must preprocess and commit to input/output data for each subcircuit instance, which adds overhead.

**Tokamak-zk-SNARK** avoids this by moving wiring checks *outside* the circuit. It uses **permutation arguments** (to confirm wires carry the same values) together with a **binding argument** (to tie those values back to the arithmetic checks). The result is that the verifier only needs to preprocess information about the *fixed subcircuit library*—not every instance of those subcircuits in the final program-specific circuit. This makes the system far more efficient and scalable, especially in dynamic settings like blockchains or RAM-based computation.

## Verifier Complexity

A key benefit of **Tokamak-zk-SNARK** i s how it reduces the verifier’s workload.
In traditional systems, the verifier’s preprocessing and checks scale with the **entire circuit size**—every gate and every wire. This quickly becomes impractical for large or frequently changing computations.

**Tokamak-zk-SNARK** changes the verifier’s scaling rule.

- Instead of scaling with the full size of the derived circuit (every gate and wire), the verifier’s circuit-specific data depends only on:
    - the size of the fixed subcircuit library, ( $|\mathcal L| = \ell$ ), and
    - the maximum number of copies allowed per subcircuit,  $s_{\max}$ .
- Formally, the dimension of the verifier’s circuit-specific input scales as

$$
⁍,
$$

rather than with the total number of gates or wires in the program-specific circuit.

- The actual number of times those subcircuits are used in a particular computation does **not** increase the verifier’s workload beyond this bound.

In other words, once the verifier commits to a fixed library of building blocks and a maximum allocation, new programs only change *how those blocks are wired*, not the scale of what the verifier must handle.

## The Three-Argument Proof System

Once this structure is in place, the proof system itself is built from three distinct, yet interconnected, arguments:

1. **An arithmetic argument:** This component checks that each subcircuit copy is internally correct. This is a Groth16-style proof, but it's extended to use **bivariate polynomials**—polynomials with two variables. This allows the system to efficiently represent the entire circuit by indexing both the subcircuit type (from the library) and the specific copy placed in the circuit.
2. **A permutation argument:** This checks that the wire map is respected, ensuring that the same value correctly flows between connected subcircuits. This concept is adapted from PlonK but is also extended to bivariate polynomials to handle the field-programmable structure.
3. **A binding argument:** This ensures that both the arithmetic and permutation proofs are talking about the **same witness values**. This critical step binds the two arguments together, guaranteeing the integrity of the overall proof.

In this way, the verifier only needs to preprocess information about the **wire map**, rather than the whole **circuit**. This reduces the verifier's burden from a dimension proportional to the full circuit size down to about $\ell \cdot s_{\max}$, where $\ell$ is the number of subcircuits in the library and $⁡s_{\max}$ is the maximum number of copies you allow.

The result is a SNARK that keeps **Groth16-level** proof size and efficiency, while gaining a form of **universality**—any computation that can be expressed using the subcircuit library can be proved, without redoing a heavy setup. It's the same as saying: once you have manufactured your LEGO bricks, you can build castles, cars, or robots just by snapping them together in different ways. This is particularly valuable for distributed systems, like blockchains, where new computations are frequent and nodes cannot be fully trusted.

Let's make it more clear by going through some simple examples.

### 🧱The LEGO Bricks Example:

Imagine our universal circuit library $\mathcal L,$ has just two subcircuits, like two types of **LEGO bricks**: an **Adder** and a **Multiplier**.

- **Adder ($c₀$):** Takes inputs $x$ and $y$, and outputs $z=x+y$.
- **Multiplier $(c₁)$:** Takes inputs $u$ and 
$$$v$, and outputs $w=u⋅v$.

The total number of subcircuits in our library is $2$.

Now, let's build a program to compute the expression: `out = (a + b) · c`.

1. **Derive the Circuit:** We select one *Adder* and one *Multiplier* from our library, $\mathcal L,$ and place them in our circuit. We can think of these as "copy #0" (*Adder*) and "copy #1" (*Multiplier*).
2. **Define the Wire Map:** We connect these copies using a **wire map** $(ρ)$. This map defines the data flow:
    - The public inputs a and b go into *Adder* (copy #0).
    - The output of the Adder (let's call it $z$) connects to the first input of the Multiplier (copy #1).
    - The public input $c$ goes into the second input of the Multiplier.
    - The output of the Multiplier is our program's final output, `out`.

This wire map is essentially a permutation, which is the only thing we need to define to create this specific computation from our fixed library.

### Connecting the Example to the Proof System 🧩

The beauty of this system is that it can prove the correctness of this computation by checking a few key things without having to pre-process a new circuit for every single expression. This directly addresses the "*heavy verifier preprocessing"* problem mentioned in the introduction.

### 1. Arithmetic Constraints (Are the bricks working correctly?)

The **arithmetic argument** checks the internal logic of each subcircuit copy. This is a Groth16-style proof but modified to use ***bivariate polynomials***, which allows it to prove the constraints for multiple subcircuit copies at once.

- For the *Adder* copy: The argument checks that the output `$z$` is indeed the sum of inputs $a$ and $b$. ($z = a +b$)
- For the *Multiplier* copy: It checks that the output `out` is the product of its inputs, $z$ and $c$.

### 2. Copy Constraints (Are the bricks connected correctly?)

The **permutation argument** checks that the wire map is respected. It confirms that the value `$z$` from the Adder's output is exactly the same value `$z$` that's being used as the Multiplier's input. This is what guarantees the two "snapped" subcircuits are correctly linked.

### 3. Polynomial Binding (Are we using the same bricks?)

The **polynomial binding argument** acts as the final check, ensuring that the witness values used in the arithmetic argument are the exact same ones used in the permutation argument. For our example, this means the value of $z$ must be consistent across both proofs.

Using the paper's formal definitions, the variables used in this proof system:

- $a=(a,b,c)$ represents the **public instance**.
- $b$ is the private value of the shared wire, $z$.
- $c$ would be for any other private, non-shared internal wires (though in this simple case there aren't any).

### Example 2: Computing $(a·b)+(c·d)$

### Step 1. Define the Library $\mathcal L =\{ +, \times , ==\}$

Our universal circuit library has:

1. **Adder** $c₀$: Inputs: $x, y → \mathrm{Output}: z = x+y | \mathrm{Constraint}: z - (x+y) = 0$
2. **Multiplier** $c₁$: Inputs: $u, v → \mathrm{Output}: w = u·v | \mathrm{Constraint}: w - (u·v) = 0$
3. **Identity (Wire Forwarder)** $c₂: \text{Input}: p → \mathrm{Output}: q = p | \mathrm{ Constraint}: q - p = 0$

(The identity gadget seems trivial, but it often helps in real circuits to manage wiring cleanly.)

---

### Step 2. Derive a Circuit

We want to compute:

$$
out = (a·b)+(c·d)
$$

We can build this from the library:

- Place two copies of Multiplier $(c₁)$:
    - Copy #0: computes $m₀ = a·b$
    - Copy #1: computes $m₁ = c·d$
- Place one copy of Adder $(c₀)$:
    - Copy #2: computes $out = m₀ + m₁$
- (Optionally) place Identity gadgets if we want to make wiring explicit: e.g., forwarding $m₀$ and $m₁$ into the *Adder*.

So total: 2 *multipliers* + 1 *adder* = 3 main subcircuit copies.

### Step 3. Wire Map

- Inputs $a, b$ go into Multiplier copy #0.
- Inputs $c, d$  go into Multiplier copy #1.
- Outputs $m₀, m₁$ are wired to the two inputs of Adder copy #2.
- Output of Adder copy #2 = **final result**.

The **wire map** here is:

- (output of copy#0) → (input#1 of copy#2)
- (output of copy#1) → (input#2 of copy#2)

---

### Step 4. Variables $(a, b, c)$

- $a$: public inputs (we'll make $a, b, c, d$ public).
- $b$: private *shared wires*: $m₀, m₁$.
- $c$: private *internal wires*: none here (since outputs are directly shared).

---

### Step 5. Constraints

1. **Arithmetic constraints (inside each copy):**
    - Multiplier copy #0: $m₀ - (a·b) = 0$
    - Multiplier copy #1: $m₁ - (c·d) = 0$
    - Adder copy #2: $\mathrm{out } - (m₀+m₁) = 0$
2. **Copy constraints (between copies):**
    - Shared wires $m₀, m₁$ are consistent across copies, enforced by permutation checks.

### Step 6. Intuition

- **Library** = toolbox: multipliers, adders, identity gadgets.
- **Derived circuit** = we grabbed 2 multipliers and 1 adder, then wired them together.
- **Arithmetic checks** = each multiplier and adder works correctly.
- **Permutation check** = ensures $m₀$ and $m₁$ values really flow into the adder.

### The **bivariate indexing** makes sense here:

- First component = which wire (input/output),
- Second component = which copy (0, 1, 2).

<aside>
💡

**Additional Note:**

The opcodes from the EVM are a natural choice for defining the subcircuits in the library, and this aligns closely with the approach discussed in the paper for **verifiable machine computation**. The EVM functions as a **random-access machine (RAM)**, and its opcodes, such as `ADD` and `MUL`, provide a universal and modular set of instructions.

By modeling each opcode as a subcircuit in the library, a prover can derive a program-specific circuit on the fly by unrolling the sequence of executed instructions. This avoids requiring the verifier to preprocess data for every new transaction.

Compared to using a single, large universal circuit to represent the entire computation, this method yields **smaller proofs** and reduces **verification complexity**. These advantages are especially important for platforms like Ethereum, where the computation target (transactions) changes frequently.

The [Ethereum Opcodes reference](https://ethervm.io/#opcodes) offers a comprehensive catalog of instructions that can serve as the foundation for building such a subcircuit library. Connecting this back to the earlier examples, you can imagine replacing the simple adder and multiplier gadgets with EVM opcodes — the same library-and-wiring principles apply, only now at the scale of a full virtual machine.

</aside>