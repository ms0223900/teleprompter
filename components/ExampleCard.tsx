type ExampleCardProps = {
  title: string;
  description: string;
};

/**
 * 可重複使用的卡片範例：示範 props 型別與 Tailwind 樣式（含 dark mode）。
 */
export function ExampleCard({ title, description }: ExampleCardProps) {
  return (
    <section className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/80 p-6 text-left shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50">
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Component example
      </p>
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
    </section>
  );
}
