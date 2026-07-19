import React from 'react';
import Link from '@docusaurus/Link';
import styles from './Features.module.css';

const features = [
  {
    title: 'Start',
    description:
      'Install the extension or the standalone CLI, and spawn your first agent in minutes.',
    link: '/start/what-is-pixel-agents',
  },
  {
    title: 'Learn',
    description:
      'The mental models behind the office: concepts, architecture, and the protocol.',
    link: '/learn/',
  },
  {
    title: 'Use',
    description:
      'Task-oriented guides for VS Code and the standalone CLI.',
    link: '/use/',
  },
  {
    title: 'Build',
    description:
      'Extend Pixel Agents with a new provider, client, adapter, or custom asset pack.',
    link: '/build/',
  },
];

export default function Features(): React.ReactElement {
  return (
    <section className={styles.features}>
      <div className={styles.featuresGrid}>
        {features.map((feature) => (
          <Link
            key={feature.title}
            to={feature.link}
            className={styles.featureCard}>
            <h3 className={styles.featureTitle}>{feature.title}</h3>
            <p className={styles.featureDescription}>{feature.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
