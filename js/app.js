import { GameConfig } from './GameConfig.js';
import { UIManager } from './UIManager.js';

document.addEventListener('DOMContentLoaded', () => {
    const config = new GameConfig();
    new UIManager(config);
});