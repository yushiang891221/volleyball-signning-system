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
  },

  subscribeVenueState(venueId, onData, onError) {
    return getVenueStateRef(venueId).onSnapshot(
      (snap) => {
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
          onData(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        },
        (error) => {
          if (onError) onError(error);
        }
      );
  },

  async getVenueState(venueId) {
    const snap = await getVenueStateRef(venueId).get();
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
  },

  async addMatch(venueId, match) {
    await getVenueMatchesRef(venueId).add({
      ...match,
      finishedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  },

  async clearMatches(venueId) {
    const matchesRef = getVenueMatchesRef(venueId);
    const snap = await matchesRef.get();
    if (snap.empty) {
      return;
    }

    const batch = firebase.firestore().batch();
    snap.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  },

  async ensureUserProfile(uid) {
    await getUserRef(uid).set(
      {
        role: "member",
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    );
  },

  async setUserTeamId(uid, teamId) {
    await getUserRef(uid).set(
      {
        teamId: teamId || null,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    );
  }
};
