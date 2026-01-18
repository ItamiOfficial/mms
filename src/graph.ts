import p5 from 'p5'; 
import { styles, type Style } from './style';

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
}

export class GraphRenderer {
    public rt: RenderType;  
    public data: GraphData;
    public style: Style;

    private cornerRounding: number = 0;
    private axisPadding: number = 80;
    private axisSize: number = 7;
    private barSize: number = 0.02;

    public constructor(rt: RenderType, data: GraphData) {
        this.rt = rt;
        this.data = data;
        this.style = styles.Default;
    }

    render(p: p5) {
        this.drawBackground(p);
        this.drawGraph(p);
        this.drawAxis(p);

    }

    private drawBackground(p: p5) {
        p.background(0, 0, 0, 0);
        p.noStroke();
        p.fill(this.style.background);
        p.rectMode(p.CORNER);
        p.rect(0, 0, p.width, p.height, this.cornerRounding);
    }

    private drawAxis(p: p5) {
        p.noStroke();
        p.fill(this.style.axis);
        p.rectMode(p.CORNERS);
        

        // horizontal
        p.rect(
            this.axisPadding,
            p.height - this.axisPadding,
            p.width - this.axisPadding,
            p.height - this.axisPadding + this.axisSize * 0.5
        );

        // vertical
        p.rect(
            this.axisPadding,
            p.height - this.axisPadding,
            this.axisPadding + this.axisSize * 0.5,
            this.axisPadding
        );
    }

    private drawGraph(p: p5) {
        // == Calculate Entry Poisitions == \\
        let barSize = p.width * this.barSize;
        const entryDistance = (p.width - this.axisPadding * 2) / this.data.values.length;
        const edgeOffset = entryDistance / 2;
        const barDistance: number = barSize * 1.5;
        const barOffset: number = -barDistance * this.data.values[0].length * 0.5;

        // == Calculate Value Space == \\
        let minValue = Infinity;
        let maxValue = 0;

        for (let i = 0; i < this.data.values.length; i++) {
            minValue = Math.min(minValue, ...this.data.values[i]);
            maxValue = Math.max(maxValue, ...this.data.values[i]);
        }
        minValue = Math.min(0, minValue);
        
        // == Render Values == \\
        if (this.rt == 'Block') {
            for (let i = 0; i < this.data.values.length; i++) {
                for (let j = 0; j < this.data.values[i].length; j++) {
                    p.noStroke();
                    p.rectMode(p.CORNER)
                    p.fill(this.data.colors[j]);
                    p.rect(
                        this.axisPadding + edgeOffset + entryDistance * i + barOffset + barDistance * j,
                        p.height - this.axisPadding,
                        barSize,
                        -1 * p.map(
                            this.data.values[i][j],
                            minValue,
                            maxValue,
                            0,
                            p.height - this.axisPadding * 2
                        ),
                    );
                }
            }
        }
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