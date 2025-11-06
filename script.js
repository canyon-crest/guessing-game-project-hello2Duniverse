function updateDateTime() {
    const d = new Date();
    const months = [
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthName = months[d.getMonth()];
    const day = d.getDate();
    const year = d.getFullYear();
    const suffix = (day % 10 === 1 && day !== 11) ? "st" :
                   (day % 10 === 2 && day !== 12) ? "nd" :
                   (day % 10 === 3 && day !== 13) ? "rd" : "th";
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");
    const ms = String(d.getMilliseconds()).padStart(3, "0");
    date.textContent = `${monthName} ${day}${suffix}, ${year} - ${hours}:${minutes}:${seconds}.${ms}`;
}

// update more frequently so milliseconds are visible
setInterval(updateDateTime, 50);
updateDateTime();
let score, answer, level, playerName;
const levelArr = document.getElementsByName("level");
const scoreArr = [];
let startTime, endTime;
let totalTime = 0;
let fastestTime = Infinity;
let prevAvgTime = null; // track previous average time to color avg up/down
let expertUnlocked = false; // track whether Expert level is unlocked

const playBtn = document.getElementById("playBtn");
const guessBtn = document.getElementById("guessBtn");
const giveUpBtn = document.getElementById("giveUp");
const guessInput = document.getElementById("guess");
const msg = document.getElementById("msg");
const hintBtn = document.getElementById("hintBtn");
const expertRadio = document.getElementById("x");

playBtn.addEventListener("click", play);
guessBtn.addEventListener("click", makeGuess);
giveUpBtn.addEventListener("click", giveUp);
hintBtn.addEventListener("click", showHint);

function askName() {
    playerName = prompt("Please enter your name:");
    while (!playerName || playerName.trim() === "") {
        playerName = prompt("You must enter a name to play:");
    }

    playerName = playerName.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function play() {
    if (!playerName) askName();

    playBtn.disabled = true;
    guessBtn.disabled = false;
    guessInput.disabled = false;
    giveUpBtn.disabled = false;

    for (let i = 0; i < levelArr.length; i++) {
        levelArr[i].disabled = true;
        if (levelArr[i].checked) {
            level = parseInt(levelArr[i].value, 10);
        }
    }

    answer = Math.floor(Math.random() * level) + 1;
    msg.textContent = `${playerName}, guess a number between 1 and ${level}`;
    // reset color for normal instructional message
    msg.style.color = "";
    // enable hint button for Medium/Hard only
    if (hintBtn) hintBtn.disabled = level < 10;
    guessInput.value = "";
    score = 0;
    startTime = new Date().getTime();
}

function makeGuess() {
    let userGuess = parseInt(guessInput.value);

    if (isNaN(userGuess) || userGuess < 1 || userGuess > level) {
        msg.textContent = `❌ Invalid input, ${playerName}! Enter a number between 1 and ${level}.`;
        msg.style.color = ""; // keep invalid input in default color
        return;
    }

    score++;
    let diff = Math.abs(userGuess - answer);

    // Temperature feedback with color changes
    if (diff >= level / 2) {
        msg.textContent = "Cold! Try again.";
        msg.style.color = "#003366";
    } else if (diff >= level / 4) {
        msg.textContent = "Warm! Getting closer.";
        msg.style.color = "#cc5500";
    } else if (diff > 0) {
        msg.textContent = "Hot! You're very close!";
        msg.style.color = "#cc0000";
    }

    if (userGuess === answer) {
        endTime = new Date().getTime();
        const roundTime = ((endTime - startTime) / 1000).toFixed(2);
        totalTime += parseFloat(roundTime);
        if (roundTime < fastestTime) fastestTime = roundTime;
        let performance;
        if (score <= 3) performance = "Excellent! ";
        else if (score <= 6) performance = "Pretty good! ";
        else performance = "You can do better next time! ";
        msg.textContent = `🎉 Correct, ${playerName}! You guessed it in ${score} tries and ${roundTime}s. ${performance}`;
        msg.style.color = "green"; // show the entire correct message in green
        // If they solved a Hard level (100), unlock Expert (1000)
        if (level === 100 && expertRadio) {
            expertUnlocked = true;
            expertRadio.disabled = false;
            // inform the player
            msg.textContent += "\nExpert level unlocked!";
        }
        updateScore(roundTime);
        reset();
    }
}

function giveUp() {
    score = parseInt(level);
    msg.textContent = `You gave up, ${playerName}. The correct number was ${answer}. Score set to ${score}.`;
    msg.style.color = "";
    endTime = new Date().getTime();
    const roundTime = ((endTime - startTime) / 1000).toFixed(2);
    totalTime += parseFloat(roundTime);
    updateScore(roundTime);
    reset();
}

function reset() {
    guessBtn.disabled = true;
    guessInput.disabled = true;
    giveUpBtn.disabled = true;
    if (hintBtn) hintBtn.disabled = true;
    playBtn.disabled = false;
    for (let i = 0; i < levelArr.length; i++) {
        // keep Expert disabled unless unlocked
        if (levelArr[i].id === "x") {
            levelArr[i].disabled = !expertUnlocked;
        } else {
            levelArr[i].disabled = false;
        }
    }
}

function showHint() {
    // Only allow hint during an active game
    if (!playBtn.disabled) {
        msg.textContent = "Start a game first to request a hint.";
        msg.style.color = "";
        return;
    }

    const userGuess = parseInt(guessInput.value, 10);
    if (isNaN(userGuess)) {
        msg.textContent = "Make a guess first to request a hint.";
        msg.style.color = "";
        return;
    }

    const diff = Math.abs(userGuess - answer);
    // Only provide a hint if the user is 'cold' (as defined earlier)
    if (diff < level / 2) {
        msg.textContent = "You're not cold enough to need a hint yet.";
        msg.style.color = "";
        return;
    }

    // Determine a smaller hint range around the answer. This scales with level.
    const halfRange = Math.max(1, Math.ceil(level / 10));
    const min = Math.max(1, answer - halfRange);
    const max = Math.min(level, answer + halfRange);

    msg.textContent = `Hint: the number is between ${min} and ${max}.`;
    msg.style.color = "#006400"; // dark green for hint

    // Disable hint after use for this round
    if (hintBtn) hintBtn.disabled = true;
}

function updateScore(roundTime) {
    scoreArr.push(score);
    wins.textContent = "Total Wins: " + scoreArr.length;
    scoreArr.sort((a, b) => a - b);
    const lb = document.getElementsByName("leaderboard");
    for (let i = 0; i < lb.length; i++) {
        lb[i].textContent = scoreArr[i] ? scoreArr[i] : "--";
    }
    let sum = scoreArr.reduce((a, b) => a + b, 0);
    let avg = sum / scoreArr.length;
    avgScore.textContent = "Average Score: " + avg.toFixed(2);
    // compute numeric average time and format
    const avgTimeNum = totalTime / scoreArr.length;
    const avgTime = avgTimeNum.toFixed(2);
    if (!document.getElementById("timeStats")) {
        const timeStats = document.createElement("p");
        timeStats.id = "timeStats";
        document.body.appendChild(timeStats);
    }
    // choose color based on whether avg time increased or decreased vs previous
    // use explicit hex colors so red/green are visually clear
    let avgColor = "";
    if (prevAvgTime !== null) {
        if (avgTimeNum < prevAvgTime) avgColor = "#006400"; // dark green for improved (decreased)
        else if (avgTimeNum > prevAvgTime) avgColor = "#cc0000"; // red for worsened (increased)
    }

    const fastestStr = fastestTime === Infinity ? "N/A" : fastestTime + "s";
    document.getElementById("timeStats").innerHTML =
        `Fastest Time: ${fastestStr} | Avg Time: <span id="avgTime" style="color:${avgColor}">${avgTime}s</span>`;

    // store current avg for next comparison
    prevAvgTime = avgTimeNum;
}
