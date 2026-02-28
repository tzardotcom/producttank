"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface CheckInButtonProps {
  registrationId: string;
  eventId: string;
  attended: boolean;
  disabled?: boolean;
}

export function CheckInButton({
  registrationId,
  eventId,
  attended,
  disabled,
}: CheckInButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (attended) {
    return (
      <span className="text-sm text-muted-foreground">Obecny</span>
    );
  }

  async function handleCheckIn() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/events/${eventId}/registrations/${registrationId}/check-in`,
        { method: "PATCH" }
      );
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled || loading}
      onClick={handleCheckIn}
    >
      {loading ? "…" : "Oznacz obecność"}
    </Button>
  );
}
