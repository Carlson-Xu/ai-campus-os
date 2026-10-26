export function PageHeading({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-heading">
      <p className="eyebrow">
        我的学习空间 <span className="ml-2 text-slate-400">/ {number}</span>
      </p>
      <h1>{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
        {description}
      </p>
    </div>
  );
}

export function PreviewNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="preview-note">
      <span aria-hidden="true">ⓘ</span>
      {children}
    </p>
  );
}
