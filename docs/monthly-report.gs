/**
 * Tomchu Tattoo – סיכום חודשי במייל
 *
 * ב־1 לכל חודש בבוקר נשלח ל־TomchuTattoo@gmail.com סיכום של החודש הקודם:
 *  - כניסות לאתר (Cloudflare Web Analytics) והשוואה לחודש שלפניו
 *  - הדפים הנצפים ביותר, מאיפה הגיעו, מכשירים
 *  - שוברי מתנה שהוזמנו / אושרו / מומשו
 *
 * הגדרה חד־פעמית:
 *  1. בהגדרות הפרויקט (⚙️ Project Settings → Script Properties) מוסיפים:
 *     CF_ANALYTICS_TOKEN = מפתח Cloudflare עם הרשאת Account Analytics: Read
 *  2. מריצים פעם אחת את monthlyReportInstall (יוצר את התזמון החודשי)
 *  3. לבדיקה: מריצים monthlyReportTest – שולח עכשיו את הסיכום של החודש שעבר
 */

var REPORT_SITE_HOST = 'www.tomchu-tattoo.co.il';
var REPORT_TZ = 'Asia/Jerusalem';

function monthlyReportInstall() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'monthlyReport') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('monthlyReport').timeBased().onMonthDay(1).atHour(9).inTimezone(REPORT_TZ).create();
  Logger.log('התזמון נוצר: ב־1 לכל חודש בסביבות 09:00');
}

function monthlyReportTest() { monthlyReport(); }

function monthlyReport() {
  var now = new Date();
  var y = Number(Utilities.formatDate(now, REPORT_TZ, 'yyyy')), m = Number(Utilities.formatDate(now, REPORT_TZ, 'M'));
  var start = reportMonthStart_(y, m - 1), end = reportMonthStart_(y, m), prevStart = reportMonthStart_(y, m - 2);
  var label = Utilities.formatDate(start, REPORT_TZ, 'MM/yyyy');

  var web = null, webErr = '';
  try { web = reportWeb_(start, end, prevStart); } catch (e) { webErr = String(e.message || e).slice(0, 200); }
  var gifts = null;
  try { gifts = reportGifts_(start, end); } catch (e) { gifts = null; }

  MailApp.sendEmail({
    to: EMAIL_TO,
    subject: '📊 סיכום חודשי לאתר Tomchu Tattoo – ' + label,
    htmlBody: reportHtml_(label, web, webErr, gifts)
  });
}

// חצות (שעון ישראל) של היום הראשון בחודש; m יכול להיות 0 או שלילי
function reportMonthStart_(y, m) {
  while (m < 1) { m += 12; y--; }
  var s = y + '-' + ('0' + m).slice(-2) + '-01T00:00:00';
  var off = Utilities.formatDate(new Date(y, m - 1, 15), REPORT_TZ, 'XXX');
  return new Date(s + off);
}

function reportCf_(token, path, body) {
  var opt = { headers: { Authorization: 'Bearer ' + token }, muteHttpExceptions: true };
  if (body) { opt.method = 'post'; opt.contentType = 'application/json'; opt.payload = JSON.stringify(body); }
  var r = UrlFetchApp.fetch('https://api.cloudflare.com/client/v4' + path, opt);
  var j = JSON.parse(r.getContentText() || '{}');
  if (r.getResponseCode() >= 300 || (j.errors && j.errors.length)) throw new Error('Cloudflare ' + r.getResponseCode() + ': ' + JSON.stringify(j.errors || '').slice(0, 150));
  return j;
}

function reportAccount_(token) {
  var props = PropertiesService.getScriptProperties();
  var acc = props.getProperty('CF_ANALYTICS_ACCOUNT');
  if (acc) return acc;
  acc = reportCf_(token, '/accounts?per_page=5').result[0].id;
  props.setProperty('CF_ANALYTICS_ACCOUNT', acc);
  return acc;
}

