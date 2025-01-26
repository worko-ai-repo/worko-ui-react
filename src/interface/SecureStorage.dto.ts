/**
 * Interface for SecureStorageDto
 *
 * @description This will store all the prop of SecureStorage Class and should be used to define the structure of SecureStorageDto.
 */
export interface SecureStorageServiceDto {
	// Properties
	storage?: Storage;
	// Methods
	hash: (key: string) => string;
	encrypt: (data: string) => string;
	decrypt: (data: string) => string;
}
