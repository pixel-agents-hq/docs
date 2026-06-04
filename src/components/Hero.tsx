import React, { useEffect, useState } from 'react';
import Link from '@docusaurus/Link';
import AnimatedCharacters from './AnimatedCharacters';
import styles from './Hero.module.css';

function formatCount(n: number): string {
  if (n >= 10_000) return `${Math.round(n / 1000)}k`;
  if (n >= 1_000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

function PixelStar() {
  return (
    <svg width="14" height="14" viewBox="0 0 9 9" className={`${styles.statIcon} ${styles.starIcon}`}>
      <rect x="4" y="0" width="1" height="1" fill="currentColor" />
      <rect x="3" y="1" width="3" height="1" fill="currentColor" />
      <rect x="0" y="2" width="9" height="1" fill="currentColor" />
      <rect x="1" y="3" width="7" height="1" fill="currentColor" />
      <rect x="2" y="4" width="5" height="1" fill="currentColor" />
      <rect x="1" y="5" width="3" height="1" fill="currentColor" />
      <rect x="5" y="5" width="3" height="1" fill="currentColor" />
      <rect x="0" y="6" width="2" height="1" fill="currentColor" />
      <rect x="7" y="6" width="2" height="1" fill="currentColor" />
    </svg>
  );
}

function PixelHeart() {
  const f = 'var(--ifm-color-primary-light)';
  return (
    <svg width="14" height="14" viewBox="0 0 9 8" className={styles.statIcon}>
      <rect x="1" y="0" width="2" height="1" fill={f} />
      <rect x="6" y="0" width="2" height="1" fill={f} />
      <rect x="0" y="1" width="4" height="1" fill={f} />
      <rect x="5" y="1" width="4" height="1" fill={f} />
      <rect x="0" y="2" width="9" height="1" fill={f} />
      <rect x="0" y="3" width="9" height="1" fill={f} />
      <rect x="1" y="4" width="7" height="1" fill={f} />
      <rect x="2" y="5" width="5" height="1" fill={f} />
      <rect x="3" y="6" width="3" height="1" fill={f} />
      <rect x="4" y="7" width="1" height="1" fill={f} />
    </svg>
  );
}

export default function Hero(): React.ReactElement {
  const [stars, setStars] = useState<number | null>(null);
  const [installs, setInstalls] = useState<number | null>(null);

  useEffect(() => {
    fetch('https://api.github.com/repos/pixel-agents-hq/pixel-agents')
      .then(r => r.json())
      .then(data => { if (data.stargazers_count) setStars(data.stargazers_count); })
      .catch(() => {});

    Promise.allSettled([
      // VS Code Marketplace: installs + downloads
      fetch('https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json;api-version=7.2-preview.1',
        },
        body: JSON.stringify({
          filters: [{ criteria: [{ filterType: 7, value: 'pablodelucca.pixel-agents' }] }],
          flags: 914,
        }),
      })
        .then(r => r.json())
        .then(data => {
          const stats = data.results?.[0]?.extensions?.[0]?.statistics;
          if (!stats) return 0;
          const installs = stats.find((s: any) => s.statisticName === 'install')?.value ?? 0;
          const downloads = stats.find((s: any) => s.statisticName === 'downloadCount')?.value ?? 0;
          return Math.floor(installs + downloads);
        }),
      // Open VSX downloads
      fetch('https://open-vsx.org/api/pablodelucca/pixel-agents')
        .then(r => r.json())
        .then(data => data.downloadCount ?? 0),
      // GitHub Releases downloads
      fetch('https://api.github.com/repos/pixel-agents-hq/pixel-agents/releases')
        .then(r => r.json())
        .then((releases: any[]) =>
          releases.reduce((sum, rel) =>
            sum + rel.assets.reduce((a: number, asset: any) => a + (asset.download_count ?? 0), 0), 0),
        ),
    ]).then(results => {
      const total = results.reduce((sum, r) => sum + (r.status === 'fulfilled' ? (r.value as number) : 0), 0);
      if (total > 0) setInstalls(total);
    });
  }, []);

  return (
    <header className={styles.hero}>
      <div className={styles.heroInner}>        {(stars !== null || installs !== null) && (
          <div className={styles.heroStats}>
            {stars !== null && (
              <span className={styles.stat}>
                <PixelStar />
                <span>{formatCount(stars)} stars</span>
              </span>
            )}
            {stars !== null && installs !== null && (
              <span>·</span>
            )}
            {installs !== null && (
              <span className={styles.stat}>
                <PixelHeart />
                <span>{formatCount(installs)} installs</span>
              </span>
            )}
          </div>
        )}
        <div className={styles.characters}>
          <AnimatedCharacters />
        </div>
        <h1 className={styles.heroTitle}>PIXEL AGENTS</h1>
        <p className={styles.heroSubtitle}>
          Play a Game, Build a Product.
        </p>
        <p className={styles.heroTagline}>
          Learn how to install, configure, and customize Pixel Agents — the app
          that turns your AI agents into characters in a pixel art office.
        </p>
        <div className={styles.heroButtons}>
          <Link className={styles.heroBtnPrimary} to="/introduction/getting-started">
            Get Started
          </Link>
          <Link
            className={styles.heroBtnSecondary}
            href="https://github.com/pixel-agents-hq/pixel-agents">
            View on GitHub
          </Link>
        </div>
      </div>
    </header>
  );
}
