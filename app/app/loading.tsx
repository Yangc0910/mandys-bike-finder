export default function Loading() {
  return (
    <main className="app-launch-screen" aria-label="Loading Mandy's Bike Finder">
      <div className="app-launch-content">
        <span className="app-launch-mark" aria-hidden="true">
          <svg fill="none" viewBox="0 0 120 120">
            <path d="M24 79V43l36 37 36-37v36" />
            <circle cx="24" cy="84" r="15" />
            <circle cx="96" cy="84" r="15" />
            <circle className="app-launch-mark-accent" cx="60" cy="31" r="5" />
          </svg>
        </span>
        <p className="app-launch-name">Mandy&apos;s Bike Finder</p>
        <h1>Confident used-bike decisions for parents.</h1>
        <div className="app-launch-progress" aria-hidden="true">
          <span />
        </div>
        <p className="app-launch-status">Opening your saved bike guidance...</p>
      </div>
    </main>
  );
}
