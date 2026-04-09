function getVenueDocRef(venueId) {
  return firebase.firestore().collection("venues").doc(venueId);
}

function getVenueStateRef(venueId) {
  return getVenueDocRef(venueId).collection("state").doc("current");
}

function getVenueMatchesRef(venueId) {
  return getVenueDocRef(venueId).collection("matches");
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
      .orderBy("finishedAt", "desc")
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
  }
};
