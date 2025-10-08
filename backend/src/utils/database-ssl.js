"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveDatabaseSslConfig = void 0;
const fs_1 = require("fs");
const resolveDatabaseSslConfig = (env) => {
    const shouldEnable = /^true$/i.test(env.DATABASE_SSL ?? "");
    if (!shouldEnable) {
        return false;
    }
    const rejectUnauthorized = (env.DATABASE_SSL_REJECT_UNAUTHORIZED ?? "true").toLowerCase() !== "false";
    const caFile = env.DATABASE_SSL_CA_FILE;
    const ca = caFile && (0, fs_1.existsSync)(caFile) ? (0, fs_1.readFileSync)(caFile, "utf8") : undefined;
    return {
        rejectUnauthorized,
        ca,
    };
};
exports.resolveDatabaseSslConfig = resolveDatabaseSslConfig;
