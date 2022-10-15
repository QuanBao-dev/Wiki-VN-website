export interface Patch{
  linkDownloads: LinkPatch[],
  vnId:number
}

interface LinkPatch{
  label:string,
  url:string
}