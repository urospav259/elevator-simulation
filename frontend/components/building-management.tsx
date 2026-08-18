"use client";

import { FormEvent } from "react";

import { ELEVATOR_LIMITS } from "@/config/elevator-limits";
import type { Building, CreateBuildingForm } from "@/types/elevator";

type BuildingManagementProps = {
  buildings: Building[];
  selectedBuildingId: string | null;
  form: CreateBuildingForm;
  isCreateOpen: boolean;
  isCreating: boolean;
  onSelectBuilding: (buildingId: string) => void;
  onOpenCreate: () => void;
  onCloseCreate: () => void;
  onFormChange: (form: CreateBuildingForm) => void;
  onCreateBuilding: (event: FormEvent<HTMLFormElement>) => void;
};

export function BuildingManagement({
  buildings,
  selectedBuildingId,
  form,
  isCreateOpen,
  isCreating,
  onSelectBuilding,
  onOpenCreate,
  onCloseCreate,
  onFormChange,
  onCreateBuilding,
}: BuildingManagementProps) {
  return (
    <aside className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Buildings</h2>
          <span className="text-sm text-muted">{buildings.length} total</span>
        </div>
        <button
          type="button"
          onClick={onOpenCreate}
          className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover"
        >
          New building
        </button>
      </div>

      {buildings.length === 0 ? (
        <div className="rounded-lg border border-border bg-white px-4 py-5 text-sm text-muted">
          No buildings yet. Create one to start the simulation.
        </div>
      ) : (
        <div className="grid gap-3">
          {buildings.map((building) => {
            const isSelected = building.id === selectedBuildingId;

            return (
              <button
                key={building.id}
                type="button"
                onClick={() => onSelectBuilding(building.id)}
                className={`rounded-lg border bg-white p-4 text-left shadow-sm transition hover:border-primary ${
                  isSelected
                    ? "border-primary ring-2 ring-focus"
                    : "border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {building.name}
                    </h3>
                    <p className="mt-1 text-xs text-subtle">{building.id}</p>
                  </div>
                  <span className="rounded-md bg-primary-soft px-2 py-1 text-xs font-semibold text-primary-strong">
                    {isSelected ? "Selected" : "Open"}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-md bg-panel px-3 py-2">
                    <span className="block text-xs text-subtle">Floors</span>
                    <strong>{building.numberOfFloors}</strong>
                  </div>
                  <div className="rounded-md bg-panel px-3 py-2">
                    <span className="block text-xs text-subtle">Elevators</span>
                    <strong>{building.elevators.length}</strong>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-6">
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-building-title"
            onSubmit={onCreateBuilding}
            className="w-full max-w-md rounded-lg border border-border bg-white p-5 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="create-building-title"
                  className="text-xl font-semibold text-foreground"
                >
                  New building
                </h2>
                <p className="mt-1 text-sm text-muted">
                  The new building becomes selected immediately after creation.
                </p>
              </div>
              <button
                type="button"
                onClick={onCloseCreate}
                className="h-8 w-8 rounded-md border border-control text-lg leading-none text-muted hover:bg-panel"
                aria-label="Close create building modal"
              >
                x
              </button>
            </div>

            <label className="mt-5 block text-sm font-medium text-foreground">
              Name
              <input
                value={form.name}
                onChange={(event) =>
                  onFormChange({ ...form, name: event.target.value })
                }
                className="mt-1 h-10 w-full rounded-md border border-control px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-focus"
                minLength={1}
                maxLength={120}
                required
              />
            </label>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="block text-sm font-medium text-foreground">
                Floors
                <input
                  type="number"
                  value={form.floors}
                  onChange={(event) =>
                    onFormChange({
                      ...form,
                      floors: event.target.value,
                    })
                  }
                  className="mt-1 h-10 w-full rounded-md border border-control px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-focus"
                  min={ELEVATOR_LIMITS.minFloor}
                  max={ELEVATOR_LIMITS.maxBuildingFloors}
                  inputMode="numeric"
                  required
                />
              </label>

              <label className="block text-sm font-medium text-foreground">
                Elevators
                <input
                  type="number"
                  value={form.elevators}
                  onChange={(event) =>
                    onFormChange({
                      ...form,
                      elevators: event.target.value,
                    })
                  }
                  className="mt-1 h-10 w-full rounded-md border border-control px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-focus"
                  min={ELEVATOR_LIMITS.minElevators}
                  max={ELEVATOR_LIMITS.maxElevators}
                  inputMode="numeric"
                  required
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={onCloseCreate}
                className="rounded-md border border-control px-4 py-2 text-sm font-semibold text-muted transition hover:bg-panel"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-60"
              >
                {isCreating ? "Creating..." : "Create building"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </aside>
  );
}
