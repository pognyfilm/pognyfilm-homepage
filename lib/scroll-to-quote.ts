export const QUOTE_HASH = "#quote";

export function scrollToQuote() {
  const quote = document.getElementById("quote");
  if (!quote) return false;

  if (window.location.hash !== QUOTE_HASH) {
    window.history.pushState(null, "", QUOTE_HASH);
  }
  quote.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}
