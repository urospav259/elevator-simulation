import Link from "next/link";

import type { Building } from "@/types/elevator";

import { CreateBuildingButton } from "@/components/create-building-button";

type BuildingManagementProps = {
  buildings: Building[];
  selectedBuildingId: string | null;
};

// server component, because
// it doesn't use any state or router
// it is using CreateBuildingButton
// which is client component

export function BuildingManagement({
  buildings,
  selectedBuildingId,
}: BuildingManagementProps) {
  return (
    <aside className="flex flex-col gap-3 lg:sticky lg:top-5 lg:max-h-[calc(100vh-2.5rem)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Buildings</h2>
          <span className="text-sm text-muted">{buildings.length} total</span>
        </div>
        <CreateBuildingButton />
      </div>

      {buildings.length === 0 ? (
        <div className="rounded-lg border border-border bg-white px-4 py-5 text-sm text-muted">
          No buildings yet. Create one to start the simulation.
        </div>
      ) : (
        <div className="grid gap-3 p-0.5 lg:min-h-0 lg:overflow-y-auto lg:pr-2">
          {buildings.map((building) => {
            const isSelected = building.id === selectedBuildingId;

            return (
              <Link
                key={building.id}
                href={`/?buildingId=${building.id}`}
                scroll={false}
                className={`rounded-lg border bg-white p-4 text-left shadow-sm transition hover:border-primary ${
                  isSelected
                    ? "border-primary ring-2 ring-focus"
                    : "border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {building.name}
                    </h3>
                  </div>
                  <span className="rounded-md bg-primary-soft px-2 py-1 text-xs font-semibold text-primary-strong">
                    {isSelected ? "Selected" : "Open"}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-md bg-panel px-3 py-2">
                    <span className="block text-xs text-subtle">Floors</span>
                    <strong>{building.numberOfFloors}</strong>
                  </div>
                  <div className="rounded-md bg-panel px-3 py-2">
                    <span className="block text-xs text-subtle">Elevators</span>
                    <strong>{building.elevators.length}</strong>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </aside>
  );
}
