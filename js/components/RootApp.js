// ==================== ROOT APP (auth + module routing) ====================
function RootApp() {
  const [authUser, setAuthUser] = React.useState(undefined); // undefined=checking, null=logged out
  const [activeModuleId, setActiveModuleId] = React.useState(() => localStorage.getItem('last_module_id') || null);

  React.useEffect(() => {
    if (!auth) { setAuthUser(null); return; }
    return auth.onAuthStateChanged(setAuthUser);
  }, []);

  if (!FIREBASE_READY) return React.createElement(SetupRequiredScreen);

  if (authUser === undefined) {
    return React.createElement('div', {className:'login-screen'}, React.createElement('div', {className:'login-card'}, 'Loading…'));
  }

  if (!authUser) return React.createElement(LoginScreen);

  if (!activeModuleId) {
    return React.createElement(ModuleSelector, {
      uid: authUser.uid,
      onSelect: id => { localStorage.setItem('last_module_id', id); setActiveModuleId(id); },
      onLogout: () => { localStorage.removeItem('last_module_id'); auth.signOut(); },
    });
  }

  const module = MODULES.find(m => m.id === activeModuleId);
  return React.createElement(ModuleTracker, {
    key: module.id,
    uid: authUser.uid,
    module,
    onBack: () => { localStorage.removeItem('last_module_id'); setActiveModuleId(null); },
    onLogout: () => { localStorage.removeItem('last_module_id'); setActiveModuleId(null); auth.signOut(); },
  });
}
