import p5 from 'p5';
import { GraphRenderer, type GraphData , type ValueType} from './graphRenderer';
import { type Table } from './csv_utils';


const lerp = (a: number, b: number, t: number) => a + t * (b - a);

const forestSage = ['#1b3022', '#2d4a3e', '#344e41', '#3a5a40', '#4f772d', '#588157', '#90a955', '#a3b18a', '#ccd5ae', '#e9edc9'];
const earthClay = ['#3d2b1f', '#582f0e', '#7f4f24', '#936639', '#a68a64', '#b6ad90', '#c2c5aa', '#d5bda1', '#e3d5ca', '#f5ebe0'];
const oceanBlue = ['#03045e', '#0077b6', '#0096c7', '#00b4d8', '#48cae4', '#90e0ef', '#ade8f4', '#caf0f8', '#d0f4de', '#e0fbfc'];
const sunsetTerracotta = ['#6a040f', '#9d0208', '#d00000', '#dc2f02', '#e85d04', '#f48c06', '#faa307', '#ffba08', '#ffca3a', '#ffda3d'];
const slateStone = ['#252422', '#403d39', '#4a4e69', '#6d6875', '#9a8c98', '#b5a4a3', '#c9ada7', '#d8e2dc', '#e5e5e5', '#f8f9fa'];
const lavenderFields = ['#240046', '#3c096c', '#5a189a', '#7b2cbf', '#9d4edd', '#c19ee0', '#d8bbff', '#e0aaff', '#efd3ff', '#f7ebff'];
const autumnHarvest = ['#5e503f', '#764134', '#8a5a44', '#a47148', '#bc8a5f', '#d4a373', '#e9c46a', '#f4a261', '#e76f51', '#f1dca7'];
const berryWine = ['#47126b', '#571089', '#6411ad', '#7122fa', '#822faf', '#9e0059', '#c9184a', '#ff4d6d', '#ff758f', '#ffb3c1'];
const eucaMint = ['#084c61', '#177e89', '#2a9d8f', '#48b5a3', '#72c1b0', '#8ecae6', '#98f5e1', '#b9fbc0', '#d8f3dc', '#e8f5e9'];
const desertNight = ['#001219', '#005f73', '#0a9396', '#94d2bd', '#e9d8a6', '#ee9b00', '#ca6702', '#bb3e03', '#ae2012', '#9b2226'];

let currentColor = earthClay;

