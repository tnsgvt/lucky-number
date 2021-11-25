import { storage, Context, PersistentSet, PersistentMap, ContractPromiseBatch, RNG, u128 } from 'near-sdk-as';

@nearBindgen
export class Prediction {
  luckyNumber: u32;
  betAmount: u128;
  player: string;
  predictionList: PersistentSet<u32>;

  constructor() {
    const rng = new RNG<u32>(0, 9);

    this.luckyNumber = rng.next(); // the number that machine thought
    this.luckyNumber = 5; // for test

    this.betAmount = Context.attachedDeposit; // bet amount of player
    this.player = Context.sender;
    this.predictionList = new PersistentSet<u32>('pl');
  }
}

export const gameMap = new PersistentMap<u32, Prediction>('gm');

export function start(): u32 {
  const rng = new RNG<u32>(1, u32.MAX_VALUE);
  const gameId = rng.next();
  const prediction = new Prediction();
  gameMap.set(gameId, prediction);

  return gameId;
}

export function predict(gameId: u32, num: u32): u32 {
  // retrieve prediction
  const prediction = gameMap.get(gameId, null);

  if (prediction) {
    if (prediction.luckyNumber == num) {
      // WON, transfer prize money
      const beneficiary = ContractPromiseBatch.create(prediction.player);
      beneficiary.transfer(u128.mul(prediction.betAmount, u128.from(2)));

      gameMap.delete(gameId);
      return 9;
    } else {
      const predictionList = prediction.predictionList;

      if (predictionList.has(num) == false) {
        predictionList.add(num);
      }
      //if (predictionList.size >= 3) {
        // LOOSE
        //gameMap.delete(gameId);
        //return 1;
      //}
      if (prediction.luckyNumber < num) {
        // greater than the luckyNumber
        return 3;
      } else {
        // lower than the luckyNumber
        return 4;
      }
    }
  } else {
    return 0; // game not found
  }
}
