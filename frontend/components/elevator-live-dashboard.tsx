"use client";

import type { Building } from "@/types/elevator";

import { useElevatorSimulation } from "@/hooks/use-elevator-simulation";

import { PassengerPovPanel } from "@/components/passenger-pov-panel";
import { ElevatorSimulationPanel } from "@/components/elevator-simulation-panel";

type ElevatorLiveDashboardProps = {
  selectedBuilding?: Building;
  loadingError?: string;
};

// main client component for this simulation
// must be client because it
// uses a hook to perserve state

export function ElevatorLiveDashboard({
  selectedBuilding,
  loadingError,
}: ElevatorLiveDashboardProps) {
  const simulation = useElevatorSimulation(selectedBuilding, loadingError);

  const floorCount =
    simulation.buildingState?.floors || selectedBuilding?.numberOfFloors || 0;

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex items-center gap-3 self-start rounded-md border border-border bg-white px-3 py-2 shadow-sm">
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
          SSE{" "}
          {simulation.streamStatus === "open"
            ? "connected"
            : simulation.streamStatus}
        </span>
      </div>

      {simulation.error ? (
        <div
          className="rounded-lg border border-danger-border bg-danger-soft px-4 py-3 text-sm text-danger-strong"
          role="alert"
        >
          {simulation.error}
        </div>
      ) : null}

      <PassengerPovPanel
        selectedBuilding={selectedBuilding}
        passengerFloor={simulation.passengerFloor}
        passengerFloorInput={simulation.passengerFloorInput}
        passengerSession={simulation.passengerSession}
        pendingCall={simulation.pendingCall}
        floorsCount={floorCount}
        pendingDestination={simulation.pendingDestination}
        arrivedElevator={simulation.arrivedElevator}
        onPassengerFloorChange={simulation.updatePassengerFloor}
        onCallElevator={simulation.callElevatorFromPassengerPov}
        onPickDestination={simulation.pickDestination}
        onResetPassengerSession={simulation.resetPassengerPov}
      />

      <ElevatorSimulationPanel
        selectedBuilding={selectedBuilding}
        buildingState={simulation.buildingState}
        pendingCall={simulation.pendingCall}
        floorsCount={floorCount}
        onCallElevator={simulation.callElevator}
      />
    </div>
  );
}
