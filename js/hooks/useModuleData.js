// Realtime Firestore-backed progress for one module, with debounced writes
// and a one-time migration from the old localStorage keys for the UPSC module.
function useModuleData(uid, moduleId) {
  const [data, setDataState] = React.useState({});
  const [milestones, setMilestonesState] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const latest = React.useRef({ data:{}, milestones:{} });
  const saveTimer = React.useRef(null);

  const docRef = React.useMemo(() => {
    if (!db || !uid || !moduleId) return null;
    return db.collection('users').doc(uid).collection('modules').doc(moduleId);
  }, [uid, moduleId]);

  React.useEffect(() => {
    if (!docRef) { setLoading(false); return; }
    setLoading(true);
    const unsub = docRef.onSnapshot(snap => {
      let d = {}, m = {};
      if (snap.exists) {
        const doc = snap.data() || {};
        d = doc.data || {};
        m = doc.milestones || {};
      } else if (moduleId === 'upsc') {
        try { d = JSON.parse(localStorage.getItem('upsc_tracker_v2')) || {}; } catch {}
        try { m = JSON.parse(localStorage.getItem('upsc_milestones_v2')) || {}; } catch {}
        docRef.set({ data:d, milestones:m, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
      }
      latest.current = { data:d, milestones:m };
      setDataState(d);
      setMilestonesState(m);
      setLoading(false);
    }, () => setLoading(false));
    return () => { unsub(); clearTimeout(saveTimer.current); };
  }, [docRef]);

  function scheduleSave() {
    if (!docRef) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      docRef.set({
        data: latest.current.data,
        milestones: latest.current.milestones,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge:true });
    }, 800);
  }

  function setData(updater) {
    setDataState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      latest.current.data = next;
      scheduleSave();
      return next;
    });
  }

  function setMilestones(updater) {
    setMilestonesState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      latest.current.milestones = next;
      scheduleSave();
      return next;
    });
  }

  return { data, setData, milestones, setMilestones, loading };
}
