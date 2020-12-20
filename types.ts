/**
 * Define the result data structure.
 */

/** 话题 */
export type Topic = {
  id: number;
  /** 标题 */
  title: string;
  /** 原链接 */
  url: string;
  /** 用户回复数 */
  replies: number;
  /** 所属节点 */
  node: Node;
  /** 创建时间戳 */
  created: number;

  // NOTE: 暂时还用不到
  /** 内容相关 */
  content?: string;
  content_rendered?: string;
};

/** 节点 */
export type Node = {
  id: number;
  /** 节点名，形如 music */
  name: string;
  /** 节点标题，形如 音乐 */
  title: string;
  /** 节点地址 */
  url: string;
  /** 节点小头像 */
  avatar_mini: string;
};
