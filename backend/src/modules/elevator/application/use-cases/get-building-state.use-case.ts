import { BuildingState } from '../../domain/types/building-state';
import { BuildingStateRepository } from '../ports/building-state.repository';

export class GetBuildingStateUseCase {
  constructor(private buildingStateRepository: BuildingStateRepository) {}

  async execute(): Promise<BuildingState> {
    return this.buildingStateRepository.getBuildingData();
  }
}
