// ============================================
// MODISH JUNCTION - FIREBASE AUTH GUARD
// File: js/auth-guard.js
// Purpose: Secure admin authentication via Firebase Auth
// Replaces: Hardcoded passcodes + sessionStorage bypass
// ============================================

const AuthGuard = (() => {
  // Rate limiting config
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_SECONDS = 30;
  let attemptCount = 0;
  let lockoutUntil = 0;

  /**
   * Get the Firebase Auth instance
   */
  function getAuth() {
    if (typeof firebase !== 'undefined' && firebase.auth) {
      return firebase.auth();
    }
    return null;
  }

  /**
   * Check if rate limit is exceeded
   * @returns {{ allowed: boolean, remainingSeconds: number }}
   */
  function checkRateLimit() {
    const now = Date.now();
    if (lockoutUntil > now) {
      return {
        allowed: false,
        remainingSeconds: Math.ceil((lockoutUntil - now) / 1000)
      };
    }
    // Reset attempts after lockout expires
    if (lockoutUntil > 0 && now >= lockoutUntil) {
      attemptCount = 0;
      lockoutUntil = 0;
    }
    return { allowed: true, remainingSeconds: 0 };
  }

  /**
   * Record a failed login attempt and possibly trigger lockout
   */
  function recordFailedAttempt() {
    attemptCount++;
    if (attemptCount >= MAX_ATTEMPTS) {
      lockoutUntil = Date.now() + (LOCKOUT_SECONDS * 1000);
      return {
        locked: true,
        message: `Too many failed attempts. Please wait ${LOCKOUT_SECONDS} seconds.`
      };
    }
    return {
      locked: false,
      message: `Incorrect credentials. ${MAX_ATTEMPTS - attemptCount} attempt(s) remaining.`
    };
  }

  /**
   * Sign in with email and password via Firebase Auth
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<{ success: boolean, message: string, user?: object }>}
   */
  async function signIn(email, password) {
    // Check rate limit
    const rateCheck = checkRateLimit();
    if (!rateCheck.allowed) {
      return {
        success: false,
        message: `Account locked. Try again in ${rateCheck.remainingSeconds}s.`
      };
    }

    const auth = getAuth();
    if (!auth) {
      return {
        success: false,
        message: 'Authentication service unavailable. Please refresh the page.'
      };
    }

    try {
      const credential = await auth.signInWithEmailAndPassword(email.trim(), password);
      attemptCount = 0;
      lockoutUntil = 0;
      return {
        success: true,
        message: 'Welcome to Modish Junction Admin!',
        user: credential.user
      };
    } catch (err) {
      const result = recordFailedAttempt();
      
      // Map Firebase error codes to user-friendly messages
      let friendlyMessage = result.message;
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        friendlyMessage = result.locked
          ? result.message
          : `Invalid email or password. ${MAX_ATTEMPTS - attemptCount} attempt(s) remaining.`;
      } else if (err.code === 'auth/too-many-requests') {
        friendlyMessage = 'Account temporarily locked by Firebase. Please try again later.';
      } else if (err.code === 'auth/invalid-email') {
        friendlyMessage = 'Please enter a valid email address.';
      } else if (err.code === 'auth/network-request-failed') {
        friendlyMessage = 'Network error. Please check your internet connection.';
      }

      return {
        success: false,
        message: friendlyMessage
      };
    }
  }

  /**
   * Sign out the current admin user
   * @returns {Promise<void>}
   */
  async function signOut() {
    const auth = getAuth();
    if (auth) {
      try {
        await auth.signOut();
      } catch (err) {
        // Silent fail on sign out errors
      }
    }
  }

  /**
   * Listen for authentication state changes
   * @param {function} callback - Called with (user) where user is null if not signed in
   */
  function onAuthStateChanged(callback) {
    const auth = getAuth();
    if (auth) {
      auth.onAuthStateChanged(callback);
    } else {
      // Firebase not available, treat as not authenticated
      callback(null);
    }
  }

  /**
   * Check if a user is currently signed in
   * @returns {boolean}
   */
  function isAdmin() {
    const auth = getAuth();
    return auth && auth.currentUser !== null;
  }

  /**
   * Get the current signed-in user
   * @returns {object|null}
   */
  function getCurrentUser() {
    const auth = getAuth();
    return auth ? auth.currentUser : null;
  }

  /**
   * Get rate limit status (for UI display)
   * @returns {{ attemptsLeft: number, isLocked: boolean, lockoutSeconds: number }}
   */
  function getRateLimitStatus() {
    const rateCheck = checkRateLimit();
    return {
      attemptsLeft: Math.max(0, MAX_ATTEMPTS - attemptCount),
      isLocked: !rateCheck.allowed,
      lockoutSeconds: rateCheck.remainingSeconds
    };
  }

  // Public API
  return {
    signIn,
    signOut,
    onAuthStateChanged,
    isAdmin,
    getCurrentUser,
    getRateLimitStatus
  };
})();

window.AuthGuard = AuthGuard;
