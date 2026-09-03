import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/components/Colors";
import { Tabs } from "expo-router";
import { View } from "react-native";

function TabBarIcon({
  name,
  color,
  focused,
}: {
  name: string;
  color: string;
  focused: boolean;
}) {
  return (
    <View style={{ alignItems: "center" }}>
      <Ionicons
        name={name as any}
        size={20}
        color={color}
      />
      <View
        style={{
          width: 20,
          height: 2,
          backgroundColor: focused
            ? COLORS.primary
            : "transparent",
          borderRadius: 1,
          marginTop: 2,
        }}
      />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          backgroundColor: "#0A0A0A",
          borderTopColor: "#1E1E1E",
          borderTopWidth: 1,
          elevation: 0,
          shadowColor: "#000000",
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },

        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.muted,

        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          letterSpacing: 0.3,
          marginTop: 0,
        },

        tabBarItemStyle: {
          alignItems: "center",
        },
      }}
    >

      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon
              name="home"
              color={color}
              focused={focused}
            />
          ),
        }}
      />


      <Tabs.Screen
        name="alunos"
        options={{
          title: "Alunos",
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon
              name="people"
              color={color}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="agenda"
        options={{
          title: "Agenda",
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon
              name="calendar"
              color={color}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="financeiro"
        options={{
          title: "Financeiro",
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon
              name="cash"
              color={color}
              focused={focused}
            />
          ),
        }}
      />


      <Tabs.Screen
        name="treinos"
        options={{
          title: "Treinos",
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon
              name="barbell"
              color={color}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon
              name="clipboard"
              color={color}
              focused={focused}
            />
          ),
        }}
      />

    </Tabs>
  );
}
