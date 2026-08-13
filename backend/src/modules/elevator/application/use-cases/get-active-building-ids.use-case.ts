import { BuildingRepository } from '../ports/building.repository';

export class GetActiveBuildingIdsUseCase {
  constructor(private readonly buildingRepository: BuildingRepository) {}

  async execute(): Promise<string[]> {
    return this.buildingRepository.listActiveBuildingIds();
  }
}
