export class GameConfig {
    constructor() {
        this.subject = null;
        this.gameMode = null; // 'sumas' o 'restas'
        this.playMode = 'rondas'; // 'rondas' o 'tiempo'
        this.amount = null; // 5, 10, 15 (rondas) o 60, 120, 180 (tiempo)
        this.ranges = []; // ['1-9', '10-19', '20-29']
        this.shooterSpeed = 'normal'; // lenta, normal, rapida
    }

    get juego() {
        return this.gameMode;
    }

    get rangos() {
        return this.ranges;
    }

    isComplete() {
        return this.gameMode && this.amount && this.ranges.length > 0;
    }

    resetConfig() {
        this.playMode = 'rondas';
        this.amount = null;
        this.ranges = [];
        this.shooterSpeed = 'normal';
    }

    toJSON() {
        return JSON.stringify({
            Materia: this.subject,
            Juego: this.juego,
            Modo: this.playMode,
            Cantidad: this.amount,
            Rangos: this.rangos,
            VelocidadDisparo: this.shooterSpeed
        }, null, 2);
    }
}