import type { TuringMachineDefinition } from "../types";
import { rotateVector } from "./vectors";

const LINK_DESIRED_LENGTH = 30;
const SELF_LINK_DESIRED_LENGTH = 50;
const NODE_FORCE_RADIUS = -600;
const LABEL_FORCE_RADIUS = -600;


/**
   * Represents a _Node_ in the simulation
   */
class SimulationNode<Data> implements d3.SimulationNodeDatum {
    x: number = $state(0);
    y: number = $state(0);
    vx: number = $state(0);
    vy: number = $state(0);

    fx: number | undefined = $state(undefined);
    fy: number | undefined = $state(undefined);

    data: Data;

    constructor(data: Data) {
        this.data = data;
    }
}

/**
 * Represents a Link Between nodes in the simulation.
 */
class SimulationLink<Node extends SimulationNode<any>, Data>
    implements d3.SimulationLinkDatum<Node> {
    readonly source: Node;
    readonly target: Node;

    data: Data;

    constructor(source: Node, target: Node, data: Data) {
        this.source = source;
        this.target = target;
        this.data = data;
    }
}

/**
 * A Simulation Node that represents a State in the Turing Machine
 */
export class StateNode extends SimulationNode<{
    type: "state";
    id: string;
    label: string;
    force_radius: number;
    is_accepting: boolean;
    is_starting: boolean;
}> {

    constructor(data: { id: number, is_accepting: boolean, is_starting: boolean }) {
        super({
            type: "state",
            label: `q${data.id}`,
            force_radius: NODE_FORCE_RADIUS,
            ...data,
            id: `q${data.id}`
        });
    }
}

export class TransitionNode extends SimulationNode<{
    type: "transition";
    id: string;
    from: StateNode;
    to: StateNode;
    labels: string[];
    force_radius: number;
}> {
    constructor(data: {
        from: StateNode, to: StateNode, labels: string[]
    }) {
        super({
            type: "transition",
            force_radius: LABEL_FORCE_RADIUS,
            ...data,
            id: `${data.from.data.id}-${data.to.data.id}`
        });

        this.x = (data.from.x + data.to.x) / 2;
        this.y = (data.from.y + data.to.y) / 2;
    }
}

export class SelfTransitionNode extends SimulationNode<{
    type: "self-transition";
    id: string;
    node: StateNode;
    labels: string[];
    force_radius: number;
}> {
    constructor(data: { node: StateNode, labels: string[] }) {
        super({
            type: "self-transition",
            force_radius: LABEL_FORCE_RADIUS,
            ...data,
            id: `${data.node.data.id}-${data.node.data.id}`
        })

        this.x = data.node.x;
        this.y = data.node.y + 100;
    }
}


/**
 * Represents a Node in the Turing Machine Simulation.
 */
export type Node = StateNode | TransitionNode | SelfTransitionNode;

export type Link = SimulationLink<Node, { desired_length: number }>


export function getSimulationConfigForTuringMachine(tm: TuringMachineDefinition): {
    nodes: Node[],
    links: Link[]
} {
    const state_nodes = tm.states.map(id => new StateNode({
        id,
        is_accepting: tm.accepting_state == id,
        is_starting: tm.starting_state == id
    }));

    for (const state of state_nodes) {
        const vec = { x: 0, y: 100 };
        const rotated = rotateVector(vec, 2 * Math.PI / state_nodes.length);
        state.x = state.x + rotated.x;
        state.y = state.y + rotated.y;
    }

    const transition_objects = tm.transitions.map((t) => ({
        from: "q" + t[0],
        to: "q" + t[2],
        readSymbol: tm.alphabet[t[1] - 1],
        writeSymbol: tm.alphabet[t[3] - 1],
        direction: t[4]
    }));

    const grouped_transitions = Object.groupBy(transition_objects, t => `${t.from}-${t.to}`);


    const transition_nodes: TransitionNode[] = [];
    const self_transition_nodes: SelfTransitionNode[] = [];

    for (const [group, transitions] of Object.entries(grouped_transitions)) {
        if (!transitions) continue;
        const firstTransitionInGroup = transitions[0];
        if (!firstTransitionInGroup) continue;

        const labels = transitions.map(t => `${t.readSymbol}/${t.writeSymbol},${t.direction}`);

        if (firstTransitionInGroup.from == firstTransitionInGroup.to) {
            // self-transition
            const node = state_nodes.find(n => n.data.id ==  firstTransitionInGroup.from);
            if (!node) continue;

            self_transition_nodes.push(new SelfTransitionNode({
                node, labels
            }));
        } else {
            // transition between states
            const from = state_nodes.find(n => n.data.id ==  firstTransitionInGroup.from);
            const to = state_nodes.find(n => n.data.id == firstTransitionInGroup.to);

            if (!from || !to) continue;

            transition_nodes.push(new TransitionNode({
                from, to, labels
            }));
        }
    }

    const transition_links: Link[] = transition_nodes.flatMap((n) => [
        new SimulationLink<Node, { desired_length: number }>(n.data.from, n, {
            desired_length: LINK_DESIRED_LENGTH / 2,
        }),

        new SimulationLink<Node, { desired_length: number }>(n, n.data.to, {
            desired_length: LINK_DESIRED_LENGTH / 2,
        }),
    ]);

    const self_transition_links: Link[] = self_transition_nodes.map(
        (n) =>
            new SimulationLink<Node, { desired_length: number }>(n, n.data.node, {
                desired_length: SELF_LINK_DESIRED_LENGTH,
            })
    );


    return {
        nodes: [...transition_nodes, ...self_transition_nodes, ...state_nodes],
        links: [...transition_links, ...self_transition_links]
    }
}