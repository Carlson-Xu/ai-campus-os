import type { Metadata } from "next";
import { PageHeading, PreviewNote } from "@/components/page-heading";

export const metadata: Metadata = { title: "课程表" };
const weekdays = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
const periods = ["上午", "下午", "晚上"];

export default function TimetablePage() {
  return (
    <>
      <PageHeading
        number="02"
        title="看见一周的节奏。"
        description="把课程放回时间里，清楚了解每一天的安排。这里将成为你的每周课程总览。"
      />
      <section
        className="panel overflow-hidden"
        aria-labelledby="timetable-title"
      >
        <div className="section-heading">
          <div>
            <h2 id="timetable-title">一周课表</h2>
            <p className="mt-2 text-xs text-slate-500">
              教学周尚未设置 · 当前为布局预览
            </p>
          </div>
          <span className="subtle-tag">周视图</span>
        </div>
        <div
          className="overflow-x-auto"
          role="region"
          aria-label="一周课表预览，可横向滚动"
          tabIndex={0}
        >
          <table className="timetable">
            <caption className="sr-only">空白课程表布局，尚无课程数据</caption>
            <thead>
              <tr>
                <th scope="col">时段</th>
                {weekdays.map((day) => (
                  <th key={day} scope="col">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map((period) => (
                <tr key={period}>
                  <th scope="row">{period}</th>
                  {weekdays.map((day) => (
                    <td key={day}>
                      <span className="sr-only">尚无课程数据</span>
                      <span
                        className="schedule-placeholder"
                        aria-hidden="true"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 p-6 text-center text-sm leading-7 text-slate-500">
          你的课程，将在这里各就其位。
          <br />
          <span className="text-xs">
            课程录入与教学周切换将在后续 Issue 中开放。
          </span>
        </div>
      </section>
      <PreviewNote>
        这是空白课表的展示结构；空白不代表实际空闲时间。手机上可横向滑动查看完整一周。
      </PreviewNote>
    </>
  );
}
