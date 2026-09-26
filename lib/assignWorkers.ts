import {
  AvailableSpecialistRegistry,
  instance as availableSpecialistRegistryInstance,
} from '@civ-clone/core-city/AvailableSpecialistRegistry';
import {
  CityGrowthRegistry,
  instance as cityGrowthRegistryInstance,
} from '@civ-clone/core-city-growth/CityGrowthRegistry';
import { Food, Production, Trade } from '../Yields';
import {
  PlayerWorldRegistry,
  instance as playerWorldRegistryInstance,
} from '@civ-clone/core-player-world/PlayerWorldRegistry';
import {
  SpecialistRegistry,
  instance as specialistRegistryInstance,
} from '@civ-clone/core-city/SpecialistRegistry';
import {
  WorkedTileRegistry,
  instance as workedTileRegistryInstance,
} from '@civ-clone/core-city/WorkedTileRegistry';
import City from '@civ-clone/core-city/City';
import Tile from '@civ-clone/core-world/Tile';
import Yield from '@civ-clone/core-yield/Yield';
import { reduceYield } from '@civ-clone/core-yield/lib/reduceYields';
import WorkedTile from '@civ-clone/core-city/WorkedTile';
import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
import Specialist from '@civ-clone/core-city/Specialist';

/**
 * How many citizens `city` has placed: one per worked tile, the city centre included, and one per `Specialist`. A city
 * of size `n` has `n + 1`.
 */
export const citizenCount = (
  city: City,
  workedTileRegistry: WorkedTileRegistry = workedTileRegistryInstance,
  specialistRegistry: SpecialistRegistry = specialistRegistryInstance
): number =>
  workedTileRegistry.getByCity(city).length +
  specialistRegistry.getByCity(city).length;

/**
 * Makes a citizen of `city` a `Specialist` of the first available kind (an Entertainer, in Civ1). Returns `null` when
 * the ruleset offers no specialists.
 */
export const addSpecialist = (
  city: City,
  specialistRegistry: SpecialistRegistry = specialistRegistryInstance,
  availableSpecialistRegistry: AvailableSpecialistRegistry = availableSpecialistRegistryInstance
): Specialist | null => {
  const [SpecialistType] = availableSpecialistRegistry.entries();

  if (!SpecialistType) {
    return null;
  }

  const specialist = new SpecialistType(city);

  specialistRegistry.register(specialist);

  return specialist;
};

/**
 * Turns `specialist` into the next available kind, wrapping back to the first. Returns the `Specialist` that replaces
 * it, or `specialist` itself when there is nothing to change it to.
 */
export const changeSpecialist = (
  specialist: Specialist,
  specialistRegistry: SpecialistRegistry = specialistRegistryInstance,
  availableSpecialistRegistry: AvailableSpecialistRegistry = availableSpecialistRegistryInstance
): Specialist => {
  const city = specialist.city(),
    types = availableSpecialistRegistry.entries(),
    NextType =
      types[
        (types.indexOf(specialist.constructor as typeof Specialist) + 1) %
          types.length
      ];

  if (!NextType || specialist instanceof NextType) {
    return specialist;
  }

  const replacement = new NextType(city);

  specialistRegistry.unregister(specialist);
  specialistRegistry.register(replacement);

  return replacement;
};

/**
 * Puts one of `city`'s specialists back to work, preferring the first available kind (Entertainers), and returns
 * whether there was one to remove.
 */
const removeSpecialist = (
  city: City,
  specialistRegistry: SpecialistRegistry,
  availableSpecialistRegistry: AvailableSpecialistRegistry
): boolean => {
  const specialists = specialistRegistry.getByCity(city),
    [DefaultType] = availableSpecialistRegistry.entries(),
    specialist =
      specialists.find(
        (specialist) => DefaultType && specialist instanceof DefaultType
      ) ?? specialists[specialists.length - 1];

  if (!specialist) {
    return false;
  }

  specialistRegistry.unregister(specialist);

  return true;
};

export const getHighestValueCityTiles = (city: City) =>
  sortTiles(city.tiles().entries(), city);

