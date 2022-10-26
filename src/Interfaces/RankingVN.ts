import { VisualNovel } from "./visualNovelList";
export interface RankingVNItem {
  vnId: number;
  votes: number;
  isTranslatable: boolean;
  dataVN: VisualNovel;
}
