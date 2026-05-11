const challengeListScreen = document.querySelector("#startScreen");
const clockChallengeButton = document.querySelector("#clockChallengeButton");
const multiplicationButton = document.querySelector("#multiplicationButton");

let clockChallenge;
let multiplicationChallenge;
let activeScreen = "list";

function encodeUrlState(state) {
  const json = JSON.stringify(state);
  const base64 = btoa(unescape(encodeURIComponent(json)));

  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeUrlState(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const json = decodeURIComponent(escape(atob(paddedBase64)));

  return JSON.parse(json);
}

function getAppState(screen = activeScreen) {
  return {
    screen,
    clock: clockChallenge.getState(),
    multiplication: multiplicationChallenge.getState(),
  };
}

function updateUrlState(screen = activeScreen) {
  const encodedState = encodeUrlState(getAppState(screen));
  history.replaceState(null, "", `#state=${encodedState}`);
}

function readUrlState() {
  const params = new URLSearchParams(location.hash.slice(1));
  const encodedState = params.get("state");

  if (!encodedState) {
    return null;
  }

  try {
    return decodeUrlState(encodedState);
  } catch {
    return null;
  }
}

function hideChallengeListScreen() {
  challengeListScreen.classList.add("app-hidden");
}

function showChallengeListScreen() {
  activeScreen = "list";
  clockChallenge.reset();
  clockChallenge.hide();
  multiplicationChallenge.reset();
  multiplicationChallenge.hide();
  challengeListScreen.classList.remove("app-hidden");
  updateUrlState();
}

function showClockChallenge() {
  activeScreen = "clock";
  hideChallengeListScreen();
  multiplicationChallenge.hide();
  clockChallenge.show();
  updateUrlState();
}

function showMultiplicationChallenge() {
  activeScreen = "multiplication";
  hideChallengeListScreen();
  clockChallenge.hide();
  multiplicationChallenge.show();
  updateUrlState();
}

clockChallenge = createClockChallenge({
  onNavigateHome: showChallengeListScreen,
  onStateChange: () => updateUrlState("clock"),
});

multiplicationChallenge = createMultiplicationChallenge({
  onNavigateHome: showChallengeListScreen,
  onStateChange: () => updateUrlState("multiplication"),
});

clockChallengeButton.addEventListener("click", showClockChallenge);
multiplicationButton.addEventListener("click", showMultiplicationChallenge);

const restoredState = readUrlState();

if (restoredState) {
  clockChallenge.setState(restoredState.clock);
  multiplicationChallenge.setState(restoredState.multiplication);

  if (restoredState.screen === "clock") {
    showClockChallenge();
  } else if (restoredState.screen === "multiplication") {
    showMultiplicationChallenge();
  } else {
    showChallengeListScreen();
  }
} else {
  updateUrlState();
}
