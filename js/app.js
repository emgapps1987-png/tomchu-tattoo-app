import { CONFIG, TAGS, WORKS, FAQ, CARE, QUESTIONS, CONSENTS, ARTICLES } from './content.js';

// ---------------------------------------------------------------------
// עזרים
// ---------------------------------------------------------------------
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* פרטי/חסום – לא נורא */ } }
};
// באפליקציית אנדרואיד (Capacitor) קישורים חיצוניים נפתחים באפליקציה המתאימה (וואטסאפ, Waze, דפדפן)
const isNative = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
const openExternal = (url) => { if (isNative) location.href = url; else window.open(url, '_blank', 'noopener'); };
if (isNative) {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]'); if (!a) return;
    const href = a.getAttribute('href');
    if (/^(https?:|tel:|mailto:)/.test(href)) { e.preventDefault(); location.href = href; }
  });
}
const waLink = (text) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;
const fmtDate = (iso) => { if (!iso) return ''; const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}`; };
const nowStamp = () => new Date().toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' });
const todayIso = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const ageFrom = (iso) => {
  if (!iso) return null; const b = new Date(iso); if (isNaN(b)) return null;
  const t = new Date(); let a = t.getFullYear() - b.getFullYear();
  if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--;
  return a;
};
const validIsraeliId = (v) => {
  const id = String(v || '').replace(/\D/g, '');
  if (id.length < 5 || id.length > 9) return false;
  const p = id.padStart(9, '0'); let sum = 0;
  for (let i = 0; i < 9; i++) { let d = Number(p[i]) * ((i % 2) + 1); sum += d > 9 ? d - 9 : d; }
  return sum % 10 === 0;
};
const validPhone = (v) => /^(?:0|\+?972-?)5\d-?\d{3}-?\d{4}$|^0\d{1,2}-?\d{7}$/.test(String(v || '').replace(/\s/g, ''));
const announce = (msg) => { const l = $('#live'); l.textContent = ''; setTimeout(() => { l.textContent = msg; }, 50); };
// צבעי היונק (רמה 2)
const FEATHER = [
  { c: '#D41A5E', soft: '#3A1527', light: '#FFB3CE' },
  { c: '#5B4BC4', soft: '#221F45', light: '#C9C2FF' },
  { c: '#1D93B5', soft: '#0E2C38', light: '#9EDDF0' },
  { c: '#22A55B', soft: '#10301F', light: '#9FE8BE' }
];
const icon = {
  back: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>',
  fwd: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>',
  chev: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>',
  pen: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 20l1.5-4.5L16 5a2.1 2.1 0 013 3L8.5 18.5z"/></svg>',
  heart: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 21s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 11c0 5.6-7 10-7 10z"/><path d="M9.5 12h5M12 9.5v5"/></svg>',
  warn: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3l9.5 17h-19z"/><path d="M12 10v4M12 17.5v.01"/></svg>',
  check: '<svg aria-hidden="true" viewBox="0 0 24 24" style="width:40px;height:40px"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
};

// ---------------------------------------------------------------------
// מצב (בזיכרון בלבד – שום מידע אישי לא נשמר בדפדפן)
// ---------------------------------------------------------------------
const state = {
  galf: 'all',
  contact: {},           // טיוטת פנייה
  health: { step: 1 },   // טיוטת הצהרה
  sigData: null,         // חתימה (dataURL)
  lastContactText: '',
  lastHealth: null
};

// ---------------------------------------------------------------------
// מסכים
// ---------------------------------------------------------------------
const views = {};

views.home = () => `
<section class="screen" aria-labelledby="h">
  <div class="hero">
    <img class="logo-dark" src="assets/img/logo-dark.png" alt="הלוגו של Tomchu Tattoo – יונק דבש צבעוני">
    <span class="feathers" aria-hidden="true"><span style="background:#22A55B"></span><span style="background:#1D93B5"></span><span style="background:#5B4BC4"></span><span style="background:#D41A5E"></span></span>
    <div class="stack">
      <h1 id="h">סטודיו לקעקועים עם נשמה</h1>
      <p class="muted">Fine Line, ריאליזם ורעיונות משוגעים – בסטודיו שקט ואינטימי באלפי מנשה.</p>
    </div>
  </div>

  <a class="meet" href="#/about">
    <img src="assets/img/tom-studio.jpg" alt="">
    <span class="stack" style="gap:2px;flex:1">
      <span style="font-family:Rubik,sans-serif;font-weight:700;font-size:1.1rem">היי, אני תום</span>
      <span class="muted" style="font-size:.9rem">אמנית, אמא, ומקעקעת עם נשמה</span>
      <span style="color:#7FE3C8;font-weight:700;font-size:.9rem">להכיר אותי</span>
    </span>
  </a>

  <div class="stack" style="gap:10px">
    <a class="btn btn-primary" href="#/contact">${icon.pen} רוצה קעקוע – בואו נדבר</a>
    <div class="grid2">
      <a class="btn btn-tint tint-teal" href="#/health"><span class="chip" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="5" y="3.5" width="14" height="17" rx="2"/><path d="M12 10v6M9 13h6"/></svg></span>הצהרת בריאות</a>
      <a class="btn btn-tint tint-green" href="https://wa.me/${CONFIG.whatsapp}" target="_blank" rel="noopener"><span class="chip" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z"/></svg></span>וואטסאפ לתום</a>
    </div>
    <a class="btn btn-tint tint-violet" href="#/ideas"><span class="chip" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg></span>מחפשים השראה? רעיונות מפינטרסט</a>
  </div>

  ${promoCard()}

  <a class="care-card" href="#/care">
    <span style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
      <span class="stack" style="gap:4px"><span class="care-kicker">התקעקעת? תתחדש/י!</span><span class="care-title">מדריך ההחלמה לקעקוע החדש</span></span>
      <span class="care-icon" aria-hidden="true">${icon.heart}</span>
    </span>
    <span class="stack" style="gap:6px">
      <span class="timeline-mini" aria-hidden="true"><i></i><b></b><i></i><b></b><i></i></span>
      <span class="timeline-labels"><span>היום</span><span>שבועיים</span><span>חודש</span></span>
    </span>
    <span style="display:flex;align-items:center;gap:6px;font-weight:700">לפתיחת המדריך ${icon.fwd}</span>
  </a>

  <div class="card stack how">
    <h2>איך זה עובד?</h2>
    <ol class="how-list">
      ${['שולחים פנייה עם הרעיון שלכם', 'נפגשים לקפה ומעצבים יחד סקיצה אישית', 'ממלאים הצהרת בריאות לפני התור', 'מתקעקעים – בלי לחץ של זמן'].map((t, i) => `<li><span class="n" style="background:${FEATHER[i].c}" aria-hidden="true">${i + 1}</span>${t}</li>`).join('')}
    </ol>
  </div>

  <div class="stack" style="gap:10px">
    <div class="section-head"><h2 class="barred" style="--bar:#1D93B5">מהעבודות שלי</h2><a class="link-btn" href="#/gallery">לכל העבודות</a></div>
    <ul class="hscroll">
      ${WORKS.slice(0, 6).map((w, i) => `<li style="flex:0 0 140px"><button type="button" class="thumb-btn framed" data-photo="${w.id}" style="width:140px;height:175px;--frame:${FEATHER[i % 4].c}" aria-label="${esc(w.alt)} – להגדלה"><img src="${w.src}" alt="" loading="lazy"></button></li>`).join('')}
    </ul>
  </div>

  <div class="stack" style="gap:10px">
    <div class="section-head"><h2 class="barred" style="--bar:#D41A5E">מאמרים</h2><a class="link-btn" href="#/articles">לכל המאמרים</a></div>
    <ul class="hscroll">
      ${ARTICLES.map((a, i) => `<li style="flex:0 0 230px;display:flex"><a class="art-card topped" style="--top:${FEATHER[i % 4].c}" href="#/article/${a.id}"><span class="tag" style="color:${FEATHER[i % 4].light}">${esc(a.tag)}</span><span style="font-weight:700;line-height:1.35">${esc(a.title)}</span></a></li>`).join('')}
    </ul>
  </div>

  <div class="card stack" style="gap:10px">
    <h2>הסטודיו</h2>
    <p class="muted">${esc(CONFIG.address)} · חניה בחינם</p>
    <div class="row">
      <a class="btn btn-small btn-waze" href="${CONFIG.waze}" target="_blank" rel="noopener">ניווט ב־Waze</a>
      <a class="btn btn-small btn-outline" style="border-color:#22A55B" href="tel:${CONFIG.phoneDisplay.replace(/-/g, '')}">חיוג</a>
      <a class="btn btn-small btn-outline" style="border-color:#D41A5E" href="${CONFIG.instagram}" target="_blank" rel="noopener">אינסטגרם</a>
    </div>
  </div>
