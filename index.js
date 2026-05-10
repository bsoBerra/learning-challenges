const clock = document.querySelector("#clock");
const app = document.querySelector("#app");
const startScreen = document.querySelector("#startScreen");
const clockChallengeButton = document.querySelector("#clockChallengeButton");
const multiplicationButton = document.querySelector("#multiplicationButton");
const multiplicationScreen = document.querySelector("#multiplicationScreen");
const minuteMarks = document.querySelector("#minuteMarks");
const hourHand = document.querySelector("#hourHand");
const minuteHand = document.querySelector("#minuteHand");
const showTimeButton = document.querySelector("#showTimeButton");
const randomTimeButton = document.querySelector("#randomTimeButton");
const claimPrizeButton = document.querySelector("#claimPrizeButton");
const digitalTime = document.querySelector("#digitalTime");
const answerResult = document.querySelector("#answerResult");
const scoreValue = document.querySelector("#scoreValue");
const generationCountValue = document.querySelector("#generationCountValue");
const winnerScreen = document.querySelector("#winnerScreen");
const winnerGenerationCount = document.querySelector("#winnerGenerationCount");
const winnerScore = document.querySelector("#winnerScore");
const homeButtons = document.querySelectorAll("[data-home-button]");
const answerButtons = document.querySelectorAll("[data-answer-step]");
const answerDigits = {
  hourTens: document.querySelector("[data-answer-digit='hourTens']"),
  hourOnes: document.querySelector("[data-answer-digit='hourOnes']"),
  minuteTens: document.querySelector("[data-answer-digit='minuteTens']"),
  minuteOnes: document.querySelector("[data-answer-digit='minuteOnes']"),
};

const state = {
  hour: 10,
  minute: 10,
  answerHour: 0,
  answerMinute: 0,
  isChecked: false,
  score: 0,
  generationCount: 1,
};

