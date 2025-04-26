import type { TuringMachineDefinition } from "./types";

/**
 * A regex for the binary representation of a Gödel number, including the input
 */
const GODEL_NUMBER_REGEX = /^1(0+10+10+10+1(0|00)11)*(0+10+10+10+1(0|00))111(0|1)*$/;

/**
 * A regex for the binary representation of a Gödel number, excluding the input.
 * Used to detect if the input is valid, but missing the input
 */
const GODEL_NUMBER_REGEX_WITHOUT_INPUT =
    /^1(0+10+10+10+1(0|00)11)*(0+10+10+10+1(0|00))$/;


type Result<T> = {
    success: true,
    error?: undefined
    result: T
} | {
    success: false,
    error: string
    result?: undefined
}

/**
 * Parses an untrusted user-input to a UTM
 * 
 * @param input 
 * @param base 
 * @returns 
 */
export function parseGödelNumberString(input: string, base: 2 | 10 | 16): Result<TuringMachineDefinition> {
    const bigintParseResult = parseToBigint(input, base);
    if (!bigintParseResult.success) return bigintParseResult;

    const goedelNumberParseResult = bigintIsGödelNumber(bigintParseResult.result);
    if (!goedelNumberParseResult.success) return goedelNumberParseResult;

    const tmResult = parseGödelNumberToTuringMachine(bigintParseResult.result);
    return tmResult
}



/**
 * Parses the gödel number into a turing machine representation.
 * 
 * @param goedel A syntactically valid goedel number with initial tape
 * @returns A result with the turing machine or an error
 */
export function parseGödelNumberToTuringMachine(goedel: bigint): Result<TuringMachineDefinition> {
    const binary = goedel.toString(2).slice(1); // remove leading 1
    const inputDelimiterPosition = binary.indexOf("111");

    if (inputDelimiterPosition === -1) throw new SyntaxError("Expected input to be a valid Gödel number");

    const tmDefinition = binary.slice(0, inputDelimiterPosition); // everything before the delimiter
    const initialTape = binary.slice(inputDelimiterPosition + 3); // everything after the delimiter

    const tm: TuringMachineDefinition = {
        goedel,
        goedel_without_input: BigInt("0b" + tmDefinition),
        states: [],
        starting_state: 1,
        accepting_state: 2,
        alphabet: ['0', '1', '⌴'],
        empty_symbol: 3,
        transitions: [],
        initial_tape: []
    }

    const transitionStrings = tmDefinition.split("11");
    const states = new Set<number>([1, 2]);

    /** The highest symbol that was used */
    let maxSymbol = 3;
    for (const transitionString of transitionStrings) {
        const [fromState, readSymbol, toState, writeSymbol, directionNum] = transitionString.split("1").map(s => s.length);

        // make sure that there isn't already a transition for this fromState and readSymbol
        if (tm.transitions.some(t => t[0] === fromState && t[1] === readSymbol)) {
            return { success: false, error: "Turing Machine is non-deterministic" }
        }

        const direction = directionNum === 1 ? "L" : "R";
        tm.transitions.push([fromState, readSymbol, toState, writeSymbol, direction]);

        states.add(fromState);
        states.add(toState);

        maxSymbol = Math.max(maxSymbol, readSymbol, writeSymbol);
    }

    tm.states = [...states];
    tm.initial_tape = initialTape.split("").map(s => parseInt(s, 2) + 1);

    // generate the alphabet:
    for (let i = 1; i <= maxSymbol; i++) {
        let char;
        switch (i) {
            case 1:
                char = "0";
                break;
            case 2:
                char = "1";
                break;
            case 3:
                char = "⌴";
                break;
            default:
                char = String.fromCharCode(97 + i - 3);
        }

        tm.alphabet[i - 1] = char;
    }

    return { success: true, result: tm }
}


/**
 * Checks if the bigint is a valid goedel number
 * @param bigint The bigint to check
 * @returns A result object describing if the bigint is a valid goedel number
 */
function bigintIsGödelNumber(bigint: bigint): Result<undefined> {
    const binary = bigint.toString(2);
    const valid_goedel_number = binary.match(GODEL_NUMBER_REGEX);
    const valid_goedel_number_without_input = binary.match(GODEL_NUMBER_REGEX_WITHOUT_INPUT);

    if (!valid_goedel_number && !valid_goedel_number_without_input) {
        return { success: false, error: "Input is not a valid Gödel number" }
    }

    if (!valid_goedel_number && valid_goedel_number_without_input) {
        return { success: false, error: "Initial tape is missing. Add it after the delimiter 111" }
    }

    return { success: true, result: undefined }
}

/**
 * Attempts to parse the untrusted user-input to a bigint
 * @param input The user-input
 * @param base The base of the number (binary, decimal and hex)
 * @returns A result object describing if the input was successfully parsed
 */
function parseToBigint(input: string, base: 2 | 10 | 16): Result<bigint> {
    if (input.length == 0) return { success: false, error: "Please enter a number" }

    switch (base) {
        case 2: {
            if (!input.match(/^[01]+$/)) return { success: false, error: "Input should only contain 0s and 1s" }
            return { success: true, result: BigInt("0b" + input) }
        }
        case 10: {
            if (!input.match(/^[0-9]+$/)) return { success: false, error: "Input should only contain digits 0-9" }
            return { success: true, result: BigInt(input) }
        }
        case 16:
            input = input.toLowerCase()
            if (!input.match(/^[0-9a-f]+$/)) return { success: false, error: "Input should only contain digits 0-9 and letters a-f" }
            return { success: true, result: BigInt("0x" + input) }
    }
}