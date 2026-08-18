"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import type { CreateBuildingForm } from "@/types/elevator";

import { ELEVATOR_LIMITS } from "@/config/elevator-limits";
import { createBuilding, getErrorMessage } from "@/lib/elevator-api";

const DEFAULT_FORM: CreateBuildingForm = {
  name: "Office Tower",
  floors: "10",
  elevators: "3",
};

// must be client component,
// because it uses state and router

function parseInteger(value: string) {
  if (!value.trim()) {
    return null;
  }

  const parsedValue = Number(value);

  return Number.isInteger(parsedValue) ? parsedValue : null;
}

export function CreateBuildingButton() {
  const router = useRouter();
  const [form, setForm] = useState<CreateBuildingForm>(DEFAULT_FORM);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitBuilding(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const name = form.name.trim();
    const floors = parseInteger(form.floors);
    const elevators = parseInteger(form.elevators);

    if (!name) {
      setError("Building name is required.");
      setIsLoading(false);
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
      setIsLoading(false);
      return;
    }

    try {
      const building = await createBuilding({ name, floors, elevators });

      setForm(DEFAULT_FORM);
      setIsOpen(false);
      router.push(`/?buildingId=${building.id}`);
    } catch (createError) {
      setError(getErrorMessage(createError));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover"
      >
        New building
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-6">
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-building-title"
            onSubmit={submitBuilding}
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
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-md border border-control text-lg leading-none text-muted hover:bg-panel"
                aria-label="Close create building modal"
              >
                x
              </button>
            </div>

            {error ? (
              <div
                className="mt-4 rounded-md border border-danger-border bg-danger-soft px-3 py-2 text-sm text-danger-strong"
                role="alert"
              >
                {error}
              </div>
            ) : null}

            <label className="mt-5 block text-sm font-medium text-foreground">
              Name
              <input
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
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
                    setForm({ ...form, floors: event.target.value })
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
                    setForm({ ...form, elevators: event.target.value })
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
                onClick={() => setIsOpen(false)}
                className="rounded-md border border-control px-4 py-2 text-sm font-semibold text-muted transition hover:bg-panel"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-60"
              >
                {isLoading ? "Creating..." : "Create building"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
