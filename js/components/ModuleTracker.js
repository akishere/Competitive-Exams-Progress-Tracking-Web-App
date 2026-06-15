// ==================== MODULE TRACKER (Firestore-backed wrapper around TrackerApp) ====================
function ModuleTracker({ uid, module, onBack, onLogout }) {
  const { data, setData, milestones, setMilestones, loading } = useModuleData(uid, module.id);
  if (loading) {
    return React.createElement('div', {className:'login-screen'},
      React.createElement('div', {className:'login-card'}, 'Loading '+module.name+'…')
    );
  }
  return React.createElement(TrackerApp, { uid, module, data, setData, milestones, setMilestones, onBack, onLogout });
}
