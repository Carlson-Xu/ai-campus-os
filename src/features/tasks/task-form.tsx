"use client";

import { useRef, useState, type FormEvent } from "react";
import {
  localToday,
  NOTES_LIMIT,
  TITLE_LIMIT,
  validateTaskInput,
  taskInputFromFormData,
  type InputErrors,
  type Task,
  type TaskInput,
} from "./model";

export function TaskForm({
  task,
  disabled,
  onSave,
  onCancel,
  onDirtyChange,
}: {
  task: Task | null;
  disabled: boolean;
  onSave: (input: TaskInput) => boolean;
  onCancel: () => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const [input, setInput] = useState<TaskInput>({
    title: task?.title ?? "",
    notes: task?.notes ?? "",
    dueDate: task?.dueDate ?? "",
  });
  const [errors, setErrors] = useState<InputErrors>({});
  const formRef = useRef<HTMLFormElement>(null);
  function change(next: TaskInput) {
    setInput(next);
    onDirtyChange(
      next.title !== (task?.title ?? "") ||
        next.notes !== (task?.notes ?? "") ||
        next.dueDate !== (task?.dueDate ?? ""),
    );
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitted = taskInputFromFormData(new FormData(event.currentTarget));
    setInput(submitted);
    const nextErrors = validateTaskInput(submitted);
    if (
      formRef.current?.querySelector<HTMLInputElement>("#task-date")?.validity
        .badInput
    ) {
      nextErrors.dueDate = "请填写完整、有效的截止日期，或清空日期。";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      const first = Object.keys(nextErrors)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    onSave(submitted);
  }
  return (
    <section
      className="panel task-form-panel"
      aria-labelledby="task-form-title"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">一步一步，付诸行动</p>
          <h2 id="task-form-title" className="mt-2">
            {task ? "编辑任务" : "新增任务"}
          </h2>
        </div>
        <span className="subtle-tag">{task ? "正在编辑" : "手动录入"}</span>
      </div>
      <form ref={formRef} onSubmit={submit} noValidate className="task-form">
        <fieldset disabled={disabled} className="min-w-0 space-y-5">
          <div>
            <label htmlFor="task-title">
              任务标题 <span className="text-teal-700">*</span>
            </label>
            <input
              id="task-title"
              name="title"
              type="text"
              required
              maxLength={TITLE_LIMIT}
              value={input.title}
              onChange={(event) =>
                change({ ...input, title: event.target.value })
              }
              placeholder="例如：完成数据结构实验报告"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? "title-error" : "title-hint"}
            />
            <p id="title-hint" className="field-hint">
              必填，最多 {TITLE_LIMIT} 个字符
            </p>
            {errors.title && (
              <p id="title-error" className="field-error" role="alert">
                {errors.title}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="task-date">
              截止日期 <span className="field-optional">选填</span>
            </label>
            <input
              id="task-date"
              name="dueDate"
              type="date"
              defaultValue={task?.dueDate ?? ""}
              onInput={(event) =>
                change({ ...input, dueDate: event.currentTarget.value })
              }
              onChange={(event) =>
                change({ ...input, dueDate: event.target.value })
              }
              aria-invalid={Boolean(errors.dueDate)}
              aria-describedby={errors.dueDate ? "date-error" : "date-hint"}
            />
            <p id="date-hint" className="field-hint">
              按本地日历日期记录，不指定具体时刻。
            </p>
            {input.dueDate && input.dueDate < localToday() && (
              <p className="text-xs leading-6 text-amber-700">
                这是过去的日期，仍可保存为待补办任务。
              </p>
            )}
            {errors.dueDate && (
              <p id="date-error" className="field-error" role="alert">
                {errors.dueDate}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="task-notes">
              备注 <span className="field-optional">选填</span>
            </label>
            <textarea
              id="task-notes"
              name="notes"
              rows={4}
              maxLength={NOTES_LIMIT}
              value={input.notes}
              onChange={(event) =>
                change({ ...input, notes: event.target.value })
              }
              placeholder="记下要求、想法或下一步……"
              aria-invalid={Boolean(errors.notes)}
              aria-describedby={errors.notes ? "notes-error" : "notes-hint"}
            />
            <p id="notes-hint" className="field-hint">
              {input.notes.length} / {NOTES_LIMIT}
            </p>
            {errors.notes && (
              <p id="notes-error" className="field-error" role="alert">
                {errors.notes}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="task-primary-button" type="submit">
              {task ? "保存修改" : "添加任务"} <span aria-hidden="true">↗</span>
            </button>
            {task && (
              <button
                className="task-secondary-button"
                type="button"
                onClick={onCancel}
              >
                取消编辑
              </button>
            )}
          </div>
        </fieldset>
      </form>
    </section>
  );
}
