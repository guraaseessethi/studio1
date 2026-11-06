import { createClient } from "@sanity/client";
import { apiVersion, dataset, projectId } from "@/lib/sanity/env";

/** Read-only client for public content. Never sends a token. */
export const client = createClient({ projectId, dataset, apiVersion, useCdn: false, perspective: "published" });
