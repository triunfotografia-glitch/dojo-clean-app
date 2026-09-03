import { COLORS } from '@/components/Colors';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type OptionValue = string | { value: string; label: string };

type CompactSelectorProps = {
  label: string;
  value: string | string[];
  options: OptionValue[];
  onChange: (value: any) => void;
  placeholder?: string;
  multiple?: boolean;
};

function getOptionValue(option: OptionValue): string {
  if (typeof option === 'string') return option;
  return option.value;
}

function getOptionLabel(option: OptionValue): string {
  if (typeof option === 'string') return option;
  return option.label;
}

export function CompactSelector({
  label,
  value,
  options,
  onChange,
  placeholder = 'Selecionar',
  multiple = false,
}: CompactSelectorProps) {
  const [open, setOpen] = useState(false);

  const selected = Array.isArray(value) ? value : value ? [value] : [];

  function selecionar(option: OptionValue) {
    const optionValue = getOptionValue(option);
    if (multiple) {
      const lista = selected.includes(optionValue)
        ? selected.filter((item) => item !== optionValue)
        : [...selected, optionValue];
      onChange(lista);
    } else {
      onChange(optionValue);
      setOpen(false);
    }
  }

  function fechar() {
    setOpen(false);
  }

  const textoExibicao = multiple
    ? selected.length > 0
      ? selected
          .map((val) => {
            const found = options.find((opt) => getOptionValue(opt) === val);
            return found ? getOptionLabel(found) : val;
          })
          .join(', ')
      : placeholder
    : selected.length > 0
      ? (() => {
          const found = options.find((opt) => getOptionValue(opt) === selected[0]);
          return found ? getOptionLabel(found) : selected[0];
        })()
      : placeholder;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>

      <Pressable
        style={styles.trigger}
        onPress={() => setOpen(true)}
      >
        <Text
          style={[
            styles.triggerText,
            (!value || (Array.isArray(value) && value.length === 0)) &&
              styles.placeholder,
          ]}
          numberOfLines={1}
        >
          {textoExibicao}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={fechar}
      >
        <Pressable
          style={styles.overlay}
          onPress={fechar}
        >
          <View style={styles.sheet}>
            <ScrollView>
              {options.map((option) => {
                const optionValue = getOptionValue(option);
                const optionLabel = getOptionLabel(option);
                const ativo = selected.includes(optionValue);
                return (
                  <Pressable
                    key={optionValue}
                    style={[
                      styles.option,
                      ativo && styles.optionActive,
                    ]}
                    onPress={() => selecionar(option)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        ativo && styles.optionTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {optionLabel}
                    </Text>
                    {ativo && (
                      <Text style={styles.check}>✓</Text>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>

            {multiple && (
              <Pressable
                style={styles.confirmButton}
                onPress={fechar}
              >
                <Text style={styles.confirmText}>
                  Confirmar
                </Text>
              </Pressable>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },
  label: {
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  trigger: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  triggerText: {
    color: COLORS.white,
    fontSize: 15,
    flex: 1,
  },
  placeholder: {
    color: COLORS.muted,
  },
  arrow: {
    color: COLORS.muted,
    fontSize: 12,
    marginLeft: 10,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 25,
  },
  sheet: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 8,
    maxHeight: 320,
  },
  option: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionActive: {
    backgroundColor: COLORS.primary,
  },
  optionText: {
    color: COLORS.white,
    fontSize: 15,
    flex: 1,
  },
  optionTextActive: {
    fontWeight: 'bold',
  },
  check: {
    color: COLORS.white,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
  },
  confirmText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 15,
  },
});
