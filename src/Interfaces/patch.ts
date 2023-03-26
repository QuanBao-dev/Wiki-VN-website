export interface Patch{
  linkDownloads: LinkPatch[],
  vnId:number,
  affiliateLinks:LinkPatch[],
  isMemberOnly:boolean,
  publishDate: Date
}

interface LinkPatch{
  label:string,
  url:string
}