function createMinuteMarks() {
  for (let minute = 0; minute < 60; minute += 1) {
    const mark = document.createElement("span");
    mark.className = "minute-mark";
    mark.style.setProperty("--angle", `${minute * 6}deg`);
    minuteMarks.append(mark);
  }
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function displayHour() {
  return state.hour === 0 ? 12 : state.hour;
}

function randomInteger(max) {
  return Math.floor(Math.random() * max);
}

function updateClaimPrizeButton() {
  claimPrizeButton.disabled = state.score <= 30;
}

function showWinnerScreen() {
  winnerGenerationCount.textContent = state.generationCount;
  winnerScore.textContent = state.score;
  startScreen.classList.add("app-hidden");
  app.classList.add("app-hidden");
  multiplicationScreen.classList.add("app-hidden");
  winnerScreen.classList.remove("app-hidden");
}

function showStartScreen() {
  app.classList.add("app-hidden");
  multiplicationScreen.classList.add("app-hidden");
  winnerScreen.classList.add("app-hidden");
  startScreen.classList.remove("app-hidden");
}

function changeScore(delta) {
  state.score = Math.max(0, state.score + delta);
  scoreValue.textContent = state.score;
  updateClaimPrizeButton();

  if (state.score > 60) {
    showWinnerScreen();
  }
}

function increaseGenerationCount() {
  state.generationCount += 1;
  generationCountValue.textContent = state.generationCount;
}

function setRandomTime() {
  state.hour = randomInteger(12);
  state.minute = randomInteger(60);
}

function wrap(value, max) {
  return ((value % max) + max) % max;
}

function renderAnswerTime() {
  const hour = pad(state.answerHour);
  const minute = pad(state.answerMinute);

  answerDigits.hourTens.textContent = hour[0];
  answerDigits.hourOnes.textContent = hour[1];
  answerDigits.minuteTens.textContent = minute[0];
  answerDigits.minuteOnes.textContent = minute[1];
}

function renderAnswerResult(isCorrect) {
  answerResult.textContent = isCorrect ? "✓" : "✕";
  answerResult.classList.toggle("correct", isCorrect);
  answerResult.classList.toggle("incorrect", !isCorrect);
  answerResult.classList.remove("hidden");
}

function clearAnswerResult() {
  answerResult.textContent = "";
  answerResult.classList.remove("correct", "incorrect");
  answerResult.classList.add("hidden");
}

function setCheckedMode(isChecked) {
  state.isChecked = isChecked;
  showTimeButton.disabled = isChecked;
  hourHand.disabled = isChecked;
  minuteHand.disabled = isChecked;

  answerButtons.forEach((button) => {
    button.disabled = isChecked;
  });
}

function resetAnswerTime() {
  state.answerHour = 0;
  state.answerMinute = 0;
  renderAnswerTime();
}

function setAnswerHour(hour) {
  state.answerHour = wrap(hour, 12);
}

function changeAnswerDigit(step, direction) {
  const hourTens = Math.floor(state.answerHour / 10);
  const hourOnes = state.answerHour % 10;
  const minuteTens = Math.floor(state.answerMinute / 10);
  const minuteOnes = state.answerMinute % 10;

  if (step === "hourTens") {
    const nextHourTens = wrap(hourTens + direction, 2);
    const maxHourOnes = nextHourTens === 1 ? 1 : 9;
    setAnswerHour(nextHourTens * 10 + Math.min(hourOnes, maxHourOnes));
  }

  if (step === "hourOnes") {
    const maxHourOnes = hourTens === 1 ? 2 : 10;
    setAnswerHour(hourTens * 10 + wrap(hourOnes + direction, maxHourOnes));
  }

  if (step === "minuteTens") {
    state.answerMinute = wrap(minuteTens + direction, 6) * 10 + minuteOnes;
  }

  if (step === "minuteOnes") {
    state.answerMinute = minuteTens * 10 + wrap(minuteOnes + direction, 10);
  }

  renderAnswerTime();
}

function hideDigitalTime() {
  digitalTime.classList.add("hidden");
}

function renderHands() {
  const hourRotation = (state.hour % 12) * 30 + state.minute * 0.5;
  const minuteRotation = state.minute * 6;

  hourHand.style.setProperty("--rotation", `${hourRotation}deg`);
  minuteHand.style.setProperty("--rotation", `${minuteRotation}deg`);
}

showTimeButton.addEventListener("click", () => {
  const isCorrect = state.answerHour === state.hour && state.answerMinute === state.minute;

  digitalTime.textContent = `${pad(displayHour())}:${pad(state.minute)}`;
  digitalTime.classList.remove("hidden");

  renderAnswerResult(isCorrect);
  changeScore(isCorrect ? 2 : -1);
  setCheckedMode(true);
});

randomTimeButton.addEventListener("click", () => {
  increaseGenerationCount();

  if (!state.isChecked) {
    changeScore(-1);
  }

  if (state.generationCount > 50) {
    showWinnerScreen();
    return;
  }

  setRandomTime();

  resetAnswerTime();
  clearAnswerResult();
  setCheckedMode(false);
  renderHands();
  hideDigitalTime();
});

claimPrizeButton.addEventListener("click", () => {
  if (claimPrizeButton.disabled) {
    return;
  }

  showWinnerScreen();
});

answerButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (state.isChecked) {
      return;
    }

    changeAnswerDigit(button.dataset.answerStep, Number(button.dataset.direction));
  });
});

clockChallengeButton.addEventListener("click", () => {
  startScreen.classList.add("app-hidden");
  multiplicationScreen.classList.add("app-hidden");
  app.classList.remove("app-hidden");
});

multiplicationButton.addEventListener("click", () => {
  startScreen.classList.add("app-hidden");
  app.classList.add("app-hidden");
  winnerScreen.classList.add("app-hidden");
  multiplicationScreen.classList.remove("app-hidden");
});

homeButtons.forEach((button) => {
  button.addEventListener("click", showStartScreen);
});

createMinuteMarks();
setRandomTime();
renderAnswerTime();
renderHands();
