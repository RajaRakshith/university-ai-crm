import * as fs from "fs";
import * as path from "path";
import { common } from "oci-sdk";

/**
 * Build OCI authentication provider from env (Option B) or config file (Option A).
 */
export function getOciProvider(): common.AuthenticationDetailsProvider {
  const useConfigFile =
    process.env.OCI_CONFIG_PATH && process.env.OCI_PROFILE && !process.env.OCI_PRIVATE_KEY_PATH;

  if (useConfigFile) {
    const configPath = process.env.OCI_CONFIG_PATH!.replace("~", process.env.HOME || "");
    return new common.ConfigFileAuthenticationDetailsProvider(configPath, process.env.OCI_PROFILE!);
  }

  // Option B: explicit key
  const keyPath = process.env.OCI_PRIVATE_KEY_PATH!;
  const resolvedPath = path.isAbsolute(keyPath) ? keyPath : path.resolve(process.cwd(), keyPath);
  const privateKey = fs.readFileSync(resolvedPath, "utf8");

  return new common.SimpleAuthenticationDetailsProvider(
    process.env.OCI_TENANCY_OCID!,
    process.env.OCI_USER_OCID!,
    process.env.OCI_FINGERPRINT!,
    privateKey,
    null
  );
}

export function getOciRegion(): string {
  return process.env.OCI_REGION || "us-ashburn-1";
}

/** Region for GenAI (embeddings) only. Defaults to us-chicago-1 so on-demand embed model works; set OCI_GENAI_REGION to override. */
export function getOciGenAiRegion(): string {
  return process.env.OCI_GENAI_REGION || "us-chicago-1";
}

export function getOciCompartmentId(): string {
  return process.env.OCI_COMPARTMENT_OCID!;
}

export function getObjectStorageNamespace(): string {
  return process.env.OCI_OBJECTSTORAGE_NAMESPACE!;
}

export function getObjectStorageBucket(): string {
  return process.env.OCI_OBJECTSTORAGE_BUCKET!;
}
