import * as base from '@civ-clone/base-city-lifecycle/lib/assignWorkers';
import * as library from '../lib/assignWorkers';
import { expect } from 'chai';

describe('lib/assignWorkers', (): void => {
  it("is base-city-lifecycle's, function for function", (): void => {
    const names = Object.keys(base).filter(
      (name) => typeof (base as any)[name] === 'function'
    );

    expect(names).to.include.members([
      'addSpecialist',
      'assignWorker',
      'assignWorkers',
      'changeSpecialist',
      'changeWorkedTile',
      'citizenCount',
      'default',
      'getHighestValueAvailableCityTiles',
      'getHighestValueCityTiles',
      'reassignWorkers',
      'reduceWorkers',
      'releaseCitizens',
      'sortTiles',
    ]);

    names.forEach((name: string): void => {
      expect((library as any)[name] === (base as any)[name], name).true;
    });
  });
});
