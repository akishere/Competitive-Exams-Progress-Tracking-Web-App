// ==================== SUBJECT SIDEBAR ====================
function Sidebar({ module, subjectsData, activeSubject, setActiveSubject, getSubjectStats }) {
  return React.createElement('nav', {className:'sidebar'},
    React.createElement('div', {className:'sidebar-section-label'}, module.sidebarLabel || 'Topics'),
    subjectsData.map(sub => {
      const ss = getSubjectStats(sub.id);
      const p = ss.total ? Math.round(ss.completed/ss.total*100) : 0;
      return React.createElement('div', {
        key:sub.id,
        className:'sidebar-item'+(activeSubject===sub.id?' active':''),
        onClick:()=>setActiveSubject(sub.id)
      },
        React.createElement('span', null,
          React.createElement('span', {className:'emoji'}, sub.emoji),
          sub.name
        ),
        React.createElement('span', {className:'sidebar-progress'}, p+'%')
      );
    })
  );
}
