import { Building } from '../../domain/entities/building';
import { BuildingRepository } from '../ports/building.repository';
import { CreateBuildingPayload } from '../dto/create-building-payload';
import { Elevator } from '../../domain/entities/elevator';
import { randomUUID } from 'crypto';
import { Direction } from '../../domain/types/direction';
import { DoorState } from '../../domain/types/door-state';

export class CreateBuildingUseCase {
  constructor(private buildingRepository: BuildingRepository) {}

  async execute(buildingPayload: CreateBuildingPayload): Promise<void> {
    const building = new Building(randomUUID(), buildingPayload.floors, []);

    const elevators = Array(buildingPayload.elevators).map((_, index) => {
      return new Elevator(
        randomUUID(),
        1,
        Direction.IDLE,
        DoorState.CLOSED,
        building.getId(),
      );
    });

    building.setElevators(elevators);

    return this.buildingRepository.save(building);
  }
}
