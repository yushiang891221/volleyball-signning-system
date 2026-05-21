const { db, cors } = require("./_lib/admin");

module.exports = async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { subscription, venueId } = req.body;
  if (!subscription || !venueId) return res.status(400).json({ error: "Missing fields" });

  const key = Buffer.from(subscription.endpoint)
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 128);

  await db.collection("push-subscriptions").doc(venueId)
    .collection("subscribers").doc(key)
    .set({ subscription, updatedAt: new Date().toISOString() });

  res.json({ ok: true });
};
