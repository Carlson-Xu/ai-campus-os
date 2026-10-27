"use client";

import { useSyncExternalStore } from "react";
import { createTaskStore } from "./store";
import { TASK_STORAGE_KEY } from "./storage";

// The getter is evaluated after hydration, never during server rendering.
const store = createTaskStore(() => window.localStorage);

function subscribe(listener: () => void) {
  const unsubscribe = store.subscribe(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === TASK_STORAGE_KEY || event.key === null) store.reload();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener("focus", store.reload);
  return () => {
    unsubscribe();
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("focus", store.reload);
  };
}

export function useTasks() {
  const snapshot = useSyncExternalStore(
    subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  return { ...snapshot, execute: store.execute, reload: store.reload };
}
