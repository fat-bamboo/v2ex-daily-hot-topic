#!/usr/bin/env -S deno run --unstable --allow-net --allow-read --allow-write --import-map=import_map.json
import { format } from "std/datetime/mod.ts";
import { join } from "std/path/mod.ts";

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

  const todayTimestamp = utils.getTodayTimeStamp();
  let topics = hotTopics.concat(lastestTopics);

  /** 去重 */
  topics = Array.from(new Set(topics));
  /** 数据筛选: 创建时间是在"今天" */
  topics = topics.filter((t) => t.created * 1000 > todayTimestamp);
  /** 按回复数筛选 */
  topics = utils.filterTopicsByRepliesCount(topics);
  /** 按回复数排序 */
  topics = topics.sort((a, b) => b.replies - a.replies);

  return topics;
}

async function main() {
  const topics = await fetchData();

  const todayTimeStr = format(
    /** 8小时的毫秒数：因为 v2ex 在每日8点重置数据，所以需要向前减去8小时 */
    new Date(Date.now() - 8 * 3600 * 1000),
    "yyyy-MM-dd",
  );

  // 保存原始 JSON 数据
  const rawFilePath = join("raw", `${todayTimeStr}.json`);
  await Deno.writeTextFile(rawFilePath, JSON.stringify(topics));

  // 更新 README.md
  const readmeText = await utils.genNewReadmeText(topics);
  await Deno.writeTextFile("./README.md", readmeText);

  // 更新 ./archives/
  const archiveFilePath = join("archives", `${todayTimeStr}.md`);
  const archiveText = utils.genArchiveText(topics);
  await Deno.writeTextFile(archiveFilePath, archiveText);
}

await main();
