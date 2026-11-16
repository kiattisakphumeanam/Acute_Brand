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
 *
 * Headers are lowercase and prefixed customer_ so they stay unambiguous once there are other sheets.
 * customer_id is the member's number from Supabase (ac-001, ac-002, …); rows are matched on customer_user_id.
 */

var SHEET_NAME = "Members";
// Columns are found by header name, so they can be reordered in the sheet; missing ones are added at the end
var HEADERS = [
  "customer_id",
  "customer_user_id",
  "customer_email",
  "customer_full_name",
  "customer_birthday",
  "customer_phone",
  "customer_status",
  "customer_member_since",
  "customer_cancelled_at",
  "customer_updated_at",
];

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
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var values = {
      customer_id: body.customerId,
      customer_user_id: body.userId,
      customer_email: body.email,
      customer_full_name: body.fullName,
      customer_birthday: body.birthday,
      customer_phone: body.phone,
      customer_status: body.status,
      customer_member_since: body.memberSince,
      customer_cancelled_at: body.cancelledAt,
      customer_updated_at: new Date().toISOString(),
    };

    // One row per account, found by customer_user_id (the Supabase account id)
    var userCol = headers.indexOf("customer_user_id") + 1;
    var ids = sheet.getRange(1, userCol, sheet.getLastRow(), 1).getValues();
    var target = sheet.getLastRow() + 1;
    for (var i = 1; i < ids.length; i++) {
      if (ids[i][0] === body.userId) {
        target = i + 1;
        break;
      }
    }

    var range = sheet.getRange(target, 1, 1, headers.length);
    // Columns the script doesn't know (added by the team) keep what's in them
    var row = range.getValues()[0].map(function (old, c) {
      return values.hasOwnProperty(headers[c]) ? values[headers[c]] : old;
    });
    // Plain text, so phone numbers keep their leading 0 or + and dates stay as typed
    range.setNumberFormat("@");
    range.setValues([row]);
  } finally {
    lock.releaseLock();
  }

  return reply({ ok: true });
}

/** Run once from the Apps Script editor (select upgradeSheet → Run) to switch an existing sheet to the new headers now. */
function upgradeSheet() {
  getSheet();
}

function getSheet() {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = book.getSheetByName(SHEET_NAME) || book.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    return sheet;
  }

  if (sheet.getRange(1, 1).getValue() === "User ID") {
    // First version's headers, in this order: rename them and make room for customer_id in front.
    // Existing rows get their customer_id the next time that member saves.
    sheet.insertColumnBefore(1);
    sheet.getRange(1, 1, 1, 8).setValues([[
      "customer_id", "customer_user_id", "customer_email", "customer_full_name",
      "customer_birthday", "customer_phone", "customer_member_since", "customer_updated_at",
    ]]);
  }

  var present = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  HEADERS.forEach(function (name) {
    if (present.indexOf(name) === -1) {
      // Counted here, not with getLastColumn(), which can lag behind the header just written
      present.push(name);
      sheet.getRange(1, present.length).setValue(name);
    }
  });
  return sheet;
}

function reply(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
