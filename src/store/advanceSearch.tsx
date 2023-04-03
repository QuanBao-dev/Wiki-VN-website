import { createStore } from "./createStore";

export const advanceSearchStore = createStore({
  isLoading: true,
  search: "null",
  maxPage: 1,
});
