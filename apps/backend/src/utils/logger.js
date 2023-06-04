"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const chalk_1 = __importDefault(require("chalk"));
const LOG_LEVEL = {
    DEBUG: 'DEBUG',
    SUCCESS: '✅ SUCCESS',
    WARN: '⚠️ WARN',
    ERROR: '❌ ERROR',
    FATAL: '⛔ FATAL',
};
const LOG_LEVEL_COLORS = {
    DEBUG: chalk_1.default.blue,
    SUCCESS: chalk_1.default.green,
    WARN: chalk_1.default.yellow,
    ERROR: chalk_1.default.red,
    FATAL: chalk_1.default.magenta,
};
exports.logger = {
    log: (level, message) => {
        const timestamp = new Date().toISOString();
        console.log(`${timestamp} - ${LOG_LEVEL_COLORS[level](LOG_LEVEL[level])}: ${message}`);
    },
    debug: (message) => exports.logger.log('DEBUG', message),
    success: (message) => exports.logger.log('SUCCESS', message),
    warn: (message) => exports.logger.log('WARN', message),
    error: (message) => exports.logger.log('ERROR', message),
};
