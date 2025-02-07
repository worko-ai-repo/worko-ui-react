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

	getItem(key: SecureStorageKeyEnum): string | null {
		// Hash the key
		const hashedKey = this.hash(key);

		// Get the encrypted data from the storage
		const encryptedData = this.storage.getItem(hashedKey);

		// If there is encrypted data, decrypt it
		if (encryptedData) {
			try {
				return this.decrypt(encryptedData);
			} catch (error) {
				console.error('Error decrypting item:', error); // @TODO: Replace with Toast
				return null;
			}
		}
		return null;
	}

	setItem(key: SecureStorageKeyEnum, value: string): void {
		// Hash the key
		const hashedKey = this.hash(key);

		// Encrypt the value
		const encryptedValue = this.encrypt(value);

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
				console.log('Item removed successfully');
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
			console.log('Storage cleared successfully');
		} catch (error) {
			console.error('Error clearing storage:', error);
		}
	}
}
