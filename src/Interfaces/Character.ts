export interface Character {
  original: string;
  more?: boolean;
  name: string;
  id: string;
  image: {
    url: string;
    sexual: number
  };
  sex: string[];
  aliases: string[];
  description: string;
  height: number;
  weight: number;
  bust: number;
  waist: number;
  hips: number;
  cup: string;
  age: number;
  birthday: number[];
  vns: {
    id: string;
    role: string;
    spoiler: number;
    title: string;
  }[];
  traits: {
    id: string;
    name: string;
    searchable: boolean;
  }[];
}
