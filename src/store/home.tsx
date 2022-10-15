import { createStore } from "./createStore";
interface HomeStore {
  lastPage: number;
  page: number;
  patchesPage:number,
  indexActive: number;
}

export const homeStore = createStore<HomeStore>({
  lastPage: 0,
  page: 0,
  indexActive:0,
  patchesPage:0
});

