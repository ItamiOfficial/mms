import p5 from 'p5'; 
import { styles, type Style } from './style';

export type RenderType = "Line" | "Block";
export type ValueType = "Numerical" | "Assignment";


export class GraphRenderer {
    public rt: RenderType;  
    public vt: ValueType;
    public style: Style;

    private cornerRounding: number = 0;
    private axisPadding: number = 80;
    private axisSize: number = 7;
    private namePadding: number = 10;

    private valueRangeNames: Array<string> = [
        '0 %',
        '25 %',
        '50 %',
        '75 %',
        '100 %',
    ];
    private valueOriginNames: Array<Array<string>> = [
        ['Manuel'],
        ['Dominik'],
        ['Johannes'],
    ]

    public constructor(rt: RenderType, vt: ValueType) {
        this.rt = rt;
        this.vt = vt;
        this.style = styles.Default;
    }

    render(p: p5) {
        this.drawBackground(p);
        this.drawAxis(p);
    }

    drawBackground(p: p5) {
        p.background(0, 0, 0, 0);
        p.noStroke();
        p.fill(this.style.background);
        p.rectMode(p.CORNER);
        p.rect(0, 0, p.width, p.height, this.cornerRounding);
    }

    drawAxis(p: p5) {
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

        // Y-Axis Names
        p.textAlign(p.RIGHT, p.CENTER);
        p.textSize(12);
        const dist = (p.height - this.axisPadding * 2) / (this.valueRangeNames.length);
        for (let i: number = 0; i < this.valueRangeNames.length; i++) {
            p.text(
                this.valueRangeNames[i],
                this.axisPadding - this.namePadding, 
                p.height - this.axisPadding - i * dist,
            );
        }
    }

    drawValues() {

    }
}

type GraphPlottingData = {

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