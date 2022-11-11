import { createStore } from "./createStore";
interface HomeStore {
  lastPage: number;
  page: number;
  patchesPage: number;
  indexActive: number;
  maxVotes: number;
  isStopFetching: boolean;
  votesPage: number;
  isLoading:boolean;
  trigger:boolean;
}

export const homeStore = createStore<HomeStore>({
  lastPage: 0,
  page: 0,
  indexActive: 0,
  patchesPage: 0,
  maxVotes: 0,
  isStopFetching: false,
  votesPage: 0,
  isLoading:true,
  trigger:false
});
