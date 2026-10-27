"use client";

import { isOverdue, localToday, type Task } from "./model";

export function TaskList({
  tasks,
  disabled,
  onEdit,
  onStatus,
  onDelete,
}: {
  tasks: readonly Task[];
  disabled: boolean;
  onEdit: (task: Task) => void;
  onStatus: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const today = localToday();
  if (!tasks.length)
    return (
      <div className="empty-state py-16">
        <span className="empty-icon large" aria-hidden="true">
          ☷
        </span>
        <h3>从一件小事开始</h3>
        <p>还没有任务。填写标题，添加你的第一条学习待办。</p>
        <p>你添加的内容只保存在当前浏览器。</p>
      </div>
    );
  return (
    <div className="task-groups">
      {(["todo", "done"] as const).map((status) => {
        const group = tasks.filter((task) => task.status === status);
        if (!group.length) return null;
        return (
          <section key={status} aria-labelledby={`group-${status}`}>
            <h3 id={`group-${status}`} className="task-group-title">
              {status === "todo" ? "待完成" : "已完成"}
              <span>{group.length}</span>
            </h3>
            <ul className="space-y-3">
              {group.map((task) => (
                <li
                  key={task.id}
                  className={`task-card ${task.status === "done" ? "task-card-done" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      className="task-status-button"
                      disabled={disabled}
                      onClick={() => onStatus(task)}
                      aria-label={`${task.status === "done" ? "恢复未完成" : "标记完成"}：${task.title}`}
                    >
                      <span aria-hidden="true">
                        {task.status === "done" ? "✓" : "○"}
                      </span>
                    </button>
                    <div className="min-w-0 flex-1">
                      <h4 className="task-card-title">{task.title}</h4>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                          className={
                            task.status === "done"
                              ? "task-tag task-tag-done"
                              : "task-tag"
                          }
                        >
                          {task.status === "done" ? "已完成" : "待完成"}
                        </span>
                        <span
                          className={`task-deadline ${isOverdue(task, today) ? "task-overdue" : ""}`}
                        >
                          {task.dueDate ? (
                            <>
                              <time dateTime={task.dueDate}>
                                {task.dueDate}
                              </time>{" "}
                              截止
                              {isOverdue(task, today)
                                ? " · 已逾期"
                                : task.dueDate === today &&
                                    task.status === "todo"
                                  ? " · 今天"
                                  : ""}
                            </>
                          ) : (
                            "未设置截止日期"
                          )}
                        </span>
                      </div>
                      {task.notes && <p className="task-notes">{task.notes}</p>}
                    </div>
                  </div>
                  <div className="task-card-actions">
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onEdit(task)}
                      aria-label={`编辑：${task.title}`}
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      disabled={disabled}
                      className="task-delete-button"
                      onClick={() => onDelete(task)}
                      aria-label={`删除：${task.title}`}
                    >
                      删除
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
