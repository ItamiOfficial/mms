import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styling/custom.scss';
import p5 from 'p5';
import { createGraph, filters } from "./graph/graph";
import { parseCSV, type Table } from './graph/csv_utils';
import type { GraphData } from './graph/graphRenderer';

type vote = 'liked' | 'disliked'

const state = {
    csvData: null as Table | null,
    graphData: null as GraphData | null,
    graphInstance: null as p5 | null,
    lastIndex: 0,
    
    // Votes
    currentVote: 0,
    votes: [] as vote[],
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
            (state.graphInstance as any).updateData(state.graphData);
            // state.graphInstance.remove(); // Alten Sketch sauber beenden
            // state.graphInstance = createGraph('#graph-wrapper', state.graphData!);
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

const initVideo = () => {
    const likeButton = document.getElementById('btn-like') as HTMLButtonElement;
    const dislikeButton = document.getElementById('btn-dislike') as HTMLBRElement;
    if (!likeButton || !dislikeButton) return;

    likeButton.addEventListener('click', (e: MouseEvent) => {
        state.votes.push('liked');
        updateVideo();
    });
    dislikeButton.addEventListener('click', (e: MouseEvent) => {
        state.votes.push('disliked');
        updateVideo();
    });

    const videos = [
        {isAI: false, src: 'https://www.youtube.com/embed/BQOzdbqP1d4?si=-E83cNfv05Blvltp'},
        {isAI: false, src: 'https://www.youtube.com/embed/4cMj5SJRJ2o?si=2eKJoAKaiO0Od4eB&amp;'},
        {isAI: true, src: 'https://www.youtube.com/embed/XDm8wa5Rllk?si=baKDGT2QozGOgGus&amp;'},
        {isAI: true, src: 'https://www.youtube.com/embed/hlYA9Q8nOrc?si=7GwIBDOJirCE6Jp2&amp;'},
    ]

    const updateVideo = () => {
        state.currentVote += 1;

        if (state.currentVote < videos.length) {
            const frame  = document.getElementById('video-frame') as HTMLIFrameElement;
            if (frame) {
                frame.src = videos[state.currentVote].src;
            }
        } else {
            const newView = document.getElementById('test-yourself-results');
            const oldView = document.getElementById('test-yoursel-questions');
            const m00 = document.getElementById('m0-0');
            const m01 = document.getElementById('m0-1');
            const m10 = document.getElementById('m1-0');
            const m11 = document.getElementById('m1-1');

            if (newView) {
                newView.style.display = 'block';
            }
            if (oldView) {
                oldView.style.display = 'none';
            }

            let ail = 0;
            let aid = 0;
            let reall = 0;
            let reald = 0;
            state.votes.forEach((v, i) => {
                if (videos[i].isAI) {
                    ail += v == 'liked' ? 1 : 0;
                    aid += v == 'disliked' ? 1 : 0;
                } else {
                    reall += v == 'liked' ? 1 : 0;
                    reald += v == 'disliked' ? 1 : 0;
                }
            });

            if (m00) { m00.innerText = (ail / videos.length * 100.0) + '.0 %'; }
            if (m01) { m01.innerText = (aid / videos.length * 100.0) + '.0 %'; }
            if (m10) { m10.innerText = (reall / videos.length * 100.0) + '.0 %'; } 
            if (m11) { m11.innerText = (reald / videos.length * 100.0) + '.0 %'; }
        }
    }

    state.currentVote = -1;
    updateVideo();
}



// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', async () => {
    const success = await loadData();
    if (success) {
        setupSidebar();
        initNavigation();
        initVideo();
    } else {
        const wrapper = document.getElementById('graph-wrapper');
        if (wrapper) wrapper.innerText = "Daten konnten nicht geladen werden.";
    }
});