import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { TaskWorkspace } from "../../src/features/tasks/task-workspace";

it("server-renders a stable loading state without window or localStorage", () => {
  expect(typeof window).toBe("undefined");
  const html = renderToString(createElement(TaskWorkspace));
  expect(html).toContain("正在读取本地任务");
  expect(html).not.toContain("还没有任务");
});
