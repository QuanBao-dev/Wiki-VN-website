export interface Patch{
  linkDownloads: LinkPatch[],
  vnId:number,
  affiliateLinks:LinkPatch[],
}

interface LinkPatch{
  label:string,
  url:string
}