import { ElevatorDashboard } from "@/components/elevator-dashboard";
import { getErrorMessage, listBuildings } from "@/lib/elevator-api";

export const dynamic = "force-dynamic";

export default async function Home() {
  try {
    const buildings = await listBuildings();

    return <ElevatorDashboard initialBuildings={buildings} />;
  } catch (error) {
    return (
      <ElevatorDashboard
        initialBuildings={[]}
        initialError={getErrorMessage(error)}
      />
    );
  }
}
