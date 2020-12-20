import { format } from "std/datetime/mod.ts";
import { join } from "std/path/mod.ts";

import {
  HOT_TOPICS_DATA_URL,
  LASTEST_TOPICS_DATA_URL,
  TOPICS_MAX_AMOUNT,
} from "./consts.ts";
import { Topic } from "./types.ts";
import * as utils from "./utils.ts";

/** 获取数据 */
async function fetchData(): Promise<Topic[]> {
  const hotTopicsRes = await fetch(HOT_TOPICS_DATA_URL);
  const lastestTopicsRes = await fetch(LASTEST_TOPICS_DATA_URL);

  if (!hotTopicsRes.ok || !lastestTopicsRes.ok) {
    console.error(hotTopicsRes.statusText, lastestTopicsRes.statusText);
    Deno.exit(-1);
  }

  const hotTopics: Topic[] = await hotTopicsRes.json();
  const lastestTopics: Topic[] = await lastestTopicsRes.json();

  return hotTopics.concat(lastestTopics);
}

/** 对数据的回复数量字段进行动态筛选 */
function filterTopicsByRepliesCount(topics: Topic[]): Topic[] {
  // 主题里最短评论数
  let minAppliesCount: number = 5;

  while (
    topics.filter((t) => t.replies >= minAppliesCount).length >
      TOPICS_MAX_AMOUNT
  ) {
    minAppliesCount++;
  }

  return topics.filter((t) => t.replies >= minAppliesCount);
}

/**
 * 数据筛选
 * @param rawTopics 源数据
 */
function filterRawData(rawTopics: Topic[]): Topic[] {
  /** id 去重 */
  const topicIdSet: Set<number> = new Set();
  let topics: Topic[] = [];

  rawTopics.sort((a, b) => b.replies - a.replies).forEach((t) => {
    if (!topicIdSet.has(t.id)) {
      topicIdSet.add(t.id);
      topics.push(t);
    }
  });

  const todayEarlyTimestamp = utils.getTodayEarlyTimeStamp();
  /** 数据筛选: 创建时间是在"今天" && 去除【推广】主题 */
  topics = topics.filter((t) =>
    t.created * 1000 > todayEarlyTimestamp && t.node.name !== "promotions"
  );
  /** 按回复数筛选 */
  topics = filterTopicsByRepliesCount(topics);
  /** 按回复数从多到少排序 */
  topics = topics.sort((a, b) => b.replies - a.replies);

  return topics;
}

async function main() {
  const rawTopics = await fetchData();
  const currentDateStr = format(
    new Date(utils.getCurrentTimeStamp()),
    "yyyy-MM-dd",
  );
  const rawFilePath = join("raw", `${currentDateStr}.json`);
  let todayRawData: Topic[] = [];
  try {
    todayRawData = JSON.parse(await Deno.readTextFile(rawFilePath));
  } catch (error) {
    console.error("Cannot find today .json file, maybe it's a new day~");
  }
  const topics = filterRawData(rawTopics.concat(todayRawData));

  // 保存原始 JSON 数据
  await Deno.writeTextFile(rawFilePath, JSON.stringify(topics));

  // 更新 README.md
  const readmeText = await utils.genNewReadmeText(topics);
  await Deno.writeTextFile("./README.md", readmeText);

  // 更新 ./archives/
  const archiveFilePath = join("archives", `${currentDateStr}.md`);
  const archiveText = utils.genArchiveText(topics);
  await Deno.writeTextFile(archiveFilePath, archiveText);
}

await main();
