const crypto = require('crypto');
const config = require('../config/config');

exports.decAESString = (encryptedData) => {
    try {
        const algorithm = 'aes-128-cbc';

        // Ensure AUTHKEY and IV are exactly 16 bytes
        const key = process.env.AUTHKEY;
        const iv = process.env.IV;

        if (key.length !== 16 || iv.length !== 16) {
            throw new Error('Invalid key or IV length. Must be 16 bytes.');
        }

        // Decode URL-encoded data
        const decodedData = decodeURIComponent(encryptedData);

        // Convert from base64 (ensure no spaces or newlines)
        const encryptedBuffer = Buffer.from(decodedData.trim(), 'base64');

        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        decipher.setAutoPadding(true);

        let decrypted = decipher.update(encryptedBuffer, 'binary', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption failed:', error.message);
        throw new Error('Decryption error');
    }
}

exports.encAESString = (plainText) => {
    try {
        const algorithm = 'aes-128-cbc';

        // Ensure AUTHKEY and IV are set and exactly 16 bytes
        const key = process.env.AUTHKEY;
        const iv = process.env.IV;

        if (!key || !iv || key.length !== 16 || iv.length !== 16) {
            throw new Error('Invalid key or IV length. Must be 16 bytes.');
        }

        // Create cipher instance
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        cipher.setAutoPadding(true);

        let encrypted = cipher.update(plainText, 'utf8', 'base64');
        encrypted += cipher.final('base64');

        // URL-encode the encrypted data
        const encodedData = encodeURIComponent(encrypted);

        return encodedData;
    } catch (error) {
        console.error('Encryption failed:', error.message);
        throw new Error('Encryption error');
    }
};
exports.parseQueryString = (inputData) => {
    const params = new URLSearchParams(inputData);
    const result = {};
    for (const [key, value] of params.entries()) {
        result[key] = value === 'null' ? null : value; // Convert 'null' string to null
    }
    return result;
};
exports.convertToCamelCase = (obj) => {
    const toCamel = (s) =>
        s.replace(/([-_][a-z])/g, (group) =>
            group.toUpperCase().replace('-', '').replace('_', '')
        );

    if (obj instanceof Array) {
        return obj.map((item) => convertToCamelCase(item));
    }

    if (obj !== null && obj.constructor === Object) {
        return Object.keys(obj).reduce((acc, key) => {
            acc[toCamel(key)] = convertToCamelCase(obj[key]);
            return acc;
        }, {});
    }

    return obj;
};
exports.jsonToQueryParams = (json) => {
    const queryParams = Object.keys(json)
        .map(key => {
            if (json[key] !== null && json[key] !== undefined) {
                return `${encodeURIComponent(key)}=${encodeURIComponent(json[key])}`;
            }
            return null;
        })
        .filter(param => param !== null)
        .join('&');
    return queryParams;
}
exports.getMandateStatus = (registrationStatus) => {
    switch (registrationStatus) {
        case "Pending":
        case "Initiated":
            return "PENDING";
        case "Success":
            return "CREATED"; // or "SUCCESS" based on your requirement
        case "Failed":
            return "FAILED";
        default:
            return null; // Handles null or undefined cases
    }
}

// Helper functions for AES-GCM encryption
function hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
}

function base64ToBytes(base64) {
    return Uint8Array.from(Buffer.from(base64, 'base64'));
}

function bytesToHex(buffer) {
    return [...buffer].map(b => b.toString(16).toUpperCase().padStart(2, '0')).join('');
}

// AES-GCM Decryption function
async function decryptAesGcm(hexMessage) {
    const aesKeyBase64 = config.security.aesKeyBase64;
    const hmacKeyBase64 = config.security.hmacKeyBase64;

    if (!aesKeyBase64 || !hmacKeyBase64) {
        throw new Error('AES_KEY_BASE64 and HMAC_KEY_BASE64 environment variables are required');
    }

    const aesKeyBytes = base64ToBytes(aesKeyBase64);
    const hmacKeyBytes = base64ToBytes(hmacKeyBase64);

    const fullMessage = hexToBytes(hexMessage);

    const hmacReceived = fullMessage.slice(0, 48); // 48 bytes
    const encryptedData = fullMessage.slice(48);   // IV + Cipher

    // Import HMAC key
    const hmacKey = await crypto.subtle.importKey(
        'raw',
        hmacKeyBytes,
        { name: 'HMAC', hash: 'SHA-384' },
        false,
        ['verify']
    );

    const isValid = await crypto.subtle.verify(
        'HMAC',
        hmacKey,
        hmacReceived,
        encryptedData
    );

    if (!isValid) {
        throw new Error('HMAC validation failed. Message may be tampered.');
    }

    const iv = encryptedData.slice(0, 12); // first 12 bytes
    const cipherText = encryptedData.slice(12);

    // Import AES key
    const aesCryptoKey = await crypto.subtle.importKey(
        'raw',
        aesKeyBytes,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
    );

    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        aesCryptoKey,
        cipherText
    );

    return new TextDecoder().decode(decrypted);
}

// AES-GCM Encryption function
async function aesGcmEncrypt(plaintext) {
    const aesKeyBase64 = config.security.aesKeyBase64;
    const hmacKeyBase64 = config.security.hmacKeyBase64;

    if (!aesKeyBase64 || !hmacKeyBase64) {
        throw new Error('AES_KEY_BASE64 and HMAC_KEY_BASE64 environment variables are required');
    }

    const aesKeyBytes = base64ToBytes(aesKeyBase64);
    const hmacKeyBytes = base64ToBytes(hmacKeyBase64);

    // Generate IV (12 bytes)
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Import AES key
    const aesCryptoKey = await crypto.subtle.importKey(
        'raw',
        aesKeyBytes,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
    );

    // Encrypt the data
    const encoder = new TextEncoder();
    const cipherBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        aesCryptoKey,
        encoder.encode(plaintext)
    );

    // Combine IV + CipherText
    const cipherBytes = new Uint8Array(cipherBuffer);
    const combined = new Uint8Array(iv.length + cipherBytes.length);
    combined.set(iv, 0);
    combined.set(cipherBytes, iv.length);

    // Import HMAC key
    const hmacKey = await crypto.subtle.importKey(
        'raw',
        hmacKeyBytes,
        { name: 'HMAC', hash: 'SHA-384' },
        false,
        ['sign']
    );

    // Create HMAC
    const hmacBuffer = await crypto.subtle.sign('HMAC', hmacKey, combined);
    const hmacBytes = new Uint8Array(hmacBuffer);

    // Final message: [HMAC || IV || Cipher]
    const finalMessage = new Uint8Array(hmacBytes.length + combined.length);
    finalMessage.set(hmacBytes, 0);
    finalMessage.set(combined, hmacBytes.length);

    // Return HEX string
    return bytesToHex(finalMessage);
}

// Export the new AES-GCM functions
exports.hexToBytes = hexToBytes;
exports.base64ToBytes = base64ToBytes;
exports.bytesToHex = bytesToHex;
exports.decryptAesGcm = decryptAesGcm;
exports.aesGcmEncrypt = aesGcmEncrypt;