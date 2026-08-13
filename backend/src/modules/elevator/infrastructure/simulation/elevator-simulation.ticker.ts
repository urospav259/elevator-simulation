import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';

import { GetActiveBuildingIdsUseCase } from '../../application/use-cases/get-active-building-ids.use-case';
import { MoveElevatorsUseCase } from '../../application/use-cases/move-elevators.use-case';

@Injectable()
export class ElevatorSimulationTicker {
  private readonly logger = new Logger(ElevatorSimulationTicker.name);
  private isTickRunning = false;

  constructor(
    private readonly getActiveBuildingIds: GetActiveBuildingIdsUseCase,
    private readonly moveElevators: MoveElevatorsUseCase,
  ) {}

  @Interval(15000)
  async tick(): Promise<void> {
    if (this.isTickRunning) {
      return;
    }

    this.isTickRunning = true;

    try {
      const buildingIds = await this.getActiveBuildingIds.execute();

      await Promise.all(
        buildingIds.map((buildingId) => this.moveElevators.execute(buildingId)),
      );
    } catch (error) {
      this.logger.error('Failed to tick elevator simulation', error);
    } finally {
      this.isTickRunning = false;
    }
  }
}
