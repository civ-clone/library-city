import { AvailableSpecialistRegistry } from '@civ-clone/core-city/AvailableSpecialistRegistry';
import { CityGrowthRegistry } from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { PlayerWorldRegistry } from '@civ-clone/core-player-world/PlayerWorldRegistry';
import { SpecialistRegistry } from '@civ-clone/core-city/SpecialistRegistry';
import { WorkedTileRegistry } from '@civ-clone/core-city/WorkedTileRegistry';
import City from '@civ-clone/core-city/City';
import Tile from '@civ-clone/core-world/Tile';
import Yield from '@civ-clone/core-yield/Yield';
import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
import Specialist from '@civ-clone/core-city/Specialist';
/**
 * How many citizens `city` has placed: one per worked tile, the city centre included, and one per `Specialist`. A city
 * of size `n` has `n + 1`.
 */
export declare const citizenCount: (
  city: City,
  workedTileRegistry?: WorkedTileRegistry,
  specialistRegistry?: SpecialistRegistry
) => number;
/**
 * Makes a citizen of `city` a `Specialist` of the first available kind (an Entertainer, in Civ1). Returns `null` when
 * the ruleset offers no specialists.
 */
export declare const addSpecialist: (
  city: City,
  specialistRegistry?: SpecialistRegistry,
  availableSpecialistRegistry?: AvailableSpecialistRegistry
) => Specialist | null;
/**
 * Turns `specialist` into the next available kind, wrapping back to the first. Returns the `Specialist` that replaces
 * it, or `specialist` itself when there is nothing to change it to.
 */
export declare const changeSpecialist: (
  specialist: Specialist,
  specialistRegistry?: SpecialistRegistry,
  availableSpecialistRegistry?: AvailableSpecialistRegistry
) => Specialist;
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
/**
 * Rearranges the tiles `city` works from scratch. Its specialists stay as they are.
 */
export declare const reassignWorkers: (
  city: City,
  playerWorldRegistry?: PlayerWorldRegistry,
  cityGrowthRegistry?: CityGrowthRegistry,
  workedTileRegistry?: WorkedTileRegistry,
  specialistRegistry?: SpecialistRegistry,
  availableSpecialistRegistry?: AvailableSpecialistRegistry
) => void;
/**
 * Places each of `city`'s citizens that has no job on the best tile available, or makes them a specialist if there is
 * no tile left to work.
 */
export declare const assignWorkers: (
  city: City,
  playerWorldRegistry?: PlayerWorldRegistry,
  cityGrowthRegistry?: CityGrowthRegistry,
  workedTileRegistry?: WorkedTileRegistry,
  specialistRegistry?: SpecialistRegistry,
  availableSpecialistRegistry?: AvailableSpecialistRegistry
) => void;
/**
 * Places one new citizen of `city` on the best tile available, or makes them a specialist if there is no tile left.
 */
export declare const assignWorker: (
  city: City,
  playerWorldRegistry?: PlayerWorldRegistry,
  cityGrowthRegistry?: CityGrowthRegistry,
  workedTileRegistry?: WorkedTileRegistry,
  specialistRegistry?: SpecialistRegistry,
  availableSpecialistRegistry?: AvailableSpecialistRegistry
) => void;
export type WorkedTileChange = 'removed' | 'added' | 'reassigned' | 'none';
/**
 * Changes whether `tile` is worked by `city`, as a player clicking it on the city map would.
 *
 * A tile the city works stops being worked, and its worker becomes a specialist. Any other tile is worked by a
 * specialist, or by a citizen with no job, if the city has one and is allowed to work it. With every citizen already
 * working a tile, the city's workers are reassigned instead. The city centre is always worked.
 */
export declare const changeWorkedTile: (
  city: City,
  tile: Tile,
  playerWorldRegistry?: PlayerWorldRegistry,
  cityGrowthRegistry?: CityGrowthRegistry,
  workedTileRegistry?: WorkedTileRegistry,
  specialistRegistry?: SpecialistRegistry,
  availableSpecialistRegistry?: AvailableSpecialistRegistry
) => WorkedTileChange;
/**
 * Takes jobs away from `city`'s citizens until it has no more than its size allows: specialists first, then the
 * workers on the least valuable tiles.
 */
export declare const releaseCitizens: (
  city: City,
  cityGrowth: CityGrowth,
  workedTileRegistry?: WorkedTileRegistry,
  specialistRegistry?: SpecialistRegistry
) => void;
export declare const reduceWorkers: (
  city: City,
  cityGrowth: CityGrowth
) => Tile[];
export default assignWorkers;
