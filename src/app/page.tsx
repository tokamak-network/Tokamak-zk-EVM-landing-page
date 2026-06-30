import {
  ArrowRight,
  CircleQuestionMark,
  Eye,
  LockKeyhole,
  Network,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import { EthereumLogoOrbit } from "./ethereum-logo-orbit";
import { ParallaxBackground } from "./parallax-background";
import { TonigmaNetworkLogo } from "./tonigma-network-logo";

function DisabledAction({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <button className="action" disabled type="button">
      {children}
      <ArrowRight aria-hidden="true" size={16} />
    </button>
  );
}

export default function Home() {
  return (
    <main>
      <ParallaxBackground />

      <section className="hero section-shell">
        <nav className="topbar" aria-label="Primary navigation">
          <a className="brand-lockup" href="#top" aria-label="Tonigma home">
            <Image
              alt="Tonigma"
              className="brand-logo"
              fill
              priority
              sizes="(max-width: 760px) 42px, 202px"
              src="/brand/tonigma-logo.png"
            />
            <Image
              alt="Tonigma"
              className="brand-symbol"
              height={42}
              priority
              src="/brand/tonigma-square-logo.svg"
              width={42}
            />
          </a>
          <div className="nav-actions" aria-label="Inactive page actions">
            <button className="nav-link" disabled type="button">
              Observer
            </button>
            <button className="nav-link" disabled type="button">
              DApps
            </button>
            <button className="nav-link" disabled type="button">
              Docs
            </button>
          </div>
        </nav>

        <div className="hero-stage">
          <div className="hero-copy" id="top">
            <span className="section-kicker">Privacy channels for Ethereum</span>
            <h1 className="hero-wordmark" aria-label="Tonigma">
              <Image
                alt=""
                aria-hidden="true"
                height={571}
                priority
                sizes="(max-width: 760px) calc(100vw - 32px), 620px"
                src="/brand/tonigma-letter-logo-transparent.png"
                width={2757}
              />
            </h1>
            <p className="hero-lines">
              <span>Run decentralized apps on your own device.</span>
              <span>Generate your own proofs.</span>
              <span>Verify on Ethereum.</span>
            </p>
            <div className="hero-actions">
              <DisabledAction>Explore DApps</DisabledAction>
              <DisabledAction>See How It Works</DisabledAction>
            </div>
          </div>
          <TonigmaNetworkLogo />
        </div>
      </section>

      <section
        className="section-shell compact-section story-section ethereum-orbit-section"
        aria-labelledby="ethereum-strengths-title"
      >
        <div className="story-copy">
          <span className="section-kicker">Why Ethereum?</span>
          <h2 id="ethereum-strengths-title">
            Security by Decentralization
          </h2>
          <p>
            Ethereum has no centralized single operator. It runs on a
            decentralized network of independent nodes. The more nodes verify
            the same state, the harder the network is to corrupt.
          </p>
          <div className="story-points" aria-label="Ethereum strength signals">
            <div className="story-point">
              <Network aria-hidden="true" size={20} />
              <span>Decentralization removes single points of control.</span>
            </div>
            <div className="story-point">
              <ShieldCheck aria-hidden="true" size={20} />
              <span>Security is reinforced by broad independent validation.</span>
            </div>
            <div className="story-point">
              <LockKeyhole aria-hidden="true" size={20} />
              <span>Immutability protects settled application state.</span>
            </div>
          </div>
        </div>
        <div className="story-stage" aria-hidden="true">
          <EthereumLogoOrbit variant="strength" />
        </div>
      </section>

      <section
        className="section-shell compact-section story-section story-section--tradeoff ethereum-orbit-section"
        aria-labelledby="ethereum-tradeoff-title"
      >
        <div className="story-copy">
          <span className="section-kicker">We Want Privacy on Ethereum</span>
          <h2 id="ethereum-tradeoff-title">
            Transparency for Security, Not Privacy
          </h2>
          <p>
            Ethereum is public by design. Anyone can see what users do. That
            openness helps keep Ethereum secure. But it leaves users without
            privacy. Tonigma starts from this problem.
          </p>
          <div className="story-points" aria-label="Ethereum tradeoff signals">
            <div className="story-point story-point--danger">
              <Eye aria-hidden="true" size={20} />
              <span>Wallet activity is visible to everyone.</span>
            </div>
            <div className="story-point">
              <RotateCcw aria-hidden="true" size={20} />
              <span>
                Replaying every wallet action strengthens security.
              </span>
            </div>
            <div className="story-point story-point--question">
              <CircleQuestionMark aria-hidden="true" size={20} />
              <span>Is replaying every wallet action necessary for security?</span>
            </div>
          </div>
        </div>
        <div className="story-stage" aria-hidden="true">
          <EthereumLogoOrbit variant="tradeoff" />
        </div>
      </section>

      <section
        className="section-shell compact-section story-section story-section--solution ethereum-orbit-section"
        aria-labelledby="tonigma-solution-title"
      >
        <div className="story-copy">
          <span className="section-kicker">PRIVACY SOLUTION</span>
          <h2 id="tonigma-solution-title">
            SELECTIVE-DISCLOSURE WITH TONIGMA
          </h2>
          <p>
            Tonigma brings selective disclosure to Ethereum. Users choose what
            to reveal. Apps keep the rest private. Ethereum still verifies what
            matters.
          </p>
          <div className="story-points" aria-label="Tonigma solution signals">
            <div className="story-point">
              <Eye aria-hidden="true" size={20} />
              <span>Users choose what becomes public.</span>
            </div>
            <div className="story-point">
              <LockKeyhole aria-hidden="true" size={20} />
              <span>Private channels keep wallet activity hidden.</span>
            </div>
            <div className="story-point">
              <ShieldCheck aria-hidden="true" size={20} />
              <span>Ethereum still verifies what matters.</span>
            </div>
          </div>
        </div>
        <div className="story-stage story-stage--empty" aria-hidden="true" />
      </section>

      <section className="section-shell compact-section example-section">
        <span className="section-kicker">Example DApp</span>
        <h2>
          <code>private-state</code> is one Tonigma DApp, not the Tonigma brand.
        </h2>
        <p>
          The <code>private-state</code> note transfer DApp lets users opt into a
          DApp-specific channel for channel-local note behavior, with public
          Ethereum entry and exit remaining visible at the boundary.
        </p>
      </section>
    </main>
  );
}
