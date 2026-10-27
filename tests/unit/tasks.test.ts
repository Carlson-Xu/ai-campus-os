import { describe, expect, it } from "vitest";
import {
  applyTaskCommand,
  isCalendarDate,
  isOverdue,
  localToday,
  validateTaskInput,
  taskInputFromFormData,
  type Task,
  type TaskInput,
} from "../../src/features/tasks/model";
import {
  decodeTasks,
  readTasks,
  saveTasks,
  TASK_STORAGE_KEY,
  type StoragePort,
} from "../../src/features/tasks/storage";
import {
  createTaskStore,
  SERVER_SNAPSHOT,
} from "../../src/features/tasks/store";

const time = "2026-10-26T08:00:00.000Z";
const context = { id: () => "task-1", now: () => time };
const input: TaskInput = {
  title: "  数据结构实验  ",
  notes: "  使用链表\n测试边界  ",
  dueDate: "2026-10-30",
};
const task: Task = {
  id: "task-1",
  title: "数据结构实验",
  notes: "使用链表\n测试边界",
  dueDate: "2026-10-30",
  status: "todo",
  createdAt: time,
  updatedAt: time,
};
const encode = (tasks: Task[]) => JSON.stringify({ schemaVersion: 1, tasks });

function memoryStorage(initial: string | null = null) {
  const items = new Map<string, string>();
  if (initial !== null) items.set(TASK_STORAGE_KEY, initial);
  let writes = 0;
  const storage: StoragePort = {
    getItem: (key) => items.get(key) ?? null,
    setItem(key, value) {
      writes++;
      items.set(key, value);
    },
  };
  return { storage, items, writes: () => writes };
}

describe("task model and local dates", () => {
  it("reads the current native date value from FormData without relying on change event timing", () => {
    const data = new FormData();
    data.set("title", "日期框回归");
    data.set("notes", "浏览器自动填充");
    data.set("dueDate", "2026-10-30");
    expect(taskInputFromFormData(data)).toEqual({
      title: "日期框回归",
      notes: "浏览器自动填充",
      dueDate: "2026-10-30",
    });
    data.set("dueDate", "");
    expect(taskInputFromFormData(data).dueDate).toBe("");
  });
  it("rejects rolled-over timestamp values in persisted data", () => {
    expect(
      decodeTasks(encode([{ ...task, createdAt: "2026-02-30T08:00:00.000Z" }])),
    ).toMatchObject({ ok: false });
  });
  it("creates normalized task without mutating the old list", () => {
    const old: Task[] = [];
    expect(applyTaskCommand(old, { type: "create", input }, context)).toEqual([
      task,
    ]);
    expect(old).toEqual([]);
  });
  it("allows optional notes and deadline", () => {
    expect(
      applyTaskCommand(
        [],
        { type: "create", input: { title: "阅读", notes: "", dueDate: "" } },
        context,
      )[0],
    ).toMatchObject({ notes: "", dueDate: null });
  });
  it("edits task while preserving identity, status, creation time", () => {
    const old = { ...task, status: "done" as const };
    const updated = applyTaskCommand(
      [old],
      {
        type: "edit",
        id: task.id,
        expectedUpdatedAt: time,
        input: { title: "修改标题", notes: "", dueDate: "" },
      },
      context,
    )[0];
    expect(updated).toMatchObject({
      id: task.id,
      createdAt: time,
      status: "done",
      title: "修改标题",
      notes: "",
      dueDate: null,
    });
    expect(updated.updatedAt).not.toBe(time);
    expect(old.title).toBe(task.title);
  });
  it("completes and restores a task", () => {
    const done = applyTaskCommand(
      [task],
      {
        type: "set-status",
        id: task.id,
        expectedUpdatedAt: time,
        status: "done",
      },
      context,
    );
    expect(done[0].status).toBe("done");
    const restored = applyTaskCommand(
      done,
      {
        type: "set-status",
        id: task.id,
        expectedUpdatedAt: done[0].updatedAt,
        status: "todo",
      },
      context,
    );
    expect(restored[0].status).toBe("todo");
  });
  it("deletes only the selected task", () => {
    expect(
      applyTaskCommand(
        [task, { ...task, id: "other" }],
        { type: "delete", id: task.id, expectedUpdatedAt: time },
        context,
      ).map((value) => value.id),
    ).toEqual(["other"]);
  });
  it("rejects missing or stale targets and duplicate IDs", () => {
    expect(() =>
      applyTaskCommand(
        [],
        { type: "delete", id: task.id, expectedUpdatedAt: time },
        context,
      ),
    ).toThrow("不存在");
    expect(() =>
      applyTaskCommand(
        [task],
        { type: "delete", id: task.id, expectedUpdatedAt: "old" },
        context,
      ),
    ).toThrow("更新");
    expect(() =>
      applyTaskCommand([task], { type: "create", input }, context),
    ).toThrow("重复");
  });
  it.each(["", "   ", "\n\t", "a".repeat(121)])(
    "rejects invalid title %j",
    (title) => {
      expect(validateTaskInput({ ...input, title }).title).toBeTruthy();
      expect(() =>
        applyTaskCommand(
          [],
          { type: "create", input: { ...input, title } },
          context,
        ),
      ).toThrow();
    },
  );
  it("rejects overlong notes and invalid dates", () => {
    expect(
      validateTaskInput({
        ...input,
        notes: "a".repeat(2001),
        dueDate: "2026-02-30",
      }),
    ).toHaveProperty("notes");
    expect(
      validateTaskInput({ ...input, dueDate: "2026-02-30" }),
    ).toHaveProperty("dueDate");
  });
  it.each([
    "2024-02-29",
    "2000-02-29",
    "2026-10-26",
    "0001-01-01",
    "9999-12-31",
  ])("accepts calendar date %s", (date) =>
    expect(isCalendarDate(date)).toBe(true),
  );
  it.each([
    "1900-02-29",
    "2026-02-29",
    "2026-04-31",
    "2026-00-01",
    "2026-13-01",
    "2026-01-00",
    "0000-01-01",
    "2026-1-1",
    "2026-10-26T00:00:00Z",
  ])("rejects calendar date %s", (date) =>
    expect(isCalendarDate(date)).toBe(false),
  );
  it("uses local calendar getters rather than UTC for today", () => {
    expect(localToday(new Date(2026, 0, 1, 0, 5))).toBe("2026-01-01");
  });
  it("treats due-today as not overdue and ignores completed/undated tasks", () => {
    expect(isOverdue(task, "2026-10-30")).toBe(false);
    expect(isOverdue(task, "2026-10-31")).toBe(true);
    expect(isOverdue({ ...task, status: "done" }, "2026-10-31")).toBe(false);
    expect(isOverdue({ ...task, dueDate: null }, "2026-10-31")).toBe(false);
  });
});