function reportWeb_(start, end, prevStart) {
  var token = PropertiesService.getScriptProperties().getProperty('CF_ANALYTICS_TOKEN');
  if (!token) throw new Error('חסר CF_ANALYTICS_TOKEN בהגדרות הסקריפט');
  var acc = reportAccount_(token);
  var q = 'query($acc:String!,$f:AccountRumPageloadEventsAdaptiveGroupsFilter_InputObject,$p:AccountRumPageloadEventsAdaptiveGroupsFilter_InputObject){viewer{accounts(filter:{accountTag:$acc}){' +
    'total:rumPageloadEventsAdaptiveGroups(limit:1,filter:$f){count sum{visits}}' +
    'prev:rumPageloadEventsAdaptiveGroups(limit:1,filter:$p){count sum{visits}}' +
    'pages:rumPageloadEventsAdaptiveGroups(limit:7,orderBy:[count_DESC],filter:$f){count dimensions{requestPath}}' +
    'refs:rumPageloadEventsAdaptiveGroups(limit:7,orderBy:[sum_visits_DESC],filter:$f){sum{visits} dimensions{refererHost}}' +
    'devices:rumPageloadEventsAdaptiveGroups(limit:4,orderBy:[sum_visits_DESC],filter:$f){sum{visits} dimensions{deviceType}}' +
    '}}}';
  var f = { requestHost: REPORT_SITE_HOST, datetime_geq: start.toISOString(), datetime_lt: end.toISOString() };
  var p = { requestHost: REPORT_SITE_HOST, datetime_geq: prevStart.toISOString(), datetime_lt: start.toISOString() };
  var j = reportCf_(token, '/graphql', { query: q, variables: { acc: acc, f: f, p: p } });
  var a = j.data.viewer.accounts[0];
  var t = a.total[0] || { count: 0, sum: { visits: 0 } }, pr = a.prev[0] || { count: 0, sum: { visits: 0 } };
  return {
    visits: t.sum.visits, views: t.count, prevVisits: pr.sum.visits,
    pages: a.pages.map(function (x) { return [x.dimensions.requestPath, x.count]; }),
    refs: a.refs.map(function (x) { return [x.dimensions.refererHost || 'ישירות (הקלדה / קישור שמור)', x.sum.visits]; }),
    devices: a.devices.map(function (x) { return [x.dimensions.deviceType, x.sum.visits]; })
  };
}

function reportGifts_(start, end) {
  var sh = giftSheet_(), n = sh.getLastRow(), out = { created: 0, paid: 0, sum: 0, used: 0 };
  if (n < 2) return out;
  var rows = sh.getRange(2, 1, n - 1, GIFT_HEAD.length).getValues();
  var inMonth = function (v) {
    if (!v) return false;
    var d = v instanceof Date ? v : null;
    if (!d) { var mm = String(v).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/); if (!mm) return false; d = new Date(+mm[3], +mm[2] - 1, +mm[1], 12); }
    return d >= start && d < end;
  };
  rows.forEach(function (r) {
    if (inMonth(r[1])) { out.created++; if (r[2] === GIFT_STATUS.active || r[2] === GIFT_STATUS.used) { out.paid++; out.sum += Number(r[3]) || 0; } }
    if (inMonth(r[12])) out.used++;
  });
  return out;
}

