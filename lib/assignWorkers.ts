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
  WorkedTileRegistry,
  instance as workedTileRegistryInstance,
} from '@civ-clone/core-city/WorkedTileRegistry';
import City from '@civ-clone/core-city/City';
import Tile from '@civ-clone/core-world/Tile';
import Yield from '@civ-clone/core-yield/Yield';
import { reduceYield } from '@civ-clone/core-yield/lib/reduceYields';
import WorkedTile from '@civ-clone/core-city/WorkedTile';
import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';

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

export const reassignWorkers = (
  city: City,
  playerWorldRegistry: PlayerWorldRegistry = playerWorldRegistryInstance,
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance,
  workedTileRegistry: WorkedTileRegistry = workedTileRegistryInstance
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
    workedTileRegistry
  );
};

export const assignWorkers: (
  city: City,
  playerWorldRegistry?: PlayerWorldRegistry,
  cityGrowthRegistry?: CityGrowthRegistry,
  workedTileRegistry?: WorkedTileRegistry
) => void = (
  city: City,
  playerWorldRegistry: PlayerWorldRegistry = playerWorldRegistryInstance,
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance,
  workedTileRegistry: WorkedTileRegistry = workedTileRegistryInstance
): void => {
  const cityGrowth = cityGrowthRegistry.getByCity(city);

  getHighestValueAvailableCityTiles(
    city,
    playerWorldRegistry,
    workedTileRegistry
  ).some((tile) => {
    if (city.tilesWorked().length >= cityGrowth.size() + 1) {
      return true;
    }

    workedTileRegistry.register(new WorkedTile(tile, city));

    return false;
  });
};

export const assignWorker: (
  city: City,
  playerWorldRegistry?: PlayerWorldRegistry,
  cityGrowthRegistry?: CityGrowthRegistry,
  workedTileRegistry?: WorkedTileRegistry
) => void = (
  city: City,
  playerWorldRegistry: PlayerWorldRegistry = playerWorldRegistryInstance,
  cityGrowthRegistry: CityGrowthRegistry = cityGrowthRegistryInstance,
  workedTileRegistry: WorkedTileRegistry = workedTileRegistryInstance
): void => {
  const [newTile] = getHighestValueAvailableCityTiles(
    city,
    playerWorldRegistry,
    workedTileRegistry
  );

  workedTileRegistry.register(new WorkedTile(newTile, city));
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
