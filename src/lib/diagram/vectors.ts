export type Vector2D = {
    x: number;
    y: number;
};

export function rotateVector(vec: Vector2D, angle: number): Vector2D {
    return {
        x: vec.x * Math.cos(angle) - vec.y * Math.sin(angle),
        y: vec.x * Math.sin(angle) + vec.y * Math.cos(angle),
    };
}

export function normalizeVector(vec: Vector2D): Vector2D {
    const length = vectorLength(vec);
    return { x: vec.x / length, y: vec.y / length };
}

export function addVectors(a: Vector2D, b: Vector2D) {
    return { x: a.x + b.x, y: a.y + b.y };
}

export function scale(vec: Vector2D, factor: number): Vector2D {
    return { x: vec.x * factor, y: vec.y * factor };
}

export function difference(a: Vector2D, b: Vector2D): Vector2D {
    return { x: a.x - b.x, y: a.y - b.y };
}

export function vectorLength(vec: Vector2D): number {
    return Math.sqrt(vec.x * vec.x + vec.y * vec.y);
}