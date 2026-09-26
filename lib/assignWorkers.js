"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reduceWorkers = exports.releaseCitizens = exports.changeWorkedTile = exports.assignWorker = exports.assignWorkers = exports.reassignWorkers = exports.getHighestValueAvailableCityTiles = exports.sortTiles = exports.getHighestValueCityTiles = exports.changeSpecialist = exports.addSpecialist = exports.citizenCount = void 0;
const AvailableSpecialistRegistry_1 = require("@civ-clone/core-city/AvailableSpecialistRegistry");
const CityGrowthRegistry_1 = require("@civ-clone/core-city-growth/CityGrowthRegistry");
const Yields_1 = require("../Yields");
const PlayerWorldRegistry_1 = require("@civ-clone/core-player-world/PlayerWorldRegistry");
const SpecialistRegistry_1 = require("@civ-clone/core-city/SpecialistRegistry");
const WorkedTileRegistry_1 = require("@civ-clone/core-city/WorkedTileRegistry");
const reduceYields_1 = require("@civ-clone/core-yield/lib/reduceYields");
const WorkedTile_1 = require("@civ-clone/core-city/WorkedTile");
/**
 * How many citizens `city` has placed: one per worked tile, the city centre included, and one per `Specialist`. A city
 * of size `n` has `n + 1`.
 */
const citizenCount = (city, workedTileRegistry = WorkedTileRegistry_1.instance, specialistRegistry = SpecialistRegistry_1.instance) => workedTileRegistry.getByCity(city).length +
    specialistRegistry.getByCity(city).length;
exports.citizenCount = citizenCount;
/**
 * Makes a citizen of `city` a `Specialist` of the first available kind (an Entertainer, in Civ1). Returns `null` when
 * the ruleset offers no specialists.
 */
const addSpecialist = (city, specialistRegistry = SpecialistRegistry_1.instance, availableSpecialistRegistry = AvailableSpecialistRegistry_1.instance) => {
    const [SpecialistType] = availableSpecialistRegistry.entries();
    if (!SpecialistType) {
        return null;
    }
    const specialist = new SpecialistType(city);
    specialistRegistry.register(specialist);
    return specialist;
};
exports.addSpecialist = addSpecialist;
/**
 * Turns `specialist` into the next available kind, wrapping back to the first. Returns the `Specialist` that replaces
 * it, or `specialist` itself when there is nothing to change it to.
 */
const changeSpecialist = (specialist, specialistRegistry = SpecialistRegistry_1.instance, availableSpecialistRegistry = AvailableSpecialistRegistry_1.instance) => {
    const city = specialist.city(), types = availableSpecialistRegistry.entries(), NextType = types[(types.indexOf(specialist.constructor) + 1) %
        types.length];
    if (!NextType || specialist instanceof NextType) {
        return specialist;
    }
    const replacement = new NextType(city);
    specialistRegistry.unregister(specialist);
    specialistRegistry.register(replacement);
    return replacement;
};
exports.changeSpecialist = changeSpecialist;
/**
 * Puts one of `city`'s specialists back to work, preferring the first available kind (Entertainers), and returns
 * whether there was one to remove.
 */
const removeSpecialist = (city, specialistRegistry, availableSpecialistRegistry) => {
    var _a;
    const specialists = specialistRegistry.getByCity(city), [DefaultType] = availableSpecialistRegistry.entries(), specialist = (_a = specialists.find((specialist) => DefaultType && specialist instanceof DefaultType)) !== null && _a !== void 0 ? _a : specialists[specialists.length - 1];
    if (!specialist) {
        return false;
    }
    specialistRegistry.unregister(specialist);
    return true;
};
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
/**
 * Rearranges the tiles `city` works from scratch. Its specialists stay as they are.
 */
const reassignWorkers = (city, playerWorldRegistry = PlayerWorldRegistry_1.instance, cityGrowthRegistry = CityGrowthRegistry_1.instance, workedTileRegistry = WorkedTileRegistry_1.instance, specialistRegistry = SpecialistRegistry_1.instance, availableSpecialistRegistry = AvailableSpecialistRegistry_1.instance) => {
    workedTileRegistry
        .getBy('city', city)
        .forEach((workedTile) => workedTileRegistry.unregister(workedTile));
    workedTileRegistry.register(new WorkedTile_1.default(city.tile(), city));
    (0, exports.assignWorkers)(city, playerWorldRegistry, cityGrowthRegistry, workedTileRegistry, specialistRegistry, availableSpecialistRegistry);
};
exports.reassignWorkers = reassignWorkers;
/**
 * Places each of `city`'s citizens that has no job on the best tile available, or makes them a specialist if there is
 * no tile left to work.
 */
