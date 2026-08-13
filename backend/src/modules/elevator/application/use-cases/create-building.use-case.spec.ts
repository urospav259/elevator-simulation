import { describe, expect, it } from '@jest/globals';

import { CreateBuildingUseCase } from './create-building.use-case';
import { Building } from '../../domain/entities/building';
import { BuildingRepository } from '../ports/building.repository';

class FakeBuildingRepository implements BuildingRepository {
  savedBuilding: Building | null = null;

  async findById(): Promise<Building | null> {
    return null;
  }

  async list(): Promise<Building[]> {
    return [];
  }

  async save(building: Building): Promise<void> {
    this.savedBuilding = building;
  }

  async listActiveBuildingIds(): Promise<string[]> {
    return [];
  }
}

describe('CreateBuildingUseCase', () => {
  it('creates a building with the requested number of elevators', async () => {
    const repository = new FakeBuildingRepository();
    const useCase = new CreateBuildingUseCase(repository);

    const building = await useCase.execute({
      name: 'Office',
      floors: 12,
      elevators: 4,
    });

    expect(repository.savedBuilding).toBe(building);
    expect(building.getName()).toBe('Office');
    expect(building.getNumberOfFloors()).toBe(12);
    expect(building.getElevators()).toHaveLength(4);
    expect(
      building.getElevators().every((elevator) => elevator.getBuildingId() === building.getId()),
    ).toBe(true);
  });
});
