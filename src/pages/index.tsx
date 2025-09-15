import React from 'react';
import { Link } from 'react-router-dom';
import HomepageFeatures from '../components/HomepageFeatures';
import styles from './index.module.css';

function HomepageHeader() {
  return (
    <header className={styles.heroBanner}>
      <div className={styles.container}>
        <h1 className={styles.heroTitle}>
          Learn C Programming
        </h1>
        <p className={styles.heroSubtitle}>
          Master C programming with interactive exercises and real-time feedback
        </p>
        <div className={styles.buttons}>
          <Link
            className={styles.button}
            to="/dashboard">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): React.ReactElement {
  return (
    <div className={styles.homepage}>
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </div>
  );
}
