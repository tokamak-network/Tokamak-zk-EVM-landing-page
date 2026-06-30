import Image from "next/image";
import Link from "next/link";

type SiteHeaderProps = Readonly<{
  homeHref?: string;
  visionActive?: boolean;
}>;

export function SiteHeader({
  homeHref = "/",
  visionActive = false,
}: SiteHeaderProps) {
  const visionClassName = visionActive
    ? "nav-link nav-link--enabled nav-link--active"
    : "nav-link nav-link--enabled";

  return (
    <nav className="topbar" aria-label="Primary navigation">
      <Link className="brand-lockup" href={homeHref} aria-label="Tonigma home">
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
        <Link className={visionClassName} href="/vision">
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
  );
}
