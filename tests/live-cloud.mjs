// Opt-in integration check against real Postgres + a running Aasra server.
// Creates disposable accounts with random passwords; removes only their exact IDs.
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { Pool } from "pg";
const base = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const url = new URL(
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL,
);
url.searchParams.set("sslmode", "verify-full");
const database = new Pool({
  connectionString: url.toString(),
  max: 1,
  connectionTimeoutMillis: 10000,
});
const created = [];
function client() {
  const cookies = new Map();
  return async (path, body, method = body === undefined ? "GET" : "POST") => {
    const response = await fetch(base + path, {
      method,
      headers: {
        Origin: base,
        "Content-Type": "application/json",
        Cookie: [...cookies].map(([k, v]) => `${k}=${v}`).join("; "),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: AbortSignal.timeout(20000),
    });
    for (const cookie of response.headers.getSetCookie()) {
      const pair = cookie.split(";")[0];
      const separator = pair.indexOf("=");
      cookies.set(pair.slice(0, separator), pair.slice(separator + 1));
    }
    return { status: response.status, data: await response.json() };
  };
}
async function newAccount(api) {
  const suffix = randomBytes(6).toString("hex");
  const username = "qa_" + suffix;
  const password = randomBytes(24).toString("base64url");
  const result = await api("/api/auth/sign-up/email", {
    username,
    name: username,
    email: `${username}@example.test`,
    password,
  });
  assert.equal(result.status, 200, "signup must succeed");
  created.push(result.data.user.id);
  return { id: result.data.user.id, username, password };
}
try {
  const first = client(),
    second = client(),
    guest = client();
  const account = await newAccount(first);
  assert.equal((await guest("/api/data")).status, 401);
  console.log("PASS: unauthenticated records denied");
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const snapshot = {
    version: 1,
    entries: [
      {
        id: "qa-entry",
        type: "income",
        category: "wages",
        date: today,
        amountPaise: 12345,
      },
    ],
    messages: [
      { role: "user", text: "Integration test question (disposable)." },
      {
        role: "assistant",
        text: "Integration test fixture only; no AI request was made.",
      },
    ],
    grievance: {
      facts: {
        name: "",
        employer: "QA employer",
        issue: "unpaid",
        incident: today,
        disputed: "123.45",
        description: "Disposable integration-test facts.",
        resolution: "Review the test payment.",
      },
      draft: "Disposable editable test draft, not submitted.",
      outputLanguage: "en",
    },
  };
  const saved = await first(
    "/api/data",
    { data: snapshot, revision: 0 },
    "PUT",
  );
  assert.equal(saved.status, 200);
  assert.equal(saved.data.revision, 1);
  const restored = await first("/api/data");
  assert.deepEqual(restored.data.data, snapshot);
  console.log("PASS: earnings, chat and draft read back from real database");
  assert.equal(
    (await first("/api/data", { data: snapshot, revision: 0 }, "PUT")).status,
    409,
  );
  console.log("PASS: stale writes rejected");
  await newAccount(second);
  assert.equal((await second("/api/data")).data.data, null);
  assert.equal(
    (
      await second(
        "/api/data",
        { data: snapshot, revision: 0, userId: account.id },
        "PUT",
      )
    ).status,
    400,
  );
  console.log(
    "PASS: second account cannot read or target first account records",
  );
  const stored = await database.query(
    'SELECT password FROM account WHERE "userId"=$1',
    [account.id],
  );
  assert.ok(
    stored.rows[0].password && stored.rows[0].password !== account.password,
  );
  console.log("PASS: password is hashed in database");
  assert.equal((await first("/api/auth/sign-out", {})).status, 200);
  assert.equal((await first("/api/data")).status, 401);
  assert.equal(
    (
      await first("/api/auth/sign-in/username", {
        username: account.username,
        password: account.password,
      })
    ).status,
    200,
  );
  assert.deepEqual((await first("/api/data")).data.data, snapshot);
  console.log("PASS: username/password re-login restores saved data");
} finally {
  for (const id of created)
    await database.query('DELETE FROM "user" WHERE id=$1', [id]);
  await database.end();
  console.log("Disposable test accounts removed.");
}
