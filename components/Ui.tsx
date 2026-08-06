export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8B1E3F]">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#001F3F] sm:text-4xl">{title}</h1>
        {description ? <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600">{description}</p> : null}
      </div>
      {action}
    </header>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
      <h2 className="text-lg font-semibold text-[#001F3F]">{title}</h2>
      <p className="mt-2 text-sm text-gray-600">{body}</p>
    </div>
  );
}

export const inputClass =
  "mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-[#001F3F] outline-none transition focus:border-[#8B1E3F] focus:ring-2 focus:ring-[#8B1E3F]/10";

export const primaryButtonClass =
  "inline-flex items-center justify-center rounded-md bg-[#8B1E3F] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#741832] disabled:cursor-not-allowed disabled:opacity-50";

export const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-[#001F3F] transition hover:border-[#001F3F] disabled:cursor-not-allowed disabled:opacity-50";
