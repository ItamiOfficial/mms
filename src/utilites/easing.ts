export const easing: Record<string, (x:number) => number> = {
    EaseInOut : (x) => x < 0.5 
        ? 4 * x * x * x 
        : 1 - Math.pow(-2 * x + 2, 3) / 2,
    InOutCirc : (x) => x < 0.5
        ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
        : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2,
    OutQuint : (x) => 1 - Math.pow(1 - x, 5),
    InQuint : (x) => x * x * x * x * x,
    OutQuad: (x) => 1 - (1 - x) * (1 - x),
    InQuad : (x) => x * x,
    InExpo : (x) => x === 0 ? 0 : Math.pow(2, 10 * x - 10),
}