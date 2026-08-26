import { Redirect } from "expo-router";
import { useDojo } from "@/components/context/DojoContext";

export default function Index() {
  const { userLogado, carregado } = useDojo();

  if (!carregado) {
    return null;
  }

  if (userLogado) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/professor/login" />;
}
