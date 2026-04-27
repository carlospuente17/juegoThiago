export class Restas {
    getQuestions() {
        return [
            { q: 'Si tengo 4 panes y me como 1, ¿cuántos quedan?', options: ['2', '3', '4', '5'], correct: 1, icon: 'bakery_dining' },
            { q: '10 - 5 = ?', options: ['4', '5', '6', '7'], correct: 1, icon: 'calculate' },
            { q: 'Tenías 8 globos y se volaron 3. ¿Cuántos quedan?', options: ['4', '5', '6', '7'], correct: 1, icon: 'remove_circle' },
            { q: '¿Cuánto es 7 - 2?', options: ['3', '4', '5', '6'], correct: 2, icon: 'backspace' }
        ];
    }
}
