#!/usr/bin/env bash
# ==============================================================================
# Smol Café — Nightly Logical DB Dump to Isolated Off-Site Storage
# ==============================================================================

set -euo pipefail

TIMESTAMP=$(date -u +"%Y%m%d_%H%M%SZ")
BACKUP_DIR="${TMPDIR:-/tmp}/smol_cafe_backups"
BACKUP_FILE="smol_cafe_backup_${TIMESTAMP}.sql"
GZ_FILE="${BACKUP_FILE}.gz"
LATEST_GZ="smol_cafe_backup_latest.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "📦 [$(date -u)] Starting Smol Café logical database dump..."

# Ensure database URL is provided
if [ -z "${DATABASE_URL:-}" ]; then
  echo "❌ Error: DATABASE_URL environment variable is not set." >&2
  exit 1
fi

# 1. Execute pg_dump
echo "⏳ Exporting schema, data, views, and stored procedures..."
pg_dump "${DATABASE_URL}" \
  --format=plain \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --encoding=UTF8 \
  --file="${BACKUP_DIR}/${BACKUP_FILE}"

# 2. Compress backup
echo "🗜️ Compressing dump with gzip..."
gzip -9 -c "${BACKUP_DIR}/${BACKUP_FILE}" > "${BACKUP_DIR}/${GZ_FILE}"
cp "${BACKUP_DIR}/${GZ_FILE}" "${BACKUP_DIR}/${LATEST_GZ}"

BACKUP_SIZE=$(du -h "${BACKUP_DIR}/${GZ_FILE}" | cut -f1)
echo "✅ Compressed dump created: ${GZ_FILE} (${BACKUP_SIZE})"

# 3. Upload to Off-Site Storage (AWS S3 / Cloudflare R2) if bucket is configured
if [ -n "${S3_BUCKET_NAME:-}" ]; then
  echo "🚀 Uploading to isolated off-site bucket: s3://${S3_BUCKET_NAME}/nightly/..."
  
  if command -v aws >/dev/null 2>&1; then
    aws s3 cp "${BACKUP_DIR}/${GZ_FILE}" "s3://${S3_BUCKET_NAME}/nightly/${GZ_FILE}"
    aws s3 cp "${BACKUP_DIR}/${LATEST_GZ}" "s3://${S3_BUCKET_NAME}/nightly/${LATEST_GZ}"
    echo "🎉 Successfully uploaded backup to off-site cloud storage."
  else
    echo "⚠️ Warning: 'aws' CLI not found. Backup saved locally at ${BACKUP_DIR}/${GZ_FILE}."
  fi
else
  echo "ℹ️ Note: S3_BUCKET_NAME not set. Backup preserved locally at ${BACKUP_DIR}/${GZ_FILE}."
fi

# 4. Clean up uncompressed SQL file
rm -f "${BACKUP_DIR}/${BACKUP_FILE}"
echo "🏁 [$(date -u)] Backup routine completed successfully."