export const filters: Record<string, Function> =  {
    count: (category: string, table: Table): GraphData | null => {
        // == Section: Check Valid OBJ == \\
        const index = table.headers.findIndex((v) => v === category);
        
        // return early if index is invalid
        if (index === -1) {
            console.error(`Header "${category}" nicht gefunden!`);
            return null;
        }

        const counts: Record<string, number> = {};
        table.entries.forEach((row) => {
            const value = row[index];
            if (value) {
                counts[value] = (counts[value] || 0) + 1;
            }
        })
        
        // prepare graph value
        const categories = Object.keys(counts);
        const occurrences = Object.values(counts);
        //const maxCount = Math.max(...occurrences, 0);
        let maxCount = table.entries.length;

        const graphValues = categories.map((v, i) => {
            return {
                name: v,
                valueParams: [
                    {
                        name: `Count(${v})`,
                        color: currentColor[i],
                        value: counts[v],
                    }
                ]
            }
        })

        let divisionCount = Math.min(Math.max(...occurrences), 4);
        for (let i = 0; i < maxCount; i++) {
            if (maxCount % divisionCount == 0) {
                break;
            } 

            maxCount++;
        }

        let names = [];

        const stepsize = maxCount / divisionCount;
        for (let i = 0; i < divisionCount + 1; i++) {
            names.push('' + (i) * stepsize );
        }

        return {
            sourceName: category,
            valueName: `Count(${category})`,
            graphType: {
                type: 'bar',    // fixed
                valueRange: {min: 0, max: maxCount},
                valueNames: names,
                valueType: 'Numerical',
                values: graphValues,
            }
        }
    },

    countBy: (category: string, filteredCategory: string, table: Table): GraphData | null => {
        const catIdx = table.headers.findIndex((v) => v === category);
        const filterIdx = table.headers.findIndex((v) => v === filteredCategory);

        if (catIdx === -1 || filterIdx === -1) {
            console.error("Header nicht gefunden");
            return null;
        }

        // 1. Die Achsen definieren
        // xLabels sind jetzt die ANTWORTEN (z.B. "Häufig", "Kaum")
        const xLabels = [...new Set(table.entries.map(row => row[catIdx]))].filter(Boolean);
        // stackCategories sind jetzt die GRUPPEN (z.B. Fachbereiche)
        const stackCategories = [...new Set(table.entries.map(row => row[filterIdx]))].filter(Boolean);

        // 2. Daten "drehen"
        const graphValues = xLabels.map((xLabel) => {
            const params = stackCategories.map((groupName, i) => {
                // Zähle: Wie viele Leute aus "Fachbereich X" haben "Antwort Y" gegeben?
                const count = table.entries.filter(row => 
                    row[catIdx] === xLabel && row[filterIdx] === groupName
                ).length;

                return {
                    name: groupName,
                    color: currentColor[i % currentColor.length],
                    value: count
                };
            }).filter(p => p.value > 0); 

            return {
                name: xLabel, // Steht unter dem Balken
                valueParams: params // Sind die gestapelten Fachbereiche im Balken
            };
        });

        // 3. Skalierung (Maximum berechnen)
        const stackMaxes = graphValues.map(gv => 
            gv.valueParams.reduce((sum, p) => sum + p.value, 0)
        );
        let maxCount = Math.max(...stackMaxes, 0);

        // Schöne Achsen-Einteilung
        let divisionCount = Math.min(maxCount, 4);
        if (divisionCount > 0) {
            while (maxCount % divisionCount !== 0) {
                maxCount++;
            }
        }

        const stepsize = divisionCount > 0 ? maxCount / divisionCount : 0;
        const names = Array.from({length: divisionCount + 1}, (_, i) => '' + (i * stepsize));

        return {
            sourceName: `${filteredCategory} verteilt auf ${category}`,
            valueName: "Anzahl Personen",
            graphType: {
                type: 'bar',
                valueRange: { min: 0, max: maxCount },
                valueNames: names,
                valueType: 'Numerical',
                values: graphValues,
            }
        };
    },
} 



export const createGraph = (containerSelector: string, data: GraphData) => {

    const sketch = (p: p5) => {
        let g: GraphRenderer;
        let lastWidth = 0;
        let lastHeight = 0;

        p.setup = () => {
            const container = document.querySelector(containerSelector) as HTMLElement;
            if (!container) return;
            
            const w = container.clientWidth || 300;
            const h = container.clientHeight || 300;
            
            lastWidth = w;
            lastHeight = h;

            const canvas = p.createCanvas(w, h);
            
            // Canvas absolute positionieren um Layout nicht zu beeinflussen
            canvas.style('position', 'absolute');
            canvas.style('top', '0');
            canvas.style('left', '0');
            canvas.style('display', 'block');
            
            // Container positionieren
            container.style.position = 'relative';
            container.style.overflow = 'hidden';
            
            canvas.parent(container);
            
            g = new GraphRenderer(p, data);
            p.frameRate(60);
        };

        p.draw = () => {
            const container = document.querySelector(containerSelector) as HTMLElement;
            if (container && (container.clientWidth !== lastWidth || container.clientHeight !== lastHeight)) {
                lastWidth = container.clientWidth;
                lastHeight = container.clientHeight;
                p.resizeCanvas(lastWidth, lastHeight, false);
            }
            
            p.clear();
            g.render();
        };

        p.windowResized = () => {
            // Leer - wird in draw() gehandhabt
        };
    };

    // Erstellt die p5-Instanz im "Instance Mode"
    return new p5(sketch);
};