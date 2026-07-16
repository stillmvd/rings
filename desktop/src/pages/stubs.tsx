function PageStub({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="px-10 py-12">
      <p className="m-0 mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-muted">
        {eyebrow}
      </p>
      <h1 className="m-0 text-5xl font-bold tracking-[-0.045em] leading-none">
        {title}
      </h1>
    </div>
  );
}

export function SettingsPage() {
  return <PageStub eyebrow="rings · приложение" title="Настройки" />;
}
