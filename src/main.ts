import { createGraph, mockData } from "./graph/graph";
import '../styling/custom.scss';

const initNavigation = () => {
    const toggleButtons = document.querySelectorAll<HTMLAnchorElement>('.section-toggle');
    const sections = document.querySelectorAll<HTMLElement>('.content-section');

    toggleButtons.forEach(button => {
        button.addEventListener('click', (e: MouseEvent) => {
            // disable ahref default behaviour moving to '#'
            e.preventDefault();

            const targetId = button.getAttribute('data-target');
            if (!targetId) return;

            // hide all sections
            sections.forEach(section => {
                section.style.display = 'none';
            });

            // enable target section
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.style.display = 'block';
            }

            // Set active to current button
            toggleButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });

    toggleButtons[0].click();
};

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
});