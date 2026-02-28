"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "./track";

export function AnalyticsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    if (pathname === "/") {
      track("landing_view", { source: "landing" });
    }
  }, [pathname]);

  return <>{children}</>;
}
