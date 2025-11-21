
const User = require("../models/user.Model"); 

const PREFIX = "VIKA";
const MAX_RETRIES = 5;


async function generateReferralCode(userId) {
  let referralCode;
  let isUnique = false;
  let attempts = 0;

  const last4 = String(userId).slice(-4).toUpperCase();

  while (!isUnique && attempts < MAX_RETRIES) {
    const randomPart = Math.random().toString(36).substring(2, 4).toUpperCase();
    referralCode = `${PREFIX}${last4}${randomPart}`; // VIKAAB12

    const exists = await User.findOne({ referralCode });
    if (!exists) isUnique = true;

    attempts++;
  }

  if (!isUnique) {
    throw new Error("Failed to generate unique referral code");
  }

  return referralCode;
}


function generateUsername() {
  const prefix = "vik";
  const letters = Math.random().toString(36).substring(2, 6).toUpperCase();
  const numbers = Math.floor(100 + Math.random() * 9000);

  return `${prefix}${letters}${numbers}`.toLowerCase(); // vikabts3721
}


module.exports = { generateUsername, generateReferralCode };
