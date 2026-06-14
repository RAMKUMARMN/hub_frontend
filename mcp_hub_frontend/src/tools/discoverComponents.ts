import fs from "fs";
import path from "path";

export async function discoverComponentsHandler() {
  const dir = path.join(process.cwd(), "src", "components");

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