describe("versioned storage validation", () => {
  it("loads missing and intentionally empty storage without seeding", () => {
    expect(decodeTasks(null)).toEqual({ ok: true, tasks: [], raw: null });
    expect(decodeTasks(encode([]))).toMatchObject({ ok: true, tasks: [] });
  });
  it("round-trips dates, notes, status and revisions", () => {
    expect(decodeTasks(encode([task]))).toEqual({
      ok: true,
      tasks: [task],
      raw: encode([task]),
    });
  });
  it.each([
    "",
    "broken",
    "null",
    "[]",
    "{}",
    JSON.stringify({ schemaVersion: 2, tasks: [] }),
    encode([{ ...task, dueDate: "2026-02-30" }]),
    encode([{ ...task, title: " " }]),
    encode([{ ...task, status: "other" } as unknown as Task]),
    encode([{ ...task, createdAt: "invalid" }]),
    encode([{ ...task, futureField: true } as Task]),
    encode([task, task]),
  ])("protects malformed or incompatible original data %j", (raw) => {
    expect(decodeTasks(raw)).toMatchObject({ ok: false, raw });
  });
  it("handles denied storage without throwing", () => {
    expect(
      readTasks(() => {
        throw new Error("denied");
      }),
    ).toMatchObject({ ok: false, raw: null });
  });
  it("rejects invalid writes", () => {
    const memory = memoryStorage();
    expect(
      saveTasks(() => memory.storage, [{ ...task, title: "" }], null).ok,
    ).toBe(false);
    expect(memory.writes()).toBe(0);
  });
  it("refuses to overwrite changes from another tab", () => {
    const memory = memoryStorage(encode([task]));
    expect(saveTasks(() => memory.storage, [], null)).toMatchObject({
      ok: false,
      conflict: true,
    });
    expect(memory.items.get(TASK_STORAGE_KEY)).toBe(encode([task]));
    expect(memory.writes()).toBe(0);
  });
});

