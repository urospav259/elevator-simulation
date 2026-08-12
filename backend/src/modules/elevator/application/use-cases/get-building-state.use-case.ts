import { BuildingState } from '../../domain/types/building-state';
import { BuildingStatePublisher } from '../ports/building-state.publisher';

export class GetBuildingStateUseCase {
  constructor(private publisher: BuildingStatePublisher) {}

  execute(state: BuildingState) {
    this.publisher.publish(state);
  }
}
