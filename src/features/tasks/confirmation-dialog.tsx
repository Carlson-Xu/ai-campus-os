"use client";

import { useEffect, useRef } from "react";

export function ConfirmationDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="task-confirm-dialog"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      <p className="eyebrow">请确认本次操作</p>
      <h2 id="confirm-title" className="mt-3 text-lg font-semibold">
        {title}
      </h2>
      <p
        id="confirm-message"
        className="mt-3 break-words text-sm leading-7 text-slate-600"
      >
        {message}
      </p>
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button
          autoFocus
          type="button"
          className="task-secondary-button"
          onClick={onCancel}
        >
          取消
        </button>
        <button
          type="button"
          className="task-primary-button"
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
