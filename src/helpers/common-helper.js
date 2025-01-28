const crypto = require('crypto');

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