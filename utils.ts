import { format } from "std/datetime/mod.ts";
import { join } from "std/path/mod.ts";

import type { Topic } from "./types.ts";

/**
 * 根据数据，返回渲染后的字符串
 * @param data 
 */
function genDataListString(data: Topic[]): string {
  return data.map((t) =>
    `1. [${t.title}](${t.url}) \`\`${t.replies}条评论\`\` \`\`${t.node.title}\`\``
  ).join("\n");
}

/** 对数据的回复数量字段进行动态筛选 */
export function filterTopicsByRepliesCount(data: Topic[]): Topic[] {
  let minAppliesCount: number = 3;
  while (
    minAppliesCount < 10 &&
    data.filter((t) => t.replies >= minAppliesCount).length > 10
  ) {
    minAppliesCount++;
  }

  // NOTE: 如果最后数据条数较小
  if (data.filter((t) => t.replies >= minAppliesCount).length < 10) {
    minAppliesCount--;
  }

  return data.filter((t) => t.replies >= minAppliesCount);
}

/**
 * 根据最新源数据更新 README，返回更新后的文件文本字符串
 * @param data 源数据
 */
export async function genNewReadmeText(data: Topic[]): Promise<string> {
  const formatedNowTime = format(new Date(), "yyyy-MM-dd HH:mm:ss");
  const yesterdayTimeStr = format(
    new Date(Date.now() - 32 * 1000 * 3600),
    "yyyy-MM-dd",
  );
  const yesterDayRawFilePath = join("raw", `${yesterdayTimeStr}.json`);
  const yesterdayData = JSON.parse(
    await Deno.readTextFile(yesterDayRawFilePath),
  );

  let readmeTextStr = await Deno.readTextFile("./README.md");

  // 更新今日数据
  readmeTextStr = readmeTextStr.replace(
    /<!-- TODAY BEGIN -->[\W\w]*<!-- TODAY END -->/,
    `<!-- TODAY BEGIN -->
${genDataListString(data) || "空空如也"}

数据更新于 ${formatedNowTime}
<!-- TODAY END -->`,
  );

  // 更新昨日数据
  readmeTextStr = readmeTextStr.replace(
    /<!-- YESTERDAY BEGIN -->[\W\w]*<!-- YESTERDAY END -->/,
    `<!-- YESTERDAY BEGIN -->
${genDataListString(yesterdayData) || "空空如也"}
<!-- YESTERDAY END -->`,
  );

  return readmeTextStr;
}

/**
 * 根据最新源数据生成 archive，返回最新的文件文本字符串
 * @param data 源数据
 */
export function genArchiveText(data: Topic[]): string {
  const formatedNowTime = format(new Date(), "yyyy-MM-dd");

  return `# ${formatedNowTime}\n
${genDataListString(data)}
`;
}

/**
 * 返回今日时间戳，毫秒为单位
 */
export function getTodayTimeStamp(): number {
  const formatedTodayTime = new Date(format(new Date(), "yyyy-MM-dd"));

  return formatedTodayTime.getTime();
}
