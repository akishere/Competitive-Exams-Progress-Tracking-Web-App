// ==================== MILESTONES VIEW ====================
function MilestonesView({ milestonesData, milestones, setMilestones, collapsedTopics, toggleCollapse }) {
  return React.createElement('main', {className:'milestone-panel', style:{flex:1, overflowY:'auto'}},
    React.createElement('h2', {style:{fontSize:'20px',fontWeight:800,marginBottom:'16px'}}, '📅 Weekly Milestones'),
    React.createElement('p', {style:{fontSize:'13px',color:'var(--text-muted)',marginBottom:'20px'}},
      'Track your weekly targets. Check off tasks as you complete them. Share this data with Claude to re-adjust future milestones.'
    ),
    milestonesData.map(week => {
      const weekKey = week.id;
      const wd = milestones[weekKey] || {};
      const tasksDone = week.tasks.filter((_,i) => wd['t'+i]).length;
      const allDone = tasksDone === week.tasks.length;
      const now = new Date();
      const weekStart = new Date(week.start);
      const weekEnd = new Date(week.end);
      const isActive = now >= weekStart && now <= weekEnd;
      const isPast = now > weekEnd;
      const statusClass = week.isBreak ? 'status-break' : allDone ? 'status-done' : isActive ? 'status-active' : 'status-pending';
      const statusText = week.isBreak ? '🏖️ BREAK' : allDone ? '✅ DONE' : isActive ? '▶ ACTIVE' : isPast && !allDone ? '⚠️ BEHIND' : 'PENDING';
      const collapsed = collapsedTopics['wk_'+week.id];

      return React.createElement('div', {key:week.id, className:'week-card'},
        React.createElement('div', {className:'week-card-header', onClick:()=>toggleCollapse('wk_'+week.id)},
          React.createElement('div', null,
            React.createElement('span', {className:'week-label'}, week.label),
            React.createElement('span', {className:'week-dates'}, ' — '+week.dateLabel),
          ),
          React.createElement('div', {style:{display:'flex',alignItems:'center',gap:'10px'}},
            React.createElement('span', {style:{fontSize:'12px',color:'var(--text-muted)',fontFamily:"'JetBrains Mono',monospace"}}, tasksDone+'/'+week.tasks.length),
            React.createElement('span', {className:'week-status '+statusClass}, statusText),
          )
        ),
        !collapsed && React.createElement('div', {className:'week-tasks'},
          week.tasks.map((task, i) => {
            return React.createElement('div', {key:i, className:'week-task'},
              React.createElement('label', {className:'checkbox-wrapper'},
                React.createElement('input', {type:'checkbox', checked:!!wd['t'+i],
                  onChange:e => {
                    const nm = {...milestones, [weekKey]:{...wd, ['t'+i]:e.target.checked}};
                    setMilestones(nm);
                  }
                }),
                React.createElement('span', {className:'checkbox-visual'}, wd['t'+i]?'✓':'')
              ),
              React.createElement('span', {style:{textDecoration:wd['t'+i]?'line-through':'none', opacity:wd['t'+i]?0.5:1}}, task)
            );
          })
        )
      );
    })
  );
}
