import {
  Activity,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircleDashed,
  Diamond,
  Eye,
  FileCode2,
  GitBranch,
  KeyRound,
  Layers3,
  LockKeyhole,
  MonitorUp,
  RadioTower,
  Route,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import Image from "next/image";
import { ParallaxBackground } from "./parallax-background";

const publicRows = [
  ["Bridge edge", "ETH-visible"],
  ["Channel join", "policy 0x04"],
  ["Accepted state", "0x8e41...d19a"],
  ["Nullifier set", "public index"],
  ["Withdrawal", "settled"],
];

const privateRows = [
  ["Note ownership", "User-held secrets"],
  ["Transfer meaning", "Channel-local"],
  ["Note provenance", "Not public by default"],
  ["Disclosure", "User-controlled"],
];

const dappFlow = [
  {
    title: "Enter a channel",
    text: "A user joins a DApp-specific channel and funds the public bridge edge.",
  },
  {
    title: "Mint private-state notes",
    text: "Inside the DApp, deposits can become channel-local notes instead of public account rows.",
  },
  {
    title: "Transfer inside the app",
    text: "Recipients receive encrypted note delivery events while public observers see accepted state progress.",
  },
  {
    title: "Recover or disclose",
    text: "Viewing keys and backups support recovery and selective disclosure without a master viewing key.",
  },
  {
    title: "Redeem and exit",
    text: "Notes can be redeemed through the DApp flow before withdrawal returns to the public boundary.",
  },
];

const policySignals = [
  ["Policy snapshot", "immutable"],
  ["Verifier version", "v2.1 pinned"],
  ["DApp metadata", "registered"],
  ["Accepted root", "0x44b7...a02c"],
];

const observerRows = [
  ["channel_id", "tonigma:private-state", "registry"],
  ["policy_snapshot", "sealed at 0x04", "observer"],
  ["transition_accepted", "0x8e41...d19a", "proof"],
  ["nullifier_count", "128 indexed", "public"],
  ["mirror_sync", "current", "mirror"],
];

const resources = [
  {
    icon: GitBranch,
    title: "Contracts",
    text: "Bridge custody, channel registration, policy state, and settlement interfaces.",
  },
  {
    icon: FileCode2,
    title: "CLI",
    text: "Operator workflow for synthesis, preprocessing, proving, verification, and proof bundles.",
  },
  {
    icon: MonitorUp,
    title: "Observer",
    text: "Public event, policy, verifier, and accepted-transition surfaces.",
  },
  {
    icon: BookOpen,
    title: "Developer notes",
    text: "Technical integration paths for DApps that need proof-backed channel state.",
  },
];

function DisabledAction({
  children,
  variant = "primary",
}: Readonly<{
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "text";
}>) {
  return (
    <button className={`action action--${variant}`} disabled type="button">
      {children}
      {variant !== "text" ? <ArrowRight aria-hidden="true" size={16} /> : null}
    </button>
  );
}

function BoundaryColumn({
  title,
  label,
  rows,
  privateSide = false,
}: Readonly<{
  title: string;
  label: string;
  rows: string[][];
  privateSide?: boolean;
}>) {
  return (
    <section className={`boundary-column ${privateSide ? "is-private" : ""}`}>
      <div>
        <span className="section-kicker">{label}</span>
        <h3>{title}</h3>
      </div>
      <div className="boundary-table">
        {rows.map(([name, state]) => (
          <div className="boundary-row" key={name}>
            <span>{name}</span>
            <strong>{state}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function TransformationMap() {
  return (
    <div className="proof-map" aria-hidden="true">
      <div className="proof-texture proof-texture--hero" />
      <svg viewBox="0 0 860 360" role="img">
        <defs>
          <linearGradient id="edge" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#f7f7f2" stopOpacity="0.15" />
            <stop offset="52%" stopColor="#1f8fff" stopOpacity="0.62" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.92" />
          </linearGradient>
        </defs>
        <path className="map-edge" d="M126 128 L306 82 L492 128 L704 180" />
        <path className="map-edge" d="M126 232 L306 180 L492 232 L704 180" />
        <path className="map-edge soft" d="M126 128 L306 180 L492 232" />
        <path className="map-edge soft" d="M126 232 L306 278 L492 128" />
        <path className="map-edge fine" d="M306 82 L492 232" />
        <path className="map-edge fine" d="M306 278 L492 128" />
        {[126, 126].map((x, index) => (
          <circle
            className="map-node input"
            cx={x}
            cy={index === 0 ? 128 : 232}
            key={`input-${index}`}
            r="18"
          />
        ))}
        {[82, 180, 278].map((y) => (
          <circle className="map-node expanded" cx="306" cy={y} key={y} r="14" />
        ))}
        {[128, 232].map((y) => (
          <circle className="map-node committed" cx="492" cy={y} key={y} r="16" />
        ))}
        <path className="map-diamond" d="M704 140 L744 180 L704 220 L664 180 Z" />
      </svg>
      <div className="telemetry-strip">
        <div>
          <span>accepted state</span>
          <strong>0x8e41...d19a</strong>
        </div>
        <div>
          <span>verifier</span>
          <strong>v2.1 pinned</strong>
        </div>
        <div>
          <span>bridge edge</span>
          <strong>observable</strong>
        </div>
      </div>
    </div>
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
              sizes="(max-width: 760px) 176px, 202px"
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
            <DisabledAction variant="text">Observer</DisabledAction>
            <DisabledAction variant="text">DApps</DisabledAction>
            <DisabledAction variant="text">Docs</DisabledAction>
          </div>
        </nav>

        <div className="hero-grid" id="top">
          <div className="hero-copy">
            <span className="section-kicker">Transparent boundary, private state</span>
            <h1>Tonigma</h1>
            <p>
              Proof-backed application channels for DApps that need explicit
              public boundaries and channel-local private state.
            </p>
            <div className="hero-actions">
              <DisabledAction>Open Observer</DisabledAction>
              <DisabledAction variant="secondary">Explore DApps</DisabledAction>
            </div>
          </div>

          <TransformationMap />
        </div>

        <div className="hero-status" aria-label="Observer-style status preview">
          <div>
            <Activity size={16} aria-hidden="true" />
            <span>channel id</span>
            <strong>private-state</strong>
          </div>
          <div>
            <ShieldCheck size={16} aria-hidden="true" />
            <span>latest proof</span>
            <strong>accepted 0x8e41</strong>
          </div>
          <div>
            <RadioTower size={16} aria-hidden="true" />
            <span>mirror sync</span>
            <strong>current</strong>
          </div>
        </div>
      </section>

      <section className="section-shell intro-section">
        <div className="section-heading">
          <span className="section-kicker">What Tonigma is</span>
          <h2>A product surface for DApp-specific private app channels.</h2>
        </div>
        <div className="statement-grid">
          <article>
            <Layers3 aria-hidden="true" size={24} />
            <h3>DApp-specific channels</h3>
            <p>
              Each channel belongs to one registered DApp and keeps its own
              channel state commitment.
            </p>
          </article>
          <article>
            <Diamond aria-hidden="true" size={24} />
            <h3>Ethereum-anchored verification</h3>
            <p>
              Ethereum remains the canonical place for custody, proof
              verification, settlement, and public boundary events.
            </p>
          </article>
          <article>
            <LockKeyhole aria-hidden="true" size={24} />
            <h3>DApp-defined privacy</h3>
            <p>
              Privacy behavior is scoped by each DApp rather than promised as
              one universal property of the Tonigma brand.
            </p>
          </article>
        </div>
      </section>

      <section className="section-shell boundary-section">
        <div className="section-heading">
          <span className="section-kicker">Public edge / private state</span>
          <h2>Public accountability where it matters, private state where the DApp defines it.</h2>
        </div>
        <div className="boundary-grid">
          <BoundaryColumn
            label="Public boundary"
            rows={publicRows}
            title="What observers can follow"
          />
          <BoundaryColumn
            label="Channel state"
            privateSide
            rows={privateRows}
            title="What stays scoped inside the app"
          />
        </div>
      </section>

      <section className="section-shell flow-section">
        <div className="section-heading">
          <span className="section-kicker">Example DApp</span>
          <h2>Private-state note transfer gives users channel-local control.</h2>
          <p>
            Users can opt into a DApp channel, hold private-state notes, transfer
            notes inside that DApp, and return to the public Ethereum edge when
            they exit.
          </p>
        </div>
        <div className="flow-track">
          {dappFlow.map((step, index) => (
            <article className="flow-step" key={step.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell engine-section">
        <div className="engine-visual">
          <div className="proof-texture proof-texture--engine" />
          <div className="engine-node-stack">
            <span />
            <span />
          </div>
          <div className="engine-line-group">
            <span />
            <span />
            <span />
          </div>
          <div className="engine-node-stack compact">
            <span />
            <span />
          </div>
          <div className="engine-diamond" />
        </div>
        <div className="engine-copy">
          <span className="section-kicker">Underlying proof engine</span>
          <h2>Execution becomes something the boundary can verify.</h2>
          <p>
            Tokamak zk-EVM turns DApp execution into proof artifacts. Tonigma
            uses that capability as a product surface: users see an app, while
            public boundaries can still rely on proof-backed acceptance.
          </p>
        </div>
      </section>

      <section className="section-shell policy-section">
        <div className="section-heading">
          <span className="section-kicker">Proof and policy</span>
          <h2>Channel status should look inspectable, not hidden.</h2>
        </div>
        <div className="policy-grid">
          {policySignals.map(([title, value]) => (
            <article className="policy-card" key={title}>
              <CheckCircle2 size={20} aria-hidden="true" />
              <span>{title}</span>
              <strong>{value}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell observer-section">
        <div className="observer-panel">
          <div className="observer-header">
            <div>
              <span className="section-kicker">Observer and mirror</span>
              <h2>Public surfaces make the channel boundary accountable.</h2>
            </div>
            <Eye aria-hidden="true" size={28} />
          </div>
          <div className="observer-rows">
            {observerRows.map(([event, value, source]) => (
              <div className="observer-row" key={event}>
                <span>{event}</span>
                <strong>{value}</strong>
                <em>{source}</em>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell control-section">
        <div className="section-heading">
          <span className="section-kicker">User control</span>
          <h2>Private-state users should know what they hold and what they can expect.</h2>
        </div>
        <div className="control-grid">
          <article>
            <WalletCards aria-hidden="true" size={24} />
            <h3>Self-custody entry and exit</h3>
            <p>
              Users keep the public settlement path visible while choosing when
              to enter or leave the DApp channel.
            </p>
          </article>
          <article>
            <KeyRound aria-hidden="true" size={24} />
            <h3>User-held secrets</h3>
            <p>
              Spending and viewing material belongs to the user. Tonigma does
              not require a master viewing key.
            </p>
          </article>
          <article>
            <Route aria-hidden="true" size={24} />
            <h3>Selective disclosure</h3>
            <p>
              Recovery and review paths can be designed around explicit user
              disclosure rather than operator-controlled history access.
            </p>
          </article>
        </div>
      </section>

      <section className="section-shell resources-section">
        <div className="section-heading">
          <span className="section-kicker">Developer / operator resources</span>
          <h2>The technical layer stays available without taking over the landing page.</h2>
        </div>
        <div className="resource-grid">
          {resources.map((resource) => {
            const Icon = resource.icon;
            return (
              <article className="resource-card" key={resource.title}>
                <Icon aria-hidden="true" size={22} />
                <h3>{resource.title}</h3>
                <p>{resource.text}</p>
                <span>
                  <CircleDashed aria-hidden="true" size={14} />
                  Link pending
                </span>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section-shell closing-section">
        <Image
          alt=""
          aria-hidden="true"
          height={64}
          src="/brand/tonigma-square-logo.svg"
          width={64}
        />
        <h2>Private app channels, made visible at the boundary.</h2>
        <div className="hero-actions">
          <DisabledAction>Open Observer</DisabledAction>
          <DisabledAction variant="secondary">Read Docs</DisabledAction>
        </div>
      </section>
    </main>
  );
}
