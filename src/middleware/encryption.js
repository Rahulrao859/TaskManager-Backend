const CryptoJS = require('crypto-js');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default_32_char_key_replace_this!';

/**
 * Encrypts a string value using AES encryption
 */
const encrypt = (value) => {
    if (!value) return value;
    return CryptoJS.AES.encrypt(String(value), ENCRYPTION_KEY).toString();
};

/**
 * Decrypts an AES-encrypted string
 */
const decrypt = (encryptedValue) => {
    if (!encryptedValue) return encryptedValue;
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedValue, ENCRYPTION_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch {
        return encryptedValue;
    }
};

/**
 * Middleware: encrypts sensitive fields in response
 * Wraps res.json to encrypt the `data` field if present
 */
const encryptResponse = (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = (body) => {
        if (body && body.encrypted && body.data) {
            body.data = encrypt(JSON.stringify(body.data));
        }
        return originalJson(body);
    };

    next();
};

/**
 * Middleware: decrypts incoming encrypted request body
 */
const decryptRequest = (req, res, next) => {
    if (req.body && req.body.encrypted && req.body.data) {
        try {
            const decrypted = decrypt(req.body.data);
            req.body = JSON.parse(decrypted);
        } catch {
            return res.status(400).json({
                success: false,
                message: 'Invalid encrypted payload',
            });
        }
    }
    next();
};

module.exports = { encrypt, decrypt, encryptResponse, decryptRequest };
