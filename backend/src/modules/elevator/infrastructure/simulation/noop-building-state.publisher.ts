import { Injectable } from '@nestjs/common';

import { BuildingStatePublisher } from '../../application/ports/building-state.publisher';
import { Elevator } from '../../domain/entities/elevator';

@Injectable()
export class NoopBuildingStatePublisher implements BuildingStatePublisher {
  async publish(_state: {
    elevators: Elevator[];
    buildingId: string;
  }): Promise<void> {
    return;
  }
}
