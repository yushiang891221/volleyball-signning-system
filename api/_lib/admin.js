const admin = require("firebase-admin");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();

function sha256(str) {
  return crypto.createHash("sha256").update(str).digest("hex");
}

async function getAdminConfig() {
  const snap = await db.collection("config").doc("admin").get();
  return snap.exists ? snap.data() : null;
}

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "4h" });
}

function verifyToken(req) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (_) {
    return null;
  }
}

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

module.exports = { db, sha256, getAdminConfig, signToken, verifyToken, cors };
