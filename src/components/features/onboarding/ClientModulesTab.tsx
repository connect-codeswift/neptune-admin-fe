"use client";

import { useState } from "react";
import { ToggleInput } from "@/components/inputs";
import type { ClientAccountDetail, ClientModule } from "./client-accounts.mock";
import { DetailCard } from "./DetailCard";

function ModuleToggleCard({
  module,
  onToggle,
}: Readonly<{
  module: ClientModule;
  onToggle: (id: string, active: boolean) => void;
}>) {
  return (
    <div className="rounded-xl border border-darkest/10 bg-white px-4 py-3.5">
      <ToggleInput
        label={module.label}
        checked={module.active}
        onChange={(checked) => onToggle(module.id, checked)}
        className="items-center"
        containerClassName={module.active ? "" : "[&_label]:text-darkest/45"}
      />
    </div>
  );
}

export function ClientModulesTab({
  client,
}: Readonly<{ client: ClientAccountDetail }>) {
  const [modules, setModules] = useState<ClientModule[]>(client.modules);

  const activeModules = modules.filter((module) => module.active);
  const inactiveModules = modules.filter((module) => !module.active);

  const handleToggle = (id: string, active: boolean) => {
    setModules((current) =>
      current.map((module) =>
        module.id === id ? { ...module, active } : module,
      ),
    );
  };

  return (
    <DetailCard
      title="Licensed EHS Modules"
      description={`Enable or disable platform functionalities configured for ${client.name}.`}
    >
      <div className="flex flex-col gap-6">
        <section>
          <p className="mb-3 text8 tracking-[0.5px] text-blue-normal uppercase">
            Active Modules ({activeModules.length})
          </p>
          {activeModules.length === 0 ? (
            <p className="text5 text-gray">No active modules.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {activeModules.map((module) => (
                <ModuleToggleCard
                  key={module.id}
                  module={module}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <p className="mb-3 text8 tracking-[0.5px] text-[#8892a3] uppercase">
            Inactive Modules ({inactiveModules.length})
          </p>
          {inactiveModules.length === 0 ? (
            <p className="text5 text-gray">No inactive modules.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {inactiveModules.map((module) => (
                <ModuleToggleCard
                  key={module.id}
                  module={module}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </DetailCard>
  );
}
