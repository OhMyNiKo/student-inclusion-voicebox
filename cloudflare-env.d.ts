declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    ADMIN_PASSPHRASE?: string;
    SESSION_SECRET?: string;
  }
}
