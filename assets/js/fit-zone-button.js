class FitZoneButton extends HTMLElement {
  connectedCallback() {
    const href = this.getAttribute("href") || "./fit/index.html";
    const label = this.getAttribute("label") || "Strefa Fit";
    const subtitle = this.getAttribute("subtitle") || "Plany treningowe";

    this.innerHTML = `
      <a class="fit-zone-button" href="${href}" aria-label="${label}. ${subtitle}">
        <span class="fit-zone-button__rail" aria-hidden="true"></span>
        <span class="fit-zone-button__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M6.5 9.25v5.5M17.5 9.25v5.5M4 11v2M20 11v2M8.75 12h6.5" />
          </svg>
        </span>
        <span class="fit-zone-button__copy">
          <span class="fit-zone-button__kicker">Nowa przestrzeń</span>
          <strong>${label}</strong>
          <span>${subtitle}</span>
        </span>
        <span class="fit-zone-button__arrow" aria-hidden="true">
          <span>Wejdź</span>
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M5 12h13M13 6l6 6-6 6" />
          </svg>
        </span>
      </a>
    `;
  }
}

customElements.define("fit-zone-button", FitZoneButton);
