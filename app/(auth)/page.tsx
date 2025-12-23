"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  // Redirect / to /dashboard as default
  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return null;
}
