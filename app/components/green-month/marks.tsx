import type {SVGProps} from 'react';

/**
 * The campaign's own marks: fine-line botanical drawings in the text's colour, decorative (`aria-hidden`) - what they
 * stand by always says it in words.
 */
type MarkProps = SVGProps<SVGSVGElement>;

function Mark({children, ...props}: MarkProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

export const LeafIcon = (props: MarkProps) => (
  <Mark {...props}>
    <path d="M5 19c0-8 5-14 15-15-1 10-7 15-15 15Z" />
    <path d="M5 19 13 11" />
  </Mark>
);

export const SproutIcon = (props: MarkProps) => (
  <Mark {...props}>
    <path d="M12 21v-9" />
    <path d="M12 12C12 7 9 4 4 4c0 5 3 8 8 8Z" />
    <path d="M12 14c0-4 3-7 8-7 0 4-3 7-8 7Z" />
  </Mark>
);

export const ParcelIcon = (props: MarkProps) => (
  <Mark {...props}>
    <path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5v-9Z" />
    <path d="M3.5 7.5 12 12l8.5-4.5M12 12v9" />
  </Mark>
);

export const DropIcon = (props: MarkProps) => (
  <Mark {...props}>
    <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" />
    <path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5" />
  </Mark>
);

export const ArrowIcon = (props: MarkProps) => (
  <Mark {...props}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </Mark>
);

/** A large sprig for a section's corner: leaves along a curving stem. */
export const Sprig = (props: MarkProps) => (
  <svg aria-hidden="true" viewBox="0 0 120 200" fill="none" stroke="currentColor" strokeWidth={1.2} {...props}>
    <path d="M60 198C58 150 52 96 70 4" strokeLinecap="round" />
    {[
      [62, 170, -1],
      [60, 140, 1],
      [61, 110, -1],
      [63, 82, 1],
      [66, 56, -1],
      [69, 32, 1],
    ].map(([x, y, side]) => (
      <path
        key={y}
        d={`M${x} ${y}c${side * 10}-4 ${side * 26}-2 ${side * 36}-18c${-side * 14}-4 ${-side * 30} 0 ${-side * 36} 18Z`}
        strokeLinejoin="round"
      />
    ))}
  </svg>
);
