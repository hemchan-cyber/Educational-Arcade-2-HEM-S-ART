class TypeRush extends BaseGame {
    constructor() {
        super("Type Rush");
        this.promptContainer = document.getElementById('prompt-text');
        this.uiWpm = document.getElementById('ui-wpm');
        
        this.mobileInputContainer = document.getElementById('mobile-input-container');
        this.mobileInput = document.getElementById('mobile-input');
        
        this.virtualKeyboard = document.getElementById('virtual-keyboard');
        this.kbToggleBtn = document.getElementById('toggle-kb-btn');

        this.targetText = "";
        this.userInput = "";
        this.startTime = null;
        this.timerInterval = null;
        
        this.deviceMode = "laptop"; 
        this.gameMode = "basic"; // Tracks which category they chose

        // Progressive Home Row & Hand Drills
        this.basicDrills = [
            "ff jj ff jj fj fj jf jf fff jjj", 
            "asdf jkl asdf jkl sad fad lad lass", 
            "gh ty vb ru nm fur gym run buy", 
            "qwer uiop zip zap fox box wave quit", 
            "the quick brown fox jumps over the lazy dog" 
        ];

        // 100 Common Words for Monkeytype Mode
        this.monkeyWords = ["the","be","to","of","and","a","in","that","have","i","it","for","not","on","with","he","as","you","do","at","this","but","his","by","from","they","we","say","her","she","or","an","will","my","one","all","would","there","their","what","so","up","out","if","about","who","get","which","go","me","when","make","can","like","time","no","just","him","know","take","people","into","year","your","good","some","could","them","see","other","than","then","now","look","only","come","its","over","think","also","back","after","use","two","how","our","work","first","well","way","even","new","want","because","any","these","give","day","most","us"];

        this.setupKeyboardListeners();
    }

    // Override BaseGame selector for custom dropdowns
    showLevelSelector() {
        let selectorHTML = `
            <div style="text-align: left; margin-bottom: 1rem;">
                <label style="font-weight:bold; display:block; margin-bottom:0.5rem;">Select Mode:</label>
                <select id="mode-select" style="width:100%; padding: 0.5rem; font-size: 1rem; border-radius: 5px;">
                    <option value="basic">1. Basic Drills (Hand Placement)</option>
                    <option value="monkeytype">2. Monkeytype (Lowercase Words)</option>
                    <option value="internet-easy">3. Internet Quotes (Lowercase Only)</option>
                    <option value="internet-pro">4. Internet Quotes (Punctuation & Caps)</option>
                </select>
            </div>
            
            <div style="text-align: left; margin-bottom: 1rem;">
                <label style="font-weight:bold; display:block; margin-bottom:0.5rem;">Select Level (Difficulty/Length):</label>
                <select id="level-select" style="width:100%; padding: 0.5rem; font-size: 1rem; border-radius: 5px;">
        `;
        
        for (let i = 1; i <= Math.max(this.maxUnlockedLevel, 5); i++) {
            selectorHTML += `<option value="${i}">Level ${i}</option>`;
        }
        
        selectorHTML += `</select></div>
            <div style="text-align: left; margin-bottom: 1rem;">
                <label style="font-weight:bold; display:block; margin-bottom:0.5rem;">Device Mode:</label>
                <select id="device-select" style="width:100%; padding: 0.5rem; font-size: 1rem; border-radius: 5px;">
                    <option value="laptop">💻 Laptop/Desktop</option>
                    <option value="android">📱 Android/Mobile</option>
                </select>
            </div>
        `;

        this.showModal(`Welcome to ${this.gameName}!`, selectorHTML, "Start Typing", () => {
            this.gameMode = document.getElementById('mode-select').value;
            const chosenLevel = parseInt(document.getElementById('level-select').value) || 1;
            this.deviceMode = document.getElementById('device-select').value;
            this.startGame(chosenLevel);
        });
    }

    startGame(startingLevel) {
        super.startGame(startingLevel);
        
        if (this.deviceMode === "android") {
            this.mobileInputContainer.classList.remove('hidden');
            this.virtualKeyboard.classList.add('hidden'); 
            this.kbToggleBtn.style.display = "none";
            this.mobileInput.value = "";
            this.mobileInput.focus();
        } else {
            this.mobileInputContainer.classList.add('hidden');
            this.mobileInput.blur(); 
            
            // ALWAYS show keyboard by default on laptop, but show the toggle button
            this.virtualKeyboard.classList.remove('hidden');
            this.kbToggleBtn.style.display = "inline-block";
            this.kbToggleBtn.innerText = "Hide Keyboard";
        }

        this.loadNewPrompt();
    }

    // Pulls text locally or fetches from internet based on mode
    async loadNewPrompt() {
        this.userInput = "";
        this.startTime = null;
        this.uiWpm.innerText = "0";
        clearInterval(this.timerInterval);
        
        this.promptContainer.innerHTML = "<span style='color: var(--secondary)'>Loading text...</span>";

        if (this.gameMode === "basic") {
            // Pick drill based on level (caps at 5)
            const drillIndex = Math.min(this.currentLevel - 1, this.basicDrills.length - 1);
            this.targetText = this.basicDrills[drillIndex];
        } 
        else if (this.gameMode === "monkeytype") {
            // More words for higher levels
            let wordCount = 10 + (this.currentLevel * 5); 
            let randomWords = [];
            for(let i=0; i<wordCount; i++) {
                randomWords.push(this.monkeyWords[Math.floor(Math.random() * this.monkeyWords.length)]);
            }
            this.targetText = randomWords.join(" ");
        } 
        else {
            // Internet Fetch Mode!
            try {
                // Fetch a random quote from a free API
                const res = await fetch('https://dummyjson.com/quotes/random');
                const data = await res.json();
                let quote = data.quote;
                
                // If it's the "Easy" internet mode, strip punctuation and make it lowercase
                if (this.gameMode === "internet-easy") {
                    quote = quote.toLowerCase().replace(/[^a-z ]/g, '').replace(/\s+/g, ' ').trim();
                }
                
                // Make it longer if they are on a high level
                if (this.currentLevel >= 3) {
                    const res2 = await fetch('https://dummyjson.com/quotes/random');
                    const data2 = await res2.json();
                    let quote2 = this.gameMode === "internet-easy" 
                        ? data2.quote.toLowerCase().replace(/[^a-z ]/g, '').replace(/\s+/g, ' ').trim() 
                        : data2.quote;
                    quote += " " + quote2;
                }
                
                this.targetText = quote;
            } catch (err) {
                this.targetText = "could not connect to the internet please check your connection and try again";
            }
        }

        this.renderPrompt();
        this.updateVirtualKeyboard();
    }

    renderPrompt() {
        this.promptContainer.innerHTML = "";
        const targetArray = this.targetText.split('');

        targetArray.forEach((char, index) => {
            const charSpan = document.createElement('span');
            charSpan.innerText = char;
            charSpan.classList.add('char');

            if (index < this.userInput.length) {
                if (this.userInput[index] === char) {
                    charSpan.classList.add('correct');
                } else {
                    charSpan.classList.add('incorrect');
                }
            } else if (index === this.userInput.length) {
                charSpan.classList.add('active');
            }

            this.promptContainer.appendChild(charSpan);
        });
    }

    updateVirtualKeyboard() {
        if (this.deviceMode === "android") return;

        document.querySelectorAll('.key').forEach(k => k.classList.remove('highlight-next'));

        if (this.userInput.length < this.targetText.length) {
            let nextChar = this.targetText[this.userInput.length].toLowerCase();
            let keyId = nextChar === " " ? "key- " : `key-${nextChar}`;
            
            const keyElement = document.getElementById(keyId);
            if (keyElement) {
                keyElement.classList.add('highlight-next');
            }
        }
    }

    setupKeyboardListeners() {
        // Toggle Keyboard Button Logic
        this.kbToggleBtn.addEventListener('click', () => {
            this.virtualKeyboard.classList.toggle('hidden');
            if (this.virtualKeyboard.classList.contains('hidden')) {
                this.kbToggleBtn.innerText = "Show Keyboard";
            } else {
                this.kbToggleBtn.innerText = "Hide Keyboard";
            }
        });

        // Laptop Typing Listener
        window.addEventListener('keydown', (e) => {
            if (!this.isPlaying || this.deviceMode === "android") return;
            if (e.key.length > 1 && e.key !== 'Backspace') return; 

            this.handleInput(e.key);
            if(e.key === " ") e.preventDefault(); 

            let pressChar = e.key.toLowerCase();
            let keyElement = document.getElementById(pressChar === " " ? "key- " : `key-${pressChar}`);
            if (keyElement) {
                keyElement.classList.add('pressed');
                setTimeout(() => keyElement.classList.remove('pressed'), 100);
            }
        });

        // Android Typing Listener
        this.mobileInput.addEventListener('input', (e) => {
            if (!this.isPlaying || this.deviceMode === "laptop") return;
            this.userInput = this.mobileInput.value;
            this.processInput();
        });
    }

    handleInput(key) {
        if (key === 'Backspace') {
            this.userInput = this.userInput.slice(0, -1);
        } else {
            if (this.userInput.length < this.targetText.length) {
                this.userInput += key;
            }
        }
        this.processInput();
    }

    processInput() {
        if (!this.startTime && this.userInput.length > 0) {
            this.startTime = new Date();
            this.timerInterval = setInterval(() => this.calculateWPM(), 1000);
        }

        this.renderPrompt();
        this.updateVirtualKeyboard(); 
        this.checkCompletion();
    }

    calculateWPM() {
        if (!this.startTime) return 0;
        const timePassed = (new Date() - this.startTime) / 60000; 
        const wpm = Math.round((this.userInput.length / 5) / timePassed);
        this.uiWpm.innerText = wpm > 0 && wpm < 300 ? wpm : 0; 
        return wpm;
    }

    checkCompletion() {
        if (this.userInput.length === this.targetText.length) {
            clearInterval(this.timerInterval);
            
            let correctChars = 0;
            for (let i = 0; i < this.targetText.length; i++) {
                if (this.userInput[i] === this.targetText[i]) correctChars++;
            }
            
            const accuracy = (correctChars / this.targetText.length);
            const finalWpm = this.calculateWPM();

            if (accuracy >= 0.90) {
                const pointsEarned = finalWpm * (this.currentLevel * 5);
                this.addPoints(pointsEarned);
                setTimeout(() => this.levelPassed(), 500);
            } else {
                this.gameArea.classList.remove('flash-damage');
                void this.gameArea.offsetWidth;
                this.gameArea.classList.add('flash-damage');
                
                setTimeout(() => {
                    this.userInput = "";
                    if(this.deviceMode === "android") this.mobileInput.value = "";
                    this.renderPrompt();
                    this.updateVirtualKeyboard();
                }, 800);
            }
        }
    }

    levelPassed() {
        this.isPlaying = false; 
        this.currentLevel++;
        
        if (this.currentLevel > this.maxUnlockedLevel) {
            this.maxUnlockedLevel = this.currentLevel;
        }
        
        ArcadeManager.saveGameProgress(this.gameName, this.currentScore, this.maxUnlockedLevel);
        this.updateUI();

        this.showModal(
            `Level Passed!`, 
            `Awesome! You typed at <strong>${this.uiWpm.innerText} WPM</strong>.<br><br>Ready for the next challenge?`, 
            "Next Level", 
            () => this.resumeGame() 
        );
    }

    resumeGame() {
        super.resumeGame();
        this.loadNewPrompt();
        if (this.deviceMode === "android") {
            this.mobileInput.value = "";
            this.mobileInput.focus();
        }
    }
}

const typeGame = new TypeRush();
typeGame.init();