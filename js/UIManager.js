export class UIManager {
    constructor(gameConfig) {
        this.config = gameConfig;

        this.storageKey = 'mundoThiagoStars';
        this.totalStars = Number(localStorage.getItem(this.storageKey) || 0);

        this.timerIntervalId = null;
        this.animationFrameId = null;
        this.feedbackTimeoutId = null;
        this.isAiming = false;
        this.currentProjectile = null;

        this.session = null;

        // Pantallas
        this.screenMain = document.getElementById('screen-main');
        this.screenMath = document.getElementById('screen-math');
        this.screenGame = document.getElementById('screen-game');

        // Modal configuracion
        this.modalOverlay = document.getElementById('modal-overlay');
        this.modalConfig = document.getElementById('modal-config');
        this.configTitle = document.getElementById('config-title');

        // Botones principales
        this.btnStart = document.getElementById('btn-start');
        this.btnExitGame = document.getElementById('btn-exit-game');

        // HUD juego
        this.hudModeText = document.getElementById('hud-mode-text');
        this.hudProgressFill = document.getElementById('hud-progress-fill');
        this.hudStars = document.getElementById('hud-stars');
        this.starsTotal = document.getElementById('stars-total');

        // Zona de juego
        this.operationText = document.getElementById('operation-text');
        this.bubbleZone = document.getElementById('bubble-zone');
        this.playerZone = document.getElementById('player-zone');
        this.cannon = document.getElementById('cannon');
        this.feedbackMessage = document.getElementById('feedback-message');

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

        this.initEventListeners();
        this.syncStarsUI();
    }

    initEventListeners() {
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
        document.querySelectorAll('.chip').forEach((chip) => {
            chip.addEventListener('click', (e) => {
                const parent = e.currentTarget.parentElement;
                parent.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.config.amount = e.currentTarget.dataset.val;
                this.checkStartButton();
            });
        });

        // Rangos multiples
        document.querySelectorAll('.range-card').forEach((card) => {
            card.addEventListener('click', (e) => {
                e.currentTarget.classList.toggle('active');
                this.config.ranges = Array.from(document.querySelectorAll('.range-card.active')).map((item) => item.dataset.range);
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
                this.navigateBack(this.screenGame, this.screenMath);
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
                this.screenGame.classList.remove('active', 'previous');
                this.screenMath.classList.remove('active', 'previous');
                this.screenMain.classList.add('active');
            });
        }

        this.bindAimingControls();
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
        this.clearBubbles();

        const totalTarget = Number(this.config.amount || 0);
        this.session = {
            gameMode: this.config.juego,
            playMode: this.config.playMode,
            target: totalTarget,
            ranges: [...this.config.rangos],
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

        this.updateCannonVisual();
        this.navigate(this.screenMath, this.screenGame);
        this.nextQuestion();

        if (this.session.playMode === 'tiempo') {
            this.startTimerLoop();
        }

        this.syncStarsUI();
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
        const ranges = this.config.rangos;
        const pool = [];

        ranges.forEach((range) => {
            const [start, end] = range.split('-').map((v) => Number(v));
            for (let value = start; value <= end; value += 1) {
                pool.push(value);
            }
        });

        return pool.length ? pool : [1, 2, 3, 4, 5, 6, 7, 8, 9];
    }

    generateQuestion() {
        const pool = this.buildNumberPool();
        const a = pool[Math.floor(Math.random() * pool.length)];
        const b = pool[Math.floor(Math.random() * pool.length)];

        let left = a;
        let right = b;
        let operator = '+';

        if (this.config.juego === 'restas') {
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

    nextQuestion() {
        if (!this.session || this.session.finished) {
            return;
        }

        if (this.session.playMode === 'rondas' && this.session.questionSolved >= this.session.target) {
            this.finishGame();
            return;
        }

        this.session.currentQuestion = this.generateQuestion();
        this.operationText.innerText = this.session.currentQuestion.expression;

        this.createAnswerBubbles(this.session.currentQuestion.options, this.session.currentQuestion.answer);
        this.updateHud();
    }

    createAnswerBubbles(options, correctAnswer) {
        this.clearBubbles();

        const palette = ['#FFCDD2', '#F8BBD0', '#FFF9C4', '#C8E6C9', '#B3E5FC', '#D1C4E9'];
        const zoneWidth = this.bubbleZone.clientWidth;
        const bubbleSize = 80;
        const positions = [];

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
            bubble.style.animationDuration = `${(3 + Math.random() * 2).toFixed(2)}s`;
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

        const projectileEl = document.createElement('div');
        projectileEl.className = 'projectile';
        layout.appendChild(projectileEl);

        this.currentProjectile = {
            element: projectileEl,
            x: startX,
            y: startY,
            vx: Math.sin(angleRad) * 12,
            vy: -Math.cos(angleRad) * 12,
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

            this.session.questionSolved += 1;
            window.setTimeout(() => this.nextQuestion(), 450);
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
        this.finalScore.innerText = `${this.session.correctShots} / ${this.session.totalShots} correctas`;
        this.finalStars.innerText = `Estrellas ganadas: ${this.session.starsGained}`;

        this.finalOverlay.classList.add('active');
        this.finalSheet.classList.add('active');

        this.launchConfetti();
    }

    hideFinalSheet() {
        this.finalOverlay.classList.remove('active');
        this.finalSheet.classList.remove('active');
        this.confettiLayer.innerHTML = '';
    }

    launchConfetti() {
        this.confettiLayer.innerHTML = '';
        const colors = ['#EF5350', '#66BB6A', '#29B6F6', '#FFCA28', '#AB47BC', '#FF7043'];

        for (let i = 0; i < 20; i += 1) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.left = `${Math.random() * 100}%`;
            piece.style.background = colors[i % colors.length];
            piece.style.animationDelay = `${(Math.random() * 0.6).toFixed(2)}s`;
            this.confettiLayer.appendChild(piece);
        }
    }

    updateHud() {
        if (!this.session) {
            return;
        }

        if (this.session.playMode === 'rondas') {
            const current = Math.min(this.session.questionSolved + 1, this.session.target);
            this.hudModeText.innerText = `Pregunta ${current} / ${this.session.target}`;

            const progress = (this.session.questionSolved / Math.max(this.session.target, 1)) * 100;
            this.hudProgressFill.style.width = `${progress}%`;
            this.hudProgressFill.classList.remove('danger');
        } else {
            this.hudModeText.innerText = `Tiempo ${this.session.timeLeft}s`;

            const remaining = (this.session.timeLeft / Math.max(this.session.target, 1)) * 100;
            this.hudProgressFill.style.width = `${remaining}%`;

            if (this.session.timeLeft <= 10) {
                this.hudProgressFill.classList.add('danger');
            } else {
                this.hudProgressFill.classList.remove('danger');
            }
        }

        this.hudStars.innerText = String(this.totalStars);
    }

    syncStarsUI() {
        if (this.starsTotal) {
            this.starsTotal.innerText = String(this.totalStars);
        }
        if (this.hudStars) {
            this.hudStars.innerText = String(this.totalStars);
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
        document.querySelectorAll('.toggle-btn').forEach((btn) => btn.classList.remove('active'));
        const rondasToggle = document.querySelector('.toggle-btn[data-mode="rondas"]');
        if (rondasToggle) {
            rondasToggle.classList.add('active');
        }

        document.querySelectorAll('.chips-group').forEach((group) => group.classList.remove('active'));
        const chipsRondas = document.getElementById('chips-rondas');
        if (chipsRondas) {
            chipsRondas.classList.add('active');
        }

        document.querySelectorAll('.chip, .range-card').forEach((element) => element.classList.remove('active'));
        this.checkStartButton();
    }

    checkStartButton() {
        if (!this.btnStart) {
            return;
        }

        if (this.config.isComplete()) {
            this.btnStart.classList.add('enabled');
        } else {
            this.btnStart.classList.remove('enabled');
        }
    }

    shuffle(items) {
        for (let i = items.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [items[i], items[j]] = [items[j], items[i]];
        }
        return items;
    }
}
