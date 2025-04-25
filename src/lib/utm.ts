import type { Transition, TuringMachineConfiguration, TuringMachineDefinition } from "./types";

export function* executeTuringMachine(tm: TuringMachineDefinition): Generator<TuringMachineConfiguration, TuringMachineConfiguration> {
    const configuration = {
        tm,
        tape_right: [...tm.initial_tape],
        tape_left: [],
        current_state: tm.starting_state,
        current_position: 0,
        steps: 0,
        finished: false,
        accepted: false
    };

    while (true) {
        const transition = getTransition(configuration);
        if (!transition) {
            configuration.finished = true;
            configuration.accepted = configuration.current_state == configuration.tm.accepting_state;
            return configuration;
        }

        yield structuredClone(configuration);

        configuration.steps++;
        writeSymbol(configuration, transition[3]);
        configuration.current_state = transition[2]; // update the current state
        configuration.current_position += transition[4] == "L" ? -1 : 1; // update the current position
    }
}

/**
 * Returns the transition the turing machine will take, if one is available
 * @param config The current configuration
 * @returns The transition to take, if available
 */
export function getTransition(config: TuringMachineConfiguration): Transition | undefined {
    const symbol = readSymbol(config);
    const transition = config.tm.transitions.find(transition => {
        return transition[0] === config.current_state && transition[1] === symbol
    });

    return transition;
}

/**
 * Returns the symbol at the current position
 * @param config The current configuration
 * @param relativeOffset The offset from the current position. (default: 0)
 * @returns The symbol at the current position
 */
export function readSymbol(config: TuringMachineConfiguration, relativeOffset: number = 0): number {
    const pos = config.current_position + relativeOffset;

    if (pos >= 0) {
        // use right-tape:
        return config.tape_right[pos] ?? config.tm.empty_symbol;
    } else {
        // use left-tape:
        const idx = -pos - 1;
        return config.tape_left[idx] ?? config.tm.empty_symbol;
    }
}

/**
 * Writes the given symbol at the current position
 * @param config The current configuration
 * @param symbol The symbol to write at the current position
 */
export function writeSymbol(config: TuringMachineConfiguration, symbol: number) {
    const pos = config.current_position;

    if (pos >= 0) {
        // use right-tape:
        config.tape_right[pos] = symbol;
    } else {
        // use left-tape:
        const idx = -pos - 1;
        config.tape_left[idx] = symbol;
    }
}
/**
 * Logs the tape to the console
 * @param configuration The current configuration
 */
export function logTape(configuration: TuringMachineConfiguration) {
    let tape = "";

    for (let i = -15; i < 0; i++) {
        const symbolID = readSymbol(configuration, i);
        const symbol = configuration.tm.alphabet[symbolID -1];
        tape += symbol;
    }

    tape += `[q${configuration.current_state}]`;

    for (let i = 0; i < 16; i++) {
        const symbolID = readSymbol(configuration, i);
        const symbol = configuration.tm.alphabet[symbolID -1];
        tape += symbol;
    }

    tape += ` (steps: ${configuration.steps})`;

    console.log(tape);
}