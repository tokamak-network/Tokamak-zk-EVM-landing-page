---
base: "[[blog-index.base]]"
ArticleId: 76zh9400
Title: "How to Participate in the SYB Network: Stake, Vouch, and Build On‑Chain Reputation"
Slug: how-to-participate-in-the-syb-network
Description: "A step‑by‑step guide to staking TON, vouching on Sepolia, and building your SYB reputation for governance."
Published: Staging
PublishDate: "November 20, 2025"
Tags:
  - Technical
  - Technology
  - Tutorial
Author: "Aamir Muhammad"
CanonicalURL: "https://syb.tokamak.network/blog/how-to-participate-in-the-syb-network"
ReadTimeMinutes: 9
Status: Draft
CoverImageAlt: "Visual guide showing the steps to stake TON tokens and participate in SYB Network governance"
---

# How to Participate in the SYB Network: Stake, Vouch, and Build On‑Chain Reputation


> Build trust on-chain by vouching for people you actually know. In SYB, reputation isn’t bought — it’s earned.
> 

### What is the SYB Network?

SYB is a decentralized reputation graph. Members vouch for people they trust, forming a public network of relationships that powers governance and discovery. Your reputation improves as trusted members vouch for you and as the network around you grows stronger.

---

### Contract at a glance

- **Contract**: VouchMinimal
- **Network**: Ethereum Sepolia (Testnet)
- **Contract Address**: [0x3124424d2293a735661412A659277Ab7a290a474](https://sepolia.etherscan.io/address/0x3124424d2293a735661412A659277Ab7a290a474#code)
- Deposit Manager: [0x90ffcc7F168DceDBEF1Cb6c6eB00cA73F922956F](https://sepolia.etherscan.io/address/0x90ffcc7F168DceDBEF1Cb6c6eB00cA73F922956F)

<aside>
ℹ️

Always verify addresses and links in the official documentation before interacting on-chain.

</aside>

### Requirements to vouch

- **Web3 wallet**: MetaMask, Coinbase Wallet, or similar
- **Minimum 0.1 TON staked** in Tokamak's DepositManager
- **ETH for gas**: A small amount on Sepolia for transactions

<aside>
🔒

You must maintain at least **0.1 TON staked** to vouch. This ensures only committed community members participate.

</aside>

### Step-by-step: Participate and vouch

### Step 1: Stake your TON (WTON → sWTON)

<aside>
👉🏻

If you don’t have TON and want to receive the **Faucet (testnet)**, join our Telegram group: [Join Telegram](https://t.me/+HOQmpdZqr4gyZjc8)

- Faucet will send you
    - 1200 TON

All funds are on the testnet and for testing purposes only.

</aside>

- In order to Stake the TON, go to [sepolia.etherscan](https://sepolia.etherscan.io/address/0xa30fe40285b8f5c0457dbc3b7c8a280373c40044#writeContract#F3)
    
    Connect your wallet
    
    1. Click **Connect to Web3**
    2. Approve the connection in your wallet popup
    3. Confirm the banner shows: “Connected – Web3 [Your Address]”
- Call approveAndCall (0xcae9ca51) and Provide these values in the params
    - spender (address): 0x79E0d92670106c85E9067b56B8F674340dCa0Bbd
    - amount (uint256): 10000000000000000000
    - data (bytes): 0x00000000000000000000000090ffcc7f168dcedbef1cb6c6eb00ca73f922956f000000000000000000000000dbd15bd93feb9689071f9c4e4edee8dc1c06de42

### Step 2: Access the contract

1. Once the TON is staked, then open the [VouchMinimal contract](https://sepolia.etherscan.io/address/0x3124424d2293a735661412A659277Ab7a290a474#code) on Etherscan (Sepolia)
2. Click the **Contract** tab
3. Select **Write Contract**

### Step 3: Connect your wallet

1. Click **Connect to Web3**
2. Approve the connection in your wallet popup
3. Confirm the banner shows: “Connected – Web3 [Your Address]”

### Step 4: Vouch for someone you trust

1. In **Write Contract**, find `vouch(address to)`
2. Paste the wallet address of someone you know and trust into `to`
3. Click **Write**
4. Approve the transaction in your wallet
5. Wait ~10–30 seconds for confirmation

Congrats, you created a vouch!

<aside>
👥

Don't know who to vouch for yet? Join the [Telegram community](https://t.me/+HOQmpdZqr4gyZjc8) to meet other members and find someone to mutually vouch with.

</aside>

### Step 5: Check your reputation

Use the **Read Contract** tab to explore your profile:

- `getNodeInfo(address)` — Full profile snapshot
- `getRank(address)` — Rank from 1–6 (1 is best; 6 is the default)
- `getScore(address)` — Reputation score
- `getInNeighbors(address)` — Who vouched for you
- `getOutNeighbors(address)` — Who you vouched for

---

### How SYB rank and score work

- **Rank (lower is better)**
    - Rank 1: Highly verified by trusted members
    - Rank 2–5: Building reputation
    - Rank 6: New or no incoming vouches yet
- **Score**
    - Combines incoming and outgoing vouches
    - Vouches from higher‑ranked members carry more weight
    - Higher scores signal stronger network presence

<aside>
🧭

Reputation is contextual and cumulative. Focus on authentic relationships rather than volume.

</aside>

---

### Vouching rules

**Do**

- Vouch only for people you actually know and trust
- Verify identities off-chain where appropriate
- Keep relationships authentic

**Don’t**

- Vouch for unknown addresses
- Vouch for yourself (blocked by the contract)
- Create duplicate vouches (only one per pair)

---

### Key contract functions

Write

- `vouch(address to)` — Vouch for an address
- `unvouch(address to)` — Remove vouch (if enabled in this deployment)

Read

- `hasMinimumStake(address)` — Check if an address can vouch
- `getStakedAmount(address)` — View staked amount
- `getRank(address)` — View rank
- `getScore(address)` — View score
- `getNodeInfo(address)` — Full profile
- `getInNeighbors(address)` — Incoming vouches
- `getOutNeighbors(address)` — Outgoing vouches

---

### Troubleshooting

- **"Insufficient stake to vouch"** → Stake at least 0.1 TON in DepositManager
- **“exists” error** → You have already vouched for this address
- **“self” error** → Self‑vouching is not allowed
- **Transaction pending** → Check gas price, verify Sepolia network, and try again

---

### What’s next after your first vouch?

1. **Receive vouches** from people who know you
2. **Improve your rank** by being vouched by higher‑ranked members
3. **Participate in governance** with your reputation
4. **Build community** with trusted connections

---

### Join the community

- **Website**: [`syb.tokamak.network`](http://syb.tokamak.network)
- **Telegram**: [Community chat](https://t.me/+HOQmpdZqr4gyZjc8)

<aside>
🚀

Ready to start? Stake a minimum of 0.1 TON, visit the contract on Etherscan, connect your wallet, and vouch for someone you trust.

</aside>

---

*Last updated: 9 December 2025. Always refer to the official documentation for the latest contract addresses and deployment details.*