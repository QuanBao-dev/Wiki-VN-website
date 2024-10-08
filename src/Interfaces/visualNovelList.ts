import { Tag } from "./Tag";

export interface VisualNovel {
  aliases: string[];
  description: string;
  reason?: string;
  id: number;
  image: string;
  image_flagging: ImageFlagging;
  languages: string[];
  length: number | null;
  image_nsfw: boolean;
  anime: AnimeItem[] | [];
  title: string;
  popularity: number;
  sexual: number;
  violence: number;
  rating: number;
  votecount: number;
  screens: Screen[] | [];
  staff: Staff[] | [];
  relations: Relation[] | [];
  original: string;
  released: string;
  isPatchContained?: boolean;
  votes?: number;
  isTranslatable?: boolean;
  tags: Tag[];
}

interface ImageFlagging {
  votecount: number;
  sexual_avg: number;
  violence_avg: number;
}

interface AnimeItem {
  id: number;
  ann_id: number;
  nfo_id: string;
  title_romaji: string;
  title_kanji: string;
  year: number;
  type: string;
}

export interface Screen {
  image: string;
  rid: number;
  nsfw: boolean;
  flagging: ImageFlagging;
  height: number;
  width: number;
  sexual: number;
  violence: number;
}

interface Staff {
  sid: number;
  aid: number;
  name: string;
  original: string;
  role: string;
  note: string;
}

interface Relation {
  id: number;
  relation: string;
  title: string;
  original: string;
  official: boolean;
}
