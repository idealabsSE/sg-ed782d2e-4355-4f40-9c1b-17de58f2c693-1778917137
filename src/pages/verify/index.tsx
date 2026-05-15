import { useRouter } from "next/router";
import { useEffect } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function VerifyIndex() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/verify/property");
  }, [router]);

  return (
    <ProtectedRoute>
      {null}
    </ProtectedRoute>
  );
}