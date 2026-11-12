/**
 * Tomchu Tattoo – קבלת הצהרות בריאות מהאפליקציה
 *
 * מה הסקריפט עושה בכל הצהרה שנשלחת:
 *  1. שולח מייל ל־TomchuTattoo@gmail.com עם כל הפרטים + קובץ PDF חתום
 *  2. שומר את ה־PDF בתיקייה "Tomchu – הצהרות בריאות" בדרייב
 *  3. מוסיף שורה לגיליון "Tomchu – הצהרות בריאות" (נוצר אוטומטית)
 *
 * ובנוסף – מבצע החודש:
 *  - האפליקציה שואלת ?action=promo ומקבלת את המבצע הפעיל (או כלום)
 *  - תום מעדכנת את המבצע בדף ניהול פרטי (קישור עם מפתח סודי שנשלח אליה במייל)
 *
 * הכל נשאר בחשבון הגוגל של תום. הוראות התקנה: docs/google-apps-script.md
 */

var SCRIPT_VERSION = 9; // 2: שדות נוספים · 3: התרעות חריגים · 4: מבצע החודש · 5: התראות OneSignal · 6: תרגום לרעיונות מפינטרסט · 7: חיזוק אבטחה · 8: עזרה בכתיבה עם Gemini · 9: כתיבה ישירה עם Gemini API
var EMAIL_TO = 'TomchuTattoo@gmail.com';
var FOLDER_NAME = 'Tomchu – הצהרות בריאות';
var SHEET_NAME = 'Tomchu – הצהרות בריאות';

// הגבלות אבטחה
var MAX_BODY = 1500000;     // גודל מקסימלי של הצהרה (כולל חתימה) – בערך 1.5MB
var MAX_PER_HOUR = 30;      // מקסימום הצהרות בשעה, נגד הצפה
var SIG_RE = /^data:image\/png;base64,[A-Za-z0-9+\/]+={0,2}$/;

// ערך שמתחיל ב־= + - @ ייכנס לגיליון כטקסט ולא כנוסחה
function cell_(v) {
  if (v == null) return '';
  if (typeof v === 'number' || typeof v === 'boolean') return v;
  var s = String(v).slice(0, 2000);
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}

function rateOk_() {
  var cache = CacheService.getScriptCache();
  var k = 'posts-' + Utilities.formatDate(new Date(), 'Asia/Jerusalem', 'yyyyMMddHH');
  var n = Number(cache.get(k) || 0) + 1;
  cache.put(k, String(n), 3700);
  return n <= MAX_PER_HOUR;
}

