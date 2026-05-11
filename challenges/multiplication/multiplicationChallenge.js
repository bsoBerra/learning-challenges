function createMultiplicationChallenge({ onNavigateHome, onStateChange = () => {} }) {
  const screen = document.querySelector("#multiplicationScreen");
  const resultScreen = document.querySelector("#multiplicationResultScreen");
  const setup = document.querySelector("#multiplicationSetup");
  const challenge = document.querySelector("#multiplicationChallenge");
  const factorTiles = screen.querySelectorAll("[data-factor-tile]");
  const startButton = document.querySelector("#startMultiplicationButton");
  const firstFactorValue = document.querySelector("#multiplicationFirstFactor");
  const secondFactorValue = document.querySelector("#multiplicationSecondFactor");
  const answerInput = document.querySelector("#multiplicationAnswerInput");
  const checkButton = document.querySelector("#checkMultiplicationButton");
  const nextButton = document.querySelector("#nextMultiplicationButton");
  const finishButton = document.querySelector("#finishMultiplicationButton");
  const finishConfirmModal = document.querySelector("#multiplicationFinishConfirmModal");
  const confirmFinishButton = document.querySelector("#confirmMultiplicationFinishButton");
  const cancelFinishButton = document.querySelector("#cancelMultiplicationFinishButton");
  const answerResult = document.querySelector("#multiplicationAnswerResult");
  const correctAnswer = document.querySelector("#multiplicationCorrectAnswer");
  const scoreValue = document.querySelector("#multiplicationScoreValue");
  const generationCountValue = document.querySelector("#multiplicationGenerationCountValue");
  const selectedFactorsValue = document.querySelector("#multiplicationSelectedFactors");
  const winnerSelectedFactorsValue = document.querySelector("#multiplicationWinnerSelectedFactors");
  const winnerGenerationCount = document.querySelector("#multiplicationWinnerGenerationCount");
  const winnerScore = document.querySelector("#multiplicationWinnerScore");
  const homeButtons = document.querySelectorAll("[data-multiplication-home-button]");

  const state = {
    selectedFactors: [],
    usedExamples: [],
    firstFactor: 2,
    secondFactor: 2,
    answer: "",
    isStarted: false,
    isChecked: false,
    score: 0,
    generationCount: 1,
  };
  let currentView = "challenge";

  function notifyStateChange() {
    onStateChange();
  }

  function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function exampleKey(firstFactor, secondFactor) {
    return `${firstFactor}x${secondFactor}`;
  }

  function possibleExamples() {
    return state.selectedFactors.flatMap((firstFactor) => {
      return Array.from({ length: 8 }, (_, index) => ({
        firstFactor,
        secondFactor: index + 2,
        key: exampleKey(firstFactor, index + 2),
      }));
    });
  }

  function setRandomExample() {
    if (state.selectedFactors.length === 0) {
      state.firstFactor = 2;
      state.secondFactor = 2;
      return;
    }

    const examples = possibleExamples();
    let availableExamples = examples.filter((example) => !state.usedExamples.includes(example.key));

    if (availableExamples.length === 0) {
      state.usedExamples = [];
      availableExamples = examples;
    }

    const nextExample = availableExamples[randomInteger(0, availableExamples.length - 1)];

    state.firstFactor = nextExample.firstFactor;
    state.secondFactor = nextExample.secondFactor;
    state.usedExamples.push(nextExample.key);
  }

  function rightAnswer() {
    return state.firstFactor * state.secondFactor;
  }

  function parsedAnswer() {
    if (state.answer.trim() === "") {
      return Number.NaN;
    }

    return Number(state.answer);
  }

  function isCurrentAnswerCorrect() {
    return parsedAnswer() === rightAnswer();
  }

  function updateFinishButton() {
    finishButton.disabled = state.score < 30;
  }

  function renderSelectedFactors() {
    factorTiles.forEach((tile) => {
      const value = Number(tile.dataset.factorTile);
      const isSelected = state.selectedFactors.includes(value);

      tile.classList.toggle("selected", isSelected);
      tile.setAttribute("aria-pressed", String(isSelected));
    });

    startButton.disabled = state.selectedFactors.length === 0;
    renderSelectedFactorsList(selectedFactorsValue);
    renderSelectedFactorsList(winnerSelectedFactorsValue);
  }

  function renderSelectedFactorsList(container) {
    container.replaceChildren();

    state.selectedFactors.forEach((factor) => {
      const item = document.createElement("span");
      item.className = "selected-factor-chip";
      item.textContent = factor;
      container.append(item);
    });
  }

  function renderScore() {
    scoreValue.textContent = state.score;
    generationCountValue.textContent = state.generationCount;
    updateFinishButton();
  }

  function renderExample() {
    firstFactorValue.textContent = state.firstFactor;
    secondFactorValue.textContent = state.secondFactor;
    answerInput.value = state.answer;
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

  function hideCorrectAnswer() {
    correctAnswer.classList.add("hidden");
  }

  function renderCheckedState() {
    if (!state.isChecked) {
      clearAnswerResult();
      hideCorrectAnswer();
      setCheckedMode(false);
      return;
    }

    const isCorrect = isCurrentAnswerCorrect();
    correctAnswer.textContent = rightAnswer();
    correctAnswer.classList.remove("hidden");
    renderAnswerResult(isCorrect);
    setCheckedMode(true);
  }

  function setCheckedMode(isChecked) {
    state.isChecked = isChecked;
    checkButton.disabled = isChecked;
    answerInput.disabled = isChecked;
  }

  function changeScore(delta) {
    state.score = Math.max(0, state.score + delta);
    renderScore();

    if (state.score > 60) {
      showResult();
    }
  }

  function checkCurrentAnswer() {
    const isCorrect = isCurrentAnswerCorrect();

    correctAnswer.textContent = rightAnswer();
    correctAnswer.classList.remove("hidden");
    renderAnswerResult(isCorrect);
    changeScore(isCorrect ? 2 : -1);
    setCheckedMode(true);
  }

  function increaseGenerationCount() {
    state.generationCount += 1;
    renderScore();
  }

  function showSetup() {
    setup.classList.remove("app-hidden");
    challenge.classList.add("app-hidden");
  }

  function showChallenge() {
    setup.classList.add("app-hidden");
    challenge.classList.remove("app-hidden");
  }

  function openFinishConfirmModal() {
    finishConfirmModal.classList.remove("app-hidden");
    confirmFinishButton.focus();
  }

  function closeFinishConfirmModal() {
    finishConfirmModal.classList.add("app-hidden");
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

    if (state.isStarted) {
      showChallenge();
      answerInput.focus();
    } else {
      showSetup();
    }
  }

  function showResult() {
    currentView = "result";
    closeFinishConfirmModal();
    renderSelectedFactorsList(winnerSelectedFactorsValue);
    winnerGenerationCount.textContent = state.generationCount;
    winnerScore.textContent = state.score;
    screen.classList.add("app-hidden");
    resultScreen.classList.remove("app-hidden");
    notifyStateChange();
  }

  function resetState() {
    state.selectedFactors = [];
    state.usedExamples = [];
    state.firstFactor = 2;
    state.secondFactor = 2;
    state.answer = "";
    state.isStarted = false;
    state.isChecked = false;
    state.score = 0;
    state.generationCount = 1;
    currentView = "challenge";
    closeFinishConfirmModal();
    renderSelectedFactors();
    renderScore();
    renderExample();
    clearAnswerResult();
    hideCorrectAnswer();
    setCheckedMode(false);
    showSetup();
  }

  function getState() {
    return {
      ...state,
      selectedFactors: [...state.selectedFactors],
      usedExamples: [...state.usedExamples],
      currentView,
    };
  }

  function restoreNumber(value, fallback, min, max) {
    if (!Number.isInteger(value)) {
      return fallback;
    }

    return Math.min(max, Math.max(min, value));
  }

  function restoreSelectedFactors(value) {
    if (!Array.isArray(value)) {
      return [];
    }

    return [...new Set(value)]
      .filter((factor) => Number.isInteger(factor) && factor >= 2 && factor <= 10)
      .sort((left, right) => left - right);
  }

  function setState(nextState) {
    if (!nextState || typeof nextState !== "object") {
      return;
    }

    state.selectedFactors = restoreSelectedFactors(nextState.selectedFactors);
    state.usedExamples = Array.isArray(nextState.usedExamples)
      ? nextState.usedExamples.filter((key) => typeof key === "string")
      : [];
    state.firstFactor = restoreNumber(nextState.firstFactor, state.firstFactor, 2, 10);
    state.secondFactor = restoreNumber(nextState.secondFactor, state.secondFactor, 2, 9);
    state.answer = typeof nextState.answer === "string" ? nextState.answer : "";
    state.isStarted = Boolean(nextState.isStarted && state.selectedFactors.length > 0);
    state.isChecked = Boolean(nextState.isChecked);
    state.score = restoreNumber(nextState.score, state.score, 0, 999);
    state.generationCount = restoreNumber(nextState.generationCount, state.generationCount, 1, 999);
    currentView = nextState.currentView === "result" ? "result" : "challenge";

    renderSelectedFactors();
    renderScore();
    renderExample();
    renderCheckedState();

    if (currentView === "result") {
      showResult();
    }
  }

  factorTiles.forEach((tile) => {
    tile.addEventListener("click", () => {
      const value = Number(tile.dataset.factorTile);
      const selectedIndex = state.selectedFactors.indexOf(value);

      if (selectedIndex === -1) {
        state.selectedFactors.push(value);
        state.selectedFactors.sort((left, right) => left - right);
      } else {
        state.selectedFactors.splice(selectedIndex, 1);
      }

      renderSelectedFactors();
      notifyStateChange();
    });
  });

  startButton.addEventListener("click", () => {
    if (state.selectedFactors.length === 0) {
      return;
    }

    state.isStarted = true;
    state.isChecked = false;
    state.usedExamples = [];
    state.score = 0;
    state.generationCount = 1;
    state.answer = "";
    currentView = "challenge";
    setRandomExample();
    renderScore();
    renderExample();
    clearAnswerResult();
    hideCorrectAnswer();
    setCheckedMode(false);
    showChallenge();
    answerInput.focus();
    notifyStateChange();
  });

  answerInput.addEventListener("input", () => {
    state.answer = answerInput.value;
    notifyStateChange();
  });

  checkButton.addEventListener("click", () => {
    checkCurrentAnswer();
    notifyStateChange();
  });

  nextButton.addEventListener("click", () => {
    increaseGenerationCount();

    if (!state.isChecked) {
      checkCurrentAnswer();
    }

    if (state.generationCount > 50) {
      showResult();
      return;
    }

    setRandomExample();
    state.answer = "";
    clearAnswerResult();
    setCheckedMode(false);
    renderExample();
    hideCorrectAnswer();
    answerInput.focus();
    notifyStateChange();
  });

  finishButton.addEventListener("click", () => {
    if (finishButton.disabled) {
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

  homeButtons.forEach((button) => {
    button.addEventListener("click", onNavigateHome);
  });

  renderSelectedFactors();
  renderScore();
  renderExample();

  return {
    getState,
    hide,
    reset: resetState,
    setState,
    show,
  };
}
