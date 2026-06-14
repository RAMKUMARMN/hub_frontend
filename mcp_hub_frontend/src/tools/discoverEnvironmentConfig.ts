import { environment } from "../data/environment.js";

export async function discoverEnvironmentConfigHandler() {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(environment, null, 2),
      },
    ],
  };
}