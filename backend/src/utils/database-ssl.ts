import { existsSync, readFileSync } from "fs";

type Env = Record<string, string | undefined>;

export type DatabaseSslConfig =
  | false
  | {
      rejectUnauthorized: boolean;
      ca?: string;
    };

export const resolveDatabaseSslConfig = (env: Env): DatabaseSslConfig => {
  const shouldEnable = /^true$/i.test(env.DATABASE_SSL ?? "");

  if (!shouldEnable) {
    return false;
  }

  const rejectUnauthorized =
    (env.DATABASE_SSL_REJECT_UNAUTHORIZED ?? "true").toLowerCase() !== "false";

  const caFile = env.DATABASE_SSL_CA_FILE;
  const ca =
    caFile && existsSync(caFile) ? readFileSync(caFile, "utf8") : undefined;

  return {
    rejectUnauthorized,
    ca,
  };
};
