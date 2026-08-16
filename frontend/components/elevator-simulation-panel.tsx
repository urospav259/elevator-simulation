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

export function ElevatorSimulationPanel({
  selectedBuilding,
  buildingState,
  pendingCall,
  onCallElevator,
}: ElevatorSimulationPanelProps) {
  const elevators = buildingState?.elevators ?? [];
  const floorsCount = buildingState?.floors ?? selectedBuilding?.numberOfFloors ?? 0;
  const floors = useMemo(
    () => Array.from({ length: floorsCount }, (_, index) => floorsCount - index),
    [floorsCount],
  );
  const gridTemplateColumns = `88px repeat(${Math.max(elevators.length, 1)}, minmax(86px, 1fr)) 116px`;

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

        <div className="grid gap-4 xl:grid-cols-[1fr_280px]">
          <div className="overflow-hidden rounded-lg border border-[#d9dee5] bg-white shadow-sm">
            <div
              className="grid min-w-[720px] border-b border-[#d9dee5] bg-[#f2f5f8] px-4 py-3 text-xs font-semibold uppercase text-[#53616f]"
              style={{ gridTemplateColumns }}
            >
              <span>Floor</span>
              {elevators.map((elevator, index) => (
                <span key={elevator.id}>Elevator {index + 1}</span>
              ))}
              <span>Call</span>
            </div>

            <div className="max-h-[680px] overflow-auto">
              {floors.map((floor) => (
                <div
                  key={floor}
                  className="grid min-w-[720px] items-center border-b border-[#edf0f3] px-4 py-2 last:border-b-0"
                  style={{ gridTemplateColumns }}
                >
                  <div className="text-sm font-semibold text-[#17202a]">
                    {floor}
                  </div>

                  {elevators.map((elevator) => {
                    const isHere = elevator.currentFloor === floor;
                    const isStop = elevator.stops.includes(floor);

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
                          <div className="h-2.5 w-2.5 rounded-full bg-[#d08b16]" />
                        ) : (
                          <div className="h-px w-8 bg-[#d9dee5]" />
                        )}
                      </div>
                    );
                  })}

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={floor === floorsCount || pendingCall === `${floor}-UP`}
                      onClick={() => onCallElevator(floor, "UP")}
                      className="h-8 w-8 rounded-md border border-[#c9d3dd] bg-white text-sm font-bold text-[#2067a8] transition hover:bg-[#e8f2fb] disabled:opacity-35"
                      aria-label={`Call elevator up from floor ${floor}`}
                      title="Call up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={floor === 1 || pendingCall === `${floor}-DOWN`}
                      onClick={() => onCallElevator(floor, "DOWN")}
                      className="h-8 w-8 rounded-md border border-[#c9d3dd] bg-white text-sm font-bold text-[#2067a8] transition hover:bg-[#e8f2fb] disabled:opacity-35"
                      aria-label={`Call elevator down from floor ${floor}`}
                      title="Call down"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="grid content-start gap-3">
            {elevators.map((elevator, index) => (
              <div
                key={elevator.id}
                className="rounded-lg border border-[#d9dee5] bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-[#17202a]">
                    Elevator {index + 1}
                  </h3>
                  <span className="text-lg font-bold text-[#2067a8]">
                    {directionSymbol(elevator.direction)}
                  </span>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-md bg-[#f2f5f8] px-3 py-2">
                    <dt className="text-xs text-[#697786]">Floor</dt>
                    <dd className="font-semibold">{elevator.currentFloor}</dd>
                  </div>
                  <div className="rounded-md bg-[#f2f5f8] px-3 py-2">
                    <dt className="text-xs text-[#697786]">Door</dt>
                    <dd className="font-semibold">{elevator.doorState}</dd>
                  </div>
                  <div className="col-span-2 rounded-md bg-[#f2f5f8] px-3 py-2">
                    <dt className="text-xs text-[#697786]">Stops</dt>
                    <dd className="font-semibold">
                      {elevator.stops.length > 0 ? elevator.stops.join(", ") : "None"}
                    </dd>
                  </div>
                </dl>
              </div>
            ))}
          </aside>
        </div>
      </div>
    </section>
  );
}
