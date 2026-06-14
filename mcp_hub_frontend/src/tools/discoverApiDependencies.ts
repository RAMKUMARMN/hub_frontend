import { apiDependencies } from "../data/apiDependencies.js";

export async function discoverApiDependenciesHandler() {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(apiDependencies, null, 2),
      },
    ],
  };
}