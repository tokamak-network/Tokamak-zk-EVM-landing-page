---
base: "[[blog-index.base]]"
ArticleId: teq2e0gj
Title: "The SYB Network (MVP version) Notebook"
Slug: syb-mvp-notebook
Description: "We present here the SYB Network (MVP version) Notebook. This is an interactive tool for simulating the SYB Network behavior as well as Sybil attacks."
Published: Staging
PublishDate: "November 27, 2025"
Tags:
  - Algorithm
  - Technical
  - Tutorial
Author: "Luca Dall'Ava"
CanonicalURL: "https://docs.tokamak.network/blog/syb-network-mvp-version-notebook"
ReadTimeMinutes: 8
Status: "Ready to Publish"
CoverImageAlt: "SYB Network MVP Notebook"
---

# The SYB Network (MVP version) Notebook


---

<aside>

We present here the SYB Network (MVP version) Notebook. This is an interactive tool for simulating the SYB Network behavior as well as Sybil attacks.

This tool isn’t just a demo; it's a full simulation environment where you can build networks, visualize "vouch" graphs, and stress-test the system against complex Sybil attacks. It allows testing the reputation score algorithm behind the SYB Network (MVP version), without the necessity of connecting your wallet and without a single transaction!

You can find the repository and get started here, [**SYB MVP Notebook Repository**](https://github.com/tokamak-network/syb-mvp-notebook), or dive directly into the [**SYB Network (MVP version) Notebook**](https://mybinder.org/v2/gh/tokamak-network/syb-mvp-notebook/HEAD?urlpath=%2Fdoc%2Ftree%2Fsyb_mvp.ipynb)!

</aside>

---

# What is the SYB MVP Tool?

The MVP tool is a Python implementation of the `VouchMinimal` smart contract (which can be found [here](https://sepolia.etherscan.io/address/0xa2ab45f9C6870Fba83cfB6835D311F34e6eDCc9A#code)), wrapped in a [Jupyter Notebook](https://jupyter.org) hosted on [Binder](https://mybinder.org). It allows you to simulate a network of nodes (users) who "vouch" for each other. 

Based on the graph of these vouches, the system calculates a **Rank** and **Score** for every user: if you want to become more familiar and learn more about the algorithm, you should check https://syb.tokamak.network/blog/the-algorithm-behind-the-syb-network-mvp-version.

We describe here how you can customize this tool in a few general situations:

- [Customizing the Scripted Tutorial](https://www.notion.so/Customizing-the-Scripted-Tutorial-30c30540582c81caa8b6e31d5d1171c6?pvs=21): change the parameters and modify the scripted tutorial.
- [Scripting Custom Network Topologies](https://www.notion.so/Scripting-Custom-Network-Topologies-30c30540582c8171aaf2e3b6db5fb730?pvs=21): consider custom networks and run simulations.
- [Sybil Attack: How to Run a "Dandelion Attack" Simulation](https://www.notion.so/Sybil-Attack-How-to-Run-a-Dandelion-Attack-Simulation-30c30540582c818e95ede857739408bf?pvs=21): consider a Sybil attack like in a dandelion attack.

---

# The main notebook

The main notebook, `syb_mvp.ipynb`, guides you through a tutorial where you join a network as a new user and interact with existing nodes like Alice and Bob, moving from a scripted tutorial to a fully open sandbox. 

You can dive into the detailed explanation by opening and running [the Notebook](https://mybinder.org/v2/gh/tokamak-network/syb-mvp-notebook/HEAD?urlpath=%2Fdoc%2Ftree%2Fsyb_mvp.ipynb), following through the following guided steps:

- **Initialization:** The system creates a random network of 8 initial users (Alice, Bob, etc.) with established trust connections.
- **Joining the Network:** You take on the role of a 9th user, simply named "User." This is your avatar in the simulation.
- **Interactive Tutorial:** The notebook walks you through key actions—receiving a vouch from Alice, getting another from Bob, and vouching back—showing exactly how these actions impact your Rank and Score.
- **Live UI:** Finally, it launches an `ipywidgets`based interface where you can freely vouch for or unvouch from any user in real-time, visualizing the results with a dynamic Plotly graph.

---

# Customizing the Scripted Tutorial

Before you run more complex simulations, you can tweak the basic tutorial in `syb_mvp.ipynb` to see how the system handles different conditions. The tutorial is driven by Python cells that you can edit directly.

Here are three easy parameters you can modify to alter the network and its behavior:

1. **Scaling the Network Size:**
    
    By default, you join a small network of 8 users, but you can make this much larger to see how your rank behaves in a crowded system.
    
    - **Locate Cell 2 (in Step 1)**, which contains the network creation code.
    - **Change** the `num_users` parameter:
        
        ```python
        # Create a network with 20 users (instead of 8)
        contract, users = create_random_mvp_network(num_users=20)
        ```
        
    
    **Why do this?** In a larger network, "default" ranks might persist longer, and gaining a high score becomes more difficult as there are more nodes competing for trust.
    
2. **Changing the Cast (Who Vouches for You?):**
    
    The scripted tutorial has "Alice" (User 0) and "Bob" (User 1) vouch for you, but you can change this to see how getting vouched by different people affects your score.
    
    - **Part A: Change the Vouch**
        - **Locate the "Step 3: Network Actions" cells.**
        - **Modify the index** used to select the vouching user.
        
        For example, to have the 3rd user ("Charlie") vouch for you instead of Alice:
        
        ```python
        # Change [0] (Alice) to [2] (Charlie)
        alice_addr = list(users.keys())[2]
        ```
        
    - **Part B: Change the Unvouch**
    If you change who vouches for you, you must also update the cleanup step to avoid errors.
        - **Scroll down to "Unvouching" (Step 4).**
        - **Update the index** to match the user you selected above:
            
            ```python
            # Make sure to change this index to [2] so Charlie unvouches for you!
            alice_addr = list(users.keys())[2]
            ```
            
        
        **Why do this?** If "Charlie" has a lower rank or score than "Alice" in the random graph, receiving a vouch from him might boost your score less effectively. This is a great way to observe the *quality over quantity* aspect of the algorithm.
        
3. **Increasing Your Popularity (Getting More Vouches):**
    
    What happens if more than *two* people vouch for you at once? You can modify the script to simulate a more popular user.
    
    - **Locate the "Vouching" cell in Step 3.**
    - **Add this code block** right after Alice vouches for you:
        
        ```python
        # Let's have David (User 3) vouch for us too!
        david_addr = list(users.keys())[1]
        david_name = ui._get_display_name(users[david_addr]['name'])
        
        print(f"Action: {david_name} is ALSO vouching for {user_name}...")
        contract.vouch(david_addr, user_addr)
        ```
        
    
    **Why do this?** The SYB algorithm uses a dampening factor. You can observe if getting a second vouch doubles your score or if it has diminishing returns compared to the first one.
    

---

# Scripting Custom Network Topologies

The interactive UI is great for manual testing, but you can replace the default random network with any structure you want; this is made possible by the Python library the notebook is built on top of: [NetworkX](https://networkx.org).

Here is an interesting way to use the tool to generate a [**Barabási–Albert** graph model](https://en.wikipedia.org/wiki/Barabási–Albert_model):

1. Open `syb_mvp.ipynb`.
2. Go to the last section *Beyond the Tutorial: Experiment Further* ****of the Notebook, or add a new code block (see instructions [below](https://www.notion.so/The-SYB-Network-MVP-version-Notebook-30c30540582c8179b557dc5e32c4147e?pvs=21)).
3. Paste the following code to initialize the contract with a new topology:
    
    ```python
    import networkx as nx
    from contract_interface_mvp import VouchMinimal
    from syb_mvp_ui import SYBMvpUserInterface
    from utils.utils import generate_alphabetical_names
    
    # 1. Create the Custom Graph (Scale-Free)
    # We create 15 nodes, attaching 2 edges from each new node to existing ones
    scale_free_graph = nx.barabasi_albert_graph(15, 2)
    directed_network = scale_free_graph.to_directed()
    
    # Initialize the contract
    contract = VouchMinimal(directed_network)
    
    # 2. Setup User Metadata for the UI
    # The UI needs names ('Alice', 'Bob') mapped to the addresses
    users = {}
    names = generate_alphabetical_names(len(contract.nodes))
    
    for addr in contract.nodes:
        # Map the address to a human-readable name
        idx = contract.address_to_idx[addr]
        name = names[idx]
        users[addr] = {'name': name, 'address': addr}
    
    # 3. Select your Avatar
    # Let's control the "hub" node (User 0), who likely has the most connections
    my_address = contract.idx_to_address[0]
    
    # 4. Launch the Interface
    print(f"Launching UI for Scale-Free Network with {len(users)} users...")
    ui = SYBMvpUserInterface(contract, users, my_address)
    ui.display()
    ```
    

When you run this block, the tool will:

1. Reset the simulation history.
2. Lunch the UI dashboard, but the underlying network will be a [Barabási–Albert graph](https://en.wikipedia.org/wiki/Barabási–Albert_model) (allowing you to explore how "[Hub](https://en.wikipedia.org/wiki/Barabási–Albert_model#Algorithm)" nodes dominate the scoring system).

This specific simulation allows you to experiment with a different initial network.

*Note that you can combine this simulation with [Customizing the Scripted Tutorial](https://www.notion.so/Customizing-the-Scripted-Tutorial-30c30540582c81caa8b6e31d5d1171c6?pvs=21)!*

---

# Sybil Attack: How to Run a "Dandelion Attack" Simulation

The repository includes a simulation script called `run_contract_simulation.py`, which automates the creation of honest users, attackers, and specific vouch patterns.

You can simulate a sophisticated **Dandelion Attack**: 

In this scenario, we have a main attacker (`Sybil_1`) who tries to appear legitimate by vouching for a highly ranked honest user (`Alice`) first. Then, an army of (9) other fake accounts (`Sybil_2` through `Sybil_10`) vouches for `Sybil_1` to artificially inflate their score.

This specific simulation helps verify if `Sybil_1` can gain a high score simply by interacting with `Alice` before being spammed by other fake nodes.

Here’s how you can run this simulation:

1. Open `syb_mvp.ipynb`.
2. Go to the last section *Beyond the Tutorial: Experiment Further* ****of the Notebook, or add a new code block (see instructions [below](https://www.notion.so/The-SYB-Network-MVP-version-Notebook-30c30540582c8179b557dc5e32c4147e?pvs=21)).
3. Copy and paste this script into the new code block in your notebook to run the simulation:
    
    ```python
    # Import the simulation runner
    from run_contract_simulation import run_simulation
    
    # --- 1. Setup the Actors ---
    # We will have 5 honest users (Alice, Bob, etc.) and 10 attackers
    NUM_REAL = 5
    NUM_SYBIL = 10
    
    # --- 2. Phase 1: Seed Vouches (The Honest Graph) ---
    # This establishes a baseline 'ring of trust' between honest users
    SEED_VOUCHES = [
        ("Alice", "Bob"), ("Bob", "Charlie"), 
        ("Charlie", "David"), ("David", "Eve"), 
        ("Eve", "Alice"), ("Alice", "Charlie") 
    ]
    
    # --- 3. Phase 2: The Dandelion Attack ---
    ATTACK_VOUCHES = []
    target_sybil = "Sybil_1"
    honest_target = "Alice"
    
    # Step A: Sybil_1 tries to bridge to the honest network
    # by vouching for a high-ranking honest user (Alice)
    ATTACK_VOUCHES.append((target_sybil, honest_target))
    
    # Step B: All other Sybils (2-10) vouch for Sybil_1
    # to boost Sybil_1's score (Star formation)
    for i in range(2, NUM_SYBIL + 1):
        attacker = f"Sybil_{i}"
        ATTACK_VOUCHES.append((attacker, target_sybil))
    
    # --- 4. Phase 3: Response ---
    # (We leave this empty to see how the algorithm handles the attack unaided)
    RESPONSE_VOUCHES = []
    
    # --- 5. Execute the Simulation ---
    run_simulation(
        simulation_name="Dandelion Attack (Sybil1->Alice)",
        num_real_users=NUM_REAL,
        num_sybil_users=NUM_SYBIL,
        seed_vouches=SEED_VOUCHES,
        attack_vouches=ATTACK_VOUCHES,
        response_vouches=RESPONSE_VOUCHES
    )
    ```
    

When you run this block, the tool will:

1. Reset the simulation history.
2. Execute the vouches step-by-step, printing the **rank** and **score** changes to the output console.
3. Generate a plot file (e.g., `contract_graph_smart_star_attack.png`) in the `plots/` folder, visualizing the graph evolution; see the picture below [Locate_plots.png](https://www.notion.so/30c30540582c810aa85ef4e05b8aa379?pvs=21).
    
    ![Clicking on the “folder” button you can access all the files and subfolders. Among them, you can find the plots folder once you run the simulation.](The%20SYB%20Network%20(MVP%20version)%20Notebook/Locate_plots.png)
    
    Clicking on the “folder” button you can access all the files and subfolders. Among them, you can find the plots folder once you run the simulation.
    

<aside>

**Note:** You can browse through several other simulations contained in `run_contract_simulation.py`! Clicking on the folder button (see Picture [Locate_plots.png](https://www.notion.so/30c30540582c810aa85ef4e05b8aa379?pvs=21)) you can access all files contained in the GitHub repository.

</aside>

---

# How to Add a New Code Block

To run custom scripts like the one above or the simulation below, you can edit the code cell in the last section of the notebook (see the picture below) or need to create a new cell in the Jupyter Notebook:

- If you want to edit the already provided code cell, just scroll down until the last section.
    
    ![Edit_last_cell.png](The%20SYB%20Network%20(MVP%20version)%20Notebook/Edit_last_cell.png)
    
- If you want to create a new cell follows the next steps:
    1. **Select an existing cell** by clicking on it (a blue bar will appear on the left).
        
        ![Select_cell.png](The%20SYB%20Network%20(MVP%20version)%20Notebook/Select_cell.png)
        
    2. **Insert a new cell** by interacting with the toolbar at the top of the screen. Click the **`+`** (Plus) button in the toolbar.
        
        ![Add_cell.png](The%20SYB%20Network%20(MVP%20version)%20Notebook/Add_cell.png)
        
    3. Make sure the cell type is set to **Code** (this is the default).
    4. Paste your Python code into the cell.

As usual, you can run the cell by clicking the **Run** (Play) button or pressing `Shift + Enter`.

---

---

Date: 27th of November, 2025

Author(s): Luca Dall’Ava — ZKP Researcher at Tokamak Network

---