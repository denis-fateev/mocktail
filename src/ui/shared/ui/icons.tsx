/**
 * Inline SVG icons based on Lucide path data (ISC; some derived from Feather/MIT).
 * See public/THIRD_PARTY_NOTICES.md for license text.
 */

import type { SVGProps } from 'react';

type IconProps = {
  size?: number;
  className?: string;
};

const defaultProps = (size: number, className?: string): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  className,
  'aria-hidden': true,
});

export const IconPlus = ({ size = 16, className }: IconProps) => (
  <svg {...defaultProps(size, className)}>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

export const IconPencil = ({ size = 16, className }: IconProps) => (
  <svg {...defaultProps(size, className)}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);

export const IconUpload = ({ size = 16, className }: IconProps) => (
  <svg {...defaultProps(size, className)}>
    <path d="M12 3v12" />
    <path d="m17 8-5-5-5 5" />
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
  </svg>
);

export const IconDownload = ({ size = 16, className }: IconProps) => (
  <svg {...defaultProps(size, className)}>
    <path d="M12 15V3" />
    <path d="m7 10 5 5 5-5" />
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
  </svg>
);

export const IconTrash = ({ size = 16, className }: IconProps) => (
  <svg {...defaultProps(size, className)}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </svg>
);

export const IconX = ({ size = 16, className }: IconProps) => (
  <svg {...defaultProps(size, className)}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export const IconMoreVertical = ({ size = 16, className }: IconProps) => (
  <svg {...defaultProps(size, className)}>
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="5" r="1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const IconChevronDown = ({ size = 16, className }: IconProps) => (
  <svg {...defaultProps(size, className)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const IconChevronsDownUp = ({ size = 16, className }: IconProps) => (
  <svg {...defaultProps(size, className)}>
    <path d="m7 15 5 5 5-5" />
    <path d="m7 9 5-5 5 5" />
  </svg>
);

export const IconChevronsUpDown = ({ size = 16, className }: IconProps) => (
  <svg {...defaultProps(size, className)}>
    <path d="m7 15 5 5 5-5" />
    <path d="m7 9 5-5 5 5" />
  </svg>
);

export const IconCopy = ({ size = 16, className }: IconProps) => (
  <svg {...defaultProps(size, className)}>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

export const IconCopySuccess = ({ size = 16, className }: IconProps) => (
  <svg {...defaultProps(size, className)}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const IconArrowUp = ({ size = 16, className }: IconProps) => (
  <svg {...defaultProps(size, className)}>
    <path d="m12 19V5" />
    <path d="m5 12 7-7 7 7" />
  </svg>
);

export const IconArrowDown = ({ size = 16, className }: IconProps) => (
  <svg {...defaultProps(size, className)}>
    <path d="M12 5v14" />
    <path d="m19 12-7 7-7-7" />
  </svg>
);

export const IconPlay = ({ size = 16, className }: IconProps) => (
  <svg {...defaultProps(size, className)}>
    <polygon points="6 3 20 12 6 21 6 3" fill="currentColor" stroke="none" />
  </svg>
);

export const IconSquare = ({ size = 16, className }: IconProps) => (
  <svg {...defaultProps(size, className)}>
    <rect width="14" height="14" x="5" y="5" rx="1" />
  </svg>
);
