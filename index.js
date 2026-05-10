const clock = document.querySelector("#clock");
const minuteMarks = document.querySelector("#minuteMarks");
const hourHand = document.querySelector("#hourHand");
const minuteHand = document.querySelector("#minuteHand");
const showTimeButton = document.querySelector("#showTimeButton");
const randomTimeButton = document.querySelector("#randomTimeButton");
const digitalTime = document.querySelector("#digitalTime");
const answerResult = document.querySelector("#answerResult");
const scoreValue = document.querySelector("#scoreValue");
const generationCountValue = document.querySelector("#generationCountValue");
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
  activeHand: null,
  previousMinute: null,
  answerHour: 0,
  answerMinute: 0,
  isChecked: false,
  score: 0,
  generationCount: 1,
  wasLastAnswerCorrect: false,
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

function changeScore(delta) {
  state.score = Math.max(0, state.score + delta);
  scoreValue.textContent = state.score;
}

function increaseGenerationCount() {
  state.generationCount += 1;
  generationCountValue.textContent = state.generationCount;
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

function normalizeDegrees(degrees) {
  return ((degrees % 360) + 360) % 360;
}

function pointerDegrees(event) {
  const rect = clock.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const radians = Math.atan2(event.clientY - centerY, event.clientX - centerX);

  return normalizeDegrees((radians * 180) / Math.PI + 90);
}

function pointerMinute(event) {
  return Math.round(pointerDegrees(event) / 6) % 60;
}

function setTimeFromHourPointer(event) {
  const totalMinutes = Math.round(pointerDegrees(event) * 2) % 720;

  state.hour = Math.floor(totalMinutes / 60) % 12;
  state.minute = totalMinutes % 60;
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

function setTimeFromPointer(event) {
  if (state.activeHand === "minute") {
    const nextMinute = pointerMinute(event);

    if (state.previousMinute !== null) {
      const rawMinuteDelta = nextMinute - state.previousMinute;

      if (rawMinuteDelta < -30) {
        state.hour = (state.hour + 1) % 12;
      }

      if (rawMinuteDelta > 30) {
        state.hour = (state.hour + 11) % 12;
      }
    }

    state.minute = nextMinute;
    state.previousMinute = nextMinute;
  }

  if (state.activeHand === "hour") {
    setTimeFromHourPointer(event);
  }

  renderHands();
  hideDigitalTime();
}

function startDrag(hand, event) {
  if (state.isChecked) {
    return;
  }

  state.activeHand = hand;
  state.previousMinute = hand === "minute" ? state.minute : null;
  event.currentTarget.setPointerCapture(event.pointerId);
  setTimeFromPointer(event);
}

function stopDrag(event) {
  if (!state.activeHand) {
    return;
  }

  event.currentTarget.releasePointerCapture(event.pointerId);
  state.activeHand = null;
  state.previousMinute = null;
}

hourHand.addEventListener("pointerdown", (event) => startDrag("hour", event));
minuteHand.addEventListener("pointerdown", (event) => startDrag("minute", event));

hourHand.addEventListener("pointermove", (event) => {
  if (state.activeHand === "hour") {
    setTimeFromPointer(event);
  }
});

minuteHand.addEventListener("pointermove", (event) => {
  if (state.activeHand === "minute") {
    setTimeFromPointer(event);
  }
});

hourHand.addEventListener("pointerup", stopDrag);
minuteHand.addEventListener("pointerup", stopDrag);
hourHand.addEventListener("pointercancel", stopDrag);
minuteHand.addEventListener("pointercancel", stopDrag);

showTimeButton.addEventListener("click", () => {
  const isCorrect = state.answerHour === state.hour && state.answerMinute === state.minute;

  digitalTime.textContent = `${pad(displayHour())}:${pad(state.minute)}`;
  digitalTime.classList.remove("hidden");

  renderAnswerResult(isCorrect);
  changeScore(isCorrect ? 1 : -1);
  state.wasLastAnswerCorrect = isCorrect;
  setCheckedMode(true);
});

randomTimeButton.addEventListener("click", () => {
  increaseGenerationCount();

  if (!state.wasLastAnswerCorrect) {
    changeScore(-1);
  }

  state.hour = randomInteger(12);
  state.minute = randomInteger(60);
  state.activeHand = null;
  state.previousMinute = null;
  state.wasLastAnswerCorrect = false;

  resetAnswerTime();
  clearAnswerResult();
  setCheckedMode(false);
  renderHands();
  hideDigitalTime();
});

answerButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (state.isChecked) {
      return;
    }

    changeAnswerDigit(button.dataset.answerStep, Number(button.dataset.direction));
  });
});

createMinuteMarks();
renderAnswerTime();
renderHands();
