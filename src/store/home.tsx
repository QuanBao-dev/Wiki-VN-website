import { SugoiVNDBStats } from "../Interfaces/dbstats";
import { createStore } from "./createStore";
interface HomeStore {
  lastPage: number;
  page: number;
  patchesPage: number;
  indexActive: number;
  indexPollModeActive: number;
  maxVotes: number;
  maxVotesPersonalVN: number;
  isLoadingPersonalVN: boolean;
  isStopFetching: boolean;
  isStopFetchingPersonalVN: boolean;
  isStopFetchingVNLow: boolean;
  votesPage: number;
  votesPageLowRank: number;
  votesPagePersonalVN: number;
  isLoading: boolean;
  trigger: boolean;
  stats: SugoiVNDBStats;
  currentScrollTop: number;
  textSearch: string;
}

export const homeStore = createStore<HomeStore>({
  lastPage: 0,
  page: 0,
  indexActive: 0,
  indexPollModeActive: 0,
  votesPageLowRank: 0,
  patchesPage: 0,
  stats: {
    usersLength: 0,
    mtledVNLength: 0,
    mtledVNLength2: 0,
    releasesLength: 0,
  },
  maxVotes: 0,
  maxVotesPersonalVN: 0,
  votesPagePersonalVN: 0,
  isStopFetching: false,
  isStopFetchingPersonalVN: false,
  isStopFetchingVNLow: false,
  votesPage: 0,
  isLoading: true,
  isLoadingPersonalVN: true,
  trigger: false,
  currentScrollTop: 0,
  textSearch: "",
});
