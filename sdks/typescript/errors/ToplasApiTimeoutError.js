"use strict";
/**
 * This file was auto-generated by Fern from our API Definition.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToplasApiTimeoutError = void 0;
class ToplasApiTimeoutError extends Error {
    constructor() {
        super("Timeout");
        Object.setPrototypeOf(this, ToplasApiTimeoutError.prototype);
    }
}
exports.ToplasApiTimeoutError = ToplasApiTimeoutError;
