"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/dashboard", label: "首页", symbol: "◈", description: "学习概览" },
  { href: "/timetable", label: "课程表", symbol: "▦", description: "一周安排" },
  { href: "/tasks", label: "任务管理", symbol: "☷", description: "学习待办" },
];

export function Navigation({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label={mobile ? "手机主导航" : "主导航"}
      className={mobile ? "mobile-navigation" : "desktop-navigation"}
    >
      {navigation.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`nav-link ${active ? "nav-link-active" : ""}`}
          >
            <span aria-hidden="true" className="nav-symbol">
              {item.symbol}
            </span>
            <span>
              {item.label}
              <span className="nav-description">{item.description}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
