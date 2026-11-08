// Google Apps Script – מקבל פניות והצהרות מהאפליקציה ושומר בגיליון.
// הוראות: docs/google-apps-script.md

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (data.kind === 'contact') {
    var sh = sheet_(ss, 'פניות', ['תאריך', 'שם', 'טלפון', 'סוג', 'הרעיון', 'מיקום', 'גודל', 'מתי נוח']);
    sh.appendRow([new Date(), data.name, "'" + data.phone, data.type, data.idea, data.place, data.size, data.when]);
  }

  if (data.kind === 'health') {
    var sigUrl = '';
    if (data.signature) {
      var folder = folder_('Tomchu – חתימות');
      var bytes = Utilities.base64Decode(data.signature.split(',')[1]);
      var file = folder.createFile(Utilities.newBlob(bytes, 'image/png', data.name + ' ' + data.submittedAt + '.png'));
      sigUrl = file.getUrl();
    }
    var head = ['תאריך', 'שם', 'ת״ז', 'תאריך לידה', 'גיל', 'טלפון', 'אימייל', 'תאריך קעקוע', 'אזור'];
    data.answers.forEach(function (a) { head.push(a.q); });
    head = head.concat(['פירוט', 'קטין', 'הורה', 'אישור פרסום', 'חתימה']);
    var sh2 = sheet_(ss, 'הצהרות', head);
    var row = [new Date(), data.name, "'" + data.idnum, data.dob, data.age, "'" + data.phone, data.email, data.tattooDate, data.area];
    data.answers.forEach(function (a) { row.push(a.a); });
    var publish = data.consents.filter(function (c) { return c.id === 'c4'; })[0];
    row = row.concat([data.details, data.minor ? 'כן' : 'לא',
      data.parent ? (data.parent.name + ' / ' + data.parent.id + ' / ' + data.parent.phone) : '',
      publish && publish.ok ? 'כן' : 'לא', sigUrl]);
    sh2.appendRow(row);
  }

  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}

function sheet_(ss, name, header) {
  var sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(header); sh.setFrozenRows(1); sh.setRightToLeft(true); }
  return sh;
}

function folder_(name) {
  var it = DriveApp.getFoldersByName(name);
  return it.hasNext() ? it.next() : DriveApp.createFolder(name);
}
