import 'bootstrap-icons/font/bootstrap-icons.css'
import '../styling/custom.scss';
import p5 from 'p5';
import { createGraph, filters} from "./graph/graph";
import { parseCSV } from './graph/csv_utils';
import type { GraphData } from './graph/graphRenderer';

let csvData;
let graphData: GraphData;

let lastIndex = 0;
let graphInstance: p5 | null = null;


const initNavigation = () => {
    const toggleButtons = Array.from(document.querySelectorAll<HTMLAnchorElement>('.section-toggle'));
    const sections = document.querySelectorAll<HTMLElement>('.content-section');
    const prevBtn = document.getElementById('prev-btn') as HTMLButtonElement;
    const nextBtn = document.getElementById('next-btn') as HTMLButtonElement;

    // Eine Hilfsfunktion für den sauberen Wechsel
    const switchSection = (targetId: string, newIndex: number) => {
        sections.forEach(s => {
            s.classList.remove('slide-in-right', 'slide-in-left');
            s.style.display = 'none';
        });

        const target = document.getElementById(targetId);
        if (target) {
            const directionClass = newIndex >= lastIndex ? 'slide-in-right' : 'slide-in-left';

            target.style.display = 'block';

            if (targetId === 'section-ergebnisse') {
                if (!graphInstance) {
                    graphInstance = createGraph('#graph-wrapper', graphData);
                } else {
                    setTimeout(() => {
                        const container = document.querySelector('#graph-wrapper');
                        if (container && graphInstance) {
                            graphInstance.resizeCanvas(container.clientWidth, container.clientHeight);
                        }
                    }, 50);
                }
            }

            setTimeout(() => {
                target.classList.add(directionClass);
            }, 10);

            lastIndex = newIndex
        }
    };

    toggleButtons.forEach((button, index) => {
        button.addEventListener('click', (e: MouseEvent) => {
            e.preventDefault();
            const targetId = button.getAttribute('data-target');
            if (!targetId) return;

            // Nutze die neue Animations-Funktion
            switchSection(targetId, index);

            toggleButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            updateArrowVisibility();
        });
    });

    const navigate = (direction: number) => {
        const currentIndex = toggleButtons.findIndex(btn => btn.classList.contains('active'));
        const newIndex = currentIndex + direction;

        if (newIndex >= 0 && newIndex < toggleButtons.length) {
            toggleButtons[newIndex].click();
            
            // WICHTIG: Wenn du Scrollen innerhalb von #content hast:
            const content = document.getElementById('content');
            content?.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // ... Rest deiner updateArrowVisibility, prevBtn, nextBtn und keydown bleibt gleich ...
    
    const updateArrowVisibility = () => {
        const currentIndex = toggleButtons.findIndex(btn => btn.classList.contains('active'));
        if (prevBtn) {
            prevBtn.disabled = currentIndex === 0;
            prevBtn.style.opacity = currentIndex === 0 ? '0.2' : '1';
        }
        if (nextBtn) {
            nextBtn.disabled = currentIndex === toggleButtons.length - 1;
            nextBtn.style.opacity = currentIndex === toggleButtons.length - 1 ? '0.2' : '1';
        }
    };

    prevBtn?.addEventListener('click', () => navigate(-1));
    nextBtn?.addEventListener('click', () => navigate(1));

    document.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft') navigate(-1);
        if (e.key === 'ArrowRight') navigate(1);
    });

    if (toggleButtons.length > 0) {
        toggleButtons[0].click();
    }
};

async function loadCSV(){
    const res = await fetch('../data/umfrage_data.csv');
    const csv = await res.text();
    
    csvData = parseCSV(csv);
    console.log(csvData);

    graphData = filters.countBy(csvData.headers[1], csvData.headers[19], csvData);

    return csvData;
}



document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    loadCSV();

});