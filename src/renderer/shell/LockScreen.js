import { getFirebaseAuth } from '../../firebase/auth.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';

// Mounts the lock screen over the shell and returns a Promise<User>
// that resolves once the user successfully authenticates.
export function mountLockScreen(root) {
  return new Promise((resolve) => {
    const lockEl = document.createElement('div');
    lockEl.id = 'lock-screen';
    lockEl.className = 'absolute inset-0 flex items-center justify-center z-[100] animate-fade-in';
    lockEl.style.background =
      'linear-gradient(135deg, #0d0d1a 0%, #1a0a2e 50%, #0a1628 100%)';

    lockEl.innerHTML = `
      <div class="glass-panel rounded-3xl p-8 w-80 flex flex-col gap-4 animate-pop-in shadow-2xl">

        <div class="text-center mb-1">
          <div class="w-16 h-16 rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/40 mx-auto mb-3 flex items-center justify-center">
            <span class="text-white text-3xl font-bold">K</span>
          </div>
          <h1 class="text-white text-2xl font-bold tracking-widest">KumaOS</h1>
          <p id="lock-subtitle" class="text-white/50 text-sm mt-1">Sign in to continue</p>
        </div>

        <input id="lock-email" type="email" placeholder="Email" autocomplete="email"
          class="bg-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30
                 outline-none border border-white/10 focus:border-blue-500/70 transition-colors" />

        <input id="lock-password" type="password" placeholder="Password" autocomplete="current-password"
          class="bg-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30
                 outline-none border border-white/10 focus:border-blue-500/70 transition-colors" />

        <button id="lock-submit"
          class="bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-xl py-3 text-white
                 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          Sign In
        </button>

        <button id="lock-toggle"
          class="text-white/40 text-xs hover:text-white/70 transition-colors">
          Don't have an account? Create one
        </button>

        <p id="lock-error"
          class="text-red-400 text-xs text-center hidden leading-snug"></p>

      </div>
    `;

    root.appendChild(lockEl);

    let isSignUp = false;

    const emailInput    = lockEl.querySelector('#lock-email');
    const passwordInput = lockEl.querySelector('#lock-password');
    const submitBtn     = lockEl.querySelector('#lock-submit');
    const toggleBtn     = lockEl.querySelector('#lock-toggle');
    const errorEl       = lockEl.querySelector('#lock-error');
    const subtitleEl    = lockEl.querySelector('#lock-subtitle');

    // Toggle between Sign In and Create Account modes
    toggleBtn.addEventListener('click', () => {
      isSignUp = !isSignUp;
      submitBtn.textContent  = isSignUp ? 'Create Account' : 'Sign In';
      toggleBtn.textContent  = isSignUp
        ? 'Already have an account? Sign in'
        : 'Don\'t have an account? Create one';
      subtitleEl.textContent = isSignUp
        ? 'Create your KumaOS account'
        : 'Sign in to continue';
      errorEl.classList.add('hidden');
    });

    submitBtn.addEventListener('click', () => _handleSubmit());
    [emailInput, passwordInput].forEach((el) =>
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter') _handleSubmit(); })
    );

    async function _handleSubmit() {
      const email    = emailInput.value.trim();
      const password = passwordInput.value;

      if (!email || !password) {
        _showError('Please fill in all fields.');
        return;
      }

      submitBtn.disabled     = true;
      submitBtn.textContent  = isSignUp ? 'Creating…' : 'Signing in…';
      errorEl.classList.add('hidden');

      try {
        const auth = await getFirebaseAuth();
        const credential = isSignUp
          ? await createUserWithEmailAndPassword(auth, email, password)
          : await signInWithEmailAndPassword(auth, email, password);

        // Fade-out animation before resolving
        lockEl.style.transition = 'opacity 0.4s ease-out';
        lockEl.style.opacity    = '0';
        setTimeout(() => {
          lockEl.remove();
          resolve(credential.user);
        }, 400);

      } catch (err) {
        submitBtn.disabled    = false;
        submitBtn.textContent = isSignUp ? 'Create Account' : 'Sign In';
        _showError(_friendlyError(err.code));
      }
    }

    function _showError(msg) {
      errorEl.textContent = msg;
      errorEl.classList.remove('hidden');
    }

    function _friendlyError(code) {
      const map = {
        'auth/invalid-email':        'Invalid email address.',
        'auth/user-not-found':       'No account found with this email.',
        'auth/wrong-password':       'Incorrect password.',
        'auth/invalid-credential':   'Invalid email or password.',
        'auth/email-already-in-use': 'This email is already registered.',
        'auth/weak-password':        'Password must be at least 6 characters.',
        'auth/too-many-requests':    'Too many attempts. Please wait and try again.',
        'auth/network-request-failed': 'Network error. Check your connection.'
      };
      return map[code] ?? 'Authentication failed. Please try again.';
    }
  });
}
