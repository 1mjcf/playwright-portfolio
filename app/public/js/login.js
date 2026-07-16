'use strict';

document.querySelector('#login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const errorEl = document.querySelector('[data-testid="login-error"]');
  errorEl.classList.add('hidden');

  const username = document.querySelector('#username').value;
  const password = document.querySelector('#password').value;

  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const body = await res.json();

  if (!res.ok) {
    errorEl.textContent = body.error || 'Sign in failed';
    errorEl.classList.remove('hidden');
    return;
  }

  localStorage.setItem(TOKEN_KEY, body.token);
  localStorage.setItem(USER_KEY, body.user.displayName);
  window.location.assign('/dashboard');
});
