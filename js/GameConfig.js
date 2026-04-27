export class GameConfig {
    constructor() {
        this.subject = null;
        this.gameMode = null; // 'sumas' o 'restas'
        this.playMode = 'rondas'; // 'rondas' o 'tiempo'
        this.amount = null; // 5, 10, 15 (rondas) o 60, 120, 180 (tiempo)
        this.range = null; // '1-9', '10-19', '20-29'
    }

    isComplete() {
        return this.gameMode && this.amount && this.range;
    }

    resetConfig() {
        this.playMode = 'rondas';
        this.amount = null;
        this.range = null;
    }

    toJSON() {
        return JSON.stringify({
            Materia: this.subject,
            Juego: this.gameMode,
            Modo: this.playMode,
            Cantidad: this.amount,
            Rango: this.range
        }, null, 2);
    }
}