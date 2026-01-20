import p5 from 'p5';
import { GraphRenderer } from './graphRenderer';

const sketch = (p: p5) => {
    let g: GraphRenderer = new GraphRenderer(p);

    p.setup = () => {
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.parent("#p5-container");
        p.frameRate(120);   

    };

    p.draw = () => {
        g.render();
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