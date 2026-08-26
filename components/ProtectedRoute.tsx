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
      segments.includes("login") ||
      segments.includes("esqueci-senha") ||
      segments.includes("redefinir-senha");

    if (userLogado) {
      if (isPublicRoute) {
        router.replace("/treinos");
      }
      return;
    }

    if (!userLogado && !isPublicRoute) {
      router.replace("/professor/login");
    }

  }, [userLogado, segments, router, carregado]);

  return <>{children}</>;
}