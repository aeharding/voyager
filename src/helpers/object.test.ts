import { getAllObjectValuesDeep } from "./object";

describe("getAllObjectValuesDeep", () => {
  it("works empty", () => {
    expect(getAllObjectValuesDeep({})).toStrictEqual([]);
  });

  it("returns shallow", () => {
    expect(getAllObjectValuesDeep({ foo: "bar" })).toStrictEqual(["bar"]);
  });

  it("returns deep", () => {
    expect(getAllObjectValuesDeep({ foo: { bar: "baz" } })).toStrictEqual([
      "baz",
    ]);
  });

  it("returns deep", () => {
    expect(getAllObjectValuesDeep({ foo: { bar: "baz" } })).toStrictEqual([
      "baz",
    ]);
  });
  it("returns multiple deep", () => {
    expect(
      getAllObjectValuesDeep({ foo: { bar: "baz" }, hi: "there" }),
    ).toStrictEqual(["baz", "there"]);
  });
});
