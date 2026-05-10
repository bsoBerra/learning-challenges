const challengeListScreen = document.querySelector("#startScreen");
const clockChallengeButton = document.querySelector("#clockChallengeButton");
const multiplicationButton = document.querySelector("#multiplicationButton");

let clockChallenge;
let multiplicationChallenge;

function hideChallengeListScreen() {
  challengeListScreen.classList.add("app-hidden");
}

function showChallengeListScreen() {
  clockChallenge.hide();
  multiplicationChallenge.hide();
  challengeListScreen.classList.remove("app-hidden");
}

function showClockChallenge() {
  hideChallengeListScreen();
  multiplicationChallenge.hide();
  clockChallenge.show();
}

function showMultiplicationChallenge() {
  hideChallengeListScreen();
  clockChallenge.hide();
  multiplicationChallenge.show();
}

clockChallenge = createClockChallenge({
  onNavigateHome: showChallengeListScreen,
});

multiplicationChallenge = createMultiplicationChallenge({
  onNavigateHome: showChallengeListScreen,
});

clockChallengeButton.addEventListener("click", showClockChallenge);
multiplicationButton.addEventListener("click", showMultiplicationChallenge);
