import { format } from "std/datetime/mod.ts";
import { join } from "std/path/mod.ts";

import type { Topic } from "./types.ts";

/**
 * 根据数据，返回渲染后的字符串
 * @param data
 */
function genDataListString(data: Topic[]): string {
  return data.map((t) =>
    `1. [${t.title}](${t.url}) \`${t.replies}条评论\` \`${t.node.title}\``
  ).join("\n");
}

/**
 * 根据最新源数据更新 README，返回更新后的文件文本字符串
 * @param data 源数据
 */
export async function genNewReadmeText(data: Topic[]): Promise<string> {
  const formatedNowTimeStr = format(new Date(), "yyyy-MM-dd HH:mm:ss");
  const yesterdayTimeStr = format(
    new Date(getCurrentTimeStamp() - 24 * 1000 * 3600),
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

数据更新于 ${formatedNowTimeStr}

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
  const formatedNowTimeStr = format(new Date(), "yyyy-MM-dd");

  return `# ${formatedNowTimeStr}\n
${genDataListString(data)}
`;
}

/** 返回今日起始时间时间戳，以毫秒为单位 */
export function getTodayEarlyTimeStamp(): number {
  const todayEarlyDate = new Date(
    format(new Date(Date.now() + getTimezoneMsOffset()), "yyyy-MM-dd"),
  );

  return todayEarlyDate.getTime();
}

/** 返回此时时间戳，以毫秒为单位 */
export function getCurrentTimeStamp(): number {
  const currentDate = new Date(Date.now() + getTimezoneMsOffset());

  return currentDate.getTime();
}

/** 返回时区差值，以毫秒为单位 */
export function getTimezoneMsOffset(): number {
  return new Date().getTimezoneOffset() * 60 * 1000;
}

/**
 * 根据今天到某个特殊日期的差值，获取最大数据展示条数 :)
 */
export function getMaxDisplayCount(): number {
  const someDayTimestamp = new Date("1998/7/26").getTime();
  const currentTimestamp = Date.now();

  return Math.floor(
    (currentTimestamp - someDayTimestamp) / 1000 / 3600 / 24 / 365,
  );
}
