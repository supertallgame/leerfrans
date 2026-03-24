const FlagNL = ({ className = "w-5 h-3.5" }: { className?: string }) => (
  <svg viewBox="0 0 640 480" className={className} aria-label="Nederland">
    <rect width="640" height="160" fill="#AE1C28" />
    <rect y="160" width="640" height="160" fill="#FFF" />
    <rect y="320" width="640" height="160" fill="#21468B" />
  </svg>
);

const FlagFR = ({ className = "w-5 h-3.5" }: { className?: string }) => (
  <svg viewBox="0 0 640 480" className={className} aria-label="France">
    <rect width="213.3" height="480" fill="#002395" />
    <rect x="213.3" width="213.4" height="480" fill="#FFF" />
    <rect x="426.7" width="213.3" height="480" fill="#ED2939" />
  </svg>
);

export { FlagNL, FlagFR };
