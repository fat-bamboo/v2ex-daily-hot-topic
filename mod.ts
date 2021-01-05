import { format } from "std/datetime/mod.ts";
import { join } from "std/path/mod.ts";
import { exists } from "std/fs/mod.ts";

import { HOT_TOPICS_DATA_URL, LASTEST_TOPICS_DATA_URL } from "./consts.ts";
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

/**
 * 对源数据进行处理，包括：筛选、排序、切割
 * @param rawTopics 源数据
 */
function filterRawData(rawTopics: Topic[]): Topic[] {
  const topicIdSet: Set<number> = new Set();
  const topics: Topic[] = [];

  /**
   * 数据处理:
   * 筛选，创建时间是在"今天" && 评论数大于 5
   * 排序，按回复数从多到少排序
   * 去重
   * 切割，只选取 TOPICS_MAX_AMOUNT 条数据
   * 暂时不去除【推广】主题: t.node.name !== "promotions"
   */
  rawTopics
    .filter(
      (t) => t.created * 1000 > utils.getTodayEarlyTimeStamp() && t.replies > 5,
    )
    .sort((a, b) => b.replies - a.replies)
    .forEach((t) => {
      if (!topicIdSet.has(t.id)) {
        topicIdSet.add(t.id);
        // 删除掉标题里不正常的符号
        t.title = t.title.replace(/[\n\r]/g, "");
        topics.push(t);
      }
    });

  return topics.slice(0, 0 + utils.getMaxDisplayCount());
}

async function main() {
  const currentDateStr = format(
    new Date(utils.getCurrentTimeStamp()),
    "yyyy-MM-dd",
  );
  const rawFilePath = join("raw", `${currentDateStr}.json`);

  const rawTopics = await fetchData();
  let todayRawData: Topic[] = [];

  if (await exists(rawFilePath)) {
    todayRawData = JSON.parse(await Deno.readTextFile(rawFilePath));
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
