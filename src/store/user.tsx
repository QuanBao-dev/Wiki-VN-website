import { createStore } from "./createStore";
interface UserStore {
  createdAt: string;
  avatarImage: string;
  username: string;
  role: string;
  trigger: boolean;
  email: string;
  editMode: "username" | "email";
  isShowEditAccount: boolean;
  isDarkMode: boolean;
  exp: number;
  iat: number;
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
});
