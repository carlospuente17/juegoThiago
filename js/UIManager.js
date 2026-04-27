export class UIManager {
    constructor(gameConfig, gameData = {}) {
        this.config = gameConfig;
        this.sumas = gameData.sumas;
        this.restas = gameData.restas;

        this.storageKey = 'mundoThiagoStars';
        this.totalStars = Number(localStorage.getItem(this.storageKey) || 0);
        this.a11yStorageKey = 'mundoThiagoA11y';
        this.isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

        this.timerIntervalId = null;
        this.animationFrameId = null;
        this.feedbackTimeoutId = null;
        this.isAiming = false;
        this.currentProjectile = null;

        this.session = null;

        // Pantallas
        this.screenSplash = document.getElementById('screen-splash');
        this.screenMain = document.getElementById('screen-main');
        this.screenMath = document.getElementById('screen-math');
        this.screenGame = document.getElementById('screen-game');
        this.screenQuiz = document.getElementById('screen-quiz');

        // Modal configuracion
        this.modalOverlay = document.getElementById('modal-overlay');
        this.modalConfig = document.getElementById('modal-config');
        this.configTitle = document.getElementById('config-title');
        this.shooterSpeedGroup = document.getElementById('config-speed-section');
        this.rangeGroup = document.getElementById('range-group');

        // Botones principales
        this.btnPlay = document.getElementById('btn-play');
        this.btnStart = document.getElementById('btn-start');
        this.btnExitGame = document.getElementById('btn-exit-game');
        this.btnExitQuiz = document.getElementById('btn-exit-quiz');
        this.btnReplay = document.getElementById('btn-replay');
        this.btnBackMain = document.getElementById('btn-back-main');

        // HUD juego
        this.hudModeText = document.getElementById('hud-mode-text');
        this.hudProgressFill = document.getElementById('hud-progress-fill');
        this.hudStars = document.getElementById('hud-stars');
        this.starsTotal = document.getElementById('stars-total');

        // Zona de juego (Shooter)
        this.operationText = document.getElementById('operation-text');
        this.bubbleZone = document.getElementById('bubble-zone');
        this.playerZone = document.getElementById('player-zone');
        this.cannon = document.getElementById('cannon');
        this.feedbackMessage = document.getElementById('feedback-message');

        // Zona de juego (Quiz)
        this.quizTitle = document.getElementById('quiz-title');
        this.quizProgress = document.getElementById('quiz-progress');
        this.quizQuestionIcon = document.getElementById('quiz-question-icon');
        this.quizQuestionText = document.getElementById('quiz-question-text');
        this.quizAnswersList = document.getElementById('quiz-answers-list');
        this.btnNextQuiz = document.getElementById('btn-next-quiz');

        // Final
        this.finalOverlay = document.getElementById('final-overlay');
        this.finalSheet = document.getElementById('final-sheet');
        this.finalIcon = document.getElementById('final-icon');
        this.finalTitle = document.getElementById('final-title');
        this.finalScore = document.getElementById('final-score');
        this.finalStars = document.getElementById('final-stars');
        this.btnReplay = document.getElementById('btn-replay');
        this.btnBackMain = document.getElementById('btn-back-main');
        this.confettiLayer = document.getElementById('confetti-layer');

        // Accesibilidad
        this.a11yToggle = document.getElementById('a11y-toggle');
        this.a11yPanel = document.getElementById('a11y-panel');
        this.a11yClose = document.getElementById('a11y-close');
        this.a11yButtons = Array.from(document.querySelectorAll('.a11y-btn'));

        this.a11yState = {
            contrast: false,
            noAnimations: false,
        };

        this.initEventListeners();
        this.syncStarsUI();
        this.loadA11yPreferences();
        this.applyA11yState();
        this.createSplashParticles();
    }

    createSplashParticles() {
        const container = document.getElementById('splash-particles');
        if (!container) return;
        const particleCount = 25;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            const size = Math.random() * 40 + 10;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 10}s`;
            particle.style.animationDuration = `${Math.random() * 10 + 8}s`;
            container.appendChild(particle);
        }
    }

    initEventListeners() {
        // Boton Jugar en Splash
        if (this.btnPlay) {
            this.btnPlay.addEventListener('click', () => {
                this.navigate(this.screenSplash, this.screenMain);
                window.setTimeout(() => {
                    if (this.screenSplash) {
                        this.screenSplash.hidden = true;
                    }
                }, 450);
            });
        }

        // Navegacion a Matematica
        const mathBtn = document.querySelector('.subject-card[data-subject="matematica"]');
        if (mathBtn) {
            mathBtn.addEventListener('click', () => {
                this.config.subject = 'Matematica';
                this.navigate(this.screenMain, this.screenMath);
            });
        }

        // Boton atras estandar (excepto juego)
        document.querySelectorAll('.back-btn[data-back]').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                const targetId = e.currentTarget.dataset.back;
                const targetScreen = document.getElementById(targetId);
                const currentScreen = e.currentTarget.closest('.screen');
                this.navigateBack(currentScreen, targetScreen);
            });
        });

        // Elegir sumas/restas
        document.querySelectorAll('.game-card').forEach((card) => {
            card.addEventListener('click', (e) => {
                const gameType = e.currentTarget.dataset.game;
                this.config.gameMode = gameType;
                this.configTitle.innerText = `Configurar ${gameType.charAt(0).toUpperCase()}${gameType.slice(1)}`;
                this.config.resetConfig();
                this.resetModalUI();

                // Mostrar/ocultar opciones de configuracion segun el juego
                if (gameType === 'disparar') {
                    if (this.shooterSpeedGroup) {
                        this.shooterSpeedGroup.style.display = 'block';
                        const speedGroup = document.getElementById('chips-speed');
                        if (speedGroup) {
                            speedGroup.classList.add('active');
                        }
                    }
                    if (this.rangeGroup) {
                        this.rangeGroup.style.display = 'block';
                    }
                } else {
                    if (this.shooterSpeedGroup) {
                        this.shooterSpeedGroup.style.display = 'none';
                    }
                    if (this.rangeGroup) {
                        this.rangeGroup.style.display = 'block';
                    }
                }

                this.openModal();
            });
        });

        // Cerrar modal
        const btnCloseModal = document.getElementById('btn-close-modal');
        if (btnCloseModal) {
            btnCloseModal.addEventListener('click', () => this.closeModal());
        }
        if (this.modalOverlay) {
            this.modalOverlay.addEventListener('click', () => this.closeModal());
        }

        // Modo rondas/tiempo
        document.querySelectorAll('.toggle-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.toggle-btn').forEach((b) => b.classList.remove('active'));
                e.currentTarget.classList.add('active');

                this.config.playMode = e.currentTarget.dataset.mode;
                this.config.amount = null;

                document.querySelectorAll('.chips-group').forEach((group) => group.classList.remove('active'));
                const selectedGroup = document.getElementById(`chips-${this.config.playMode}`);
                if (selectedGroup) {
                    selectedGroup.classList.add('active');
                }

                document.querySelectorAll('.chip').forEach((chip) => chip.classList.remove('active'));
                this.checkStartButton();
            });
        });

        // Cantidad rondas/tiempo
        document.querySelectorAll('#chips-rondas .chip, #chips-tiempo .chip').forEach((chip) => {
            chip.addEventListener('click', (e) => {
                const parent = e.currentTarget.parentElement;
                parent.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.config.amount = e.currentTarget.dataset.val;
                this.checkStartButton();
            });
        });

        // Rangos de números
        document.querySelectorAll('.range-card').forEach((card) => {
            card.addEventListener('click', (e) => {
                e.currentTarget.classList.toggle('active');
                this.config.ranges = Array.from(document.querySelectorAll('.range-card.active')).map((item) => item.dataset.range);
                this.checkStartButton();
            });
        });

        // Velocidad del shooter
        document.querySelectorAll('#chips-speed .speed-chip').forEach((chip) => {
            chip.addEventListener('click', (e) => {
                const parent = e.currentTarget.parentElement;
                parent.querySelectorAll('.speed-chip').forEach((c) => c.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.config.shooterSpeed = e.currentTarget.dataset.speed;
                this.checkStartButton();
            });
        });

        if (this.btnStart) {
            this.btnStart.addEventListener('click', () => {
                if (!this.config.isComplete()) {
                    return;
                }
                this.closeModal();
                this.startGame();
            });
        }

        if (this.btnExitGame) {
            this.btnExitGame.addEventListener('click', () => {
                const shouldExit = window.confirm('Salir de la partida actual?');
                if (!shouldExit) {
                    return;
                }
                this.stopGameLoops();
                const activeGameScreen = document.querySelector('.screen.game-active');
                this.navigateBack(activeGameScreen, this.screenMath);
            });
        }

        if (this.btnExitQuiz) {
            this.btnExitQuiz.addEventListener('click', () => {
                this.stopGameLoops();
                this.navigateBack(this.screenQuiz, this.screenMath);
            });
        }

        if (this.btnReplay) {
            this.btnReplay.addEventListener('click', () => {
                this.hideFinalSheet();
                this.startGame();
            });
        }

        if (this.btnBackMain) {
            this.btnBackMain.addEventListener('click', () => {
                this.hideFinalSheet();
                this.stopGameLoops();
                this.screenGame.classList.remove('active', 'previous', 'game-active');
                this.screenQuiz.classList.remove('active', 'previous', 'game-active');
                this.screenMath.classList.remove('active', 'previous');
                this.screenMain.classList.add('active');
            });
        }

        if (this.btnNextQuiz) {
            this.btnNextQuiz.addEventListener('click', () => {
                if (!this.session || this.session.finished) {
                    return;
                }
                this.nextQuizQuestion();
            });
        }

        this.bindA11yControls();
        this.bindAimingControls();
    }

    bindA11yControls() {
        if (this.a11yToggle && this.a11yPanel) {
            this.a11yToggle.addEventListener('click', () => {
                const isActive = this.a11yPanel.classList.toggle('active');
                this.a11yPanel.setAttribute('aria-hidden', String(!isActive));
            });
        }

        if (this.a11yClose && this.a11yPanel) {
            this.a11yClose.addEventListener('click', () => {
                this.a11yPanel.classList.remove('active');
                this.a11yPanel.setAttribute('aria-hidden', 'true');
            });
        }

        if (this.cursorBtn && this.isTouchDevice) {
            this.cursorBtn.classList.add('disabled');
            this.cursorBtn.disabled = true;
        }

        this.a11yButtons.forEach((button) => {
            button.addEventListener('click', () => {
                if (button.disabled) {
                    return;
                }
                this.handleA11yAction(button.dataset.a11yAction);
            });
        });
    }

    handleA11yAction(action) {
        switch (action) {
            case 'contrast':
                this.a11yState.contrast = !this.a11yState.contrast;
                break;
            case 'no-animations':
                this.a11yState.noAnimations = !this.a11yState.noAnimations;
                break;
            case 'reset':
                this.resetA11yState();
                break;
            default:
                break;
        }

        this.applyA11yState();
        this.saveA11yPreferences();
    }

    resetA11yState() {
        this.a11yState = {
            contrast: false,
            noAnimations: false,
        };
    }

    applyA11yState() {
        const html = document.documentElement;
        const body = document.body;

        body.classList.toggle('a11y-contrast', this.a11yState.contrast);
        body.classList.toggle('a11y-no-animations', this.a11yState.noAnimations);

        this.refreshA11yButtonState();
    }

    refreshA11yButtonState() {
        this.a11yButtons.forEach((button) => {
            const action = button.dataset.a11yAction;
            let isActive = false;

            if (action === 'contrast') {
                isActive = this.a11yState.contrast;
            } else if (action === 'no-animations') {
                isActive = this.a11yState.noAnimations;
            }

            button.classList.toggle('active', isActive);
        });
    }

    saveA11yPreferences() {
        localStorage.setItem(this.a11yStorageKey, JSON.stringify(this.a11yState));
    }

    loadA11yPreferences() {
        const rawState = localStorage.getItem(this.a11yStorageKey);
        if (!rawState) {
            return;
        }

        try {
            const parsed = JSON.parse(rawState);
            this.a11yState = {
                contrast: Boolean(parsed.contrast),
                noAnimations: Boolean(parsed.noAnimations)
            };
        } catch (error) {
            this.resetA11yState();
        }
    }

    bindAimingControls() {
        if (!this.playerZone) {
            return;
        }

        this.playerZone.addEventListener('pointerdown', (event) => {
            if (!this.session || this.session.finished) {
                return;
            }
            this.isAiming = true;
            this.playerZone.setPointerCapture(event.pointerId);
            this.updateCannonAngle(event.clientX, event.clientY);
        });

        this.playerZone.addEventListener('pointermove', (event) => {
            if (!this.isAiming || !this.session || this.session.finished) {
                return;
            }
            this.updateCannonAngle(event.clientX, event.clientY);
        });

        this.playerZone.addEventListener('pointerup', (event) => {
            if (!this.isAiming || !this.session || this.session.finished) {
                return;
            }
            this.isAiming = false;
            this.playerZone.releasePointerCapture(event.pointerId);
            this.shootProjectile();
        });

        this.playerZone.addEventListener('pointercancel', () => {
            this.isAiming = false;
        });
    }

    startGame() {
        this.stopGameLoops();
        this.hideFinalSheet();

        const totalTarget = Number(this.config.amount || 0);
        this.session = {
            gameMode: this.config.gameMode,
            playMode: this.config.playMode,
            target: totalTarget,
            ranges: [...this.config.ranges],
            shooterSpeed: this.config.shooterSpeed,
            questionSolved: 0,
            score: 0,
            totalShots: 0,
            correctShots: 0,
            starsGained: 0,
            timeLeft: totalTarget,
            startMs: Date.now(),
            endMs: this.config.playMode === 'tiempo' ? Date.now() + totalTarget * 1000 : null,
            angleDeg: 0,
            currentQuestion: null,
            finished: false
        };

        if (this.session.gameMode === 'disparar') {
            this.startShooterGame();
        } else {
            this.startQuizGame();
        }

        if (this.session.playMode === 'tiempo') {
            this.startTimerLoop();
        }

        this.syncStarsUI();
    }

    startShooterGame() {
        this.clearBubbles();
        this.updateCannonVisual();
        this.screenGame.classList.add('game-active');
        this.navigate(this.screenMath, this.screenGame);
        this.nextShooterQuestion();
    }

    startQuizGame() {
        this.screenQuiz.classList.add('game-active');
        this.navigate(this.screenMath, this.screenQuiz);
        this.nextQuizQuestion();
    }

    startTimerLoop() {
        this.stopTimerLoop();
        this.timerIntervalId = window.setInterval(() => {
            if (!this.session || this.session.finished) {
                return;
            }
            const seconds = Math.max(0, Math.ceil((this.session.endMs - Date.now()) / 1000));
            this.session.timeLeft = seconds;
            this.updateHud();
            if (seconds <= 0) {
                this.finishGame();
            }
        }, 200);
    }

    stopTimerLoop() {
        if (this.timerIntervalId) {
            clearInterval(this.timerIntervalId);
            this.timerIntervalId = null;
        }
    }

    stopGameLoops() {
        this.stopTimerLoop();
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        this.removeProjectile();
    }

    buildNumberPool() {
        const ranges = this.config.ranges;
        const pool = [];

        ranges.forEach((range) => {
            const [start, end] = range.split('-').map((v) => Number(v));
            for (let value = start; value <= end; value += 1) {
                pool.push(value);
            }
        });

        return pool.length ? pool : [1, 2, 3, 4, 5, 6, 7, 8, 9];
    }

    generateShooterQuestion() {
        const pool = this.buildNumberPool();
        const a = pool[Math.floor(Math.random() * pool.length)];
        const b = pool[Math.floor(Math.random() * pool.length)];

        let left = a;
        let right = b;
        let operator = '+';

        if (this.config.gameMode === 'restas') {
            operator = '-';
            if (left < right) {
                const temp = left;
                left = right;
                right = temp;
            }
        }

        const answer = operator === '+' ? left + right : left - right;
        const candidates = [answer - 2, answer - 1, answer + 1, answer + 2, answer - 3, answer + 3]
            .filter((value) => value >= 0 && value !== answer);

        const uniqueCandidates = [...new Set(candidates)];
        while (uniqueCandidates.length < 2) {
            uniqueCandidates.push(answer + uniqueCandidates.length + 1);
        }

        const distractors = this.shuffle([...uniqueCandidates]).slice(0, 2);
        const options = this.shuffle([answer, ...distractors]);

        return {
            expression: `${left} ${operator} ${right} = ?`,
            answer,
            options
        };
    }

    nextShooterQuestion() {
        if (!this.session || this.session.finished) {
            return;
        }

        if (this.session.playMode === 'rondas' && this.session.questionSolved >= this.session.target) {
            this.finishGame();
            return;
        }

        this.session.currentQuestion = this.generateShooterQuestion();
        this.operationText.innerText = this.session.currentQuestion.expression;

        this.createAnswerBubbles(this.session.currentQuestion.options, this.session.currentQuestion.answer);
        this.updateHud();
    }

    nextQuizQuestion() {
        if (!this.session || this.session.finished) {
            return;
        }

        if (this.session.playMode === 'rondas' && this.session.questionSolved >= this.session.target) {
            this.finishGame();
            return;
        }

        const provider = this.session.gameMode === 'sumas' ? this.sumas : this.restas;
        const questions = provider?.getQuestions?.() || [];
        const question = questions.length ? questions[Math.floor(Math.random() * questions.length)] : null;

        if (!question) {
            return;
        }

        this.session.currentQuestion = question;
        this.renderQuizQuestion(question);
        this.updateHud();
    }

    renderQuizQuestion(question) {
        const isSumas = this.session?.gameMode === 'sumas';

        if (this.quizTitle) {
            this.quizTitle.innerText = isSumas ? 'Sumas' : 'Restas';
        }
        if (this.quizProgress) {
            this.quizProgress.innerText = `Pregunta ${this.session.questionSolved + 1} / ${this.session.target}`;
        }
        if (this.quizQuestionIcon) {
            this.quizQuestionIcon.innerText = question.icon || 'calculate';
        }
        if (this.quizQuestionText) {
            this.quizQuestionText.innerHTML = question.qHtml || question.q || 'Pregunta';
        }

        if (!this.quizAnswersList) {
            return;
        }

        this.quizAnswersList.innerHTML = '';
        question.options.forEach((option, index) => {
            const optionEl = document.createElement('button');
            optionEl.className = 'answer-btn visual-option';
            optionEl.dataset.index = String(index);
            optionEl.dataset.value = String(option);
            optionEl.innerHTML = `
                <span class="material-symbols-rounded math-inline-icon">star</span>
                <span>${option}</span>
            `;
            optionEl.addEventListener('click', () => this.handleQuizAnswer(index));
            this.quizAnswersList.appendChild(optionEl);
        });

        if (this.btnNextQuiz) {
            this.btnNextQuiz.disabled = true;
            this.btnNextQuiz.innerText = 'Siguiente';
            this.btnNextQuiz.classList.remove('enabled');
        }
    }

    renderIcons(icon, quantity) {
        let html = '';
        for (let i = 0; i < quantity; i++) {
            html += `<span class="quiz-item-icon">${icon}</span>`;
        }
        return html;
    }

    handleQuizAnswer(selectedIndex) {
        if (!this.session || this.session.finished) {
            return;
        }

        const isCorrect = selectedIndex === this.session.currentQuestion.correct;
        this.showQuizFeedback(isCorrect);

        if (isCorrect) {
            this.session.questionSolved += 1;
            this.session.score += 10;
            this.session.starsGained += 1;
            this.totalStars += 1;
            localStorage.setItem(this.storageKey, String(this.totalStars));
            this.syncStarsUI();

            const selectedButton = this.quizAnswersList?.querySelector(`[data-index="${selectedIndex}"]`);
            if (selectedButton) {
                selectedButton.classList.add('correct');
            }

            setTimeout(() => {
                this.hideQuizFeedback();
                this.nextQuizQuestion();
            }, 900);
        } else {
            const wrongButton = this.quizAnswersList?.querySelector(`[data-index="${selectedIndex}"]`);
            if (wrongButton) {
                wrongButton.classList.add('wrong');
                setTimeout(() => wrongButton.classList.remove('wrong'), 350);
            }
            setTimeout(() => this.hideQuizFeedback(), 900);
        }

        this.updateHud();
    }

    showQuizFeedback(isCorrect) {
        if (!this.btnNextQuiz) {
            return;
        }

        this.btnNextQuiz.disabled = false;
        this.btnNextQuiz.innerText = isCorrect ? '¡Correcto!' : 'Intenta de nuevo';
        this.btnNextQuiz.classList.toggle('enabled', isCorrect);
    }

    hideQuizFeedback() {
        if (!this.btnNextQuiz) {
            return;
        }

        this.btnNextQuiz.innerText = 'Siguiente';
        this.btnNextQuiz.classList.remove('enabled');
        this.btnNextQuiz.disabled = true;
    }


    createAnswerBubbles(options, correctAnswer) {
        this.clearBubbles();

        const palette = ['#FFCDD2', '#F8BBD0', '#FFF9C4', '#C8E6C9', '#B3E5FC', '#D1C4E9'];
        const zoneWidth = this.bubbleZone.clientWidth;
        const bubbleSize = 80;
        const positions = [];

        const speedMap = {
            lenta: 1.8,
            normal: 1,
            rapida: 0.6
        };
        const speedMultiplier = speedMap[this.session.shooterSpeed] || 1;


        options.forEach((option, index) => {
            const bubble = document.createElement('div');
            bubble.className = 'answer-bubble';
            bubble.dataset.value = String(option);
            bubble.dataset.correct = String(option === correctAnswer);
            bubble.innerText = String(option);

            let x = 0;
            let tries = 0;
            do {
                x = Math.floor(Math.random() * Math.max(1, zoneWidth - bubbleSize));
                tries += 1;
            } while (positions.some((px) => Math.abs(px - x) < 90) && tries < 20);

            positions.push(x);
            bubble.style.left = `${x}px`;
            bubble.style.top = `${12 + index * 2}px`;
            bubble.style.background = palette[index % palette.length];
            bubble.style.animationDuration = `${(3 + Math.random() * 2) * speedMultiplier}s`;
            bubble.style.animationDelay = `${(-Math.random() * 2).toFixed(2)}s`;

            this.bubbleZone.appendChild(bubble);
        });
    }

    clearBubbles() {
        if (this.bubbleZone) {
            this.bubbleZone.innerHTML = '';
        }
    }

    updateCannonAngle(clientX, clientY) {
        const cannonRect = this.cannon.getBoundingClientRect();
        const centerX = cannonRect.left + cannonRect.width / 2;
        const centerY = cannonRect.top + (88 / 140) * cannonRect.height;

        const dx = clientX - centerX;
        const dy = clientY - centerY;
        let degrees = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
        degrees = Math.max(-70, Math.min(70, degrees));

        this.session.angleDeg = degrees;
        this.updateCannonVisual();
    }

    updateCannonVisual() {
        const angle = this.session ? this.session.angleDeg : 0;
        this.cannon.style.transform = `translateX(-50%) rotate(${angle}deg)`;
    }

    shootProjectile() {
        if (!this.session || this.session.finished || this.currentProjectile) {
            return;
        }

        const layout = this.screenGame.querySelector('.math-shooter-layout');
        const layoutRect = layout.getBoundingClientRect();
        const cannonRect = this.cannon.getBoundingClientRect();

        const originX = cannonRect.left + cannonRect.width / 2;
        const originY = cannonRect.top + (88 / 140) * cannonRect.height;

        const angleRad = (this.session.angleDeg * Math.PI) / 180;
        const startX = originX + Math.sin(angleRad) * 58;
        const startY = originY - Math.cos(angleRad) * 58;
        const speedMap = {
            lenta: 8,
            normal: 12,
            rapida: 16
        };
        const projectileSpeed = speedMap[this.session.shooterSpeed] || 12;

        const projectileEl = document.createElement('div');
        projectileEl.className = 'projectile';
        layout.appendChild(projectileEl);

        this.currentProjectile = {
            element: projectileEl,
            x: startX,
            y: startY,
            vx: Math.sin(angleRad) * projectileSpeed,
            vy: -Math.cos(angleRad) * projectileSpeed,
            layoutRect
        };

        this.animateProjectile();
    }

    animateProjectile() {
        const tick = () => {
            if (!this.currentProjectile) {
                return;
            }

            this.currentProjectile.x += this.currentProjectile.vx;
            this.currentProjectile.y += this.currentProjectile.vy;

            const px = this.currentProjectile.x - this.currentProjectile.layoutRect.left - 10;
            const py = this.currentProjectile.y - this.currentProjectile.layoutRect.top - 10;

            this.currentProjectile.element.style.transform = `translate(${px}px, ${py}px)`;

            if (this.checkBubbleCollision()) {
                return;
            }

            const outTop = this.currentProjectile.y < this.currentProjectile.layoutRect.top - 25;
            const outLeft = this.currentProjectile.x < this.currentProjectile.layoutRect.left - 25;
            const outRight = this.currentProjectile.x > this.currentProjectile.layoutRect.right + 25;
            const outBottom = this.currentProjectile.y > this.currentProjectile.layoutRect.bottom + 25;

            if (outTop || outLeft || outRight || outBottom) {
                this.removeProjectile();
                return;
            }

            this.animationFrameId = requestAnimationFrame(tick);
        };

        this.animationFrameId = requestAnimationFrame(tick);
    }

    checkBubbleCollision() {
        const bubbles = this.bubbleZone.querySelectorAll('.answer-bubble');
        for (const bubble of bubbles) {
            const rect = bubble.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const distance = Math.hypot(this.currentProjectile.x - centerX, this.currentProjectile.y - centerY);

            if (distance <= rect.width / 2 + 10) {
                this.handleBubbleHit(bubble, centerX, centerY);
                return true;
            }
        }
        return false;
    }

    handleBubbleHit(bubble, centerX, centerY) {
        this.session.totalShots += 1;

        const isCorrect = bubble.dataset.correct === 'true';
        if (isCorrect) {
            this.session.correctShots += 1;
            this.session.score += 10;
            this.session.starsGained += 1;
            this.totalStars += 1;
            localStorage.setItem(this.storageKey, String(this.totalStars));
            this.syncStarsUI();

            this.spawnParticles(centerX, centerY);
            this.showFeedback('CORRECTO', true);
            this.removeProjectile();
            this.clearBubbles();

            setTimeout(() => {
                this.nextShooterQuestion();
            }, 450);
        } else {
            bubble.classList.add('shake');
            window.setTimeout(() => bubble.classList.remove('shake'), 300);
            this.showFeedback('Intenta otra vez', false);
            this.removeProjectile();
            this.updateHud();
        }
    }

    removeProjectile() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        if (this.currentProjectile?.element) {
            this.currentProjectile.element.remove();
        }
        this.currentProjectile = null;
    }

    spawnParticles(x, y) {
        const colors = ['#FF7043', '#66BB6A', '#42A5F5', '#FFCA28', '#AB47BC'];
        const zoneRect = this.bubbleZone.getBoundingClientRect();

        for (let i = 0; i < 14; i += 1) {
            const piece = document.createElement('div');
            piece.className = 'particle';
            piece.style.left = `${x - zoneRect.left}px`;
            piece.style.top = `${y - zoneRect.top}px`;
            piece.style.background = colors[i % colors.length];

            const angle = (Math.PI * 2 * i) / 14;
            const radius = 16 + Math.random() * 30;
            piece.style.setProperty('--tx', `${Math.cos(angle) * radius}px`);
            piece.style.setProperty('--ty', `${Math.sin(angle) * radius}px`);

            this.bubbleZone.appendChild(piece);
            window.setTimeout(() => piece.remove(), 560);
        }
    }

    showFeedback(message, positive) {
        if (this.feedbackTimeoutId) {
            clearTimeout(this.feedbackTimeoutId);
            this.feedbackTimeoutId = null;
        }

        const icon = positive ? 'star' : 'target';
        this.feedbackMessage.innerHTML = `<span class="material-symbols-rounded">${icon}</span>${message}`;
        this.feedbackMessage.style.color = positive ? '#1B5E20' : '#B71C1C';
        this.feedbackMessage.classList.add('show');

        this.feedbackTimeoutId = window.setTimeout(() => {
            this.feedbackMessage.classList.remove('show');
        }, 520);
    }

    finishGame() {
        if (!this.session || this.session.finished) {
            return;
        }

        this.session.finished = true;
        this.stopGameLoops();
        this.updateHud();
        this.showFinalSheet();
    }

    showFinalSheet() {
        const total = Math.max(this.session.totalShots, 1);
        const percent = Math.round((this.session.correctShots / total) * 100);

        let icon = 'sentiment_dissatisfied';
        let title = 'Sigue practicando';
        if (percent > 40) {
            icon = 'mood';
            title = 'Muy bien, Thiago';
        }
        if (percent > 70) {
            icon = 'auto_awesome';
            title = 'Eres increible';
        }
        if (percent > 90) {
            icon = 'military_tech';
            title = 'Campeon total';
        }

        this.finalIcon.innerText = icon;
        this.finalTitle.innerText = title;
        this.finalScore.innerText = `${this.session.score} Puntos`;
        this.finalStars.innerHTML = `<span class="material-symbols-rounded">star</span> ${this.session.starsGained} Estrellas ganadas`;

        this.finalOverlay.classList.add('active');
        this.finalSheet.classList.add('active');

        if (percent > 70) {
            this.triggerConfetti();
        }
    }

    hideFinalSheet() {
        this.finalOverlay.classList.remove('active');
        this.finalSheet.classList.remove('active');
        this.confettiLayer.innerHTML = '';
    }

    triggerConfetti() {
        const colors = ['#FF7043', '#66BB6A', '#42A5F5', '#FFCA28', '#AB47BC'];
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.background = colors[i % colors.length];
            confetti.style.animationDelay = `${Math.random() * 2}s`;
            confetti.style.animationDuration = `${2 + Math.random() * 3}s`;
            this.confettiLayer.appendChild(confetti);
        }
    }

    // --- Utilidades UI ---

    checkStartButton() {
        if (this.btnStart) {
            this.btnStart.disabled = !this.config.isComplete();
            this.btnStart.classList.toggle('enabled', this.config.isComplete());
        }
    }

    resetModalUI() {
        document.querySelectorAll('.toggle-btn, .chip, .range-card, .speed-chip').forEach((el) => {
            el.classList.remove('active');
        });
        const defaultMode = document.querySelector('.toggle-btn[data-mode="rondas"]');
        const defaultRounds = document.querySelector('#chips-rondas .chip[data-val="5"]');
        const defaultSpeed = document.querySelector('#chips-speed .speed-chip[data-speed="normal"]');
        if (defaultMode) {
            defaultMode.classList.add('active');
        }
        if (defaultRounds) {
            defaultRounds.classList.add('active');
        }
        if (defaultSpeed) {
            defaultSpeed.classList.add('active');
        }
        const roundsGroup = document.getElementById('chips-rondas');
        const timeGroup = document.getElementById('chips-tiempo');
        const speedGroup = document.getElementById('chips-speed');
        if (roundsGroup) {
            roundsGroup.classList.add('active');
        }
        if (roundsGroup) {
            roundsGroup.style.display = 'flex';
        }
        if (timeGroup) {
            timeGroup.classList.remove('active');
        }
        if (speedGroup) {
            speedGroup.classList.remove('active');
        }
        if (this.config.gameMode === 'disparar' && speedGroup) {
            speedGroup.classList.add('active');
        }
        this.checkStartButton();
    }

    openModal() {
        this.modalOverlay.classList.add('active');
        this.modalConfig.classList.add('active');
    }

    closeModal() {
        this.modalOverlay.classList.remove('active');
        this.modalConfig.classList.remove('active');
    }

    navigate(from, to) {
        if (from) {
            from.classList.remove('active');
            from.classList.add('previous');
        }
        if (to) {
            to.classList.add('active');
            to.classList.remove('previous');
        }
    }

    navigateBack(from, to) {
        if (from) {
            from.classList.remove('active', 'previous');
        }
        if (to) {
            to.classList.add('active');
            to.classList.remove('previous');
        }
    }

    syncStarsUI() {
        if (this.hudStars) {
            this.hudStars.innerText = String(this.totalStars);
        }
        if (this.starsTotal) {
            this.starsTotal.innerText = String(this.totalStars);
        }
    }

    updateHud() {
        if (!this.session) {
            return;
        }

        let progress = 0;
        let modeText = '';

        if (this.session.playMode === 'rondas') {
            progress = (this.session.questionSolved / this.session.target) * 100;
            modeText = `Ronda ${this.session.questionSolved + 1} de ${this.session.target}`;
        } else {
            progress = (this.session.timeLeft / this.session.target) * 100;
            modeText = `Tiempo: ${this.session.timeLeft}s`;
        }

        this.hudProgressFill.style.width = `${progress}%`;
        this.hudModeText.innerText = modeText;
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}
