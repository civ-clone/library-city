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
export type WorkedTileChange = 'removed' | 'added' | 'reassigned' | 'none';
/**
 * Changes whether `tile` is worked by `city`, as a player clicking it on the city map would.
 *
 * A tile the city works stops being worked. Any other tile is worked by a free worker, if the city has one and is
 * allowed to work it. With every worker already placed, the city's workers are reassigned instead. The city centre is
 * always worked.
 */
export declare const changeWorkedTile: (
  city: City,
  tile: Tile,
  playerWorldRegistry?: PlayerWorldRegistry,
  cityGrowthRegistry?: CityGrowthRegistry,
  workedTileRegistry?: WorkedTileRegistry
) => WorkedTileChange;
export declare const reduceWorkers: (
  city: City,
  cityGrowth: CityGrowth
) => Tile[];
export default assignWorkers;
