export const apiVersion = "2025-02-19";
export const dataset = process.env.SANITY_STUDIO_DATASET || "production";
// The project ID is public (it appears in every image URL), so it is safe to keep as the default.
// That way a build from a fresh clone, with no .env file, still points at the right project.
export const projectId = process.env.SANITY_STUDIO_PROJECT_ID || "bxmg8lj7";
