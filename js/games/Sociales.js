export class Sociales {
    getQuestions() {
        return [
            { q: '¿Cuál es la capital de Ecuador?', options: ['Guayaquil', 'Cuenca', 'Quito', 'Loja'], correct: 2, icon: 'location_city' },
            { q: 'Los colores de la bandera de Ecuador son...', options: ['Amarillo, Azul y Rojo', 'Verde y Blanco', 'Rojo y Blanco', 'Azul y Blanco'], correct: 0, icon: 'flag' },
            { q: '¿Dónde aprendemos con los profesores?', options: ['Hospital', 'Escuela', 'Supermercado', 'Parque'], correct: 1, icon: 'school' },
            { q: '¿Quíenes forman una familia?', options: ['Vecinos', 'Padres, hijos...', 'Policías', 'Bomberos'], correct: 1, icon: 'family_restroom' },
            { q: 'El lugar donde curan a los enfermos', options: ['Parque', 'Escuela', 'Hospital', 'Cine'], correct: 2, icon: 'local_hospital' },
            { q: '¿Cómo se llama tu país?', options: ['Colombia', 'Perú', 'Ecuador', 'Chile'], correct: 2, icon: 'public' },
            { q: 'En el parque debes...', options: ['Dañar las plantas', 'Cuidar las cosas', 'Tirar basura', 'Pelear'], correct: 1, icon: 'park' },
            { q: '¿Quién apaga los incendios?', options: ['Policía', 'Doctor', 'Bombero', 'Profesor'], correct: 2, icon: 'local_fire_department' }
        ];
    }
}
