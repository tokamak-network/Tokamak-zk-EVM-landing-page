# Tonigma Landing Page Planning

Audience: internal designers, frontend developers, and project stakeholders responsible for rebuilding the Tonigma landing page.

## 1. First Planning Priority: Design Concept

The first planning decision is the landing page design concept. The page must introduce Tonigma as a credible product surface for Tokamak Private App Channels, not as a generic ZK marketing page or a vague privacy brand.

### Product Context

Tonigma is the service brand around Tokamak Private App Channels and the DApp ecosystem built on top of them. The `private-state` note transfer DApp is one Tonigma DApp, not the definition of Tonigma itself.

Core facts from the implementation repositories:

- Tonigma is related to Tokamak Private App Channels, which are Ethereum-settled, validity-proven execution domains for bridge-coupled DApps.
- Each channel belongs to one registered DApp and keeps its own channel state commitment.
- Ethereum remains the canonical place for custody, proof verification, and settlement.
- One current reference DApp is `private-state`, a bridge-coupled zk-note payment DApp for the Tokamak Network Token.
- Users of the `private-state` note transfer DApp interact with channel-local accounting balances, private-state notes, encrypted note-delivery events, nullifiers, and proof-backed state transitions.
- Public bridge deposits, withdrawals, channel joins, accepted transitions, commitments, nullifiers, verifier versions, and policy metadata remain observable.
- In the `private-state` note transfer DApp, private note ownership, note-transfer meaning, and note provenance are not publicly reconstructed by default.
- Tonigma does not hold user wallet secrets, spending keys, viewing keys, or a master viewing key.
- The public observer at `observer.tonigma.network` is an important part of the product story: Tonigma DApps can expose explicit public boundary surfaces while keeping DApp-defined private state inside the channel.

### Design Thesis

Design Tonigma as **verifiable private-app-channel infrastructure with clear public boundaries**.

The page should feel precise, accountable, and technical enough for protocol users, operators, compliance reviewers, and developers, while still being understandable to users who only need the product promise.

The visual language should avoid the usual privacy tropes of darkness, secrecy, masks, hidden tunnels, or anonymous mystery. Tonigma should instead look like a controlled proof system and DApp surface: visible commitments, explicit boundaries, channel-scoped state, and user-held keys where a DApp uses user-controlled secrets.

Recommended concept name:

**Transparent Boundary, Private State**

This concept captures the main product distinction:

- public Ethereum entry and exit where the DApp uses bridge custody
- public observer and policy surfaces
- proof-backed application state inside DApp-specific channels
- DApp-defined privacy and disclosure models

### Brand Asset Direction

Primary logo source:

- `/Users/jehyuk/repo/tonigma-management/assets/logo/publish/standard/tonigma-logo.png`

Supporting symbol source:

- `/Users/jehyuk/repo/tonigma-management/assets/logo/sqare-logo/tonigma-square-logo.png`
- `/Users/jehyuk/repo/tonigma-management/assets/logo/sqare-logo/tonigma-square-logo.svg`

Observed brand traits:

- The standard logo uses a black field, a white node/link symbol, and a heavy wordmark filled with mathematical/proof-like texture.
- The square symbol is not a generic network mark. It depicts the Tokamak zk-EVM signal-processing graph from left to right.
- The alternate blue/navy wordmark in `/Users/jehyuk/repo/tonigma-management/tmp/tonigma-logo-on-white.png` is more SaaS-like, but less distinctive than the proof-textured standard logo.

Symbol meaning:

- The graph has four left-to-right layers with `2 -> 3 -> 2 -> 1` nodes.
- Layer 1 represents input data.
- Layer 2 represents domain expansion through the Tokamak zk-EVM compiler stack, especially qap-compiler and Synthesizer, where input data is transformed into higher-dimensional polynomial, matrix, circuit, and placement domains.
- Layer 3 represents commitment of the expanded result through elliptic-curve cryptography, hashing, and related commitment machinery.
- Layer 4 represents proof compression into the final zero-knowledge proof.
- The final node is a diamond as an homage to the Ethereum logo. It means the resulting zero-knowledge proof can be verified on Ethereum.

Implementation context from `/Users/jehyuk/repo/tokamak-zk-evm/`:

