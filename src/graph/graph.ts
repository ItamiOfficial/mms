import p5 from 'p5';
import { GraphRenderer, type GraphData } from './graphRenderer';
import { type Table } from './csv_utils';


const PALETTES = {
    forestSage: ['#1b3022', '#2d4a3e', '#344e41', '#3a5a40', '#4f772d', '#588157', '#90a955', '#a3b18a', '#ccd5ae', '#e9edc9'],
    earthClay: ['#3d2b1f', '#582f0e', '#7f4f24', '#936639', '#a68a64', '#b6ad90', '#c2c5aa', '#d5bda1', '#e3d5ca', '#f5ebe0'],
    oceanBlue: ['#03045e', '#0077b6', '#0096c7', '#00b4d8', '#48cae4', '#90e0ef', '#ade8f4', '#caf0f8', '#d0f4de', '#e0fbfc'],

};

let currentColorPalette = PALETTES.oceanBlue;


const calculateAxisTicks = (actualMax: number) => {
    let maxCount = actualMax;
    const divisionCount = Math.min(maxCount, 4);
    if (divisionCount > 0) {
        while (maxCount % divisionCount !== 0) maxCount++;
    }
    const stepsize = divisionCount > 0 ? maxCount / divisionCount : 0;
    const names = Array.from({ length: divisionCount + 1 }, (_, i) => `${i * stepsize}`);
    return { maxCount, names };
};


export const filters = {
    count: (category: string, table: Table): GraphData | null => {
        const catIdx = table.headers.indexOf(category);
        if (catIdx === -1) return null;

        const counts: Record<string, number> = {};
        table.entries.forEach(row => {
            const val = row[catIdx];
            if (val) counts[val] = (counts[val] || 0) + 1;
        });

        const occurrences = Object.values(counts);
        const { maxCount, names } = calculateAxisTicks(Math.max(...occurrences, 0));

        const graphValues = Object.keys(counts).map((key, i) => ({
            name: key,
            valueParams: [{
                name: `Anzahl`,
                color: currentColorPalette[i % currentColorPalette.length],
                value: counts[key]
            }]
        }));

        return {
            sourceName: category,
            valueName: "Anzahl",
            graphType: {
                type: 'bar',
                valueRange: { min: 0, max: maxCount },
                valueNames: names,
                valueType: 'Numerical',
                values: graphValues
            }
        };
    },


    countBy: (category: string, filteredCategory: string, table: Table): GraphData | null => {
        const catIdx = table.headers.indexOf(category);
        const filterIdx = table.headers.indexOf(filteredCategory);
        if (catIdx === -1 || filterIdx === -1) return null;

        const xLabels = [...new Set(table.entries.map(row => row[catIdx]))].filter(Boolean);
        const stackCategories = [...new Set(table.entries.map(row => row[filterIdx]))].filter(Boolean);

        const graphValues = xLabels.map(xLabel => {
            const params = stackCategories.map((groupName, i) => {
                const count = table.entries.reduce((sum, row) => 
                    (row[catIdx] === xLabel && row[filterIdx] === groupName) ? sum + 1 : sum, 0
                );

                return {
                    name: groupName,
                    color: currentColorPalette[i % currentColorPalette.length],
                    value: count
                };
            }).filter(p => p.value > 0);

            return { name: xLabel, valueParams: params };
        });

        const maxObserved = Math.max(...graphValues.map(gv => 
            gv.valueParams.reduce((sum, p) => sum + p.value, 0)
        ), 0);

        const { maxCount, names } = calculateAxisTicks(maxObserved);

        return {
            sourceName: `${filteredCategory} nach ${category}`,
            valueName: "Anzahl Personen",
            graphType: {
                type: 'bar',
                valueRange: { min: 0, max: maxCount },
                valueNames: names,
                valueType: 'Numerical',
                values: graphValues
            }
        };
    }
};


export const createGraph = (containerSelector: string, data: GraphData) => {
    const container = document.querySelector(containerSelector) as HTMLElement;
    return new p5((p: p5) => {
        let renderer: GraphRenderer;

        p.setup = () => {
            if (!container) return;
            const canvas = p.createCanvas(container.clientWidth, container.clientHeight);
            

            canvas.style('display', 'block');
            container.style.position = 'relative';
            
            renderer = new GraphRenderer(p, data);
        };

        p.draw = () => {
            p.clear();
            renderer.render();
        };


        p.windowResized = () => {
            if (container) {
                p.resizeCanvas(container.clientWidth, container.clientHeight);
                p.redraw();
            }
        };


        (p as any).updateData = (newData: GraphData) => {
            renderer.updateData(newData);
            p.redraw();
        };

    }, container);
};