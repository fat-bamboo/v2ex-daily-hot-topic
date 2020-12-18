/**
 * Define the util functions.
 */
import type { Topic } from "./types.ts";

function genListString(data: Topic[]): string {
  return `<!-- BEGIN -->
Last updated at ${Date().toString()}

${data.map((x) => `1. [${x.title}](${x.url})`).join("\n")}
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
