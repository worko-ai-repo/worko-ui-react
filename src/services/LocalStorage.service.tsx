import { SecureStorageServiceDto } from '@Interfaces/SecureStorage.dto';
import { SecureStorageKeyEnum } from 'src/types/enums/SecureStorage.enum';

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

	// Methods
	private hash: (key: string) => string; // Here Key Represents the Key of the LocalStorage
	private encrypt: (data: string) => string; // Here Data Represents the hashed Key
	private decrypt: (data: string) => string;

	getItem<T>(key: SecureStorageKeyEnum): T | null {
		// Hash the key
		const hashedKey = this.hash(key);

		// Get the encrypted data from storage
		const encryptedData = this.storage.getItem(hashedKey);

		if (encryptedData) {
			try {
				// Decrypt the data
				const decryptedData = this.decrypt(encryptedData);

				// Attempt to parse JSON (if applicable)
				try {
					return JSON.parse(decryptedData) as T;
				} catch {
					return decryptedData as T; // Return as-is if not JSON
				}
			} catch (error) {
				console.error('Error decrypting item:', error);
				return null;
			}
		}
		return null;
	}

	setItem<T>(key: SecureStorageKeyEnum, value: T): void {
		// Hash the key
		const hashedKey = this.hash(key);

		// Only stringify if the value is NOT already a string
		const processedValue = typeof value === 'string' ? value : JSON.stringify(value);

		// Encrypt the value (convert object to string first)
		const encryptedValue = this.encrypt(processedValue);

		// Set the encrypted value in the storage
		try {
			this.storage.setItem(hashedKey, encryptedValue);
		} catch (error) {
			console.error('Error setting item:', error);
		}
	}

	/**
	 * Remove an item from the local storage given its key.
	 *
	 * @param {string} key
	 * @returns {void}
	 */
	remove(key: SecureStorageKeyEnum): void {
		// Hash the key
		const hashedKey = this.hash(key);

		// Get the encrypted data from the storage
		const encryptedData = this.storage.getItem(hashedKey);

		// If there is encrypted data, then remove it
		if (encryptedData) {
			try {
				this.storage.removeItem(key);
				// console.log('Item removed successfully');
			} catch (error) {
				console.error('Error removing item:', error);
			}
		}
	}

	/**
	 * Clear local storage.
	 *
	 * @returns {void}
	 */
	clear(): void {
		try {
			this.storage.clear();
			// console.log('Storage cleared successfully');
		} catch (error) {
			console.error('Error clearing storage:', error);
		}
	}
}
