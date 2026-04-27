import { GameConfig } from './GameConfig.js';
import { UIManager } from './UIManager.js';
import { GameEngine } from './GameEngine.js';
import { Sumas } from './games/Sumas.js';
import { Restas } from './games/Restas.js';

document.addEventListener('DOMContentLoaded', () => {
    const config = new GameConfig();
    const gameEngine = new GameEngine({
        sumas: new Sumas(),
        restas: new Restas()
    });

    new UIManager(config, gameEngine);
});