export interface User{
  username:string,
  email:string,
  createdAt:string,
  isVerified:boolean,
  userId:string,
  isFreeAds: boolean,
  becomingSupporterAt:string,
  becomingMemberAt:string,
  cancelingMemberAt:string
  endFreeAdsDate:string,
  role:string,
  boost:number
}