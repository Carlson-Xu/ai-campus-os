import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "AI Campus OS", template: "%s · AI Campus OS" },
  description:
    "把大学学习事务整理得更清晰。M0 本地演示版，仅提供页面与导航预览。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
