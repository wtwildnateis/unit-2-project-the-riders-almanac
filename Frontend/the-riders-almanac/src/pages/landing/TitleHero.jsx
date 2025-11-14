import logo from "../../assets/logo.png";

const VIDEO =
  "https://res.cloudinary.com/dqg9xe92b/video/upload/v1763042702/202511130803_dja9y0.mp4";

export default function TitleHero({ onClick }) {
  return (
    <section
      onClick={onClick}
      className="title-hero"
      aria-label="Title screen (click to continue)"
    >
      {/* background video */}
      <video
        className="title-video"
        src={VIDEO}
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      />

      {/* dark scrim */}
      <div className="title-scrim" />

      {/* centered overlay (always on top) */}
      <div className="title-overlay">
        <div className="overlay-inner">
          <img
            src={logo}
            alt="The Rider's Almanac"
            className="title-logo"
          />
          <div className="fade-in-arrow">↓</div>
        </div>
      </div>
    </section>
  );
}