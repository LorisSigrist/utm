import * as z from "@zod/mini";
import { getInitialConfiguration } from "./utm";
import { parseGödelNumberString } from "./goedel";

const Label = z.tuple([z.string(), z.string(), z.enum(["L", "R", "N"])])

const Transition = z.object({
    Source: z.number().check(z.int(), z.nonnegative()),
    Target: z.number().check(z.int(), z.nonnegative()),
    x: z.number(),
    y: z.number(),
    Labels: z.array(Label)
});

const State = z.object({
    ID: z.number().check(z.int(), z.nonnegative()),
    Name: z.string(),
    x: z.number(),
    y: z.number(),
    Final: z.boolean(),
    Start: z.boolean(),
    Radius: z.number(),
    Transitions: z.array(Transition)
})

const Automaton = z.object({
    Alphabet: z.array(z.string()),
    StackAlphabet: z.array(z.string()).check(z.minLength(1)),
	States: z.array(State),
	acceptCache: z.array(z.number()),
	simulationInput: z.array(z.string().check(z.minLength(1))),
	lastInputs: z.array(z.array(z.string()))
});

const Flaci = z.object({
    name: z.string(),
    description: z.string(),
    type: z.literal("TM"),
    automaton: Automaton
});

type Flaci = z.infer<typeof Flaci>;
type FlaciState = z.infer<typeof State>;
type FlaciTransition = z.infer<typeof Transition>;
type FlaciLabel = z.infer<typeof Label>;

export function isValidFlaciTM(thing: unknown) : thing is Flaci {
    return Flaci.safeParse(thing).success;
}

/**
 * Transforms a FLACI description of a Turing Maschine into a Godel Number
 * @param flaci
 * @returns The Godel Number
 */
export function generateGodelNumber(flaci: Flaci) : bigint {
	// 1. Modify the machine so that there is only one accepting state
	// 2. Relabel the states so that the starting state is ID:1, the accepting state has ID:2, and the outher states count up from there
	// 3. Encode the transitions into the Godel Number
	flaci = modifySoThatThereIsOnlyOneAcceptingState(flaci);
	const IDMap = generateIDMappings(flaci);
    flaci = remapIDs(flaci, IDMap);
    
    const transitions : string[] = [];
    const reorderedStackAlphabet = reorderedAlphabet(flaci.automaton.StackAlphabet);
	for (const state of flaci.automaton.States) {
		for (const transition of state.Transitions) {
			for (const label of transition.Labels) {
				const fromSymbolID = reorderedStackAlphabet.indexOf(label[0]) + 1;
				const toSymbolID = reorderedStackAlphabet.indexOf(label[1]) + 1;
				const direction = {
					L: 1,
					R: 2,
					N: undefined
				}[label[2]];
				if (fromSymbolID === undefined || toSymbolID === undefined || direction === undefined)
					throw new Error('Invalid label');

				const str = [transition.Source, fromSymbolID, transition.Target, toSymbolID, direction]
					.map(zeros)
					.join('1');
				transitions.push(str);
			}
		}
	}

	const godel = '1' + transitions.join('11');
    return BigInt("0b" + godel + "111");
}

/**
 * Returns n zeros
 */
function zeros(n: number): string {
	return '0'.repeat(n);
}

/**
 * Generates an ID mapping so that:
 * - The Starting State is ID: 1,
 * - The Final State is ID 2,
 * - The other states count up from there
 */
function generateIDMappings(flaci: Flaci): Map<number, number> {
	/** @type {Map<number, number>} */
	const map = new Map();

	const startingState = flaci.automaton.States.find((state) => state.Start);
	const acceptingState = flaci.automaton.States.find((state) => state.Final);
	const otherStates = flaci.automaton.States.filter((state) => !state.Start && !state.Final);
	if (!startingState) throw new Error('No starting state found');
	if (!acceptingState) throw new Error('No accepting state found');

	map.set(startingState.ID, 1);
	map.set(acceptingState.ID, 2);

	for (const otherState of otherStates) {
		map.set(otherState.ID, map.size + 1);
	}

	return map;
}

/**
 * Remaps the IDs of the states
 *
 * @param flaci
 * @param  map
 * @returns The remapped FLACI
 */
function remapIDs(flaci: Flaci, map: Map<number, number>) : Flaci {
	const modified = structuredClone(flaci);

	for (const state of modified.automaton.States) {
		state.ID = map.get(state.ID) || -1;
		state.Name = `q${state.ID}`;
		for (const transition of state.Transitions) {
			transition.Source = map.get(transition.Source) || -1;
			transition.Target = map.get(transition.Target) || -1;
		}
	}

	return modified;
}


