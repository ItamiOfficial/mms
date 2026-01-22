import p5 from 'p5';
import { GraphRenderer, type GraphData } from './graphRenderer';


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


export const createGraph = (containerSelector: string, data: GraphData) => {

    const sketch = (p: p5) => {
        let g: GraphRenderer;

        p.setup = () => {
            // Finde das Container-Element, um dessen Größe zu bestimmen
            const container = document.querySelector(containerSelector);
            const w = container?.clientWidth || 400;
            const h = container?.clientHeight || 400;

            const canvas = p.createCanvas(w, h);
            canvas.parent(container as HTMLElement);
            
            // Initialisiere den Renderer mit den spezifischen Daten
            g = new GraphRenderer(p, data);
            p.frameRate(60);
        };

        p.draw = () => {
            p.clear(); // Nützlich, wenn Hintergründe transparent sein sollen
            g.render();

            p.noLoop(); // limits to 1 redraw
        };

        p.windowResized = () => {
            const container = document.querySelector(containerSelector);
            if (container) {
                p.resizeCanvas(container.clientWidth, container.clientHeight, false);
            }
        };
    };

    // Erstellt die p5-Instanz im "Instance Mode"
    return new p5(sketch);
};