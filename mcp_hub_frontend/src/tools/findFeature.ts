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

  const matches =
    new Set<string>();

  if (
    !fs.existsSync(root)
  ) {

    return {

      content: [

        {

          type:
            "text" as const,

          text:
            JSON.stringify(
              [],
              null,
              2
            ),
        },
      ],
    };
  }

  const normalizedFeature =
    feature.toLowerCase();

  const aliases: Record<
    string,
    string[]
  > = {

    chat: [
      "chat",
      "message",
      "conversation",
      "messaging",
    ],

    notification: [
      "notification",
      "notify",
      "alert",
      "push",
    ],

    auth: [
      "auth",
      "login",
      "signin",
      "signup",
      "user",
    ],

    document: [
      "document",
      "file",
      "upload",
      "storage",
    ],

    todo: [
      "todo",
      "task",
      "tasks",
    ],
  };

  const searchTerms = [

    normalizedFeature,

    ...(
      aliases[
        normalizedFeature
      ] || []
    ),
  ];
function collectFiles(
  dir: string
) {

  const entries =
    fs.readdirSync(
      dir,
      {
        withFileTypes: true,
      }
    );

  for (
    const entry
    of entries
  ) {

    const fullPath =
      path.join(
        dir,
        entry.name
      );

    if (
      entry.isDirectory()
    ) {

      collectFiles(
        fullPath
      );

      continue;
    }

    matches.add(
      path.relative(
        HUB_FRONTEND_PATH,
        fullPath
      )
    );
  }
}
  function scan(
    dir: string
  ) {

    const entries =
      fs.readdirSync(
        dir,
        {
          withFileTypes: true,
        }
      );

    for (
      const entry
      of entries
    ) {

      if (
        entry.name.startsWith(".")
      ) {

        continue;
      }

      const fullPath =
        path.join(
          dir,
          entry.name
        );

      if (
  entry.isDirectory()
) {

  const dirname =
    entry.name.toLowerCase();

  const relativeDir =
    path.relative(
      HUB_FRONTEND_PATH,
      fullPath
    );

  for (
    const term
    of searchTerms
  ) {

    if (
  dirname.includes(
    term
  )
) {

  collectFiles(
    fullPath
  );

  break;
}
  }

  scan(fullPath);

  continue;
}

      const filename =
        entry.name
          .toLowerCase();

      const relativePath =
        path.relative(
          HUB_FRONTEND_PATH,
          fullPath
        );

      for (
        const term
        of searchTerms
      ) {

        if (
          filename.includes(
            term
          )
        ) {

          matches.add(
            relativePath
          );

          break;
        }
      }
    }
  }

  scan(root);

  const locations =
    Array.from(matches)
      .sort();

  return {

    content: [

      {

        type:
          "text" as const,

        text:
          JSON.stringify(
            {
              feature,
              found:
                locations.length > 0,
              locations,
            },
            null,
            2
          ),
      },
    ],
  };
}