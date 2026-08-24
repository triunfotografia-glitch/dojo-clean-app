type Listener = () => void;

const listeners = new Set<Listener>();

export function onAuthLost(listener: Listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function notifyAuthLost() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch {
      // Ignora erros de listeners individuais
    }
  });
}
