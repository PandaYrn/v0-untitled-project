import type { SVGProps } from "react"

export function Heart(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-heart"
      {...props}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5a7 7 0 1 0-14 0c0 1.79 1.51 3.54 3 5v7a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2z" />
    </svg>
  )
}

export function User(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-user"
      {...props}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

export function Clock(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-clock"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

export function SuiIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="16" cy="16" r="16" fill="#6FBCF0" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.4326 7.33447C9.40294 8.11386 7.5602 9.9566 7.5602 12.6174C7.5602 14.3391 8.82709 15.3565 10.6604 16.4158C12.6707 17.5747 13.6785 18.2547 13.6785 19.4656C13.6785 20.8666 12.2194 21.7536 10.4197 21.7536C8.4289 21.7536 6.92052 20.6755 6 19.5253L8.09004 17.6637C8.73427 18.4431 9.46822 19.0321 10.4197 19.0321C11.1246 19.0321 11.5068 18.7332 11.5068 18.3115C11.5068 17.7225 10.9667 17.4236 9.13379 16.3644C7.65518 15.5341 5.44782 14.4048 5.44782 11.8659C5.44782 9.32704 7.73783 7.01663 10.2656 6.27809L11.4326 7.33447ZM20.5803 19.0321C19.8754 19.0321 19.4932 18.7332 19.4932 18.3115C19.4932 17.7225 20.0334 17.4236 21.8662 16.3644C23.3448 15.5341 25.5522 14.4048 25.5522 11.8659C25.5522 9.32704 23.2622 7.01663 20.7344 6.27809L19.5673 7.33447C21.597 8.11386 23.4398 9.9566 23.4398 12.6174C23.4398 14.3391 22.1729 15.3565 20.3396 16.4158C18.3293 17.5747 17.3215 18.2547 17.3215 19.4656C17.3215 20.8666 18.7806 21.7536 20.5803 21.7536C22.5711 21.7536 24.0795 20.6755 25 19.5253L22.91 17.6637C22.2657 18.4431 21.5318 19.0321 20.5803 19.0321Z"
        fill="white"
      />
    </svg>
  )
}
