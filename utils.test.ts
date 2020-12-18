/**
 * Use for test
 */
import { join } from "std/path/mod.ts";
import { format } from "std/datetime/mod.ts";

import { Topic } from "./types.ts";

const testJSONFilePath = join("raw", "2020-12-18.json");

const fileText = await Deno.readTextFile(testJSONFilePath);
const topics: Topic[] = JSON.parse(fileText);

function genListString(data: Topic[]): string {
  const formatedNowTime = format(new Date(), "yyyy-MM-dd HH:mm:ss");

  return `<!-- BEGIN -->
${
    data.map((t) =>
      `1. [${t.title}](${t.url}) ( ${t.replies}条评论, [![icon](${t.node.avatar_mini}) ${t.node.title}](${t.node.url}) )`
    ).join("\n")
  }

Last updated at ${formatedNowTime}
<!-- END -->`;
}

console.log(genListString(topics));
