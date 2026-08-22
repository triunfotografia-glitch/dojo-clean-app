import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface GlobalBackButtonProps {
  title?: string;
}

export function GlobalBackButton({
  title,
}: GlobalBackButtonProps) {
  const router = useRouter();
  const pathname = usePathname();

  const canGoBack =
    pathname !== "/" &&
    pathname !== "/(tabs)" &&
    pathname !== "/(tabs)/";

  if (!canGoBack) {
    return null;
  }

  return (
    <SafeAreaView
      edges={["top"]}
      style={styles.safeArea}
    >
      <View style={styles.container}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#FFFFFF"
          />

          <Text style={styles.text}>
            Voltar
          </Text>
        </Pressable>

        {title ? (
          <Text
            style={styles.title}
            numberOfLines={1}
          >
            {title}
          </Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#050505",
  },

  container: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "#050505",
    borderBottomWidth: 1,
    borderBottomColor: "#222222",
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingRight: 16,
  },

  pressed: {
    opacity: 0.6,
  },

  text: {
    marginLeft: 6,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },

  title: {
    flex: 1,
    marginLeft: 4,
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
});