function reportHtml_(label, w, err, g) {
  var esc = function (x) { return String(x).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var num = function (x) { return Number(x || 0).toLocaleString('he-IL'); };
  var pageName = { '/': 'דף הבית', '/works.html': 'עבודות', '/tom.html': 'תום והסטודיו', '/process.html': 'לפני שמגיעים', '/guide.html': 'איזה קעקוע מתאים לי', '/gift.html': 'שובר מתנה', '/contact.html': 'קביעת תור', '/journal.html': 'מאמרים', '/app.html': 'האפליקציה' };
  var devName = { mobile: 'טלפון', desktop: 'מחשב', tablet: 'טאבלט' };
  var table = function (title, rows, map) {
    if (!rows || !rows.length) return '';
    return '<h3 style="margin:22px 0 8px;font-size:16px">' + title + '</h3><table style="width:100%;border-collapse:collapse;font-size:14px">' +
      rows.map(function (r) { return '<tr><td style="padding:6px 0;border-bottom:1px solid #eee">' + esc((map && map[r[0]]) || r[0]) + '</td><td style="padding:6px 0;border-bottom:1px solid #eee;text-align:left;font-weight:700">' + num(r[1]) + '</td></tr>'; }).join('') + '</table>';
  };
  var h = '<div dir="rtl" style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#1a1a1a">' +
    '<h2 style="margin:0 0 4px">סיכום חודשי – ' + esc(label) + '</h2><p style="margin:0 0 18px;color:#666">האתר www.tomchu-tattoo.co.il</p>';
  if (w) {
    var diff = w.prevVisits ? Math.round((w.visits - w.prevVisits) / w.prevVisits * 100) : null;
    h += '<div style="background:#f6f2fb;border-radius:12px;padding:16px">' +
      '<div style="font-size:30px;font-weight:800">' + num(w.visits) + '</div><div>ביקורים באתר (' + num(w.views) + ' צפיות בדפים)</div>' +
      (diff === null ? '' : '<div style="margin-top:6px;color:' + (diff >= 0 ? '#0a7a3a' : '#b42318') + '">' + (diff >= 0 ? '▲ ' : '▼ ') + Math.abs(diff) + '% לעומת החודש הקודם (' + num(w.prevVisits) + ')</div>') +
      '</div>';
    h += table('הדפים הנצפים ביותר', w.pages, pageName) + table('מאיפה הגיעו', w.refs) + table('מכשירים', w.devices, devName);
  } else {
    h += '<p style="color:#b42318">לא הצלחתי לקרוא את נתוני הכניסות החודש: ' + esc(err) + '</p>';
  }
  if (g) {
    h += '<h3 style="margin:22px 0 8px;font-size:16px">שוברי מתנה</h3><p style="margin:0;font-size:14px;line-height:1.7">' +
      'הוזמנו: <b>' + g.created + '</b> · שולמו ואושרו: <b>' + g.paid + '</b> (₪' + num(g.sum) + ') · מומשו: <b>' + g.used + '</b></p>';
  }
  h += '<p style="margin-top:24px;font-size:12px;color:#888">נתוני החיפוש בגוגל מגיעים במייל נפרד מ־Google Search Console. הנתונים כאן כלליים ולא מזהים מבקרים.</p></div>';
  return h;
}

// שליחת הקישור הפרטי לדף ניהול המבצעים גם לאייל (מריצים פעם אחת מהעורך)
function sendPromoAdminLinkToEyal() {
  var key = PropertiesService.getScriptProperties().getProperty('ADMIN_KEY');
  if (!key) throw new Error('אין עדיין מפתח ניהול – להריץ קודם setupPromoAdmin');
  var url = ScriptApp.getService().getUrl() + '?admin=' + key;
  MailApp.sendEmail({
    to: 'pandy2507@gmail.com',
    subject: 'הקישור לניהול "מבצע החודש" – Tomchu Tattoo',
    htmlBody: '<div dir="rtl" style="font-family:Arial;font-size:15px;line-height:1.7">' +
      '<p>זה הקישור הפרטי לעדכון מבצע החודש. מבצע שמפרסמים כאן מופיע אוטומטית גם באפליקציה וגם באתר:</p>' +
      '<p><a href="' + url + '">לפתיחת דף המבצעים</a></p>' +
      '<p><b>להעלאת מבצע:</b> ממלאים כותרת, טקסט קצר ותאריך תוקף (אפשר גם תמונה) ולוחצים שמירה.<br>' +
      '<b>להורדת מבצע:</b> לוחצים "סיום המבצע". מבצע יורד לבד גם כשעובר תאריך התוקף.</p>' +
      '<p>לא לשתף את הקישור – מי שיש לו אותו יכול לשנות את המבצע.</p></div>',
    name: 'Tomchu Tattoo – אתר ואפליקציה'
  });
  return url;
}
