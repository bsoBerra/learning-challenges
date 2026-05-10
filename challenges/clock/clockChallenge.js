function createClockChallenge({ onNavigateHome }) {
  const screen = document.querySelector("#clockChallengeScreen");
  const resultScreen = document.querySelector("#clockResultScreen");
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
  const winnerGenerationCount = document.querySelector("#winnerGenerationCount");
  const winnerScore = document.querySelector("#winnerScore");
  const homeButtons = document.querySelectorAll("[data-clock-home-button]");
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
    answerHour: 1,
    answerMinute: 0,
    isChecked: false,
    score: 0,
    generationCount: 1,
  };

  function createMinuteMarks() {
    for (let minute = 0; minute < 60; minute += 1) {
      const mark = document.createElement("span");
      mark.className = minute % 5 === 0 ? "minute-mark hour-mark" : "minute-mark";
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

  function hide() {
    screen.classList.add("app-hidden");
    resultScreen.classList.add("app-hidden");
  }

  function show() {
    resultScreen.classList.add("app-hidden");
    screen.classList.remove("app-hidden");
  }

  function showResult() {
    winnerGenerationCount.textContent = state.generationCount;
    winnerScore.textContent = state.score;
    screen.classList.add("app-hidden");
    resultScreen.classList.remove("app-hidden");
  }

  function changeScore(delta) {
    state.score = Math.max(0, state.score + delta);
    scoreValue.textContent = state.score;
    updateClaimPrizeButton();

    if (state.score > 60) {
      showResult();
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
    state.answerHour = 1;
    state.answerMinute = 0;
    renderAnswerTime();
  }

  function setAnswerHour(hour) {
    state.answerHour = ((hour - 1) % 12 + 12) % 12 + 1;
  }

  function answerHourValue() {
    return state.answerHour === 12 ? 0 : state.answerHour;
  }

  function changeAnswerDigit(step, direction) {
    const hourTens = Math.floor(state.answerHour / 10);
    const hourOnes = state.answerHour % 10;
    const minuteTens = Math.floor(state.answerMinute / 10);
    const minuteOnes = state.answerMinute % 10;

    if (step === "hourTens") {
      const nextHourTens = wrap(hourTens + direction, 2);
      const nextHourOnes = nextHourTens === 0 ? Math.max(1, hourOnes) : Math.min(hourOnes, 2);
      setAnswerHour(nextHourTens * 10 + nextHourOnes);
    }

    if (step === "hourOnes") {
      const minHourOnes = hourTens === 0 ? 1 : 0;
      const maxHourOnes = hourTens === 1 ? 2 : 9;
      const nextHourOnes = wrap(hourOnes - minHourOnes + direction, maxHourOnes - minHourOnes + 1) + minHourOnes;
      setAnswerHour(hourTens * 10 + nextHourOnes);
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
    const isCorrect = answerHourValue() === state.hour && state.answerMinute === state.minute;

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
      showResult();
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

    showResult();
  });

  answerButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (state.isChecked) {
        return;
      }

      changeAnswerDigit(button.dataset.answerStep, Number(button.dataset.direction));
    });
  });

  homeButtons.forEach((button) => {
    button.addEventListener("click", onNavigateHome);
  });

  createMinuteMarks();
  setRandomTime();
  renderAnswerTime();
  renderHands();

  return {
    hide,
    show,
  };
}
