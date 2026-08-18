import type { Building } from "@/types/elevator";

import { BuildingManagement } from "@/components/building-management";
import { ElevatorLiveDashboard } from "@/components/elevator-live-dashboard";

type ElevatorDashboardProps = {
  buildings: Building[];
  selectedBuildingId: string | null;
  loadingError?: string;
};

// server component, no logic inside besidedes
// rendering other components and passing props

export function ElevatorDashboard({
  buildings,
  selectedBuildingId,
  loadingError,
}: ElevatorDashboardProps) {
  const selectedBuilding = buildings.find(
    (building) => building.id === selectedBuildingId,
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <ElevatorLiveDashboard
            selectedBuilding={selectedBuilding}
            loadingError={loadingError}
          />

          <BuildingManagement
            buildings={buildings}
            selectedBuildingId={selectedBuildingId}
          />
        </section>
      </div>
    </main>
  );
}