function doPost(e) {
  try {
    var body = (e && e.postData && e.postData.contents) || '';
    if (body.length > MAX_BODY) return json_({ ok: false, error: 'too large' });
    if (!rateOk_()) return json_({ ok: false, error: 'busy' });
    var d = JSON.parse(body);
    if (d.kind !== 'health') return json_({ ok: false, error: 'unknown kind' });
    if (!d.name || !d.signature || !Array.isArray(d.answers)) return json_({ ok: false, error: 'missing fields' });
    if (!SIG_RE.test(String(d.signature))) return json_({ ok: false, error: 'bad signature' });
    d.answers = d.answers.slice(0, 60);
    d.extraFields = Array.isArray(d.extraFields) ? d.extraFields.slice(0, 20) : [];
    d.consents = Array.isArray(d.consents) ? d.consents.slice(0, 20) : [];
    d.flags = Array.isArray(d.flags) ? d.flags.slice(0, 60) : [];
    // הסטטוס לא נסמך רק על הטלפון: כל תשובת "כן" מסמנת לפחות "לבדיקה"
    var yesCount = d.answers.filter(function (a) { return a && a.a === 'כן'; }).length;
    if (d.flags.some(function (f) { return f && f.level === 'stop'; })) d.review = 'stop';
    if (d.review !== 'stop' && (yesCount || d.minor)) d.review = 'check';
    if (d.review !== 'stop' && d.review !== 'check') d.review = '';

    var when = Utilities.formatDate(new Date(), 'Asia/Jerusalem', 'dd/MM/yyyy HH:mm');
    var html = declarationHtml_(d, when);

    // PDF חתום
    var pdf = HtmlService.createHtmlOutput(html).getAs('application/pdf')
      .setName('הצהרת בריאות – ' + d.name + ' – ' + when.replace(/[\/: ]/g, '-') + '.pdf');
    var sigBlob = Utilities.newBlob(Utilities.base64Decode(String(d.signature).split(',')[1]), 'image/png', 'חתימה – ' + d.name + '.png');

    // שמירה בדרייב
    var file = folder_().createFile(pdf);

    // מייל לתום
    var yes = d.answers.filter(function (a) { return a.a === 'כן'; });
    var review = d.review || (yes.length ? 'check' : '');
    var subject = (review === 'stop' ? '⛔ לא לקעקע עד בירור – ' : review === 'check' ? '⚠ לבדיקה – ' : '') + 'הצהרת בריאות – ' + d.name;
    MailApp.sendEmail({
      to: EMAIL_TO,
      subject: subject,
      htmlBody: html + '<p style="direction:rtl;font-family:Arial">הקובץ נשמר גם בדרייב: <a href="' + file.getUrl() + '">פתיחה</a></p>',
      attachments: [pdf, sigBlob],
      name: 'Tomchu Tattoo – אפליקציה'
    });

    // שורה בגיליון
    var head = ['תאריך שליחה', 'סטטוס', 'שם', 'ת״ז', 'תאריך לידה', 'גיל', 'טלפון', 'אימייל', 'תאריך קעקוע', 'אזור'];
    (d.extraFields || []).forEach(function (x) { head.push(x.label); });
    d.answers.forEach(function (a) { head.push(a.q); });
    head = head.concat(['פירוט', 'קטין', 'הורה/אפוטרופוס', 'אישור פרסום', 'קובץ PDF']);
    var status = review === 'stop' ? '⛔ לא לקעקע עד בירור' : review === 'check' ? '⚠ לבדיקה' : '✔ תקין';
    var row = [when, status, cell_(d.name), "'" + String(d.idnum || ''), cell_(d.dob), cell_(d.age), "'" + String(d.phone || ''), cell_(d.email), cell_(d.tattooDate), cell_(d.area)];
    (d.extraFields || []).forEach(function (x) { row.push(cell_(x && x.value)); });
    d.answers.forEach(function (a) { row.push(cell_(a && a.a)); });
    var pub = (d.consents || []).filter(function (c) { return c && c.id === 'c4'; })[0];
    row = row.concat([cell_(d.details || ''), d.minor ? 'כן' : 'לא',
      d.parent ? cell_(d.parent.name + ' / ' + d.parent.id + ' / ' + d.parent.phone) : '',
      pub && pub.ok ? 'כן' : 'לא', file.getUrl()]);
    sheet_(head.map(cell_)).appendRow(row);

    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'server error' });
  }
}

// בדיקה ידנית: בוחרים את הפונקציה testEmail ולוחצים "הפעלה" – אמור להגיע מייל לדוגמה
function testEmail() {
  var fake = {
    kind: 'health', name: 'בדיקה – לקוח לדוגמה', idnum: '000000018', dob: '1995-05-12', age: 31, phone: '050-1234567', email: '',
    tattooDate: '2026-11-09', area: 'אמה', details: '', minor: false, parent: null,
    answers: [{ q: 'האם את/ה סובל/ת ממחלה כרונית?', a: 'לא' }],
    consents: [{ id: 'c1', text: 'הפרטים נכונים', ok: true }],
    signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
  };
  var res = doPost({ postData: { contents: JSON.stringify(fake) } });
  Logger.log(res.getContent());
}