/**
 * Reorders the stack-alphabet so that 
 * - 0 (if present) is at the first position
 * - 1 (if present) is at the second position
 * - The item that was at the first position (the empty symbol) is at the last position
 */
function reorderedAlphabet(alphabet: string[]) : string[] {
     
    if(alphabet.length < 1) return alphabet;

    const emptySymbol = alphabet[0];
    const newAlphabet = [
        "0", "1", emptySymbol, 
    ]

    // append all symbols that are in the alphabet, but not empty, 0, or 1
    for (const symbol of alphabet) { 
        if(!newAlphabet.includes(symbol)) newAlphabet.push(symbol);
    }

    return newAlphabet;
}

/**
 * Changes the given FLACI description of a Turing Machine so that there is only one accepting state
 * @param {Flaci} flaci
 * @returns {Flaci} The modified FLACI description
 */
function modifySoThatThereIsOnlyOneAcceptingState(flaci: Flaci): Flaci {
    const modified = structuredClone(flaci);
    
    const numAcceptingStates = flaci.automaton.States.filter((state) => state.Final).length;
    if(numAcceptingStates < 2) return flaci;


	// Find the maximum ID of all states
	// so that the new accepting state is guaranteed to have a new ID
	const maxID = Math.max(...modified.automaton.States.map((state) => state.ID));

	/** @type {State} */
	const acceptingState = {
		ID: maxID + 1,
		Name: `q${maxID + 1}`,
		x: 0,
		y: 0,
		Start: false,
		Final: true,
		Radius: 30,
		Transitions: []
	};

	// loop over all states in the machine
	for (const state of modified.automaton.States) {
		if (!state.Final) continue;

		// if this is an accepting state
		// 1. For all symbols that don't have a transition, transition into the accepting state
		// 2. Mark this state as non-accepting

		/**
		 * Stores the symbols that this state has a transition for
		 * @type {Set<string>}
		 */
		const usedSymbols = new Set();

		for (const transition of state.Transitions) {
			for (const label of transition.Labels) {
				usedSymbols.add(label[0]);
			}
		}

		// All the symbols that the state doesn't have a transition for
		const unusedSymbols = modified.automaton.StackAlphabet.filter((s) => !usedSymbols.has(s));

		// Create new Transitions for the unused symbols
		state.Transitions.push({
			Source: state.ID,
			Target: acceptingState.ID,
			x: 0,
			y: 0,
			Labels: unusedSymbols.map((s) => [s, s, 'R'])
		});

		state.Final = false;
	}

	// add the accepting state
	modified.automaton.States.push(acceptingState);

	return modified;
}


export function goedelToFlaci(description: bigint): Flaci { 
	const definition = parseGödelNumberString(description.toString(2), 2);
	if(!definition.success) throw new Error('Invalid Gödel number');
	const utm = definition.result;


	const emptySymbol = utm.alphabet[utm.empty_symbol -1 ];
	const stackAlphabet = [emptySymbol, ...utm.alphabet.filter(s => s !== emptySymbol)];

	const states: FlaciState[] = [];

	for (const state of utm.states) {
		const x = state * 100;
		const y = 100;

		const name = `q${state}`;
		const transitionsFromState = utm.transitions.filter(t => t[0] === state);
		const transitions: FlaciTransition[] = [];


		const transitionsByPair = Object.groupBy(transitionsFromState, t => `q${t[0]}-q${t[2]}`);

		for (const transitionsForPair of Object.values(transitionsByPair)) { 
			if (!transitionsForPair) continue;

			const label: FlaciLabel[] = [];

			for (const transition of transitionsForPair) { 
				const fromSymbol = utm.alphabet[transition[1] - 1];
				const toSymbol = utm.alphabet[transition[3] - 1];
				const direction = {
					L: 'L',
					R: 'R',
				}[transition[4]] as "L" | "R";

				label.push([fromSymbol, toSymbol, direction]);
			}	

			transitions.push({
				Source: state,
				Target: transitionsForPair[0][2],
				x: x,
				y: y,
				Labels: label
			})
		}


		states.push({
			ID: state,
			Name: name,
			x: x,
			y: y,
			Start: state === utm.starting_state,
			Final: state === utm.accepting_state,
			Radius: 30,
			Transitions: transitions
		});
	}

	const flaci: Flaci = {
		type: "TM",
		name: "UTM.sigrist.dev Export",
		description: "Exported from https://utm.sigrist.dev?goedel=" + description.toString(16),
		automaton: {
			Alphabet: ["0", "1"],
			StackAlphabet:  stackAlphabet,
			States: states,
			acceptCache: [],
			lastInputs: [],
			simulationInput: utm.initial_tape.map((s) => utm.alphabet[s - 1]),
		}
	};

	return flaci;
}