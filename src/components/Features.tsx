import React from 'react';
import Link from '@docusaurus/Link';
import styles from './Features.module.css';

const features = [
  {
    title: 'Get Started',
    description:
      'Install the extension, set up Claude Code, and spawn your first agent in minutes.',
    link: '/introduction/getting-started',
  },
  {
    title: 'Assets',
    description:
      'Explore characters, furniture, walls, and floors — or create your own custom asset packs.',
    link: '/assets/overview',
  },
  {
    title: 'Contributing',
    description:
      'Learn how to contribute to Pixel Agents — from bug reports to new features and asset packs.',
    link: '/community/contributing',
  },
  {
    title: 'Roadmap',
    description:
      "See where Pixel Agents is headed — agent-agnostic adapters, deep inspection, token health bars, and more.",
    link: '/community/roadmap',
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
