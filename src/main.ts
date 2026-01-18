import p5 from 'p5';
import {GraphRenderer, type ValueType, type RenderType, type Percentage, type Number , type GraphData} from './graph';

const sketch = (p: p5) => {
    let g: GraphRenderer;
    let d: GraphData;

    p.setup = () => {
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.parent("#p5-container");
        p.frameRate(120);   

        const t: Number = {};
        d = {
            valueType: t,
            entries: ['Maria', 'Jonathan', 'Jona', 'Janis', 'Valeria', 'Finn'],
            values: [
                [10, 3, 4], [5, 4, 3], [4, 2, 3], [5, 4, 6], [7, 2, 6], [10, 1, 2],
            ],
            colors: ['#e3795bff', '#e0a566ff', '#e6c681ff'],
        } 
        g = new GraphRenderer('Line', d);
    };

    p.draw = () => {
        g.render(p);
    };

    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    }


};

/* 
Load Sketch after DOM has successfully been loaded,
else canvas.parent() will fail and brick the canvas. 
*/
window.addEventListener("DOMContentLoaded", () => {
  new p5(sketch);
});