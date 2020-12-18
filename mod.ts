#!/usr/bin/env -S deno run --unstable --allow-net --allow-read --allow-write --import-map=import_map.json
import { format } from "std/datetime/mod.ts";
import { join } from "std/path/mod.ts";

import { HOT_TOPICS_DATA_URL, V2EX_TIME_DIFFER } from "./consts.ts";
import { Topic } from "./types.ts";
import { genArchiveText, genNewReadmeText } from "./utils.ts";

const response = await fetch(HOT_TOPICS_DATA_URL);

if (!response.ok) {
  console.error(response.statusText);
  Deno.exit(-1);
}

const topics: Topic[] = await response.json();

const todayTimeStr = format(
  new Date(Date.now() - V2EX_TIME_DIFFER),
  "yyyy-MM-dd",
);
const rawFilefullPath = join("raw", `${todayTimeStr}.json`);

// 保存原始数据
await Deno.writeTextFile(rawFilefullPath, JSON.stringify(topics));

// 更新 README.md
const readme = await genNewReadmeText(topics);
await Deno.writeTextFile("./README.md", readme);

// 更新 ./archives/
const archiveText = genArchiveText(topics, todayTimeStr);
const archivePath = join("archives", `${todayTimeStr}.md`);
await Deno.writeTextFile(archivePath, archiveText);
