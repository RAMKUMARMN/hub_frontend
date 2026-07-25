import * as fs from "fs";
import path from "path";
import { HUB_FRONTEND_PATH } from "../config.js";

export async function findFeatureImplementationHandler({
  feature,
}: {
  feature: string;
}) {

  const root = path.join(
    HUB_FRONTEND_PATH,
    "src"
  );

  const result = {
    feature,
    pages: [] as string[],
    components: [] as string[],
    stores: [] as string[],
    services: [] as string[],
    hooks: [] as string[],
  };

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
      "register",
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

    feature.toLowerCase(),

    ...(
      aliases[
        feature.toLowerCase()
      ] || []
    ),
  ];

  function addMatch(
    relativePath: string
  ) {

    const normalized =
      relativePath.replace(
        /\\/g,
        "/"
      );

    if (
      normalized.includes(
        "/app/"
      )
    ) {

      result.pages.push(
        relativePath
      );

      return;
    }

    if (
      normalized.includes(
        "/components/"
      )
    ) {

      result.components.push(
        relativePath
      );

      return;
    }

    if (
      normalized.includes(
        "/store/"
      )
    ) {

      result.stores.push(
        relativePath
      );

      return;
    }

    if (
      normalized.includes(
        "/lib/"
      )
    ) {

      result.services.push(
        relativePath
      );

      return;
    }

    if (
      normalized.includes(
        "/hooks/"
      )
    ) {

      result.hooks.push(
        relativePath
      );

      return;
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

        scan(
          fullPath
        );

        continue;
      }

      const filename =
        entry.name.toLowerCase();

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
          ) ||
          relativePath
            .toLowerCase()
            .includes(
              term
            )
        ) {

          addMatch(
            relativePath
          );

          break;
        }
      }
    }
  }

  if (
    fs.existsSync(root)
  ) {

    scan(root);
  }

  return {

    content: [

      {

        type:
          "text" as const,

        text:
          JSON.stringify(
            result,
            null,
            2
          ),
      },
    ],
  };
}