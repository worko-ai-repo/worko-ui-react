/// <reference types="vite/client" />

/**
 * declare
 * @description Dclare the Js module for skipping ts check and provides your module with a type named "any"
 *  * Dont use this unless you dont have package that does not have type declaration eg {@types/xyz}
 *
 * @example declare module 'secure-web-storage';
 *
 * @see {@link https://stackoverflow.com/a/69786997/17848616 Stack Overflow}
 * @see {@link https://medium.com/@steveruiz/using-a-javascript-library-without-type-declarations-in-a-typescript-project-3643490015f3 Medium Article}
 **/
declare module 'secure-web-storage';
