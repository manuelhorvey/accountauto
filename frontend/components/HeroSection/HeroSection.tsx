import styles from "./HeroSection.module.css";

export default function HeroSection() {
    return (
      <section className={styles.hero}>
        {/* Decorative shapes */}
        <div className={styles.decorTopLeft} />
        <div className={styles.decorBottomRight} />
  
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            Empower Your Business<br />
            With Real‑Time Statements
          </h1>
          <p className={styles.description}>
            Visualize daily sales, track client balances, and generate detailed
            reports with a few clicks.
          </p>
          <div className={styles.ctaContainer}>
            <a href="/dashboard/statements" className={styles.ctaPrimary}>
              Get Started
            </a>
            <a href="#features" className={styles.ctaSecondary}>
              Learn More
            </a>
          </div>
        </div>
      </section>
    );
  }
  