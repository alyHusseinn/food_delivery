import crypto from "crypto";

function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

export default generateOTP;