"use client";

import type {
  Building,
  BuildingState,
  CallDirection,
  ElevatorSnapshot,
  PassengerSession,
} from "@/types/elevator";

type PassengerPovPanelProps = {
  selectedBuilding?: Building;
  buildingState: BuildingState | null;
  passengerFloor: number;
  passengerSession: PassengerSession | null;
  pendingCall: string | null;
  pendingDestination: boolean;
  arrivedElevator?: ElevatorSnapshot;
  onPassengerFloorChange: (floor: number) => void;
  onCallElevator: (floor: number, direction: CallDirection) => void | Promise<void>;
  onPickDestination: (elevatorId: string, floor: number) => void | Promise<void>;
  onResetPassengerSession: () => void;
};

export function PassengerPovPanel({
  selectedBuilding,
  buildingState,
  passengerFloor,
  passengerSession,
  pendingCall,
  pendingDestination,
  arrivedElevator,
  onPassengerFloorChange,
  onCallElevator,
  onPickDestination,
  onResetPassengerSession,
}: PassengerPovPanelProps) {
  const floorsCount =
    buildingState?.floors ?? selectedBuilding?.numberOfFloors ?? 0;
  const destinationFloors = Array.from(
    { length: floorsCount },
    (_, index) => floorsCount - index,
  );
  const canUsePanel = Boolean(selectedBuilding && floorsCount > 0);
  const currentPendingCall = passengerSession
    ? `${passengerSession.floor}-${passengerSession.direction}`
    : null;

  return (
    <section className="rounded-lg border border-[#d9dee5] bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-[#17202a]">
            Passenger POV
          </h2>
          <p className="mt-1 text-sm text-[#53616f]">
            Choose your current floor, call an elevator, then select a destination when the doors open.
          </p>
        </div>

        <button
          type="button"
          onClick={onResetPassengerSession}
          disabled={!passengerSession}
          className="rounded-md border border-[#c9d3dd] px-3 py-2 text-sm font-semibold text-[#53616f] transition hover:bg-[#f2f5f8] disabled:opacity-40"
        >
          Reset POV
        </button>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[260px_1fr]">
        <div className="rounded-lg bg-[#f2f5f8] p-3">
          <label className="block text-sm font-medium text-[#17202a]">
            Current floor
            <input
              type="number"
              value={passengerFloor}
              onChange={(event) =>
                onPassengerFloorChange(Number(event.target.value))
              }
              disabled={!canUsePanel || Boolean(passengerSession)}
              className="mt-1 h-10 w-full rounded-md border border-[#c9d3dd] bg-white px-3 text-sm outline-none transition focus:border-[#2067a8] focus:ring-2 focus:ring-[#9dccf3] disabled:opacity-60"
              min={1}
              max={floorsCount || 1}
            />
          </label>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={
                !canUsePanel ||
                Boolean(passengerSession) ||
                passengerFloor >= floorsCount ||
                pendingCall === `${passengerFloor}-UP`
              }
              onClick={() => onCallElevator(passengerFloor, "UP")}
              className="h-10 flex-1 rounded-md bg-[#2067a8] text-sm font-semibold text-white transition hover:bg-[#18598f] disabled:opacity-40"
            >
              Call up
            </button>
            <button
              type="button"
              disabled={
                !canUsePanel ||
                Boolean(passengerSession) ||
                passengerFloor <= 1 ||
                pendingCall === `${passengerFloor}-DOWN`
              }
              onClick={() => onCallElevator(passengerFloor, "DOWN")}
              className="h-10 flex-1 rounded-md bg-[#2067a8] text-sm font-semibold text-white transition hover:bg-[#18598f] disabled:opacity-40"
            >
              Call down
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-[#d9dee5] p-3">
          {!passengerSession ? (
            <div className="flex min-h-28 items-center text-sm text-[#53616f]">
              No active passenger request.
            </div>
          ) : arrivedElevator ? (
            <div>
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-semibold text-[#17202a]">
                    Elevator has arrived
                  </p>
                  <p className="mt-1 text-sm text-[#53616f]">
                    Elevator {arrivedElevator.id.slice(0, 8)} is open on floor {passengerSession.floor}.
                  </p>
                </div>
                <span className="rounded-md bg-[#eef7f1] px-3 py-2 text-sm font-semibold text-[#1f6e49]">
                  Doors open
                </span>
              </div>

              <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(44px,1fr))] gap-2">
                {destinationFloors.map((floor) => (
                  <button
                    key={floor}
                    type="button"
                    disabled={
                      floor === passengerSession.floor || pendingDestination
                    }
                    onClick={() => onPickDestination(arrivedElevator.id, floor)}
                    className="h-10 rounded-md border border-[#c9d3dd] bg-white text-sm font-semibold text-[#2067a8] transition hover:bg-[#e8f2fb] disabled:opacity-35"
                    title={`Go to floor ${floor}`}
                  >
                    {floor}
                  </button>
                ))}
              </div>
            </div>
          ) : passengerSession.destinationFloor ? (
            <div className="flex min-h-28 items-center justify-between gap-3 text-sm">
              <div>
                <p className="font-semibold text-[#17202a]">
                  Destination selected
                </p>
                <p className="mt-1 text-[#53616f]">
                  Elevator is heading to floor {passengerSession.destinationFloor}.
                </p>
              </div>
              <span className="rounded-md bg-[#e8f2fb] px-3 py-2 font-semibold text-[#1f5f97]">
                In elevator
              </span>
            </div>
          ) : (
            <div className="flex min-h-28 items-center justify-between gap-3 text-sm">
              <div>
                <p className="font-semibold text-[#17202a]">
                  Waiting on floor {passengerSession.floor}
                </p>
                <p className="mt-1 text-[#53616f]">
                  Requested {passengerSession.direction.toLowerCase()}. Destination buttons unlock when doors open.
                </p>
              </div>
              <span className="rounded-md bg-[#fff7e5] px-3 py-2 font-semibold text-[#8a5a00]">
                {pendingCall === currentPendingCall ? "Calling" : "Waiting"}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
