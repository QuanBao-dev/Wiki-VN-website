import { createStore } from "./createStore";
interface CachesStore {
  caches: any;
}

const cachesStore = createStore<CachesStore>({
  caches: {},
});

export default cachesStore;
