function createMultiplicationChallenge({ onNavigateHome }) {
  const screen = document.querySelector("#multiplicationScreen");
  const homeButtons = screen.querySelectorAll("[data-multiplication-home-button]");

  function hide() {
    screen.classList.add("app-hidden");
  }

  function show() {
    screen.classList.remove("app-hidden");
  }

  homeButtons.forEach((button) => {
    button.addEventListener("click", onNavigateHome);
  });

  return {
    hide,
    show,
  };
}