- Tokamak zk-EVM turns Tokamak L2 transaction execution into zk-SNARK proof artifacts.
- The Synthesizer takes a transaction replay payload with `previousState`, `transaction`, `blockInfo`, and `contractCodes`.
- The Synthesizer emits circuit-ready artifacts such as `placementVariables.json`, `instance.json`, `instance_description.json`, `permutation.json`, `state_snapshot.json`, `step_log.json`, and `message_code_addresses.json`.
- The subcircuit library, internally tied to qap-compiler generation, publishes prebuilt R1CS artifacts, WASM witness-generation artifacts, JSON metadata, witness helpers, and Circom constants.
- The CLI orchestrates the practical flow: install runtime, synthesize, preprocess, prove, verify, and extract proof bundles.

External presentation rule:

- The symbol meaning and Tokamak zk-EVM implementation context are internal design guidance.
- The landing page must not explain the symbol as a literal four-layer compiler/proof pipeline to general users.
- Do not put labels such as `qap-compiler`, `Synthesizer`, `R1CS`, `WASM`, `polynomial domain`, `matrix domain`, `commitment layer`, or `proof compression` directly into the hero or primary visual narrative.
- The user-facing page should communicate this context indirectly through motion, composition, spatial rhythm, progressive transformation, material texture, and visual hierarchy.
- The symbol should feel like data becoming proof, not like a technical diagram from documentation.
- The design target is polished, modern, and refined. Direct or overly literal technical exposition should be treated as heavy-handed and avoided unless it appears in a dedicated developer resource area.

Design decision:

- Use the standard black proof-textured Tonigma logo as the brand anchor.
- Use the square symbol as the favicon, compact mobile brand mark, and diagram motif.
- Use the symbol's `2 -> 3 -> 2 -> 1` processing graph as the hidden structural grammar for visual composition, not as an annotated user-facing diagram.
- Use the blue/navy alternate wordmark only if a light navigation treatment is needed later.

### Visual System

Recommended overall tone:

- rigorous
- high-contrast
- security-conscious
- calm
- operationally transparent
- product-focused

Avoid:

- generic Web3 neon gradients
- purple/blue gradient-heavy hero sections
- anonymous hacker visuals
- vault/lock cliches
- abstract bokeh or decorative orbs
- claims that imply hidden exchange transfers or invisible token movement

Palette direction:

- Base: near-black and white, matching the strongest logo asset.
- Accent: controlled Tokamak/Tonigma blue for links, active states, focus rings, and proof highlights.
- Secondary neutrals: slate-gray text, off-white panels, and thin border lines for technical data areas.
- Warning or policy details: amber or muted red only where the copy needs risk, policy, or irreversible-action emphasis.

Texture direction:

- Use math/proof texture sparingly, derived from the logo's wordmark character. It can appear as a masked background texture in the hero or proof-state section.
- Use the symbol's processing graph lines and node geometry as the primary illustration grammar.
- Treat the graph as a refined transformation motif, not as decorative constellation art and not as a labeled engineering diagram.
- Suggest input, transformation, commitment, compression, and Ethereum-verifiable finality through visual progression rather than explicit labels.
- Use real product-like surfaces: observer dashboard snippets, policy snapshot panels, transaction/event rows, and channel state cards.

Layout direction:

- First viewport should clearly signal "Tonigma" through the brand mark and product name.
- The hero should not be a generic marketing slogan. It should show the product boundary: Ethereum public edge, proof verification, and private channel state.
- Keep the page closer to an infrastructure/product site than a narrative editorial site.
- Use dense but readable sections: operators and reviewers need facts, not only atmosphere.
- Even when the page is factual, it should avoid dumping protocol explanations into the main visual flow. Facts should be structured as clean product surfaces, short captions, or expandable/developer-oriented sections.
- Modern polish takes priority over literal completeness in the first viewport.

### Reference-Strengthened Design Direction

Reference pages reviewed:

- Succinct: `https://www.succinct.xyz/`
- RISC Zero: `https://risczero.com/`
- Aztec: `https://aztec.network/`
- Nexus: `https://nexus.xyz/`
- Saaspo black-and-white SaaS gallery: `https://saaspo.com/style/black-and-white`
- One Page Love black-and-white gallery: `https://onepagelove.com/color/black-and-white`

Reference conclusions:

