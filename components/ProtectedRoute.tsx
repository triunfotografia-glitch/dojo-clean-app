import { useDojo } from "@/components/context/DojoContext";
import { useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { userLogado, carregado } = useDojo();
  const segments = useSegments() as string[];
  const router = useRouter();

  useEffect(() => {
    if (!carregado) {
      return;
    }

    const isPublicRoute =
      segments.length === 0 ||
      segments.includes("login") ||
      segments.includes("esqueci-senha");

    if (userLogado) {
        if (isPublicRoute) {
          router.replace({ pathname: "/treinos" });
          return;
        }
    } else if (!isPublicRoute) {
      router.replace({ pathname: "/" });
    }
  }, [userLogado, segments, router, carregado]);

  return <>{children}</>;
}
