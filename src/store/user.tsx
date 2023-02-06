import { createStore } from "./createStore";
interface UserStore {
  createdAt: string;
  avatarImage: string;
  username: string;
  role: string;
  trigger: boolean;
  email: string;
  editMode: "username" | "email" | "discord username";
  isShowEditAccount: boolean;
  isDarkMode: boolean;
  exp: number;
  iat: number;
  boost: number;
  discordUsername: string;
  isCoolDown: boolean;
}

export const userStore = createStore<UserStore>({
  createdAt: "",
  avatarImage: "/avatar.webp",
  username: "",
  role: "",
  trigger: true,
  email: "",
  editMode: "username",
  isShowEditAccount: false,
  isDarkMode: false,
  exp: 0,
  iat: 0,
  boost: 1,
  discordUsername: "No username",
  isCoolDown: true,
});