</section>`;

views.about = () => `
<section class="screen" aria-labelledby="h">
  <img src="assets/img/tom-studio.jpg" alt="תום מקעקעת לקוחה בסטודיו שלה באלפי מנשה" style="width:100%;height:280px;border-radius:22px;object-fit:cover;object-position:28% 40%">
  <div class="stack" style="gap:4px">
    <h1 id="h" style="font-size:1.7rem">היי, אני תום</h1>
    <p class="muted">תום גבע · מקעקעת · אלפי מנשה</p>
  </div>
  <ul class="facts">
    <li><b>21</b><span>הגיל של הקעקוע הראשון שלי</span></li>
    <li><b>30+</b><span>קעקועים על הגוף שלי</span></li>
    <li><b>3</b><span>בנים: תאי, ניו וסאן</span></li>
  </ul>
  <div class="stack"><h2>קצת עליי</h2><p>אני בת 38, נשואה לאייל ואמא לשלושה בנים מדהימים. התשוקה שלי לציור הובילה אותי ליצור על נייר, על נעליים ועל כל חפץ אפשרי. עבורי, האמנות היא דרך לביטוי עצמי ולבריחה לעולם שבו הכל אפשרי.</p></div>
  <div class="stack"><h2>למה קעקועים?</h2><p>קעקועים הם הרבה יותר מדיו על העור – הם סיפור חיים, זיכרון, ודרך לתת לנשמה לדבר. מאז הקעקוע הראשון שלי העולם הזה הפך לאהבה גדולה, וכל אחד מהקעקועים שלי מחזיק בתוכו רגע בזמן ותזכורת למסע שלי.</p></div>
  <p class="pullquote">"אצלי אין חוקים –<br>רק חלומות שמתגשמים."</p>
  <div class="stack">
    <img src="assets/img/works/work10.jpg" alt="מקרוב: היד של תום עם מכונת הקעקוע" loading="lazy" style="width:100%;height:170px;border-radius:18px;object-fit:cover;margin-bottom:6px">
    <h2>איך אני עובדת</h2>
    <p>לא צריך להגיע עם ציור מוכן. נשב יחד על כוס קפה, אקשיב לסיפור שלך, נבין איזה סגנון מרגש אותך – ואעצב סקיצה אישית שתהיה רק שלך. המטרה שלי: יצירה שתאהב/י גם בעוד 20 שנה.</p>
  </div>
  <div class="stack"><h2>הסטודיו שלי</h2><p>מרחב שקט ואינטימי באלפי מנשה, במרחק נגיעה מכפר סבא, רעננה והוד השרון. מקום של יצירתיות, הקשבה ודיוק, עם חניה בחינם ואווירה רגועה. אין לחץ של זמן – אם צריך, עוצרים, נושמים, שותים משהו טעים וממשיכים כשנוח לך.</p></div>
  <div class="stack"><h2>מה מרגש אותי במיוחד</h2><p>קעקועי כיסוי (Cover Up) וקעקועים על צלקות. יש משהו מרפא בלקחת זיכרון ישן או צלקת ולהפוך אותם למשהו חדש ויפה שמחזיר את הביטחון העצמי – זה המקום שבו אני מרגישה שליחות.</p></div>
  <div class="stack"><h2>הסגנונות שלי</h2><ul class="chips"><li>Fine Line</li><li>ריאליזם</li><li>קאבר וצלקות</li><li>סקיצה</li><li>עיצוב אישי</li></ul></div>
  <div class="stack">
    <h2>שאלות נפוצות</h2>
    ${FAQ.map((f) => `<details class="faq"><summary>${esc(f.q)}${icon.chev}</summary><p>${esc(f.a)}</p></details>`).join('')}
  </div>
  <div class="invite">
    <p>אני מזמינה אותך לבוא, לשבת איתי על כוס קפה, לדבר, להרגיש – ולהפוך יחד את הסיפור שלך ליצירת אמנות שתלווה אותך תמיד.</p>
    <p style="font-weight:700;color:var(--pri)">מחכה לך באהבה בסטודיו, תום</p>
    <a class="btn btn-primary" href="#/contact">בואו נדבר על הקעקוע שלך</a>
  </div>
  <div class="socials">
    <a class="btn btn-small btn-outline" href="${CONFIG.instagram}" target="_blank" rel="noopener">Instagram</a>
    <a class="btn btn-small btn-outline" href="${CONFIG.facebook}" target="_blank" rel="noopener">Facebook</a>
    <a class="btn btn-small btn-outline" href="${CONFIG.tiktok}" target="_blank" rel="noopener">TikTok</a>
  </div>
  <p style="text-align:center"><a href="#/accessibility">הצהרת נגישות</a> · <a href="privacy.html">מדיניות פרטיות</a></p>
</section>`;

views.gallery = () => {
  const filters = [['all', 'הכל'], ...Object.entries(TAGS)];
  return `
<section class="screen" aria-labelledby="h">
  <h1 id="h">עבודות</h1>
  <div class="filters" role="group" aria-label="סינון לפי סגנון">
    ${filters.map(([k, l]) => `<button type="button" class="filter" data-filter="${k}" aria-pressed="${state.galf === k}">${l}</button>`).join('')}
  </div>
  <ul class="gallery" id="gallery">${galleryItems()}</ul>
  <a class="btn btn-outline" href="${CONFIG.instagram}" target="_blank" rel="noopener">עוד עבודות באינסטגרם</a>
</section>`;
};
function galleryItems() {
  const list = state.galf === 'all' ? WORKS : WORKS.filter((w) => w.tag === state.galf);
  return list.map((w) => `<li><button type="button" class="thumb-btn" data-photo="${w.id}" aria-label="${esc(w.alt)} – להגדלה"><img src="${w.src}" alt="" loading="lazy"><span class="badge">${TAGS[w.tag]}</span></button></li>`).join('');
}

views.care = () => `
<section class="screen" aria-labelledby="h">
  <a class="back" href="#/home">${icon.back}חזרה</a>
  <div class="stack"><h1 id="h">טיפול בקעקוע החדש</h1><p class="muted">${esc(CARE.intro)}</p></div>
  <ol class="steps">
    ${CARE.steps.map((s, i) => `<li><span class="rail" aria-hidden="true"><span class="num" style="background:${FEATHER[i % 4].c};color:#fff">${i + 1}</span><span class="line"></span></span>
      <div class="body"><span class="when">${esc(s.when)}</span><h2>${esc(s.title)}</h2><p class="muted">${esc(s.text)}</p></div></li>`).join('')}
  </ol>
  <div class="grid2">
    <div class="dodont do"><h2>כן</h2><ul>${CARE.dos.map((d) => `<li>${esc(d)}</li>`).join('')}</ul></div>
    <div class="dodont dont"><h2>לא</h2><ul>${CARE.donts.map((d) => `<li>${esc(d)}</li>`).join('')}</ul></div>
  </div>
  <div class="alert">${icon.warn}<p><strong>מתי לפנות לרופא/ה:</strong> ${esc(CARE.warning)}</p></div>
  <div class="help">
    <h2>קילופים? גירודים? שאלה?</h2>
    <p class="muted">אני זמינה בוואטסאפ לכל שאלה בתהליך ההחלמה.</p>
    <a class="btn btn-primary" href="${waLink('היי תום, יש לי שאלה על ההחלמה של הקעקוע:')}" target="_blank" rel="noopener">שאלה לתום בוואטסאפ</a>
  </div>
</section>`;

views.articles = () => `
<section class="screen" aria-labelledby="h">
  <div class="stack" style="gap:4px"><h1 id="h">מאמרים</h1><p class="muted">טיפים ומידע מעולם הקעקועים.</p></div>
  <ul class="stack" style="margin:0;padding:0;list-style:none;gap:10px">
    ${ARTICLES.map((a, i) => `<li><a class="art-card topped" href="#/article/${a.id}" style="padding:16px;--top:${FEATHER[i % 4].c}"><span class="tag" style="color:${FEATHER[i % 4].light}">${esc(a.tag)}</span><span style="font-family:Rubik,sans-serif;font-weight:700;font-size:1.05rem;line-height:1.35">${esc(a.title)}</span><span class="muted clamp2" style="font-size:.92rem">${esc(a.intro)}</span></a></li>`).join('')}
  </ul>
</section>`;

views.article = (id) => {
  const a = ARTICLES.find((x) => x.id === id) || ARTICLES[0];
  return `
<article class="screen" aria-labelledby="h" style="gap:14px">
  <a class="back" href="#/articles">${icon.back}חזרה למאמרים</a>
  <span class="tag">${esc(a.tag)}</span>
  <h1 id="h" style="font-size:1.45rem">${esc(a.title)}</h1>
  <p class="lead">${esc(a.intro)}</p>
  <div class="article-body">
    ${a.sections.map((s) => `<section class="stack" style="gap:4px"><h2>${esc(s.h)}</h2>${s.p ? `<p class="muted">${esc(s.p)}</p>` : ''}${s.list ? `<ul class="muted">${s.list.map((li) => `<li>${esc(li)}</li>`).join('')}</ul>` : ''}</section>`).join('')}
  </div>
  <div class="invite" style="margin-top:6px"><p style="font-weight:700">יש לך רעיון לקעקוע?</p><a class="btn btn-primary" href="#/contact">פנייה לתום</a></div>
