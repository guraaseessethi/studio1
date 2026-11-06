import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || "bxmg8lj7",
    dataset: process.env.SANITY_STUDIO_DATASET || "production",
  },
  // Hosted at https://studio-1-barbershop.sanity.studio. Change it here if that name is taken.
  studioHost: "studio-1-barbershop",
  deployment: { autoUpdates: true },
});
