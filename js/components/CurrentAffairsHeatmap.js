// ==================== CURRENT AFFAIRS: HEATMAP + DAY PANEL + MONTHLY LOG ====================
function CurrentAffairsHeatmap({
  data, caSelectedDay, setCaSelectedDay, lightboxImg, setLightboxImg,
  caUploading, handleCaUpload, handleCaDeleteScreenshot, handleDownloadMonthScreenshots,
  updateField, collapsedTopics, toggleCollapse,
}) {
  const allDays = getDaysInRange(CA_START, CA_END);
  const months = getMonthsInRange(CA_START, CA_END);
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  // Build week columns (Sun=0 start)
  const weeks = [];
  let currentWeek = new Array(7).fill(null);
  allDays.forEach(d => {
    const dow = d.getDay();
    if (dow === 0 && currentWeek.some(x=>x)) { weeks.push(currentWeek); currentWeek = new Array(7).fill(null); }
    currentWeek[dow] = d;
  });
  if (currentWeek.some(x=>x)) weeks.push(currentWeek);

  return React.createElement(React.Fragment, null,
    // HEATMAP
    React.createElement('div', {className:'ca-heatmap-section'},
      React.createElement('div', {className:'ca-heatmap-title'}, '📅 Current Affairs Activity'),
      React.createElement('div', {className:'ca-heatmap-subtitle'}, 'May 2026 → May 2027 • Click a day to track it'),
      React.createElement('div', {style:{display:'flex'}},
        React.createElement('div', {className:'ca-day-labels'},
          React.createElement('span', null, ''),
          React.createElement('span', null, 'Mon'),
          React.createElement('span', null, ''),
          React.createElement('span', null, 'Wed'),
          React.createElement('span', null, ''),
          React.createElement('span', null, 'Fri'),
          React.createElement('span', null, ''),
        ),
        React.createElement('div', null,
          // Month labels row
          React.createElement('div', {className:'ca-month-labels'}, (() => {
            let labels = [];
            let lastMonth = -1;
            weeks.forEach((week, wi) => {
              const firstDay = week.find(d=>d);
              if (firstDay && firstDay.getMonth() !== lastMonth) {
                lastMonth = firstDay.getMonth();
                labels.push(React.createElement('span', {key:wi, style:{position:'relative',left:(wi*16)+'px'}}, monthNames[lastMonth]));
              }
            });
            return labels;
          })()),
          React.createElement('div', {className:'ca-heatmap-grid'},
            weeks.map((week, wi) =>
              React.createElement('div', {key:wi, className:'ca-heatmap-col'},
                week.map((day, di) => {
                  if (!day) return React.createElement('div', {key:di, className:'ca-heatmap-cell empty'});
                  const dk = dateToKey(day);
                  const caKey = 'ca_day_'+dk;
                  const isDone = !!(data[caKey]||{}).completed;
                  const hasFiles = ((data[caKey]||{}).screenshots||[]).length > 0;
                  const isSelected = dk === caSelectedDay;
                  const isFuture = day > new Date();
                  const lvl = isFuture ? 'lvl-0' : isDone && hasFiles ? 'lvl-4' : isDone ? 'lvl-3' : hasFiles ? 'lvl-2' : 'lvl-0';
                  return React.createElement('div', {
                    key:di,
                    className:'ca-heatmap-cell '+lvl+(hasFiles?' has-files':''),
                    style: isSelected ? {outline:'2px solid var(--accent)',outlineOffset:'1px'} : {},
                    title:dk+(isDone?' ✅':'')+(hasFiles?' 📎':''),
                    onClick:()=>setCaSelectedDay(dk)
                  });
                })
              )
            )
          )
        )
      ),
      React.createElement('div', {className:'ca-legend'},
        React.createElement('span', null, 'Less'),
        React.createElement('div', {className:'ca-legend-cell', style:{background:'#1a2235'}}),
        React.createElement('div', {className:'ca-legend-cell', style:{background:'#0e4429'}}),
        React.createElement('div', {className:'ca-legend-cell', style:{background:'#006d32'}}),
        React.createElement('div', {className:'ca-legend-cell', style:{background:'#26a641'}}),
        React.createElement('div', {className:'ca-legend-cell', style:{background:'#39d353'}}),
        React.createElement('span', null, 'More'),
        React.createElement('span', {style:{marginLeft:'12px'}}, '⬤ = has screenshots'),
      )
    ),

    // DAY DETAIL PANEL
    React.createElement('div', {className:'ca-day-panel'},
      React.createElement('div', {className:'ca-day-header'},
        React.createElement('div', null,
          React.createElement('div', {className:'ca-day-date'}, new Date(caSelectedDay+'T00:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})),
          React.createElement('div', {style:{fontSize:'12px',color:'var(--text-muted)',marginTop:'2px'}},
            (data['ca_day_'+caSelectedDay]||{}).completed ? '✅ Completed' : '⬜ Not yet done'
          )
        ),
        React.createElement('div', {style:{display:'flex',gap:'8px',alignItems:'center'}},
          React.createElement('div', {className:'ca-day-nav'},
            React.createElement('button', {onClick:()=>{
              const d = new Date(caSelectedDay+'T00:00:00'); d.setDate(d.getDate()-1); setCaSelectedDay(dateToKey(d));
            }}, '←'),
            React.createElement('button', {onClick:()=>setCaSelectedDay(dateToKey(new Date()))}, '⌂'),
            React.createElement('button', {onClick:()=>{
              const d = new Date(caSelectedDay+'T00:00:00'); d.setDate(d.getDate()+1); setCaSelectedDay(dateToKey(d));
            }}, '→'),
          ),
          React.createElement('label', {className:'checkbox-wrapper', style:{marginLeft:'12px'}},
            React.createElement('input', {type:'checkbox',
              checked:!!(data['ca_day_'+caSelectedDay]||{}).completed,
              onChange:e=>updateField('ca_day_'+caSelectedDay,'completed',e.target.checked)
            }),
            React.createElement('span', {className:'checkbox-visual'}, (data['ca_day_'+caSelectedDay]||{}).completed?'✓':'')
          ),
          React.createElement('span', {style:{fontSize:'13px',fontWeight:600}}, 'Mark Done'),
        )
      ),
      React.createElement('input', {
        className:'comment-input', style:{background:'var(--bg-input)',border:'1px solid var(--border)',borderRadius:'6px',marginTop:'8px'},
        placeholder:'Notes for this day (e.g., Hindu topics, key takeaways)...',
        value:(data['ca_day_'+caSelectedDay]||{}).comment||'',
        onChange:e=>updateField('ca_day_'+caSelectedDay,'comment',e.target.value)
      }),

      // Screenshot Upload
      React.createElement('div', {
        className:'ca-upload-zone'+(caUploading?' uploading':''),
        onClick:()=>!caUploading && document.getElementById('ca-file-input').click(),
        onDrop:e=>{e.preventDefault();if(!caUploading)handleCaUpload(e.dataTransfer.files);},
        onDragOver:e=>e.preventDefault()
      },
        React.createElement('p', null, caUploading ? '⏳ Compressing & uploading…' : '📸 Click or drag screenshots here • Multiple files supported'),
        React.createElement('input', {id:'ca-file-input',type:'file',accept:'image/*',multiple:true,style:{display:'none'}, disabled:caUploading,
          onChange:e=>{handleCaUpload(e.target.files);e.target.value='';}
        })
      ),

      // Thumbnails
      (() => {
        const shots = (data['ca_day_'+caSelectedDay]||{}).screenshots || [];
        return shots.length > 0 && React.createElement('div', {className:'ca-thumbs'},
          shots.map((url, i) =>
            React.createElement('div', {key:i, style:{position:'relative'}},
              React.createElement('img', {className:'ca-thumb', src:url, onClick:()=>setLightboxImg(url)}),
              React.createElement('span', {
                style:{position:'absolute',top:'-4px',right:'-4px',background:'var(--red)',color:'#fff',borderRadius:'50%',width:'16px',height:'16px',fontSize:'10px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'},
                onClick:()=>handleCaDeleteScreenshot(i)
              }, '✕')
            )
          )
        );
      })(),
    ),

    // Monthly breakdown
    React.createElement('h3', {style:{fontSize:'15px',fontWeight:700,marginBottom:'10px'}}, '📋 Monthly Day-by-Day Log'),
    months.map(mDate => {
      const mKey = 'ca_m_'+mDate.getFullYear()+'_'+mDate.getMonth();
      const mCollapsed = collapsedTopics[mKey];
      const mDays = [];
      const mS = new Date(mDate.getFullYear(), mDate.getMonth(), 1);
      const mE = new Date(mDate.getFullYear(), mDate.getMonth()+1, 0);
      const today = new Date();
      for (let dd=new Date(mS); dd<=mE && dd<=CA_END; dd.setDate(dd.getDate()+1)) {
        if (dd >= CA_START) mDays.push(new Date(dd));
      }
      const doneDays = mDays.filter(dd => (data['ca_day_'+dateToKey(dd)]||{}).completed).length;
      const monthHasFiles = mDays.some(dd => ((data['ca_day_'+dateToKey(dd)]||{}).screenshots||[]).length > 0);

      return React.createElement('div', {key:mKey, className:'ca-month-card'},
        React.createElement('div', {className:'ca-month-header', onClick:()=>toggleCollapse(mKey)},
          React.createElement('div', {style:{display:'flex',alignItems:'center',gap:'10px'}},
            React.createElement('span', {className:'arrow'+(mCollapsed?'':' open'), style:{fontSize:'10px',color:'var(--text-muted)'}}, '▶'),
            React.createElement('span', {style:{fontWeight:700,fontSize:'14px'}}, monthNames[mDate.getMonth()]+' '+mDate.getFullYear()),
            React.createElement('span', {style:{fontSize:'12px',color:'var(--text-muted)'}}, doneDays+'/'+mDays.length+' days'),
          ),
          React.createElement('div', {style:{display:'flex',alignItems:'center',gap:'10px'}},
            React.createElement('button', {
              className:'btn', style:{padding:'4px 10px',fontSize:'11px',opacity:monthHasFiles?1:0.5},
              onClick:e=>{e.stopPropagation();handleDownloadMonthScreenshots(mDate.getFullYear(),mDate.getMonth());}
            }, '⬇ Download'),
            React.createElement('div', {className:'mini-progress', style:{width:'80px'}},
              React.createElement('div', {className:'mini-progress-fill', style:{width:(mDays.length?doneDays/mDays.length*100:0)+'%'}})
            )
          )
        ),
        !mCollapsed && React.createElement('div', {style:{padding:'4px 0'}},
          mDays.map(dd => {
            const dk = dateToKey(dd);
            const dayData = data['ca_day_'+dk] || {};
            const hasFile = (dayData.screenshots||[]).length > 0;
            const isPast = dd < today;
            const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
            return React.createElement('div', {key:dk, className:'ca-day-row', style:{opacity:dayData.completed?0.6:1,cursor:'pointer'}, onClick:()=>setCaSelectedDay(dk)},
              React.createElement('span', {className:'day-label'}, dayNames[dd.getDay()]),
              React.createElement('span', {className:'day-date'}, dd.toLocaleDateString('en-US',{month:'short',day:'numeric'})),
              React.createElement('label', {className:'checkbox-wrapper', onClick:e=>e.stopPropagation()},
                React.createElement('input', {type:'checkbox', checked:!!dayData.completed,
                  onChange:e=>updateField('ca_day_'+dk,'completed',e.target.checked)
                }),
                React.createElement('span', {className:'checkbox-visual'}, dayData.completed?'✓':'')
              ),
              hasFile && React.createElement('span', {className:'file-count'}, '📎 has files'),
              dayData.comment && React.createElement('span', {style:{fontSize:'11px',color:'var(--text-muted)',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}, dayData.comment),
              !dayData.completed && isPast && React.createElement('span', {style:{fontSize:'10px',color:'var(--amber)',fontWeight:600}}, 'BACKLOG'),
            );
          })
        )
      );
    }),

    // Lightbox
    lightboxImg && React.createElement('div', {className:'ca-lightbox', onClick:()=>setLightboxImg(null)},
      React.createElement('img', {src:lightboxImg})
    ),
  );
}
