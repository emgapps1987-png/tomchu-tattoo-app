/**
 * Tomchu Tattoo – קבלת הצהרות בריאות מהאפליקציה
 *
 * מה הסקריפט עושה בכל הצהרה שנשלחת:
 *  1. שולח מייל ל־TomchuTattoo@gmail.com עם כל הפרטים + קובץ PDF חתום
 *  2. שומר את ה־PDF בתיקייה "Tomchu – הצהרות בריאות" בדרייב
 *  3. מוסיף שורה לגיליון "Tomchu – הצהרות בריאות" (נוצר אוטומטית)
 *
 * הכל נשאר בחשבון הגוגל של תום. הוראות התקנה: docs/google-apps-script.md
 */

var EMAIL_TO = 'TomchuTattoo@gmail.com';
var FOLDER_NAME = 'Tomchu – הצהרות בריאות';
var SHEET_NAME = 'Tomchu – הצהרות בריאות';

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    if (d.kind !== 'health') return json_({ ok: false, error: 'unknown kind' });
    if (!d.name || !d.idnum || !d.signature || !d.answers) return json_({ ok: false, error: 'missing fields' });

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
    var subject = 'הצהרת בריאות חדשה – ' + d.name + (yes.length ? ' ⚠ יש תשובות "כן"' : '');
    MailApp.sendEmail({
      to: EMAIL_TO,
      subject: subject,
      htmlBody: html + '<p style="direction:rtl;font-family:Arial">הקובץ נשמר גם בדרייב: <a href="' + file.getUrl() + '">פתיחה</a></p>',
      attachments: [pdf, sigBlob],
      name: 'Tomchu Tattoo – אפליקציה'
    });

    // שורה בגיליון
    var head = ['תאריך שליחה', 'שם', 'ת״ז', 'תאריך לידה', 'גיל', 'טלפון', 'אימייל', 'תאריך קעקוע', 'אזור'];
    d.answers.forEach(function (a) { head.push(a.q); });
    head = head.concat(['פירוט', 'קטין', 'הורה/אפוטרופוס', 'אישור פרסום', 'קובץ PDF']);
    var row = [when, d.name, "'" + d.idnum, d.dob, d.age, "'" + d.phone, d.email, d.tattooDate, d.area];
    d.answers.forEach(function (a) { row.push(a.a); });
    var pub = (d.consents || []).filter(function (c) { return c.id === 'c4'; })[0];
    row = row.concat([d.details || '', d.minor ? 'כן' : 'לא',
      d.parent ? (d.parent.name + ' / ' + d.parent.id + ' / ' + d.parent.phone) : '',
      pub && pub.ok ? 'כן' : 'לא', file.getUrl()]);
    sheet_(head).appendRow(row);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
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
    '<table style="border-collapse:collapse;width:100%">' +
    '<tr><td ' + td + '><b>שם מלא</b></td><td ' + td + '>' + e(d.name) + '</td><td ' + td + '><b>ת״ז</b></td><td ' + td + '>' + e(d.idnum) + '</td></tr>' +
    '<tr><td ' + td + '><b>תאריך לידה</b></td><td ' + td + '>' + fd(d.dob) + ' (גיל ' + e(d.age) + ')</td><td ' + td + '><b>טלפון</b></td><td ' + td + '>' + e(d.phone) + '</td></tr>' +
    '<tr><td ' + td + '><b>תאריך הקעקוע</b></td><td ' + td + '>' + fd(d.tattooDate) + '</td><td ' + td + '><b>אזור</b></td><td ' + td + '>' + e(d.area) + '</td></tr>' +
    (d.email ? '<tr><td ' + td + '><b>אימייל</b></td><td ' + td + ' colspan="3">' + e(d.email) + '</td></tr>' : '') +
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

function folder_() {
  var it = DriveApp.getFoldersByName(FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER_NAME);
}

function sheet_(head) {
  var files = DriveApp.getFilesByName(SHEET_NAME);
  var ss = files.hasNext() ? SpreadsheetApp.open(files.next()) : SpreadsheetApp.create(SHEET_NAME);
  var sh = ss.getSheets()[0];
  if (sh.getLastRow() === 0) { sh.appendRow(head); sh.setFrozenRows(1); sh.setRightToLeft(true); }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