describe("task store lifecycle and persistence", () => {
  it("does not access browser storage during construction or SSR", () => {
    let reads = 0;
    const store = createTaskStore(() => {
      reads++;
      throw new Error();
    }, context);
    expect(store.getServerSnapshot()).toBe(SERVER_SNAPSHOT);
    expect(store.getSnapshot()).toBe(SERVER_SNAPSHOT);
    expect(store.execute({ type: "create", input })).toBe(false);
    expect(reads).toBe(0);
  });
  it("reads existing tasks on subscription, including Strict Mode resubscription, without any writes", () => {
    const memory = memoryStorage(encode([task]));
    const store = createTaskStore(() => memory.storage, context);
    store.subscribe(() => {})();
    store.subscribe(() => {})();
    expect(store.getSnapshot().tasks).toEqual([task]);
    expect(memory.writes()).toBe(0);
  });
  it("persists the complete CRUD lifecycle across new store instances", () => {
    const memory = memoryStorage();
    const store = createTaskStore(() => memory.storage, context);
    store.subscribe(() => {});
    expect(store.execute({ type: "create", input })).toBe(true);
    const restored = createTaskStore(() => memory.storage, context);
    restored.subscribe(() => {});
    expect(restored.getSnapshot().tasks).toEqual([task]);
    expect(
      restored.execute({
        type: "edit",
        id: task.id,
        expectedUpdatedAt: time,
        input: { ...input, title: "编辑后" },
      }),
    ).toBe(true);
    const edited = restored.getSnapshot().tasks[0];
    expect(
      restored.execute({
        type: "set-status",
        id: task.id,
        expectedUpdatedAt: edited.updatedAt,
        status: "done",
      }),
    ).toBe(true);
    const done = restored.getSnapshot().tasks[0];
    expect(decodeTasks(memory.items.get(TASK_STORAGE_KEY)!)).toMatchObject({
      ok: true,
      tasks: [{ title: "编辑后", status: "done" }],
    });
    expect(
      restored.execute({
        type: "set-status",
        id: task.id,
        expectedUpdatedAt: done.updatedAt,
        status: "todo",
      }),
    ).toBe(true);
    expect(
      restored.execute({
        type: "delete",
        id: task.id,
        expectedUpdatedAt: restored.getSnapshot().tasks[0].updatedAt,
      }),
    ).toBe(true);
    const empty = createTaskStore(() => memory.storage, context);
    empty.subscribe(() => {});
    expect(empty.getSnapshot().tasks).toEqual([]);
  });
  it("blocks writes and preserves raw corrupted storage on reload", () => {
    const memory = memoryStorage("{broken");
    const store = createTaskStore(() => memory.storage, context);
    store.subscribe(() => {});
    expect(store.getSnapshot()).toMatchObject({
      phase: "blocked",
      raw: "{broken",
    });
    expect(store.execute({ type: "create", input })).toBe(false);
    store.reload();
    expect(memory.items.get(TASK_STORAGE_KEY)).toBe("{broken");
    expect(memory.writes()).toBe(0);
  });
  it("preserves the saved list and reports quota failure; retry succeeds", () => {
    const memory = memoryStorage(encode([task]));
    let fail = true;
    const port = {
      ...memory.storage,
      setItem(key: string, value: string) {
        if (fail) throw new Error("QuotaExceededError");
        memory.storage.setItem(key, value);
      },
    };
    const store = createTaskStore(() => port, context);
    store.subscribe(() => {});
    const command = {
      type: "delete" as const,
      id: task.id,
      expectedUpdatedAt: time,
    };
    expect(store.execute(command)).toBe(false);
    expect(store.getSnapshot().tasks).toEqual([task]);
    expect(store.getSnapshot().error).toContain("保存失败");
    expect(memory.items.get(TASK_STORAGE_KEY)).toBe(encode([task]));
    fail = false;
    expect(store.execute(command)).toBe(true);
    expect(store.getSnapshot().error).toBe(null);
  });
  it("detects stale tab snapshots, reloads, and rejects stale edit revisions", () => {
    const memory = memoryStorage(encode([task]));
    const first = createTaskStore(() => memory.storage, context);
    const second = createTaskStore(() => memory.storage, context);
    first.subscribe(() => {});
    second.subscribe(() => {});
    expect(
      first.execute({
        type: "edit",
        id: task.id,
        expectedUpdatedAt: time,
        input: { ...input, title: "另一个标签页" },
      }),
    ).toBe(true);
    const command = {
      type: "delete" as const,
      id: task.id,
      expectedUpdatedAt: time,
    };
    expect(second.execute(command)).toBe(false);
    expect(second.getSnapshot().tasks[0].title).toBe("另一个标签页");
    expect(second.execute(command)).toBe(false);
    expect(first.getSnapshot().tasks[0].title).toBe("另一个标签页");
  });
});