</article>`;
};

views.contact = () => `
<form class="screen" id="contact-form" novalidate aria-labelledby="h" style="gap:16px">
  <div class="stack" style="gap:4px"><h1 id="h">פנייה לתום</h1><p class="muted">ספרו לי על הרעיון – אחזור אליכם בוואטסאפ.</p></div>
  <div class="field"><label for="c-name">שם מלא <span class="req" aria-hidden="true">*</span></label>
    <input id="c-name" name="name" class="fld" type="text" autocomplete="name" required aria-describedby="c-name-err"><span class="err" id="c-name-err"></span></div>
  <div class="field"><label for="c-phone">טלפון <span class="req" aria-hidden="true">*</span></label>
    <input id="c-phone" name="phone" class="fld ltr" type="tel" inputmode="tel" autocomplete="tel" placeholder="050-0000000" required aria-describedby="c-phone-err"><span class="err" id="c-phone-err"></span></div>
  <fieldset class="stack"><legend class="legend" style="margin-bottom:8px">על מה הפנייה?</legend>
    <div class="pills">
      ${['קעקוע ראשון', 'קעקוע חדש', 'קאבר / צלקת', 'שאלה כללית'].map((t, i) => `<label class="pill"><input type="radio" name="type" value="${t}" ${i === 0 ? 'checked' : ''}><span>${t}</span></label>`).join('')}
    </div>
  </fieldset>
  <div class="field"><label for="c-idea">הרעיון שלכם <span class="req" aria-hidden="true">*</span></label>
    <textarea id="c-idea" name="idea" class="fld" rows="4" placeholder="מה תרצו לקעקע, ומה הסיפור מאחוריו?" required aria-describedby="c-idea-err"></textarea><span class="err" id="c-idea-err"></span></div>
  <div class="grid2">
    <div class="field"><label for="c-place">מיקום בגוף</label><input id="c-place" name="place" class="fld" type="text" placeholder="למשל: אמה"></div>
    <div class="field"><label for="c-size">גודל משוער</label>
      <select id="c-size" name="size" class="fld"><option>קטן (עד 5 ס״מ)</option><option>בינוני (5–15 ס״מ)</option><option>גדול (15+ ס״מ)</option><option selected>עוד לא יודע/ת</option></select></div>
  </div>
  <div class="field"><label for="c-when">מתי נוח לכם?</label>
    <select id="c-when" name="when" class="fld"><option>גמיש/ה</option><option>בוקר</option><option>צהריים</option><option>ערב</option></select></div>
  <div class="field"><label for="c-file">תמונות השראה (לא חובה)</label>
    <input id="c-file" name="files" class="fld" type="file" accept="image/*" multiple aria-describedby="c-file-hint">
    <span class="hint" id="c-file-hint">בטלפון התמונות יצורפו להודעה. אם לא – אפשר לשלוח אותן בהמשך השיחה בוואטסאפ.</span></div>
  <button type="submit" class="btn btn-primary">שליחת הפנייה בוואטסאפ</button>
  <p class="hint" style="text-align:center">הפרטים נשלחים ישירות לתום ולא נשמרים באפליקציה.</p>
</form>`;

views.health = () => {
  return `
<form class="screen" id="health-form" novalidate aria-labelledby="h" style="gap:16px">
  <div class="stack">
    <h1 id="h">הצהרת בריאות</h1>
    <p class="muted">כדי שהחוויה תהיה בטוחה – חשוב לענות בכנות. ממלאים פעם אחת לפני הקעקוע.</p>
    <div class="progress-meta"><span id="step-num"></span><span id="step-name"></span></div>
    <div class="progress" role="progressbar" aria-label="התקדמות בטופס" aria-valuemin="1" aria-valuemax="3" id="progress"><div id="progress-bar"></div></div>
  </div>

  <div class="stack-lg" data-step="1">
    <div class="field"><label for="h-name">שם מלא <span class="req" aria-hidden="true">*</span></label><input id="h-name" name="name" class="fld" autocomplete="name" required aria-describedby="h-name-err"><span class="err" id="h-name-err"></span></div>
    <div class="field"><label for="h-id">תעודת זהות (לא חובה)</label><input id="h-id" name="idnum" class="fld ltr" inputmode="numeric" maxlength="9" aria-describedby="h-id-err"><span class="err" id="h-id-err"></span></div>
    <div class="grid2">
      <div class="field"><label for="h-dob">תאריך לידה <span class="req" aria-hidden="true">*</span></label><input id="h-dob" name="dob" class="fld" type="date" required aria-describedby="h-dob-err"><span class="err" id="h-dob-err"></span></div>
      <div class="field"><label for="h-phone">טלפון <span class="req" aria-hidden="true">*</span></label><input id="h-phone" name="phone" class="fld ltr" type="tel" autocomplete="tel" required aria-describedby="h-phone-err"><span class="err" id="h-phone-err"></span></div>
    </div>
    <div class="field"><label for="h-address">כתובת מגורים <span class="req" aria-hidden="true">*</span></label><input id="h-address" name="address" class="fld" autocomplete="street-address" placeholder="רחוב, מספר ועיר" required aria-describedby="h-address-err"><span class="err" id="h-address-err"></span></div>
    <div class="field"><label for="h-email">אימייל (לא חובה)</label><input id="h-email" name="email" class="fld ltr" type="email" autocomplete="email"></div>
    <div class="grid2">
      <div class="field"><label for="h-date">תאריך הקעקוע</label><input id="h-date" name="tdate" class="fld" type="date"></div>
      <div class="field"><label for="h-area">אזור הקעקוע</label><input id="h-area" name="area" class="fld" placeholder="למשל: אמה"></div>
    </div>
    <div class="field"><label for="h-design">מה מקעקעים? <span class="req" aria-hidden="true">*</span></label><input id="h-design" name="design" class="fld" placeholder="למשל: פרח בקו עדין, 6 ס״מ, שחור" required aria-describedby="h-design-err"><span class="err" id="h-design-err"></span></div>
    <fieldset class="stack"><legend class="legend" style="margin-bottom:6px">איש קשר לחירום (לא חובה)</legend>
      <div class="grid2">
        <div class="field"><label for="h-ename" class="hint">שם</label><input id="h-ename" name="ename" class="fld" autocomplete="off"></div>
        <div class="field"><label for="h-ephone" class="hint">טלפון</label><input id="h-ephone" name="ephone" class="fld ltr" type="tel" autocomplete="off" aria-describedby="h-ephone-err"><span class="err" id="h-ephone-err"></span></div>
      </div>
    </fieldset>
    <p class="notice">בסטודיו נבקש לראות תעודה מזהה לאימות גיל – אין צורך למלא כאן את המספר.</p>
    <p class="notice" id="minor-note" hidden>מתחת לגיל 18 נדרשים פרטי הורה/אפוטרופוס וחתימתו – בשלב האחרון.</p>
  </div>

  <div class="stack-lg" data-step="2" hidden>
    ${QUESTIONS.map((q) => `
    <div class="q" id="fs-${q.id}" role="radiogroup" aria-labelledby="ql-${q.id}"><p class="legend" id="ql-${q.id}" style="margin:0">${esc(q.text)}</p>
      <div class="pills">
        <label class="pill"><input type="radio" name="${q.id}" value="לא"><span>לא</span></label>
        <label class="pill"><input type="radio" name="${q.id}" value="כן"><span>כן</span></label>
      </div>
      <p class="q-note q-${q.level}" id="qn-${q.id}" role="status" ${state.health[q.id] === 'כן' ? '' : 'hidden'}>${esc(q.note)}</p></div>`).join('')}
    <div class="field"><label for="h-details">פירוט (חובה אם סימנת "כן")</label><textarea id="h-details" name="details" class="fld" rows="3" aria-describedby="h-q-err"></textarea></div>
    <span class="err" id="h-q-err"></span>
  </div>

  <div class="stack-lg" data-step="3" hidden>
    <div class="stack-lg" id="parent-block" hidden>
      <p class="notice">ממלא/ת ההצהרה מתחת לגיל 18 – נדרשים פרטי הורה/אפוטרופוס, והחתימה למטה היא של ההורה.</p>
      <div class="field"><label for="h-pname">שם ההורה <span class="req" aria-hidden="true">*</span></label><input id="h-pname" name="pname" class="fld" aria-describedby="h-pname-err"><span class="err" id="h-pname-err"></span></div>
      <div class="grid2">
        <div class="field"><label for="h-pid">ת״ז ההורה <span class="req" aria-hidden="true">*</span></label><input id="h-pid" name="pid" class="fld ltr" inputmode="numeric" maxlength="9" aria-describedby="h-pid-err"><span class="err" id="h-pid-err"></span></div>
        <div class="field"><label for="h-pphone">טלפון ההורה <span class="req" aria-hidden="true">*</span></label><input id="h-pphone" name="pphone" class="fld ltr" type="tel" aria-describedby="h-pphone-err"><span class="err" id="h-pphone-err"></span></div>
      </div>
      ${CONSENTS.filter((c) => c.minorOnly).map((c) => `<label class="check"><input type="checkbox" name="${c.id}"><span>${esc(c.text)} <span class="req" aria-hidden="true">*</span></span></label>`).join('')}
    </div>
    ${CONSENTS.filter((c) => !c.minorOnly).map((c) => `<label class="check"><input type="checkbox" name="${c.id}" ${c.required ? 'required' : ''}><span>${esc(c.text)}${c.required ? ' <span class="req" aria-hidden="true">*</span>' : ''}</span></label>`).join('')}
    <span class="err" id="h-c-err"></span>
    <div class="field">
      <span class="legend" id="sig-label">חתימה <span class="req" aria-hidden="true">*</span></span>
      <div class="sig-wrap"><canvas id="sig" role="img" aria-labelledby="sig-label"></canvas><span class="sig-ph" id="sig-ph">חתמו כאן עם האצבע</span></div>
      <div class="row" style="justify-content:space-between;align-items:center"><span class="err" id="h-sig-err"></span><button type="button" class="link-btn" id="sig-clear">ניקוי חתימה</button></div>
    </div>
    <p class="hint">הפרטים נשלחים ישירות לתום ואינם נשמרים באפליקציה.</p>
  </div>

  <div class="form-actions">
    <button type="button" class="btn btn-outline" id="h-prev" hidden>חזרה</button>
    <button type="submit" class="btn btn-primary" id="h-next">המשך</button>
  </div>
</form>`;
};

views.done = (kind) => {
  if (kind === 'health') {
    return `
