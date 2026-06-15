// ==================== APP HEADER ====================
function AppHeader({ module, stats, view, setView, setShowExport, onBack, onLogout }) {
  return React.createElement('header', {className:'app-header'},
    React.createElement('div', {className:'top-bar'},
      React.createElement('div', null,
        React.createElement('h1', null, module.emoji+' '+module.name+' — Progress Tracker'),
        module.targetDate && React.createElement('div', {className:'subtitle'},
          module.targetLabel+': '+new Date(module.targetDate).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})+
          ' • '+Math.ceil((new Date(module.targetDate)-new Date())/(1000*60*60*24))+' days remaining'
        )
      ),
      React.createElement('div', {className:'header-stats'},
        React.createElement('div', {className:'stat-pill green'},
          React.createElement('span', null, 'Done '),
          React.createElement('span', {className:'num'}, stats.completed+'/'+stats.total)
        ),
        React.createElement('div', {className:'stat-pill amber'},
          React.createElement('span', null, 'Rev 1 '),
          React.createElement('span', {className:'num'}, stats.rev1)
        ),
        React.createElement('div', {className:'stat-pill purple'},
          React.createElement('span', null, 'Rev 2 '),
          React.createElement('span', {className:'num'}, stats.rev2)
        ),
      ),
      React.createElement('div', {className:'header-actions'},
        React.createElement('button', {className:'btn'+(view===VIEW.SUBJECTS?' primary':''), onClick:()=>setView(VIEW.SUBJECTS)}, '📋 Subjects'),
        React.createElement('button', {className:'btn'+(view===VIEW.MILESTONES?' primary':''), onClick:()=>setView(VIEW.MILESTONES)}, '📅 Milestones'),
        React.createElement('button', {className:'btn', onClick:()=>setShowExport(true)}, '💾 Export / Import'),
        React.createElement('button', {className:'btn', onClick:onBack}, '🗂️ Modules'),
        React.createElement('button', {className:'btn danger', onClick:onLogout}, '🚪 Logout'),
      )
    )
  );
}
