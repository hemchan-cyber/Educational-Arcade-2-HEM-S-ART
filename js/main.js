// main.js - Global state, accounts, and level tracking

const ArcadeManager = {
    init() {
        this.db = JSON.parse(localStorage.getItem('arcadeDB')) || {
            users: {},
            currentUser: null
        };
        this.updateUI();
    },

    saveDB() {
        localStorage.setItem('arcadeDB', JSON.stringify(this.db));
    },

    register(username, password) {
        if (!username || !password) {
            alert("Please enter both username and password.");
            return false;
        }
        if (this.db.users[username]) {
            alert("Username already exists!");
            return false;
        }
        this.db.users[username] = {
            password: password,
            totalPoints: 0,
            progress: {}, 
            highScores: {} // 🌟 NEW: Track high score per game
        };
        this.login(username, password);
        return true;
    },

    login(username, password) {
        const user = this.db.users[username];
        if (user && user.password === password) {
            this.db.currentUser = username;
            this.saveDB();
            this.updateUI();
            
            if(document.getElementById('username')) document.getElementById('username').value = '';
            if(document.getElementById('password')) document.getElementById('password').value = '';
            return true;
        }
        alert("Invalid username or password.");
        return false;
    },

    logout() {
        this.db.currentUser = null;
        this.saveDB();
        this.updateUI();
    },

    getCurrentUser() {
        if (!this.db.currentUser) return null;
        return this.db.users[this.db.currentUser];
    },

    saveGameProgress(gameName, points, maxLevelReached) {
        const user = this.getCurrentUser();
        if (!user) return; 

        user.totalPoints += points;
        
        const currentMax = user.progress[gameName] || 1;
        if (maxLevelReached > currentMax) {
            user.progress[gameName] = maxLevelReached;
        }

        // 🌟 NEW: Save high score for this game
        user.highScores = user.highScores || {}; // Fallback for old accounts
        const currentHighScore = user.highScores[gameName] || 0;
        if (points > currentHighScore) {
            user.highScores[gameName] = points;
        }

        this.saveDB();
        this.updateUI();
    },

    getMaxLevel(gameName) {
        const user = this.getCurrentUser();
        if (!user || !user.progress[gameName]) return 1;
        return user.progress[gameName];
    },

    updateUI() {
        const scoreElement = document.getElementById('global-score');
        const userDisplay = document.getElementById('user-display');
        const loginSection = document.getElementById('login-section');
        const logoutBtn = document.getElementById('logout-btn');

        if (this.db.currentUser) {
            if (scoreElement) scoreElement.innerText = this.getCurrentUser().totalPoints;
            if (userDisplay) userDisplay.innerText = this.db.currentUser;
            if (loginSection) loginSection.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'block';
        } else {
            if (scoreElement) scoreElement.innerText = 0;
            if (userDisplay) userDisplay.innerText = "Guest";
            if (loginSection) loginSection.style.display = 'block';
            if (logoutBtn) logoutBtn.style.display = 'none';
        }

        // 🌟 NEW: Update Personal Best on Game Cards
        const user = this.getCurrentUser();
        
        // As you add new games, just add their names to this list!
        const gameList = ["Math Meteor", "Vocab Vault", "Type Rush"];
        
        gameList.forEach(gameName => {
            const pbElement = document.getElementById(`pb-${gameName}`);
            if (pbElement) {
                if (user && user.highScores && user.highScores[gameName]) {
                    pbElement.innerText = `Personal Best: ${user.highScores[gameName]} pts`;
                } else {
                    pbElement.innerText = ""; // Clear if guest or no score yet
                }
            }
        });

        this.updateLeaderboard();
    },

    updateLeaderboard() {
        const listElement = document.getElementById('leaderboard-list');
        if (!listElement) return; 

        const usersArray = Object.keys(this.db.users).map(username => {
            return {
                username: username,
                points: this.db.users[username].totalPoints
            };
        });

        usersArray.sort((a, b) => b.points - a.points);
        listElement.innerHTML = '';
        
        if (usersArray.length === 0) {
            listElement.innerHTML = '<li class="leaderboard-item" style="justify-content:center;">No players have registered yet!</li>';
            return;
        }

        const topPlayers = usersArray.slice(0, 5); 

        topPlayers.forEach((user, index) => {
            const li = document.createElement('li');
            li.className = 'leaderboard-item';
            
            let medal = '';
            if (index === 0) { medal = '🥇 '; li.classList.add('rank-1'); }
            else if (index === 1) { medal = '🥈 '; li.classList.add('rank-2'); }
            else if (index === 2) { medal = '🥉 '; li.classList.add('rank-3'); }
            else { medal = `<span style="color:#888; font-size:0.9rem; margin-right:5px;">${index + 1}.</span> `; }

            if (user.username === this.db.currentUser) {
                li.classList.add('current-user-rank');
            }

            li.innerHTML = `<span>${medal} ${user.username}</span><span>${user.points} pts</span>`;
            listElement.appendChild(li);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => ArcadeManager.init());