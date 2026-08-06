import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";

export type PromptType = "plain-text" | "secure-text" | "login-password";

type PromptOptions = {
  title: string;
  message: string;
  callback: (value: string | null) => void;
  type: PromptType;
  defaultValue: string;
};

let promptHandler: ((options: PromptOptions) => void) | null = null;

export function promptText(
  title: string,
  message: string,
  callback: (value: string | null) => void,
  type: PromptType = "plain-text",
  defaultValue = ""
) {
  if (typeof (Alert as any).prompt === "function") {
    (Alert as any).prompt(title, message, callback, type, defaultValue);
    return;
  }

  if (promptHandler) {
    promptHandler({ title, message, callback, type, defaultValue });
    return;
  }

  Alert.alert(
    title,
    "O prompt de entrada de texto não é suportado nesta plataforma e não há um componente de entrada disponível.",
    [{ text: "OK", onPress: () => callback(null) }]
  );
}

export function PromptProvider({ children }: { children: React.ReactNode }) {
  const [prompt, setPrompt] = useState<PromptOptions | null>(null);
  const [value, setValue] = useState("");

  const showPrompt = useCallback((options: PromptOptions) => {
    setValue(options.defaultValue ?? "");
    setPrompt(options);
  }, []);

  useEffect(() => {
    promptHandler = showPrompt;
    return () => {
      if (promptHandler === showPrompt) {
        promptHandler = null;
      }
    };
  }, [showPrompt]);

  const closePrompt = useCallback(
    (result: string | null) => {
      if (prompt) {
        prompt.callback(result);
      }
      setPrompt(null);
      setValue("");
    },
    [prompt]
  );

  return (
    <>
      {children}
      <Modal
        visible={prompt !== null}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => closePrompt(null)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.title}>{prompt?.title}</Text>
            <Text style={styles.message}>{prompt?.message}</Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={setValue}
              secureTextEntry={prompt?.type === "secure-text"}
              placeholder={prompt?.type === "secure-text" ? "Nova senha" : "Digite seu texto"}
              placeholderTextColor="#888"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
            />
            <View style={styles.actions}>
              <Pressable style={[styles.actionButton, styles.cancelButton]} onPress={() => closePrompt(null)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable style={[styles.actionButton, styles.confirmButton]} onPress={() => closePrompt(value)}>
                <Text style={styles.confirmText}>OK</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    backgroundColor: "#121212",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#333",
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  message: {
    color: "#ccc",
    marginBottom: 16,
    lineHeight: 20,
  },
  input: {
    backgroundColor: "#111",
    color: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
    padding: 14,
    marginBottom: 20,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  actionButton: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  cancelButton: {
    backgroundColor: "#333",
  },
  confirmButton: {
    backgroundColor: "#E10600",
  },
  cancelText: {
    color: "#fff",
    fontWeight: "bold",
  },
  confirmText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
