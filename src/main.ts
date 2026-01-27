import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styling/custom.scss';
import p5 from 'p5';
import { createGraph, filters } from "./graph/graph";
import { parseCSV, type Table } from './graph/csv_utils';
import type { GraphData } from './graph/graphRenderer';

const state = {
    csvData: null as Table | null,
    graphData: null as GraphData | null,
    graphInstance: null as p5 | null,
    lastIndex: 0
};


async function loadData() {
    try {
        const res = await fetch('../data/umfrage_data.csv');
        const csvText = await res.text();
        state.csvData = parseCSV(csvText);

        if (!state.csvData) throw new Error("CSV konnte nicht geparst werden");

        // Initiale Filterung (Beispiel: Header 1 und 19)
        const category = state.csvData.headers[1];
        const filterBy = state.csvData.headers[19];
        
        state.graphData = filters.countBy(category, filterBy, state.csvData);

        // UI Text setzen
        const subTitle = document.getElementById('graph-description');
        if (subTitle) {
            subTitle.innerText = `"${category}" --- "${filterBy}"`;
        }

        return true;
    } catch (error) {
        console.error("Datenladefehler:", error);
        return false;
    }
}


const handleGraphRendering = (targetId: string) => {
    if (targetId !== 'section-ergebnisse' || !state.graphData) return;

    const container = document.getElementById('graph-wrapper');
    if (!container) return;

    if (!state.graphInstance) {
        state.graphInstance = createGraph('#graph-wrapper', state.graphData);
    } else {
        // Kurzer Delay, damit der Browser das Flex-Layout fertig berechnen kann
        setTimeout(() => {
            const w = container.clientWidth;
            const h = container.clientHeight;
            if (w > 0 && h > 0) {
                state.graphInstance?.resizeCanvas(w, h);
            }
        }, 100);
    }
};


const initNavigation = () => {
    const toggleButtons = Array.from(document.querySelectorAll<HTMLAnchorElement>('.section-toggle'));
    const sections = document.querySelectorAll<HTMLElement>('.content-section');
    const prevBtn = document.getElementById('prev-btn') as HTMLButtonElement;
    const nextBtn = document.getElementById('next-btn') as HTMLButtonElement;
    const content = document.getElementById('content');

    const updateArrowVisibility = (currentIndex: number) => {
        if (prevBtn) {
            prevBtn.disabled = currentIndex === 0;
            prevBtn.style.opacity = prevBtn.disabled ? '0.2' : '1';
        }
        if (nextBtn) {
            nextBtn.disabled = currentIndex === toggleButtons.length - 1;
            nextBtn.style.opacity = nextBtn.disabled ? '0.2' : '1';
        }
    };

    const switchSection = (targetId: string, newIndex: number) => {
        sections.forEach(s => {
            s.classList.remove('slide-in-right', 'slide-in-left');
            s.style.display = 'none';
        });

        const target = document.getElementById(targetId);
        if (!target) return;

        const directionClass = newIndex >= state.lastIndex ? 'slide-in-right' : 'slide-in-left';
        target.style.display = 'block';

        // Graphen-Logik triggern
        handleGraphRendering(targetId);

        setTimeout(() => target.classList.add(directionClass), 10);
        state.lastIndex = newIndex;
        updateArrowVisibility(newIndex);
    };

    const navigate = (direction: number) => {
        const currentIndex = toggleButtons.findIndex(btn => btn.classList.contains('active'));
        const newIndex = currentIndex + direction;

        if (newIndex >= 0 && newIndex < toggleButtons.length) {
            toggleButtons[newIndex].click();
            content?.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Event Listener
    toggleButtons.forEach((button, index) => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = button.getAttribute('data-target');
            if (!targetId) return;

            toggleButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            switchSection(targetId, index);
        });
    });

    prevBtn?.addEventListener('click', () => navigate(-1));
    nextBtn?.addEventListener('click', () => navigate(1));

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') navigate(-1);
        if (e.key === 'ArrowRight') navigate(1);
    });

    // Start-Sektion aktivieren
    if (toggleButtons.length > 0) toggleButtons[0].click();
};

const setupSidebar = () => {
    const selectCat = document.getElementById('select-category') as HTMLSelectElement;
    const selectFilter = document.getElementById('select-filter') as HTMLSelectElement;

    if (!state.csvData || !selectCat || !selectFilter) return;

    // Dropdowns leeren und mit CSV-Headern füllen
    selectCat.innerHTML = '';
    selectFilter.innerHTML = '';

    state.csvData.headers.forEach((header, index) => {
        const opt = new Option(header, index.toString());
        selectCat.add(opt.cloneNode(true) as HTMLOptionElement);
        selectFilter.add(opt);
    });

    // Start-Werte setzen (z.B. Spalte 1 und 19)
    selectCat.value = "1";
    selectFilter.value = "19";

    const updateHandler = () => {
        const catName = state.csvData!.headers[parseInt(selectCat.value)];
        const filterName = state.csvData!.headers[parseInt(selectFilter.value)];
        
        // Daten neu filtern
        state.graphData = filters.countBy(catName, filterName, state.csvData!);

        // Graph neu zeichnen
        if (state.graphInstance) {
            state.graphInstance.remove(); // Alten Sketch sauber beenden
            state.graphInstance = createGraph('#graph-wrapper', state.graphData!);
        }

        // Beschreibung updaten
        const subTitle = document.getElementById('graph-description');
        if (subTitle) {
            if (catName === filterName) {
                subTitle.innerText = `"${catName}"`;
            } else {
                subTitle.innerText = `"${catName}" --- "${filterName}"`;
            }
        }
    };

    selectCat.addEventListener('change', updateHandler);
    selectFilter.addEventListener('change', updateHandler);
};

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', async () => {
    const success = await loadData();
    if (success) {
        setupSidebar();
        initNavigation();
    } else {
        const wrapper = document.getElementById('graph-wrapper');
        if (wrapper) wrapper.innerText = "Daten konnten nicht geladen werden.";
    }
});