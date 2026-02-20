import { objectstorage } from "oci-sdk";
import { getOciProvider, getOciRegion, getObjectStorageBucket, getObjectStorageNamespace } from "./auth";

let client: objectstorage.ObjectStorageClient | null = null;

function getClient(): objectstorage.ObjectStorageClient {
  if (!client) {
    client = new objectstorage.ObjectStorageClient({
      authenticationDetailsProvider: getOciProvider(),
    });
    client.regionId = getOciRegion();
  }
  return client;
}

export interface UploadResult {
  namespace: string;
  bucket: string;
  objectName: string;
  /** Relative path for reference: namespace/bucket/objectName */
  key: string;
}

/**
 * Upload a buffer to OCI Object Storage. Returns the object key/path for DB storage.
 */
export async function uploadObject(
  objectName: string,
  body: Buffer,
  contentType?: string
): Promise<UploadResult> {
  const namespace = getObjectStorageNamespace();
  const bucket = getObjectStorageBucket();
  const osc = getClient();

  await osc.putObject({
    namespaceName: namespace,
    bucketName: bucket,
    putObjectBody: body,
    objectName,
    contentType: contentType ?? "application/octet-stream",
  });

  return {
    namespace,
    bucket,
    objectName,
    key: `${namespace}/${bucket}/${objectName}`,
  };
}

/**
 * Generate a unique object name with prefix (e.g. resumes/, transcripts/, postings/).
 */
export function uniqueObjectName(prefix: string, originalName: string): string {
  const ext = originalName.includes(".") ? originalName.slice(originalName.lastIndexOf(".")) : "";
  const safe = Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  return `${prefix}${safe}${ext}`.toLowerCase();
}
