export class Sumas {
    getQuestions() {
        const item = 'nutrition';
        const plus = 'add';
        const equal = 'equal';

        const icon = (name) => `<span class="material-symbols-rounded math-inline-icon">${name}</span>`;
        const icons = (name, count) => Array.from({ length: count }, () => icon(name)).join('');

        return [
            {
                q: 'Cuenta los objetos',
                qHtml: `${icons(item, 3)} ${icon(plus)} ${icons(item, 2)} ${icon(equal)} ?`,
                options: ['4', '5', '6', '7'],
                optionsHtml: [icons(item, 4), icons(item, 5), icons(item, 6), icons(item, 7)],
                correct: 1,
                icon: 'add_circle'
            },
            {
                q: 'Cuenta los objetos',
                qHtml: `${icons(item, 2)} ${icon(plus)} ${icons(item, 2)} ${icon(equal)} ?`,
                options: ['3', '4', '5', '6'],
                optionsHtml: [icons(item, 3), icons(item, 4), icons(item, 5), icons(item, 6)],
                correct: 1,
                icon: 'calculate'
            },
            {
                q: 'Cuenta los objetos',
                qHtml: `${icons(item, 4)} ${icon(plus)} ${icons(item, 3)} ${icon(equal)} ?`,
                options: ['6', '7', '8', '9'],
                optionsHtml: [icons(item, 6), icons(item, 7), icons(item, 8), icons(item, 9)],
                correct: 1,
                icon: 'redeem'
            },
            {
                q: 'Cuenta los objetos',
                qHtml: `${icons(item, 5)} ${icon(plus)} ${icons(item, 1)} ${icon(equal)} ?`,
                options: ['5', '6', '7', '8'],
                optionsHtml: [icons(item, 5), icons(item, 6), icons(item, 7), icons(item, 8)],
                correct: 1,
                icon: 'add_box'
            }
        ];
    }
}
