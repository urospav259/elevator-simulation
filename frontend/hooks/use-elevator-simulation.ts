"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type {
  Building,
  BuildingState,
  CallDirection,
  ElevatorSnapshot,
  PassengerSession,
} from "@/types/elevator";

import { DoorState } from "@/types/elevator";
import { ELEVATOR_LIMITS } from "@/config/elevator-limits";
import {
  callElevator as callElevatorRequest,
  getErrorMessage,
  pickDestination as pickDestinationRequest,
  subscribeToBuildingState,
} from "@/lib/elevator-api";

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

function mergeElevatorSnapshots(
  currentElevators: ElevatorSnapshot[],
  incomingElevators: ElevatorSnapshot[],
) {
  const elevatorsById = new Map(
    currentElevators.map((elevator) => [elevator.id, elevator]),
  );

  incomingElevators.forEach((elevator) => {
    elevatorsById.set(elevator.id, elevator);
  });

  return Array.from(elevatorsById.values());
}

export function useElevatorSimulation(
  selectedBuilding: Building | undefined,
  initialError?: string,
) {
  const selectedBuildingId = selectedBuilding?.id || null;
  const [buildingState, setBuildingState] = useState<BuildingState | null>(
    null,
  );
  const [pendingCall, setPendingCall] = useState<string | null>(null);
  const [pendingDestination, setPendingDestination] = useState(false);
  const [passengerFloorInput, setPassengerFloorInput] = useState("1");
  const [passengerSession, setPassengerSession] =
    useState<PassengerSession | null>(null);
  const [error, setError] = useState<string | null>(initialError || null);
  const [streamStatus, setStreamStatus] = useState<"idle" | "open" | "error">(
    "idle",
  );

  const selectedBuildingIdRef = useRef(selectedBuildingId);

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
    setBuildingState(null);
    setPassengerSession(null);
    setPassengerFloorInput("1");
    setStreamStatus("idle");

    if (!selectedBuildingId) {
      return;
    }

    const unsubscribe = subscribeToBuildingState(selectedBuildingId, {
      onOpen: () => {
        setStreamStatus("open");
        setError(null);
      },
      onMessage: (payload) => {
        setBuildingState((current) => {
          const currentElevators =
            current?.elevators ?? selectedBuilding?.elevators ?? [];

          return {
            buildingId: payload.buildingId,
            floors:
              payload.floors ||
              current?.floors ||
              selectedBuilding?.numberOfFloors ||
              0,
            elevators: mergeElevatorSnapshots(
              currentElevators,
              payload.elevators,
            ),
          };
        });
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

      return String(clampFloor(floor || ELEVATOR_LIMITS.minFloor, floorsCount));
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
    error,
    passengerFloor,
    passengerFloorInput,
    passengerSession,
    pendingCall,
    pendingDestination,
    pickDestination,
    resetPassengerPov,
    streamStatus,
    updatePassengerFloor,
    callElevator,
    callElevatorFromPassengerPov,
  };
}
