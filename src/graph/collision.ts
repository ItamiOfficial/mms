export type Box = {
    x0: number,
    y0: number,
    x1: number,
    y1: number,
}

export type Point = {
    x: number,
    y: number,
}
export function boxToPointCollision(box: Box, point: Point): boolean {
    let x0 = box.x0;
    let y0 = box.y0;
    let x1 = box.x1;
    let y1 = box.y1;

    if (box.x0 > box.x1) { x0 = box.x1; x1 = box.x0; }
    if (box.y0 > box.y1) { y0 = box.y1; y1 = box.y0; }

    return point.x >= x0 && point.x <= x1 && point.y >= y0 && point.y <= y1;
}