const themeKey = "portfolio-theme";
const root = document.documentElement;
const button = document.querySelector<HTMLButtonElement>("[data-theme-toggle]");

function currentTheme(): "dark" | "light" {
  return root.dataset.theme === "light" ? "light" : "dark";
}

function applyTheme(theme: "dark" | "light") {
  root.dataset.theme = theme;
  button?.setAttribute("aria-pressed", String(theme === "light"));
}

applyTheme(currentTheme());

button?.addEventListener("click", () => {
  const nextTheme = currentTheme() === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  localStorage.setItem(themeKey, nextTheme);
});