function declarationHtml_(d, when) {
  var e = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var fd = function (iso) { if (!iso) return ''; var p = String(iso).split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : iso; };
  var td = 'style="border:1px solid #bbb;padding:6px 8px;vertical-align:top"';
  var rows = d.answers.map(function (a) {
    var hl = a.a === 'כן' ? ' style="border:1px solid #bbb;padding:6px 8px;background:#FDE7EF;font-weight:bold;text-align:center"' : ' ' + td.replace('"', '"text-align:center;');
    return '<tr><td ' + td + '>' + e(a.q) + '</td><td' + hl + '>' + e(a.a) + '</td></tr>';
  }).join('');
  var consents = (d.consents || []).map(function (c) {
    return '<tr><td ' + td + '>' + e(c.text) + '</td><td ' + td + ' align="center">' + (c.ok ? '✔' : '—') + '</td></tr>';
  }).join('');
  return '<div dir="rtl" style="font-family:Arial,sans-serif;font-size:13px;color:#111;direction:rtl;text-align:right">' +
    '<h2 style="margin:0 0 4px">הצהרת בריאות – Tomchu Tattoo</h2>' +
    '<p style="margin:0 0 12px;color:#555">נשלח מהאפליקציה ב־' + e(when) + '</p>' +
    flagsBox_(d, e) +
    '<table style="border-collapse:collapse;width:100%">' +
    '<tr><td ' + td + '><b>שם מלא</b></td><td ' + td + '>' + e(d.name) + '</td><td ' + td + '><b>ת״ז</b></td><td ' + td + '>' + e(d.idnum) + '</td></tr>' +
    '<tr><td ' + td + '><b>תאריך לידה</b></td><td ' + td + '>' + fd(d.dob) + ' (גיל ' + e(d.age) + ')</td><td ' + td + '><b>טלפון</b></td><td ' + td + '>' + e(d.phone) + '</td></tr>' +
    '<tr><td ' + td + '><b>תאריך הקעקוע</b></td><td ' + td + '>' + fd(d.tattooDate) + '</td><td ' + td + '><b>אזור</b></td><td ' + td + '>' + e(d.area) + '</td></tr>' +
    (d.email ? '<tr><td ' + td + '><b>אימייל</b></td><td ' + td + ' colspan="3">' + e(d.email) + '</td></tr>' : '') +
    (d.extraFields || []).map(function (x) { return '<tr><td ' + td + '><b>' + e(x.label) + '</b></td><td ' + td + ' colspan="3">' + e(x.value) + '</td></tr>'; }).join('') +
    '</table>' +
    '<h3 style="margin:16px 0 6px">שאלות בריאות</h3>' +
    '<table style="border-collapse:collapse;width:100%">' + rows + '</table>' +
    (d.details ? '<p><b>פירוט:</b> ' + e(d.details) + '</p>' : '') +
    (d.minor && d.parent ? '<h3 style="margin:16px 0 6px">הורה / אפוטרופוס</h3><p>' + e(d.parent.name) + ' · ת״ז ' + e(d.parent.id) + ' · ' + e(d.parent.phone) + '</p>' : '') +
    '<h3 style="margin:16px 0 6px">הצהרות</h3>' +
    '<table style="border-collapse:collapse;width:100%">' + consents + '</table>' +
    '<h3 style="margin:16px 0 6px">' + (d.minor ? 'חתימת ההורה' : 'חתימה') + '</h3>' +
    '<img src="' + d.signature + '" alt="חתימה" style="width:320px;height:auto;border:1px solid #bbb">' +
    '</div>';
}

function flagsBox_(d, e) {
  var flags = d.flags || [];
  if (!flags.length) return '<p style="margin:0 0 12px;padding:8px 12px;background:#E8F5EC;border:1px solid #9BD3AE;border-radius:6px">✔ אין ממצאים חריגים בהצהרה.</p>';
  var stop = flags.some(function (f) { return f.level === 'stop'; });
  var items = flags.map(function (f) {
    return '<li style="margin-bottom:6px"><b>' + (f.level === 'stop' ? '⛔ ' : '⚠ ') + e(f.q) + '</b><br><span style="color:#444">' + e(f.note) + '</span></li>';
  }).join('');
  return '<div style="margin:0 0 14px;padding:10px 14px;border-radius:6px;' + (stop ? 'background:#FDECEA;border:2px solid #D93025' : 'background:#FFF6E0;border:2px solid #E0A800') + '">' +
    '<b style="font-size:14px">' + (stop ? '⛔ לא לקעקע עד בירור' : '⚠ דורש בדיקה לפני הקעקוע') + '</b>' +
    '<ul style="margin:8px 0 0;padding-right:18px">' + items + '</ul>' +
    (d.details ? '<p style="margin:6px 0 0"><b>פירוט הלקוח/ה:</b> ' + e(d.details) + '</p>' : '') + '</div>';
}

function folder_() {
  var it = DriveApp.getFoldersByName(FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER_NAME);
}

function sheet_(head) {
  // מחפשים רק גיליונות (הסקריפט עצמו יכול להיקרא באותו שם)
  var files = DriveApp.getFilesByType(MimeType.GOOGLE_SHEETS), file = null;
  while (files.hasNext()) { var f = files.next(); if (f.getName() === SHEET_NAME && !f.isTrashed()) { file = f; break; } }
  var ss = file ? SpreadsheetApp.open(file) : SpreadsheetApp.create(SHEET_NAME);
  var sh = ss.getSheets()[0];
  if (sh.getLastRow() === 0) { sh.setFrozenRows(1); sh.setRightToLeft(true); }
  // שורת הכותרות תמיד תואמת לטופס הנוכחי
  sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold');
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}


