import { Building } from '../../domain/entities/building';
import { CreateBuildingPayload } from '../dto/create-building-payload';

export const BUILDING_REPOSITORY = Symbol('BUILDING_REPOSITORY');

export interface BuildingRepository {
  findById(id: string): Promise<Building | null>;
  list(): Promise<Building[]>;
  save(building: Building): Promise<void>;
}
