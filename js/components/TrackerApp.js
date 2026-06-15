// ==================== TRACKER APP (per-module screen) ====================
function TrackerApp({ uid, module, data, setData, milestones, setMilestones, onBack, onLogout }) {
  const subjectsData = module.subjectsData;
  const milestonesData = module.milestonesData;
  const hasCurrentAffairs = subjectsData.some(s => s.id === 'current_affairs');
  const [activeSubject, setActiveSubject] = React.useState(subjectsData[0].id);
  const [view, setView] = React.useState(VIEW.SUBJECTS);
  const [filter, setFilter] = React.useState(FILTER.ALL);
  const [search, setSearch] = React.useState('');
  const [showExport, setShowExport] = React.useState(false);
  const [collapsedTopics, setCollapsedTopics] = React.useState({});
  const [expandedPyq, setExpandedPyq] = React.useState({});
  const [caSelectedDay, setCaSelectedDay] = React.useState(dateToKey(new Date()));
  const [lightboxImg, setLightboxImg] = React.useState(null);
  const [caUploading, setCaUploading] = React.useState(false);
  const [caMigrated, setCaMigrated] = React.useState(false);

  // One-time migration: move legacy IndexedDB screenshots (from before cloud
  // storage support) up to Supabase Storage and record their URLs in Firestore.
  React.useEffect(() => {
    if (!hasCurrentAffairs || !SUPABASE_READY || !uid || caMigrated) return;
    (async () => {
      const keys = await getScreenshotKeys().catch(() => []);
      for (const dk of keys) {
        const imgs = await getScreenshots(dk).catch(() => []);
        if (!imgs.length) continue;
        const urls = [];
        for (let i = 0; i < imgs.length; i++) {
          const blob = dataURLToBlob(imgs[i]);
          const ext = blob.type === 'image/png' ? 'png' : 'jpg';
          urls.push(await uploadCaFile(uid, module.id, dk, blob, `migrated_${i+1}.${ext}`));
        }
        const caKey = 'ca_day_' + dk;
        setData(prev => ({...prev, [caKey]: {...(prev[caKey]||{}), screenshots: [...((prev[caKey]||{}).screenshots||[]), ...urls]}}));
        await clearIDBKey(dk).catch(() => {});
      }
      setCaMigrated(true);
    })();
  }, [hasCurrentAffairs, uid, caMigrated]);

  function togglePyq(key) {
    setExpandedPyq(prev => ({...prev, [key]: !prev[key]}));
  }

  // Get PYQ questions matching a subtopic by keyword search
  function getPyqsForSubtopic(subjectId, subtopicText) {
    const pyqs = PYQ_DATA[subjectId] || [];
    if (!pyqs.length) return [];
    const words = subtopicText.toLowerCase().replace(/[—–\-()]/g,' ').split(/\s+/).filter(w => w.length > 3);
    const stopwords = ['articles','from','with','that','this','have','been','their','which','about','these','them','they','some','other','also','such','into','more','most','than','very','only','over','between'];
    const keywords = words.filter(w => !stopwords.includes(w)).slice(0, 6);
    if (keywords.length === 0) return [];
    return pyqs.filter(q => {
      const txt = (q[2] + ' ' + q[3]).toLowerCase();
      return keywords.some(kw => txt.includes(kw));
    }).slice(0, 15);
  }

  async function handleCaUpload(files) {
    if (!files || !files.length || !SUPABASE_READY || !uid) return;
    setCaUploading(true);
    try {
      const urls = await Promise.all(Array.from(files).map(f => uploadCaFile(uid, module.id, caSelectedDay, f, f.name)));
      const key = 'ca_day_' + caSelectedDay;
      const existing = (data[key]||{}).screenshots || [];
      updateField(key, 'screenshots', [...existing, ...urls]);
    } finally {
      setCaUploading(false);
    }
  }

  async function handleCaDeleteScreenshot(idx) {
    const key = 'ca_day_' + caSelectedDay;
    const screenshots = (data[key]||{}).screenshots || [];
    const url = screenshots[idx];
    if (url) await deleteCaFile(url);
    updateField(key, 'screenshots', screenshots.filter((_, i) => i !== idx));
  }

  function handleDownloadMonthScreenshots(year, month) {
    const mStart = new Date(year, month, 1);
    const mEnd = new Date(year, month+1, 0);
    const urls = [];
    for (let d = new Date(mStart); d <= mEnd; d.setDate(d.getDate()+1)) {
      const shots = (data['ca_day_'+dateToKey(d)]||{}).screenshots || [];
      shots.forEach(u => urls.push(u));
    }
    if (!urls.length) { alert('No screenshots for this month.'); return; }
    // Force each as an attachment download, staggered to avoid popup-blocker issues
    urls.forEach((url, i) => {
      setTimeout(() => {
        const filename = url.split('/').pop().split('?')[0];
        const link = document.createElement('a');
        link.href = getCaDownloadUrl(url, filename);
        link.click();
      }, i * 300);
    });
  }

  function updateField(key, field, value) {
    setData(prev => ({...prev, [key]: {...(prev[key]||{}), [field]: value}}));
  }

  function getStats() {
    let total = 0, completed = 0, rev1 = 0, rev2 = 0;
    subjectsData.forEach(sub => {
      if (sub.id === 'current_affairs') {
        // Count heatmap days up to today
        const today = new Date();
        const end = today < CA_END ? today : CA_END;
        const days = getDaysInRange(CA_START, end);
        total += days.length;
        days.forEach(d => { if ((data['ca_day_'+dateToKey(d)]||{}).completed) completed++; });
        return;
      }
      sub.topics.forEach(topic => {
        topic.subtopics.forEach((_, idx) => {
          total++;
          const key = getSubtopicKey(sub.id, topic.id, idx);
          const d = data[key] || {};
          if (d.completed) completed++;
          if (d.rev1) rev1++;
          if (d.rev2) rev2++;
        });
      });
    });
    return { total, completed, rev1, rev2 };
  }

  function getSubjectStats(subjectId) {
    const sub = subjectsData.find(s => s.id === subjectId);
    if (!sub) return { total:0, completed:0 };
    // Special handling for current_affairs — count days from heatmap
    if (subjectId === 'current_affairs') {
      const today = new Date();
      const end = today < CA_END ? today : CA_END;
      const days = getDaysInRange(CA_START, end);
      let total = days.length, completed = 0;
      days.forEach(d => {
        const dk = 'ca_day_' + dateToKey(d);
        if ((data[dk]||{}).completed) completed++;
      });
      return { total, completed };
    }
    let total = 0, completed = 0;
    sub.topics.forEach(topic => {
      topic.subtopics.forEach((_, idx) => {
        total++;
        const key = getSubtopicKey(sub.id, topic.id, idx);
        if ((data[key]||{}).completed) completed++;
      });
    });
    return { total, completed };
  }

  function getTopicStats(subjectId, topicId) {
    const sub = subjectsData.find(s => s.id === subjectId);
    const topic = sub?.topics.find(t => t.id === topicId);
    if (!topic) return {total:0, completed:0};
    let total = topic.subtopics.length, completed = 0;
    topic.subtopics.forEach((_, idx) => {
      const key = getSubtopicKey(subjectId, topicId, idx);
      if ((data[key]||{}).completed) completed++;
    });
    return { total, completed };
  }

  function exportProgress() {
    const exportData = { module: module.id, data, milestones, exportedAt: new Date().toISOString(), version: 3 };
    return JSON.stringify(exportData, null, 2);
  }

  function importProgress(jsonStr) {
    try {
      const imported = JSON.parse(jsonStr);
      if (imported.data) setData(imported.data);
      if (imported.milestones) setMilestones(imported.milestones);
      alert('Progress imported successfully!');
    } catch { alert('Invalid JSON. Please check the format.'); }
  }

  function toggleCollapse(topicId) {
    setCollapsedTopics(prev => ({...prev, [topicId]: !prev[topicId]}));
  }

  const stats = getStats();
  const activeSub = subjectsData.find(s => s.id === activeSubject);

  return React.createElement('div', null,
    React.createElement(AppHeader, { module, stats, view, setView, setShowExport, onBack, onLogout }),

    React.createElement('div', {className:'main-container'},
      view === VIEW.SUBJECTS && React.createElement(Sidebar, {
        module, subjectsData, activeSubject, setActiveSubject, getSubjectStats
      }),

      view === VIEW.SUBJECTS && activeSub && React.createElement('main', {className:'content'},
        React.createElement('div', {className:'subject-header'},
          React.createElement('div', null,
            React.createElement('div', {className:'subject-title'}, activeSub.emoji+' '+activeSub.name),
            React.createElement('div', {style:{fontSize:'13px',color:'var(--text-muted)',marginTop:'4px'}},
              'PYQs: '+activeSub.pyqs+' (2011–25) • Weightage: '+activeSub.weight
            )
          ),
          React.createElement('div', {className:'filter-bar'},
            React.createElement('input', {
              className:'search-input', placeholder:'Search topics...',
              value:search, onChange:e=>setSearch(e.target.value)
            }),
            Object.values(FILTER).map(f =>
              React.createElement('button', {
                key:f, className:'filter-btn'+(filter===f?' active':''),
                onClick:()=>setFilter(f)
              }, f)
            )
          )
        ),

        // Progress bar
        (() => {
          const ss = getSubjectStats(activeSub.id);
          const p = ss.total ? Math.round(ss.completed/ss.total*100) : 0;
          return React.createElement('div', {className:'progress-overview'},
            React.createElement('div', {style:{display:'flex',justifyContent:'space-between',alignItems:'center'}},
              React.createElement('span', {style:{fontSize:'13px',fontWeight:600}}, 'Overall Progress'),
              React.createElement('span', {className:'pct', style:{fontSize:'13px',fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:'var(--green)'}}, p+'%')
            ),
            React.createElement('div', {className:'progress-bar-outer'},
              React.createElement('div', {className:'progress-bar-inner', style:{width:p+'%'}})
            ),
            React.createElement('div', {className:'progress-text'},
              React.createElement('span', null, ss.completed+' of '+ss.total+' subtopics completed'),
            )
          );
        })(),

        activeSub.id === 'current_affairs'
          ? React.createElement(CurrentAffairsHeatmap, {
              data, caSelectedDay, setCaSelectedDay, lightboxImg, setLightboxImg,
              caUploading, handleCaUpload, handleCaDeleteScreenshot, handleDownloadMonthScreenshots,
              updateField, collapsedTopics, toggleCollapse,
            })
          : React.createElement(TopicList, {
              activeSub, filter, search, collapsedTopics, toggleCollapse,
              expandedPyq, togglePyq, getPyqsForSubtopic, getTopicStats, data, updateField,
            })
      ),

      view === VIEW.MILESTONES && React.createElement(MilestonesView, {
        milestonesData, milestones, setMilestones, collapsedTopics, toggleCollapse
      }),
    ),

    showExport && React.createElement(ExportModal, {
      exportProgress, importProgress, setData, setMilestones, onClose:()=>setShowExport(false)
    })
  );
}
