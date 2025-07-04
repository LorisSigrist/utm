import { describe, it, expect, assert } from "vitest";
import { parseGödelNumberString } from "./goedel";
import { stringifyTape, readSymbolAtOffset, getInitialConfiguration, getNextConfiguration } from "./utm";

describe("execute turing machine", () => {
    it("executes a simple, accepting turing machine", () => {
        const result = parseGödelNumberString("10101000101001101001010010011000101000010100110001001010010011000010100001010011000010010000100100110000100010010001001111001", 2);
        expect(result.success).toBe(true);


        const tm = result.result!;
        let config = getInitialConfiguration(tm);

        const TIMEOUT = 1000;
        for (let i = 0; i < TIMEOUT; i++) {
            console.log(stringifyTape(config));
            if (config.finished) {
                assert.isTrue(config.accepted);
                assert.isTrue(config.finished);

                expect(readSymbolAtOffset(config, 0)).toBe(tm.empty_symbol);
                expect(readSymbolAtOffset(config, -1)).toBe(tm.empty_symbol);
                expect(readSymbolAtOffset(config, -2)).toBe(2); // "1"
                expect(readSymbolAtOffset(config, -3)).toBe(1); // "0"
                expect(readSymbolAtOffset(config, -4)).toBe(1); // "0"
                expect(readSymbolAtOffset(config, -5)).toBe(2); // "1"

                expect(config.current_state).toBe(2);

                return;
            }

            assert.isFalse(config.finished);
            assert.isFalse(config.accepted); // accepted should only be set if the machine has also finished

            config = getNextConfiguration(config);
        }

        assert.fail("Turing machine Timed Out after " + TIMEOUT + " steps");
    });

    it("executes the square-number turing machine", () => {
        // square number TM with intput "1111";
        // should produce an output with 16 1s
        const definition = "101000010001000010011010010000100000100110100000010100101100010010000100000100110000100010010001011000010010000010010110000010000100000100000101100000100000100000100000101100000100000010000001000000100110000010001000000100010011000000100100000001000000101100000010000010000000100001011000000100000010000001000000100110000001000010000001000010011000000100010100010110000000100000010000000100000010110000000100001000000010000101100000001000100000010000001001100100000010010010110010000100100101100100000100100101111111";
        const result = parseGödelNumberString(definition, 2);
        expect(result.success).toBe(true);


        const tm = result.result!;
        let config = getInitialConfiguration(tm);

        const TIMEOUT = 1000;
        for (let i = 0; i < TIMEOUT; i++) {
            console.log(stringifyTape(config));
            if (config.finished) {
                assert.isTrue(config.accepted);
                assert.isTrue(config.finished);

                // we expect to stop on an empty symbol, followed by 16 1s
                assert.isTrue(readSymbolAtOffset(config, 0) === tm.empty_symbol);
                for (let i = 1; i <= 16; i++) {
                    assert.isTrue(readSymbolAtOffset(config, i) === 2);
                }
                assert.isTrue(readSymbolAtOffset(config, 17) === tm.empty_symbol);
                
                // it should take exactly 249 steps to calculate the square of 4.
                assert.equal(config.steps, 249);
                return;
            }

            assert.isFalse(config.finished);
            assert.isFalse(config.accepted); // accepted should only be set if the machine has also finished

            config = getNextConfiguration(config);
        }


        assert.fail(`TM timed out after ${TIMEOUT} steps`);
    });

});
