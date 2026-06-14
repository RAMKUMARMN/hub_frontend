import { architecture } from "../data/architecture.js";

export async function discoverFrontendArchitectureHandler() {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(architecture, null, 2),
      },
    ],
  };
}