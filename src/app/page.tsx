export default function Home() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-surface-0 text-app-text">
      <div className="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2">
        <div className="h-px w-full bg-line" />
      </div>
      <div className="absolute left-1/2 top-8 -translate-x-1/2 text-sm text-muted">
        Timeline — ядро появится в Phase 2
      </div>
    </main>
  );
}
