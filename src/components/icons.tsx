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
      <path d="M12 2.5L3.5 7.5v9L12 21.5l8.5-5v-9L12 2.5z" />
      <path d="M3.5 7.5L12 12m0 0l8.5-4.5M12 12v9.5" />
      <path d="M16.5 5.5L8.5 10.5" />
      <path d="m20.5 7.5-8.5 4.5" />
      <path d="M3.5 16.5L12 12" />
    </svg>
  ),
};
