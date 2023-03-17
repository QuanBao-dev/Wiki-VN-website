export interface Patch{
  linkDownloads: LinkPatch[],
  vnId:number,
  affiliateLinks:LinkPatch[],
  isMemberOnly:boolean
}

interface LinkPatch{
  label:string,
  url:string
}