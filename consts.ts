/**
 * Use for set some of const varible.
 */

export const HOT_TOPICS_DATA_URL: string =
  "https://www.v2ex.com/api/topics/hot.json";

/** NOTE: 因为 v2ex 在每日8点重置数据，所以需要向前减去8小时 */
export const V2EX_TIME_DIFFER: number = 8 * 60 * 60 * 1000;