<section class="screen done" aria-labelledby="h">
  <img src="assets/img/logo-dark.png" alt="">
  <h1 id="h">${state.healthSent ? 'ההצהרה נשלחה – תודה!' : 'ההצהרה מוכנה – תודה!'}</h1>
  ${state.lastHealth && state.lastHealth.review ? `<p class="q-note q-${state.lastHealth.review}" style="text-align:right">${state.lastHealth.review === 'stop'
    ? 'בהצהרה יש פרט שבגללו ייתכן שלא נוכל לקעקע במועד שנקבע. תום תיצור איתך קשר לפני התור.'
    : 'בהצהרה יש פרטים שתום תעבור עליהם, וייתכן שתיצור איתך קשר לפני התור.'}</p>` : ''}
  <p class="muted">${state.healthSent ? 'ההצהרה החתומה נשלחה לתום. נתראה בסטודיו!'
    : state.healthFailed ? 'לא הצלחנו לשלוח את ההצהרה אוטומטית (אולי אין אינטרנט). אפשר לנסות שוב, או לשלוח לתום את הסיכום בוואטסאפ.'
    : isNative ? 'עוד צעד אחד: שלחו את הסיכום לתום בוואטסאפ.' : 'עוד צעד אחד: שלחו את ההצהרה לתום. אפשר לשלוח סיכום בוואטסאפ, ולשמור עותק חתום כ־PDF.'}</p>
  ${state.healthFailed ? '<button type="button" class="btn btn-primary" id="retry-health">לנסות לשלוח שוב</button>' : ''}
  ${state.lastHealth && !state.healthSent ? `
  <a class="btn btn-primary" href="${waLink(healthSummary(state.lastHealth))}" target="_blank" rel="noopener">שליחת הסיכום לתום בוואטסאפ</a>
  ${isNative ? '' : '<button type="button" class="btn btn-outline" id="print-health">שמירה / הדפסה כ־PDF (עם החתימה)</button>'}` : ''}
  <a class="btn btn-outline" href="#/home">חזרה לבית</a>
</section>`;
  }
  return `
<section class="screen done" aria-labelledby="h">
  <span style="width:80px;height:80px;border-radius:50%;background:var(--pri-soft);color:var(--pri);display:flex;align-items:center;justify-content:center">${icon.check}</span>
  <h1 id="h">הפנייה מוכנה!</h1>
  <p class="muted">${CONFIG.contactEndpoint ? 'הפנייה נשלחה. תום תחזור אליך בהקדם.' : 'וואטסאפ נפתח עם ההודעה – רק ללחוץ "שליחה". תום תחזור אליך בהקדם.'}</p>
  ${state.lastContactText && !CONFIG.contactEndpoint ? `<a class="btn btn-primary" href="${waLink(state.lastContactText)}" target="_blank" rel="noopener">לא נפתח? לשליחה בוואטסאפ</a>` : ''}
  <a class="btn btn-outline" href="#/home">חזרה לבית</a>
</section>`;
};

views.accessibility = () => `
<section class="screen" aria-labelledby="h">
  <a class="back" href="#/about">${icon.back}חזרה</a>
  <h1 id="h">הצהרת נגישות</h1>
  <p>ב־Tomchu Tattoo אנחנו רוצים שכל אחד ואחת יוכלו להכיר אותנו, לפנות אלינו ולמלא את הטפסים בקלות. האפליקציה נבנתה בהתאם להנחיות WCAG 2.1 ברמה AA ולתקן הישראלי ת״י 5568.</p>
  <div class="stack"><h2>מה עשינו</h2>
    <ul class="muted" style="margin:0;padding-inline-start:20px;display:flex;flex-direction:column;gap:4px">
      <li>כפתור "טקסט גדול" להגדלת כל הטקסטים</li>
      <li>ניגודיות צבעים גבוהה בין הטקסט לרקע</li>
      <li>ניווט מלא במקלדת ותמיכה בקוראי מסך</li>
      <li>תיאור טקסטואלי לתמונות</li>
      <li>כפתורים ואזורי לחיצה גדולים</li>
      <li>הודעות שגיאה ברורות בטפסים</li>
    </ul>
  </div>
  <div class="stack"><h2>נתקלתם בבעיה?</h2>
    <p>נשמח לשמוע ולתקן. רכזת הנגישות: תום גבע · <a href="tel:${CONFIG.phoneDisplay.replace(/-/g, '')}">${CONFIG.phoneDisplay}</a> · <a href="mailto:${CONFIG.email}">${CONFIG.email}</a></p>
  </div>
  <div class="stack"><h2>נגישות הסטודיו</h2><p class="muted">צריכים התאמה כלשהי להגעה לסטודיו או במהלך הקעקוע? ספרו לתום מראש בטלפון או בוואטסאפ, ונדאג שיהיה לכם נוח.</p></div>
  <p class="hint">עודכן לאחרונה: נובמבר 2026</p>
</section>`;

// ---------------------------------------------------------------------
// ניתוב
// ---------------------------------------------------------------------
const titles = { home: 'בית', about: 'תום', gallery: 'עבודות', care: 'מדריך ההחלמה', articles: 'מאמרים', article: 'מאמר', contact: 'פנייה לתום', health: 'הצהרת בריאות', done: 'תודה', accessibility: 'הצהרת נגישות', promo: 'מבצע החודש', ideas: 'רעיונות מפינטרסט' };
const tabOf = (name, param) => ({ about: 'about', accessibility: 'about', gallery: 'gallery', contact: 'contact', health: 'health', done: param === 'health' ? 'health' : 'contact' }[name] || 'home');

function render() {
  const [rawName, param] = location.hash.replace(/^#\/?/, '').split('/');
  const name = views[rawName] ? rawName : 'home';
  if (name === 'done' && param === 'health' && !state.lastHealth) { location.replace('#/health'); return; }
  const main = $('#main');
  main.innerHTML = views[name](param);
  $$('.tabbar a').forEach((a) => { if (a.dataset.tab === tabOf(name, param)) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  const h1 = $('h1', main);
  document.title = `${titles[name]} · Tomchu Tattoo`;
  window.scrollTo(0, 0);
  if (rendered) { main.focus({ preventScroll: true }); announce(h1 ? h1.textContent : titles[name]); }
  rendered = true;
  binders[name]?.(param);
}
let rendered = false;

// ---------------------------------------------------------------------
// התנהגות לכל מסך
// ---------------------------------------------------------------------
const binders = {};

binders.gallery = () => {
  $$('[data-filter]').forEach((b) => b.addEventListener('click', () => {
    state.galf = b.dataset.filter;
    $$('[data-filter]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.filter === state.galf)));
    $('#gallery').innerHTML = galleryItems();
    announce(`מוצגות ${$$('#gallery li').length} עבודות`);
  }));
};

binders.done = (kind) => {
  $('#print-health')?.addEventListener('click', () => printHealth(state.lastHealth));
  $('#retry-health')?.addEventListener('click', (e) => {
    e.target.disabled = true; e.target.textContent = 'שולח…';
    sendHealth(state.lastHealth).then(render);
  });
  setTimeout(maybeAskPush, 1500);
};

// ---- טופס פנייה ----
binders.contact = () => {
  const f = $('#contact-form');
  restoreForm(f, state.contact);
  f.addEventListener('input', () => saveForm(f, state.contact));
  f.addEventListener('change', () => saveForm(f, state.contact));
  f.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = state.contact; saveForm(f, v);
    const errs = [];
    errs.push(setErr(f, 'name', v.name?.trim().length >= 2 ? '' : 'נא למלא שם מלא'));
    errs.push(setErr(f, 'phone', validPhone(v.phone) ? '' : 'נא למלא מספר טלפון תקין'));
    errs.push(setErr(f, 'idea', v.idea?.trim() ? '' : 'ספרו לי בכמה מילים על הרעיון'));
    const first = errs.find(Boolean); if (first) { first.focus(); announce('יש שדות שצריך לתקן'); return; }

    const text = [
      'היי תום, פנייה חדשה מהאפליקציה',
      `שם: ${v.name.trim()}`, `טלפון: ${v.phone.trim()}`, `סוג פנייה: ${v.type}`,
      `הרעיון: ${v.idea.trim()}`,
      v.place ? `מיקום בגוף: ${v.place}` : '', `גודל משוער: ${v.size}`, `מתי נוח: ${v.when}`
    ].filter(Boolean).join('\n');
    state.lastContactText = text;
    const files = Array.from(f.elements.files.files || []);

    if (CONFIG.contactEndpoint) {
      postJson(CONFIG.contactEndpoint, { kind: 'contact', ...v, files: undefined, sentAt: new Date().toISOString() })
        .then(() => { state.contact = {}; location.hash = '#/done/contact'; })
        .catch(() => alertErr(f, 'השליחה נכשלה. נסו שוב או שלחו בוואטסאפ.'));
      return;
    }
    if (files.length && navigator.canShare && navigator.canShare({ files })) {
      navigator.share({ text, files }).then(() => { state.contact = {}; location.hash = '#/done/contact'; }).catch(() => {});
      return;
    }
    openExternal(waLink(files.length ? text + '\n(אשלח תמונות השראה כאן בצ׳אט)' : text));
    state.contact = {};
    location.hash = '#/done/contact';
  });
};

// ---- הצהרת בריאות ----
const stepNames = ['', 'פרטים אישיים', 'שאלות בריאות', 'אישור וחתימה'];
binders.health = () => {
  const f = $('#health-form');
  const d = state.health;
  restoreForm(f, d);
  if (!d.tdate) f.elements.tdate.value = todayIso();
  f.addEventListener('input', () => { saveForm(f, d); updateMinor(); });
  f.addEventListener('change', (e) => {
    saveForm(f, d); updateMinor();
    const q = QUESTIONS.find((x) => x.id === e.target.name);
    if (q) $(`#qn-${q.id}`).hidden = d[q.id] !== 'כן';
  });
  const pad = signaturePad($('#sig'), $('#sig-ph'));
  $('#sig-clear').addEventListener('click', () => pad.clear());
  $('#h-prev').addEventListener('click', () => go(d.step - 1));

  function updateMinor() {
    const a = ageFrom(f.elements.dob.value);
    const minor = a !== null && a < 18;
    $('#minor-note').hidden = !minor; $('#parent-block').hidden = !minor;
    $('#sig-label').firstChild.textContent = minor ? 'חתימת ההורה ' : 'חתימה ';
    return minor;
  }
  function go(n) {
    d.step = Math.min(3, Math.max(1, n));
    $$('[data-step]', f).forEach((s) => { s.hidden = Number(s.dataset.step) !== d.step; });
    $('#step-num').textContent = `שלב ${d.step} מתוך 3`; $('#step-name').textContent = stepNames[d.step];
    $('#progress').setAttribute('aria-valuenow', d.step); $('#progress-bar').style.width = `${Math.round(d.step / 3 * 100)}%`;
    $('#h-prev').hidden = d.step === 1;
    $('#h-next').textContent = d.step === 3 ? 'סיום וחתימה' : 'המשך';
    if (d.step === 3) pad.resize();
    window.scrollTo(0, 0);
  }
  function validate(step) {
    const errs = [];
    if (step === 1) {
      errs.push(setErr(f, 'name', d.name?.trim().length >= 2 ? '' : 'נא למלא שם מלא'));
      errs.push(setErr(f, 'idnum', !d.idnum?.trim() || validIsraeliId(d.idnum) ? '' : 'מספר תעודת הזהות לא תקין'));
      const a = ageFrom(d.dob);
      errs.push(setErr(f, 'dob', a === null ? 'נא לבחור תאריך לידה' : (a < 14 || a > 110) ? 'נא לבדוק את תאריך הלידה' : ''));
      errs.push(setErr(f, 'phone', validPhone(d.phone) ? '' : 'נא למלא מספר טלפון תקין'));
      errs.push(setErr(f, 'address', d.address?.trim().length >= 4 ? '' : 'נא למלא כתובת מגורים'));
      errs.push(setErr(f, 'design', d.design?.trim().length >= 2 ? '' : 'ספרו בכמה מילים מה מקעקעים'));
      errs.push(setErr(f, 'ephone', !d.ephone?.trim() || validPhone(d.ephone) ? '' : 'מספר הטלפון לא תקין'));
    }
    if (step === 2) {
      let firstMissing = null; let anyYes = false;
      QUESTIONS.forEach((q) => { const ok = !!d[q.id]; $(`#fs-${q.id}`).classList.toggle('invalid', !ok); if (!ok && !firstMissing) firstMissing = f.elements[q.id][0]; if (d[q.id] === 'כן') anyYes = true; });
      let msg = '';
      if (firstMissing) msg = 'נא לענות על כל השאלות';
      else if (anyYes && !d.details?.trim()) { msg = 'סימנת "כן" – נא לפרט בתיבה למעלה'; firstMissing = f.elements.details; }
      $('#h-q-err').textContent = msg; errs.push(msg ? firstMissing : null);
    }
    if (step === 3) {
      if (updateMinor()) {
        errs.push(setErr(f, 'pname', d.pname?.trim().length >= 2 ? '' : 'נא למלא את שם ההורה'));
        errs.push(setErr(f, 'pid', validIsraeliId(d.pid) ? '' : 'מספר תעודת הזהות לא תקין'));
        errs.push(setErr(f, 'pphone', validPhone(d.pphone) ? '' : 'נא למלא מספר טלפון תקין'));
      }
      const minorNow = updateMinor();
      const missing = CONSENTS.filter((c) => c.required && (!c.minorOnly || minorNow) && !d[c.id]);
      $('#h-c-err').textContent = missing.length ? 'נא לאשר את כל סעיפי החובה' : '';
      errs.push(missing.length ? f.elements[missing[0].id] : null);
      $('#h-sig-err').textContent = pad.isEmpty() ? 'נא לחתום' : '';
      errs.push(pad.isEmpty() ? $('#sig') : null);
    }
    const first = errs.find(Boolean);
    if (first) { first.focus?.(); first.scrollIntoView?.({ block: 'center' }); announce('יש שדות שצריך לתקן'); return false; }
    return true;
  }
  f.addEventListener('submit', (e) => {
    e.preventDefault(); saveForm(f, d);
    if (!validate(d.step)) return;
    if (d.step < 3) { go(d.step + 1); f.querySelector(`[data-step="${d.step}"] input, [data-step="${d.step}"] textarea`)?.focus(); return; }
    finishHealth(pad.toDataURL());
  });
  updateMinor(); go(d.step || 1);
};

