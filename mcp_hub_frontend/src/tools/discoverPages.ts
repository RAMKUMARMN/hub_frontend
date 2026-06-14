import * as fs from "fs";
import path from "path";
import { HUB_FRONTEND_PATH } from "../config.js";

export async function discoverPagesHandler() {
  try {
    const frontendRoot = path.join(
      HUB_FRONTEND_PATH,
      "src",
      "app"
    );

    if (!fs.existsSync(frontendRoot)) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify([], null, 2),
          },
        ],
      };
    }

    const pages: string[] = [];

    function scan(dir: string, route = "") {
      const entries = fs.readdirSync(dir, {
        withFileTypes: true,
      });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          if (entry.name.startsWith("(")) continue;

          scan(
            fullPath,
            route + "/" + entry.name.replace(/\[.*?\]/g, ":param")
          );
        }

        if (
          entry.isFile() &&
          entry.name === "page.tsx"
        ) {
          pages.push(route || "/");
        }
      }
    }

    scan(frontendRoot);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(pages, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: String(error),
        },
      ],
      isError: true,
    };
  }
}