"use client";

import { BuildingManagement } from "@/components/building-management";
import { ElevatorSimulationPanel } from "@/components/elevator-simulation-panel";
import { PassengerPovPanel } from "@/components/passenger-pov-panel";
import { useElevatorSimulation } from "@/hooks/use-elevator-simulation";
import type { Building } from "@/types/elevator";

type ElevatorDashboardProps = {
  initialBuildings: Building[];
  initialError?: string;
};

export function ElevatorDashboard({
  initialBuildings,
  initialError,
}: ElevatorDashboardProps) {
  const simulation = useElevatorSimulation(initialBuildings, initialError);

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-[#17202a]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col justify-between gap-4 border-b border-[#d9dee5] pb-5 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-[#53616f]">
              Backend-driven simulation
            </p>
            <h1 className="text-3xl font-semibold text-[#17202a]">
              Elevator Control Center
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                simulation.streamStatus === "open"
                  ? "bg-[#178b5b]"
                  : simulation.streamStatus === "error"
                    ? "bg-[#c24135]"
                    : "bg-[#9aa4af]"
              }`}
              aria-hidden="true"
            />
            <span className="text-sm font-medium text-[#53616f]">
              SSE {simulation.streamStatus === "open" ? "connected" : simulation.streamStatus}
            </span>
            <button
              type="button"
              onClick={() => simulation.setIsCreateOpen(true)}
              className="rounded-md bg-[#2067a8] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#18598f]"
            >
              New building
            </button>
          </div>
        </header>

        {simulation.error ? (
          <div className="rounded-lg border border-[#efb2aa] bg-[#fff0ee] px-4 py-3 text-sm text-[#8f2d24]">
            {simulation.error}
          </div>
        ) : null}

        <PassengerPovPanel
          selectedBuilding={simulation.selectedBuilding}
          buildingState={simulation.buildingState}
          passengerFloor={simulation.passengerFloor}
          passengerSession={simulation.passengerSession}
          pendingCall={simulation.pendingCall}
          pendingDestination={simulation.pendingDestination}
          arrivedElevator={simulation.arrivedElevator}
          onPassengerFloorChange={simulation.updatePassengerFloor}
          onCallElevator={simulation.callElevatorFromPassengerPov}
          onPickDestination={simulation.pickDestination}
          onResetPassengerSession={() => simulation.setPassengerSession(null)}
        />

        <section className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <BuildingManagement
            buildings={simulation.buildings}
            selectedBuildingId={simulation.selectedBuildingId}
            form={simulation.form}
            isCreateOpen={simulation.isCreateOpen}
            isCreating={simulation.isCreating}
            onSelectBuilding={simulation.setSelectedBuildingId}
            onOpenCreate={() => simulation.setIsCreateOpen(true)}
            onCloseCreate={() => simulation.setIsCreateOpen(false)}
            onFormChange={simulation.setForm}
            onCreateBuilding={simulation.createBuilding}
          />

          <ElevatorSimulationPanel
            selectedBuilding={simulation.selectedBuilding}
            buildingState={simulation.buildingState}
            pendingCall={simulation.pendingCall}
            onCallElevator={simulation.callElevator}
          />
        </section>
      </div>
    </main>
  );
}
