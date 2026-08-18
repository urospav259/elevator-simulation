"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { ELEVATOR_LIMITS } from "@/config/elevator-limits";
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
  CreateBuildingForm,
  PassengerSession,
} from "@/types/elevator";

const DEFAULT_FORM: CreateBuildingForm = {
  name: "Office Tower",
  floors: "10",
  elevators: "3",
};

function parseInteger(value: string) {
  if (!value.trim()) {
    return null;
  }

  const parsedValue = Number(value);

  return Number.isInteger(parsedValue) ? parsedValue : null;
}

function clampFloor(floor: number, floorsCount: number) {
  return Math.min(Math.max(floor, ELEVATOR_LIMITS.minFloor), floorsCount);
}

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
  const [form, setForm] = useState<CreateBuildingForm>(DEFAULT_FORM);
  const [isCreating, setIsCreating] = useState(false);
  const [pendingCall, setPendingCall] = useState<string | null>(null);
  const [pendingDestination, setPendingDestination] = useState(false);
  const [passengerFloorInput, setPassengerFloorInput] = useState("1");
  const [passengerSession, setPassengerSession] =
    useState<PassengerSession | null>(null);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [streamStatus, setStreamStatus] = useState<"idle" | "open" | "error">(
    "idle",
  );

  const selectedBuildingIdRef = useRef(selectedBuildingId);

  const selectedBuilding = useMemo(
    () => buildings.find((building) => building.id === selectedBuildingId),
    [buildings, selectedBuildingId],
  );
  const passengerFloor = useMemo(
    () => parseInteger(passengerFloorInput),
    [passengerFloorInput],
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
    selectedBuildingIdRef.current = selectedBuildingId;
  }, [selectedBuildingId]);

  useEffect(() => {
    if (!selectedBuildingId) {
      setBuildingState(null);
      setPassengerSession(null);
      setPassengerFloorInput("1");
      setStreamStatus("idle");
      return;
    }

    setBuildingState(null);
    setPassengerSession(null);
    setPassengerFloorInput("1");
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

  function resetPassengerPov() {
    setPassengerSession(null);
    setPassengerFloorInput("1");
    setPendingCall(null);
    setPendingDestination(false);
  }

  function selectBuilding(buildingId: string) {
    if (buildingId === selectedBuildingId) {
      return;
    }

    resetPassengerPov();
    setSelectedBuildingId(buildingId);
  }

  async function createBuilding(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsCreating(true);

    const name = form.name.trim();
    const floors = parseInteger(form.floors);
    const elevators = parseInteger(form.elevators);

    if (!name) {
      setError("Building name is required.");
      setIsCreating(false);
      return;
    }

    if (
      !floors ||
      floors < ELEVATOR_LIMITS.minFloor ||
      floors > ELEVATOR_LIMITS.maxBuildingFloors ||
      !elevators ||
      elevators < ELEVATOR_LIMITS.minElevators ||
      elevators > ELEVATOR_LIMITS.maxElevators
    ) {
      setError(
        `Building must have ${ELEVATOR_LIMITS.minFloor}-${ELEVATOR_LIMITS.maxBuildingFloors} floors and ${ELEVATOR_LIMITS.minElevators}-${ELEVATOR_LIMITS.maxElevators} elevators.`,
      );
      setIsCreating(false);
      return;
    }

    try {
      const building = await createBuildingRequest({
        name,
        floors,
        elevators,
      });

      setBuildings((current) => [building, ...current]);
      resetPassengerPov();
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
    floor: number | null,
    direction: CallDirection,
  ) {
    if (!floor) {
      return;
    }

    const requestedBuildingId = selectedBuildingIdRef.current;
    const wasCalled = await callElevator(floor, direction);

    if (wasCalled && requestedBuildingId === selectedBuildingIdRef.current) {
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

  function updatePassengerFloor(value: string) {
    if (value === "") {
      setPassengerFloorInput("");
      return;
    }

    const floor = parseInteger(value);

    if (!floor) {
      return;
    }

    const floorsCount =
      buildingState?.floors ?? selectedBuilding?.numberOfFloors ?? 1;

    setPassengerFloorInput(String(clampFloor(floor, floorsCount)));
  }

  useEffect(() => {
    const floorsCount =
      buildingState?.floors ?? selectedBuilding?.numberOfFloors ?? 1;

    setPassengerFloorInput((currentFloor) => {
      if (currentFloor === "") {
        return currentFloor;
      }

      const floor = parseInteger(currentFloor);

      return String(clampFloor(floor ?? ELEVATOR_LIMITS.minFloor, floorsCount));
    });
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
      setPassengerFloorInput(String(passengerSession.destinationFloor));
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
    passengerFloorInput,
    passengerSession,
    pendingCall,
    pendingDestination,
    pickDestination,
    selectedBuilding,
    selectedBuildingId,
    setForm,
    setIsCreateOpen,
    resetPassengerPov,
    selectBuilding,
    streamStatus,
    updatePassengerFloor,
    callElevator,
    callElevatorFromPassengerPov,
  };
}
