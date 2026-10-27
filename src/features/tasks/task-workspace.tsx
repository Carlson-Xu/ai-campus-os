"use client";

import { useRef, useState } from "react";
import { TaskForm } from "./task-form";
import { TaskList } from "./task-list";
import { useTasks } from "./use-tasks";
import { ConfirmationDialog } from "./confirmation-dialog";
import type { Task, TaskInput } from "./model";

export function TaskWorkspace() {
  const { phase, tasks, raw, error, execute, reload } = useTasks();
  const [editing, setEditing] = useState<Task | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [notice, setNotice] = useState("");
  const [dirty, setDirty] = useState(false);
  const [pending, setPending] = useState<
    { type: "delete" | "edit"; task: Task } | { type: "cancel" } | null
  >(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [downloadError, setDownloadError] = useState("");
  const completed = tasks.filter((task) => task.status === "done").length;

  function resetForm() {
    setEditing(null);
    setDirty(false);
    setFormKey((key) => key + 1);
  }
  function save(input: TaskInput) {
    setNotice("");
    const success = execute(
      editing
        ? {
            type: "edit",
            id: editing.id,
            expectedUpdatedAt: editing.updatedAt,
            input,
          }
        : { type: "create", input },
    );
    if (success) {
      setNotice(
        editing ? "修改已保存到当前浏览器。" : "任务已添加并保存到当前浏览器。",
      );
      resetForm();
    }
    return success;
  }
  function startEdit(task: Task) {
    if (dirty) {
      setPending({ type: "edit", task });
      return;
    }
    openEditor(task);
  }
  function openEditor(task: Task) {
    setEditing(task);
    setDirty(false);
    setFormKey((key) => key + 1);
    setNotice("");
    editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    requestAnimationFrame(() =>
      editorRef.current?.querySelector<HTMLInputElement>("input")?.focus(),
    );
  }
  function changeStatus(task: Task) {
    setNotice("");
    if (
      execute({
        type: "set-status",
        id: task.id,
        expectedUpdatedAt: task.updatedAt,
        status: task.status === "done" ? "todo" : "done",
      })
    )
      setNotice(
        task.status === "done"
          ? "任务已恢复为未完成并保存。"
          : "任务已完成并保存。",
      );
  }
  function remove(task: Task) {
    setNotice("");
    if (
      execute({
        type: "delete",
        id: task.id,
        expectedUpdatedAt: task.updatedAt,
      })
    ) {
      if (editing?.id === task.id) resetForm();
      setNotice("任务已删除并保存。");
    }
  }
  function downloadBackup() {
    if (raw === null) return;
    try {
      const url = URL.createObjectURL(
        new Blob([raw], { type: "text/plain;charset=utf-8" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = "ai-campus-os-tasks-backup.txt";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setDownloadError("");
    } catch {
      setDownloadError("下载失败，请在浏览器开发者工具中备份原始存储数据。");
    }
  }
  if (phase === "loading")
    return (
      <div className="panel p-8 text-sm text-slate-500" role="status">
        正在读取本地任务，请稍候……
      </div>
    );

  return (
    <>
      <div className="task-summary">
        <span className="task-summary-dot" aria-hidden="true" />
        <span>本地任务空间</span>
        <span className="ml-auto">
          {phase === "blocked"
            ? "等待恢复读取"
            : `${tasks.length - completed} 项待完成 · ${completed} 项已完成`}
        </span>
      </div>
      {error && (
        <div className="task-error" role="alert">
          <strong>
            {phase === "blocked"
              ? "任务数据已保护，暂不可修改"
              : "本次操作未保存"}
          </strong>
          <p>{error}</p>
          {phase === "blocked" && tasks.length > 0 && (
            <p>下方是最近一次成功读取的内容，可能不是最新数据。</p>
          )}
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                reload();
                setNotice("");
              }}
            >
              重新读取
            </button>
            {raw !== null && (
              <button type="button" onClick={downloadBackup}>
                下载原文备份
              </button>
            )}
          </div>
          {downloadError && <p>{downloadError}</p>}
        </div>
      )}
      <p className="task-save-message" role="status" aria-live="polite">
        {notice}
      </p>
      <div className="task-workspace-grid">
        <section className="panel min-w-0" aria-labelledby="tasks-title">
          <div className="section-heading">
            <div>
              <h2 id="tasks-title">我的学习任务</h2>
              <p className="mt-2 text-xs text-slate-500">
                把下一步写下来，按自己的节奏完成。
              </p>
            </div>
            <span className="subtle-tag">
              {phase === "blocked" ? "读取受阻" : `共 ${tasks.length} 项`}
            </span>
          </div>
          {phase === "blocked" && tasks.length === 0 ? (
            <div className="empty-state py-16">
              <h3>暂时无法显示任务</h3>
              <p>请先处理上方存储问题。应用没有清空或覆盖原数据。</p>
            </div>
          ) : (
            <TaskList
              tasks={tasks}
              disabled={phase !== "ready"}
              onEdit={startEdit}
              onStatus={changeStatus}
              onDelete={(task) => setPending({ type: "delete", task })}
            />
          )}
        </section>
        <div ref={editorRef} className="task-editor">
          <TaskForm
            key={formKey}
            task={editing}
            disabled={phase !== "ready"}
            onSave={save}
            onDirtyChange={setDirty}
            onCancel={() => {
              if (dirty) setPending({ type: "cancel" });
              else resetForm();
            }}
          />
        </div>
      </div>
      {pending && (
        <ConfirmationDialog
          title={
            pending.type === "delete" ? "删除这条任务？" : "放弃未保存的输入？"
          }
          message={
            pending.type === "delete"
              ? `将删除“${pending.task.title}”。此操作无法撤销。`
              : "未保存的表单内容将被替换，已经保存的任务不受影响。"
          }
          confirmLabel={pending.type === "delete" ? "确认删除" : "放弃输入"}
          onCancel={() => setPending(null)}
          onConfirm={() => {
            const action = pending;
            setPending(null);
            if (action.type === "delete") remove(action.task);
            else if (action.type === "edit") openEditor(action.task);
            else resetForm();
          }}
        />
      )}
      <p className="preview-note">
        仅保存在当前浏览器与站点，不跨设备同步。清除站点数据或在无痕模式退出后可能丢失任务，请勿将此处作为唯一备份。
      </p>
    </>
  );
}
