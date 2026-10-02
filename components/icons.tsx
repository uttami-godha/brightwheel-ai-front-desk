type P = { className?: string };
const base = "shrink-0";
const svg = (d: React.ReactNode, vb = "0 0 24 24") =>
  function Icon({ className = "h-4 w-4" }: P) {
    return (
      <svg
        viewBox={vb}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`${base} ${className}`}
        aria-hidden
      >
        {d}
      </svg>
    );
  };

export const SendIcon = svg(<path d="M5 12h13M13 6l6 6-6 6" />);
export const MicIcon = svg(
  <>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
  </>,
);
export const CheckIcon = svg(<path d="M5 12.5l4.5 4.5L19 7.5" />);
export const BookIcon = svg(
  <>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
    <path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" />
  </>,
);
export const PersonIcon = svg(
  <>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </>,
);
export const PhoneIcon = svg(
  <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />,
);
export const AlertIcon = svg(
  <>
    <path d="M12 3 2 20h20z" />
    <path d="M12 10v4M12 17h.01" />
  </>,
);
export const ThumbUpIcon = svg(
  <path d="M7 10v11H4V10zM7 10l4-7a2 2 0 0 1 3 2l-1 5h6a2 2 0 0 1 2 2.3l-1.4 7A2 2 0 0 1 17.6 21H7" />,
);
export const ThumbDownIcon = svg(
  <path d="M17 14V3h3v11zM17 14l-4 7a2 2 0 0 1-3-2l1-5H5a2 2 0 0 1-2-2.3l1.4-7A2 2 0 0 1 6.4 3H17" />,
);
export const CalendarIcon = svg(
  <>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </>,
);
export const SparkIcon = svg(
  <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />,
);
export const InboxIcon = svg(
  <>
    <path d="M3 13h5l2 3h4l2-3h5" />
    <path d="M5 5h14l2 8v6H3v-6z" />
  </>,
);
export const ChartIcon = svg(<path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />);
export const ChatIcon = svg(<path d="M4 5h16v11H9l-5 4z" />);
export const PlusIcon = svg(<path d="M12 5v14M5 12h14" />);
export const SearchIcon = svg(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-4-4" />
  </>,
);
export const ChevronIcon = svg(<path d="m9 6 6 6-6 6" />);
export const ResetIcon = svg(<path d="M4 4v6h6M4.5 15a8 8 0 1 0 1.9-8.3L4 10" />);
