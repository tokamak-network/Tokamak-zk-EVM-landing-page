import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ParallaxBackground } from "../parallax-background";

export const metadata: Metadata = {
  title: "Vision | Tonigma",
  description:
    "Tonigma follows the cypherpunk belief that privacy must be built by individuals with cryptography and software.",
};

export default function VisionPage() {
  return (
    <main className="vision-page">
      <ParallaxBackground />

      <section className="section-shell vision-hero">
        <nav className="topbar" aria-label="Primary navigation">
          <Link className="brand-lockup" href="/" aria-label="Tonigma home">
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
          </Link>
          <div className="nav-actions" aria-label="Page navigation">
            <Link className="nav-link nav-link--active" href="/vision">
              Vision
            </Link>
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

        <div className="vision-hero__content">
          <span className="section-kicker">Vision</span>
          <h1>Privacy must be built, not granted.</h1>
          <p>
            Tonigma inherits the cypherpunk conviction that an open electronic
            society needs privacy, and that privacy is created by people who
            write and run software.
          </p>
          <a
            className="vision-source"
            href="https://www.activism.net/cypherpunk/manifesto.html"
            rel="noreferrer"
            target="_blank"
          >
            Read A Cypherpunk&apos;s Manifesto
            <ArrowUpRight aria-hidden="true" size={16} />
          </a>
        </div>
      </section>

      <section
        aria-labelledby="origin-title"
        className="section-shell compact-section vision-grid"
      >
        <div className="vision-statement">
          <span className="section-kicker">The origin</span>
          <h2 id="origin-title">A software movement, not a slogan.</h2>
          <p>
            On March 9, 1993, Eric Hughes published A Cypherpunk&apos;s
            Manifesto. Its claim was simple and still uncomfortable: open
            electronic societies need privacy, and privacy will not be handed
            down by governments, companies, or benevolent platforms.
          </p>
        </div>

        <blockquote className="vision-quote">
          <p>Cypherpunks write code.</p>
          <cite>Eric Hughes, 1993</cite>
        </blockquote>
      </section>

      <section
        aria-labelledby="privacy-title"
        className="section-shell compact-section vision-grid"
      >
        <div className="vision-statement">
          <span className="section-kicker">The principle</span>
          <h2 id="privacy-title">Not secrecy. Selective disclosure.</h2>
        </div>
        <div className="vision-copy">
          <p>
            The manifesto separates privacy from secrecy. Secrecy hides
            everything. Privacy lets a person decide what to reveal, to whom,
            and for what purpose.
          </p>
          <p>
            A buyer should not have to disclose a complete identity just to
            transact. A speaker should not have to leak every relationship just
            to participate. The point is not to disappear. The point is to
            choose what becomes public.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="context-title"
        className="section-shell compact-section vision-grid"
      >
        <div className="vision-statement">
          <span className="section-kicker">The context</span>
          <h2 id="context-title">1993 was not accidental.</h2>
        </div>
        <div className="vision-timeline">
          <article className="vision-timeline__item">
            <span className="vision-timeline__date">1991-1993</span>
            <div>
              <h3>The Crypto Wars became explicit.</h3>
              <p>
                Governments argued that strong cryptography needed controls,
                export limits, and exceptional access. Civil liberties groups
                and engineers argued that strong cryptography was essential to
                free expression and privacy.
              </p>
            </div>
          </article>
          <article className="vision-timeline__item">
            <span className="vision-timeline__date">Mar 9, 1993</span>
            <div>
              <h3>The manifesto named the responsibility.</h3>
              <p>
                Cypherpunks were not waiting for permission. They were building
                anonymous systems, encryption, remailers, digital signatures,
                and electronic money because software could protect freedoms
                that policy alone could not secure.
              </p>
            </div>
          </article>
          <article className="vision-timeline__item">
            <span className="vision-timeline__date">Apr 16, 1993</span>
            <div>
              <h3>The Clipper Chip made the tension public.</h3>
              <p>
                The White House announced a key-escrow encryption initiative:
                encrypted communication would exist, but with a government
                access path preserved. The manifesto belonged to this wider
                moment of surveillance anxiety, email, PGP, and a commercial
                internet coming online.
              </p>
            </div>
          </article>
        </div>
      </section>

      <section
        aria-labelledby="lineage-title"
        className="section-shell compact-section vision-grid"
      >
        <div className="vision-statement">
          <span className="section-kicker">The lineage</span>
          <h2 id="lineage-title">From cypherpunk code to public networks.</h2>
        </div>
        <div className="vision-copy">
          <p>
            The lineage did not stop at remailers and PGP. Digital signatures,
            electronic cash, anonymous transaction systems, censorship
            resistance, and software that is difficult to shut down became the
            vocabulary of later public networks.
          </p>
          <p>
            Bitcoin did not copy the manifesto line by line, but it inherited
            the question: can open software replace trusted intermediaries with
            cryptographic verification?
          </p>
        </div>
      </section>

      <section
        aria-labelledby="tonigma-takes-title"
        className="section-shell compact-section"
      >
        <span className="section-kicker">What Tonigma takes from it</span>
        <h2 id="tonigma-takes-title">Privacy is an engineering responsibility.</h2>
        <div className="vision-principles">
          <article className="vision-principle">
            <h3>Run locally.</h3>
            <p>
              Users should not outsource every action to a server that can
              observe everything.
            </p>
          </article>
          <article className="vision-principle">
            <h3>Prove selectively.</h3>
            <p>
              Public verification should not require public exposure of every
              app detail.
            </p>
          </article>
          <article className="vision-principle">
            <h3>Settle publicly.</h3>
            <p>
              Ethereum can verify and settle accepted updates without becoming
              a diary of every private action.
            </p>
          </article>
          <article className="vision-principle">
            <h3>Build the tool.</h3>
            <p>
              Privacy is not a request. It is software, cryptography, and
              systems design made real.
            </p>
          </article>
        </div>
      </section>

      <section className="section-shell vision-closing">
        <h2>Ethereum verification without public exhaust.</h2>
        <p>
          Tonigma is our answer to that responsibility: privacy channels for
          people who want Ethereum&apos;s public verification without turning
          their whole digital life into a permanent public record.
        </p>
      </section>
    </main>
  );
}
