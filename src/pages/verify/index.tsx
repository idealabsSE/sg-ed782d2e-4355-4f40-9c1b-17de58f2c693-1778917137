import { useRouter } from "next/router";
import { useEffect } from "react";

export default function VerifyIndex() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/verify/property");
  }, [router]);

  return null;
}