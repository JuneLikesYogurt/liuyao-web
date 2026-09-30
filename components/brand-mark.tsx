export function BrandMark({ ritual = false }: { ritual?: boolean }) {
  return (
    <svg
      className={`brand-mark${ritual ? " brand-mark--ritual" : ""}`}
      viewBox="0 0 72 42"
      aria-hidden="true"
      focusable="false"
    >
      <g className="brand-mark__coin brand-mark__coin--left" transform="rotate(-7 19 24)">
        <circle cx="19" cy="24" r="11.5" />
        <rect x="15.5" y="20.5" width="7" height="7" />
      </g>
      <g className="brand-mark__coin brand-mark__coin--right" transform="rotate(6 53 23)">
        <circle cx="53" cy="23" r="11.5" />
        <rect x="49.5" y="19.5" width="7" height="7" />
      </g>
      <g className="brand-mark__coin brand-mark__coin--center" transform="rotate(-2 36 17.5)">
        <circle cx="36" cy="17.5" r="14" />
        <rect x="32" y="13.5" width="8" height="8" />
      </g>
      <path className="brand-mark__seal" d="M8 36.5c14.5 2 39.5 2.2 56-.3" />
    </svg>
  );
}
