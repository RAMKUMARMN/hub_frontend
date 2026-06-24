import fs from "fs";
import path from "path";
import { HUB_FRONTEND_PATH } from "../config.js";
export async function discoverComponentsHandler() {

  const dir = path.join(HUB_FRONTEND_PATH, "src", "components");

  if (!fs.existsSync(dir)) {
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify([], null, 2),
        },
      ],
    };
  }

  const components = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".tsx"));

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(components, null, 2),
      },
    ],
  };
}