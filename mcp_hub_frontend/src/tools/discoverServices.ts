import { services } from "../data/services.js";

export async function discoverServicesHandler() {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(services, null, 2),
      },
    ],
  };
}