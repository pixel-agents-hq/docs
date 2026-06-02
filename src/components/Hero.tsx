import React from 'react';
import Link from '@docusaurus/Link';
import AnimatedCharacters from './AnimatedCharacters';
import styles from './Hero.module.css';

export default function Hero(): React.ReactElement {
  return (
    <header className={styles.hero}>
      <div className={styles.heroInner}>
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
