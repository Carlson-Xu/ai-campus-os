import type { Metadata } from "next";
import { PageHeading, PreviewNote } from "@/components/page-heading";

export const metadata: Metadata = { title: "任务管理" };

export default function TasksPage() {
  return (
    <>
      <PageHeading
        number="03"
        title="把想做的，变成待办。"
        description="作业、复习和个人计划，都值得一个清晰的位置。从一件小事开始，逐步完成。"
      />
      <section className="panel" aria-labelledby="tasks-title">
        <div className="section-heading">
          <div>
            <h2 id="tasks-title">学习任务</h2>
            <p className="mt-2 text-xs text-slate-500">
              未来在这里管理课程作业与个人待办
            </p>
          </div>
          <span className="subtle-tag">尚未录入</span>
        </div>
        <div className="empty-state py-16 sm:py-24">
          <span className="empty-icon large" aria-hidden="true">
            ☷
          </span>
          <h3 className="mt-5 text-lg">给下一件重要的事留个位置</h3>
          <p className="max-w-sm">
            后续将支持任务录入、课程关联、截止时间与完成状态。当前尚未开放这些操作。
          </p>
          <span className="mt-6 rounded-full bg-slate-100 px-4 py-2 text-xs text-slate-500">
            M0 · 页面结构已就绪
          </span>
        </div>
      </section>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { title: "关联课程", text: "让每份作业都有清楚的归属。" },
          { title: "关注截止时间", text: "逐步建立有轻重缓急的待办。" },
          { title: "记录完成", text: "看见每一步真实的学习进展。" },
        ].map((item, index) => (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-200/80 p-5"
          >
            <span className="text-xs font-medium text-teal-700">
              0{index + 1} / 后续计划
            </span>
            <h2 className="mt-3 text-sm font-semibold">{item.title}</h2>
            <p className="mt-2 text-xs leading-6 text-slate-500">{item.text}</p>
          </div>
        ))}
      </div>
      <PreviewNote>
        当前没有任务编辑、筛选、完成或保存功能，也没有接入通知、AI
        或其他外部服务。
      </PreviewNote>
    </>
  );
}
