import * as fs from "fs";
import path from "path";
import { HUB_FRONTEND_PATH } from "../config.js";

export async function findFeatureHandler({
  feature,
}: {
  feature: string;
}) {
  const root = path.join(
    HUB_FRONTEND_PATH,
    "src"
  );

  const matches: string[] = [];

  if (!fs.existsSync(root)) {
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(matches, null, 2),
        },
      ],
    };
  }

  function scan(dir: string) {
    const entries = fs.readdirSync(dir, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        scan(fullPath);
      } else {
        if (
          entry.name
            .toLowerCase()
            .includes(feature.toLowerCase())
        ) {
          matches.push(
            path.relative(HUB_FRONTEND_PATH, fullPath)
          );
        }
      }
    }
  }

  scan(root);

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(matches, null, 2),
      },
    ],
  };
}