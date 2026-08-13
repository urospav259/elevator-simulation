import { Building } from '../../domain/entities/building';
import { BuildingRepository } from '../ports/building.repository';

export class GetBuildingUseCase {
  constructor(private buildingRepository: BuildingRepository) {}

  async execute(): Promise<Building[]> {
    return this.buildingRepository.list();
  }
}
