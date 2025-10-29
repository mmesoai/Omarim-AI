import type { SVGProps } from "react"

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Central cube representing the data warehouse */}
      <rect x="9" y="9" width="6" height="6" rx="1" />
      <path d="M12 9V7" />
      <path d="M12 15v2" />
      <path d="M9 12H7" />
      <path d="M15 12h2" />

      {/* Outer layers representing the pipeline and data flow */}
      <path d="M5 5h2" />
      <path d="M5 19h2" />
      <path d="M17 5h2" />
      <path d="M17 19h2" />
      <path d="M5 5l2 2" />
      <path d="M5 19l2-2" />
      <path d="M19 5l-2 2" />
      <path d="M19 19l-2-2" />

      {/* Connecting lines */}
      <path d="M7 7h10" />
      <path d="M7 17h10" />
      <path d="M7 7v10" />
      <path d="M17 7v10" />
    </svg>
  ),
};
