class VocabVault extends BaseGame {
    constructor() {
        super("Vocab Vault");
        this.gridElement = document.getElementById('card-grid');
        
        // Dictionary of pairs
        this.vocabulary = [
            { word: "Cat", match: "🐱" }, { word: "Dog", match: "🐶" },
            { word: "Sun", match: "☀️" }, { word: "Moon", match: "🌙" },
            { word: "Fire", match: "🔥" }, { word: "Water", match: "💧" },
            { word: "Tree", match: "🌳" }, { word: "Flower", match: "🌸" },
            { word: "Car", match: "🚗" }, { word: "Plane", match: "✈️" }
        ];

        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.totalPairsForLevel = 0;
        this.lockBoard = false; // Prevents clicking while animations play
    }

    startGame(startingLevel) {
        super.startGame(startingLevel);
        this.matchedPairs = 0;
        
        // Setup difficulty
        if (this.currentLevel === 1) this.totalPairsForLevel = 4;
        else if (this.currentLevel === 2) this.totalPairsForLevel = 6;
        else this.totalPairsForLevel = 8;

        // Give them more mistakes on harder levels
        this.maxLives = this.totalPairsForLevel + 3;
        this.currentLives = this.maxLives;
        
        this.updateUI();
        this.generateBoard();
    }

    // Overriding BaseGame's checkLevelUp because leveling is based on finding pairs, not score
    checkLevelUp() {
        if (this.matchedPairs === this.totalPairsForLevel) {
            setTimeout(() => this.levelPassed(), 500); // Wait 0.5s so they can see the last match
        }
    }

    resumeGame() {
        super.resumeGame();
        this.startGame(this.currentLevel); // Re-run start to build the bigger board
    }

    generateBoard() {
        this.gridElement.innerHTML = ''; // Clear previous board
        this.cards = [];
        this.flippedCards = [];
        this.lockBoard = false;

        // 1. Pick random pairs for this level
        const shuffledVocab = this.vocabulary.sort(() => 0.5 - Math.random());
        const selectedPairs = shuffledVocab.slice(0, this.totalPairsForLevel);

        // 2. Create card data array (one for word, one for image)
        selectedPairs.forEach(pair => {
            this.cards.push({ id: pair.word, display: pair.word });
            this.cards.push({ id: pair.word, display: pair.match }); // Same ID to verify match
        });

        // 3. Shuffle the deck
        this.cards.sort(() => 0.5 - Math.random());

        // 4. Create DOM elements
        this.cards.forEach((cardData, index) => {
            const cardEl = document.createElement('div');
            cardEl.classList.add('memory-card');
            cardEl.dataset.id = cardData.id;
            cardEl.dataset.index = index;

            cardEl.innerHTML = `
                <div class="card-inner">
                    <div class="card-front">${cardData.display}</div>
                    <div class="card-back">❓</div>
                </div>
            `;

            cardEl.addEventListener('click', () => this.flipCard(cardEl));
            this.gridElement.appendChild(cardEl);
        });

        // Adjust columns for Level 2 and 3 so the grid looks nice
        if (this.currentLevel === 1) this.gridElement.style.gridTemplateColumns = "repeat(4, 1fr)";
        else this.gridElement.style.gridTemplateColumns = "repeat(4, 1fr)"; // Can handle 12 or 16 cards well
    }

    flipCard(cardEl) {
        // Don't flip if locked, already flipped, or matched
        if (this.lockBoard) return;
        if (cardEl.classList.contains('flipped')) return;

        cardEl.classList.add('flipped');
        this.flippedCards.push(cardEl);

        if (this.flippedCards.length === 2) {
            this.checkForMatch();
        }
    }

    checkForMatch() {
        this.lockBoard = true; 

        const card1 = this.flippedCards[0];
        const card2 = this.flippedCards[1];

        if (card1.dataset.id === card2.dataset.id) {
            // ✅ It's a match!
            this.addPoints(10);
            this.matchedPairs++;
            
            card1.classList.add('matched');
            card2.classList.add('matched');
            
            this.resetBoard();
            this.checkLevelUp(); 
        } else {
            // ❌ Not a match!
            
            // Trigger the red screen flash
            const gameArea = document.querySelector('.game-area');
            gameArea.classList.remove('flash-damage');
            void gameArea.offsetWidth; // Force CSS reset
            gameArea.classList.add('flash-damage');

            this.loseLife(); 
            
            // Unflip after a short delay
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                this.resetBoard();
            }, 1000);
        }
    }

    resetBoard() {
        this.flippedCards = [];
        this.lockBoard = false;
    }
}

// Start it up
const vocabGame = new VocabVault();
vocabGame.init();