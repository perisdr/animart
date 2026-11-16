CookieConsent.run({
  revision: 1,
  cookie: { expiresAfterDays: 182 },
  categories: {
    necessary: { enabled: true, readOnly: true }
  },
  language: {
    default: 'en',
    translations: {
      en: {
        consentModal: {
          title: 'Cookies on Animart',
          description: 'Animart uses one cookie to remember that you’ve seen this notice. The gallery uses no analytics or advertising cookies.',
          acceptNecessaryBtn: 'Got it',
          showPreferencesBtn: 'Cookie settings'
        },
        preferencesModal: {
          title: 'Cookie settings',
          closeIconLabel: 'Close cookie settings',
          savePreferencesBtn: 'Save settings',
          sections: [{
            title: 'Remembering this notice',
            description: 'Animart saves your settings for 182 days in a cookie named cc_cookie.',
            linkedCategory: 'necessary'
          }]
        }
      }
    }
  }
}).then(() => {
  document.getElementById('cookie-settings').hidden = false;
});
