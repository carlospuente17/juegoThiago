export class UIManager {
    constructor(gameConfig, gameEngine) {
        this.config = gameConfig;
        this.gameEngine = gameEngine;
        this.timerIntervalId = null;
        
        // Pantallas
        this.screenMain = document.getElementById('screen-main');
        this.screenMath = document.getElementById('screen-math');
        this.screenGame = document.getElementById('screen-game');
        
        // Modal
        this.modalOverlay = document.getElementById('modal-overlay');
        this.modalConfig = document.getElementById('modal-config');
        this.configTitle = document.getElementById('config-title');
        
        // Botones UI
        this.btnStart = document.getElementById('btn-start');
        this.btnNextQuestion = document.getElementById('btn-next-question');

        // Elementos de juego
        this.gameTitle = document.getElementById('game-title');
        this.gameProgress = document.getElementById('game-progress');
        this.scoreValue = document.getElementById('score-value');
        this.questionText = document.getElementById('question-text');
        this.questionIcon = document.getElementById('question-icon');
        this.answersList = document.getElementById('answers-list');
        
        this.initEventListeners();
    }

    initEventListeners() {
        // Navegación a Matemática
        const mathBtn = document.querySelector('.subject-card[data-subject="matematica"]');
        if (mathBtn) {
            mathBtn.addEventListener('click', () => {
                this.config.subject = 'Matemática';
                this.navigate(this.screenMain, this.screenMath);
            });
        }

        // Botón Atrás
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetId = e.currentTarget.dataset.back;
                const targetScreen = document.getElementById(targetId);
                const currentScreen = e.currentTarget.closest('.screen');
                this.navigateBack(currentScreen, targetScreen);
            });
        });

        // Abrir Modal de Configuración (Sumas / Restas)
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const gameType = e.currentTarget.dataset.game;
                this.config.gameMode = gameType;
                this.configTitle.innerText = `Configurar ${gameType.charAt(0).toUpperCase() + gameType.slice(1)}`;
                this.config.resetConfig(); // Limpiar config previa
                this.resetModalUI();
                this.openModal();
            });
        });

        // Cerrar Modal
        const btnClose = document.getElementById('btn-close-modal');
        if (btnClose) btnClose.addEventListener('click', () => this.closeModal());
        if (this.modalOverlay) this.modalOverlay.addEventListener('click', () => this.closeModal());

        // Toggles Rondas/Tiempo
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                
                const mode = e.currentTarget.dataset.mode;
                this.config.playMode = mode;
                this.config.amount = null; // Resetear cantidad al cambiar de modo
                
                document.querySelectorAll('.chips-group').forEach(g => g.classList.remove('active'));
                const targetChips = document.getElementById(`chips-${mode}`);
                if (targetChips) targetChips.classList.add('active');
                
                // Limpiar chips
                document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
                this.checkStartButton();
            });
        });

        // Selección de Cantidad (Chips)
        document.querySelectorAll('.chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                const parent = e.currentTarget.parentElement;
                parent.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.config.amount = e.currentTarget.dataset.val;
                this.checkStartButton();
            });
        });

        // Selección de Rango
        document.querySelectorAll('.range-card').forEach(card => {
            card.addEventListener('click', (e) => {
                document.querySelectorAll('.range-card').forEach(c => c.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.config.range = e.currentTarget.dataset.range;
                this.checkStartButton();
            });
        });

        // Empezar 
        if (this.btnStart) {
            this.btnStart.addEventListener('click', () => {
                if (this.config.isComplete()) {
                    this.startGame();
                    this.closeModal();
                }
            });
        }

        if (this.btnNextQuestion) {
            this.btnNextQuestion.addEventListener('click', () => {
                this.gameEngine.nextQuestion();
                this.renderGameState();
            });
        }

        const btnExitGame = document.getElementById('btn-exit-game');
        if (btnExitGame) {
            btnExitGame.addEventListener('click', () => {
                this.stopTimerUpdater();
                this.navigateBack(this.screenGame, this.screenMath);
            });
        }
    }

    startGame() {
        try {
            this.gameEngine.start(this.config);
            this.navigate(this.screenMath, this.screenGame);
            this.renderGameState();
            this.startTimerUpdater();
        } catch (error) {
            alert(error.message);
        }
    }

    renderGameState() {
        const question = this.gameEngine.getCurrentQuestion();

        if (!question) {
            this.finishGame();
            return;
        }

        this.gameTitle.innerText = this.config.gameMode === 'sumas' ? 'Sumas' : 'Restas';
        this.gameProgress.innerText = this.gameEngine.getProgressLabel();
        this.scoreValue.innerText = String(this.gameEngine.score);

        this.questionText.innerText = question.q;
        this.questionIcon.innerText = question.icon || 'help';

        this.answersList.innerHTML = '';
        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.type = 'button';
            button.innerText = option;
            button.addEventListener('click', () => this.handleAnswer(index));
            this.answersList.appendChild(button);
        });

        this.btnNextQuestion.disabled = true;
    }

    handleAnswer(selectedIndex) {
        const result = this.gameEngine.answer(selectedIndex);
        if (!result) {
            return;
        }

        const buttons = this.answersList.querySelectorAll('.answer-btn');
        buttons.forEach((button, index) => {
            button.disabled = true;
            if (index === result.correctIndex) {
                button.classList.add('correct');
            } else if (index === result.selectedIndex) {
                button.classList.add('wrong');
            } else {
                button.classList.add('dimmed');
            }
        });

        this.scoreValue.innerText = String(this.gameEngine.score);
        this.btnNextQuestion.disabled = false;
    }

    finishGame() {
        this.stopTimerUpdater();
        const summary = this.gameEngine.getSummary();
        const total = summary.total || 0;
        alert(`Juego terminado. Puntaje: ${summary.score}/${total}`);
        this.navigateBack(this.screenGame, this.screenMath);
    }

    startTimerUpdater() {
        this.stopTimerUpdater();
        if (this.config.playMode !== 'tiempo') {
            return;
        }

        this.timerIntervalId = window.setInterval(() => {
            if (this.gameEngine.isFinished()) {
                this.finishGame();
                return;
            }

            this.gameProgress.innerText = this.gameEngine.getProgressLabel();
        }, 400);
    }

    stopTimerUpdater() {
        if (this.timerIntervalId) {
            clearInterval(this.timerIntervalId);
            this.timerIntervalId = null;
        }
    }

    navigate(fromScreen, toScreen) {
        if (!fromScreen || !toScreen) return;
        fromScreen.classList.remove('active');
        fromScreen.classList.add('previous');
        toScreen.classList.add('active');
        toScreen.classList.remove('previous');
    }

    navigateBack(fromScreen, toScreen) {
        if (!fromScreen || !toScreen) return;
        fromScreen.classList.remove('active');
        toScreen.classList.add('active');
        toScreen.classList.remove('previous');
    }

    openModal() {
        if (this.modalOverlay) this.modalOverlay.classList.add('active');
        if (this.modalConfig) this.modalConfig.classList.add('active');
    }

    closeModal() {
        if (this.modalOverlay) this.modalOverlay.classList.remove('active');
        if (this.modalConfig) this.modalConfig.classList.remove('active');
    }

    resetModalUI() {
        // Reset Toggles a 'rondas'
        document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        const rondasToggle = document.querySelector('.toggle-btn[data-mode="rondas"]');
        if (rondasToggle) rondasToggle.classList.add('active');
        
        document.querySelectorAll('.chips-group').forEach(g => g.classList.remove('active'));
        const chipsRondas = document.getElementById('chips-rondas');
        if (chipsRondas) chipsRondas.classList.add('active');

        // Limpiar selecciones
        document.querySelectorAll('.chip, .range-card').forEach(el => el.classList.remove('active'));
        
        this.checkStartButton();
    }

    checkStartButton() {
        if (!this.btnStart) return;
        if (this.config.isComplete()) {
            this.btnStart.classList.add('enabled');
        } else {
            this.btnStart.classList.remove('enabled');
        }
    }
}