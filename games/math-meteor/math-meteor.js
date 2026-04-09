// math-meteor.js

class MathMeteor extends BaseGame {
    constructor() {
        super("Math Meteor");
        this.gameArea = document.getElementById('game-area');
        this.inputBox = document.getElementById('answer-input');
        
        this.meteor = null; 
        this.currentAnswer = null; 
        this.meteorY = 0; 
        this.meteorSpeed = 1; 
        this.animationFrameId = null; 

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.inputBox.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && this.isPlaying) {
                this.checkAnswer();
            }
        });
    }

    startGame(startingLevel) {
        super.startGame(startingLevel); 
        this.startLevelLoop();
    }

    // New method: Overrides BaseGame's resumeGame
    resumeGame() {
        super.resumeGame();
        this.startLevelLoop(); // Restart the meteor falling when user clicks Next Level
    }

    startLevelLoop() {
        this.meteorSpeed = 1 + (this.currentLevel * 0.2); 
        this.inputBox.disabled = false;
        this.inputBox.value = '';
        this.inputBox.focus();
        this.spawnMeteor();
        this.gameLoop(); 
    }

    generateEquation() {
        let num1, num2, symbol;
        if (this.currentLevel === 1) {
            num1 = Math.floor(Math.random() * 10) + 1;
            num2 = Math.floor(Math.random() * 10) + 1;
            symbol = '+';
            this.currentAnswer = num1 + num2;
        } else if (this.currentLevel === 2) {
            num1 = Math.floor(Math.random() * 15) + 5;
            num2 = Math.floor(Math.random() * num1); 
            symbol = '-';
            this.currentAnswer = num1 - num2;
        } else {
            let multiplier = this.currentLevel - 2;
            num1 = Math.floor(Math.random() * (5 + multiplier)) + 2;
            num2 = Math.floor(Math.random() * (5 + multiplier)) + 2;
            symbol = 'x';
            this.currentAnswer = num1 * num2;
        }
        return `${num1} ${symbol} ${num2}`;
    }

    spawnMeteor() {
        if (this.meteor) this.meteor.remove();

        this.meteor = document.createElement('div');
        this.meteor.classList.add('meteor');
        this.meteor.innerText = this.generateEquation();
        
        const randomX = Math.floor(Math.random() * 80) + 10;
        this.meteor.style.left = `${randomX}%`;
        
        this.meteorY = 0;
        this.meteor.style.top = `${this.meteorY}px`;
        
        this.gameArea.appendChild(this.meteor);
    }

    checkAnswer() {
        const userAnswer = parseInt(this.inputBox.value);
        if (userAnswer === this.currentAnswer) {
            this.addPoints(10); 
            this.inputBox.value = ''; 
            
            // Remove error styling if it was there
            this.inputBox.classList.remove('shake-error');
            
            if (this.isPlaying) {
                this.spawnMeteor(); 
            }
        } else {
            // ❌ Wrong Answer: Clear box and trigger shake animation
            this.inputBox.value = ''; 
            
            // Remove and re-add class to restart animation if they guess wrong quickly
            this.inputBox.classList.remove('shake-error');
            void this.inputBox.offsetWidth; // This forces the browser to reset the element
            this.inputBox.classList.add('shake-error');
        }
    }

    gameLoop() {
        if (!this.isPlaying) return;

        this.meteorY += this.meteorSpeed;
        this.meteor.style.top = `${this.meteorY}px`;

        const groundLevel = this.gameArea.clientHeight - this.meteor.clientHeight;
        
        if (this.meteorY >= groundLevel) {
            this.meteorHitGround();
        } else {
            this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
        }
    }

    // Changed from endGameLoop to handle lives
    meteorHitGround() {
        cancelAnimationFrame(this.animationFrameId);
        if (this.meteor) this.meteor.remove();
        
        // 💥 Trigger the red screen flash
        this.gameArea.classList.remove('flash-damage');
        void this.gameArea.offsetWidth; // Force reset
        this.gameArea.classList.add('flash-damage');

        this.loseLife(); 
        
        if (this.currentLives > 0 && this.isPlaying) {
            this.inputBox.value = '';
            this.spawnMeteor();
            this.gameLoop();
        } else {
            this.inputBox.disabled = true;
        }
    }
}

const mathMeteorGame = new MathMeteor();
mathMeteorGame.init();