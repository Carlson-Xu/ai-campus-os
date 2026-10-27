import type { Metadata } from "next";
import { PageHeading } from "@/components/page-heading";
import { TaskWorkspace } from "@/features/tasks/task-workspace";

export const metadata: Metadata = { title: "任务管理" };

export default function TasksPage() {
  return (
    <>
      <PageHeading
        number="03"
        title="把想做的，变成待办。"
        description="记录作业、复习与个人计划。写下下一步，把每一次完成变成看得见的进展。"
      />
      <TaskWorkspace />
    </>
  );
}
