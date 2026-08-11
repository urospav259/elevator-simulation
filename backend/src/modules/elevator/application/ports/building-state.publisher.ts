import { BuildingState } from '../../domen/types/building-state';

export const BUILDING_STATE_PUBLISHER = Symbol('BUILDING_STATE_PUBLISHER');

export interface BuildingStatePublisher {
  publish(state: BuildingState): Promise<void>;
}
