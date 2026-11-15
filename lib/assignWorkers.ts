// Placing a city's citizens lives in base-city-lifecycle (lifted from this file, civ-clone/web-renderer Civ2 M2a R3b),
//  which asks what each square gives the city (`City#tileYields`) and which specialists the city may have
//  (`SpecialistAvailable`). Re-exported here so everything that imports it from library-city places citizens the same
//  way, with the same functions.
export * from '@civ-clone/base-city-lifecycle/lib/assignWorkers';
export { default } from '@civ-clone/base-city-lifecycle/lib/assignWorkers';
