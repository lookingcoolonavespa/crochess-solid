import { TESTING } from "../src/components/Game/Interface/MoveList";

it("gives [0,0] for 0", () => {
  expect(TESTING.get2dArrIndexFrom1dArrIndex(0)).toEqual([0, 0]);
});
