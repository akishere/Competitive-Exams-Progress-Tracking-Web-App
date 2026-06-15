// ==================== AUTH SCREENS ====================
function SetupRequiredScreen() {
  return React.createElement('div', {className:'login-screen'},
    React.createElement('div', {className:'login-card'},
      React.createElement('div', {className:'login-logo'}, '⚙️'),
      React.createElement('h1', null, 'Firebase Setup Required'),
      React.createElement('div', {className:'login-subtitle'}, 'Add your Firebase project config to enable login and realtime sync.'),
      React.createElement('div', {className:'setup-note'},
        '1. Open ', React.createElement('code', null, 'js/config.js'), ' in an editor.', React.createElement('br'),
        '2. Find the ', React.createElement('code', null, 'firebaseConfig'), ' object near the top of the file.', React.createElement('br'),
        '3. Replace the placeholder values with your Firebase project’s web app config.', React.createElement('br'),
        '4. See README.md for the full step-by-step setup guide.'
      )
    )
  );
}

function LoginScreen() {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (username.trim().toLowerCase() !== 'admin') {
      setError('Invalid username or password.');
      return;
    }
    setBusy(true);
    auth.signInWithEmailAndPassword(ADMIN_EMAIL, password)
      .catch(() => setError('Invalid username or password.'))
      .finally(() => setBusy(false));
  }

  return React.createElement('div', {className:'login-screen'},
    React.createElement('form', {className:'login-card', onSubmit:handleSubmit},
      React.createElement('div', {className:'login-logo'}, '🎯'),
      React.createElement('h1', null, 'Exam Prep Tracker'),
      React.createElement('div', {className:'login-subtitle'}, 'Sign in to access your progress'),
      React.createElement('input', {
        className:'login-input', placeholder:'Username', value:username, autoFocus:true,
        autoComplete:'username', onChange:e=>setUsername(e.target.value)
      }),
      React.createElement('input', {
        className:'login-input', type:'password', placeholder:'Password', value:password,
        autoComplete:'current-password', onChange:e=>setPassword(e.target.value)
      }),
      error && React.createElement('div', {className:'login-error'}, error),
      React.createElement('button', {className:'btn primary login-btn', type:'submit', disabled:busy},
        busy ? 'Signing in…' : 'Log In'
      )
    )
  );
}
