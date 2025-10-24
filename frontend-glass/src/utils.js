export function saveAuth(data) {
    localStorage.setItem('auth', JSON.stringify(data));
}

export function loadAuth() {
    try {
        return JSON.parse(localStorage.getItem('auth') || 'null');
    } catch (e) {
        return null;
    }
}

export function clearAuth() {
    localStorage.removeItem('auth');
}
