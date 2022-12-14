export interface ChatText {
  text: string;
  createdAt: string;
  user: {
    username: string;
    role: string;
    avatarImage: string;
    boost:number,
  };
}
