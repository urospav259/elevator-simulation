"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

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
  PassengerSession,
} from "@/types/elevator";

const DEFAULT_FORM: CreateBuildingPayload = {
  name: "Office Tower",
  floors: 10,
  elevators: 3,
};

export function useElevatorSimulation(
  initialBuildings: Building[],
  initialError?: string,
) {
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

  return {
    arrivedElevator,
    buildingState,
    buildings,
    createBuilding,
    error,
    form,
    isCreateOpen,
    isCreating,
    passengerFloor,
    passengerSession,
    pendingCall,
    pendingDestination,
    pickDestination,
    selectedBuilding,
    selectedBuildingId,
    setForm,
    setIsCreateOpen,
    setPassengerSession,
    setSelectedBuildingId,
    streamStatus,
    updatePassengerFloor,
    callElevator,
    callElevatorFromPassengerPov,
  };
}
