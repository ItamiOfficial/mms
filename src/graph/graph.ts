import p5 from 'p5';
import { GraphRenderer, type GraphData , type ValueType} from './graphRenderer';
import { type Table } from './csv_utils';


const lerp = (a: number, b: number, t: number) => a + t * (b - a);
const colors = ['#344e41', '#3a5a40', '#588157', '#a3b18a', '#dad7cd'];


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
                        color: '#588157',
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

        const colors = ['#344e41', '#3a5a40', '#588157', '#a3b18a', '#dad7cd'];

        // 2. Daten "drehen"
        const graphValues = xLabels.map((xLabel) => {
            const params = stackCategories.map((groupName, i) => {
                // Zähle: Wie viele Leute aus "Fachbereich X" haben "Antwort Y" gegeben?
                const count = table.entries.filter(row => 
                    row[catIdx] === xLabel && row[filterIdx] === groupName
                ).length;

                return {
                    name: groupName,
                    color: colors[i % colors.length],
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

        p.setup = () => {
            const container = document.querySelector(containerSelector);
            const w = container?.clientWidth || 300;
            const h = container?.clientHeight || 300;

            const canvas = p.createCanvas(w, h);
            canvas.parent(container as HTMLElement);
            
            g = new GraphRenderer(p, data);
            p.frameRate(60);
        };

        p.draw = () => {
            p.clear(); // Nützlich, wenn Hintergründe transparent sein sollen
            g.render();

            //p.noLoop(); // limits to 1 redraw
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