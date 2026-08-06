import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>DOJO LB</Text>
      <Text style={styles.subtitle}>Acesso exclusivo para professores</Text>

      <Link href="/professor/login" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Sou Professor</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 25,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    textAlign: 'center',
    color: '#000',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 60,
    fontSize: 18,
  },
  button: {
    backgroundColor: '#000',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
