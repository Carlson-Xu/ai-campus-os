import type { Metadata } from "next";
import Link from "next/link";
import { PageHeading, PreviewNote } from "@/components/page-heading";

export const metadata: Metadata = { title: "首页" };

export default function DashboardPage() {
  return (
    <>
      <PageHeading
        number="01"
        title="让学习，井井有条。"
        description="课程、待办与每一个小目标，都从这里开始。给重要的事留出位置，按自己的节奏向前。"
      />
      <section className="welcome-panel" aria-labelledby="welcome-title">
        <div>
          <span className="eyebrow text-teal-700">从一份清晰的安排开始</span>
          <h2
            id="welcome-title"
            className="mt-4 text-2xl font-semibold leading-relaxed tracking-tight"
          >
            连接你的课程与任务，
            <br />
            慢慢建立自己的学习节奏。
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-7 text-slate-600">
            工作台正在搭建。现在可以先浏览三个页面，了解未来学习事务的组织方式。
          </p>
          <Link href="/timetable" className="primary-link mt-6">
            浏览课程表 <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="welcome-art" aria-hidden="true">
          <span className="art-orbit" />
          <div className="art-card art-card-back">
            <span>一周的节奏</span>
            <div className="art-bars">
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
          <div className="art-card art-card-front">
            <span className="text-teal-700">小步向前</span>
            <strong>专注当下</strong>
            <span className="art-line" />
            <span className="art-line short" />
          </div>
        </div>
      </section>
      <div className="mt-7 grid gap-5 lg:grid-cols-2">
        <section className="panel">
          <div className="section-heading">
            <h2>课程概览</h2>
            <span className="subtle-tag">等待录入</span>
          </div>
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">
              ▦
            </span>
            <h3>为一周的课程留好位置</h3>
            <p>课程录入完成后，这里将展示当天安排。</p>
            <Link href="/timetable" className="text-link">
              查看课程表 <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
        <section className="panel">
          <div className="section-heading">
            <h2>任务概览</h2>
            <span className="subtle-tag">等待录入</span>
          </div>
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">
              ☷
            </span>
            <h3>把要做的事，一件件理清</h3>
            <p>任务页已支持录入与本地保存，首页汇总将在后续实现。</p>
            <Link href="/tasks" className="text-link">
              查看任务页面 <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </div>
      <PreviewNote>
        任务管理已支持本地增删改查；课程录入与首页数据联动将在后续 Issue
        中实现。
      </PreviewNote>
    </>
  );
}
