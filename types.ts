/**
 * 
 */

export type Topic = {
  // NOTE: 目前需要的数据项
  id: number;
  title: string;
  url: string;
  replies: number;

  // NOTE: 源数据提供，但不太需要
  content?: string;
  content_rendered?: string;
};
