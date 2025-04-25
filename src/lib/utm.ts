/**
 * Represents a state of a universal turin machine
 */
type State = {
    /**
     * The display name of the state
     */
    display_name: string,
    /**
     * The transitions avaluable from this state
     */
    transitions: Map<number, State>,
    /**
     * Whether or not this is the final state
     */
    final: boolean,
    /**
     * Whether or not this is the starting state
     */
    starting: boolean
}

type TuringMachine = {
    states: State[],
    stack_alphabet: number[],
    tape_alphabet: number[],
}


/**
 * Executes a universal turin machine
 * 
 * @param description_number The description number (aka Gödel number) of the TM
 * @returns The result of the TM
 */
export function parseGödelNumber(description_number: BigInt) : ParserResult {
    /** The binary representation of the description number */
    const gödelString = description_number.toString(2);

    if (!gödelString.includes("111")) return { success: false, error: "No initial tape specified. Enter the initial tape after the delimiter 111" }
    
    const [input, ...tapeParts] = gödelString.split("111");
    const initialTape = tapeParts.join("111");

    const transitionStrings = input.split("11");
    for (const transitionString of transitionStrings) {
        const [fromState, readSymbol, toState, writeSymbol, direction] = transitionString.split("1").map(s => s.length);
    }
}

type ParserResult = {
    success: true,
    initialTape: number[],
    stack: number[],
    state: State
} | {
    success: false
    error: string
}