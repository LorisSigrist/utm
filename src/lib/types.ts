/**
 * Represents the definition of a turing machine
 */
export type TuringMachineDefinition = {
    /** The goedel number this turing machine was derived from */
    goedel: bigint,

    /** 
     * The states that the turing machine has. (at least 2)
     */
    states: number[],

    /**
     * The starting state. Usually 1
     */
    starting_state: number,

    /**
     * The accepting state. Usually 2
     */
    accepting_state: number,

    /** 
     * The string representation of the alphabet of the turing machine.
     * 
     * Usually starts with [1, 0, _]
     */
    alphabet: string[],


    /**
     * The index of the empty symbol in the alphabet. Usually 2
     */
    empty_symbol: number,

    /**
     * The transitions Table.
     * 
     * Format: [fromState, readSymbol, toState, writeSymbol, direction]
     */
    transitions: Transition[]

    /**
     * The initial tape.
     * 
     * The symbols are represented as indexes into the alphabet
     */
    initial_tape: number[]
}

/**
 * Represents a possible transition the turing machine can take.
 * The format is: [fromState, readSymbol, toState, writeSymbol, direction]
 */
export type Transition = [number, number, number, number, "L" | "R"]

export type TuringMachineConfiguration = {
    /** The turing machine definition being used */
    tm: TuringMachineDefinition,
    /**  The tape from position 0 onwards */
    tape_right: number[],
    /** The tape from position -1 backwards */
    tape_left: number[],

    /** The current state of the turing machine. Must be valid */
    current_state: number,
    /** The current position of the tape */
    current_position: number,

    /** The number of steps the turing machine has taken */
    steps: number,

    /** `true` if no more steps can be taken */
    finished: boolean,

    /** `true` if the turing machine is in the accepting state AND has finished */
    accepted: boolean
};