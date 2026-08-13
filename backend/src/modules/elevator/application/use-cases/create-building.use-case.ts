import { randomUUID } from 'crypto';

import { Building } from '../../domain/entities/building';
import { Elevator } from '../../domain/entities/elevator';
import { Direction } from '../../domain/types/direction';
import { DoorState } from '../../domain/types/door-state';
import { CreateBuildingPayload } from '../dto/create-building-payload';
import { BuildingRepository } from '../ports/building.repository';

export class CreateBuildingUseCase {
  constructor(private buildingRepository: BuildingRepository) {}

  async execute(buildingPayload: CreateBuildingPayload): Promise<Building> {
    const buildingId = randomUUID();

    const elevators = Array.from(
      { length: buildingPayload.elevators },
      () =>
        new Elevator(
          randomUUID(),
          1,
          Direction.IDLE,
          DoorState.CLOSED,
          buildingId,
        ),
    );

    const building = new Building(
      buildingId,
      buildingPayload.name,
      buildingPayload.floors,
      elevators,
    );

    await this.buildingRepository.save(building);

    return building;
  }
}
