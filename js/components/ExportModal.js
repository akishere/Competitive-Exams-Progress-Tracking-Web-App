// ==================== EXPORT / IMPORT MODAL ====================
function ExportModal({ exportProgress, importProgress, setData, setMilestones, onClose }) {
  return React.createElement('div', {className:'export-modal', onClick:e=>{if(e.target===e.currentTarget)onClose()}},
    React.createElement('div', {className:'export-modal-content'},
      React.createElement('h3', null, '💾 Export / Import Progress'),
      React.createElement('p', {style:{fontSize:'12px',color:'var(--text-muted)',marginBottom:'12px'}},
        'Copy this JSON to back up your progress or share with Claude for milestone adjustment. Paste imported JSON and click Import.'
      ),
      React.createElement('textarea', {
        className:'export-textarea', id:'export-area',
        defaultValue: exportProgress()
      }),
      React.createElement('div', {style:{display:'flex',gap:'8px',marginTop:'12px',justifyContent:'flex-end'}},
        React.createElement('button', {className:'btn', onClick:()=>{
          navigator.clipboard.writeText(document.getElementById('export-area').value);
          alert('Copied to clipboard!');
        }}, 'Copy'),
        React.createElement('button', {className:'btn primary', onClick:()=>{
          importProgress(document.getElementById('export-area').value);
          onClose();
        }}, 'Import'),
        React.createElement('button', {className:'btn danger', onClick:()=>{
          if(confirm('Reset ALL progress for this module? This cannot be undone.')){
            setData({});
            setMilestones({});
            onClose();
          }
        }}, 'Reset All'),
        React.createElement('button', {className:'btn', onClick:onClose}, 'Close'),
      )
    )
  );
}
