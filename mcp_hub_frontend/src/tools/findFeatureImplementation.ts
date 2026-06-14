import { features } from "../data/features.js";

export async function findFeatureImplementationHandler() {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(features, null, 2),
      },
    ],
  };
}