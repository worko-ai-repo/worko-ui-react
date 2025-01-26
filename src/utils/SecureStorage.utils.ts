import SecureStorage from '@Services/LocalStorage.service';
import CryptoJS from 'crypto-js';

// Type Assertion for SECRET_KEY
const SECRET_KEY: string = import.meta.env.APP_LOCAL_STORAGE_SECRET_KEY;

// Check if SECRET_KEY is a string
if (typeof SECRET_KEY !== 'string') {
	throw new Error('APP_LOCAL_STORAGE_SECRET_KEY must be a string');
}

/**
 * SecureStorageService
 *
 * @description SecureStorageService is a class that contains the secureStorage property which is an instance of SecureStorage.
 */
const secureStorage = new SecureStorage(localStorage, {
	hash: function hash(key: any): string {
    key = CryptoJS.HmacSHA256(key, SECRET_KEY);
    return key.toString();
  },
  encrypt: function encrypt(data: any): string {
    data = CryptoJS.AES.encrypt(data, SECRET_KEY);
    return data.toString();
  },
  decrypt: function decrypt(data: any): string {
    data = CryptoJS.AES.decrypt(data, SECRET_KEY);
    return data.toString(CryptoJS.enc.Utf8);
  },
});

// Export the secureStorage instance for use in other parts of your application
export default secureStorage;
