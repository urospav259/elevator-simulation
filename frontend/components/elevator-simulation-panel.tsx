"use client";

import { useMemo } from "react";

import type {
  Building,
  BuildingState,
  CallDirection,
  Direction,
  ElevatorDisplayState,
} from "@/types/elevator";

type ElevatorSimulationPanelProps = {
  selectedBuilding?: Building;
  buildingState: BuildingState | null;
  pendingCall: string | null;
  onCallElevator: (floor: number, direction: CallDirection) => void;
};

type FloorCallControlsProps = {
  floor: number;
  floorsCount: number;
  pendingCall: string | null;
  placement: "left" | "right";
  onCallElevator: (floor: number, direction: CallDirection) => void;
};

function getDirectionLabel(direction: Direction): string {
  if (direction === "UP") {
    return "Up";
  }

  if (direction === "DOWN") {
    return "Down";
  }

  return "Idle";
}

function getDisplayLabel(displayState: ElevatorDisplayState): string {
  if (displayState === "DOOR_OPEN") {
    return "Door open";
  }

  if (displayState === "MOVING") {
    return "Moving";
  }

  return "Idle";
}

function directionSymbol(direction: Direction): string {
  if (direction === "UP") {
    return "↑";
  }

  if (direction === "DOWN") {
    return "↓";
  }

  return "-";
}

function FloorCallControls({
  floor,
  floorsCount,
  pendingCall,
  placement,
  onCallElevator,
}: FloorCallControlsProps) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <button
        type="button"
        disabled={floor === floorsCount || pendingCall === `${floor}-UP`}
        onClick={() => onCallElevator(floor, "UP")}
        className="h-8 w-8 rounded-md border border-[#c9d3dd] bg-white text-sm font-bold text-[#2067a8] transition hover:bg-[#e8f2fb] disabled:opacity-35"
        aria-label={`Call elevator up from floor ${floor} using ${placement} controls`}
        title="Call up"
      >
        ↑
      </button>
      <button
        type="button"
        disabled={floor === 1 || pendingCall === `${floor}-DOWN`}
        onClick={() => onCallElevator(floor, "DOWN")}
        className="h-8 w-8 rounded-md border border-[#c9d3dd] bg-white text-sm font-bold text-[#2067a8] transition hover:bg-[#e8f2fb] disabled:opacity-35"
        aria-label={`Call elevator down from floor ${floor} using ${placement} controls`}
        title="Call down"
      >
        ↓
      </button>
    </div>
  );
}

export function ElevatorSimulationPanel({
  selectedBuilding,
  buildingState,
  pendingCall,
  onCallElevator,
}: ElevatorSimulationPanelProps) {
  const elevators = buildingState?.elevators ?? [];
  const floorsCount =
    buildingState?.floors ?? selectedBuilding?.numberOfFloors ?? 0;
  const floors = useMemo(
    () => Array.from({ length: floorsCount }, (_, index) => floorsCount - index),
    [floorsCount],
  );
  const gridTemplateColumns = `116px 72px repeat(${Math.max(elevators.length, 1)}, minmax(96px, 1fr)) 116px`;

  if (!selectedBuilding) {
    return (
      <section className="min-w-0">
        <div className="flex min-h-[520px] items-center justify-center rounded-lg border border-[#d9dee5] bg-white px-6 text-center text-[#53616f]">
          Select or create a building to view its live state.
        </div>
      </section>
    );
  }

  return (
    <section className="min-w-0">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col justify-between gap-3 rounded-lg border border-[#d9dee5] bg-white px-5 py-4 shadow-sm md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-semibold text-[#17202a]">
              {selectedBuilding.name}
            </h2>
            <p className="mt-1 text-sm text-[#53616f]">
              {floorsCount} floors · {elevators.length || selectedBuilding.elevators.length} elevators
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-md bg-[#eef7f1] px-3 py-2 font-medium text-[#1f6e49]">
              Live state
            </span>
            <span className="rounded-md bg-[#fff7e5] px-3 py-2 font-medium text-[#8a5a00]">
              15s backend tick
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-[#d9dee5] bg-white shadow-sm">
          <div className="max-h-[680px] overflow-auto">
            <div
              className="sticky top-0 z-30 grid min-w-[860px] border-b border-[#d9dee5] bg-[#f2f5f8] px-4 py-3 text-xs font-semibold uppercase text-[#53616f]"
              style={{ gridTemplateColumns }}
            >
              <span className="sticky left-0 z-40 bg-[#f2f5f8] text-center">
                Call
              </span>
              <span className="bg-[#f2f5f8]">Floor</span>
              {elevators.map((elevator, index) => (
                <span key={elevator.id}>Elevator {index + 1}</span>
              ))}
              <span className="sticky right-0 z-40 bg-[#f2f5f8] text-center">
                Call
              </span>
            </div>

            {floors.map((floor) => (
              <div
                key={floor}
                className="grid min-w-[860px] items-center border-b border-[#edf0f3] px-4 py-2 last:border-b-0"
                style={{ gridTemplateColumns }}
              >
                <div className="sticky left-0 z-20 bg-white py-1 pr-3 shadow-[8px_0_12px_-12px_rgba(23,32,42,0.65)]">
                  <FloorCallControls
                    floor={floor}
                    floorsCount={floorsCount}
                    pendingCall={pendingCall}
                    placement="left"
                    onCallElevator={onCallElevator}
                  />
                </div>

                <div className="text-sm font-semibold text-[#17202a]">
                  {floor}
                </div>

                {elevators.map((elevator) => {
                  const isHere = elevator.currentFloor === floor;
                  const stopOrder = elevator.stops.indexOf(floor) + 1;
                  const isStop = stopOrder > 0;

                  return (
                    <div
                      key={elevator.id}
                      className="flex h-10 items-center justify-center"
                    >
                      {isHere ? (
                        <div
                          className={`flex h-8 min-w-14 items-center justify-center rounded-md px-2 text-sm font-bold text-white ${
                            elevator.displayState === "DOOR_OPEN"
                              ? "bg-[#178b5b]"
                              : elevator.displayState === "MOVING"
                                ? "bg-[#2067a8]"
                                : "bg-[#5f6b77]"
                          }`}
                          title={`${getDisplayLabel(elevator.displayState)} · ${getDirectionLabel(elevator.direction)}`}
                        >
                          {directionSymbol(elevator.direction)}
                        </div>
                      ) : isStop ? (
                        <div
                          className="flex items-center gap-1 rounded-md bg-[#fff3d8] px-2 py-1 text-xs font-semibold text-[#8a5a00]"
                          title={`Stop ${stopOrder} for this elevator`}
                        >
                          <span className="h-2 w-2 rounded-full bg-[#d08b16]" />
                          {stopOrder}
                        </div>
                      ) : (
                        <div className="h-px w-8 bg-[#d9dee5]" />
                      )}
                    </div>
                  );
                })}

                <div className="sticky right-0 z-20 bg-white py-1 pl-3 shadow-[-8px_0_12px_-12px_rgba(23,32,42,0.65)]">
                  <FloorCallControls
                    floor={floor}
                    floorsCount={floorsCount}
                    pendingCall={pendingCall}
                    placement="right"
                    onCallElevator={onCallElevator}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
