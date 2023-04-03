export interface TagDetail {
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
}
export interface Tag {
  name: string;
  id:number
}

