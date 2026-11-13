// האפליקציה תמיד כהה. גודל טקסט נשמר – לפני הציור הראשון, בלי הבהוב
  (function () {
    var big = null;
    try { big = localStorage.getItem('tt-big'); } catch (e) {}
    document.documentElement.setAttribute('data-theme', 'dark');
    if (big === '1') document.documentElement.classList.add('big-text');
  })();
