export type Style = {
    background: string,
    axis: string,
    value: string,
    tertiary: string,
};

export const styles: Record<string, Style> = {
    Default : // https://colorhunt.co/palette/1b211a6281418bae66ebd5ab
    {
        background: 'rgba(38, 38, 38, 1)',
        axis: 'rgba(237, 233, 219, 1)',
        value: 'rgba(231, 200, 27, 1)',
        tertiary: 'rgb(235, 213, 171)',
    },
}