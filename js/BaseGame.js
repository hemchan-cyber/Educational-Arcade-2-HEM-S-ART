// BaseGame.js

class BaseGame {
    constructor(gameName) {
        this.gameName = gameName;
        this.currentScore = 0;
        this.currentLevel = 1;
        this.isPlaying = false;
        
        // New Life and Level Threshold variables
        this.maxLives = 5;
        this.currentLives = this.maxLives;
        this.pointsToNextLevel = 50; // Every 50 points = next level

        this.uiScore = document.getElementById('ui-score');
        this.uiLevel = document.getElementById('ui-level');
        this.uiLives = document.getElementById('ui-lives'); // Added lives UI
        
        this.modal = document.getElementById('game-modal');
        this.modalTitle = document.getElementById('modal-title');
        this.modalMessage = document.getElementById('modal-message');
    }

    init() {
        ArcadeManager.init();
        this.maxUnlockedLevel = ArcadeManager.getMaxLevel(this.gameName);
        this.updateUI();
        this.showLevelSelector();
    }

    showLevelSelector() {
        let selectorHTML = `
            <p>Select your starting level:</p>
            <select id="level-select" style="padding: 0.8rem; font-size: 1.2rem; margin: 1rem 0; width: 100%; border-radius: 8px;">
        `;
        for (let i = 1; i <= this.maxUnlockedLevel; i++) {
            selectorHTML += `<option value="${i}">Level ${i}</option>`;
        }
        selectorHTML += `</select>`;

        if (!ArcadeManager.getCurrentUser()) {
            selectorHTML += `<p style="color: red; font-size: 0.8rem;">Playing as Guest. Progress won't be saved.</p>`;
        }

        this.showModal(
            `Welcome to ${this.gameName}!`, 
            selectorHTML, 
            "Start Game", 
            () => {
                const chosenLevel = parseInt(document.getElementById('level-select').value) || 1;
                this.startGame(chosenLevel);
            }
        );
    }

    startGame(startingLevel = 1) {
        this.currentScore = 0;
        this.currentLevel = startingLevel;
        this.currentLives = this.maxLives; // Reset lives on start
        this.isPlaying = true;
        this.hideModal();
        this.updateUI();
    }

    addPoints(points) {
        if (!this.isPlaying) return;
        this.currentScore += points;
        this.updateUI();
        this.checkLevelUp();
    }

    // New method to handle taking damage
    loseLife() {
        if (!this.isPlaying) return;
        this.currentLives--;
        this.updateUI();
        
        if (this.currentLives <= 0) {
            this.gameOver("Out of Lives!");
        }
    }

    checkLevelUp() {
        // Calculate target score. e.g., Level 1 needs 50 total pts. Level 2 needs 100 total pts.
        const targetScore = this.currentLevel * this.pointsToNextLevel;
        
        if (this.currentScore >= targetScore) {
            this.levelPassed();
        }
    }

    // Pauses game and shows success modal
    levelPassed() {
        this.isPlaying = false; // Pause game
        this.currentLevel++;
        
        if (this.currentLevel > this.maxUnlockedLevel) {
            this.maxUnlockedLevel = this.currentLevel;
        }
        
        // Save progress immediately
        ArcadeManager.saveGameProgress(this.gameName, this.currentScore, this.maxUnlockedLevel);
        this.updateUI();

        this.showModal(
            `Level ${this.currentLevel - 1} Passed!`, 
            `Great job! You have ${this.currentScore} points and ${this.currentLives} lives left.<br><br>Ready for Level ${this.currentLevel}?`, 
            "Next Level", 
            () => this.resumeGame() // Game specific resume logic
        );
    }

    resumeGame() {
        this.isPlaying = true;
        this.hideModal();
        // The specific game (MathMeteor) will override this to restart its animation loop
    }

    gameOver(message = "Game Over!") {
        this.isPlaying = false;
        ArcadeManager.saveGameProgress(this.gameName, this.currentScore, this.maxUnlockedLevel);
        
        this.showModal(
            message, 
            `You scored ${this.currentScore} points.`, 
            "Play Again", 
            () => this.showLevelSelector()
        );
    }

    updateUI() {
        if (this.uiScore) this.uiScore.innerText = this.currentScore;
        if (this.uiLevel) this.uiLevel.innerText = this.currentLevel;
        if (this.uiLives) this.uiLives.innerText = this.currentLives; // Update lives UI
    }

    // Updated to support two buttons
    showModal(title, messageHTML, primaryBtnText, primaryCallback) {
        this.modalTitle.innerText = title;
        this.modalMessage.innerHTML = messageHTML; 
        
        // Setup Primary Button
        const btnPrimary = document.getElementById('modal-btn-primary');
        btnPrimary.innerText = primaryBtnText;
        const newBtnPrimary = btnPrimary.cloneNode(true);
        btnPrimary.parentNode.replaceChild(newBtnPrimary, btnPrimary);
        newBtnPrimary.addEventListener('click', primaryCallback);

        // Setup Secondary (Abort) Button
        const btnSecondary = document.getElementById('modal-btn-secondary');
        const newBtnSecondary = btnSecondary.cloneNode(true);
        btnSecondary.parentNode.replaceChild(newBtnSecondary, btnSecondary);
        newBtnSecondary.addEventListener('click', () => {
            window.location.href = '../../index.html'; // Go back to Hub
        });
        
        this.modal.classList.remove('hidden');
    }

    hideModal() {
        this.modal.classList.add('hidden');
    }
}