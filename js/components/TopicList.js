// ==================== TOPIC LIST (with PYQ panels) ====================
function TopicList({ activeSub, filter, search, collapsedTopics, toggleCollapse, expandedPyq, togglePyq, getPyqsForSubtopic, getTopicStats, data, updateField }) {
  return activeSub.topics.filter(topic => {
    if (filter === FILTER.STATIC && topic.type !== 'static') return false;
    if (filter === FILTER.DYNAMIC && topic.type !== 'dynamic') return false;
    if (search) {
      const q = search.toLowerCase();
      if (topic.name.toLowerCase().includes(q)) return true;
      return topic.subtopics.some(s => s.toLowerCase().includes(q));
    }
    return true;
  }).map(topic => {
    const ts = getTopicStats(activeSub.id, topic.id);
    const collapsed = collapsedTopics[topic.id];
    const filteredSubtopics = topic.subtopics.filter((st, idx) => {
      if (search && !st.toLowerCase().includes(search.toLowerCase()) &&
          !topic.name.toLowerCase().includes(search.toLowerCase())) return false;
      const key = getSubtopicKey(activeSub.id, topic.id, idx);
      const d = data[key] || {};
      if (filter === FILTER.PENDING && d.completed) return false;
      if (filter === FILTER.DONE && !d.completed) return false;
      return true;
    });

    return React.createElement('div', {key:topic.id, className:'topic-group'},
      React.createElement('div', {
        className:'topic-group-header'+(collapsed?' collapsed':''),
        onClick:()=>toggleCollapse(topic.id)
      },
        React.createElement('div', {className:'topic-group-title'},
          React.createElement('span', {className:'arrow'+(collapsed?'':' open')}, '▶'),
          topic.name,
          React.createElement('span', {className:'topic-type-tag '+(topic.type==='static'?'tag-static':'tag-dynamic')}, topic.type),
        ),
        React.createElement('div', {className:'topic-group-meta'},
          React.createElement('span', null, ts.completed+'/'+ts.total),
          React.createElement('div', {className:'mini-progress'},
            React.createElement('div', {className:'mini-progress-fill', style:{width:(ts.total?ts.completed/ts.total*100:0)+'%'}})
          )
        )
      ),
      !collapsed && React.createElement('div', {className:'subtopics-table'},
        React.createElement('div', {className:'table-header'},
          React.createElement('div', {className:'cell'}, 'Subtopic'),
          React.createElement('div', {className:'cell center'}, 'Done'),
          React.createElement('div', {className:'cell center'}, 'Rev 1'),
          React.createElement('div', {className:'cell center'}, 'Rev 2'),
          React.createElement('div', {className:'cell'}, 'Comments'),
        ),
        filteredSubtopics.map((st, origIdx) => {
          const realIdx = topic.subtopics.indexOf(st);
          const key = getSubtopicKey(activeSub.id, topic.id, realIdx);
          const d = data[key] || {};
          const pyqKey = activeSub.id+'_'+topic.id+'_'+realIdx;
          const matchedPyqs = getPyqsForSubtopic(activeSub.id, st);
          const pyqOpen = expandedPyq[pyqKey];
          return React.createElement(React.Fragment, {key:realIdx},
            React.createElement('div', {className:'subtopic-row'+(d.completed?' completed':'')},
              React.createElement('div', {className:'cell name'},
                matchedPyqs.length > 0
                  ? React.createElement('span', {
                      className:'pyq-toggle'+(pyqOpen?' open':''),
                      onClick:e=>{e.stopPropagation();togglePyq(pyqKey);},
                      title:matchedPyqs.length+' PYQ(s) found'
                    }, '▶')
                  : React.createElement('span', {style:{width:'20px',flexShrink:0}}),
                React.createElement('span', {style:{fontSize:'12px',color:'var(--text-muted)',fontFamily:"'JetBrains Mono',monospace",minWidth:'20px'}}, (realIdx+1)+'.'),
                st,
                matchedPyqs.length > 0 && React.createElement('span', {className:'pyq-count-badge'}, matchedPyqs.length+' PYQ'+(matchedPyqs.length>1?'s':''))
              ),
              React.createElement('div', {className:'cell center'},
                React.createElement('label', {className:'checkbox-wrapper'},
                  React.createElement('input', {type:'checkbox', checked:!!d.completed, onChange:e=>updateField(key,'completed',e.target.checked)}),
                  React.createElement('span', {className:'checkbox-visual'}, d.completed?'✓':'')
                )
              ),
              React.createElement('div', {className:'cell center'},
                React.createElement('label', {className:'checkbox-wrapper rev1'},
                  React.createElement('input', {type:'checkbox', checked:!!d.rev1, onChange:e=>updateField(key,'rev1',e.target.checked)}),
                  React.createElement('span', {className:'checkbox-visual'}, d.rev1?'✓':'')
                )
              ),
              React.createElement('div', {className:'cell center'},
                React.createElement('label', {className:'checkbox-wrapper rev2'},
                  React.createElement('input', {type:'checkbox', checked:!!d.rev2, onChange:e=>updateField(key,'rev2',e.target.checked)}),
                  React.createElement('span', {className:'checkbox-visual'}, d.rev2?'✓':'')
                )
              ),
              React.createElement('div', {className:'cell'},
                React.createElement('input', {
                  className:'comment-input', placeholder:'Add notes...',
                  value: d.comment || '',
                  onChange: e => updateField(key, 'comment', e.target.value)
                })
              )
            ),
            pyqOpen && matchedPyqs.length > 0 && React.createElement('div', {className:'pyq-panel'},
              React.createElement('div', {className:'pyq-label'}, 'Related PYQs ('+matchedPyqs.length+')'),
              React.createElement('div', null,
                matchedPyqs.map((pq, pi) =>
                  React.createElement('div', {key:pi, style:{marginBottom:'6px'}},
                    React.createElement('span', {className:'pyq-chip'},
                      React.createElement('span', {className:'yr'}, pq[0]),
                      React.createElement('span', {className:'qn'}, 'Q'+pq[1]),
                      pq[4] && React.createElement('span', {className:'ans'}, 'Ans: '+pq[4]),
                    ),
                    pq[3] && React.createElement('span', {style:{fontSize:'10px',color:'var(--text-muted)',marginLeft:'4px'}}, pq[3]),
                    React.createElement('div', {className:'pyq-text'}, pq[2]+'…'),
                  )
                )
              )
            )
          );
        })
      )
    );
  });
}
