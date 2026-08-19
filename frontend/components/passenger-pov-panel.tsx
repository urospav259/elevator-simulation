"use client";

import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";

import type {
  Building,
  CallDirection,
  ElevatorSnapshot,
  PassengerSession,
} from "@/types/elevator";

type PassengerPovPanelProps = {
  selectedBuilding?: Building;
  passengerFloor: number | null;
  passengerFloorInput: string;
  passengerSession: PassengerSession | null;
  floorsCount: number;
  pendingCall: string | null;
  pendingDestination: boolean;
  arrivedElevator?: ElevatorSnapshot;
  onPassengerFloorChange: (floor: string) => void;
  onCallElevator: (
    floor: number | null,
    direction: CallDirection,
  ) => void | Promise<void>;
  onPickDestination: (
    elevatorId: string,
    floor: number,
  ) => void | Promise<void>;
  onResetPassengerSession: () => void;
};

export function PassengerPovPanel({
  selectedBuilding,
  passengerFloor,
  passengerFloorInput,
  passengerSession,
  floorsCount,
  pendingCall,
  pendingDestination,
  arrivedElevator,
  onPassengerFloorChange,
  onCallElevator,
  onPickDestination,
  onResetPassengerSession,
}: PassengerPovPanelProps) {
  const destinationFloors = Array.from(
    { length: floorsCount },
    (_, index) => floorsCount - index,
  );
  const canUsePanel = Boolean(selectedBuilding && floorsCount > 0);
  const currentPendingCall = passengerSession
    ? `${passengerSession.floor}-${passengerSession.direction}`
    : null;

  return (
    <section className="rounded-lg border border-border bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-foreground">
            Passenger POV
          </h2>
          <p className="mt-1 text-sm text-muted">
            Choose your current floor, call an elevator, then select a
            destination when the doors open.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={onResetPassengerSession}
          disabled={!passengerSession}
        >
          Reset POV
        </Button>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[260px_1fr]">
        <div className="rounded-lg bg-panel p-3">
          <InputField
            label="Current floor"
            type="number"
            value={passengerFloorInput}
            onChange={(event) => onPassengerFloorChange(event.target.value)}
            disabled={!canUsePanel || Boolean(passengerSession)}
            min={1}
            max={floorsCount || 1}
            inputMode="numeric"
          />

          <div className="mt-3 flex gap-2">
            <Button
              className="h-10 flex-1"
              disabled={
                !canUsePanel ||
                Boolean(passengerSession) ||
                passengerFloor === null ||
                passengerFloor >= floorsCount ||
                pendingCall === `${passengerFloor}-UP`
              }
              onClick={() => onCallElevator(passengerFloor, "UP")}
            >
              Call up
            </Button>
            <Button
              className="h-10 flex-1"
              disabled={
                !canUsePanel ||
                Boolean(passengerSession) ||
                passengerFloor === null ||
                passengerFloor <= 1 ||
                pendingCall === `${passengerFloor}-DOWN`
              }
              onClick={() => onCallElevator(passengerFloor, "DOWN")}
            >
              Call down
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-border p-3">
          {!passengerSession ? (
            <div className="flex min-h-28 items-center text-sm text-muted">
              No active passenger request.
            </div>
          ) : arrivedElevator ? (
            <div>
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Elevator has arrived
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    Elevator is open on floor {passengerSession.floor}.
                  </p>
                </div>
                <span className="rounded-md bg-success-soft px-3 py-2 text-sm font-semibold text-success-strong">
                  Doors open
                </span>
              </div>

              <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(44px,1fr))] gap-2">
                {destinationFloors.map((floor) => (
                  <Button
                    key={floor}
                    variant="secondary"
                    className="h-10 border-control bg-white text-primary hover:bg-primary-soft disabled:opacity-35"
                    disabled={
                      floor === passengerSession.floor || pendingDestination
                    }
                    onClick={() => onPickDestination(arrivedElevator.id, floor)}
                    title={`Go to floor ${floor}`}
                  >
                    {floor}
                  </Button>
                ))}
              </div>
            </div>
          ) : passengerSession.destinationFloor ? (
            <div className="flex min-h-28 items-center justify-between gap-3 text-sm">
              <div>
                <p className="font-semibold text-foreground">
                  Destination selected
                </p>
                <p className="mt-1 text-muted">
                  Elevator is heading to floor{" "}
                  {passengerSession.destinationFloor}.
                </p>
              </div>
              <span className="rounded-md bg-primary-soft px-3 py-2 font-semibold text-primary-strong">
                In elevator
              </span>
            </div>
          ) : (
            <div className="flex min-h-28 items-center justify-between gap-3 text-sm">
              <div>
                <p className="font-semibold text-foreground">
                  Waiting on floor {passengerSession.floor}
                </p>
                <p className="mt-1 text-muted">
                  Requested {passengerSession.direction.toLowerCase()}.
                  Destination buttons unlock when doors open.
                </p>
              </div>
              <span className="rounded-md bg-warning-soft px-3 py-2 font-semibold text-warning-strong">
                {pendingCall === currentPendingCall ? "Calling" : "Waiting"}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
