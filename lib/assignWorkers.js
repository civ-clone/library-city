"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reduceWorkers = exports.assignWorker = exports.assignWorkers = exports.reassignWorkers = exports.getHighestValueAvailableCityTiles = exports.sortTiles = exports.getHighestValueCityTiles = void 0;
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const Yields_1 = require("../Yields");
const PlayerWorldRegistry_1 = require("@civ-clone/core-player-world/PlayerWorldRegistry");
const WorkedTileRegistry_1 = require("@civ-clone/core-city/WorkedTileRegistry");
const reduceYields_1 = require("@civ-clone/core-yield/lib/reduceYields");
const WorkedTile_1 = require("@civ-clone/core-city/WorkedTile");
const getHighestValueCityTiles = (city) => (0, exports.sortTiles)(city.tiles().entries(), city);
exports.getHighestValueCityTiles = getHighestValueCityTiles;
const sortTiles = (tiles, city, weights = [
    [Yields_1.Food, 8],
    [
        Yields_1.Production,
        3 *
            ((0, reduceYields_1.reduceYield)(city.tilesWorked().yields(city.player()), Yields_1.Production) === 0
                ? 3
                : 1),
    ],
    [
        Yields_1.Trade,
        1 *
            ((0, reduceYields_1.reduceYield)(city.tilesWorked().yields(city.player()), Yields_1.Trade) === 0
                ? 2
                : 1),
    ],
]) => tiles.sort((a, b) => b.score(city.player(), weights) - a.score(city.player(), weights));
exports.sortTiles = sortTiles;
const getHighestValueAvailableCityTiles = (city, playerWorldRegistry = PlayerWorldRegistry_1.instance, workedTileRegistry = WorkedTileRegistry_1.instance) => (0, exports.getHighestValueCityTiles)(city).filter((tile) => workedTileRegistry.tileCanBeWorkedBy(tile, city) &&
    playerWorldRegistry.getByPlayer(city.player()).includes(tile));
exports.getHighestValueAvailableCityTiles = getHighestValueAvailableCityTiles;
const reassignWorkers = (city, playerWorldRegistry = PlayerWorldRegistry_1.instance, cityGrowthRegistry = CityGrowthRegistry_1.instance, workedTileRegistry = WorkedTileRegistry_1.instance) => {
    workedTileRegistry
        .getBy('city', city)
        .forEach((workedTile) => workedTileRegistry.unregister(workedTile));
    workedTileRegistry.register(new WorkedTile_1.default(city.tile(), city));
    (0, exports.assignWorkers)(city, playerWorldRegistry, cityGrowthRegistry, workedTileRegistry);
};
exports.reassignWorkers = reassignWorkers;
const assignWorkers = (city, playerWorldRegistry = PlayerWorldRegistry_1.instance, cityGrowthRegistry = CityGrowthRegistry_1.instance, workedTileRegistry = WorkedTileRegistry_1.instance) => {
    const cityGrowth = cityGrowthRegistry.getByCity(city);
    (0, exports.getHighestValueAvailableCityTiles)(city, playerWorldRegistry, workedTileRegistry).some((tile) => {
        if (city.tilesWorked().length >= cityGrowth.size() + 1) {
            return true;
        }
        workedTileRegistry.register(new WorkedTile_1.default(tile, city));
        return false;
    });
};
exports.assignWorkers = assignWorkers;
const assignWorker = (city, playerWorldRegistry = PlayerWorldRegistry_1.instance, cityGrowthRegistry = CityGrowthRegistry_1.instance, workedTileRegistry = WorkedTileRegistry_1.instance) => {
    const [newTile] = (0, exports.getHighestValueAvailableCityTiles)(city, playerWorldRegistry, workedTileRegistry);
    if (!newTile) {
        return;
    }
    workedTileRegistry.register(new WorkedTile_1.default(newTile, city));
};
exports.assignWorker = assignWorker;
const reduceWorkers = (city, cityGrowth) => (0, exports.sortTiles)(city
    .tilesWorked()
    .entries()
    .filter((tile) => tile !== city.tile()), city).slice(cityGrowth.size());
exports.reduceWorkers = reduceWorkers;
exports.default = exports.assignWorkers;
//# sourceMappingURL=assignWorkers.js.map