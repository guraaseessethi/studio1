import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { dataset, projectId } from "./lib/env";
import { SINGLETON_TYPES, schemaTypes } from "./schemaTypes";
import { structure } from "./structure";

const HIDDEN_FROM_CREATE = [...SINGLETON_TYPES, "booking"];
const PROTECTED_ACTIONS = ["unpublish", "delete", "duplicate"];

export default defineConfig({
  name: "studio-1",
  title: "Studio 1 Barbershop",
  projectId,
  dataset,
  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter(({ schemaType }) => !HIDDEN_FROM_CREATE.includes(schemaType)),
  },
  plugins: [structureTool({ structure })],
  document: {
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === "global" ? prev.filter((t) => !HIDDEN_FROM_CREATE.includes(t.templateId)) : prev,
    actions: (prev, { schemaType }) =>
      SINGLETON_TYPES.includes(schemaType) || schemaType === "booking"
        ? prev.filter(({ action }) => !(action && PROTECTED_ACTIONS.includes(action)))
        : prev,
  },
  scheduledPublishing: { enabled: false },
  tasks: { enabled: false },
  releases: { enabled: false },
});
