"use client";

import { useEffect } from "react";

type SyntaxAnnouncerProps = {
  message: string;
};

export function SyntaxAnnouncer({ message }: SyntaxAnnouncerProps) {
  useEffect(() => {
    // Intentionally empty. Rendering changes in this region triggers SR announcements.
  }, [message]);

  return (
    <div aria-live="assertive" aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
}
