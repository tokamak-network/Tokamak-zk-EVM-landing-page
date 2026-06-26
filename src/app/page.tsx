import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { EthereumLogoOrbit } from "./ethereum-logo-orbit";
import { ParallaxBackground } from "./parallax-background";

function DisabledAction({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <button className="action action--secondary" disabled type="button">
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
                height={371}
                priority
                sizes="(max-width: 760px) calc(100vw - 32px), 620px"
                src="/brand/tonigma-wordmark-white.svg"
                width={2558}
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
          <EthereumLogoOrbit />
        </div>
      </section>

      <section className="section-shell compact-section">
        <span className="section-kicker">What Tonigma is</span>
        <h2>A channel between your device and Ethereum.</h2>
        <ol className="flow-diagram" aria-label="Tonigma execution flow">
          <li>
            <span className="flow-step__index">01</span>
            <strong>Your device</strong>
            <span>Run the app locally.</span>
          </li>
          <li>
            <span className="flow-step__index">02</span>
            <strong>Your proof</strong>
            <span>Create evidence of the run.</span>
          </li>
          <li>
            <span className="flow-step__index">03</span>
            <strong>Ethereum</strong>
            <span>Verify the result.</span>
          </li>
        </ol>
        <p className="section-note">
          Tonigma helps Ethereum apps keep more app work on the user's device
          while publishing the proof needed for public verification.
        </p>
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
