import p5 from 'p5';

/* --------------------------- */
// === Section: Graph Data === \\
/* --------------------------- */

type ValueType = 'Percentile' | 'Numerical';
type optString = string | undefined;

type BarDiagram = {
    type: 'bar',
    valueRange: { min: number, max: number },
    valueNames: Array<string>,
    valueType: ValueType,
    values: Array<{
        name: string,
        valueParams: Array<{ name: optString, color: string, value: number }>
    }>,
}

type LineGraph = {
    type: 'line'
    valueRangeX: { min: number, max: number },
    valueRangeY: { min: number, max: number },
    valueNamesX: Array<string>,
    valueNamesY: Array<string>,
    valueTypeX: ValueType,
    valueTypeY: ValueType,
    values: Array<{
        name: string,
        v: Array<{ name: optString, x: number, y: number }>
    }>
}

type GraphData = {
    sourceName: string, // e.g. Country
    valueName: string,  // e.g. GDP
    graphType: BarDiagram | LineGraph,
}

const mockData: GraphData = {
    sourceName: 'Module',
    valueName: 'Noten',
    graphType: {
        type: 'bar',
        valueRange: { min: 0.0, max: 100.0, },    // min is valueNames[0] & max is valueNames[len-1]
        valueNames: ['0 %', '12,5 %', '25.0 %', '37,5 %', '50.0 %', '62,5 %', '75.0 %', '87,5%', '100.0%'],
        valueType: 'Percentile',
        values: [
            {
                name: 'Prog1', valueParams: [
                    { name: 'Portfolio', color: '#660708', value: 30.0 },
                    { name: 'Quiz', color: '#a4161a', value: 20.0 },
                    { name: 'Test', color: '#e5383b', value: 50.0 },
                ]
            },
            {
                name: 'Audio Prog', valueParams: [
                    { name: 'Portfolio', color: '#660708', value: 30.0 },
                  
                ]
            },
            {
                name: 'MMS', valueParams: [
                    { name: 'Presentation', color: '#660708', value: 30.0 },
                    { name: 'Reflektion', color: '#a4161a', value: 20.0 },
                    { name: 'Paper', color: '#660708', value: 40.0 },
                    { name: 'Peer Review', color: '#e5383b', value: 10.0 },
                ]
            },
            { name: 'Prog2', valueParams: [{ name: 'Prog2', color: '#660708', value: 50.0 }] },
            { name: 'AlgoDat', valueParams: [{ name: 'AlgoDat', color: '#660708', value: 75.0 }] },
            { name: 'GDV', valueParams: [{ name: 'GDV', color: '#660708', value: 100.0 }] },
        ],
    }
}

/* ------------------------------- */
// === Section: Graph Renderer === \\
/* ------------------------------- */

export class GraphRenderer {
    // === Section: Rendering Backend === \\
    private p: p5;

    // === Section: Data Source === \\
    private data: GraphData = mockData;

    // === Section: Styling === \\
    private colors = {
        background: '#161a1d',
        axis: '#f5f3f4',
        grid: '#999094',
    }

    // Keep it absolute, if you want to make it relative, calulate new before rendering
    public axisStyling = {
        padding: { left: 80, up: 60, down: 60, right: 40 },
        maxValuePadding: 40, // !todo: find better name
        size: 2,
        rounding: 10,
        textSize: 18,
        textOffset: 10,
    }

    public barStyling = {
        size: 16,
    }



    // === Section: Constructors === \\
    public constructor(p: p5) {
        this.p = p;
    }

    // === Section: Rendering === \\
    public render() {
        this.drawBackground();
        this.drawBarDiagram1D();
    }

    private drawBackground() {
        this.p.background(this.colors.background);
    }

