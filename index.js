const clock = document.querySelector("#clock");
const minuteMarks = document.querySelector("#minuteMarks");
const hourHand = document.querySelector("#hourHand");
const minuteHand = document.querySelector("#minuteHand");
const showTimeButton = document.querySelector("#showTimeButton");
const digitalTime = document.querySelector("#digitalTime");

const state = {
  hour: 10,
  minute: 10,
  activeHand: null,
  previousMinute: null,
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
  digitalTime.textContent = `${pad(displayHour())}:${pad(state.minute)}`;
  digitalTime.classList.remove("hidden");
});

createMinuteMarks();
renderHands();
