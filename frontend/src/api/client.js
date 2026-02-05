/**
 * API client with CSRF and session handling.
 */

const API_BASE = '/api'

// 401 interceptor — registered by AuthProvider
let _on401 = null
let _on401Fired = false

export function setOn401Handler(handler) {
  _on401 = handler
}

export function reset401Flag() {
  _on401Fired = false
}

function getCsrfToken() {
  // Get CSRF token from cookie
  const name = 'csrftoken'
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=')
    if (key === name) {
      return value
    }
  }
  return null
}

async function fetchCsrfToken() {
  // Fetch CSRF token from server (sets cookie)
  await fetch(`${API_BASE}/auth/csrf/`, {
    credentials: 'include',
  })
  return getCsrfToken()
}

async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('/') ? `${API_BASE}${endpoint}` : `${API_BASE}/${endpoint}`

  const config = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  // Add CSRF token for non-GET requests
  if (config.method && config.method !== 'GET') {
    let csrfToken = getCsrfToken()
    if (!csrfToken) {
      csrfToken = await fetchCsrfToken()
    }
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken
    }
  }

  const response = await fetch(url, config)

  // Global 401 interceptor — skip auth endpoints (they handle 401 themselves)
  if (response.status === 401 && !endpoint.startsWith('/auth/') && !_on401Fired) {
    _on401Fired = true
    if (_on401) _on401()
  }

  // Handle non-JSON responses
  const contentType = response.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    if (!response.ok) {
      throw new ApiError('Request failed', response.status)
    }
    return null
  }

  const data = await response.json()

  if (!response.ok) {
    throw new ApiError(data.detail || 'Request failed', response.status, data)
  }

  return data
}

class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

export const api = {
  get: (endpoint, options = {}) =>
    request(endpoint, { ...options, method: 'GET' }),

  post: (endpoint, body, options = {}) =>
    request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: (endpoint, body, options = {}) =>
    request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: (endpoint, options = {}) =>
    request(endpoint, { ...options, method: 'DELETE' }),

  // Auth-specific methods
  auth: {
    login: (username, password) =>
      request('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),

    logout: () =>
      request('/auth/logout/', { method: 'POST' }),

    me: () =>
      request('/auth/me/', { method: 'GET' }),

    getCsrf: () => fetchCsrfToken(),
  },
}

export { ApiError }
