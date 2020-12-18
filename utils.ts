/**
 * Define the util functions.
 */
import { format } from "std/datetime/mod.ts";

import type { Topic } from "./types.ts";

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

/**
 * 根据最新源数据更新 README，返回更新后的文件文本字符串
 * @param data 源数据
 */
export async function genNewReadmeText(data: Topic[]): Promise<string> {
  const readme = await Deno.readTextFile("./README.md");
  return readme.replace(
    /<!-- BEGIN -->[\W\w]*<!-- END -->/,
    genListString(data),
  );
}

/**
 * 根据最新源数据生成 achive，返回最新的文件文本字符串
 * @param data 源数据
 * @param date 日期
 */
export function genArchiveText(data: Topic[], date: string): string {
  return `# ${date}\n
${genListString(data)}
`;
}
