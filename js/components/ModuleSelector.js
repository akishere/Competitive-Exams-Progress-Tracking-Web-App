// ==================== MODULE SELECTOR ====================
function ModuleSelector({ uid, onSelect, onLogout }) {
  const [progress, setProgress] = React.useState({});

  React.useEffect(() => {
    if (!db || !uid) return;
    MODULES.forEach(mod => {
      db.collection('users').doc(uid).collection('modules').doc(mod.id).get().then(snap => {
        const d = snap.exists ? (snap.data().data || {}) : {};
        let total = 0, completed = 0;
        mod.subjectsData.forEach(sub => sub.topics.forEach(topic => topic.subtopics.forEach((_, idx) => {
          total++;
          if ((d[getSubtopicKey(sub.id, topic.id, idx)] || {}).completed) completed++;
        })));
        setProgress(prev => ({...prev, [mod.id]: total ? Math.round(completed/total*100) : 0}));
      }).catch(()=>{});
    });
  }, [uid]);

  return React.createElement('div', null,
    React.createElement('header', {className:'app-header'},
      React.createElement('div', {className:'top-bar'},
        React.createElement('div', null,
          React.createElement('h1', null, '🗂️ Exam Prep Tracker'),
          React.createElement('div', {className:'subtitle'}, 'Choose a module to continue')
        ),
        React.createElement('div', {className:'header-actions'},
          React.createElement('button', {className:'btn danger', onClick:onLogout}, '🚪 Logout')
        )
      )
    ),
    React.createElement('div', {className:'module-grid'},
      MODULES.map(mod => React.createElement('div', {
        key:mod.id, className:'module-card', onClick:()=>onSelect(mod.id)
      },
        React.createElement('div', {className:'module-card-emoji'}, mod.emoji),
        React.createElement('div', {className:'module-card-name'}, mod.name),
        React.createElement('div', {className:'module-card-tagline'}, mod.tagline || ''),
        React.createElement('div', {className:'progress-bar-outer'},
          React.createElement('div', {className:'progress-bar-inner', style:{width:(progress[mod.id]||0)+'%'}})
        ),
        React.createElement('div', {className:'module-card-pct'}, (progress[mod.id]||0)+'% complete')
      ))
    )
  );
}
