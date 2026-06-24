import { ArrowRight } from "lucide-react";
import Image from "next/image";
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

        <div className="hero-copy" id="top">
          <span className="section-kicker">Validity-proven app channels</span>
          <h1>Tonigma</h1>
          <p>
            A product surface for DApps that need public proof boundaries,
            observable policy, and Ethereum-settled verification.
          </p>
          <div className="hero-actions">
            <DisabledAction>Explore DApps</DisabledAction>
          </div>
        </div>
      </section>

      <section className="section-shell compact-section">
        <span className="section-kicker">What Tonigma is</span>
        <h2>App-specific proof channels with public verification edges.</h2>
        <div className="compact-grid">
          <p>
            Tonigma presents DApps as validity-proven channels with explicit
            public boundaries for policy, proof acceptance, and settlement.
          </p>
          <p>
            Ethereum remains the public anchor for custody and verification,
            while each DApp defines its own channel behavior and disclosure
            model.
          </p>
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