- Succinct compresses a broad cryptography company into a short, memorable brand phrase and then supports it with product cards, solution surfaces, partner proof, and network-scale metrics. Tonigma should adopt the compression strategy, not the exact visual style.
- RISC Zero keeps the hero promise simple and centered on verifiability. Tonigma should similarly make verification feel inevitable and calm, not overloaded with protocol mechanics.
- Aztec uses expressive typography, privacy-layer language, and a strong editorial sequence. Tonigma can borrow the confidence and rhythmic sectioning, but should avoid Aztec's dramatic renaissance tone and avoid presenting Tonigma as one privacy network.
- Nexus is relevant as a financial/verifiable infrastructure reference. Tonigma should borrow the institution-grade restraint and avoid playful or speculative Web3 styling.
- Black-and-white SaaS galleries confirm that high-contrast, minimal palettes can still feel modern when supported by strong type scale, whitespace, subtle motion, and precise UI surfaces.

Reference translation for Tonigma:

- Use one compact brand statement above the fold. Do not explain everything immediately.
- Build trust through product surfaces: observer snippets, policy snapshot fragments, channel status indicators, and proof-state visual rhythm.
- Prefer a small number of large, confident sections over many cramped explanatory blocks.
- Use black/white as the identity field, with blue only for action, verification, and active state.
- Use typography and spacing to create sophistication. Avoid decoration that tries too hard to look technical.
- Make motion purposeful: nodes align, edges resolve, texture condenses, and the diamond endpoint settles. Do not use random particle fields.
- Let developer detail exist, but place it below the brand story as a resource surface.

### Visual Asset Quality Bar

Every image, animation, icon-like object, geometric object, background layer, and product illustration must meet a professional illustrator-level quality bar.

Required quality:

- Assets must feel intentionally art-directed, not generated as quick placeholders.
- Shapes must have clean geometry, consistent optical weight, and deliberate spacing.
- Motion must feel designed and restrained, with easing, timing, and hierarchy that match a premium infrastructure product.
- Illustration surfaces must use consistent lighting, contrast, blur, line weight, texture density, and depth rules.
- Product UI fragments must look like credible real interfaces, not random rectangles or fake code decoration.
- Any custom visual object must be aligned with the Tonigma symbol grammar, proof-textured wordmark, and black/white/blue visual system.

Strictly prohibited:

- low-resolution raster assets
- clip-art-like icons
- generic stock illustrations
- sloppy AI-generated imagery with malformed shapes, inconsistent typography, or visual artifacts
- random particle fields
- cheap glowing lines
- noisy gradient blobs
- mismatched icon styles
- childish, playful, or cartoonish objects
- decorative shapes that do not support the Tonigma concept
- placeholder illustrations that ship as final design

Asset acceptance rule:

- If a visual element does not look like it could have been produced by a skilled brand illustrator or motion designer, remove it or redesign it.
- Prefer fewer high-quality assets over many mediocre decorative pieces.
- Reuse and refine the official Tonigma logo, symbol geometry, proof texture, observer surfaces, and channel-state product motifs before introducing new visual languages.
- Any generated bitmap or illustration must be reviewed for detail quality, coherence, and brand fit before being used.
- Do not let technical implementation convenience justify weak visual design.

### Concrete Visual Plan

Hero composition:

- Full viewport-width black or near-black field.
- Tonigma wordmark and navigation sit on a restrained top rail with generous horizontal spacing.
- H1 is `Tonigma`; it should be large but not gimmicky.
- Supporting copy is limited to two short lines.
- Primary visual is an abstract Tonigma-symbol transformation flowing left to right.
- The `2 -> 3 -> 2 -> 1` rhythm is visible through node placement, but there are no labels explaining the layers.
- The diamond endpoint subtly catches light or sharpens into focus, implying Ethereum-verifiable finality without saying so directly in the visual.
- Add a thin observer/status strip near the lower hero edge: a few compact rows that look like accepted transitions, policy status, or channel health. These should feel like real product telemetry, not decorative code.
- The next section must peek above the fold on desktop and mobile so the page does not feel like a poster.

Background system:

- Use a multi-layer 2D background to create pseudo-3D depth.
- Do not use actual 3D, WebGL, Three.js, or perspective-heavy 3D objects for the landing page background.
- The effect should come from parallax: when the user scrolls up or down, each background layer moves at a different speed.
- Every parallax layer must be art-directed as a high-quality illustration layer, not assembled from generic decorative primitives.
- Layer 0: near-black base field with a very subtle noise texture.
- Layer 1: far field with faint grid or proof-texture marks, moving the slowest.
- Layer 2: mid field with thin Tonigma-symbol graph edges and low-opacity node traces.
- Layer 3: near field with a small number of sharper nodes, line segments, and the diamond endpoint motif, moving slightly faster.
- Layer 4: product surface layer, such as observer/status strips or policy fragments, moving independently but still subtly.
- Keep the depth effect understated. It should feel spatial and modern, not like a game scene or a sci-fi tunnel.
- Preserve the hidden `2 -> 3 -> 2 -> 1` rhythm across layers, but never expose it as text.
- On scroll down, far layers should drift minimally while near layers shift more noticeably. On scroll up, the motion should reverse smoothly.
- Use opacity, blur, scale, and vertical/horizontal offset sparingly to reinforce depth without creating visual clutter.
- Avoid bokeh, random particles, gradient orbs, starfields, and animated noise fields.
- Respect `prefers-reduced-motion`: disable scroll-linked movement and keep the layers as a static composed background.

