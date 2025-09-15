import React, { type ReactNode } from 'react';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: ReactNode;
  icon: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Learn C Programming',
    icon: '📚',
    description: (
      <>
        Master the fundamentals of C programming with interactive exercises
        and real-time feedback on your code.
      </>
    ),
  },
  {
    title: 'Interactive Exercises',
    icon: '💻',
    description: (
      <>
        Practice with hands-on coding exercises, multiple choice questions,
        and text-based challenges to reinforce your learning.
      </>
    ),
  },
  {
    title: 'Track Your Progress',
    icon: '📊',
    description: (
      <>
        Monitor your learning journey with detailed progress tracking
        and personalized feedback from instructors.
      </>
    ),
  },
];

function Feature({title, icon, description}: FeatureItem) {
  return (
    <div className={styles.feature}>
      <div className={styles.featureIcon}>
        <span className={styles.icon}>{icon}</span>
      </div>
      <div className={styles.featureContent}>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): React.ReactElement {
  return (
    <section className={styles.features}>
      <div className={styles.container}>
        <div className={styles.featuresGrid}>
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
