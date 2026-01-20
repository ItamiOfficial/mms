import p5 from 'p5'; 

type Style = {
    background: string,
    axis: string,
    grid: string,
    tertiary: string,
};

const styles: Record<string, Style> = {
    Default : // https://colorhunt.co/palette/1b211a6281418bae66ebd5ab
    {
        background: '#3B4953',
        axis: '#5A7863',
        grid: '#90AB8B',
        tertiary: 'rgb(235, 213, 171)',
    },
}

type Vec2D = {
    x: number,
    y: number,
}

type Line = {
    p1: Vec2D,
    p2: Vec2D,
    thickness: number,
}

type Rect = {
    p1: Vec2D,
    p2: Vec2D,
}

export type Percentage = {

}

export type Number = {

}

export type ValueType = Percentage | Number;
export type RenderType = "Line" | "Block";

export type GraphData = {
    valueType: ValueType,
    entries: string[],
    values: number[][], // outer array are the entries, inner array are the actual values per entry
    colors: string[],
    valueCount: number,
}

export class GraphRenderer {
    private p: p5;
    public rt: RenderType;  
    public data: GraphData;

    // Styling
    private backgroundRounding: number = 0;
    public style: Style;
    private drawGrid: boolean = true;

    // Scalings
    private padding: number = 0.1;
    private axisSize: number = 0.009;
    private gridSize: number = 0.004;
    private barSize: number = 0.02;


    public constructor(rt: RenderType, data: GraphData, p: p5) {
        this.p = p;
        this.rt = rt;
        this.data = data;
        this.style = styles.Default;
    }

    // == Section: Rendering == \\

    render() {
        this.drawBackground();
        this.drawAxis();
    }

    private drawBackground() {
        this.p.background(0,0,0,0);
        this.p.noStroke();
        this.p.fill(this.style.background);
        this.p.rect(0, 0, this.p.width, this.p.height, this.backgroundRounding);
    }

    private drawAxis() {
        if (this.drawGrid) {
            const lx = this.data.values.length;
            for ( let x = 0; x < lx; x++) {
                const xp = this.getXValuePosition(x, 0);
                this.drawLineValueSpace(
                    {x: xp, y: 0}, 
                    {x: xp, y: 1}, 
                    this.style.grid,
                    this.getGridSize()
                );
            }

            const ly = this.data.valueCount;
            for (let y = 0; y < ly; y++) {
                const xy = this.getYValuePosition(y);
                this.drawLineValueSpace(
                    {x: 0, y: xy},
                    {x: 1, y: xy},
                    this.style.grid,
                    this.getGridSize()
                )
            }

        }

        this.drawLineValueSpace({x: 0, y: 0}, {x: 1, y: 0}, this.style.axis, this.getAxisSize());
        this.drawLineValueSpace({x: 0, y: 0}, {x: 0, y: 1}, this.style.axis, this.getAxisSize());
    }

    

    // == SubSection: Shape Drawing == \\
    private drawRectValueSpace(p1: Vec2D, p2: Vec2D, color: string, alpha: number = 255, rounding: number = 3) {
        let c: p5.Color = this.p.color(color);
        c.setAlpha(alpha);

        this.p.noStroke();
        this.p.fill(c);
        
        const sp1 = this.valueToScreenSpace(p1.x, p1.y);
        const sp2 = this.valueToScreenSpace(p2.x, p2.y);

        this.p.rectMode(this.p.CORNERS)
        this.p.rect(sp1.x, sp1.y, sp2.x, sp2.y, rounding);
    }

    private drawLineValueSpace(p1: Vec2D, p2: Vec2D, color: string, size: number = 5, alpha: number = 255) {
        let c: p5.Color = this.p.color(color);
        c.setAlpha(alpha);

        this.p.strokeWeight(size);
        this.p.strokeCap(this.p.ROUND);
        this.p.stroke(c);
        
        const sp1 = this.valueToScreenSpace(p1.x, p1.y);
        const sp2 = this.valueToScreenSpace(p2.x, p2.y);

        this.p.line(sp1.x, sp1.y, sp2.x, sp2.y);
    }

    private drawDottedLineValueSpace(p1: Vec2D, p2: Vec2D, color: string, size: number = 5, alpha: number = 255){
        const lineLength = 30;

        

    }


    // == Section: Coordinate Transformation Utilities == \\
    private getXValuePosition(mainIndex: number, subIndex: number): number {
        const n = this.data.values.length;
        return (mainIndex + 1) / (n + 1);
    }

    private getYValuePosition(index: number): number {
        const n = this.data.valueCount;
        return (index + 1) / (n + 1);
    }

    /* Converts a Point from ValueSpaxce (0.0 - 1.0) to ScreenSpace (0..Dimensions)  */
    private valueToScreenSpace(x: number, y: number): Vec2D {
        const pd = this.getPadding();

        return {
            x: this.xToScreenSpace(x),
            y: this.yToScreenSpace(y),
        }
    }

    private xToScreenSpace(x: number): number {
        const pd = this.getPadding();
        return this.p.lerp(pd, this.p.width - pd, x);
    }

    private yToScreenSpace(y: number): number {
        const pd = this.getPadding();
        return this.p.lerp(this.p.height - pd, pd, y);
    }

    private getPadding() {
        return Math.min(this.p.width, this.p.height) * Math.max(this.padding, 0.02);
    }

    private getWidthHeightRatio(): number {
        return this.p.width / this.p.height;
    }

    private getHeightWidthRatio(): number {
        return this.p.height / this.p.width;
    }

    private getGridSize(): number {
        return Math.min(this.p.height, this.p.width) * this.gridSize;
    }

    private getAxisSize(): number {
        return Math.min(this.p.height, this.p.width) * this.axisSize;
    }
}

/* Graph Data look

/         | topic_1 | topic_2 | topic_3 | topic_4 | "AI" | ... [HEADLINES] (number, string, number, number)
entity_1  :   0     | 'john'  | 143.32  | 100.00  | "DM" | ... [ENTRY_0]
entity_2  :   1     | 'pete'  | 243.32  |  42.23  | "DM" | ... [ENTRY_1]
entity_3  :   2     |'gabriel'| 888.00  | 1423.00 | "WIN"| ... [ENTRY_2]
...

csv example:
topic_1,topic_2,topiv_3, topic_4,
o,'john',143.32,100.00,
1,'pete',243.32,42.23,
2,'gabriel',888.00,1423.00,


example 1D Bar Diagram:
yValues: number 
xValues: entity_0, entity_1, entity_2, ...

example 2D Bar Diagram
yValues: number, number 
xValues enity_0, enity_1, entity_2, ...

example 1D Bar Diagram COUNT:
yValues: number 
xValues: topic_2

example 2D Bar Diagram COUNT:
yValues: number, number 
xValues: topic_3, topic_4

example 1D Bar Diagramm SUMBY(CATEGORY)
yValues: number
xValues: CATEGORY

*/ 