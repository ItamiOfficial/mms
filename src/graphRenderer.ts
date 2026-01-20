import p5 from 'p5';

        /* --------------------------- */ 
        // === Section: Graph Data === \\
        /* --------------------------- */ 

type ValueType = 'Percentile' | 'Numerical';
type optString = string | undefined;

type Graph1D = {
    valueRange: { min: number, max: number },
    valueNames: Array<string>,
    valueType: ValueType,
    values: Array<{
        name: string, 
        valueParams: Array<{ name: optString, color: string, value: number }>
    }>,
}

type Graph2D = {
    valueRangeX: { min: number, max: number },
    valueRangeY: { min: number, max: number },
    valueNamesX: Array<string>,
    valueNamesY: Array<string>,
    valueTypeX: ValueType,
    valueTypeY: ValueType,
    values: Array<{
        name: string,
        v: Array<{name: optString, x: number, y: number}>
    }>
}

type GraphData = {
    sourceName: string, // e.g. Country
    valueName: string,  // e.g. GDP
    graphType: Graph1D | Graph2D,
    visualType: 'Bar' | 'Line'
}

const mockData: GraphData = {
    sourceName: 'Module',
    valueName: 'Noten',
    visualType: 'Bar',
    graphType: {
        valueRange: {min: 0.0, max: 100.0,},    // min is valueNames[0] & max is valueNames[len-1]
        valueNames: [' 0 %', '25 %', '50 %', '75 %', '100 %'],
        valueType: 'Percentile',
        values: [
            { name: 'Prog1', valueParams: [ 
                {name: 'Portfolio', color: '#3d5a80',value: 30.0},
                {name: 'Quiz', color: '#98c1d9', value: 20.0},
                {name: 'Test', color: '#e0fbfc', value: 50.0},
            ]},
            { name: 'Prog2', valueParams: [{ name: 'Prog2', color: '#3d5a80', value: 50.0 }]},
            { name: 'AlgoDat', valueParams: [{ name: 'AlgoDat', color: '#3d5a80', value: 75.0 }]},
            { name: 'GDV', valueParams: [{ name: 'GDV', color: '#3d5a80', value: 100.0 }]}, 
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
        background: '#e7d7c1',
        axis: '#293241'
    }

    // Keep it absolute, if you want to make it relative, calulate new before rendering
    public axisStyling = {
        padding: { left: 60, up: 60, down: 60, right: 60 },
        maxValuePadding: 60, // !todo: find better name
        size: 2,
        rounding: 10,
        textSize: 14,
        textOffset: 5,
    }

    public barStyling = {
        size: 20,
    }

    

    // === Section: Constructors === \\
    public constructor(p: p5) {
        this.p = p;
    }

    // === Section: Rendering === \\
    public render() {
        this.drawBackground();
        this.drawBarDiagram1D();
        this.drawAxis();
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
        if ('valueRange' in gt) {

            // Text Styling
            this.p.textSize(this.axisStyling.textSize);
            this.p.textAlign(this.p.RIGHT, this.p.CENTER);

            // Draw Y Axis first
            gt.valueNames.forEach((n, i) => {
                const pY = this.calculateValueSpaceY( i, 0, gt.valueNames.length - 1);
                const pX = this.axisStyling.padding.left - this.axisStyling.textOffset;

                this.p.text(n, pX, pY);
            });

            // Draw X Axis Next
            this.p.textAlign(this.p.CENTER, this.p.TOP);
            gt.values.forEach((v, i) => {
                const pX = this.calculateValueSpaceX( i, -1, gt.values.length);
                const pY = this.p.height - this.axisStyling.padding.down + this.axisStyling.textOffset;

                this.p.text(v.name, pX, pY);
            })
        }
    }

    private drawBarDiagram1D() {
        this.drawNames();
        this.drawBars();
    }

    private drawBars() {
        const gt = this.data.graphType;
    
        if ('valueRange' in gt) 
        { 
            this.p.rectMode(this.p.CORNERS);

            gt.values.forEach((v, i) => {
                let preMin = gt.valueRange.min;
                v.valueParams.forEach( (params) => {
                    const pX = this.calculateValueSpaceX( i, -1, gt.values.length);
                    const pY = this.calculateValueSpaceY( params.value + preMin, gt.valueRange.min, gt.valueRange.max);
                    const deltaY = this.calculateValueSpaceY( preMin, gt.valueRange.min, gt.valueRange.max);

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