// =====================================================================
// מבצע החודש
// =====================================================================
var PROMO_FOLDER = 'Tomchu – מבצעים';

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.action === 'promo') return json_({ ok: true, promo: activePromo_() });
  if (p.action === 'translate') {
    var q = String(p.q || '').slice(0, 200);
    if (!q) return json_({ ok: false });
    try { return json_({ ok: true, text: LanguageApp.translate(q, 'iw', 'en') }); }
    catch (err) { return json_({ ok: false }); }
  }
  if (p.admin) {
    if (!isAdminKey_(p.admin)) return HtmlService.createHtmlOutput('<p dir="rtl" style="font-family:Arial;font-size:18px;padding:24px">אין גישה.</p>');
    var t = HtmlService.createTemplate(ADMIN_HTML_);
    t.key = p.admin;
    t.promoJson = JSON.stringify(currentPromo_() || null);
    t.pushReady = !!pushKeys_();
    t.aiReady = !!PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    return t.evaluate().setTitle('מבצע החודש – Tomchu')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
  }
  return HtmlService.createHtmlOutput('<p dir="rtl" style="font-family:Arial">Tomchu Tattoo</p>');
}

// הפעלה חד־פעמית מהעורך: יוצר מפתח ניהול ושולח לתום את הקישור לדף הניהול
function setupPromoAdmin() {
  var props = PropertiesService.getScriptProperties();
  var key = props.getProperty('ADMIN_KEY');
  if (!key) { key = Utilities.getUuid().replace(/-/g, ''); props.setProperty('ADMIN_KEY', key); }
  var url = ScriptApp.getService().getUrl() + '?admin=' + key;
  MailApp.sendEmail({
    to: EMAIL_TO,
    subject: 'הקישור לדף "מבצע החודש" של האפליקציה',
    htmlBody: '<div dir="rtl" style="font-family:Arial;font-size:15px">' +
      '<p>זה הקישור הפרטי שלך לעדכון מבצע החודש באפליקציה:</p>' +
      '<p><a href="' + url + '">לפתיחת דף המבצעים</a></p>' +
      '<p>כדאי לשמור אותו במסך הבית של הטלפון. לא לשתף אותו – מי שיש לו את הקישור יכול לשנות את המבצע.</p></div>',
    name: 'Tomchu Tattoo – אפליקציה'
  });
  Logger.log(url);
  return url;
}

function isAdminKey_(k) {
  var key = PropertiesService.getScriptProperties().getProperty('ADMIN_KEY');
  return !!key && String(k) === key;
}

function currentPromo_() {
  var raw = PropertiesService.getScriptProperties().getProperty('PROMO');
  return raw ? JSON.parse(raw) : null;
}

function activePromo_() {
  var p = currentPromo_();
  if (!p || !p.active) return null;
  var today = Utilities.formatDate(new Date(), 'Asia/Jerusalem', 'yyyy-MM-dd');
  if (p.until && p.until < today) return null;
  return { id: p.id, title: p.title, text: p.text, until: p.until, image: p.image || '' };
}

// נקרא מדף הניהול (google.script.run)
function savePromo(key, data) {
  if (!isAdminKey_(key)) throw new Error('אין גישה');
  var title = String(data.title || '').trim().slice(0, 80);
  var text = String(data.text || '').trim().slice(0, 400);
  var until = String(data.until || '').slice(0, 10);
  if (!title) throw new Error('חסרה כותרת');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(until)) throw new Error('חסר תאריך תוקף');
  var old = currentPromo_() || {};
  var image = data.keepImage ? (old.image || '') : '';
  if (data.imageData) {
    var parts = String(data.imageData).split(',');
    var blob = Utilities.newBlob(Utilities.base64Decode(parts[1]), 'image/jpeg', 'מבצע ' + until + '.jpg');
    var it = DriveApp.getFoldersByName(PROMO_FOLDER);
    var folder = it.hasNext() ? it.next() : DriveApp.createFolder(PROMO_FOLDER);
    var f = folder.createFile(blob);
    f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    image = 'https://drive.google.com/thumbnail?id=' + f.getId() + '&sz=w1080';
  }
  var promo = { id: String(Date.now()), active: true, title: title, text: text, until: until, image: image, savedAt: new Date().toISOString() };
  PropertiesService.getScriptProperties().setProperty('PROMO', JSON.stringify(promo));
  var pushed = data.notify ? sendPush_(promo) : 'skipped';
  return { ok: true, promo: promo, push: pushed };
}

function endPromo(key) {
  if (!isAdminKey_(key)) throw new Error('אין גישה');
  var p = currentPromo_();
  if (p) { p.active = false; PropertiesService.getScriptProperties().setProperty('PROMO', JSON.stringify(p)); }
  return { ok: true };
}

