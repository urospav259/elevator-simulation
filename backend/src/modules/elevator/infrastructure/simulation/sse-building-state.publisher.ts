import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

import { BuildingStatePublisher } from '../../application/ports/building-state.publisher';
import { Elevator } from '../../domain/entities/elevator';
import { ElevatorSnapshot } from '../../domain/types/elevator-snapshot';

type BuildingStateEvent = {
  buildingId: string;
  elevators: ElevatorSnapshot[];
};

@Injectable()
export class SseBuildingStatePublisher implements BuildingStatePublisher {
  private readonly streams = new Map<string, Subject<MessageEvent>>();

  async publish({
    elevators,
    buildingId,
  }: {
    elevators: Elevator[] | ElevatorSnapshot[];
    buildingId: string;
  }): Promise<void> {
    this.getStream(buildingId).next({
      type: 'building-state',
      data: {
        buildingId,
        elevators: this.toSnapshots(elevators),
      } satisfies BuildingStateEvent,
    });
  }

  stream(buildingId: string): Observable<MessageEvent> {
    return this.getStream(buildingId).asObservable();
  }

  private getStream(buildingId: string): Subject<MessageEvent> {
    let stream = this.streams.get(buildingId);

    if (!stream) {
      stream = new Subject<MessageEvent>();
      this.streams.set(buildingId, stream);
    }

    return stream;
  }

  private toSnapshots(
    elevators: Elevator[] | ElevatorSnapshot[],
  ): ElevatorSnapshot[] {
    return elevators.map((elevator) => {
      if (elevator instanceof Elevator) {
        return elevator.toSnapshot();
      }

      return elevator;
    });
  }
}
