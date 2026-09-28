export default function PageHeader({ title, subtitle, hint }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
      <div className="min-w-0">
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--dossier-bone)] tracking-tight leading-tight">{title}</h1>
        {subtitle && (
          <p className="mt-2 text-sm text-[var(--dossier-bone-soft)] max-w-xl">{subtitle}</p>
        )}
      </div>
      {hint && (
        <div className="text-xs text-[var(--dossier-bone-muted)]">{hint}</div>
      )}
    </div>
  );
}
