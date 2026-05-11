function createClockChallenge({ onNavigateHome, onStateChange = () => {} }) {
  const screen = document.querySelector("#clockChallengeScreen");
  const resultScreen = document.querySelector("#clockResultScreen");
  const minuteMarks = document.querySelector("#minuteMarks");
  const hourHand = document.querySelector("#hourHand");
  const minuteHand = document.querySelector("#minuteHand");
  const showTimeButton = document.querySelector("#showTimeButton");
  const randomTimeButton = document.querySelector("#randomTimeButton");
  const claimPrizeButton = document.querySelector("#claimPrizeButton");
  const finishConfirmModal = document.querySelector("#clockFinishConfirmModal");
  const confirmFinishButton = document.querySelector("#confirmFinishButton");
  const cancelFinishButton = document.querySelector("#cancelFinishButton");
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
  let currentView = "challenge";

  function resetState() {
    state.hour = 10;
    state.minute = 10;
    state.answerHour = 1;
    state.answerMinute = 0;
    state.isChecked = false;
    state.score = 0;
    state.generationCount = 1;
    currentView = "challenge";
    setRandomTime();
    renderScore();
    renderAnswerTime();
    clearAnswerResult();
    setCheckedMode(false);
    renderHands();
    hideDigitalTime();
  }

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
    claimPrizeButton.disabled = state.score < 30;
  }

  function hide() {
    screen.classList.add("app-hidden");
    resultScreen.classList.add("app-hidden");
    closeFinishConfirmModal();
  }

  function show() {
    if (currentView === "result") {
      screen.classList.add("app-hidden");
      resultScreen.classList.remove("app-hidden");
      return;
    }

    resultScreen.classList.add("app-hidden");
    screen.classList.remove("app-hidden");
  }

  function showResult() {
    currentView = "result";
    closeFinishConfirmModal();
    winnerGenerationCount.textContent = state.generationCount;
    winnerScore.textContent = state.score;
    screen.classList.add("app-hidden");
    resultScreen.classList.remove("app-hidden");
    notifyStateChange();
  }

  function notifyStateChange() {
    onStateChange();
  }

  function openFinishConfirmModal() {
    finishConfirmModal.classList.remove("app-hidden");
    confirmFinishButton.focus();
  }

  function closeFinishConfirmModal() {
    finishConfirmModal.classList.add("app-hidden");
  }

  function getState() {
    return {
      ...state,
      currentView,
    };
  }

  function restoreNumber(value, fallback, min, max) {
    if (!Number.isInteger(value)) {
      return fallback;
    }

    return Math.min(max, Math.max(min, value));
  }

  function renderScore() {
    scoreValue.textContent = state.score;
    generationCountValue.textContent = state.generationCount;
    updateClaimPrizeButton();
  }

  function renderCheckedState() {
    if (!state.isChecked) {
      clearAnswerResult();
      hideDigitalTime();
      setCheckedMode(false);
      return;
    }

    const isCorrect = answerHourValue() === state.hour && state.answerMinute === state.minute;
    digitalTime.textContent = `${pad(displayHour())}:${pad(state.minute)}`;
    digitalTime.classList.remove("hidden");
    renderAnswerResult(isCorrect);
    setCheckedMode(true);
  }

  function checkCurrentAnswer() {
    const isCorrect = answerHourValue() === state.hour && state.answerMinute === state.minute;

    digitalTime.textContent = `${pad(displayHour())}:${pad(state.minute)}`;
    digitalTime.classList.remove("hidden");

    renderAnswerResult(isCorrect);
    changeScore(isCorrect ? 2 : -1);
    setCheckedMode(true);
  }

  function setState(nextState) {
    if (!nextState || typeof nextState !== "object") {
      return;
    }

    state.hour = restoreNumber(nextState.hour, state.hour, 0, 11);
    state.minute = restoreNumber(nextState.minute, state.minute, 0, 59);
    state.answerHour = restoreNumber(nextState.answerHour, state.answerHour, 1, 12);
    state.answerMinute = restoreNumber(nextState.answerMinute, state.answerMinute, 0, 59);
    state.score = restoreNumber(nextState.score, state.score, 0, 999);
    state.generationCount = restoreNumber(nextState.generationCount, state.generationCount, 1, 999);
    state.isChecked = Boolean(nextState.isChecked);
    currentView = nextState.currentView === "result" ? "result" : "challenge";

    renderScore();
    renderAnswerTime();
    renderHands();
    renderCheckedState();

    if (currentView === "result") {
      showResult();
    }
  }

  function changeScore(delta) {
    state.score = Math.max(0, state.score + delta);
    renderScore();

    if (state.score > 60) {
      showResult();
    }
  }

  function increaseGenerationCount() {
    state.generationCount += 1;
    renderScore();
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
    notifyStateChange();
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
    checkCurrentAnswer();
    notifyStateChange();
  });

  randomTimeButton.addEventListener("click", () => {
    increaseGenerationCount();

    if (!state.isChecked) {
      checkCurrentAnswer();
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
    notifyStateChange();
  });

  claimPrizeButton.addEventListener("click", () => {
    if (claimPrizeButton.disabled) {
      return;
    }

    openFinishConfirmModal();
  });

  confirmFinishButton.addEventListener("click", () => {
    showResult();
  });

  cancelFinishButton.addEventListener("click", () => {
    closeFinishConfirmModal();
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
  renderScore();

  return {
    getState,
    hide,
    reset: resetState,
    setState,
    show,
  };
}
