const { sha256, getAdminConfig, signToken, cors } = require("./_lib/admin");
const { checkAndRecord, clearAttempts, getClientIp } = require("./_lib/rateLimit");

module.exports = async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ip = getClientIp(req);
  const rl = await checkAndRecord({
    scope: "unlock-system-admin",
    ip,
    windowSec: 900,    // 15 分鐘
    maxAttempts: 10
  });
  if (rl.blocked) {
    res.setHeader("Retry-After", String(rl.retryAfter));
    const mins = Math.ceil(rl.retryAfter / 60);
    return res.status(429).json({
      error: `嘗試太頻繁，請於 ${mins} 分鐘後再試`
    });
  }

  const { password } = req.body || {};
  if (!password) return res.status(400).json({ error: "缺少參數" });

  try {
    const config = await getAdminConfig();
    if (!config?.passwords?.system) return res.status(500).json({ error: "設定不存在" });

    if (sha256(password) !== config.passwords.system) {
      return res.status(401).json({ error: "密碼錯誤" });
    }

    // 成功登入，清空該 IP 的失敗紀錄
    await clearAttempts({ scope: "unlock-system-admin", ip });

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
