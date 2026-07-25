import * as fs from "fs";
import path from "path";
import { HUB_FRONTEND_PATH } from "../config.js";

export async function discoverApiLayerHandler() {
  const apiFile = path.join(
    HUB_FRONTEND_PATH,
    "src",
    "lib",
    "api.ts"
  );

  const exists = fs.existsSync(apiFile);

  let content = "";

  if (exists) {
    content = fs.readFileSync(
      apiFile,
      "utf-8"
    );
  }

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(
          {
            apiFile: "src/lib/api.ts",
            exists,
            preview: content.slice(0, 500),
          },
          null,
          2
        ),
      },
    ],
  };
}