    private drawAxis() {
        this.p.rectMode(this.p.CORNERS);
        this.p.noStroke();
        this.p.fill(this.colors.axis);

        this.p.rect(
            this.axisStyling.padding.left,
            this.axisStyling.padding.up,
            this.axisStyling.padding.left + this.axisStyling.size,
            this.p.height - this.axisStyling.padding.down,
            this.axisStyling.rounding
        );

        this.p.rect(
            this.axisStyling.padding.left,
            this.p.height - this.axisStyling.padding.down,
            this.p.width - this.axisStyling.padding.right,
            this.p.height - this.axisStyling.padding.down - this.axisStyling.size,
            this.axisStyling.rounding
        );
    }

    private drawNames() {
        const gt = this.data.graphType;

        // Check if graphType is 1D
        if (gt.type == 'bar') {

            // Text Styling
            this.p.textSize(this.axisStyling.textSize);
            this.p.textAlign(this.p.RIGHT, this.p.CENTER);
            this.p.fill(this.colors.axis);
            this.p.noStroke();

            // Draw Y Axis first
            gt.valueNames.forEach((n, i) => {
                const pY = this.calculateValueSpaceY(i, 0, gt.valueNames.length - 1);
                const pX = this.axisStyling.padding.left - this.axisStyling.textOffset;

                this.p.text(n, pX, pY);
            });

            // Draw X Axis Next
            this.p.textAlign(this.p.CENTER, this.p.TOP);
            gt.values.forEach((v, i) => {
                const pX = this.calculateValueSpaceX(i, -1, gt.values.length);
                const pY = this.p.height - this.axisStyling.padding.down + this.axisStyling.textOffset;

                this.p.text(v.name, pX, pY);
            })
        }
    }

    private drawBarDiagram1D() {
        this.drawNames();
        this.drawGrid()
        this.drawBars();
        this.drawAxis();
    }

    private drawGrid() {
        const gt = this.data.graphType;

        this.p.stroke(this.colors.grid);
        this.p.strokeWeight(this.axisStyling.size / 2);


        if (gt.type == 'bar') {
            for (let i = 1; i < gt.valueNames.length; i++) {
                const pY = this.calculateValueSpaceY(i, 0, gt.valueNames.length - 1);
                const pX0 = this.axisStyling.padding.left;
                const pX1 = this.p.width - this.axisStyling.padding.right;

                this.p.line(pX0, pY, pX1, pY);
            }
        }
    }

    private drawBars() {
        const gt = this.data.graphType;

        if (gt.type == 'bar') {
            this.p.rectMode(this.p.CORNERS);
            this.p.noStroke();

            gt.values.forEach((v, i) => {
                let preMin = gt.valueRange.min;
                v.valueParams.forEach((params) => {
                    const pX = this.calculateValueSpaceX(i, -1, gt.values.length);
                    const pY = this.calculateValueSpaceY(params.value + preMin, gt.valueRange.min, gt.valueRange.max);
                    const deltaY = this.calculateValueSpaceY(preMin, gt.valueRange.min, gt.valueRange.max);

                    this.p.fill(params.color);
                    this.p.rect(pX - this.barStyling.size, deltaY, pX + this.barStyling.size, pY);
                    preMin += params.value;
                })
            });
        }
    }


    // === Section: Draw Info Box === \\
    private checkMouseOver() {

    }

    private calculateBars() {

    }

    // === Section: Transformation Utilities === \\
    private calculateValueSpaceY(value: number, min: number, max: number): number {
        return this.p.map(
            value,
            min, max,
            this.getValueSpaceBottom(),
            this.axisStyling.padding.up + this.axisStyling.maxValuePadding,
        );
    }

    private calculateValueSpaceX(value: number, min: number, max: number): number {
        return this.p.map(
            value,
            min, max,
            this.axisStyling.padding.left,
            this.p.width - this.axisStyling.padding.right,
        );
    }

    private getScreenSpaceValueSpace(): number {
        return this.p.height - this.axisStyling.padding.down - (this.axisStyling.padding.up + this.axisStyling.maxValuePadding);
    }

    private getValueSpaceBottom(): number {
        return this.p.height - this.axisStyling.padding.down;
    }
}