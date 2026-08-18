import type { Building } from "@/types/elevator";

import { ElevatorDashboard } from "@/components/elevator-dashboard";
import { getErrorMessage, getAllBuildings } from "@/lib/elevator-api";

// server component without caching,
// bacause we need list of buildings every time
// if we has static list of buildings, we could just
// use next cache for this component because that is only thing
// that is loading from our server

// if we wanted to go crazy, we could refetch
// only on new buiding added, but i think
// this is the better way
export const dynamic = "force-dynamic";

type HomeSearchParams = {
  buildingId?: string | string[];
};

type HomeProps = {
  searchParams?: Promise<HomeSearchParams>;
};

function getBuildingIdFromQueryParams(searchParams?: HomeSearchParams) {
  const buildingId = searchParams?.buildingId;

  return Array.isArray(buildingId) ? buildingId[0] : buildingId;
}

function getSelectedBuildingId(
  buildings: Building[] = [],
  requestedBuildingId?: string,
) {
  if (!requestedBuildingId) {
    return buildings[0]?.id || null;
  }

  const targetBuilding =
    buildings.find((building) => building.id === requestedBuildingId) ||
    buildings[0];

  return targetBuilding?.id || null;
}

export default async function Home({ searchParams }: HomeProps) {
  let buildings: Building[] = [];
  let initialError: string | undefined;

  const queryParams = await searchParams;

  try {
    buildings = await getAllBuildings();
  } catch (error) {
    initialError = getErrorMessage(error);
  }

  const selectedBuildingId = getSelectedBuildingId(
    buildings,
    getBuildingIdFromQueryParams(queryParams),
  );

  return (
    <ElevatorDashboard
      buildings={buildings}
      selectedBuildingId={selectedBuildingId}
      loadingError={initialError}
    />
  );
}