function finishHealth(signature) {
  const d = state.health; const age = ageFrom(d.dob); const minor = age < 18;
  const rec = {
    submittedAt: new Date().toISOString(), submittedAtText: nowStamp(),
    name: d.name.trim(), idnum: d.idnum, dob: d.dob, age, phone: d.phone, email: d.email || '',
    tattooDate: d.tdate || '', area: d.area || '',
    address: (d.address || '').trim(), design: (d.design || '').trim(),
    emergency: d.ename || d.ephone ? { name: (d.ename || '').trim(), phone: (d.ephone || '').trim() } : null,
    answers: QUESTIONS.map((q) => ({ id: q.id, q: q.text, a: d[q.id] })), details: d.details || '',
    consents: CONSENTS.filter((c) => !c.minorOnly || minor).map((c) => ({ id: c.id, text: c.text, ok: !!d[c.id] })),
    minor, parent: minor ? { name: d.pname, id: d.pid, phone: d.pphone } : null,
    signature
  };
  // התרעות לתום: 'stop' = לא לקעקע עד בירור, 'check' = לבדיקה
  rec.flags = QUESTIONS.filter((q) => d[q.id] === 'כן').map((q) => ({ level: q.level, q: q.text, note: q.note }));
  if (minor) rec.flags.push({ level: 'check', q: `קטין/ה (גיל ${age})`, note: 'לוודא שההורה נוכח/ת בסטודיו ומציג/ה תעודה מזהה.' });
  rec.review = rec.flags.some((x) => x.level === 'stop') ? 'stop' : rec.flags.length ? 'check' : '';
  // שדות נוספים שהסקריפט מציג כמו שהם (כך שינויים בטופס לא דורשים עדכון סקריפט)
  rec.extraFields = [
    { label: 'כתובת מגורים', value: rec.address },
    { label: 'מה מקעקעים', value: rec.design },
    { label: 'איש קשר לחירום', value: rec.emergency ? [rec.emergency.name, rec.emergency.phone].filter(Boolean).join(' · ') : '' }
  ].filter((x) => x.value);
  state.lastHealth = rec;
  state.healthSent = false; state.healthFailed = false;
  const after = () => { state.health = { step: 1 }; state.sigData = null; location.hash = '#/done/health'; };
  if (CONFIG.healthEndpoint) {
    const btn = $('#h-next'); btn.disabled = true; btn.textContent = 'שולח…';
    sendHealth(rec).then(after);
  } else after();
}

// שליחת ההצהרה למייל של תום (דרך Google Apps Script בחשבון שלה)
function sendHealth(rec) {
  return postJson(CONFIG.healthEndpoint, { kind: 'health', ...rec })
    .then((r) => r.json().catch(() => ({ ok: true })))
    .then((j) => { if (j && j.ok === false) throw new Error(j.error || 'failed'); state.healthSent = true; state.healthFailed = false; })
    .catch(() => { state.healthSent = false; state.healthFailed = true; });
}

function healthSummary(r) {
  const yes = r.answers.filter((x) => x.a === 'כן');
  const groups = [
    [r.review === 'stop' ? '⛔ הצהרת בריאות – לא לקעקע עד בירור' : r.review === 'check' ? '⚠ הצהרת בריאות – לבדיקה' : 'הצהרת בריאות – Tomchu Tattoo'],
    [`שם: ${r.name}`, r.idnum && `ת״ז: ${r.idnum}`, `תאריך לידה: ${fmtDate(r.dob)} (גיל ${r.age})`, `טלפון: ${r.phone}`,
      r.email && `אימייל: ${r.email}`, r.tattooDate && `תאריך הקעקוע: ${fmtDate(r.tattooDate)}`, r.area && `אזור: ${r.area}`,
      ...(r.extraFields || []).map((x) => `${x.label}: ${x.value}`)],
    [yes.length ? 'שאלות שסומנו "כן":\n' + yes.map((x) => `• ${x.q}`).join('\n') : 'כל התשובות לשאלות הבריאות: "לא"',
      r.details && `פירוט: ${r.details}`],
    [r.minor && `הורה/אפוטרופוס: ${r.parent.name}, ת״ז ${r.parent.id}, טלפון ${r.parent.phone}`,
      `אישור פרסום תמונות: ${r.consents.find((c) => c.id === 'c4')?.ok ? 'כן' : 'לא'}`,
      `אושרו כל סעיפי ההצהרה ונחתם דיגיטלית באפליקציה ב־${r.submittedAtText}`]
  ];
  return groups.map((g) => g.filter(Boolean).join('\n')).join('\n\n');
}

function printHealth(r) {
  if (!r) return;
  $('#print-area').innerHTML = `
    <h1>הצהרת בריאות – Tomchu Tattoo</h1>
    <p>${esc(CONFIG.address)} · ${esc(CONFIG.phoneDisplay)}</p>
    <h2>פרטים אישיים</h2>
    <table><tr><td>שם מלא</td><td>${esc(r.name)}</td><td>ת״ז</td><td>${esc(r.idnum)}</td></tr>
      <tr><td>תאריך לידה</td><td>${fmtDate(r.dob)} (גיל ${r.age})</td><td>טלפון</td><td>${esc(r.phone)}</td></tr>
      <tr><td>תאריך הקעקוע</td><td>${fmtDate(r.tattooDate)}</td><td>אזור</td><td>${esc(r.area)}</td></tr>
      ${(r.extraFields || []).map((x) => `<tr><td>${esc(x.label)}</td><td colspan="3">${esc(x.value)}</td></tr>`).join('')}</table>
    <h2>שאלות בריאות</h2>
    <table>${r.answers.map((x) => `<tr><td>${esc(x.q)}</td><td style="width:50pt;text-align:center">${esc(x.a)}</td></tr>`).join('')}</table>
    ${r.details ? `<p><strong>פירוט:</strong> ${esc(r.details)}</p>` : ''}
    <h2>הצהרות</h2>
    <table>${r.consents.map((c) => `<tr><td>${esc(c.text)}</td><td style="width:50pt;text-align:center">${c.ok ? '✔' : '—'}</td></tr>`).join('')}</table>
    ${r.minor ? `<h2>הורה / אפוטרופוס</h2><p>${esc(r.parent.name)} · ת״ז ${esc(r.parent.id)} · ${esc(r.parent.phone)}</p>` : ''}
    <h2>${r.minor ? 'חתימת ההורה' : 'חתימה'}</h2>
    <img class="sig" src="${r.signature}" alt="חתימה">
    <p>נחתם דיגיטלית באפליקציה ב־${esc(r.submittedAtText)}</p>`;
  window.print();
}

