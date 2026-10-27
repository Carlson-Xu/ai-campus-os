export const TITLE_LIMIT = 120;
export const NOTES_LIMIT = 2000;

export type TaskStatus = "todo" | "done";

export interface Task {
  id: string;
  title: string;
  notes: string;
  // Calendar date, not an instant. Never convert it with toISOString().
  dueDate: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TaskInput {
  title: string;
  notes: string;
  dueDate: string;
}

export type InputErrors = Partial<Record<keyof TaskInput, string>>;

// Read the actual form values on submit, including browser autofill/native dates.
export function taskInputFromFormData(data: Pick<FormData, "get">): TaskInput {
  const text = (name: string) => {
    const value = data.get(name);
    return typeof value === "string" ? value : "";
  };
  return {
    title: text("title"),
    notes: text("notes"),
    dueDate: text("dueDate"),
  };
}

export function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= days[month - 1];
}

export function validateTaskInput(input: TaskInput): InputErrors {
  const errors: InputErrors = {};
  if (!input.title.trim()) errors.title = "请填写任务标题，不能只有空格。";
  else if (input.title.trim().length > TITLE_LIMIT)
    errors.title = `标题不能超过 ${TITLE_LIMIT} 个字符。`;
  if (input.notes.length > NOTES_LIMIT)
    errors.notes = `备注不能超过 ${NOTES_LIMIT} 个字符。`;
  if (input.dueDate !== "" && !isCalendarDate(input.dueDate))
    errors.dueDate = "请填写有效的截止日期。";
  return errors;
}

export function localToday(date = new Date()): string {
  return `${date.getFullYear().toString().padStart(4, "0")}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
}

export function isOverdue(task: Task, today: string): boolean {
  return (
    task.status === "todo" && task.dueDate !== null && task.dueDate < today
  );
}

export type TaskCommand =
  | { type: "create"; input: TaskInput }
  | { type: "edit"; id: string; expectedUpdatedAt: string; input: TaskInput }
  | {
      type: "set-status";
      id: string;
      expectedUpdatedAt: string;
      status: TaskStatus;
    }
  | { type: "delete"; id: string; expectedUpdatedAt: string };

export function applyTaskCommand(
  tasks: readonly Task[],
  command: TaskCommand,
  context: { id: () => string; now: () => string },
): Task[] {
  if (command.type === "create" || command.type === "edit") {
    const errors = validateTaskInput(command.input);
    if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
  }
  if (command.type === "create") {
    const now = context.now();
    const id = context.id();
    if (tasks.some((task) => task.id === id))
      throw new Error("任务编号重复，请重试。");
    return [
      {
        id,
        title: command.input.title.trim(),
        notes: command.input.notes.trim(),
        dueDate: command.input.dueDate || null,
        status: "todo",
        createdAt: now,
        updatedAt: now,
      },
      ...tasks,
    ];
  }
  const target = tasks.find((task) => task.id === command.id);
  if (!target) throw new Error("任务已不存在，请重新查看列表。");
  if (target.updatedAt !== command.expectedUpdatedAt)
    throw new Error(
      "任务已在其他位置更新，请取消编辑后重新打开，避免覆盖新内容。",
    );
  if (command.type === "delete")
    return tasks.filter((task) => task.id !== command.id);
  // Ensure revisions still change when two actions happen in the same millisecond.
  const updatedAt = new Date(
    Math.max(Date.parse(context.now()), Date.parse(target.updatedAt) + 1),
  ).toISOString();
  return tasks.map((task) => {
    if (task.id !== target.id) return task;
    if (command.type === "set-status")
      return { ...task, status: command.status, updatedAt };
    return {
      ...task,
      title: command.input.title.trim(),
      notes: command.input.notes.trim(),
      dueDate: command.input.dueDate || null,
      updatedAt,
    };
  });
}
