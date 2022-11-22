import { createStore } from "./createStore";

interface NotificationStore {
  userId: string;
  isHide: boolean;
  isFreeAds: boolean;
  email: string;
  username: string;
  endFreeAdsDate: string;
}

export const notificationStore = createStore<NotificationStore>({
  userId: "",
  isHide: true,
  email: "",
  username: "",
  endFreeAdsDate: "",
  isFreeAds: false,
});
