const sessions = new Map();

function setSession(senderId, user) {
  sessions.set(senderId, user);
}

function clearSession(senderId) {
  sessions.delete(senderId);
}

function getRole(event) {
  const session = sessions.get(event.sender.id);
  return session?.role || null;
}

function isAdmin(event) {
  return getRole(event) === 'admin';
}

function requireAdmin(event) {
  if (!isAdmin(event)) {
    return { success: false, error: 'Admin access required' };
  }
  return null;
}

module.exports = { setSession, clearSession, getRole, isAdmin, requireAdmin };
