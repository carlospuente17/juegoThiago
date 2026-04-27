export class GameEngine {
    constructor(gamesByKey) {
        this.gamesByKey = gamesByKey;
        this.reset();
    }

    reset() {
        this.config = null;
        this.questions = [];
        this.currentIndex = 0;
        this.score = 0;
        this.currentSelection = null;
        this.finished = false;
        this.deadline = null;
    }

    start(config) {
        this.reset();
        this.config = { ...config };

        const gameProvider = this.gamesByKey[this.config.gameMode];
        if (!gameProvider) {
            throw new Error('No existe proveedor para el juego seleccionado');
        }

        const baseQuestions = gameProvider.getQuestions();
        if (!baseQuestions.length) {
            throw new Error('No hay preguntas disponibles');
        }

        if (this.config.playMode === 'rondas') {
            const rounds = Number(this.config.amount);
            this.questions = this.buildQuestionsForRounds(baseQuestions, rounds);
        } else {
            const seconds = Number(this.config.amount);
            this.questions = this.shuffle([...baseQuestions]);
            this.deadline = Date.now() + seconds * 1000;
        }
    }

    buildQuestionsForRounds(baseQuestions, rounds) {
        const output = [];
        while (output.length < rounds) {
            const chunk = this.shuffle([...baseQuestions]);
            for (const question of chunk) {
                output.push(question);
                if (output.length >= rounds) {
                    break;
                }
            }
        }
        return output;
    }

    shuffle(items) {
        for (let i = items.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [items[i], items[j]] = [items[j], items[i]];
        }
        return items;
    }

    getCurrentQuestion() {
        if (this.isFinished()) {
            return null;
        }

        if (this.config.playMode === 'tiempo' && this.currentIndex >= this.questions.length) {
            this.currentIndex = 0;
            this.questions = this.shuffle([...this.questions]);
        }

        return this.questions[this.currentIndex] || null;
    }

    answer(selectedIndex) {
        if (this.currentSelection !== null || this.isFinished()) {
            return null;
        }

        const currentQuestion = this.getCurrentQuestion();
        if (!currentQuestion) {
            return null;
        }

        this.currentSelection = selectedIndex;
        const isCorrect = currentQuestion.correct === selectedIndex;
        if (isCorrect) {
            this.score += 1;
        }

        return {
            isCorrect,
            correctIndex: currentQuestion.correct,
            selectedIndex
        };
    }

    nextQuestion() {
        if (this.currentSelection === null || this.isFinished()) {
            return;
        }

        this.currentSelection = null;
        this.currentIndex += 1;

        if (this.config.playMode === 'rondas' && this.currentIndex >= this.questions.length) {
            this.finished = true;
        }

        if (this.config.playMode === 'tiempo' && this.getRemainingSeconds() <= 0) {
            this.finished = true;
        }
    }

    isFinished() {
        if (this.finished) {
            return true;
        }

        if (this.config?.playMode === 'tiempo' && this.getRemainingSeconds() <= 0) {
            this.finished = true;
            return true;
        }

        return false;
    }

    getRemainingSeconds() {
        if (!this.deadline) {
            return null;
        }
        return Math.max(0, Math.ceil((this.deadline - Date.now()) / 1000));
    }

    getProgressLabel() {
        if (!this.config) {
            return '0/0';
        }

        if (this.config.playMode === 'tiempo') {
            return `Tiempo: ${this.getRemainingSeconds()} s`;
        }

        const current = Math.min(this.currentIndex + 1, this.questions.length);
        return `${current}/${this.questions.length}`;
    }

    getSummary() {
        return {
            score: this.score,
            total: this.config.playMode === 'rondas' ? this.questions.length : this.currentIndex,
            mode: this.config.playMode
        };
    }
}
