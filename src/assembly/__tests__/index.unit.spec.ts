import * as contract from '../index';
import { context, storage, VM } from 'near-sdk-as';

describe('Lucky Number', () => {
  it('lower than lucky-number', () => {
    let gameId = contract.start();
    let result = contract.predict(gameId, 1);
    expect(result).toBe(4, 'Should be lower than Lucky Number (5)');
  });

  it('greater than lucky-number', () => {
    let gameId = contract.start();
    let result = contract.predict(gameId, 7);
    expect(result).toBe(3, 'Should be greater than Lucky Number (5)');
  });

  it('loose after 3 fail predictions', () => {
    let gameId = contract.start();
    let result = contract.predict(gameId, 1);
    result = contract.predict(gameId, 2);
    result = contract.predict(gameId, 3);
    expect(result).toBe(1, 'should be LOOSE');
  });

  it('won', () => {
    let gameId = contract.start();
    let result = contract.predict(gameId, 5);
    expect(result).toBe(9, 'should be WON');
  });
});
