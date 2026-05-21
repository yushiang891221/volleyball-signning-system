const { db, verifyToken, cors } = require("./_lib/admin");
const admin = require("firebase-admin");

async function batchDelete(collectionRef) {
  const snap = await collectionRef.get();
  if (snap.empty) return 0;
  const batch = db.batch();
  snap.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
  return snap.size;
}

module.exports = async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const claims = verifyToken(req);
  if (!claims) return res.status(401).json({ error: "未授權，請重新登入" });

  const { action, venueId, teamId, config } = req.body || {};
  const isAdmin = claims.role === "admin" || claims.role === "systemAdmin";
  const isSysAdmin = claims.role === "systemAdmin";

  try {
    // ── 球場管理員操作 ──────────────────────────────────
    if (action === "resetRegistration") {
      if (!isAdmin) return res.status(403).json({ error: "無管理員權限" });
      if (claims.role === "admin" && claims.venueId !== venueId)
        return res.status(403).json({ error: "無此球場權限" });

      const stateRef = db.collection("venues").doc(venueId).collection("state").doc("current");
      await stateRef.set({
        registeredTeams: [],
        registrationHistory: [],
        currentAIndex: null,
        currentBIndex: null,
        scorerIndex: null,
        scorerTeamId: null,
        scoreA: 0, scoreB: 0,
        serving: null,
        finished: false,
        streakTeamId: null,
        streakCount: 0,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      return res.json({ success: true });
    }

    if (action === "resetMatchHistory") {
      if (!isAdmin) return res.status(403).json({ error: "無管理員權限" });
      if (claims.role === "admin" && claims.venueId !== venueId)
        return res.status(403).json({ error: "無此球場權限" });

      const deleted = await batchDelete(
        db.collection("venues").doc(venueId).collection("matches")
      );
      return res.json({ success: true, deleted });
    }

    if (action === "deleteTeam") {
      if (!isAdmin) return res.status(403).json({ error: "無管理員權限" });
      if (claims.role === "admin" && claims.venueId !== venueId)
        return res.status(403).json({ error: "無此球場權限" });
      if (!teamId) return res.status(400).json({ error: "缺少 teamId" });

      const stateRef = db.collection("venues").doc(venueId).collection("state").doc("current");
      const snap = await stateRef.get();
      if (!snap.exists) return res.json({ success: true });

      const data = snap.data();
      const newTeams = (data.registeredTeams || []).filter((t) => t.teamId !== teamId);
      await stateRef.set(
        { registeredTeams: newTeams, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
        { merge: true }
      );
      return res.json({ success: true });
    }

    // ── 系統管理員操作 ──────────────────────────────────
    if (!isSysAdmin) return res.status(403).json({ error: "無系統管理員權限" });

    if (action === "clearMessages") {
      const deleted = await batchDelete(db.collection("messages"));
      return res.json({ success: true, deleted });
    }

    if (action === "clearLeaderboard") {
      const deleted = await batchDelete(db.collection("leaderboard"));
      return res.json({ success: true, deleted });
    }

    if (action === "setConfig") {
      if (!config || typeof config !== "object")
        return res.status(400).json({ error: "缺少 config" });

      const allowed = ["gameDifficulty", "locationCheckEnabled"];
      const update = {};
      for (const k of allowed) {
        if (config[k] !== undefined) update[k] = config[k];
      }
      if (Object.keys(update).length === 0)
        return res.status(400).json({ error: "無有效欄位" });

      await db.collection("config").doc("admin").set(update, { merge: true });
      return res.json({ success: true });
    }

    return res.status(400).json({ error: "未知操作" });
  } catch (e) {
    console.error("[admin-action]", action, e);
    res.status(500).json({ error: "伺服器錯誤" });
  }
};