export const sortTiles = (
  tiles: Tile[],
  city: City,
  weights: [typeof Yield, number][] = [
    [Food, 8],
    [
      Production,
      3 *
        (reduceYield(city.tilesWorked().yields(city.player()), Production) === 0
          ? 3
          : 1),
    ],
    [
      Trade,
      1 *
        (reduceYield(city.tilesWorked().yields(city.player()), Trade) === 0
          ? 2
          : 1),
    ],
  ]
): Tile[] =>
  tiles.sort(
    (a: Tile, b: Tile) =>
      b.score(city.player(), weights) - a.score(city.player(), weights)
  );

export const getHighestValueAvailableCityTiles = (
  city: City,
  playerWorldRegistry: PlayerWorldRegistry = playerWorldRegistryInstance,
  workedTileRegistry: WorkedTileRegistry = workedTileRegistryInstance
) =>
  getHighestValueCityTiles(city).filter(
    (tile) =>
      workedTileRegistry.tileCanBeWorkedBy(tile, city) &&
      playerWorldRegistry.getByPlayer(city.player()).includes(tile)
  );

/**
 * Rearranges the tiles `city` works from scratch. Its specialists stay as they are.
 */
export const reassignWorkers = (
  city: City,
  playerWorldRegistry: PlayerWorldRegistry = playerWorldRegistryInstance,
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance,
  workedTileRegistry: WorkedTileRegistry = workedTileRegistryInstance,
  specialistRegistry: SpecialistRegistry = specialistRegistryInstance,
  availableSpecialistRegistry: AvailableSpecialistRegistry = availableSpecialistRegistryInstance
) => {
  workedTileRegistry
    .getBy('city', city)
    .forEach((workedTile: WorkedTile) =>
      workedTileRegistry.unregister(workedTile)
    );

  workedTileRegistry.register(new WorkedTile(city.tile(), city));

  assignWorkers(
    city,
    playerWorldRegistry,
    cityGrowthRegistry,
    workedTileRegistry,
    specialistRegistry,
    availableSpecialistRegistry
  );
};

/**
 * Places each of `city`'s citizens that has no job on the best tile available, or makes them a specialist if there is
 * no tile left to work.
 */
export const assignWorkers: (
  city: City,
  playerWorldRegistry?: PlayerWorldRegistry,
  cityGrowthRegistry?: CityGrowthRegistry,
  workedTileRegistry?: WorkedTileRegistry,
  specialistRegistry?: SpecialistRegistry,
  availableSpecialistRegistry?: AvailableSpecialistRegistry
) => void = (
  city: City,
  playerWorldRegistry: PlayerWorldRegistry = playerWorldRegistryInstance,
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance,
  workedTileRegistry: WorkedTileRegistry = workedTileRegistryInstance,
  specialistRegistry: SpecialistRegistry = specialistRegistryInstance,
  availableSpecialistRegistry: AvailableSpecialistRegistry = availableSpecialistRegistryInstance
): void => {
  const cityGrowth = cityGrowthRegistry.getByCity(city),
    placed = () =>
      citizenCount(city, workedTileRegistry, specialistRegistry) >=
      cityGrowth.size() + 1;

  getHighestValueAvailableCityTiles(
    city,
    playerWorldRegistry,
    workedTileRegistry
  ).some((tile) => {
    if (placed()) {
      return true;
    }

    workedTileRegistry.register(new WorkedTile(tile, city));

    return false;
  });

  while (
    !placed() &&
    addSpecialist(city, specialistRegistry, availableSpecialistRegistry)
  ) {}
};

/**
 * Places one new citizen of `city` on the best tile available, or makes them a specialist if there is no tile left.
 */
export const assignWorker: (
  city: City,
  playerWorldRegistry?: PlayerWorldRegistry,
  cityGrowthRegistry?: CityGrowthRegistry,
  workedTileRegistry?: WorkedTileRegistry,
  specialistRegistry?: SpecialistRegistry,
  availableSpecialistRegistry?: AvailableSpecialistRegistry
) => void = (
  city: City,
  playerWorldRegistry: PlayerWorldRegistry = playerWorldRegistryInstance,
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance,
  workedTileRegistry: WorkedTileRegistry = workedTileRegistryInstance,
  specialistRegistry: SpecialistRegistry = specialistRegistryInstance,
  availableSpecialistRegistry: AvailableSpecialistRegistry = availableSpecialistRegistryInstance
): void => {
  const [newTile] = getHighestValueAvailableCityTiles(
    city,
    playerWorldRegistry,
    workedTileRegistry
  );

  if (!newTile) {
    addSpecialist(city, specialistRegistry, availableSpecialistRegistry);

    return;
  }

  workedTileRegistry.register(new WorkedTile(newTile, city));
};

