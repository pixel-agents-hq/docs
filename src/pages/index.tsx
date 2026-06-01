import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Hero from '../components/Hero';
import Features from '../components/Features';
import styles from './index.module.css';

export default function Home(): React.ReactElement {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout title="Home" description={siteConfig.tagline}>
      <div className={styles.homeContent}>
        <Hero />
        <main>
          <Features />
        </main>
      </div>
    </Layout>
  );
}
