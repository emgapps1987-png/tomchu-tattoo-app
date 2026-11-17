// האפליקציה תמיד כהה. גודל טקסט נשמר – לפני הציור הראשון, בלי הבהוב
  (function () {
    var big = null;
    try { big = localStorage.getItem('tt-big'); } catch (e) {}
    document.documentElement.setAttribute('data-theme', 'dark');
    if (big === '1') document.documentElement.classList.add('big-text');
    // הפתיחה מוצגת כבר מהציור הראשון (ממשיכה את מסך הפתיחה של אנדרואיד) – אלא אם כבר נראתה או שהתנועה מצומצמת
    var seen = false;
    try { seen = sessionStorage.getItem('tt-intro') === '1'; } catch (e) {}
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (seen || reduce) document.documentElement.classList.add('no-intro');
  })();
