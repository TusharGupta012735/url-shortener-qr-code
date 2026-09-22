const ROADMAP = [
  'Click counts and trends per short link',
  'Device and browser breakdown',
  'Country-level traffic',
  'Top-performing links',
];

export default function Analytics() {
  return (
    <main className="page">
      <section className="hero hero-compact">
        <h1>Analytics</h1>
        <p className="hero-subtitle">A dashboard for your links is on the way.</p>
      </section>

      <section className="in-dev">
        <span className="in-dev-badge">In development</span>
        <p>
          Every redirect already publishes a click event through Kafka and lands in the database —
          this page just doesn't visualize it yet. Here's what's planned:
        </p>
        <ul className="roadmap-list">
          {ROADMAP.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
