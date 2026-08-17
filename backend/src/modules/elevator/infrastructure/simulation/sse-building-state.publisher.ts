import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

import { BuildingStatePublisher } from '../../application/ports/building-state.publisher';
import { Elevator } from '../../domain/entities/elevator';
import { ElevatorSnapshot } from '../../domain/types/elevator-snapshot';

type BuildingStateEvent = {
  buildingId: string;
  elevators: ElevatorSnapshot[];
};

type BuildingStateStream = {
  subject: Subject<MessageEvent>;
  subscribers: number;
};

@Injectable()
export class SseBuildingStatePublisher implements BuildingStatePublisher {
  private readonly streams = new Map<string, BuildingStateStream>();

  async publish({
    elevators,
    buildingId,
  }: {
    elevators: Elevator[] | ElevatorSnapshot[];
    buildingId: string;
  }): Promise<void> {
    const stream = this.streams.get(buildingId);

    if (!stream) {
      return;
    }

    stream.subject.next({
      type: 'building-state',
      data: {
        buildingId,
        elevators: this.toSnapshots(elevators),
      } satisfies BuildingStateEvent,
    });
  }

  stream(buildingId: string): Observable<MessageEvent> {
    return new Observable((subscriber) => {
      const stream = this.getStream(buildingId);
      stream.subscribers += 1;

      const subscription = stream.subject.subscribe(subscriber);

      return () => {
        subscription.unsubscribe();
        stream.subscribers -= 1;

        if (stream.subscribers <= 0) {
          stream.subject.complete();
          this.streams.delete(buildingId);
        }
      };
    });
  }

  private getStream(buildingId: string): BuildingStateStream {
    let stream = this.streams.get(buildingId);

    if (!stream) {
      stream = {
        subject: new Subject<MessageEvent>(),
        subscribers: 0,
      };
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
