"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { BuildingManagement } from "@/components/building-management";
import { ElevatorSimulationPanel } from "@/components/elevator-simulation-panel";
import {
  PassengerPovPanel,
  type PassengerSession,
} from "@/components/passenger-pov-panel";
import {
  callElevator as callElevatorRequest,
  createBuilding as createBuildingRequest,
  getErrorMessage,
  pickDestination as pickDestinationRequest,
  subscribeToBuildingState,
} from "@/lib/elevator-api";
import { DoorState } from "@/types/elevator";
import type {
  Building,
  BuildingState,
  CallDirection,
  CreateBuildingPayload,
} from "@/types/elevator";

const DEFAULT_FORM: CreateBuildingPayload = {
  name: "Office Tower",
  floors: 10,
  elevators: 3,
};

type ElevatorDashboardProps = {
  initialBuildings: Building[];
  initialError?: string;
};

export function ElevatorDashboard({
  initialBuildings,
  initialError,
}: ElevatorDashboardProps) {
  const [buildings, setBuildings] = useState<Building[]>(initialBuildings);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(
    initialBuildings[0]?.id ?? null,
  );
  const [buildingState, setBuildingState] = useState<BuildingState | null>(
    null,
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState<CreateBuildingPayload>(DEFAULT_FORM);
  const [isCreating, setIsCreating] = useState(false);
  const [pendingCall, setPendingCall] = useState<string | null>(null);
  const [pendingDestination, setPendingDestination] = useState(false);
  const [passengerFloor, setPassengerFloor] = useState(1);
  const [passengerSession, setPassengerSession] =
    useState<PassengerSession | null>(null);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [streamStatus, setStreamStatus] = useState<"idle" | "open" | "error">(
    "idle",
  );

  const selectedBuilding = useMemo(
    () => buildings.find((building) => building.id === selectedBuildingId),
    [buildings, selectedBuildingId],
  );
  const arrivedElevator = useMemo(() => {
    if (!passengerSession || passengerSession.destinationFloor) {
      return undefined;
    }

    return buildingState?.elevators.find(
      (elevator) =>
        elevator.currentFloor === passengerSession.floor &&
        elevator.doorState === DoorState.OPEN,
    );
  }, [buildingState?.elevators, passengerSession]);

  useEffect(() => {
    if (!selectedBuildingId) {
      setBuildingState(null);
      setPassengerSession(null);
      setStreamStatus("idle");
      return;
    }

    setBuildingState(null);
    setPassengerSession(null);
    setStreamStatus("idle");

    const unsubscribe = subscribeToBuildingState(selectedBuildingId, {
      onOpen: () => {
        setStreamStatus("open");
        setError(null);
      },
      onMessage: (payload) => {
        setBuildingState((current) => ({
          buildingId: payload.buildingId,
          floors:
            payload.floors ??
            current?.floors ??
            selectedBuilding?.numberOfFloors ??
            0,
          elevators: payload.elevators,
        }));
      },
      onError: () => {
        setStreamStatus("error");
      },
    });

    return () => {
      unsubscribe();
      setStreamStatus("idle");
    };
  }, [selectedBuildingId, selectedBuilding?.numberOfFloors]);

  async function createBuilding(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsCreating(true);

    try {
      const building = await createBuildingRequest(form);

      setBuildings((current) => [building, ...current]);
      setSelectedBuildingId(building.id);
      setForm(DEFAULT_FORM);
      setIsCreateOpen(false);
    } catch (createError) {
      setError(getErrorMessage(createError));
    } finally {
      setIsCreating(false);
    }
  }

  async function callElevator(
    floor: number,
    direction: CallDirection,
  ): Promise<boolean> {
    if (!selectedBuildingId) {
      return false;
    }

    const callKey = `${floor}-${direction}`;
    setPendingCall(callKey);
    setError(null);

    try {
      await callElevatorRequest({
        buildingId: selectedBuildingId,
        floor,
        direction,
      });
      return true;
    } catch (callError) {
      setError(getErrorMessage(callError));
      return false;
    } finally {
      setPendingCall(null);
    }
  }

  async function callElevatorFromPassengerPov(
    floor: number,
    direction: CallDirection,
  ) {
    const wasCalled = await callElevator(floor, direction);

    if (wasCalled) {
      setPassengerSession({ floor, direction });
    }
  }

  async function pickDestination(elevatorId: string, floor: number) {
    setPendingDestination(true);
    setError(null);

    try {
      await pickDestinationRequest({ elevatorId, floor });
      setPassengerSession((current) =>
        current ? { ...current, elevatorId, destinationFloor: floor } : current,
      );
    } catch (destinationError) {
      setError(getErrorMessage(destinationError));
    } finally {
      setPendingDestination(false);
    }
  }

  function updatePassengerFloor(floor: number) {
    const floorsCount =
      buildingState?.floors ?? selectedBuilding?.numberOfFloors ?? 1;
    const nextFloor = Math.min(Math.max(floor, 1), floorsCount);

    setPassengerFloor(Number.isNaN(nextFloor) ? 1 : nextFloor);
  }

  useEffect(() => {
    const floorsCount =
      buildingState?.floors ?? selectedBuilding?.numberOfFloors ?? 1;

    setPassengerFloor((currentFloor) =>
      Math.min(Math.max(currentFloor, 1), floorsCount),
    );
  }, [buildingState?.floors, selectedBuilding?.numberOfFloors]);

  useEffect(() => {
    if (!passengerSession?.elevatorId || !passengerSession.destinationFloor) {
      return;
    }

    const passengerElevator = buildingState?.elevators.find(
      (elevator) => elevator.id === passengerSession.elevatorId,
    );

    if (
      passengerElevator?.currentFloor === passengerSession.destinationFloor &&
      passengerElevator.doorState === DoorState.OPEN
    ) {
      setPassengerSession(null);
      setPassengerFloor(passengerSession.destinationFloor);
    }
  }, [buildingState?.elevators, passengerSession]);

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
                streamStatus === "open"
                  ? "bg-[#178b5b]"
                  : streamStatus === "error"
                    ? "bg-[#c24135]"
                    : "bg-[#9aa4af]"
              }`}
              aria-hidden="true"
            />
            <span className="text-sm font-medium text-[#53616f]">
              SSE {streamStatus === "open" ? "connected" : streamStatus}
            </span>
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="rounded-md bg-[#2067a8] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#18598f]"
            >
              New building
            </button>
          </div>
        </header>

        {error ? (
          <div className="rounded-lg border border-[#efb2aa] bg-[#fff0ee] px-4 py-3 text-sm text-[#8f2d24]">
            {error}
          </div>
        ) : null}

        <PassengerPovPanel
          selectedBuilding={selectedBuilding}
          buildingState={buildingState}
          passengerFloor={passengerFloor}
          passengerSession={passengerSession}
          pendingCall={pendingCall}
          pendingDestination={pendingDestination}
          arrivedElevator={arrivedElevator}
          onPassengerFloorChange={updatePassengerFloor}
          onCallElevator={callElevatorFromPassengerPov}
          onPickDestination={pickDestination}
          onResetPassengerSession={() => setPassengerSession(null)}
        />

        <section className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <BuildingManagement
            buildings={buildings}
            selectedBuildingId={selectedBuildingId}
            form={form}
            isCreateOpen={isCreateOpen}
            isCreating={isCreating}
            onSelectBuilding={setSelectedBuildingId}
            onOpenCreate={() => setIsCreateOpen(true)}
            onCloseCreate={() => setIsCreateOpen(false)}
            onFormChange={setForm}
            onCreateBuilding={createBuilding}
          />

          <ElevatorSimulationPanel
            selectedBuilding={selectedBuilding}
            buildingState={buildingState}
            pendingCall={pendingCall}
            onCallElevator={callElevator}
          />
        </section>
      </div>
    </main>
  );
}
