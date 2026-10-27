import { applyTaskCommand, type Task, type TaskCommand } from "./model";
import { readTasks, saveTasks, type StoragePort } from "./storage";

export interface TaskSnapshot {
  phase: "loading" | "ready" | "blocked";
  tasks: readonly Task[];
  raw: string | null;
  error: string | null;
}

// Stable server snapshot prevents hydration mismatches and never touches storage.
export const SERVER_SNAPSHOT: TaskSnapshot = {
  phase: "loading",
  tasks: [],
  raw: null,
  error: null,
};

export function createTaskStore(
  getStorage: () => StoragePort,
  context = {
    id: () => crypto.randomUUID(),
    now: () => new Date().toISOString(),
  },
) {
  let snapshot = SERVER_SNAPSHOT;
  const listeners = new Set<() => void>();
  function publish(next: TaskSnapshot) {
    snapshot = next;
    listeners.forEach((listener) => listener());
  }
  function reload() {
    const result = readTasks(getStorage);
    if (
      result.ok &&
      snapshot.phase === "ready" &&
      result.raw === snapshot.raw &&
      snapshot.error === null
    )
      return;
    publish(
      result.ok
        ? { phase: "ready", tasks: result.tasks, raw: result.raw, error: null }
        : {
            phase: "blocked",
            tasks: snapshot.tasks,
            raw: result.raw,
            error: result.error,
          },
    );
  }
  return {
    getSnapshot: () => snapshot,
    getServerSnapshot: () => SERVER_SNAPSHOT,
    subscribe(listener: () => void) {
      listeners.add(listener);
      if (listeners.size === 1) reload();
      return () => {
        listeners.delete(listener);
      };
    },
    reload,
    execute(command: TaskCommand): boolean {
      if (snapshot.phase !== "ready") return false;
      try {
        const tasks = applyTaskCommand(snapshot.tasks, command, context);
        const saved = saveTasks(getStorage, tasks, snapshot.raw);
        if (!saved.ok) {
          if (saved.conflict) reload();
          publish({ ...snapshot, error: saved.error });
          return false;
        }
        publish({ phase: "ready", tasks, raw: saved.raw, error: null });
        return true;
      } catch (error) {
        publish({
          ...snapshot,
          error:
            error instanceof Error
              ? error.message
              : "操作失败，本次修改未保存。",
        });
        return false;
      }
    },
  };
}
