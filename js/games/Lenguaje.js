export class Lenguaje {
    getQuestions() {
        return [
            { q: '¿Qué letra falta? ECU_DOR', options: ['A', 'E', 'O', 'I'], correct: 0, icon: 'edit' },
            { q: '¿Cuántas sílabas tiene la palabra "QUITO"?', options: ['1', '2', '3', '4'], correct: 1, icon: 'menu_book' },
            { q: 'Selecciona la vocal', options: ['B', 'P', 'A', 'M'], correct: 2, icon: 'font_download' },
            { q: '¿Cuál palabra rima con "Gato"?', options: ['Perro', 'Pato', 'Casa', 'Mesa'], correct: 1, icon: 'pets' },
            { q: '¿Qué animal empieza con "C"?', options: ['Loro', 'Perro', 'Cóndor', 'Oso'], correct: 2, icon: 'flight' },
            { q: 'Completa: Había una ___', options: ['Día', 'Vez', 'Mes', 'Año'], correct: 1, icon: 'auto_stories' },
            { q: '¿Cómo se escribe el número 1?', options: ['Uno', 'Dos', 'Tres', 'Cero'], correct: 0, icon: 'format_list_numbered' },
            { q: 'Sinónimo de "Feliz"', options: ['Triste', 'Enojado', 'Contento', 'Llorón'], correct: 2, icon: 'sentiment_satisfied' }
        ];
    }
}
