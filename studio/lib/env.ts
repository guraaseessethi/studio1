export const apiVersion = "2025-02-19";
export const dataset = process.env.SANITY_STUDIO_DATASET || "production";
// A well-formed placeholder lets the Studio build before the real project ID is set.
export const projectId = process.env.SANITY_STUDIO_PROJECT_ID || "placeholder";
