"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CustomerOrdersLiveRefresh() {
  const router = useRouter();

  useEffect(() => {
    const interval = window.setInterval(() => router.refresh(), 30000);
    return () => window.clearInterval(interval);
  }, [router]);

  return null;
}
