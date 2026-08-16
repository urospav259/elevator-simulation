"use client";

import { FormEvent } from "react";

import type { Building, CreateBuildingPayload } from "@/types/elevator";

type BuildingManagementProps = {
  buildings: Building[];
  selectedBuildingId: string | null;
  form: CreateBuildingPayload;
  isCreateOpen: boolean;
  isCreating: boolean;
  onSelectBuilding: (buildingId: string) => void;
  onOpenCreate: () => void;
  onCloseCreate: () => void;
  onFormChange: (form: CreateBuildingPayload) => void;
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
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[#17202a]">Buildings</h2>
        <span className="text-sm text-[#53616f]">{buildings.length} total</span>
      </div>

      {buildings.length === 0 ? (
        <div className="rounded-lg border border-[#d9dee5] bg-white px-4 py-5 text-sm text-[#53616f]">
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
                className={`rounded-lg border bg-white p-4 text-left shadow-sm transition hover:border-[#2067a8] ${
                  isSelected
                    ? "border-[#2067a8] ring-2 ring-[#9dccf3]"
                    : "border-[#d9dee5]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-[#17202a]">
                      {building.name}
                    </h3>
                    <p className="mt-1 text-xs text-[#697786]">{building.id}</p>
                  </div>
                  <span className="rounded-md bg-[#e8f2fb] px-2 py-1 text-xs font-semibold text-[#1f5f97]">
                    {isSelected ? "Selected" : "Open"}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-md bg-[#f2f5f8] px-3 py-2">
                    <span className="block text-xs text-[#697786]">Floors</span>
                    <strong>{building.numberOfFloors}</strong>
                  </div>
                  <div className="rounded-md bg-[#f2f5f8] px-3 py-2">
                    <span className="block text-xs text-[#697786]">
                      Elevators
                    </span>
                    <strong>{building.elevators.length}</strong>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {buildings.length === 0 ? (
        <button
          type="button"
          onClick={onOpenCreate}
          className="rounded-md bg-[#2067a8] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#18598f]"
        >
          New building
        </button>
      ) : null}

      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-6">
          <form
            onSubmit={onCreateBuilding}
            className="w-full max-w-md rounded-lg border border-[#d9dee5] bg-white p-5 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-[#17202a]">
                  New building
                </h2>
                <p className="mt-1 text-sm text-[#53616f]">
                  The new building becomes selected immediately after creation.
                </p>
              </div>
              <button
                type="button"
                onClick={onCloseCreate}
                className="h-8 w-8 rounded-md border border-[#c9d3dd] text-lg leading-none text-[#53616f] hover:bg-[#f2f5f8]"
                aria-label="Close create building modal"
              >
                x
              </button>
            </div>

            <label className="mt-5 block text-sm font-medium text-[#17202a]">
              Name
              <input
                value={form.name}
                onChange={(event) =>
                  onFormChange({ ...form, name: event.target.value })
                }
                className="mt-1 h-10 w-full rounded-md border border-[#c9d3dd] px-3 text-sm outline-none transition focus:border-[#2067a8] focus:ring-2 focus:ring-[#9dccf3]"
                minLength={1}
                maxLength={120}
                required
              />
            </label>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="block text-sm font-medium text-[#17202a]">
                Floors
                <input
                  type="number"
                  value={form.floors}
                  onChange={(event) =>
                    onFormChange({ ...form, floors: Number(event.target.value) })
                  }
                  className="mt-1 h-10 w-full rounded-md border border-[#c9d3dd] px-3 text-sm outline-none transition focus:border-[#2067a8] focus:ring-2 focus:ring-[#9dccf3]"
                  min={1}
                  max={30}
                  required
                />
              </label>

              <label className="block text-sm font-medium text-[#17202a]">
                Elevators
                <input
                  type="number"
                  value={form.elevators}
                  onChange={(event) =>
                    onFormChange({
                      ...form,
                      elevators: Number(event.target.value),
                    })
                  }
                  className="mt-1 h-10 w-full rounded-md border border-[#c9d3dd] px-3 text-sm outline-none transition focus:border-[#2067a8] focus:ring-2 focus:ring-[#9dccf3]"
                  min={1}
                  max={10}
                  required
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={onCloseCreate}
                className="rounded-md border border-[#c9d3dd] px-4 py-2 text-sm font-semibold text-[#53616f] transition hover:bg-[#f2f5f8]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="rounded-md bg-[#2067a8] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#18598f] disabled:opacity-60"
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
