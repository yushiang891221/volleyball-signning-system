(function () {
  const KEY = "volleyball-fb-stats";

  function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
  }

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (_) { return {}; }
  }

  function track(type, count) {
    const s = load();
    const t = todayKey();
    if (s.date !== t) {
      if (s.date) {
        const hist = Array.isArray(s.history) ? s.history : [];
        hist.unshift({ date: s.date, reads: s.reads || 0, writes: s.writes || 0, deletes: s.deletes || 0 });
        if (hist.length > 6) hist.length = 6;
        s.history = hist;
      }
      s.date = t;
      s.reads = 0;
      s.writes = 0;
      s.deletes = 0;
    }
    s[type] = (s[type] || 0) + (count || 1);
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (_) {}
    // Sync to global Firestore counter — direct call, bypasses FirebaseStats to avoid self-counting
    try {
      if (typeof firebase !== "undefined" && firebase.apps && firebase.apps.length > 0) {
        const d = new Date();
        const docId = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        firebase.firestore().collection("stats").doc(docId).set(
          { [type]: firebase.firestore.FieldValue.increment(count || 1) },
          { merge: true }
        ).catch(() => {});
      }
    } catch (_) {}
  }

  window.FirebaseStats = {
    read: (n) => track("reads", n || 1),
    write: () => track("writes", 1),
    del: (n) => track("deletes", n || 1),
    load
  };
})();

function getVenueDocRef(venueId) {
  return firebase.firestore().collection("venues").doc(venueId);
}

function getVenueStateRef(venueId) {
  return getVenueDocRef(venueId).collection("state").doc("current");
}

function getVenueMatchesRef(venueId) {
  return getVenueDocRef(venueId).collection("matches");
}

function getUserRef(uid) {
  return firebase.firestore().collection("users").doc(uid);
}

window.FirebaseDB = {
  async ensureVenueBaseDoc(venueId, venueName, venueType) {
    const ref = getVenueDocRef(venueId);
    await ref.set(
      {
        name: venueName,
        type: venueType,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    );
    window.FirebaseStats.write();
  },

  subscribeVenueState(venueId, onData, onError) {
    return getVenueStateRef(venueId).onSnapshot(
      (snap) => {
        window.FirebaseStats.read(1);
        onData(snap.exists ? snap.data() : null);
      },
      (error) => {
        if (onError) onError(error);
      }
    );
  },

  subscribeVenueMatches(venueId, onData, onError) {
    return getVenueMatchesRef(venueId)
      .orderBy("finishedAt", "asc")
      .limit(100)
      .onSnapshot(
        (snap) => {
          window.FirebaseStats.read(snap.docs.length || 1);
          onData(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        },
        (error) => {
          if (onError) onError(error);
        }
      );
  },

  async getVenueState(venueId) {
    const snap = await getVenueStateRef(venueId).get();
    window.FirebaseStats.read(1);
    return snap.exists ? snap.data() : null;
  },

  async saveVenueState(venueId, payload) {
    await getVenueStateRef(venueId).set(
      {
        ...payload,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    );
    window.FirebaseStats.write();
  },

  async addMatch(venueId, match) {
    await getVenueMatchesRef(venueId).add({
      ...match,
      finishedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    window.FirebaseStats.write();
  },

  async clearMatches(venueId) {
    const matchesRef = getVenueMatchesRef(venueId);
    const snap = await matchesRef.get();
    window.FirebaseStats.read(snap.docs.length || 1);
    if (snap.empty) {
      return;
    }
    const batch = firebase.firestore().batch();
    snap.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    window.FirebaseStats.del(snap.docs.length);
  },

  async ensureUserProfile(uid) {
    await getUserRef(uid).set(
      {
        role: "member",
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    );
    window.FirebaseStats.write();
  },

  async setUserTeamId(uid, teamId) {
    await getUserRef(uid).set(
      {
        teamId: teamId || null,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    );
    window.FirebaseStats.write();
  },

  subscribeMessages(onData, onError) {
    return firebase.firestore()
      .collection("messages")
      .orderBy("postedAt", "desc")
      .limit(100)
      .onSnapshot(
        (snap) => {
          window.FirebaseStats.read(snap.docs.length || 1);
          onData(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        },
        (error) => { if (onError) onError(error); }
      );
  },

  async addMessage(msg) {
    await firebase.firestore().collection("messages").add({
      ...msg,
      postedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    window.FirebaseStats.write();
  },

  async clearMessages() {
    const snap = await firebase.firestore().collection("messages").get();
    window.FirebaseStats.read(snap.docs.length || 1);
    if (snap.empty) return;
    const batch = firebase.firestore().batch();
    snap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    window.FirebaseStats.del(snap.docs.length);
  },

  subscribeLeaderboard(onData, onError) {
    return firebase.firestore()
      .collection("leaderboard")
      .orderBy("score", "desc")
      .limit(20)
      .onSnapshot(
        (snap) => {
          window.FirebaseStats.read(snap.docs.length || 1);
          onData(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        },
        (error) => { if (onError) onError(error); }
      );
  },

  async addLeaderboardScore(name, score, date) {
    await firebase.firestore().collection("leaderboard").add({
      name, score, date,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    window.FirebaseStats.write();
  },

  subscribeGlobalStats(onData, onError) {
    return firebase.firestore().collection("stats")
      .orderBy(firebase.firestore.FieldPath.documentId(), "desc")
      .limit(7)
      .onSnapshot(
        (snap) => { onData(snap.docs.map((doc) => ({ date: doc.id, ...doc.data() }))); },
        (error) => { if (onError) onError(error); }
      );
  },

  async clearLeaderboard() {
    const snap = await firebase.firestore().collection("leaderboard").get();
    window.FirebaseStats.read(snap.docs.length || 1);
    if (snap.empty) return;
    const batch = firebase.firestore().batch();
    snap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    window.FirebaseStats.del(snap.docs.length);
  }
};