// ---------------------------------------------------------------------
// התראות (שלב 2): OneSignal. המפתחות נשמרים ב־Script properties:
//   ONESIGNAL_APP_ID, ONESIGNAL_API_KEY
// כל עוד הם לא מוגדרים – המבצע מתפרסם בלי התראה.
// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
// כתיבת טקסט למבצע עם Gemini (מפתח API בהגדרות הסקריפט: GEMINI_API_KEY)
// ---------------------------------------------------------------------
function aiPromptText_(idea, until) {
  return ['את/ה קופירייטר/ית לסטודיו קעקועים קטן ואישי בשם Tomchu Tattoo, של תום גבע באלפי מנשה.',
    'כתוב/י טקסט ל"מבצע החודש" שמופיע באפליקציה של הסטודיו, ונשלח גם כהתראה לטלפון.', '',
    'המבצע: ' + idea, 'בתוקף עד: ' + (until || 'לא צוין'), '',
    'צריך 3 גרסאות שונות זו מזו בסגנון. בכל גרסה:',
    'title – כותרת קליטה, עד 60 תווים',
    'text – תיאור של 2–3 שורות, עד 350 תווים, חם ואישי, בגוף ראשון של תום (לשון נקבה), עם הנעה לפעולה (לקבוע תור בוואטסאפ)', '',
    'חשוב: לכתוב בבירור את כל תנאי המבצע ואת תאריך התוקף, בלי הבטחות מוגזמות ובלי "הכי זול" (חוק הגנת הצרכן). עברית טבעית, אימוג׳י אחד או שניים לכל היותר.'].join('\n');
}

function aiWrite(k, d) {
  if (!isAdminKey_(k)) throw new Error('אין הרשאה');
  var apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) throw new Error('Gemini עוד לא מחובר');
  var idea = String((d && d.idea) || '').trim().slice(0, 400);
  if (!idea) throw new Error('כתבי קודם על מה המבצע');
  var until = String((d && d.until) || '').split('-').reverse().join('/');
  var payload = {
    contents: [{ role: 'user', parts: [{ text: aiPromptText_(idea, until) }] }],
    generationConfig: {
      temperature: 0.9,
      responseMimeType: 'application/json',
      responseSchema: { type: 'ARRAY', items: { type: 'OBJECT',
        properties: { title: { type: 'STRING' }, text: { type: 'STRING' } }, required: ['title', 'text'] } }
    }
  };
  var models = ['gemini-flash-latest', 'gemini-2.5-flash'];
  var lastErr = '';
  for (var i = 0; i < models.length; i++) {
    var res = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models/' + models[i] + ':generateContent', {
      method: 'post', contentType: 'application/json', headers: { 'x-goog-api-key': apiKey },
      payload: JSON.stringify(payload), muteHttpExceptions: true
    });
    var code = res.getResponseCode();
    if (code === 200) {
      var j = JSON.parse(res.getContentText());
      var txt = j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts[0].text;
      var arr = JSON.parse(txt || '[]');
      return arr.slice(0, 3).map(function (o) {
        return { title: String(o.title || '').slice(0, 80), text: String(o.text || '').slice(0, 400) };
      });
    }
    lastErr = code;
    if (code === 400 || code === 401 || code === 403) break; // מפתח לא תקין – אין טעם לנסות מודל אחר
  }
  throw new Error(lastErr === 429 ? 'Gemini עמוס כרגע – נסי שוב בעוד דקה' : 'Gemini לא ענה (' + lastErr + ')');
}

function pushKeys_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('ONESIGNAL_APP_ID'), k = props.getProperty('ONESIGNAL_API_KEY');
  return id && k ? { id: id, key: k } : null;
}

function sendPush_(promo) {
  var keys = pushKeys_();
  if (!keys) return 'not-configured';
  var res = UrlFetchApp.fetch('https://api.onesignal.com/notifications', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { Authorization: 'Key ' + keys.key },
    payload: JSON.stringify({
      app_id: keys.id,
      target_channel: 'push',
      included_segments: ['Total Subscriptions'],
      headings: { en: 'מבצע החודש אצל תום ✦', he: 'מבצע החודש אצל תום ✦' },
      contents: { en: promo.title, he: promo.title },
      data: { promo: promo.id },
      web_url: 'https://emgapps1987-png.github.io/tomchu-tattoo-app/#/promo'
    })
  });
  return res.getResponseCode() < 300 ? 'sent' : 'error ' + res.getResponseCode();
}

