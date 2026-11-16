let declineTimer;
let preferencesOpen = false;
let posthogStarted = false;

// CookieConsent also dismisses preferences on Escape or a backdrop click.
document.addEventListener('keydown', event => {
  if (preferencesOpen && event.key === 'Escape') {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}, true);
document.addEventListener('click', event => {
  if (preferencesOpen && event.target.matches?.('#cc-main .pm-overlay')) {
    event.stopPropagation();
  }
}, true);

function startDeclineTimer() {
  clearTimeout(declineTimer);
  if (CookieConsent.validConsent()) return;
  const seconds = document.querySelector('#cookie-countdown');
  const banner = seconds.closest('.cm');
  const duration = 10000;
  const deadline = performance.now() + duration;
  banner.style.setProperty('--countdown-duration', duration + 'ms');
  function tick() {
    if (CookieConsent.validConsent()) return;
    const remaining = Math.max(0, deadline - performance.now());
    const label = String(Math.ceil(remaining / 1000));
    if (seconds.textContent !== label) seconds.textContent = label;
    if (remaining > 0) {
      declineTimer = setTimeout(tick, remaining % 1000 || 1000);
    } else {
      CookieConsent.acceptCategory([]);
      CookieConsent.hide();
    }
  }
  tick();
}

function syncAnalyticsConsent(client) {
  if (!client?.__loaded || typeof client.get_explicit_consent_status !== 'function') return;

  const status = client.get_explicit_consent_status();
  if (CookieConsent.acceptedCategory('analytics')) {
    if (status !== 'granted') client.opt_in_capturing();
  } else if (status !== 'denied') {
    client.opt_out_capturing();
  }
}

function applyCookieDecision() {
  clearTimeout(declineTimer);
  const client = window.posthog;
  if (posthogStarted || !client?.init) {
    syncAnalyticsConsent(client);
    return;
  }
  posthogStarted = true;
  client.init('phc_BhPq9xmjSXA9ra3FXXxfmoii9XegwiAgGhUJzWMkgGoV', {
    api_host: 'https://eu.i.posthog.com',
    defaults: '2026-05-30',
    person_profiles: 'identified_only',
    cookieless_mode: 'on_reject',
    loaded: syncAnalyticsConsent
  });
}

CookieConsent.run({
  revision: 2,
  cookie: { expiresAfterDays: 182 },
  categories: {
    necessary: { enabled: true, readOnly: true },
    analytics: {}
  },
  onModalShow: ({ modalName }) => {
    if (modalName === 'consentModal') startDeclineTimer();
    else {
      preferencesOpen = true;
      clearTimeout(declineTimer);
      document.querySelector('#cc-main .cm')?.style.setProperty('--countdown-play-state', 'paused');
    }
  },
  onModalHide: ({ modalName }) => {
    if (modalName === 'preferencesModal') preferencesOpen = false;
    clearTimeout(declineTimer);
  },
  onConsent: applyCookieDecision,
  onChange: applyCookieDecision,
  language: {
    default: 'en',
    translations: {
      en: {
        consentModal: {
          title: 'Cookies on Animart',
          description: 'May I use analytics cookies to recognise return visits? Continuing without analytics cookies in <span id="cookie-countdown" role="timer" aria-live="off">10</span> s.',
          acceptAllBtn: 'Allow analytics cookies',
          acceptNecessaryBtn: 'Continue without analytics cookies',
          showPreferencesBtn: 'Cookie settings'
        },
        preferencesModal: {
          title: 'Cookie settings',
          closeIconLabel: 'Close cookie settings',
          savePreferencesBtn: 'Save settings',
          sections: [{
            title: 'Remembering your choice',
            description: 'Animart saves your settings for 182 days in a cookie named cc_cookie.',
            linkedCategory: 'necessary'
          }, {
            title: 'Analytics cookies',
            description: 'PostHog measures visits, gallery search terms, filter choices and download requests. Allow analytics cookies to link activity across visits. With this setting off, measurement continues in cookieless mode. Analytics data goes to PostHog’s EU servers.',
            linkedCategory: 'analytics'
          }]
        }
      }
    }
  }
}).then(() => {
  document.getElementById('cookie-settings').hidden = false;
});