Implementation guidance:

- Prefer CSS variables updated from scroll progress, CSS transforms, and lightweight React state.
- Use SVG or CSS backgrounds for graph layers; use canvas only if SVG performance is insufficient.
- Keep each layer `pointer-events: none` and isolated from content layout.
- Avoid layout reflow during scroll; animate only `transform` and `opacity`.
- The background must not reduce text contrast or overlap incoherently with hero copy, CTA buttons, or product surfaces.

Hero copy direction:

- Keep the H1 literal: `Tonigma`.
- Use one supporting line that positions Tonigma as a proof-backed app-channel surface.
- Avoid naming qap-compiler, Synthesizer, R1CS, WASM, or the symbol's layer count in hero copy.
- Primary CTA: `Open Observer`.
- Secondary CTA: `Explore DApps` or `Read Docs`.
- A tertiary developer link can appear as quiet text, not as a competing button.

Suggested hero copy candidates:

- `Proof-backed app channels with public boundaries and private state.`
- `A product surface for DApps that need verifiable execution and channel-local state.`
- `Build and use DApps where public edges stay accountable and private state stays scoped.`

Section design:

- `What Tonigma Is`: concise, typographic explanation with three compact statements: DApp-specific channels, Ethereum-anchored verification, DApp-defined privacy.
- `Public Edge / Private State`: two-column contrast section. The public side uses clear tables or event rows; the private side uses softer masked surfaces and local-key language. Keep it sober.
- `Example DApp Flow`: private-state note transfer appears as one example DApp. Present it as a horizontal product flow or stepper with restrained icons, not as the definition of Tonigma.
- `Underlying Proof Engine`: visual-only or near-visual section using the symbol's transformation motif. Copy should be minimal: "Tokamak zk-EVM turns execution into verifiable proof artifacts." Link out for technical details.
- `Proof And Policy`: dense operational section with policy snapshot cards, verifier status, and accepted transition indicators.
- `Observer And Mirror`: product UI section centered on `observer.tonigma.network`; emphasize accountability, recovery, and public boundary surfaces.
- `Developer / Operator Resources`: clean index of repos, docs, CLI, observer, and artifacts. This is where direct technical naming is acceptable.

Component language:

- Use panels only when they represent actual product surfaces or repeated resource cards.
- Avoid nested cards.
- Use thin borders, compact labels, and precise row spacing.
- Use icons only where they reduce text: observer, docs, GitHub, external link, status, shield/check, terminal.
- Use monospaced text sparingly for hashes, events, and command/resource references.
- Buttons should be minimal, high-contrast, and stable in size. No oversized pill clusters.

Motion and interaction:

- Hero graph animates once on load, then idles subtly.
- Scroll-linked background parallax is allowed, but it must remain a 2D multi-layer effect.
- Each background layer should have a distinct but restrained scroll speed to create pseudo-3D depth.
- Nodes should not bounce or behave playfully.
- Edges can draw in sequence from left to right.
- Proof texture can condense or sharpen as it approaches the diamond endpoint.
- Observer rows can tick gently or reveal a latest accepted state, but no fake high-frequency trading animation.
- Respect reduced-motion settings.

Typography:

- Use a strong modern sans for headings and UI.
- Use a mono font only for telemetry, hashes, and technical metadata.
- Avoid negative letter spacing and viewport-scaled typography.
- Do not imitate Aztec's broken-word styling directly; if expressive type is used, it must be subtle and brand-specific.

Page mood:

- More Succinct/RISC Zero confidence than crypto campaign page.
- More black-and-white product system than neon Web3 worldbuilding.
- More institutional infrastructure than anonymous privacy tool.
- More refined proof surface than raw engineering dashboard.

### Hero Direction

Hero objective:

Explain Tonigma in one screen as:

> Tonigma is the product surface for DApps that run in Tokamak Private App Channels: app-specific, proof-backed execution domains with Ethereum-anchored custody, proof acceptance, and public monitoring surfaces.

Possible headline directions:

- "Tonigma"
- "Private app channels with public proof boundaries"
- "Proof-backed app channels for TON and beyond"

Preferred H1:

**Tonigma**

Supporting copy should carry the explanation:

> Proof-backed application channels for DApps that need explicit public boundaries and channel-local state.

Primary CTA candidates:

- `Open Observer`
- `Explore DApps`

Secondary CTA candidates:

- `Read Docs`
- `View Contracts`
- `Install CLI`

Hero visual:

- A full-bleed or wide unframed system map using the Tonigma node symbol grammar.
- Show a left-to-right transformation inspired by the Tonigma symbol without labeling the internal compiler/proof stages.
- Keep the four visual layers legible as a subtle `2 -> 3 -> 2 -> 1` rhythm, matching the symbol, but avoid explaining the count on the page.
- Use the diamond proof node as a quiet Ethereum-verifiable output cue, not as a captioned Ethereum explainer.
- Include a small observer-style event strip to reinforce that Tonigma is not a black box.
- Do not put the main hero content inside a decorative card.

### Information Architecture

Initial landing page sections should be planned in this order:

1. Hero: brand, core promise, public/private boundary, primary CTAs.
2. What Tonigma Is: concise explanation of Private App Channels and Tonigma's DApp model.
3. Public Edge / Private State: side-by-side boundary model explaining what is public and what remains private.
4. Example DApp Flow: for the private-state note transfer DApp, explain join channel, deposit to bridge, mint notes, transfer notes, recover notes, redeem, and withdraw.
5. Underlying Proof Engine: present Tokamak zk-EVM as the engine behind Tonigma through elegant visual metaphor and concise product language, not by explaining the symbol's full technical mapping.
6. Proof And Policy: immutable channel policy, DApp metadata, verifier snapshots, proof-backed accepted transitions.
7. Observer And Mirror: link Tonigma's public observer and workspace mirror story to accountability and recovery.
8. User Control In Private-State: spending key, viewing key, wallet backup, selective disclosure, no master viewing key.
9. Developer / Operator Resources: contracts repo, CLI, observer, policy snapshot, deployment artifacts.
10. Risk And Boundary Notes: Tonigma is not a single privacy promise for every DApp; for the private-state note transfer DApp, it is not an exchange deposit network, TON remains transparent on Ethereum entry/exit, and private-state notes are channel-local application state.

### Copy Principles

Use:

- "proof-backed private application state"
- "public Ethereum bridge edge"
- "channel-local private-state notes"
- "user-controlled disclosure"
- "DApp-defined privacy model"
- "public observer surface"
- "immutable channel policy snapshot"
- "Ethereum-settled, validity-proven channels"

Avoid:

- "anonymous TON"
- "untraceable transfers"
- "private exchange deposits"
- "Tonigma hides all activity"
- "Tonigma turns TON into an anonymous asset"
- "Tokamak can reveal user histories"
- "operator-controlled privacy"
- literal symbol explanations in public copy
- compiler/package names in primary marketing sections
- long protocol paragraphs in the hero
- labels that turn the visual identity into an engineering flowchart

Required explanation:

Tonigma should repeatedly clarify that privacy behavior is DApp-specific. For the private-state note transfer DApp, public bridge entry and exit remain observable, while internal note ownership and provenance are private by design and controlled by user-held secrets.

Expression principle:

The landing page should make users feel the technical context before it explains it. The proof pipeline, compiler stack, and Ethereum-verifiable endpoint should be communicated through refined symbolic design, interaction, and pacing. Direct explanation belongs in developer links, documentation, tooltips for technical audiences, or lower-page reference sections, not in the primary brand story.

### Design Concept Summary

Tonigma should look like an accountable proof terminal and DApp surface, not a secret tunnel.

The landing page should combine:

- the black-and-white proof-textured brand identity
- a precise but understated Tokamak zk-EVM transformation motif based on the Tonigma symbol
- observer-style public event surfaces
- restrained blue accents for product affordances
- clear boundary language separating Tonigma's general DApp-channel model from the specific private-state note transfer DApp behavior

The result should make a first-time visitor understand that Tonigma is infrastructure for DApps running in proof-backed private app channels without forcing them through a literal protocol lecture. The private-state note transfer DApp does not turn TON itself into an anonymous asset; it lets self-custody users opt into a private-state DApp channel with channel-local note state.