// עזרה בכתיבה עם Gemini – בונה הנחיה מוכנה, מעתיקה אותה ופותחת את Gemini
var AI_JS_ = [
  'function aiPrompt(){',
  '  var idea=document.getElementById("ai-idea").value.trim()||document.getElementById("text").value.trim()||document.getElementById("title").value.trim();',
  '  var u=document.getElementById("until").value;var until=u?u.split("-").reverse().join("/"):"(עוד לא נקבע)";',
  '  return ["את/ה קופירייטר/ית לסטודיו קעקועים קטן ואישי בשם Tomchu Tattoo, של תום גבע באלפי מנשה.",',
  '    "כתוב/י טקסט ל\\"מבצע החודש\\" שמופיע באפליקציה של הסטודיו, ונשלח גם כהתראה לטלפון.","",',
  '    "המבצע: "+(idea||"[לכתוב כאן מה המבצע]"),"בתוקף עד: "+until,"",',
  '    "צריך 3 גרסאות שונות. בכל גרסה:",',
  '    "1. כותרת – עד 60 תווים, קליטה",',
  '    "2. תיאור – 2–3 שורות, עד 350 תווים, חם ואישי, בגוף ראשון של תום (לשון נקבה), עם הנעה לפעולה (לקבוע תור בוואטסאפ)","",',
  '    "חשוב: לכתוב בבירור את כל תנאי המבצע ואת תאריך התוקף, בלי הבטחות מוגזמות ובלי \\"הכי זול\\" (חוק הגנת הצרכן). עברית טבעית, אימוג׳י אחד או שניים לכל היותר."].join("\\n");',
  '}',
  'function aiDone(ok){document.getElementById("ai-msg").innerHTML=ok?"✔ ההנחיה הועתקה. ב־Gemini לוחצים בתיבת הכתיבה, <b>מדביקים</b> ושולחים. את הגרסה שאהבת מעתיקים לשדות הכותרת והתיאור למעלה.":"לא הצלחתי להעתיק אוטומטית – פתחי את \\"מה נשלח ל־Gemini?\\", העתיקי את הטקסט והדביקי ב־Gemini.";}',
  'function aiRefresh(){document.getElementById("ai-prompt").value=aiPrompt();}',
  'function aiCopyOld(t){var ta=document.createElement("textarea");ta.value=t;ta.setAttribute("readonly","");ta.style.position="fixed";ta.style.top="0";ta.style.opacity="0";document.body.appendChild(ta);ta.select();var ok=false;try{ok=document.execCommand("copy");}catch(e){}document.body.removeChild(ta);return ok;}',
  '(function(){',
  '  ["ai-idea","title","text","until"].forEach(function(i){document.getElementById(i).addEventListener("input",aiRefresh);});aiRefresh();',
  '  document.getElementById("ai-go").addEventListener("click",function(){aiRefresh();var t=document.getElementById("ai-prompt").value;',
  '    var ok=aiCopyOld(t);if(!ok&&navigator.clipboard){navigator.clipboard.writeText(t).then(function(){aiDone(true);},function(){});}',
  '    aiDone(ok);var w=window.open("https://gemini.google.com/app","_blank");',
  '    if(!w){document.getElementById("ai-msg").innerHTML+=" <a href=\\"https://gemini.google.com/app\\" target=\\"_blank\\" rel=\\"noopener\\">לפתיחת Gemini</a>";}',
  '  });',
  'var aw=document.getElementById("ai-write");if(aw){aw.addEventListener("click",function(){',
  '  var idea=document.getElementById("ai-idea").value.trim()||document.getElementById("text").value.trim();var out=document.getElementById("ai-out");var msg=document.getElementById("ai-msg");',
  '  if(!idea){msg.textContent="כתבי קודם במילים שלך על מה המבצע.";document.getElementById("ai-idea").focus();return;}',
  '  aw.disabled=true;aw.textContent="Gemini כותב…";msg.textContent="";out.innerHTML="";',
  '  google.script.run.withSuccessHandler(function(list){aw.disabled=false;aw.textContent="✨ עוד הצעות";',
  '    if(!list||!list.length){msg.textContent="לא התקבלו הצעות, נסי שוב.";return;}msg.textContent="בחרי גרסה – היא תיכנס לשדות למעלה, ואפשר לערוך לפני שמפרסמים.";',
  '    list.forEach(function(o){var c=document.createElement("div");c.style.cssText="padding:12px 14px;border-radius:12px;background:#17141A;border:1px solid #4A3F50;display:flex;flex-direction:column;gap:6px";',
  '      var b=document.createElement("b");b.textContent=o.title;var p=document.createElement("div");p.style.cssText="line-height:1.5;white-space:pre-line";p.textContent=o.text;',
  '      var u=document.createElement("button");u.type="button";u.className="sec";u.textContent="להשתמש בזה";u.addEventListener("click",function(){document.getElementById("title").value=o.title;document.getElementById("text").value=o.text;aiRefresh();document.getElementById("title").scrollIntoView({behavior:"smooth",block:"center"});msg.textContent="✔ הטקסט הוכנס לשדות למעלה.";});',
  '      c.appendChild(b);c.appendChild(p);c.appendChild(u);out.appendChild(c);});})',
  '  .withFailureHandler(function(err){aw.disabled=false;aw.textContent="✨ לכתוב לי עם Gemini";msg.textContent="שגיאה: "+err.message;})',
  '  .aiWrite(KEY,{idea:idea,until:document.getElementById("until").value});});}',
  '})();'
].join('\n');