// ---------------------------------------------------------------------
// טפסים – עזרים
// ---------------------------------------------------------------------
function saveForm(f, obj) {
  for (const el of f.elements) {
    if (!el.name || el.type === 'file') continue;
    if (el.type === 'radio') { if (el.checked) obj[el.name] = el.value; }
    else if (el.type === 'checkbox') obj[el.name] = el.checked;
    else obj[el.name] = el.value;
  }
}
function restoreForm(f, obj) {
  for (const el of f.elements) {
    if (!el.name || !(el.name in obj) || el.type === 'file') continue;
    if (el.type === 'radio') el.checked = obj[el.name] === el.value;
    else if (el.type === 'checkbox') el.checked = !!obj[el.name];
    else el.value = obj[el.name];
  }
}
function setErr(f, name, msg) {
  const el = f.elements[name]; const out = $(`#${el.getAttribute('aria-describedby')?.split(' ')[0]}`);
  if (out) out.textContent = msg;
  el.setAttribute('aria-invalid', msg ? 'true' : 'false');
  return msg ? el : null;
}
function alertErr(f, msg) {
  let el = $('.form-alert', f);
  if (!el) { el = document.createElement('p'); el.className = 'err form-alert'; el.setAttribute('role', 'alert'); f.appendChild(el); }
  el.textContent = msg;
}
function postJson(url, data) {
  // text/plain כדי לא להפעיל preflight מול Google Apps Script
  return fetch(url, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'text/plain;charset=utf-8' } })
    .then((r) => { if (!r.ok) throw new Error(r.status); return r; });
}

// ---------------------------------------------------------------------
// חתימה באצבע
// ---------------------------------------------------------------------
function signaturePad(canvas, placeholder) {
  const ctx = canvas.getContext('2d');
  let drawing = false; let empty = !state.sigData; let last = null;
  function resize() {
    const r = canvas.getBoundingClientRect(); if (!r.width) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, r.width, r.height);
    ctx.lineWidth = 2.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#1E1A21';
    if (state.sigData) { const img = new Image(); img.onload = () => ctx.drawImage(img, 0, 0, r.width, r.height); img.src = state.sigData; }
    placeholder.hidden = !empty;
  }
  const pos = (e) => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  canvas.addEventListener('pointerdown', (e) => { drawing = true; last = pos(e); canvas.setPointerCapture(e.pointerId); ctx.beginPath(); ctx.arc(last.x, last.y, 1.2, 0, Math.PI * 2); ctx.fillStyle = '#1E1A21'; ctx.fill(); empty = false; placeholder.hidden = true; });
  canvas.addEventListener('pointermove', (e) => { if (!drawing) return; const p = pos(e); ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke(); last = p; });
  const end = () => { if (!drawing) return; drawing = false; state.sigData = canvas.toDataURL('image/png'); $('#h-sig-err').textContent = ''; };
  canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end); canvas.addEventListener('pointerleave', end);
  window.addEventListener('resize', () => { if (document.body.contains(canvas)) resize(); });
  return {
    resize, isEmpty: () => empty,
    clear() { state.sigData = null; empty = true; resize(); },
    toDataURL: () => canvas.toDataURL('image/png')
  };
}

// ---------------------------------------------------------------------
// צפייה בתמונה
// ---------------------------------------------------------------------
const viewer = $('#viewer');
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-photo]'); if (!b) return;
  const w = WORKS.find((x) => x.id === b.dataset.photo); if (!w) return;
  $('#viewer-img').src = w.src; $('#viewer-img').alt = w.alt;
  $('#viewer-cap').textContent = w.alt; $('#viewer-tag').textContent = TAGS[w.tag];
  viewer.showModal();
});
$('#viewer-close').addEventListener('click', () => viewer.close());
$('#viewer-cta').addEventListener('click', () => viewer.close());
viewer.addEventListener('click', (e) => { if (e.target === viewer) viewer.close(); });

// ---------------------------------------------------------------------
// גודל טקסט (האפליקציה תמיד במצב כהה)
// ---------------------------------------------------------------------
const root = document.documentElement;
function syncTop() {
  const big = root.classList.contains('big-text');
  $('#text-btn').setAttribute('aria-pressed', String(big));
  $('#text-btn').setAttribute('aria-label', big ? 'הקטנת טקסט' : 'הגדלת טקסט');
}
$('#text-btn').addEventListener('click', () => {
  root.classList.toggle('big-text'); store.set('tt-big', root.classList.contains('big-text') ? '1' : '0'); syncTop();
});

// ---------------------------------------------------------------------
// הפעלה
// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
// אנימציית פתיחה – דיו במים (פעם אחת בכל פתיחה, נסגרת לבד או בהקשה)
// ---------------------------------------------------------------------
function playIntro() {
  const intro = $('#intro');
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  let seen = false; try { seen = sessionStorage.getItem('tt-intro') === '1'; } catch (e) { /* ignore */ }
  if (!intro || reduce || seen) { intro?.remove(); return; }
  try { sessionStorage.setItem('tt-intro', '1'); } catch (e) { /* ignore */ }
  const G = '#22A55B', T = '#1D93B5', V = '#5B4BC4', M = '#D41A5E', P = '#A0179C';
  const shapes = ['58% 42% 63% 37% / 45% 58% 42% 55%', '42% 58% 37% 63% / 60% 40% 60% 40%', '50% 50% 30% 70% / 70% 40% 60% 30%'];
  const blooms = [
    [10, 'a', 150, 150, M, 0.5], [130, 'a', 160, 140, P, 0.6], [250, 'a', 150, 160, V, 0.7],
    [60, 'b', 170, 150, T, 0.75], [180, 'b', 160, 170, G, 0.85], [300, 'b', 170, 160, M, 0.95],
    [30, 'c', 70, 190, G, 0.9], [100, 'c', 60, 170, V, 1.0], [165, 'c', 75, 200, T, 1.05],
    [225, 'c', 65, 180, P, 1.1], [290, 'c', 70, 190, M, 1.15], [345, 'c', 60, 170, T, 1.2]
  ];
  $('#ib-ink').innerHTML = blooms.map((b, i) => `<span class="ib-arm" style="transform:rotate(${b[0]}deg)"><span class="ib-bloom ib-${b[1]}" style="width:${b[2]}px;height:${b[3]}px;background:${b[4]};border-radius:${shapes[i % 3]};animation-delay:${b[5]}s"></span></span>`).join('');
  intro.hidden = false;
  document.body.classList.add('intro-on');
  let closed = false;
  const close = () => {
    if (closed) return; closed = true;
    intro.classList.add('out');
    document.body.classList.remove('intro-on');
    setTimeout(() => intro.remove(), 600);
  };
  intro.addEventListener('click', close);
  setTimeout(close, 3000);
}

// ---------------------------------------------------------------------
// הוספה למסך הבית (אייפון / אנדרואיד בדפדפן)
// ---------------------------------------------------------------------
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; showInstallTip(); });

