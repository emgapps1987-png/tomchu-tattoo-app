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
    <img class="logo-light" src="assets/img/logo-light.png" alt="הלוגו של Tomchu Tattoo – יונק דבש צבעוני">
    <img class="logo-dark" src="assets/img/logo-dark.png" alt="הלוגו של Tomchu Tattoo – יונק דבש צבעוני">
    <span class="feathers" aria-hidden="true"><span style="background:#22A55B"></span><span style="background:#1D93B5"></span><span style="background:#5B4BC4"></span><span style="background:#D41A5E"></span></span>
    <div class="stack">
      <h1 id="h">סטודיו לקעקועים עם נשמה</h1>
      <p class="muted">Fine Line, ריאליזם ורעיונות משוגעים – בסטודיו שקט ואינטימי באלפי מנשה.</p>
    </div>
  </div>

  <div class="stack" style="gap:10px">
    <a class="btn btn-primary" href="#/contact">${icon.pen} רוצה קעקוע – בואו נדבר</a>
    <div class="grid2">
      <a class="btn btn-outline" href="#/health">הצהרת בריאות</a>
      <a class="btn btn-outline" href="https://wa.me/${CONFIG.whatsapp}" target="_blank" rel="noopener">וואטסאפ לתום</a>
    </div>
  </div>

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

  <div class="card stack">
    <h2>איך זה עובד?</h2>
    <ol class="muted" style="margin:0;padding-inline-start:20px;display:flex;flex-direction:column;gap:4px">
      <li>שולחים פנייה עם הרעיון שלכם</li>
      <li>נפגשים לקפה ומעצבים יחד סקיצה אישית</li>
      <li>ממלאים הצהרת בריאות לפני התור</li>
      <li>מתקעקעים – בלי לחץ של זמן</li>
    </ol>
  </div>

  <a class="meet" href="#/about">
    <img src="assets/img/tom-studio.jpg" alt="">
    <span class="stack" style="gap:2px;flex:1">
      <span style="font-family:Rubik,sans-serif;font-weight:700;font-size:1.1rem">היי, אני תום</span>
      <span class="muted" style="font-size:.9rem">אמנית, אמא, ומקעקעת עם נשמה</span>
      <span style="color:var(--vio);font-weight:700;font-size:.9rem">להכיר אותי</span>
    </span>
  </a>

  <div class="stack" style="gap:10px">
    <div class="section-head"><h2>מהעבודות שלי</h2><a class="link-btn" href="#/gallery">לכל העבודות</a></div>
    <ul class="hscroll">
      ${WORKS.slice(0, 6).map((w) => `<li style="flex:0 0 140px"><button type="button" class="thumb-btn" data-photo="${w.id}" style="width:140px;height:175px" aria-label="${esc(w.alt)} – להגדלה"><img src="${w.src}" alt="" loading="lazy"></button></li>`).join('')}
    </ul>
  </div>

  <div class="stack" style="gap:10px">
    <div class="section-head"><h2>מאמרים</h2><a class="link-btn" href="#/articles">לכל המאמרים</a></div>
    <ul class="hscroll">
      ${ARTICLES.map((a) => `<li style="flex:0 0 230px;display:flex"><a class="art-card" href="#/article/${a.id}"><span class="tag">${esc(a.tag)}</span><span style="font-weight:700;line-height:1.35">${esc(a.title)}</span></a></li>`).join('')}
    </ul>
  </div>

  <div class="card stack" style="gap:10px">
    <h2>הסטודיו</h2>
    <p class="muted">${esc(CONFIG.address)} · חניה בחינם</p>
    <div class="row">
      <a class="btn btn-small btn-dark" href="${CONFIG.waze}" target="_blank" rel="noopener">ניווט ב־Waze</a>
      <a class="btn btn-small btn-outline" href="tel:${CONFIG.phoneDisplay.replace(/-/g, '')}">חיוג</a>
      <a class="btn btn-small btn-outline" href="${CONFIG.instagram}" target="_blank" rel="noopener">אינסטגרם</a>
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
  <p style="text-align:center"><a href="#/accessibility">הצהרת נגישות</a></p>
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
    ${CARE.steps.map((s, i) => `<li><span class="rail" aria-hidden="true"><span class="num">${i + 1}</span><span class="line"></span></span>
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
    ${ARTICLES.map((a) => `<li><a class="art-card" href="#/article/${a.id}" style="padding:16px"><span class="tag">${esc(a.tag)}</span><span style="font-family:Rubik,sans-serif;font-weight:700;font-size:1.05rem;line-height:1.35">${esc(a.title)}</span><span class="muted clamp2" style="font-size:.92rem">${esc(a.intro)}</span></a></li>`).join('')}
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
    <div class="field"><label for="h-id">תעודת זהות <span class="req" aria-hidden="true">*</span></label><input id="h-id" name="idnum" class="fld ltr" inputmode="numeric" maxlength="9" required aria-describedby="h-id-err"><span class="err" id="h-id-err"></span></div>
    <div class="grid2">
      <div class="field"><label for="h-dob">תאריך לידה <span class="req" aria-hidden="true">*</span></label><input id="h-dob" name="dob" class="fld" type="date" required aria-describedby="h-dob-err"><span class="err" id="h-dob-err"></span></div>
      <div class="field"><label for="h-phone">טלפון <span class="req" aria-hidden="true">*</span></label><input id="h-phone" name="phone" class="fld ltr" type="tel" autocomplete="tel" required aria-describedby="h-phone-err"><span class="err" id="h-phone-err"></span></div>
    </div>
    <div class="field"><label for="h-email">אימייל (לא חובה)</label><input id="h-email" name="email" class="fld ltr" type="email" autocomplete="email"></div>
    <div class="grid2">
      <div class="field"><label for="h-date">תאריך הקעקוע</label><input id="h-date" name="tdate" class="fld" type="date"></div>
      <div class="field"><label for="h-area">אזור הקעקוע</label><input id="h-area" name="area" class="fld" placeholder="למשל: אמה"></div>
    </div>
    <p class="notice" id="minor-note" hidden>מתחת לגיל 18 נדרשים פרטי הורה/אפוטרופוס וחתימתו – בשלב האחרון.</p>
  </div>

  <div class="stack-lg" data-step="2" hidden>
    ${QUESTIONS.map((q) => `
    <fieldset class="q" id="fs-${q.id}"><legend class="legend" style="float:right;width:100%;margin-bottom:10px">${esc(q.text)}</legend>
      <div class="pills">
        <label class="pill"><input type="radio" name="${q.id}" value="לא"><span>לא</span></label>
        <label class="pill"><input type="radio" name="${q.id}" value="כן"><span>כן</span></label>
      </div></fieldset>`).join('')}
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
    </div>
    ${CONSENTS.map((c) => `<label class="check"><input type="checkbox" name="${c.id}" ${c.required ? 'required' : ''}><span>${esc(c.text)}${c.required ? ' <span class="req" aria-hidden="true">*</span>' : ''}</span></label>`).join('')}
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
  <img class="logo-light" src="assets/img/logo-light.png" alt=""><img class="logo-dark" src="assets/img/logo-dark.png" alt="">
  <h1 id="h">ההצהרה מוכנה – תודה!</h1>
  <p class="muted">${CONFIG.healthEndpoint ? 'ההצהרה נשלחה לתום. נתראה בסטודיו!' : 'עוד צעד אחד: שלחו את ההצהרה לתום. אפשר לשלוח סיכום בוואטסאפ, ולשמור עותק חתום כ־PDF.'}</p>
  ${state.lastHealth && !CONFIG.healthEndpoint ? `
  <a class="btn btn-primary" href="${waLink(healthSummary(state.lastHealth))}" target="_blank" rel="noopener">שליחת הסיכום לתום בוואטסאפ</a>
  <button type="button" class="btn btn-outline" id="print-health">שמירה / הדפסה כ־PDF (עם החתימה)</button>` : ''}
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
      <li>מצב כהה ומצב בהיר, עם ניגודיות צבעים תקינה בשניהם</li>
      <li>ניווט מלא במקלדת ותמיכה בקוראי מסך</li>
      <li>תיאור טקסטואלי לתמונות</li>
      <li>כפתורים ואזורי לחיצה גדולים</li>
      <li>הודעות שגיאה ברורות בטפסים</li>
    </ul>
  </div>
  <div class="stack"><h2>נתקלתם בבעיה?</h2>
    <p>נשמח לשמוע ולתקן. רכזת הנגישות: תום גבע · <a href="tel:${CONFIG.phoneDisplay.replace(/-/g, '')}">${CONFIG.phoneDisplay}</a> · <a href="mailto:${CONFIG.email}">${CONFIG.email}</a></p>
  </div>
  <div class="stack"><h2>נגישות הסטודיו</h2><p class="muted">[להשלמה על ידי תום: האם יש מדרגות בכניסה, חניה צמודה ונגישות לכיסא גלגלים.]</p></div>
  <p class="hint">עודכן לאחרונה: נובמבר 2026</p>
</section>`;

// ---------------------------------------------------------------------
// ניתוב
// ---------------------------------------------------------------------
const titles = { home: 'בית', about: 'תום', gallery: 'עבודות', care: 'מדריך ההחלמה', articles: 'מאמרים', article: 'מאמר', contact: 'פנייה לתום', health: 'הצהרת בריאות', done: 'תודה', accessibility: 'הצהרת נגישות' };
const tabOf = (name, param) => ({ about: 'about', accessibility: 'about', gallery: 'gallery', contact: 'contact', health: 'health', done: param === 'health' ? 'health' : 'contact' }[name] || 'home');

function render() {
  const [rawName, param] = location.hash.replace(/^#\/?/, '').split('/');
  const name = views[rawName] ? rawName : 'home';
  if (name === 'done' && param === 'health' && !state.lastHealth && !CONFIG.healthEndpoint) { location.replace('#/health'); return; }
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
    window.open(waLink(files.length ? text + '\n(אשלח תמונות השראה כאן בצ׳אט)' : text), '_blank', 'noopener');
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
  f.addEventListener('change', () => { saveForm(f, d); updateMinor(); });
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
      errs.push(setErr(f, 'idnum', validIsraeliId(d.idnum) ? '' : 'מספר תעודת הזהות לא תקין'));
      const a = ageFrom(d.dob);
      errs.push(setErr(f, 'dob', a === null ? 'נא לבחור תאריך לידה' : (a < 14 || a > 110) ? 'נא לבדוק את תאריך הלידה' : ''));
      errs.push(setErr(f, 'phone', validPhone(d.phone) ? '' : 'נא למלא מספר טלפון תקין'));
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
      const missing = CONSENTS.filter((c) => c.required && !d[c.id]);
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
    answers: QUESTIONS.map((q) => ({ id: q.id, q: q.text, a: d[q.id] })), details: d.details || '',
    consents: CONSENTS.map((c) => ({ id: c.id, text: c.text, ok: !!d[c.id] })),
    minor, parent: minor ? { name: d.pname, id: d.pid, phone: d.pphone } : null,
    signature
  };
  state.lastHealth = rec;
  const after = () => { state.health = { step: 1 }; state.sigData = null; location.hash = '#/done/health'; };
  if (CONFIG.healthEndpoint) {
    const btn = $('#h-next'); btn.disabled = true; btn.textContent = 'שולח…';
    postJson(CONFIG.healthEndpoint, { kind: 'health', ...rec }).then(after)
      .catch(() => { btn.disabled = false; btn.textContent = 'סיום וחתימה'; alertErr($('#health-form'), 'השליחה נכשלה. בדקו חיבור לאינטרנט ונסו שוב.'); });
  } else after();
}

function healthSummary(r) {
  const yes = r.answers.filter((x) => x.a === 'כן');
  const groups = [
    ['הצהרת בריאות – Tomchu Tattoo'],
    [`שם: ${r.name}`, `ת״ז: ${r.idnum}`, `תאריך לידה: ${fmtDate(r.dob)} (גיל ${r.age})`, `טלפון: ${r.phone}`,
      r.email && `אימייל: ${r.email}`, r.tattooDate && `תאריך הקעקוע: ${fmtDate(r.tattooDate)}`, r.area && `אזור: ${r.area}`],
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
      <tr><td>תאריך הקעקוע</td><td>${fmtDate(r.tattooDate)}</td><td>אזור</td><td>${esc(r.area)}</td></tr></table>
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
// מצב כהה וגודל טקסט
// ---------------------------------------------------------------------
const root = document.documentElement;
function syncTop() {
  const dark = root.getAttribute('data-theme') === 'dark';
  $('#theme-btn').setAttribute('aria-label', dark ? 'מעבר למצב בהיר' : 'מעבר למצב כהה');
  const big = root.classList.contains('big-text');
  $('#text-btn').setAttribute('aria-pressed', String(big));
  $('#text-btn span').textContent = big ? 'טקסט רגיל' : 'טקסט גדול';
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', dark ? '#0B0A0D' : '#FAF6F3'));
}
$('#theme-btn').addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next); store.set('tt-theme', next); syncTop();
});
$('#text-btn').addEventListener('click', () => {
  root.classList.toggle('big-text'); store.set('tt-big', root.classList.contains('big-text') ? '1' : '0'); syncTop();
});

// ---------------------------------------------------------------------
// הפעלה
// ---------------------------------------------------------------------
syncTop();
window.addEventListener('hashchange', render);
render();
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
