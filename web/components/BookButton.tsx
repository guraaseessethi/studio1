"use client";

import { startBooking } from "@/lib/bookingStore";

type Props = {
  serviceId?: string;
  barberId?: string;
  className?: string;
  children: React.ReactNode;
  "aria-label"?: string;
};

/** Opens the booking console, optionally with a service and/or barber chosen. */
export function BookButton({ serviceId, barberId, className, children, ...rest }: Props) {
  return (
    <button
      type="button"
      className={className}
      aria-label={rest["aria-label"]}
      onClick={() => startBooking({ serviceId, barberId })}
    >
      {children}
    </button>
  );
}