function showInstallTip() {
  if (isNative || isStandalone || $('#install-tip')) return;
  let dismissed = false; try { dismissed = localStorage.getItem('tt-install-dismissed') === '1'; } catch (e) { /* ignore */ }
  if (dismissed || !(isIOS || deferredPrompt)) return;
  const tip = document.createElement('aside');
  tip.id = 'install-tip'; tip.className = 'install-tip'; tip.setAttribute('aria-label', 'הוספת האפליקציה למסך הבית');
  tip.innerHTML = `
    <img src="assets/icons/apple-touch-icon.png" alt="" width="52" height="52">
    <div class="install-body">
      <strong>הוסיפו את Tomchu למסך הבית</strong>
      ${isIOS
        ? `<span>לוחצים על <span class="ios-share" aria-label="כפתור השיתוף"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M6 11v9h12v-9"/></svg></span> ואז על <b>"הוספה למסך הבית"</b></span>`
        : '<span>כמו אפליקציה רגילה – בלחיצה אחת</span>'}
    </div>
    ${isIOS ? '' : '<button type="button" class="btn btn-primary btn-small" id="install-go">התקנה</button>'}
    <button type="button" class="icon-btn install-x" id="install-x" aria-label="סגירה"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>`;
  document.body.appendChild(tip);
  $('#install-x').addEventListener('click', () => { tip.remove(); store.set('tt-install-dismissed', '1'); });
  $('#install-go')?.addEventListener('click', async () => {
    if (!deferredPrompt) return; deferredPrompt.prompt(); await deferredPrompt.userChoice.catch(() => {}); deferredPrompt = null; tip.remove();
  });
}


// ---------------------------------------------------------------------
// רעיון → פינטרסט: כותבים בעברית, מתרגמים לשפת המקעקעים ופותחים חיפוש בפינטרסט
// ---------------------------------------------------------------------
const IDEA_STARTS = [
  { he: 'שם של הילד', en: 'baby name script tattoo' },
  { he: 'קעקוע זוגי', en: 'matching couple tattoo' },
  { he: 'זכר לאהוב', en: 'memorial tattoo' },
  { he: 'חיה אהובה', en: 'pet portrait tattoo' },
  { he: 'ציטוט', en: 'quote script tattoo' }
];
const IDEA_STYLES = [
  { he: 'Fine Line', en: 'fine line' }, { he: 'מינימליסטי', en: 'minimalist' }, { he: 'ריאליזם', en: 'realism' },
  { he: 'צבעוני', en: 'colorful watercolor' }, { he: 'שחור־אפור', en: 'black and grey' }
];
// מילים בעברית → מונחי חיפוש שמקעקעים משתמשים בהם (גוברים על התרגום האוטומטי)
const W = (alt) => new RegExp('(^|\\s)(?:' + alt + ')(?=\\s|$|[,.!?])', 'g'); // מילה שלמה בעברית
const HE_TERMS = [
  [W('(?:ב|על |ל)?(?:ה)?פרק(?:י)? (?:ה)?(?:כף|כפות) (?:ה)?יד(?:יים)?'), 'wrist'], [W('(?:ב|על |ל)?(?:ה)?אמה'), 'forearm'],
  [W('(?:ב|על |ל)?(?:ה)?זרוע'), 'arm'], [W('(?:ב|על |ל)?(?:ה)?כתף'), 'shoulder'], [W('(?:ב|על |ל)?עצם (?:ה)?בריח'), 'collarbone'],
  [W('(?:ב|על |ל)?(?:ה)?צלעות'), 'ribs'], [W('(?:ב|על |ל)?(?:ה)?קרסול'), 'ankle'], [W('(?:ב|על |ל)?(?:ה)?שוק'), 'calf'],
  [W('(?:ב|על |ל)?(?:ה)?ירך|(?:ה)?ירכיים'), 'thigh'], [W('(?:ב|על |ל)?(?:ה)?עורף'), 'back of neck'], [W('(?:ב|על |ל)?(?:ה)?אצבע(?:ות)?'), 'finger'],
  [W('(?:ב|על |ל)?(?:ה)?גב'), 'back'], [W('מאחורי (?:ה)?אוזן'), 'behind ear'],
  [W('עדינ\\S*|עדין|דקיק\\S*'), 'delicate fine line'], [W('קטנ\\S*|קטן|קטנטנ\\S*|קטנטן'), 'small'],
  [W('מינימליסט\\S*'), 'minimalist'], [W('צבעונ\\S*|צבעוני'), 'colorful'], [W('שחור.?אפור'), 'black and grey'],
  [W('ריאליסט\\S*|ריאליזם'), 'realism'], [W('גאומטר\\S*|גיאומטר\\S*'), 'geometric'], [W('כתב יד|כיתוב|כתובת'), 'script lettering']
];
const ADJ = new Set('delicate fine line small tiny little minimalist colorful watercolor black grey gray realism geometric script lettering beautiful cute big large strong simple'.split(' '));
const BODY = new Set('wrist forearm arm shoulder collarbone ribs ankle calf thigh neck finger back ear behind'.split(' '));
const STOP = new Set('a an the of on in at with and or but for to my me i we our your something like want would some very too not that this is are be it its kind'.split(' '));
const ideaState = { text: '', style: '', en: '' };

const WEAK = new Set('strong powerful beautiful cute nice pretty cool special meaningful'.split(' '));
function cleanQuery(en) {
  const raw = String(en).toLowerCase().replace(/[^a-z\s-]/g, ' ').split(/\s+/).filter(Boolean);
  const words = [];
  for (let i = 0; i < raw.length; i++) {
    const w = raw[i];
    if (w === 'not' || w === "don't" || w === 'without') { i += (raw[i + 1] === 'too' || raw[i + 1] === 'very' || raw[i + 1] === 'so') ? 2 : 1; continue; }
    if (w.length < 2 || STOP.has(w) || WEAK.has(w) || w === 'tattoo' || w === 'tattoos') continue;
    if (!words.includes(w)) words.push(w);
  }
  return words;
}
// parts = { nouns: [...], mods: ['delicate fine line', 'small'], body: ['wrist'] }
function buildQueries(parts, style) {
  const nouns = parts.nouns.filter((w) => !ADJ.has(w) && !BODY.has(w)).slice(0, 3);
  const mods = parts.mods.slice(0, 2);
  const body = parts.body.slice(0, 1);
  const join = (arr) => arr.filter(Boolean).join(' ').split(' ').filter((w, i, a) => w && a.indexOf(w) === i).join(' ');
  const main = join([...mods, ...nouns, ...body, style, 'tattoo']);
  const alts = [];
  if (nouns.length) alts.push(join([nouns[0], style || 'fine line', 'tattoo']));
  if (nouns.length && body.length) alts.push(join(['small', nouns[0], body[0], 'tattoo']));
  else if (nouns.length > 1) alts.push(join([nouns[0], nouns[1], 'tattoo ideas']));
  else if (nouns.length) alts.push(join([nouns[0], 'tattoo ideas']));
  return { main, alts: alts.filter((x, i, arr) => x !== main && arr.indexOf(x) === i) };
}
const pinUrl = (q) => `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(q)}`;

async function translateIdea(he) {
  // מונחים מוכרים לפני התרגום, כדי שהתרגום לא "יפספס" אותם
  const mods = [], body = []; let rest = ' ' + he + ' ';
  HE_TERMS.forEach(([re, en]) => { re.lastIndex = 0; if (re.test(rest)) { (BODY.has(en.split(' ').pop()) ? body : mods).push(en); re.lastIndex = 0; rest = rest.replace(re, ' '); } re.lastIndex = 0; });
  rest = rest.replace(/קעקוע\S*/g, ' ').replace(/\s+/g, ' ').trim();
  let en = '';
  if (rest && /[֐-׿]/.test(rest) && CONFIG.healthEndpoint) {
    try {
      const ctl = 'AbortController' in window ? new AbortController() : null;
      const tm = setTimeout(() => ctl && ctl.abort(), 7000);
      const j = await fetch(`${CONFIG.healthEndpoint}?action=translate&q=${encodeURIComponent(rest)}`, { signal: ctl ? ctl.signal : undefined }).then((r) => r.json());
      clearTimeout(tm);
      en = (j && j.ok && j.text) || '';
    } catch (e) { en = ''; }
    if (!en) {
      // גיבוי: שירות תרגום חינמי (MyMemory)
      try {
        const j = await fetch(`https://api.mymemory.translated.net/get?langpair=he|en&q=${encodeURIComponent(rest)}`).then((r) => r.json());
        const tx = j && j.responseStatus === 200 && j.responseData && j.responseData.translatedText;
        if (tx && !/[\u0590-\u05FF]/.test(tx) && !/MYMEMORY WARNING/i.test(tx)) en = tx;
      } catch (e) { /* בלי תרגום – נחפש בעברית */ }
    }
  } else if (!/[֐-׿]/.test(rest)) en = rest;
  if (!en && rest) return null; // אין תרגום – נחפש בעברית
  const words = cleanQuery(en);
  return { nouns: words.filter((w) => !ADJ.has(w) && !BODY.has(w)), mods: [...mods, ...words.filter((w) => ADJ.has(w))], body: [...body, ...words.filter((w) => BODY.has(w))] };
}

views.ideas = () => `
<section class="screen" aria-labelledby="h">
  <div class="stack" style="gap:6px">
    <span class="kicker" style="color:var(--acc);font-weight:700;font-size:.9rem">מחפשים השראה?</span>
    <h1 id="h">ספרו מה בראש – ונפתח לכם לוח רעיונות</h1>
    <p class="muted">כותבים בעברית, במילים שלכם. אנחנו מתרגמים לשפה שפינטרסט מבין הכי טוב.</p>
  </div>
  <form id="idea-form" class="stack" novalidate>
    <div class="field">
      <label for="idea-text">הרעיון שלי</label>
      <textarea id="idea-text" class="fld" rows="3" maxlength="200" placeholder="למשל: פרפר עדין עם פרחים על פרק כף היד">${esc(ideaState.text)}</textarea>
    </div>
    <div class="stack" style="gap:8px">
      <span class="muted" style="font-weight:700;font-size:.9rem">או התחילו מרעיון</span>
      <div class="chips">${IDEA_STARTS.map((x, i) => `<button type="button" class="chip-btn" data-start="${i}">${esc(x.he)}</button>`).join('')}</div>
    </div>
    <button type="submit" class="btn btn-primary" id="idea-go">מצאו לי רעיונות</button>
  </form>
  <div id="idea-out" aria-live="polite"></div>
</section>`;

