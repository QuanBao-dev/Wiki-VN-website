import { createStore } from "./createStore";

export const chatStore = createStore({
  isStopFetching: false,
  isLoading: true,
  page: 1,
  ratio: 1,
  scrollTop: 1000000,
});
