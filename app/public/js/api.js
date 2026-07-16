'use strict';

const TOKEN_KEY = 'finbank.token';
const USER_KEY = 'finbank.user';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function requireAuth() {
  if (!getToken()) window.location.replace('/');
}

async function apiFetch(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
  });
  if (res.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.replace('/');
    throw new Error('Unauthorized');
  }
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
  return body;
}

const audFormatter = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' });

function formatMoney(value) {
  return audFormatter.format(value);
}

function initHeader() {
  const nameEl = document.querySelector('[data-testid="user-name"]');
  if (nameEl) nameEl.textContent = localStorage.getItem(USER_KEY) || '';

  const logoutButton = document.querySelector('[data-testid="logout-button"]');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.location.replace('/');
    });
  }
}
