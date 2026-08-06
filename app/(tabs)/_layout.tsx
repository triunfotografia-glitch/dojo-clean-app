import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          backgroundColor: "#050505",
          borderTopColor: "#222",
        },

        tabBarActiveTintColor: "#E10600",
        tabBarInactiveTintColor: "#FFFFFF",
      }}
    >

      <Tabs.Screen
        name="index"
        options={{
          title: "Início",

          tabBarIcon: ({ color }) => (
            <Ionicons
              name="home"
              size={26}
              color={color}
            />
          ),
        }}
      />


      <Tabs.Screen
        name="alunos"
        options={{
          title: "Alunos",

          tabBarIcon: ({ color }) => (
            <Ionicons
              name="people"
              size={26}
              color={color}
            />
          ),
        }}
      />


      <Tabs.Screen
        name="agenda"
        options={{
          title: "Agenda",

          tabBarIcon: ({ color }) => (
            <Ionicons
              name="calendar"
              size={26}
              color={color}
            />
          ),
        }}
      />


      <Tabs.Screen
        name="financeiro"
        options={{
          title: "Financeiro",

          tabBarIcon: ({ color }) => (
            <Ionicons
              name="cash"
              size={26}
              color={color}
            />
          ),
        }}
      />


      <Tabs.Screen
        name="treinos"
        options={{
          title: "Treinos",

          tabBarIcon: ({ color }) => (
            <Ionicons
              name="barbell"
              size={26}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",

          tabBarIcon: ({ color }) => (
            <Ionicons
              name="clipboard"
              size={26}
              color={color}
            />
          ),
        }}
      />

    </Tabs>
  );
}