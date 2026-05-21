const { getAdminConfig, cors } = require("./_lib/admin");

module.exports = async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const config = await getAdminConfig();
    res.json({
      gameDifficulty: config?.gameDifficulty ?? "medium",
      locationCheckEnabled: config?.locationCheckEnabled ?? true,
      vapidPublicKey: process.env.VAPID_PUBLIC_KEY || null
    });
  } catch (_) {
    res.json({ gameDifficulty: "medium", locationCheckEnabled: true, vapidPublicKey: null });
  }
};
