type SystemStatusTone = "ok" | "warn";

type SystemStatusItem = {
  id: string;
  label: string;
  value: string;
  tone: SystemStatusTone;
};

const TONE_DOT: Record<SystemStatusTone, string> = {
  ok: "bg-green",
  warn: "bg-yellow",
};

const DEFAULT_STATUS_ITEMS: SystemStatusItem[] = [
  { id: "database", label: "Database", value: "23ms", tone: "ok" },
  { id: "api-gateway", label: "API Gateway", value: "99.9%", tone: "ok" },
  { id: "file-storage", label: "File Storage", value: "78% used", tone: "warn" },
  { id: "email-service", label: "Email Service", value: "Active", tone: "ok" },
];

export type SidebarSystemStatusProps = {
  overallLabel?: string;
  items?: SystemStatusItem[];
  className?: string;
};

export function SidebarSystemStatus({
  overallLabel = "OK",
  items = DEFAULT_STATUS_ITEMS,
  className = "",
}: Readonly<SidebarSystemStatusProps>) {
  return (
    <section
      aria-label="System status"
      className={`flex w-full flex-col gap-2.5 rounded-xl border border-blue-normal/8 bg-blue-normal/5 p-3 ${className}`.trim()}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text8 tracking-[0.5px] text-[#8892a3] uppercase">
          System Status
        </p>
        <div className="flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-green" aria-hidden />
          <span className="text8 text-green">{overallLabel}</span>
        </div>
      </div>

      <ul className="flex flex-col gap-1.5">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <span
                className={`size-1 shrink-0 rounded-full ${TONE_DOT[item.tone]}`}
                aria-hidden
              />
              <span className="truncate text7 text-gray">{item.label}</span>
            </div>
            <span className="shrink-0 text7 text-darkest">
              {item.value}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
