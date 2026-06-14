import * as fs from "fs";
import path from "path";
import { HUB_FRONTEND_PATH } from "../config.js";

export async function discoverStateManagementHandler() {
  const storeDir = path.join(
    HUB_FRONTEND_PATH,
    "src",
    "store"
  );

  if (!fs.existsSync(storeDir)) {
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              type: "Unknown",
              stores: [],
            },
            null,
            2
          ),
        },
      ],
    };
  }

  const stores = fs.readdirSync(storeDir);

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(
          {
            type: "Zustand",
            stores,
          },
          null,
          2
        ),
      },
    ],
  };
}