var ADMIN_HTML_ = '<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><base target="_top">' +
'<style>' +
'*{box-sizing:border-box}body{margin:0;background:#0B0A0D;color:#F4EFF4;font-family:Arial,sans-serif;font-size:16px}' +
'main{max-width:520px;margin:0 auto;padding:20px 18px 40px;display:flex;flex-direction:column;gap:16px}' +
'h1{margin:0;font-size:24px}.kick{color:#8FD3C8;font-weight:700;font-size:13px}' +
'label{font-weight:700;font-size:15px;display:block;margin-bottom:6px}' +
'input[type=text],input[type=date],textarea{width:100%;min-height:50px;border-radius:12px;border:1.5px solid #4A3F50;background:#17141A;color:#F4EFF4;padding:12px 14px;font:inherit}' +
'textarea{min-height:96px;resize:vertical;line-height:1.5}' +
'.row{display:flex;gap:10px;align-items:center}.muted{color:#B3A8B6;font-size:13.5px;line-height:1.5}' +
'.check{display:flex;gap:12px;align-items:center;min-height:56px;padding:0 14px;border-radius:14px;background:#17141A;border:1px solid #2C2530}' +
'.check input{width:22px;height:22px;accent-color:#D97AD6}' +
'button{font:inherit;cursor:pointer}.pri{height:54px;border-radius:14px;border:0;background:#A0179C;color:#fff;font-weight:700;font-size:17px}' +
'.sec{height:46px;border-radius:14px;border:1.5px solid #4A3F50;background:transparent;color:#F4EFF4}' +
'.cur{padding:14px;border-radius:14px;background:#211A26;border:1px solid #4A3F50}.cur img{max-width:100%;border-radius:10px;margin-top:8px}' +
'#msg{min-height:22px;font-weight:700}#prev{max-width:100%;border-radius:12px;display:none;margin-top:8px}' +
':focus-visible{outline:3px solid #8AB4FF;outline-offset:2px}' +
'</style></head><body><main>' +
'<div><div class="kick">דף ניהול – רק לתום</div><h1>מבצע החודש</h1></div>' +
'<div id="current" class="cur" aria-live="polite"></div>' +
'<form id="f" class="col" style="display:flex;flex-direction:column;gap:14px">' +
'<div><label for="title">כותרת</label><input type="text" id="title" maxlength="80" required placeholder="למשל: 15% הנחה על קעקוע ראשון"></div>' +
'<div><label for="text">מה המבצע?</label><textarea id="text" maxlength="400" placeholder="2–3 שורות על המבצע"></textarea></div>' +
'<div><label for="until">בתוקף עד</label><input type="date" id="until" required></div>' +
'<div><label for="img">תמונה (לא חובה)</label><input type="file" id="img" accept="image/*"><img id="prev" alt="תצוגה מקדימה"></div>' +
'<label class="check"><input type="checkbox" id="keep" checked> <span>להשאיר את התמונה של המבצע הקודם (אם לא בחרת חדשה)</span></label>' +
'<label class="check"><input type="checkbox" id="notify" <?= pushReady ? "checked" : "disabled" ?>> <span><b>לשלוח התראה עכשיו</b><br><span class="muted"><?= pushReady ? "לכל מי שאישר התראות – פעם אחת" : "ההתראות עוד לא מחוברות (שלב 2)" ?></span></span></label>' +
'<button class="pri" type="submit">לפרסם את המבצע</button>' +
'<button class="sec" type="button" id="end">להוריד את המבצע</button>' +
'<p id="msg" role="status"></p>' +
'<p class="muted"><b>חשוב לפי חוק:</b> לכתוב בתיאור את כל התנאים (למשל "לקעקוע ראשון בלבד", "לא כולל כיסוי"). אחרי תאריך התוקף המבצע יורד לבד. כל מי שנכנס לאפליקציה רואה את החלון פעם אחת לכל מבצע.</p>' +
'</form>' +
'<section class="cur" aria-labelledby="ai-h" style="display:flex;flex-direction:column;gap:12px">' +
'<h2 id="ai-h" style="margin:0;font-size:19px">✨ עזרה בכתיבה עם Gemini</h2>' +
'<p class="muted" style="margin:0">כותבים במילים פשוטות מה המבצע. Gemini יציע כותרת וטקסט פרסומי, ואת מה שאהבת מעתיקים לשדות למעלה.</p>' +
'<div><label for="ai-idea">על מה המבצע? (במילים שלך)</label><textarea id="ai-idea" maxlength="300" placeholder="למשל: 15% הנחה על קעקוע ראשון, רק עד סוף החודש, לא כולל כיסויים"></textarea></div>' +
'<? if (aiReady) { ?><button class="pri" type="button" id="ai-write" style="background:#1A73E8">✨ לכתוב לי עם Gemini</button><div id="ai-out" style="display:flex;flex-direction:column;gap:10px"></div>' +
'<button class="sec" type="button" id="ai-go">או: להעתיק ולפתוח את Gemini</button><? } else { ?>' +
'<button class="pri" type="button" id="ai-go" style="background:#1A73E8">להעתיק ולפתוח את Gemini</button><? } ?>' +
'<p id="ai-msg" class="muted" role="status" style="margin:0"></p>' +
'<details><summary class="muted" style="cursor:pointer">מה נשלח ל־Gemini?</summary><textarea id="ai-prompt" readonly style="margin-top:8px;min-height:160px;font-size:14px"></textarea></details>' +
'</section></main>' +
'<script>' +
AI_JS_ +
'var KEY=<?!= JSON.stringify(key) ?>;var CUR=<?!= promoJson ?>;var imgData=null;' +
'function $(i){return document.getElementById(i)}' +
'function showCur(p){var c=$("current");if(!p||!p.active){c.innerHTML="<b>אין מבצע פעיל כרגע.</b>";return;}' +
'var d=p.until.split("-").reverse().join("/");c.innerHTML="<div class=\\"muted\\">המבצע הפעיל עכשיו</div><b></b><div class=\\"muted\\"></div>"+(p.image?"<img alt=\\"\\">":"");' +
'c.querySelector("b").textContent=p.title;c.querySelectorAll(".muted")[1].textContent="בתוקף עד "+d;if(p.image)c.querySelector("img").src=p.image;}' +
'showCur(CUR);if(CUR){$("title").value=CUR.title||"";$("text").value=CUR.text||"";$("until").value=CUR.until||"";}' +
'$("img").addEventListener("change",function(e){var f=e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(){var im=new Image();im.onload=function(){var s=Math.min(1,1080/Math.max(im.width,im.height));var cv=document.createElement("canvas");cv.width=Math.round(im.width*s);cv.height=Math.round(im.height*s);cv.getContext("2d").drawImage(im,0,0,cv.width,cv.height);imgData=cv.toDataURL("image/jpeg",0.85);$("prev").src=imgData;$("prev").style.display="block";};im.src=r.result;};r.readAsDataURL(f);});' +
'$("f").addEventListener("submit",function(e){e.preventDefault();var b=e.submitter||document.querySelector(".pri");b.disabled=true;$("msg").textContent="מפרסם…";' +
'google.script.run.withSuccessHandler(function(r){b.disabled=false;CUR=r.promo;showCur(CUR);imgData=null;' +
'$("msg").textContent="✔ המבצע פורסם"+(r.push==="sent"?" ונשלחה התראה":r.push==="not-configured"||r.push==="skipped"?"":" (ההתראה לא נשלחה: "+r.push+")");})' +
'.withFailureHandler(function(err){b.disabled=false;$("msg").textContent="שגיאה: "+err.message;})' +
'.savePromo(KEY,{title:$("title").value,text:$("text").value,until:$("until").value,imageData:imgData,keepImage:$("keep").checked,notify:$("notify").checked});});' +
'$("end").addEventListener("click",function(){if(!confirm("להוריד את המבצע מהאפליקציה?"))return;google.script.run.withSuccessHandler(function(){if(CUR)CUR.active=false;showCur(CUR);$("msg").textContent="✔ המבצע הורד";}).endPromo(KEY);});' +
'</script></body></html>';
