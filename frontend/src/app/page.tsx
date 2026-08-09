export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-black font-sans">
      <main className="flex flex-1 w-full max-w-4xl flex-col items-center justify-center gap-10 px-8 py-20 text-center">
        {/* Logo / wordmark */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-5xl font-bold tracking-tight text-white">
            Impact<span className="text-blue-400">IQ</span>
          </span>
          <span className="text-sm font-medium uppercase tracking-widest text-zinc-500">
            Asteroid Impact Risk Predictor
          </span>
        </div>

        {/* Status badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-1.5 text-xs text-zinc-400">
          <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          Week 1 — Foundations complete · Backend API running
        </div>

        {/* Description */}
        <p className="max-w-xl text-lg leading-8 text-zinc-400">
          Real NASA/JPL orbital mechanics, Monte Carlo trajectory uncertainty,
          Torino-scale risk scoring, and IBM Granite AI mission briefs — all
          for near-Earth objects that actually matter.
        </p>

        {/* Week-1 milestone checklist */}
        <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 text-left">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Week 1 Milestone
          </h2>
          <ul className="space-y-2 text-sm text-zinc-300">
            {[
              ["✅", "NASA API key registered; watsonx.ai / Granite access confirmed"],
              ["✅", "Repo scaffolded — FastAPI backend + Next.js 16 frontend"],
              ["✅", "Data-fetch layer: NeoWs · SBDB (full-prec) · CAD · Sentry"],
              ["✅", "Two-body Keplerian propagation with hapsira"],
              ["✅", "Heliocentric coordinate frame fixed (barycentric → heliocentric)"],
              ["✅", "Validation vs. JPL CAD: 2010 FX9 → 0.0337 AU vs JPL 0.024 AU (passes ±0.05 AU tolerance)"],
              ["✅", "13 / 13 tests passing (API smoke + physics validation)"],
            ].map(([icon, text]) => (
              <li key={text as string} className="flex items-start gap-3">
                <span className="text-base leading-5">{icon}</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* API links */}
        <div className="flex flex-wrap justify-center gap-3 text-sm">
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-zinc-300 transition hover:border-blue-500 hover:text-blue-400"
          >
            Backend Swagger UI ↗
          </a>
          <a
            href="http://localhost:8000/api/validate/2010%20FX9?year_min=2026&year_max=2026"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-zinc-300 transition hover:border-blue-500 hover:text-blue-400"
          >
            Try Validation Endpoint ↗
          </a>
          <a
            href="http://localhost:8000/api/sentry"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-zinc-300 transition hover:border-blue-500 hover:text-blue-400"
          >
            Sentry Risk Table ↗
          </a>
        </div>

        <p className="text-xs text-zinc-600">
          Week 2 → Monte Carlo · Torino/Palermo scoring · IBM Granite integration
        </p>
      </main>
    </div>
  );
}
