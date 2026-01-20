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
        v: Array<{ name: optString, value: number }>
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
        valueNames: [' 0%', '25%', '50%', '75%', '100%'],
        valueType: 'Percentile',
        values: [
            { name: 'Prog1', v: [ 
                {name: 'Portfolio', value: 30.0},
                {name: 'Quiz', value: 20.0},
                {name: 'Test', value: 50.0},
            ]},
            { name: 'Prog2', v: [{ name: undefined, value: 87.0 }]},
            { name: 'AlgoDat', v: [{ name: undefined, value: 87.0 }]},
            { name: 'gdv', v: [{ name: undefined, value: 87.0 }]}, 
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
        background: '#FAF7F0',
        axis: '#4A4947'
    }

    public axisStyling = {
        padding: { left: 40, up: 40, down: 40, right: 40 },
        size: 2,
        rounding: 10,
        testSize: 10,
    }

    public valueStyling = {

    }

    // === Section: Constructors === \\
    public constructor(p: p5) {
        this.p = p;
    }

    // === Section: Rendering === \\
    public render() {
        this.drawBackground();
        this.drawAxis();
        this.drawNames();
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
        // Case: Graph1D
        if ('valueRange' in this.data.graphType) {
            // Draw Y Axis first
            for (let i = 0; i < this.data.graphType.valueDivision; i++) {

            }
        }
    }

    
}