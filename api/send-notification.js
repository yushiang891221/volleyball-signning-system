const webpush = require("web-push");
const { db, cors } = require("./_lib/admin");

module.exports = async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return res.status(500).json({ error: "VAPID keys not configured" });
  }
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  const { venueId, teamName, title, body } = req.body;
  if (!venueId || !title) return res.status(400).json({ error: "Missing fields" });

  const snap = teamName
    ? await db.collection("push-subscriptions").doc(venueId).collection("teams").doc(teamName).collection("subscribers").get()
    : await db.collection("push-subscriptions").doc(venueId).collection("subscribers").get();

  if (snap.empty) return res.json({ sent: 0 });

  const payload = JSON.stringify({ title, body: body || "" });
  const results = await Promise.allSettled(
    snap.docs.map(doc => webpush.sendNotification(doc.data().subscription, payload))
  );

  // Remove expired subscriptions (410 = endpoint no longer valid)
  const expired = results
    .map((r, i) => ({ r, doc: snap.docs[i] }))
    .filter(({ r }) => r.status === "rejected" && r.reason?.statusCode === 410);
  await Promise.all(expired.map(({ doc }) => doc.ref.delete()));

  res.json({ sent: results.filter(r => r.status === "fulfilled").length });
};
