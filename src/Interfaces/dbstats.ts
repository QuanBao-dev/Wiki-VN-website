export interface Dbstats {
  vn: number;
  traits: number;
  users: number;
  threads: number;
  tags: number;
  releases: number;
  producers: number;
  chars: number;
  posts: number;
}

export interface SugoiVNDBStats {
  usersLength: number;
  mtledVNLength2:number;
  mtledExclusiveVNLength:number;
  mtledVNLength: number;
  releasesLength: number;
}
