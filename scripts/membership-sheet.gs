/**
 * ACUTE membership → Google Sheet
 *
 * Receives the account page's "Connect membership" form (src/app/actions/membership.ts) and keeps one row
 * per account: a member who edits their details updates their row instead of adding a new one.
 *
 * Setup
 * 1. Create a Google Sheet. Extensions → Apps Script, paste this file in place of Code.gs.
 * 2. Project Settings → Script properties → add SECRET with a long random value.
 * 3. Deploy → New deployment → type "Web app", Execute as "Me", Who has access "Anyone" → Deploy.
 * 4. In .env.local set MEMBERSHIP_SHEET_URL to the web app URL (…/exec) and MEMBERSHIP_SHEET_SECRET to the same SECRET.
 * After editing this script, Deploy → Manage deployments → edit → New version, or the old code keeps running.
 */

var SHEET_NAME = "Members";
var HEADERS = ["User ID", "Email", "Full name", "Birthday", "Phone", "Member since", "Updated at"];

function doPost(e) {
  var body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return reply({ ok: false, error: "bad_json" });
  }

  var secret = PropertiesService.getScriptProperties().getProperty("SECRET");
  if (!secret || body.secret !== secret) return reply({ ok: false, error: "unauthorized" });

  // Two members saving at the same moment must not both append to the same empty row
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = getSheet();
    var row = [body.userId, body.email, body.fullName, body.birthday, body.phone, body.memberSince, new Date().toISOString()];

    var ids = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues();
    var target = sheet.getLastRow() + 1;
    for (var i = 1; i < ids.length; i++) {
      if (ids[i][0] === body.userId) {
        target = i + 1;
        break;
      }
    }

    var range = sheet.getRange(target, 1, 1, HEADERS.length);
    // Plain text, so phone numbers keep their leading 0 or + and dates stay as typed
    range.setNumberFormat("@");
    range.setValues([row]);
  } finally {
    lock.releaseLock();
  }

  return reply({ ok: true });
}

function getSheet() {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = book.getSheetByName(SHEET_NAME) || book.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function reply(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
