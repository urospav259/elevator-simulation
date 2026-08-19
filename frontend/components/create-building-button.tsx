"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import type { CreateBuildingForm } from "@/types/elevator";

import { ELEVATOR_LIMITS } from "@/config/elevator-limits";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { createBuilding, getErrorMessage } from "@/lib/elevator-api";

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
      <Button size="sm" onClick={() => setIsOpen(true)}>
        New building
      </Button>

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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                aria-label="Close create building modal"
              >
                x
              </Button>
            </div>

            {error ? (
              <div
                className="mt-4 rounded-md border border-danger-border bg-danger-soft px-3 py-2 text-sm text-danger-strong"
                role="alert"
              >
                {error}
              </div>
            ) : null}

            <InputField
              label="Name"
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              minLength={1}
              maxLength={120}
              required
            />

            <div className="mt-4 grid grid-cols-2 gap-3">
              <InputField
                label="Floors"
                type="number"
                value={form.floors}
                onChange={(event) =>
                  setForm({ ...form, floors: event.target.value })
                }
                min={ELEVATOR_LIMITS.minFloor}
                max={ELEVATOR_LIMITS.maxBuildingFloors}
                inputMode="numeric"
                required
              />

              <InputField
                label="Elevators"
                type="number"
                value={form.elevators}
                onChange={(event) =>
                  setForm({ ...form, elevators: event.target.value })
                }
                min={ELEVATOR_LIMITS.minElevators}
                max={ELEVATOR_LIMITS.maxElevators}
                inputMode="numeric"
                required
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create building"}
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
