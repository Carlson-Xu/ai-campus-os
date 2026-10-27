import { isCalendarDate, NOTES_LIMIT, TITLE_LIMIT, type Task } from "./model";

export const TASK_STORAGE_KEY = "ai-campus-os:tasks:v1";

export interface StoragePort {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export type LoadResult =
  | { ok: true; tasks: Task[]; raw: string | null }
  | { ok: false; error: string; raw: string | null };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTimestamp(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString() === value
  );
}

function isTask(value: unknown): value is Task {
  if (!isRecord(value)) return false;
  // Unknown fields may belong to a newer model: do not silently discard them.
  const fields = [
    "id",
    "title",
    "notes",
    "dueDate",
    "status",
    "createdAt",
    "updatedAt",
  ];
  return (
    Object.keys(value).length === fields.length &&
    fields.every((field) => field in value) &&
    typeof value.id === "string" &&
    value.id.trim().length > 0 &&
    typeof value.title === "string" &&
    value.title.trim().length > 0 &&
    value.title.length <= TITLE_LIMIT &&
    typeof value.notes === "string" &&
    value.notes.length <= NOTES_LIMIT &&
    (value.dueDate === null ||
      (typeof value.dueDate === "string" && isCalendarDate(value.dueDate))) &&
    (value.status === "todo" || value.status === "done") &&
    isTimestamp(value.createdAt) &&
    isTimestamp(value.updatedAt) &&
    Date.parse(value.updatedAt) >= Date.parse(value.createdAt)
  );
}

export function decodeTasks(raw: string | null): LoadResult {
  if (raw === null) return { ok: true, tasks: [], raw };
  try {
    const data: unknown = JSON.parse(raw);
    if (
      !isRecord(data) ||
      data.schemaVersion !== 1 ||
      Object.keys(data).length !== 2 ||
      !Array.isArray(data.tasks) ||
      !data.tasks.every(isTask)
    )
      throw new Error();
    const ids = new Set(data.tasks.map((task) => task.id));
    if (ids.size !== data.tasks.length) throw new Error();
    return { ok: true, tasks: data.tasks, raw };
  } catch {
    return {
      ok: false,
      raw,
      error:
        "本地任务数据损坏或版本不兼容，已停止写入以保护原数据。请下载原文备份，再排查或恢复数据。",
    };
  }
}

export function readTasks(getStorage: () => StoragePort): LoadResult {
  try {
    return decodeTasks(getStorage().getItem(TASK_STORAGE_KEY));
  } catch {
    return {
      ok: false,
      raw: null,
      error:
        "无法读取浏览器存储。请检查站点存储权限后重新读取，当前不会写入任务。",
    };
  }
}

export type SaveResult =
  { ok: true; raw: string } | { ok: false; conflict: boolean; error: string };

export function saveTasks(
  getStorage: () => StoragePort,
  tasks: readonly Task[],
  expectedRaw: string | null,
): SaveResult {
  try {
    const storage = getStorage();
    if (storage.getItem(TASK_STORAGE_KEY) !== expectedRaw) {
      return {
        ok: false,
        conflict: true,
        error:
          "本地数据已被其他页面修改，已重新读取；本次操作未保存，请核对后重试。",
      };
    }
    const raw = JSON.stringify({ schemaVersion: 1, tasks });
    if (!decodeTasks(raw).ok)
      return {
        ok: false,
        conflict: false,
        error: "任务数据未通过校验，本次操作未保存。",
      };
    storage.setItem(TASK_STORAGE_KEY, raw);
    return { ok: true, raw };
  } catch {
    return {
      ok: false,
      conflict: false,
      error:
        "保存失败：浏览器存储不可用或空间不足。列表未改变，请保留表单内容并在释放空间后重试。",
    };
  }
}
