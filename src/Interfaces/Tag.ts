export interface Tag {
  aliases: string[];
  applicable: boolean;
  cat: string;
  description: string;
  id: number;
  meta: boolean;
  name: string;
  parents: number[];
  searchable: boolean;
  vns: number;
  rating:number;
  lang: string;
  type: string;
}
