import { Injectable } from '@nestjs/common';

import { BuildingStatePublisher } from '../../application/ports/building-state.publisher';
import { Elevator } from '../../domain/entities/elevator';
import { ElevatorSnapshot } from '../../domain/types/elevator-snapshot';

@Injectable()
export class NoopBuildingStatePublisher implements BuildingStatePublisher {
  async publish(_state: {
    elevators: Elevator[] | ElevatorSnapshot[];
    buildingId: string;
  }): Promise<void> {
    return;
  }
}
