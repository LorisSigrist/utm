import { describe, it, expect } from "vitest"
import { parseGödelNumberString } from "./goedel";

describe("parse gödel number", () => {
  it("parses a valid binary gödel number (binary)", () => {
    const input = "10101000101001101001010010011000101000010100110001001010010011000010100001010011000010010000100100110000100010010001001111001";
    const result = parseGödelNumberString(input, 2);
    expect(result.success).toBe(true);
    expect(result.result?.goedel).toBe(28021904807450500806635366610864513657n);
  })

  it("parses a valid decimal gödel number (decimal)", () => {
    const input = "28021904807450500806635366610864513657";
    const result = parseGödelNumberString(input, 10);
    expect(result.success).toBe(true);
    expect(result.result?.goedel).toBe(28021904807450500806635366610864513657n);
  })

  it("parses a valid decimal gödel number (hex)", () => {
    const input = "1514d29314298949850a612126112279";
    const result = parseGödelNumberString(input, 16);
    expect(result.success).toBe(true);
    expect(result.result?.goedel).toBe(28021904807450500806635366610864513657n);
  })

  it("rejects gibberish input (binary)", () => {
    const invalid_input = "abc";
    const result = parseGödelNumberString(invalid_input, 2);
    expect(result.success).toBe(false);
    expect(result.error).toMatchInlineSnapshot(`"Input should only contain 0s and 1s"`)
  })

  it("rejects gibberish input (decimal)", () => {
    const invalid_input = "abc";
    const result = parseGödelNumberString(invalid_input, 10);
    expect(result.success).toBe(false);
    expect(result.error).toMatchInlineSnapshot(`"Input should only contain digits 0-9"`)
  })

  it("rejects gibberish input (hex)", () => {
    const invalid_input = "hsd";
    const result = parseGödelNumberString(invalid_input, 16);
    expect(result.success).toBe(false);
    expect(result.error).toMatchInlineSnapshot(`"Input should only contain digits 0-9 and letters a-f"`);
  })

  it("rejects valid number that isn't a goedel number", () => {
    const input = "001010100010010101010"
    const result = parseGödelNumberString(input, 2);
    expect(result.success).toBe(false);
    expect(result.error).toMatchInlineSnapshot(`"Input is not a valid Gödel number"`)
  });

  it("rejects valid gödel number without initial tape", () => {
    const input = "1010100010100110100101001001100010100001010011000100101001001100001010000101001100001001000010010011000010001001000100";
    const result = parseGödelNumberString(input, 2);
    expect(result.success).toBe(false);
    expect(result.error).toMatchInlineSnapshot(`"Initial tape is missing. Add it after the delimiter 111"`);
  })

  it("rejects valid gödel number with input, if the TM isn't deterministic", () => {
    // Gödel Number for a non-deterministic TM.
    // q1,0 is encoded twice
    const input = "1010100010100110101010010011000101000010100110001001010010011000010100001010011000010010000100100110000100010010001001111001";

    const result = parseGödelNumberString(input, 2);

    expect(result.success).toBe(false);
    expect(result.error).toMatchInlineSnapshot(`"Turing Machine is non-deterministic"`);
  });

  it("accepts valid, deterministic, goedel number with empty (but present) input", () => {
    const input = "10100001000100001001101001000010000010011010000001010010110001001000010000010011000010001001000101100001001000001001011000001000010000010000010110000010000010000010000010110000010000001000000100000010011000001000100000010001001100000010010000000100000010110000001000001000000010000101100000010000001000000100000010011000000100001000000100001001100000010001010001011000000010000001000000010000001011000000010000100000001000010110000000100010000001000000100110010000001001001011001000010010010110010000010010010111";
    const result = parseGödelNumberString(input, 2);

    expect(result.success).toBe(true);
    expect(result.result?.initial_tape).toEqual([]);
    expect(result.result?.transitions.length).toBe(21); // all transitions are present
  });

  it("accepts valid, deterministic, goedel number with non-empty input", () => {
    const input = "10100001000100001001101001000010000010011010000001010010110001001000010000010011000010001001000101100001001000001001011000001000010000010000010110000010000010000010000010110000010000001000000100000010011000001000100000010001001100000010010000000100000010110000001000001000000010000101100000010000001000000100000010011000000100001000000100001001100000010001010001011000000010000001000000010000001011000000010000100000001000010110000000100010000001000000100110010000001001001011001000010010010110010000010010010111000111";
    const result = parseGödelNumberString(input, 2);

    expect(result.success).toBe(true);
    expect(result.result?.initial_tape).toEqual([1, 1, 1, 2, 2, 2]);
    expect(result.result?.transitions.length).toBe(21); // all transitions are present
    expect(result.result?.empty_symbol).toBe(3); // the emtpy symbol
    expect(result.result?.transitions).toMatchInlineSnapshot(`
      [
        [
          1,
          4,
          3,
          4,
          "R",
        ],
        [
          1,
          2,
          4,
          5,
          "R",
        ],
        [
          1,
          6,
          1,
          2,
          "L",
        ],
        [
          3,
          2,
          4,
          5,
          "R",
        ],
        [
          4,
          3,
          2,
          3,
          "L",
        ],
        [
          4,
          2,
          5,
          2,
          "L",
        ],
        [
          5,
          4,
          5,
          5,
          "L",
        ],
        [
          5,
          5,
          5,
          5,
          "L",
        ],
        [
          5,
          6,
          6,
          6,
          "R",
        ],
        [
          5,
          3,
          6,
          3,
          "R",
        ],
        [
          6,
          2,
          7,
          6,
          "L",
        ],
        [
          6,
          5,
          7,
          4,
          "L",
        ],
        [
          6,
          6,
          6,
          6,
          "R",
        ],
        [
          6,
          4,
          6,
          4,
          "R",
        ],
        [
          6,
          3,
          1,
          3,
          "L",
        ],
        [
          7,
          6,
          7,
          6,
          "L",
        ],
        [
          7,
          4,
          7,
          4,
          "L",
        ],
        [
          7,
          3,
          6,
          6,
          "R",
        ],
        [
          2,
          6,
          2,
          2,
          "L",
        ],
        [
          2,
          4,
          2,
          2,
          "L",
        ],
        [
          2,
          5,
          2,
          2,
          "L",
        ],
      ]
    `);
  });
})