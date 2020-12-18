#!/usr/bin/env -S deno run --unstable --allow-net --allow-read --allow-write --import-map=import_map.json
import { format } from "std/datetime/mod.ts";
import { join } from "std/path/mod.ts";

import { HOT_TOPICS_DATA_URL } from "./consts.ts";
import { Topic } from "./types.ts";
import { genArchiveText, genNewReadmeText } from "./utils.ts";

const response = await fetch(HOT_TOPICS_DATA_URL);

if (!response.ok) {
  console.error(response.statusText);
  Deno.exit(-1);
}

const topics: Topic[] = await response.json();

const yyyyMMdd = format(new Date(), "yyyy-MM-dd");
const rawFilefullPath = join("raw", `${yyyyMMdd}.json`);

// 保存原始数据
await Deno.writeTextFile(rawFilefullPath, JSON.stringify(topics));

// 更新 README.md
const readme = await genNewReadmeText(topics);
await Deno.writeTextFile("./README.md", readme);

// 更新 ./archives/
const archiveText = genArchiveText(topics, yyyyMMdd);
const archivePath = join("archives", `${yyyyMMdd}.md`);
await Deno.writeTextFile(archivePath, archiveText);
