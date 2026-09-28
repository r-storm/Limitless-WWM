import classNames from '../../utils/classNames';
import LightPillar from '../LightPillar';

export default function HeroPage({ exiting, onEnter }) {
  return (
    <div
      className={classNames(
        'fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden',
        'bg-[var(--dossier-ink)]',
        exiting && 'animate-hero-exit'
      )}
    >
      {/* Animated light pillar background, cyan to match the dashboard accent */}
      <div className="absolute inset-0">
        <LightPillar
          topColor="#22D3EE"
          bottomColor="#38BDF8"
          intensity={0.9}
          rotationSpeed={0.4}
          glowAmount={0.004}
          pillarWidth={4.7}
          pillarHeight={0.4}
          noiseIntensity={0.3}
          pillarRotation={88}
          interactive={false}
          mixBlendMode="screen"
          quality="high"
        />
      </div>

      {/* Soft vignette to anchor the title without dimming the pillar too much */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 35%, rgba(6,8,10,0.55) 80%, rgba(6,8,10,0.9) 100%)',
        }}
      />

      <div
        className={classNames(
          'relative z-10 flex flex-col items-center text-center',
          'px-10 sm:px-16 py-12 sm:py-14 rounded-2xl',
          'bg-black/55 backdrop-blur-md',
          'border border-white/10',
          'shadow-[0_20px_60px_rgba(0,0,0,0.45)]'
        )}
      >
        <h1 className="hero-title animate-hero-title-in font-display">
          Limitless
        </h1>

        <p className="animate-hero-subtitle-in mt-5 text-sm sm:text-base uppercase tracking-[0.32em] text-[var(--dossier-bone)]">
          Guild War Command Center
        </p>

        <button
          onClick={onEnter}
          className={classNames(
            'animate-hero-button-in mt-10 cursor-pointer',
            'inline-flex items-center px-8 py-3 rounded-sm',
            'bg-[var(--dossier-ink-2)]/70 backdrop-blur-sm',
            'border border-[var(--dossier-amber)]',
            'text-xs font-semibold tracking-[0.22em] uppercase text-[var(--dossier-amber)]',
            'transition-colors duration-200',
            'hover:bg-[var(--dossier-amber)] hover:text-[var(--dossier-ink)]'
          )}
        >
          View Dashboard
        </button>
      </div>
    </div>
  );
}
