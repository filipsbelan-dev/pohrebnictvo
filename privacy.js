(function () {
  'use strict';

  const key = 'florena-cookie-consent';
  const version = 1;
  const lifetime = 180 * 24 * 60 * 60 * 1000;
  let returnFocus = null;
  let expiryTimer;

  function readConsent() {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      if (value && value.version === version && typeof value.maps === 'boolean' &&
          Number.isFinite(value.savedAt) && value.savedAt <= Date.now() &&
          Date.now() - value.savedAt < lifetime) return value;
    } catch (_) { /* Storage may be disabled. Optional content stays blocked. */ }
    return null;
  }

  let consent = readConsent();
  const banner = document.createElement('section');
  banner.className = 'cookie-banner';
  banner.setAttribute('aria-labelledby', 'cookie-title');
  banner.innerHTML = `
    <div class="cookie-copy">
      <h2 id="cookie-title" tabindex="-1">Vaše súkromie a cookies</h2>
      <p>Voliteľnú Google mapu načítame len s Vaším súhlasom. Google pritom môže spracúvať Vašu IP adresu a používať cookies. Bez súhlasu môžete web používať aj naďalej. Nepoužívame analytické ani reklamné nástroje.</p>
      <p>Vašu voľbu si zapamätáme na 180 dní. <a href="gdpr.html">Ochrana osobných údajov (GDPR)</a> · <a href="cookies.html">Informácie o cookies</a></p>
    </div>
    <div class="cookie-actions">
      <button type="button" class="privacy-button" data-choice="reject">Iba nevyhnutné</button>
      <button type="button" class="privacy-button" data-choice="accept">Prijať všetky</button>
      <button type="button" class="privacy-button privacy-button--text" data-settings aria-expanded="false" aria-controls="cookie-details">Nastavenia</button>
    </div>
    <div id="cookie-details" class="cookie-details" hidden>
      <p><strong>Nevyhnutné uloženie voľby — vždy aktívne.</strong> V úložisku prehliadača uchovávame len Vaše nastavenie súhlasu a dátum jeho uloženia.</p>
      <label class="cookie-option"><input type="checkbox" id="cookie-maps"> <span><strong>Externá mapa Google Maps</strong><br>Umožní zobraziť mapu na stránke Kontakt. Poskytovateľ: Google Ireland Limited. Údaje môžu byť spracúvané aj mimo EHP. <a href="https://policies.google.com/privacy">Ochrana súkromia Google</a>.</span></label>
      <button type="button" class="privacy-button" data-choice="save">Uložiť nastavenia</button>
    </div>`;
  document.body.appendChild(banner);
  const details = banner.querySelector('#cookie-details');
  const checkbox = banner.querySelector('#cookie-maps');
  const settingsButton = banner.querySelector('[data-settings]');

  function setDetails(open) {
    details.hidden = !open;
    settingsButton.setAttribute('aria-expanded', String(open));
  }

  function updateMaps() {
    document.querySelectorAll('[data-map-container]').forEach(function (container) {
      const placeholder = container.querySelector('[data-map-placeholder]');
      const existing = container.querySelector('iframe');
      const allowed = !!(consent && consent.maps);
      placeholder.hidden = allowed;
      if (allowed && !existing) {
        const frame = document.createElement('iframe');
        frame.title = 'Mapa – Pohrebná služba Handlová';
        frame.loading = 'lazy';
        frame.referrerPolicy = 'no-referrer';
        frame.allowFullscreen = true;
        frame.src = container.dataset.mapSrc;
        container.appendChild(frame);
      } else if (!allowed && existing) {
        existing.remove();
      }
    });
  }

  function refresh() {
    banner.hidden = !!consent;
    checkbox.checked = !!(consent && consent.maps);
    updateMaps();
    clearTimeout(expiryTimer);
    // Timer delays are capped to avoid the browser's signed 32-bit overflow.
    if (consent) expiryTimer = setTimeout(function () {
      consent = readConsent();
      refresh();
    }, Math.min(Math.max(1, consent.savedAt + lifetime - Date.now()), 2147483647));
  }

  function openSettings(event) {
    returnFocus = event.currentTarget;
    checkbox.checked = !!(consent && consent.maps);
    banner.hidden = false;
    setDetails(true);
    banner.querySelector('#cookie-title').focus();
  }

  document.querySelectorAll('[data-cookie-settings]').forEach(function (button) {
    button.hidden = false;
    button.addEventListener('click', openSettings);
  });
  settingsButton.addEventListener('click', function () { setDetails(details.hidden); });
  banner.querySelectorAll('[data-choice]').forEach(function (button) {
    button.addEventListener('click', function () {
      consent = { version: version, maps: button.dataset.choice === 'save' ? checkbox.checked : button.dataset.choice === 'accept', savedAt: Date.now() };
      try { localStorage.setItem(key, JSON.stringify(consent)); } catch (_) { /* Apply the choice for this page even without storage. */ }
      refresh();
      setDetails(false);
      // A map placeholder can disappear after acceptance; use the persistent footer control instead.
      const target = returnFocus && !returnFocus.closest('[hidden]') ? returnFocus : document.querySelector('#footer [data-cookie-settings]');
      if (target) target.focus({ preventScroll: true });
      returnFocus = null;
    });
  });
  window.addEventListener('storage', function (event) {
    if (event.key === key || event.key === null) { consent = readConsent(); refresh(); }
  });
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) { consent = readConsent(); refresh(); }
  });
  refresh();
}());
