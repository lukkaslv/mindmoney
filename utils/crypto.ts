
/**
 * Genesis OS Security Layer v1.1
 * Lightweight deterministic licensing and integrity engine.
 */

const SYSTEM_SALT = "GENESIS_CORE_9.8";
const LICENSE_SALT = "MASTER_KEY_GENESIS_2025";

export const SecurityCore = {
    // Generate a simple integrity checksum
    generateChecksum: (data: string): string => {
        let a = 1, b = 0;
        for (let i = 0; i < data.length; i++) {
            a = (a + data.charCodeAt(i)) % 65521;
            b = (b + a) % 65521;
        }
        return ((b << 16) | a).toString(16).toUpperCase();
    },

    // Simple XOR Cipher for LocalStorage obfuscation
    cipher: (text: string, key: string): string => {
        const fullKey = key + SYSTEM_SALT;
        return text.split('').map((char, i) => {
            const keyChar = fullKey.charCodeAt(i % fullKey.length);
            return String.fromCharCode(char.charCodeAt(0) ^ keyChar);
        }).join('');
    },

    safeEncode: (data: any, key: string): string => {
        const json = JSON.stringify(data);
        const checksum = SecurityCore.generateChecksum(json);
        const payload = JSON.stringify({ d: json, c: checksum });
        const encrypted = SecurityCore.cipher(payload, key);
        return btoa(encrypted);
    },

    safeDecode: (encoded: string, key: string): any | null => {
        try {
            const encrypted = atob(encoded);
            const decrypted = SecurityCore.cipher(encrypted, key);
            const { d, c } = JSON.parse(decrypted);
            if (SecurityCore.generateChecksum(d) !== c) return null;
            return JSON.parse(d);
        } catch (e) { return null; }
    },

    /**
     * OFFLINE LICENSE SYSTEM
     * Format: GNS-[TIER]-[EXPIRY_TS]-[HASH]
     */
    validateLicense: (key: string): { valid: boolean; tier: string; expiry: number } => {
        if (!key || !key.startsWith('GNS-')) return { valid: false, tier: 'FREE', expiry: 0 };
        
        const parts = key.split('-');
        if (parts.length !== 4) return { valid: false, tier: 'FREE', expiry: 0 };

        const [, tier, expiry, hash] = parts;
        const rawData = `GNS|${tier}|${expiry}|${LICENSE_SALT}`;
        const calculatedHash = SecurityCore.generateChecksum(rawData);

        const isExpired = Date.now() > parseInt(expiry, 10);

        return {
            valid: calculatedHash === hash && !isExpired,
            tier: tier as any,
            expiry: parseInt(expiry, 10)
        };
    },

    generateLicense: (tier: string, days: number): string => {
        const expiry = Date.now() + (days * 24 * 60 * 60 * 1000);
        const rawData = `GNS|${tier}|${expiry}|${LICENSE_SALT}`;
        const hash = SecurityCore.generateChecksum(rawData);
        return `GNS-${tier}-${expiry}-${hash}`;
    }
};
