import {
  normalizeBuilding,
  normalizeBuildingState,
} from "@/lib/elevator-mappers";
import type {
  Building,
  BuildingStateEvent,
  CallElevatorPayload,
  CreateBuildingPayload,
} from "@/types/elevator";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

export const API_ENDPOINTS = {
  BUILDINGS: "/buildings",
  ELEVATOR_CALLS: "/elevator-calls",
  BUILDING_STATE_EVENTS: (buildingId: string) =>
    `/building-state/${buildingId}/events`,
} as const;

type ApiRequestOptions = Omit<RequestInit, "body" | "method">;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly payload?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unexpected error";
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: init.cache ?? "no-store",
    ...init,
    headers,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message =
      typeof payload?.message === "string"
        ? payload.message
        : `Request failed with status ${response.status}`;

    throw new ApiError(message, response.status, payload);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();

  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

const api = {
  get<T>(path: string, options?: ApiRequestOptions): Promise<T> {
    return request<T>(path, {
      ...options,
      method: "GET",
    });
  },

  post<TResponse, TPayload>(
    path: string,
    payload: TPayload,
    options?: ApiRequestOptions,
  ): Promise<TResponse> {
    return request<TResponse>(path, {
      ...options,
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

export async function listBuildings(): Promise<Building[]> {
  const data = await api.get<unknown[]>(API_ENDPOINTS.BUILDINGS);
  return data.map(normalizeBuilding);
}

export async function createBuilding(
  payload: CreateBuildingPayload,
): Promise<Building> {
  const data = await api.post<unknown, CreateBuildingPayload>(
    API_ENDPOINTS.BUILDINGS,
    payload,
  );

  return normalizeBuilding(data);
}

export async function callElevator(payload: CallElevatorPayload): Promise<void> {
  await api.post<void, CallElevatorPayload>(
    API_ENDPOINTS.ELEVATOR_CALLS,
    payload,
  );
}

export function subscribeToBuildingState(
  buildingId: string,
  handlers: {
    onOpen?: () => void;
    onMessage: (state: BuildingStateEvent) => void;
    onError?: () => void;
  },
): () => void {
  const events = new EventSource(
    `${API_BASE_URL}${API_ENDPOINTS.BUILDING_STATE_EVENTS(buildingId)}`,
  );

  events.addEventListener("open", () => {
    handlers.onOpen?.();
  });

  events.addEventListener("building-state", (event) => {
    const payload = JSON.parse(event.data) as BuildingStateEvent;
    handlers.onMessage(normalizeBuildingState(payload));
  });

  events.addEventListener("error", () => {
    handlers.onError?.();
  });

  return () => {
    events.close();
  };
}
