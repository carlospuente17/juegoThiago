import { GameConfig } from './GameConfig.js';
import { UIManager } from './UIManager.js';
import { Sumas } from './games/Sumas.js';
import { Restas } from './games/Restas.js';

document.addEventListener('DOMContentLoaded', () => {
    const config = new GameConfig();
    new UIManager(config, {
        sumas: new Sumas(),
        restas: new Restas()
    });
});