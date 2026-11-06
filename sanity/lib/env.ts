export const apiVersion = "2025-02-19";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
// A well-formed placeholder lets the app build before the real project ID is set.
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "placeholder";

/** False until a real project ID is set; the site then shows local preview content. */
export const hasProject = projectId !== "placeholder";
