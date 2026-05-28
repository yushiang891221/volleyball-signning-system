const crypto = require("crypto");
const admin = require("firebase-admin");
const { db } = require("./admin");

function getClientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (xff) return String(xff).split(",")[0].trim();
  return req.headers["x-real-ip"] || req.socket?.remoteAddress || "unknown";
}

function hashKey(s) {
  return crypto.createHash("sha256").update(s).digest("hex").slice(0, 32);
}

// 檢查並記錄一次嘗試。如超過上限回 { blocked: true }，否則記下時間戳。
async function checkAndRecord({ scope, ip, windowSec, maxAttempts }) {
  const docId = hashKey(`${scope}:${ip}`);
  const ref = db.collection("rateLimits").doc(docId);
  const now = Date.now();
  const windowStart = now - windowSec * 1000;

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    let attempts = [];
    if (snap.exists) {
      attempts = (snap.data().attempts || []).filter((t) => t > windowStart);
    }
    if (attempts.length >= maxAttempts) {
      const oldest = attempts[0];
      const retryAfter = Math.max(1, Math.ceil((oldest + windowSec * 1000 - now) / 1000));
      return { blocked: true, retryAfter, count: attempts.length };
    }
    attempts.push(now);
    // 保留最近的紀錄即可，避免 doc 無限長大
    if (attempts.length > maxAttempts * 2) {
      attempts = attempts.slice(-maxAttempts * 2);
    }
    tx.set(ref, {
      attempts,
      scope,
      ip,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { blocked: false, count: attempts.length };
  });
}

async function clearAttempts({ scope, ip }) {
  const docId = hashKey(`${scope}:${ip}`);
  try {
    await db.collection("rateLimits").doc(docId).delete();
  } catch (_) {
    // 不存在就忽略
  }
}

module.exports = { checkAndRecord, clearAttempts, getClientIp };