export type WorkedTileChange = 'removed' | 'added' | 'reassigned' | 'none';

/**
 * Changes whether `tile` is worked by `city`, as a player clicking it on the city map would.
 *
 * A tile the city works stops being worked, and its worker becomes a specialist. Any other tile is worked by a
 * specialist, or by a citizen with no job, if the city has one and is allowed to work it. With every citizen already
 * working a tile, the city's workers are reassigned instead. The city centre is always worked.
 */
export const changeWorkedTile: (
  city: City,
  tile: Tile,
  playerWorldRegistry?: PlayerWorldRegistry,
  cityGrowthRegistry?: CityGrowthRegistry,
  workedTileRegistry?: WorkedTileRegistry,
  specialistRegistry?: SpecialistRegistry,
  availableSpecialistRegistry?: AvailableSpecialistRegistry
) => WorkedTileChange = (
  city: City,
  tile: Tile,
  playerWorldRegistry: PlayerWorldRegistry = playerWorldRegistryInstance,
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance,
  workedTileRegistry: WorkedTileRegistry = workedTileRegistryInstance,
  specialistRegistry: SpecialistRegistry = specialistRegistryInstance,
  availableSpecialistRegistry: AvailableSpecialistRegistry = availableSpecialistRegistryInstance
): WorkedTileChange => {
  if (tile === city.tile() || !city.tiles().includes(tile)) {
    return 'none';
  }

  if (workedTileRegistry.getByTile(tile)?.city() === city) {
    workedTileRegistry.unregisterByTile(tile);

    addSpecialist(city, specialistRegistry, availableSpecialistRegistry);

    return 'removed';
  }

  const size = cityGrowthRegistry.getByCity(city).size();

  if (workedTileRegistry.getByCity(city).length >= size + 1) {
    reassignWorkers(
      city,
      playerWorldRegistry,
      cityGrowthRegistry,
      workedTileRegistry,
      specialistRegistry,
      availableSpecialistRegistry
    );

    return 'reassigned';
  }

  if (
    !workedTileRegistry.tileCanBeWorkedBy(tile, city) ||
    !playerWorldRegistry.getByPlayer(city.player()).includes(tile)
  ) {
    return 'none';
  }

  if (citizenCount(city, workedTileRegistry, specialistRegistry) >= size + 1) {
    removeSpecialist(city, specialistRegistry, availableSpecialistRegistry);
  }

  workedTileRegistry.register(new WorkedTile(tile, city));

  return 'added';
};

/**
 * Takes jobs away from `city`'s citizens until it has no more than its size allows: specialists first, then the
 * workers on the least valuable tiles.
 */
export const releaseCitizens = (
  city: City,
  cityGrowth: CityGrowth,
  workedTileRegistry: WorkedTileRegistry = workedTileRegistryInstance,
  specialistRegistry: SpecialistRegistry = specialistRegistryInstance
): void => {
  const specialists = specialistRegistry.getByCity(city);

  while (
    specialists.length > 0 &&
    citizenCount(city, workedTileRegistry, specialistRegistry) >
      cityGrowth.size() + 1
  ) {
    specialistRegistry.unregister(specialists.pop()!);
  }

  reduceWorkers(city, cityGrowth).forEach((tile: Tile): void =>
    workedTileRegistry.unregisterByTile(tile)
  );
};

export const reduceWorkers = (city: City, cityGrowth: CityGrowth): Tile[] =>
  sortTiles(
    city
      .tilesWorked()
      .entries()
      .filter((tile: Tile) => tile !== city.tile()),
    city
  ).slice(cityGrowth.size());

export default assignWorkers;
