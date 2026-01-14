export type SolutionStatus = "available" | "coming-soon";

export type SolutionContent = {
  slug: string;
  number: string;
  navTitle: string;
  pageTitle: string;
  tagline: string;
  description: string;
  status: SolutionStatus;
  iconType: "zap" | "layers" | "key" | "shield";
  seo: {
    title: string;
    description: string;
  };
  page: {
    hero: {
      eyebrow: string;
      headline: string;
      subheadline: string;
    };
    sections: Array<{
      title: string;
      body: string;
      bullets?: string[];
    }>;
    links: {
      primaryLabel: string;
      primaryHref: string;
      secondaryLabel?: string;
      secondaryHref?: string;
    };
    video?: {
      title: string;
      youtubeId: string;
    };
  };
};

/**
 * IMPORTANT
 * Visible content on solution pages intentionally avoids the hyphen character.
 * Use spaces instead, for example "zk EVM" not "zk EVM".
 */
export const SOLUTIONS: SolutionContent[] = [
  {
    slug: "private-channels",
    number: "01",
    navTitle: "Private App Channels",
    pageTitle: "Tokamak Private App Channels",
    tagline: "Your own private execution lane",
    description:
      "Autonomous, private, and independent Layer 2 channels created, operated, and closed by users. Ethereum only sees state roots and zero knowledge proofs.",
    status: "coming-soon",
    iconType: "shield",
    seo: {
      title: "Tokamak Private App Channels",
      description:
        "Build private Layer 2 app channels with Ethereum verified state roots and zero knowledge proofs. Keep sensitive activity private while inheriting Ethereum security.",
    },
    page: {
      hero: {
        eyebrow: "Solution 01",
        headline: "Private App Channels for Ethereum",
        subheadline:
          "Autonomous, private, and independent Layer 2 channels created, operated, and closed by users. Ethereum only sees state roots and zero knowledge proofs.",
      },
      sections: [
        {
          title: "What it is",
          body:
            "Autonomous, private, and independent Layer 2 channels created, operated, and closed by users. Ethereum only sees state roots and zero knowledge proofs, keeping your application activity confidential while inheriting Ethereum security.",
          bullets: [
            "User controlled channel lifecycle",
            "Hidden transactions and private execution",
            "Application isolation with Ethereum verified state",
          ],
        },
        {
          title: "Why it matters",
          body:
            "Many on chain apps leak intent, amounts, and counterparties. Private channels help teams build experiences where users can interact without exposing every action to the public mempool.",
          bullets: [
            "Reduce information leakage",
            "Improve user experience for privacy first apps",
            "Preserve Ethereum security guarantees",
          ],
        },
        {
          title: "Ideal use cases",
          body:
            "Private channels are a strong fit for apps where confidentiality is a product requirement, not an optional add on.",
          bullets: [
            "Trading strategies and private order flow",
            "Gaming actions and hidden state",
            "Enterprise workflows and internal settlement",
          ],
        },
      ],
      links: {
        primaryLabel: "Explore the code on GitHub",
        primaryHref: "https://github.com/tokamak-network/Tokamak-zkp-channel-manager",
      },
    },
  },
  {
    slug: "zk-evm",
    number: "02",
    navTitle: "zk EVM",
    pageTitle: "Tokamak zk EVM",
    tagline: "Ethereum compatible zero knowledge rollup",
    description:
      "Affordable on chain verification with low proving overhead so you can generate zero knowledge proofs even on a gaming laptop. Full EVM compatibility with Ethereum security.",
    status: "available",
    iconType: "layers",
    seo: {
      title: "Tokamak zk EVM",
      description:
        "Affordable on chain verification with low proving overhead. Generate zero knowledge proofs even on a gaming laptop with full EVM compatibility and Ethereum security.",
    },
    page: {
      hero: {
        eyebrow: "Solution 02",
        headline: "Ethereum compatible zk EVM",
        subheadline:
          "Affordable on chain verification with low proving overhead so you can generate zero knowledge proofs even on a gaming laptop. Full EVM compatibility with Ethereum security.",
      },
      sections: [
        {
          title: "What it is",
          body:
            "Tokamak zk EVM is a proving toolchain that turns transaction execution into zero knowledge proofs with low proving overhead. Generate proofs on approachable hardware while maintaining full EVM compatibility and Ethereum security guarantees.",
          bullets: [
            "Low proving overhead for practical hardware",
            "Gaming laptop capable proof generation",
            "Full EVM compatibility",
          ],
        },
        {
          title: "Why it matters",
          body:
            "Affordable on chain verification with low proving overhead means you can generate zero knowledge proofs even on a gaming laptop. Scale your dApps with Ethereum grade security without requiring specialized infrastructure.",
          bullets: [
            "Strong verification on Ethereum",
            "Lower cost verification compared to full execution",
            "Approachable hardware requirements",
          ],
        },
        {
          title: "How teams use it",
          body:
            "Most teams start by installing the toolchain, synthesizing inputs from a transaction config, preprocessing, and then proving. Deploy existing Solidity contracts without modification.",
          bullets: [
            "Install and compile circuits",
            "Synthesize inputs from a config file",
            "Deploy existing Solidity contracts unchanged",
          ],
        },
      ],
      links: {
        primaryLabel: "Explore the code on GitHub",
        primaryHref: "https://github.com/tokamak-network/Tokamak-zk-EVM",
        secondaryLabel: "Browse Tokamak L2JS",
        secondaryHref: "https://github.com/tokamak-network/TokamakL2JS",
      },
      video: {
        title: "Tokamak zk EVM demo",
        youtubeId: "UCDVLpwayCI",
      },
    },
  },
  {
    slug: "threshold-signature",
    number: "03",
    navTitle: "Threshold Signatures",
    pageTitle: "Threshold Signature App",
    tagline: "Shared control, single signature",
    description:
      "Minimal signer interaction, eliminating the need for all participants to be online at the same time. On chain it appears as a single signature, compatible with existing wallets and protocols.",
    status: "coming-soon",
    iconType: "key",
    seo: {
      title: "Threshold Signature App",
      description:
        "Minimal signer interaction with threshold authorization. No need for all participants to be online at the same time. On chain it appears as a single signature.",
    },
    page: {
      hero: {
        eyebrow: "Solution 03",
        headline: "Threshold signatures for shared key control",
        subheadline:
          "Minimal signer interaction, eliminating the need for all participants to be online at the same time. On chain it appears as a single signature, compatible with existing wallets and protocols.",
      },
      sections: [
        {
          title: "What it is",
          body:
            "Securely share control of critical keys with minimal signer interaction, eliminating the need for all participants to be online at the same time. On chain it appears as a single standard signature, compatible with existing wallets and protocols.",
          bullets: [
            "Async signing with minimal interaction",
            "Threshold authorization (M of N)",
            "Wallet and protocol compatible",
          ],
        },
        {
          title: "Why it matters",
          body:
            "Minimal signer interaction means participants do not need to be online at the same time. Threshold signing reduces single key risk while keeping the verification story straightforward on chain.",
          bullets: [
            "Reduce key compromise risk",
            "Enable shared approvals for critical actions",
            "No coordination overhead for signing",
          ],
        },
        {
          title: "Ideal use cases",
          body:
            "Threshold signatures fit any workflow where operational security and shared governance are required without forcing synchronous participation.",
          bullets: [
            "Treasury control for teams and DAOs",
            "Secure deployment keys and admin actions",
            "Cross organization approvals and custody flows",
          ],
        },
      ],
      links: {
        primaryLabel: "Explore Tokamak FROST on GitHub",
        primaryHref: "https://github.com/tokamak-network/threshold-signature-Frost",
      },
    },
  },
  {
    slug: "zk-snark",
    number: "04",
    navTitle: "zk SNARK",
    pageTitle: "Tokamak zk SNARK",
    tagline: "Modular ZK circuits like FPGA",
    description:
      "Build bespoke zk SNARK circuits like an FPGA: snap together pre verified building blocks to skip huge RAM circuits and eliminate per app setup. Faster proofs, faster iteration.",
    status: "available",
    iconType: "zap",
    seo: {
      title: "Tokamak zk SNARK",
      description:
        "Build bespoke zk SNARK circuits like an FPGA. Snap together pre verified building blocks to skip huge RAM circuits and eliminate per app setup for faster proofs.",
    },
    page: {
      hero: {
        eyebrow: "Solution 04",
        headline: "Modular zk SNARK circuits",
        subheadline:
          "Build bespoke zk SNARK circuits like an FPGA: snap together pre verified building blocks to skip huge RAM circuits and eliminate per app setup. Faster proofs, faster iteration.",
      },
      sections: [
        {
          title: "What it is",
          body:
            "Build bespoke zk SNARK circuits like an FPGA: snap together pre verified building blocks to skip huge RAM circuits and eliminate per app setup. This modular approach enables faster proofs and faster iteration for builders.",
          bullets: [
            "Modular pre verified building blocks",
            "No per app trusted setup",
            "Skip huge RAM circuits",
          ],
        },
        {
          title: "Why it matters",
          body:
            "Snap together pre verified building blocks to skip huge RAM circuits and eliminate per app setup. Faster proofs and faster iteration mean you can validate circuits and verification on Ethereum earlier in the product cycle.",
          bullets: [
            "Faster prototyping for zero knowledge apps",
            "Eliminate per app trusted setup ceremonies",
            "Clear path from circuits to on chain verification",
          ],
        },
        {
          title: "Ideal use cases",
          body:
            "This solution is best for builders who want to compose zk SNARK primitives rapidly without building from scratch or running costly setup ceremonies.",
          bullets: [
            "Rapid circuit prototyping and composition",
            "Production proof pipelines with modular blocks",
            "Developer education and research",
          ],
        },
      ],
      links: {
        primaryLabel: "Explore SNARK tooling on GitHub",
        primaryHref: "https://github.com/tokamak-network/python-snarks",
        secondaryLabel: "Trusted setup tooling",
        secondaryHref: "https://github.com/tokamak-network/SNARK-MPC-setup",
      },
    },
  },
];

export function getSolutionBySlug(slug: string): SolutionContent | undefined {
  return SOLUTIONS.find((s) => s.slug === slug);
}


