import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { PlayerWorldRegistry } from '@civ-clone/core-player-world/PlayerWorldRegistry';
import { WorkedTileRegistry } from '@civ-clone/core-city/WorkedTileRegistry';
import City from '@civ-clone/core-city/City';
import Tile from '@civ-clone/core-world/Tile';
import Yield from '@civ-clone/core-yield/Yield';
import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
export declare const getHighestValueCityTiles: (city: City) => Tile[];
export declare const sortTiles: (
  tiles: Tile[],
  city: City,
  weights?: [typeof Yield, number][]
) => Tile[];
export declare const getHighestValueAvailableCityTiles: (
  city: City,
  playerWorldRegistry?: PlayerWorldRegistry,
  workedTileRegistry?: WorkedTileRegistry
) => Tile[];
export declare const reassignWorkers: (
  city: City,
  playerWorldRegistry?: PlayerWorldRegistry,
  cityGrowthRegistry?: CityGrowthRegistry,
  workedTileRegistry?: WorkedTileRegistry
) => void;
export declare const assignWorkers: (
  city: City,
  playerWorldRegistry?: PlayerWorldRegistry,
  cityGrowthRegistry?: CityGrowthRegistry,
  workedTileRegistry?: WorkedTileRegistry
) => void;
export declare const assignWorker: (
  city: City,
  playerWorldRegistry?: PlayerWorldRegistry,
  cityGrowthRegistry?: CityGrowthRegistry,
  workedTileRegistry?: WorkedTileRegistry
) => void;
export declare const reduceWorkers: (
  city: City,
  cityGrowth: CityGrowth
) => Tile[];
export default assignWorkers;
