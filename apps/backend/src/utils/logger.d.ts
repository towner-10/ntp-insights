declare const LOG_LEVEL: {
    readonly DEBUG: "DEBUG";
    readonly SUCCESS: "✅ SUCCESS";
    readonly WARN: "⚠️ WARN";
    readonly ERROR: "❌ ERROR";
    readonly FATAL: "⛔ FATAL";
};
type LogLevel = keyof typeof LOG_LEVEL;
export declare const logger: {
    log: (level: LogLevel, message: unknown) => void;
    debug: (message: unknown) => void;
    success: (message: unknown) => void;
    warn: (message: unknown) => void;
    error: (message: unknown) => void;
};
export {};
//# sourceMappingURL=logger.d.ts.map