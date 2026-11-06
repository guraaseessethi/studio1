export const apiVersion = "2025-02-19";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
// A production build with no project ID would ship the local-preview content and broken photos.
// Fail the build instead, so a missing Vercel environment variable is caught straight away.
if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
  throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID is not set. Add it in Vercel (Settings, Environment Variables), then redeploy.");
}

// Outside production, a well-formed placeholder lets the app run with preview content.
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "placeholder";

/** False until a real project ID is set; the site then shows local preview content. */
export const hasProject = projectId !== "placeholder";