function renderIdeaOut(q, fallbackHe) {
  const out = $('#idea-out'); if (!out) return;
  if (fallbackHe) {
    const qq = `${fallbackHe} קעקוע`;
    out.innerHTML = `<div class="card stack"><p>לא הצלחנו לתרגם כרגע, אז נחפש בעברית (פחות תוצאות).</p>
      <a class="btn btn-pin" href="${pinUrl(qq)}" target="_blank" rel="noopener">פתיחה בפינטרסט</a></div>`;
    return;
  }
  out.innerHTML = `
  <div class="stack" style="gap:14px">
    <div class="card stack" style="gap:6px">
      <span style="color:var(--acc);font-weight:700;font-size:.85rem">מה נחפש בפינטרסט</span>
      <span class="en-query" dir="ltr">${esc(q.main)}</span>
      <span class="muted" style="font-size:.85rem">תרגמנו למילים שמקעקעים משתמשים בהן והוספנו tattoo.</span>
    </div>
    <div class="stack" style="gap:8px">
      <span style="font-weight:700">סגנון (לא חובה)</span>
      <div class="chips">${IDEA_STYLES.map((x) => `<button type="button" class="chip-btn" data-style="${esc(x.en)}" aria-pressed="${ideaState.style === x.en}">${esc(x.he)}</button>`).join('')}</div>
    </div>
    ${q.alts.length ? `<div class="stack" style="gap:8px"><span style="font-weight:700">עוד כיוונים</span>
      ${q.alts.map((a) => `<a class="alt-link" href="${pinUrl(a)}" target="_blank" rel="noopener"><span dir="ltr">${esc(a)}</span>${icon.fwd}</a>`).join('')}</div>` : ''}
    <a class="btn btn-pin" href="${pinUrl(q.main)}" target="_blank" rel="noopener">פתיחה בפינטרסט</a>
    <p class="muted" style="text-align:center;font-size:.85rem">מצאתם משהו? שמרו צילום מסך וצרפו אותו ל<a href="#/contact">פנייה לתום</a>.</p>
  </div>`;
  $$('#idea-out [data-style]').forEach((b) => b.addEventListener('click', () => {
    ideaState.style = ideaState.style === b.dataset.style ? '' : b.dataset.style;
    renderIdeaOut(buildQueries(ideaState.parts, ideaState.style));
  }));
}

binders.ideas = () => {
  const ta = $('#idea-text');
  $$('[data-start]').forEach((b) => b.addEventListener('click', () => {
    const x = IDEA_STARTS[Number(b.dataset.start)];
    ideaState.text = x.he; ta.value = x.he; ideaState.parts = { nouns: cleanQuery(x.en), mods: [], body: [] }; ideaState.style = '';
    renderIdeaOut(buildQueries(ideaState.parts, ''));
    $('#idea-out').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
  $('#idea-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const he = ta.value.trim(); ideaState.text = he;
    if (!he) { ta.focus(); announce('כתבו רעיון קצר'); return; }
    const btn = $('#idea-go'); btn.disabled = true; btn.textContent = 'מתרגם…';
    const parts = await translateIdea(he);
    btn.disabled = false; btn.textContent = 'מצאו לי רעיונות';
    if (!parts || !(parts.nouns.length + parts.mods.length + parts.body.length)) { renderIdeaOut(null, he); return; }
    ideaState.parts = parts;
    renderIdeaOut(buildQueries(parts, ideaState.style));
    $('#idea-out').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
};

// ---------------------------------------------------------------------
// מבצע החודש – תום מעדכנת בדף הניהול שלה, והאפליקציה מציגה חלון פעם אחת לכל מבצע
// ---------------------------------------------------------------------
const promoUrl = CONFIG.promoEndpoint || (CONFIG.healthEndpoint ? CONFIG.healthEndpoint + '?action=promo' : '');
let promoForce = false;
views.promo = (p) => views.home(p);
binders.promo = () => { promoForce = true; maybeShowPromo(); };

function promoCard() {
  const p = state.promo; if (!p) return '';
  return `<button type="button" class="promo-card" data-open-promo>
    <span class="promo-badge">מבצע החודש</span>
    <span class="promo-card-title">${esc(p.title)}</span>
    <span class="promo-card-until">בתוקף עד ${esc(fmtDate(p.until))} · לפרטים</span>
  </button>`;
}
document.addEventListener('click', (e) => { if (e.target.closest('[data-open-promo]')) { promoForce = true; maybeShowPromo(); } });

function loadPromo() {
  if (!promoUrl) return;
  const ctl = 'AbortController' in window ? new AbortController() : null;
  const t = setTimeout(() => ctl && ctl.abort(), 8000);
  fetch(promoUrl, { signal: ctl ? ctl.signal : undefined })
    .then((r) => r.json())
    .then((j) => {
      const p = j && j.ok && j.promo;
      state.promo = p && p.until >= todayIso() ? p : null;
      const name = location.hash.replace(/^#\/?/, '').split('/')[0] || 'home';
      if (state.promo && (name === 'home' || name === 'promo') && !$('[data-open-promo]')) {
        $('.care-card')?.insertAdjacentHTML('beforebegin', promoCard());
      }
      maybeShowPromo();
    })
    .catch(() => {})
    .finally(() => clearTimeout(t));
}

function maybeShowPromo() {
  const p = state.promo; if (!p) return;
  if (!promoForce && store.get('tt-promo-seen') === p.id) return;
  if (document.body.classList.contains('intro-on')) { setTimeout(maybeShowPromo, 700); return; }
  if ($('#promo-dlg')) return;
  promoForce = false;
  store.set('tt-promo-seen', p.id);
  const dlg = document.createElement('dialog');
  dlg.id = 'promo-dlg'; dlg.className = 'promo-dlg'; dlg.setAttribute('aria-labelledby', 'promo-t');
  const wa = waLink(`היי תום, ראיתי באפליקציה את מבצע החודש – "${p.title}". אשמח לקבוע תור 🙂`);
  dlg.innerHTML = `
    <div class="promo-media${p.image ? '' : ' no-img'}">
      ${p.image ? `<img src="${esc(p.image)}" alt="">` : '<img class="promo-logo" src="assets/img/logo-dark.png" alt="">'}
      <span class="promo-badge">מבצע החודש</span>
      <button type="button" class="icon-btn promo-x" aria-label="סגירה"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    </div>
    <div class="promo-body">
      <h2 id="promo-t">${esc(p.title)}</h2>
      ${p.text ? `<p class="promo-text">${esc(p.text).replace(/\n/g, '<br>')}</p>` : ''}
      <p class="promo-until">בתוקף עד ${esc(fmtDate(p.until))}</p>
      <a class="btn btn-primary" href="${wa}" target="_blank" rel="noopener">לקביעת תור במבצע</a>
      <button type="button" class="btn btn-ghost promo-later">אולי אחר כך</button>
    </div>`;
  document.body.appendChild(dlg);
  const close = () => { dlg.close(); dlg.remove(); if (location.hash.startsWith('#/promo')) history.replaceState(null, '', '#/'); setTimeout(maybeAskPush, 600); };
  $('.promo-x', dlg).addEventListener('click', close);
  $('.promo-later', dlg).addEventListener('click', close);
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
  const img = $('.promo-media img', dlg); if (img) img.addEventListener('error', () => { $('.promo-media', dlg).classList.add('no-img'); img.src = 'assets/img/logo-dark.png'; img.className = 'promo-logo'; }, { once: true });
  if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  $('#promo-t', dlg).setAttribute('tabindex', '-1'); $('#promo-t', dlg).focus();
}

// ---------------------------------------------------------------------
// התראות על מבצעים (OneSignal): אנדרואיד – תוסף מובנה; אתר/אייפון – Web Push
// ---------------------------------------------------------------------
const push = { os: null, native: false };
function initPush() {
  const appId = CONFIG.onesignalAppId; if (!appId) return;
  if (isNative) {
    const go = () => {
      const OS = window.OneSignal; if (!OS || !OS.initialize) return false;
      try {
        OS.initialize(appId);
        OS.Location?.setShared?.(false);
        OS.Notifications.addEventListener('click', () => { location.hash = '#/promo'; });
        push.os = OS; push.native = true;
      } catch (e) { /* לא נורא – בלי התראות */ }
      return true;
    };
    if (!go()) document.addEventListener('deviceready', go, { once: true });
    return;
  }
  if (!('Notification' in window) || !('serviceWorker' in navigator) || location.protocol !== 'https:') return;
  if (isIOS && !isStandalone) return; // באייפון התראות עובדות רק מהאפליקציה שבמסך הבית
  const base = location.pathname.replace(/[^/]*$/, '');
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async (OS) => {
    await OS.init({ appId, serviceWorkerPath: base.slice(1) + 'sw.js', serviceWorkerParam: { scope: base } });
    OS.Notifications.addEventListener('click', () => { location.hash = '#/promo'; });
    push.os = OS;
  });
  const sc = document.createElement('script');
  sc.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js'; sc.defer = true;
  document.head.appendChild(sc);
}

async function pushGranted() {
  const OS = push.os; if (!OS) return true;
  try { return push.native ? await OS.Notifications.hasPermission() : !!OS.Notifications.permission; } catch (e) { return true; }
}

async function maybeAskPush() {
  if (!push.os || $('#push-dlg') || $('#promo-dlg') || store.get('tt-push-asked')) return;
  if (await pushGranted()) return;
  store.set('tt-push-asked', '1');
  const dlg = document.createElement('dialog');
  dlg.id = 'push-dlg'; dlg.className = 'promo-dlg push-dlg'; dlg.setAttribute('aria-labelledby', 'push-t');
  dlg.innerHTML = `
    <div class="promo-body">
      <h2 id="push-t" tabindex="-1">לשמוע ראשונים על מבצעים?</h2>
      <p class="promo-text">תום שולחת התראה רק כשיש מבצע חדש – בערך פעם בחודש. בלי ספאם, ואפשר לכבות בכל רגע.</p>
      <button type="button" class="btn btn-primary" id="push-yes">כן, תעדכנו אותי</button>
      <button type="button" class="btn btn-ghost" id="push-no">לא עכשיו</button>
    </div>`;
  document.body.appendChild(dlg);
  const close = () => { dlg.close(); dlg.remove(); };
  $('#push-no', dlg).addEventListener('click', close);
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
  $('#push-yes', dlg).addEventListener('click', async () => {
    close();
    try {
      if (push.native) await push.os.Notifications.requestPermission(true);
      else await push.os.Notifications.requestPermission();
    } catch (e) { /* המשתמש סירב או שהדפדפן לא תומך */ }
  });
  if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  $('#push-t', dlg).focus();
}

syncTop();
playIntro();
loadPromo();
initPush();
setTimeout(showInstallTip, 3800);
window.addEventListener('hashchange', render);
render();
if (!isNative && 'serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