const assignWorkers = (city, playerWorldRegistry = PlayerWorldRegistry_1.instance, cityGrowthRegistry = CityGrowthRegistry_1.instance, workedTileRegistry = WorkedTileRegistry_1.instance, specialistRegistry = SpecialistRegistry_1.instance, availableSpecialistRegistry = AvailableSpecialistRegistry_1.instance) => {
    const cityGrowth = cityGrowthRegistry.getByCity(city), placed = () => (0, exports.citizenCount)(city, workedTileRegistry, specialistRegistry) >=
        cityGrowth.size() + 1;
    (0, exports.getHighestValueAvailableCityTiles)(city, playerWorldRegistry, workedTileRegistry).some((tile) => {
        if (placed()) {
            return true;
        }
        workedTileRegistry.register(new WorkedTile_1.default(tile, city));
        return false;
    });
    while (!placed() &&
        (0, exports.addSpecialist)(city, specialistRegistry, availableSpecialistRegistry)) { }
};
exports.assignWorkers = assignWorkers;
/**
 * Places one new citizen of `city` on the best tile available, or makes them a specialist if there is no tile left.
 */
const assignWorker = (city, playerWorldRegistry = PlayerWorldRegistry_1.instance, cityGrowthRegistry = CityGrowthRegistry_1.instance, workedTileRegistry = WorkedTileRegistry_1.instance, specialistRegistry = SpecialistRegistry_1.instance, availableSpecialistRegistry = AvailableSpecialistRegistry_1.instance) => {
    const [newTile] = (0, exports.getHighestValueAvailableCityTiles)(city, playerWorldRegistry, workedTileRegistry);
    if (!newTile) {
        (0, exports.addSpecialist)(city, specialistRegistry, availableSpecialistRegistry);
        return;
    }
    workedTileRegistry.register(new WorkedTile_1.default(newTile, city));
};
exports.assignWorker = assignWorker;
/**
 * Changes whether `tile` is worked by `city`, as a player clicking it on the city map would.
 *
 * A tile the city works stops being worked, and its worker becomes a specialist. Any other tile is worked by a
 * specialist, or by a citizen with no job, if the city has one and is allowed to work it. With every citizen already
 * working a tile, the city's workers are reassigned instead. The city centre is always worked.
 */
const changeWorkedTile = (city, tile, playerWorldRegistry = PlayerWorldRegistry_1.instance, cityGrowthRegistry = CityGrowthRegistry_1.instance, workedTileRegistry = WorkedTileRegistry_1.instance, specialistRegistry = SpecialistRegistry_1.instance, availableSpecialistRegistry = AvailableSpecialistRegistry_1.instance) => {
    var _a;
    if (tile === city.tile() || !city.tiles().includes(tile)) {
        return 'none';
    }
    if (((_a = workedTileRegistry.getByTile(tile)) === null || _a === void 0 ? void 0 : _a.city()) === city) {
        workedTileRegistry.unregisterByTile(tile);
        (0, exports.addSpecialist)(city, specialistRegistry, availableSpecialistRegistry);
        return 'removed';
    }
    const size = cityGrowthRegistry.getByCity(city).size();
    if (workedTileRegistry.getByCity(city).length >= size + 1) {
        (0, exports.reassignWorkers)(city, playerWorldRegistry, cityGrowthRegistry, workedTileRegistry, specialistRegistry, availableSpecialistRegistry);
        return 'reassigned';
    }
    if (!workedTileRegistry.tileCanBeWorkedBy(tile, city) ||
        !playerWorldRegistry.getByPlayer(city.player()).includes(tile)) {
        return 'none';
    }
    if ((0, exports.citizenCount)(city, workedTileRegistry, specialistRegistry) >= size + 1) {
        removeSpecialist(city, specialistRegistry, availableSpecialistRegistry);
    }
    workedTileRegistry.register(new WorkedTile_1.default(tile, city));
    return 'added';
};
exports.changeWorkedTile = changeWorkedTile;
/**
 * Takes jobs away from `city`'s citizens until it has no more than its size allows: specialists first, then the
 * workers on the least valuable tiles.
 */
const releaseCitizens = (city, cityGrowth, workedTileRegistry = WorkedTileRegistry_1.instance, specialistRegistry = SpecialistRegistry_1.instance) => {
    const specialists = specialistRegistry.getByCity(city);
    while (specialists.length > 0 &&
        (0, exports.citizenCount)(city, workedTileRegistry, specialistRegistry) >
            cityGrowth.size() + 1) {
        specialistRegistry.unregister(specialists.pop());
    }
    (0, exports.reduceWorkers)(city, cityGrowth).forEach((tile) => workedTileRegistry.unregisterByTile(tile));
};
exports.releaseCitizens = releaseCitizens;
const reduceWorkers = (city, cityGrowth) => (0, exports.sortTiles)(city
    .tilesWorked()
    .entries()
    .filter((tile) => tile !== city.tile()), city).slice(cityGrowth.size());
exports.reduceWorkers = reduceWorkers;
exports.default = exports.assignWorkers;
//# sourceMappingURL=assignWorkers.js.map