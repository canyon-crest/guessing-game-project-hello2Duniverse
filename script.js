/*
// time 
date.textContent = time();

//global variables/constants
let score, answer, level;
const levelArr = document.getElementsByName("level");
const scoreArr = [];

//event listeners
playBtn.addEventListener("click", play);
guessBtn.addEventListener("click", makeGuess);

function time(){
    let d = new Date();
    //concatenate the date and time
    str = d.getMonth()+1 + "/" + d.getDate() + "/" + d.getFullYear();
    //update here
    return str;
}

function play(){
    playBtn.disabled = true;
    guessBtn.disabled = false;
    guess.disabled = false;
    for(let i=0; i<levelArr.length; i++){
        levelArr[i].disabled = true;
        if(levelArr[i].checked){
            level = levelArr[i].value;
        }
    }
    answer = Math.floor(Math.random()*level)+1;
    msg.textContent = "Guess a number 1- " + level;
    guess.placeholder = answer;
    score = 0;
}

function makeGuess(){
    let userGuess = parseInt(guess.value);
    if(isNaN(userGuess) || userGuess < 1 || userGuess > level){
        msg.textContent = "INVALID, guess a number!";
        return;
    }
    score++;
    if(userGuess < answer){
        msg.textContent = "Too low, guess again";
    }
    else if(userGuess > answer){
        msg.textContent = "Too high, guess again";
    }
    else{
        msg.textContent = "Correct! It took " + score + " tries.";
        scoreArr.push(score);
        reset();
        updateScore();
    }
}
function reset(){
    guessBtn.disabled = true;
    guess.value = "";
    guess.placeholder = "";
    guess.disabled = true;
    playBtn.disabled = false;
    for(let i=0; i<levelArr.length; i++){
        levelArr[i].disabled = false;
    }
}

function updateScore(){
    scoreArr.push(score); //adds current score to array of scores
    wins.textContent = "Total wins: " + scoreArr.length;
    let sum = 0;
    scoreArr.sort((a,b)=> a-b); //sorts accending
    //leaderboard?
    const lb = document.getElementsByName("leaderboard");


    for(let i=0; i<scoreArr.length; i++){
        sum+= scoreArr[i];
        if(i < lb.length){
            lb[i].textContent = scoreArr[i];
        }
    }
    let avg = sum/scoreArr.length;
    avgScore.textContent = "Average Score: " + avg.toFixed(2);
}

*/

// ===== Display Date and Live Time =====
function updateDateTime() {
    const d = new Date();

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const monthName = months[d.getMonth()];
    const day = d.getDate();
    const year = d.getFullYear();

    // Add date suffix
    const suffix = (day % 10 === 1 && day !== 11) ? "st" :
                   (day % 10 === 2 && day !== 12) ? "nd" :
                   (day % 10 === 3 && day !== 13) ? "rd" : "th";

    // Format time with leading zeros
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");

    date.textContent = `${monthName} ${day}${suffix}, ${year} - ${hours}:${minutes}:${seconds}`;
}

// Update time every second
setInterval(updateDateTime, 1000);
updateDateTime();

// ===== Global Variables =====
let score, answer, level, playerName;
const levelArr = document.getElementsByName("level");
const scoreArr = [];
let startTime, endTime;
let totalTime = 0;
let fastestTime = Infinity;

const playBtn = document.getElementById("playBtn");
const guessBtn = document.getElementById("guessBtn");
const giveUpBtn = document.getElementById("giveUp");
const guessInput = document.getElementById("guess");
const msg = document.getElementById("msg");

// ===== Event Listeners =====
playBtn.addEventListener("click", play);
guessBtn.addEventListener("click", makeGuess);
giveUpBtn.addEventListener("click", giveUp);

// ===== Functions =====
function askName() {
    playerName = prompt("Please enter your name:");
    while (!playerName || playerName.trim() === "") {
        playerName = prompt("You must enter a name to play:");
    }

    // Capitalize correctly
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
    guessInput.value = "";
    score = 0;

    // Start round timer
    startTime = new Date().getTime();
}

function makeGuess() {
    let userGuess = parseInt(guessInput.value);

    if (isNaN(userGuess) || userGuess < 1 || userGuess > level) {
        msg.textContent = `❌ Invalid input, ${playerName}! Enter a number between 1 and ${level}.`;
        return;
    }

    score++;
    let diff = Math.abs(userGuess - answer);

    // Temperature feedback
    if (diff >= level / 2) {
        msg.textContent = " Cold! Try again.";
    } else if (diff >= level / 4) {
        msg.textContent = "Warm! Getting closer.";
    } else if (diff > 0) {
        msg.textContent = "Hot! You're very close!";
    }

    if (userGuess === answer) {
        endTime = new Date().getTime();
        const roundTime = ((endTime - startTime) / 1000).toFixed(2);
        totalTime += parseFloat(roundTime);

        // Update fastest time
        if (roundTime < fastestTime) fastestTime = roundTime;

        // Performance feedback
        let performance;
        if (score <= 3) performance = "Excellent! ";
        else if (score <= 6) performance = "Pretty good! ";
        else performance = "You can do better next time! ";

        msg.textContent = `🎉 Correct, ${playerName}! You guessed it in ${score} tries and ${roundTime}s. ${performance}`;

        updateScore(roundTime);
        reset();
    }
}

function giveUp() {
    // When user gives up, set score to range value
    score = parseInt(level);
    msg.textContent = ` You gave up, ${playerName}. The correct number was ${answer}. Score set to ${score}.`;
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

    // Sort ascending
    scoreArr.sort((a, b) => a - b);

    // Update leaderboard
    const lb = document.getElementsByName("leaderboard");
    for (let i = 0; i < lb.length; i++) {
        lb[i].textContent = scoreArr[i] ? scoreArr[i] : "--";
    }

    // Average score
    let sum = scoreArr.reduce((a, b) => a + b, 0);
    let avg = sum / scoreArr.length;
    avgScore.textContent = "Average Score: " + avg.toFixed(2);

    // Average time per game
    const avgTime = (totalTime / scoreArr.length).toFixed(2);
    if (!document.getElementById("timeStats")) {
        const timeStats = document.createElement("p");
        timeStats.id = "timeStats";
        document.body.appendChild(timeStats);
    }
    document.getElementById("timeStats").textContent =
        `Fastest Time: ${fastestTime === Infinity ? "N/A" : fastestTime + "s"} | Avg Time: ${avgTime}s`;
}
