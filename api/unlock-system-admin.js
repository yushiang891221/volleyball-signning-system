const { sha256, getAdminConfig, signToken, cors } = require("./_lib/admin");

module.exports = async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { password } = req.body || {};
  if (!password) return res.status(400).json({ error: "缺少參數" });

  try {
    const config = await getAdminConfig();
    if (!config?.passwords?.system) return res.status(500).json({ error: "設定不存在" });

    if (sha256(password) !== config.passwords.system) {
      return res.status(401).json({ error: "密碼錯誤" });
    }

    res.json({
      token: signToken({ role: "systemAdmin" }),
      gameDifficulty: config.gameDifficulty ?? "medium",
      locationCheckEnabled: config.locationCheckEnabled ?? true
    });
  } catch (e) {
    console.error("[unlock-system-admin]", e);
    res.status(500).json({ error: "伺服器錯誤" });
  }
};
