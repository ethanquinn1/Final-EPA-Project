const mfaCodeStore = new Map();

// Store MFA code for userId with expiration (e.g. 5 min)
function storeCode(userId, code) {
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  mfaCodeStore.set(userId.toString(), { code, expiresAt });
}

function verifyCode(userId, inputCode) {
  const record = mfaCodeStore.get(userId.toString());
  if (!record) return false;

  const isExpired = Date.now() > record.expiresAt;
  const isMatch = record.code === inputCode;

  if (isExpired || !isMatch) {
    mfaCodeStore.delete(userId.toString());
    return false;
  }

  mfaCodeStore.delete(userId.toString());
  return true;
}

module.exports = { storeCode, verifyCode };
