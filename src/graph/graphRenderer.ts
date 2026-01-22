import p5 from 'p5';
import { boxToPointCollision, type Box } from './collision';

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

export const mockData: GraphData = {
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
                    { name: 'Portfolio', color: '#344e41', value: 30.0 },
                    { name: 'Quiz', color: '#3a5a40', value: 20.0 },
                    { name: 'Test', color: '#588157', value: 50.0 },
                ]
            },
            {
                name: 'Audio Prog', valueParams: [
                    { name: 'Portfolio', color: '#344e41', value: 30.0 },
                  
                ]
            },
            {
                name: 'MMS', valueParams: [
                    { name: 'Presentation', color: '#344e41', value: 30.0 },
                    { name: 'Reflektion', color: '#3a5a40', value: 20.0 },
                    { name: 'Paper', color: '#588157', value: 40.0 },
                    { name: 'Peer Review', color: '#a3b18a', value: 10.0 },
                ]
            },
            { name: 'Prog2', valueParams: [{ name: 'Prog2', color: '#344e41', value: 50.0 }] },
            { name: 'AlgoDat', valueParams: [{ name: 'AlgoDat', color: '#344e41', value: 75.0 }] },
            { name: 'GDV', valueParams: [{ name: 'GDV', color: '#344e41', value: 100.0 }] },
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
    private data: GraphData;

    // === Section: Styling === \\
    private colors = {
        background: '#dad7cd',
        axis: '#003049',
        grid: '#999094',
        infoBox: '#003049',
    }

    // Keep it absolute, if you want to make it relative, calulate new before rendering
    public axisStyling = {
        padding: { left: 80, up: 30, down: 40, right: 40 },
        maxValuePadding: 20, // !todo: find better name
        size: 2,
        axisRounding: 0,
        textSize: 18,
        textOffset: 10,
        useDottedGrid: true,
    }

    public barStyling = {
        size: 16,
    }

    public infoBoxStyling = {
        width: 200,
        height: 60,
    }

    // === Section: Constructors === \\
    public constructor(
        p: p5, 
        data: GraphData, 
        colors: undefined | { background: string, axis: string, grid: string, infoBox: string} = undefined,
    ) 
    {
        this.p = p;
        this.data = data;

        if (colors != undefined) {
            this.colors = colors;
        }
    }

    // === Section: Rendering === \\
    public render() {
        this.p.cursor(this.p.ARROW);
        this.drawBackground();
        this.drawBarDiagram();
    }

    private drawBackground() {
        this.p.background(this.colors.background);
    }

    private drawBarDiagram() {
        this.drawNames();
        this.drawGrid()
        this.drawBars();
        this.drawAxis();
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
            this.axisStyling.axisRounding
        );

        this.p.rect(
            this.axisStyling.padding.left,
            this.p.height - this.axisStyling.padding.down,
            this.p.width - this.axisStyling.padding.right,
            this.p.height - this.axisStyling.padding.down - this.axisStyling.size,
            this.axisStyling.axisRounding
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

    private drawGrid() {
        const gt = this.data.graphType;

        if (gt.type == 'bar') {
            this.p.stroke(this.colors.grid);
            this.p.strokeWeight(this.axisStyling.size / 2);

            if (this.axisStyling.useDottedGrid) {
                const lineLength = 30;
                const gapLength = 8;

                for (let i = 1; i < gt.valueNames.length; i++) {
                    const pY = this.calculateValueSpaceY(i, 0, gt.valueNames.length - 1);
                    for (let x = this.axisStyling.padding.left + this.axisStyling.size / 2; x  + lineLength < this.p.width - this.axisStyling.padding.right; x += lineLength) {
                        const mX = Math.min(x + lineLength - gapLength, this.p.width - this.axisStyling.padding.right);
                        this.p.line(x, pY, mX, pY);
                    }
                }
            } else {
                for (let i = 1; i < gt.valueNames.length; i++) {
                    const pY = this.calculateValueSpaceY(i, 0, gt.valueNames.length - 1);
                    this.p.line(
                        this.axisStyling.padding.left + this.axisStyling.size / 2,
                        pY,
                        this.p.width - this.axisStyling.padding.right,
                        pY,
                    );
                }
            }
        }
    }

    private drawBars() {
        const gt = this.data.graphType;

        let infoBoxParams: any = undefined;
        let infoBoxBox: Box = {x0: 0, y0: 0, x1: 0, y1: 0};

        if (gt.type == 'bar') {
            this.p.noStroke();

            gt.values.forEach((v, i) => {
                let preMin = gt.valueRange.min;
                v.valueParams.forEach((params) => {
                    const pX = this.calculateValueSpaceX(i, -1, gt.values.length);
                    const pY = this.calculateValueSpaceY(params.value + preMin, gt.valueRange.min, gt.valueRange.max);
                    const deltaY = this.calculateValueSpaceY(preMin, gt.valueRange.min, gt.valueRange.max);

                    const box: Box = {
                        x0: pX - this.barStyling.size,
                        y0: deltaY,
                        x1: pX + this.barStyling.size,
                        y1: pY,
                    }

                    this.p.rectMode(this.p.CORNERS);
                    this.p.fill(params.color);
                    this.p.rect(box.x0, box.y0, box.x1, box.y1);
                    preMin += params.value;

                    if (boxToPointCollision(box, {x: this.p.mouseX, y: this.p.mouseY})) {
                        infoBoxBox = box;
                        infoBoxParams = params;
                    } 
                })
            });

            if (infoBoxParams != undefined)
                this.drawSegmentData(infoBoxParams, infoBoxBox);
        }
    }

    // === Section: Draw Info Box === \\
    private drawSegmentData(params: any, sectionCoordinates: Box) {
        if (params.name != undefined) {

            const x = sectionCoordinates.x1 - this.barStyling.size;
            const y = this.p.mouseY;

            this.p.noCursor();
            this.p.fill(this.colors.background);
            this.p.rectMode(this.p.CENTER);
            this.p.strokeWeight(4);
            this.p.stroke(0);
            this.p.rect(x,y, this.infoBoxStyling.width, this.infoBoxStyling.height);

            this.p.noStroke();
            this.p.fill(this.colors.axis);
            this.p.textAlign(this.p.CENTER, this.p.CENTER);
            this.p.text(
                params.name + '\n' + params.value, 
                x,
                y
            );   
        }
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