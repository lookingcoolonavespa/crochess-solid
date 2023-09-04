import { TESTING } from "../src/components/Game/Interface/MoveList";

it("gives [0,0] for 0", () => {
  expect(TESTING.get2dArrIndexFrom1dArrIndex(0)).toEqual([0, 0]);
});

it("gives [1, 0] for 2", () => {
  expect(TESTING.get2dArrIndexFrom1dArrIndex(2)).toEqual([1, 0]);
});

it("gives [2, 1] for 5", () => {
  expect(TESTING.get2dArrIndexFrom1dArrIndex(5)).toEqual([2, 1]);
});
