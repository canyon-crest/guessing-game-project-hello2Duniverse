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
    date.textContent = `${monthName} ${day}${suffix}, ${year} - ${hours}:${minutes}:${seconds}`;
}

setInterval(updateDateTime, 1000);
updateDateTime();
let score, answer, level, playerName;
const levelArr = document.getElementsByName("level");
const scoreArr = [];
let startTime, endTime;
let totalTime = 0;
let fastestTime = Infinity;
let prevAvgTime = null; // track previous average time to color avg up/down

const playBtn = document.getElementById("playBtn");
const guessBtn = document.getElementById("guessBtn");
const giveUpBtn = document.getElementById("giveUp");
const guessInput = document.getElementById("guess");
const msg = document.getElementById("msg");

playBtn.addEventListener("click", play);
guessBtn.addEventListener("click", makeGuess);
giveUpBtn.addEventListener("click", giveUp);

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
            level = levelArr[i].value;
        }
    }

    answer = Math.floor(Math.random() * level) + 1;
    msg.textContent = `${playerName}, guess a number between 1 and ${level}`;
    // reset color for normal instructional message
    msg.style.color = "";
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
        msg.style.color = "";
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
    playBtn.disabled = false;
    for (let i = 0; i < levelArr.length; i++) {
        levelArr[i].disabled = false;
    }
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
    let avgColor = "";
    if (prevAvgTime !== null) {
        if (avgTimeNum < prevAvgTime) avgColor = "green"; // improved (decreased)
        else if (avgTimeNum > prevAvgTime) avgColor = "red"; // worsened (increased)
    }

    const fastestStr = fastestTime === Infinity ? "N/A" : fastestTime + "s";
    document.getElementById("timeStats").innerHTML =
        `Fastest Time: ${fastestStr} | Avg Time: <span id="avgTime" style="color:${avgColor}">${avgTime}s</span>`;

    // store current avg for next comparison
    prevAvgTime = avgTimeNum;
}
