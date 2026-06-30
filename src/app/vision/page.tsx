import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { ParallaxBackground } from "../parallax-background";
import { SiteHeader } from "../site-header";

export const metadata: Metadata = {
  title: "Vision | Tonigma",
  description:
    "Tonigma carries the cypherpunk belief into Ethereum: privacy must be built with cryptography and open-source software.",
};

const beliefs = [
  {
    title: "Privacy is selective disclosure.",
    body: "Not disappearance. Not secrecy. The ability to decide what becomes public.",
  },
  {
    title: "Trust is not a privacy model.",
    body: "Governments, companies, and platforms should not be the only line of defense.",
  },
  {
    title: "Code is the user's leverage.",
    body: "Cryptography and open-source software can give individuals power that policy alone cannot.",
  },
];

export default function VisionPage() {
  return (
    <main className="vision-page">
      <ParallaxBackground />

      <header className="section-shell vision-header">
        <SiteHeader visionActive />
      </header>

      <article className="section-shell vision-manifesto">
        <header className="vision-manifesto__intro">
          <h1>Privacy: Built, Not Granted</h1>
          <p>
            Tonigma exists for people who want Ethereum&apos;s public
            verification without making every action public exhaust.
          </p>
        </header>

        <blockquote className="vision-manifesto__quote">
          <p>Cypherpunks write code.</p>
          <cite>Eric Hughes, 1993</cite>
        </blockquote>

        <p className="vision-bridge">
          We inherit that attitude: do not wait for privacy to be granted.
          Build the systems that make it possible.
        </p>

        <section className="vision-beliefs" aria-labelledby="beliefs-title">
          <h2 id="beliefs-title">What we believe</h2>
          <div className="vision-beliefs__list">
            {beliefs.map((belief) => (
              <article className="vision-belief" key={belief.title}>
                <h3>{belief.title}</h3>
                <p>{belief.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="vision-note" aria-labelledby="history-title">
          <h2 id="history-title">Historical note</h2>
          <p>
            Eric Hughes published A Cypherpunk&apos;s Manifesto on March 9,
            1993, during the early Crypto Wars. One month later, on April 16,
            1993, the White House announced the Clipper Chip initiative, a
            key-escrow encryption proposal that made the conflict over strong
            cryptography publicly visible.
          </p>
          <p>
            The manifesto was not only a reaction to one policy. It came from a
            broader moment shaped by surveillance concerns, email, PGP, internet
            commercialization, digital signatures, remailers, and early
            electronic money.
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
        </section>
      </article>
    </main>
  );
}
