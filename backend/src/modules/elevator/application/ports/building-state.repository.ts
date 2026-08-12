import { BuildingState } from '../../domain/types/building-state';

export const BUILDING_STATE_REPOSITORY = Symbol('BUILDING_STATE_REPOSITORY');

export interface BuildingStateRepository {
  getBuildingData(): Promise<BuildingState>;
}
