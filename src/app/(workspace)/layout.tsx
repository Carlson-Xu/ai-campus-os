import Link from "next/link";
import { Navigation } from "@/components/navigation";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <a className="skip-link" href="#main-content">
        跳到主要内容
      </a>
      <aside className="sidebar">
        <Link
          href="/dashboard"
          className="brand"
          aria-label="AI Campus OS 首页"
        >
          <span className="brand-mark" aria-hidden="true">
            C<span>·</span>
          </span>
          <span>
            Campus OS<small>你的大学学习工作台</small>
          </span>
        </Link>
        <p className="sidebar-label">学习空间</p>
        <Navigation />
        <div className="sidebar-note">
          <span className="eyebrow">一步一步，构建清晰</span>
          <p>
            从课程与任务开始，
            <br />
            让学习事务各就其位。
          </p>
          <span className="text-xs text-slate-500">M0 · 本地学习工作台</span>
        </div>
        <p className="sidebar-footer">
          AI Campus OS <span>正在构建中</span>
        </p>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <Link href="/dashboard" className="font-semibold tracking-tight">
            Campus OS <span className="topbar-label">/ 个人学习空间</span>
          </Link>
          <span className="demo-badge">
            <span aria-hidden="true" />
            本地演示版
          </span>
        </header>
        <main id="main-content" tabIndex={-1} className="main-content">
          {children}
        </main>
        <footer className="content-footer">
          先把今天安排清楚。<span>本地演示版 · 数据仅保存在当前浏览器</span>
        </footer>
      </div>
      <div className="mobile-nav-container">
        <Navigation mobile />
      </div>
    </div>
  );
}
