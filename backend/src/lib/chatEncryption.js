import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;

const getEncryptionKey = () => {
  const secret = process.env.CHAT_ENCRYPTION_KEY || process.env.JWT_SRC || "page-mates-chat-secret";
  return crypto.createHash("sha256").update(secret).digest();
};

export const encryptMessage = (plainText) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);

  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    cipherText: encrypted.toString("hex"),
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
  };
};

export const decryptMessage = ({ cipherText, iv, authTag }) => {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getEncryptionKey(),
    Buffer.from(iv, "hex")
  );

  decipher.setAuthTag(Buffer.from(authTag, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(cipherText, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
};
