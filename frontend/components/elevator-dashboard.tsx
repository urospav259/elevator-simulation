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
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col justify-between gap-4 border-b border-border pb-5 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-muted">
              Backend-driven simulation
            </p>
            <h1 className="text-3xl font-semibold text-foreground">
              Elevator Control Center
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                simulation.streamStatus === "open"
                  ? "bg-success"
                  : simulation.streamStatus === "error"
                    ? "bg-danger"
                    : "bg-neutral"
              }`}
              aria-hidden="true"
            />
            <span className="text-sm font-medium text-muted" aria-live="polite">
              SSE {simulation.streamStatus === "open" ? "connected" : simulation.streamStatus}
            </span>
          </div>
        </header>

        {simulation.error ? (
          <div
            className="rounded-lg border border-danger-border bg-danger-soft px-4 py-3 text-sm text-danger-strong"
            role="alert"
          >
            {simulation.error}
          </div>
        ) : null}

        <PassengerPovPanel
          selectedBuilding={simulation.selectedBuilding}
          buildingState={simulation.buildingState}
          passengerFloor={simulation.passengerFloor}
          passengerFloorInput={simulation.passengerFloorInput}
          passengerSession={simulation.passengerSession}
          pendingCall={simulation.pendingCall}
          pendingDestination={simulation.pendingDestination}
          arrivedElevator={simulation.arrivedElevator}
          onPassengerFloorChange={simulation.updatePassengerFloor}
          onCallElevator={simulation.callElevatorFromPassengerPov}
          onPickDestination={simulation.pickDestination}
          onResetPassengerSession={simulation.resetPassengerPov}
        />

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <ElevatorSimulationPanel
            selectedBuilding={simulation.selectedBuilding}
            buildingState={simulation.buildingState}
            pendingCall={simulation.pendingCall}
            onCallElevator={simulation.callElevator}
          />

          <BuildingManagement
            buildings={simulation.buildings}
            selectedBuildingId={simulation.selectedBuildingId}
            form={simulation.form}
            isCreateOpen={simulation.isCreateOpen}
            isCreating={simulation.isCreating}
            onSelectBuilding={simulation.selectBuilding}
            onOpenCreate={() => simulation.setIsCreateOpen(true)}
            onCloseCreate={() => simulation.setIsCreateOpen(false)}
            onFormChange={simulation.setForm}
            onCreateBuilding={simulation.createBuilding}
          />
        </section>
      </div>
    </main>
  );
}
