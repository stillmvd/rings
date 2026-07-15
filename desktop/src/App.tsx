import { Mark } from "./components/brand/Mark";

export default function App() {
  return (
    <main className="flex h-screen flex-col items-center justify-center gap-8 bg-surface-0 text-app-text">
      <Mark size={96} />
      <h1 className="text-6xl font-bold tracking-[-0.045em] leading-none m-0">
        ri
        <span className="bg-[linear-gradient(100deg,#FFB224,#E8590C)] bg-clip-text text-transparent">
          n
        </span>
        gs
      </h1>
      <p className="m-0 text-xs font-semibold uppercase tracking-[0.24em] text-muted">
        Личная летопись · v0.1
      </p>
    </main>
  );
}
