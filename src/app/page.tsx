import { ArrowRight, Eye, Repeat2, ShieldCheck } from "lucide-react";
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
        aria-labelledby="ethereum-verification-title"
      >
        <div className="story-copy">
          <span className="section-kicker">Ethereum verification</span>
          <h2 id="ethereum-verification-title">
            Strong security comes from everyone being able to check the same
            public state.
          </h2>
          <p>
            Ethereum anchors applications with deep decentralization, security,
            and immutability. That strength comes from a public verification
            model: participants can observe activity, re-execute the work, and
            reject invalid state.
          </p>
          <p>
            The tradeoff is privacy. As more independent participants verify
            the same activity, more of that activity is exposed to the public
            network.
          </p>
          <div className="story-points" aria-label="Ethereum tradeoff signals">
            <div className="story-point">
              <ShieldCheck aria-hidden="true" size={20} />
              <span>Decentralized verification hardens security.</span>
            </div>
            <div className="story-point">
              <Repeat2 aria-hidden="true" size={20} />
              <span>Nodes observe and re-execute public activity.</span>
            </div>
            <div className="story-point story-point--warning">
              <Eye aria-hidden="true" size={20} />
              <span>More public validation also means more privacy exposure.</span>
            </div>
          </div>
        </div>
        <div className="story-stage" aria-hidden="true">
          <EthereumLogoOrbit />
        </div>
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
