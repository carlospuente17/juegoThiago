export class Restas {
    getQuestions() {
        const item = 'nutrition';

        const icon = (name) => `<span class="material-symbols-rounded math-inline-icon">${name}</span>`;
        const icons = (name, count) => Array.from({ length: count }, () => icon(name)).join('');

        return [
            {
                q: 'Cuenta los objetos',
                qHtml: `${icons(item, 4)} ${icon('remove')} ${icons(item, 1)} ${icon('equal')} ?`,
                options: ['2', '3', '4', '5'],
                optionsHtml: [icons(item, 2), icons(item, 3), icons(item, 4), icons(item, 5)],
                correct: 1,
                icon: 'bakery_dining'
            },
            {
                q: 'Cuenta los objetos',
                qHtml: `${icons(item, 5)} ${icon('remove')} ${icons(item, 2)} ${icon('equal')} ?`,
                options: ['2', '3', '4', '5'],
                optionsHtml: [icons(item, 2), icons(item, 3), icons(item, 4), icons(item, 5)],
                correct: 1,
                icon: 'calculate'
            },
            {
                q: 'Cuenta los objetos',
                qHtml: `${icons(item, 6)} ${icon('remove')} ${icons(item, 2)} ${icon('equal')} ?`,
                options: ['3', '4', '5', '6'],
                optionsHtml: [icons(item, 3), icons(item, 4), icons(item, 5), icons(item, 6)],
                correct: 1,
                icon: 'remove_circle'
            },
            {
                q: 'Cuenta los objetos',
                qHtml: `${icons(item, 7)} ${icon('remove')} ${icons(item, 2)} ${icon('equal')} ?`,
                options: ['4', '5', '6', '7'],
                optionsHtml: [icons(item, 4), icons(item, 5), icons(item, 6), icons(item, 7)],
                correct: 1,
                icon: 'backspace'
            }
        ];
    }
}
