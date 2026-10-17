import type { Project } from "@/data/projects";

export function BrowserFrame({
  project,
  className = "",
  compact = false,
}: {
  project: Project;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={`overflow-hidden border border-ink bg-paper ${compact ? "h-full" : ""} ${className}`}>
      <div className="flex items-center gap-1.5 border-b border-ink bg-ink px-2.5 py-1.5">
        <span className="h-1.5 w-1.5 bg-green" />
        <span className="h-1.5 w-1.5 bg-gray-3" />
        <span className="h-1.5 w-1.5 bg-gray-2" />
        <span className="ml-2 font-mono text-[9px] tracking-wide text-white/55">
          /{project.id}
        </span>
      </div>
      <SiteScene project={project} compact={compact} />
    </div>
  );
}

function SiteScene({
  project,
  compact,
}: {
  project: Project;
  compact: boolean;
}) {
  const { preview } = project;
  return (
    <div
      className={`relative overflow-hidden p-3 ${compact ? "h-[calc(100%-28px)] min-h-[220px]" : "aspect-[16/11]"}`}
      style={{ background: preview.bg, color: preview.ink }}
    >
      {preview.kind === "shop" && <ShopScene project={project} />}
      {preview.kind === "editorial" && <EditorialScene project={project} />}
      {preview.kind === "dash" && <DashScene project={project} />}
      {preview.kind === "landing" && <LandingScene project={project} />}
      {preview.kind === "magazine" && <MagazineScene project={project} />}
      {preview.kind === "wellness" && <WellnessScene project={project} />}
    </div>
  );
}

function ShopScene({ project }: { project: Project }) {
  const a = project.preview.accent;
  const m = project.preview.muted;
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex justify-between font-mono text-[9px] tracking-[0.16em] uppercase">
        <span>{project.preview.title}</span>
        <span className="opacity-40">01</span>
      </div>
      <div className="grid flex-1 grid-cols-3 gap-1.5">
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ background: i === 1 ? a : m }} />
        ))}
      </div>
    </div>
  );
}

function EditorialScene({ project }: { project: Project }) {
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex justify-between font-mono text-[9px] tracking-[0.16em] uppercase opacity-50">
        <span>01</span>
        <span>{project.year}</span>
      </div>
      <div>
        <p className="text-3xl leading-none font-medium tracking-tight">{project.preview.title}</p>
        <div className="mt-3 grid grid-cols-4 gap-1.5">
          {[48, 72, 40, 56].map((h, i) => (
            <div
              key={i}
              style={{
                height: h,
                background: i === 0 ? project.preview.accent : project.preview.muted,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function DashScene({ project }: { project: Project }) {
  return (
    <div className="grid h-full grid-cols-[44px_1fr] gap-2">
      <div style={{ background: project.preview.muted }} className="flex flex-col items-center gap-3 py-3">
        <span className="h-2 w-2" style={{ background: project.preview.accent }} />
        <span className="h-8 w-1 opacity-30" style={{ background: project.preview.ink }} />
      </div>
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-3 gap-1.5">
          {["24.8", "99", "1.4"].map((n) => (
            <div key={n} className="px-2 py-1.5" style={{ background: project.preview.muted }}>
              <div className="font-mono text-[9px] opacity-40">—</div>
              <div className="text-sm font-medium">{n}</div>
            </div>
          ))}
        </div>
        <div className="relative flex-1" style={{ background: project.preview.muted }}>
          <svg viewBox="0 0 200 80" className="absolute inset-0 h-full w-full">
            <path
              d="M0 60 L50 40 L90 48 L130 18 L200 28"
              fill="none"
              stroke={project.preview.accent}
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

function LandingScene({ project }: { project: Project }) {
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-center justify-between font-mono text-[9px] tracking-[0.16em] uppercase">
        <span>{project.preview.title}</span>
        <span className="px-1.5 py-0.5" style={{ background: project.preview.accent, color: project.preview.bg }}>
          —
        </span>
      </div>
      <div>
        <div className="h-1.5 w-24" style={{ background: project.preview.ink, opacity: 0.3 }} />
        <div className="mt-1.5 h-1.5 w-40" style={{ background: project.preview.ink, opacity: 0.15 }} />
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14" style={{ background: project.preview.muted }} />
        ))}
      </div>
    </div>
  );
}

function MagazineScene({ project }: { project: Project }) {
  return (
    <div className="grid h-full grid-cols-2 gap-1.5">
      <div className="flex flex-col justify-end p-2" style={{ background: project.preview.muted }}>
        <p className="text-2xl leading-none font-medium">{project.preview.title}</p>
      </div>
      <div className="grid grid-rows-3 gap-1.5">
        <div style={{ background: project.preview.accent }} />
        <div style={{ background: project.preview.muted }} />
        <div className="font-mono text-[9px] tracking-widest uppercase opacity-50">07</div>
      </div>
    </div>
  );
}

function WellnessScene({ project }: { project: Project }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <div
        className="h-20 w-20"
        style={{
          background: `radial-gradient(circle at 35% 30%, ${project.preview.accent}, ${project.preview.muted})`,
        }}
      />
      <p className="text-2xl font-medium">{project.preview.title}</p>
    </div>
  );
}
