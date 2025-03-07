import * as CryptoJS from 'crypto-js';
import { SecureStorageServiceDto } from '@Interfaces/SecureStorage.dto';
import { SecureStorageKeyEnum } from 'src/types/enums/SecureStorage.enum';

// Secret key (same as Angular)
const SECRET_KEY = 'REDACTED_SECRET';

/**
 * Storage Service for React
 */
export default class SecureStorage {
	constructor(storage: Storage, options: SecureStorageServiceDto) {
		this.storage = storage;
		this.hash = options.hash;
		this.encrypt = options.encrypt;
		this.decrypt = options.decrypt;
	}

	// Properties
	private storage: Storage;

	// Hashing function for keys
	private hash(key: string): string {
		const hashedKey = CryptoJS.HmacSHA256(key, SECRET_KEY).toString();
		console.log(`[SecureStorage] Hashed Key: ${key} -> ${hashedKey}`);
		return hashedKey;
	}

	// Encrypt function for values
	private encrypt(data: string): string {
		const encryptedData = CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
		console.log(`[SecureStorage] Encrypted Data: ${data} -> ${encryptedData}`);
		return encryptedData;
	}

	// Decrypt function for values
	private decrypt(data: string): string {
		const bytes = CryptoJS.AES.decrypt(data, SECRET_KEY);
		const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
		console.log(`[SecureStorage] Decrypted Data: ${data} -> ${decryptedData}`);
		return decryptedData;
	}

	getItem<T>(key: SecureStorageKeyEnum): T | null {
		// Hash the key
		const hashedKey = this.hash(key);
	
		// Get the encrypted data from storage
		const encryptedData = this.storage.getItem(hashedKey);
	
		if (!encryptedData) return null;
	
		try {
			// Decrypt the data
			const decryptedData = this.decrypt(encryptedData);
			console.log(`[SecureStorage] Decrypted Data: ${decryptedData}`);
	
			// If decrypted data starts with '{' or '[', attempt to parse JSON
			if (decryptedData.startsWith('{') || decryptedData.startsWith('[')) {
				return JSON.parse(decryptedData) as T;
			}
	
			// If it's a plain string, return as-is
			return decryptedData as T;
		} catch (error) {
			console.error(`[SecureStorage] Error decrypting key: ${key}`, error);
			return null;
		}
	}
	

	// Set item in storage
	setItem<T>(key: SecureStorageKeyEnum, value: T): void {
		const hashedKey = this.hash(key);
		const processedValue = typeof value === 'string' ? value : JSON.stringify(value);
		const encryptedValue = this.encrypt(processedValue);

		try {
			this.storage.setItem(hashedKey, encryptedValue);
			console.log(`[SecureStorage] Stored - Key: ${key} | Hashed: ${hashedKey} | Encrypted: ${encryptedValue}`);
		} catch (error) {
			console.error(`[SecureStorage] Error setting key: ${key}`, error);
		}
	}

	// Remove item from storage
	remove(key: SecureStorageKeyEnum): void {
		const hashedKey = this.hash(key);
		try {
			this.storage.removeItem(hashedKey);
			console.log(`[SecureStorage] Item removed - Key: ${key} | Hashed: ${hashedKey}`);
		} catch (error) {
			console.error(`[SecureStorage] Error removing key: ${key}`, error);
		}
	}

	// Clear storage
	clear(): void {
		try {
			this.storage.clear();
			console.log('[SecureStorage] Storage cleared');
		} catch (error) {
			console.error('[SecureStorage] Error clearing storage', error);
		}
	}
}
