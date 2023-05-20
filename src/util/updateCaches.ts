import cachesStore from "../store/caches";

export function updateCaches<T>(data: T[], type: string) {
  let { caches } = cachesStore.currentState();
  if (typeof data === "number") {
    caches = {
      ...caches,
      [type]: {
        ...caches[type],
        maxPage: data,
      },
    };
  }
  if (type !== "VNs") {
    if ((data as any).id)
      caches = {
        ...caches,
        [type]: {
          ...caches[type],
          [(data as any).id]: data,
        },
      };
    else if (typeof data !== "number")
      caches = {
        ...caches,
        [type]: data,
      };
    cachesStore.updateState({
      caches,
    });
    return;
  }
  if (data.reduce) {
    caches = {
      ...caches,
      VNs: {
        ...caches["VNs"],
        ...data.reduce<any>((ans, curr) => {
          ans[(curr as any).id] = curr;
          return ans;
        }, {}),
      },
    };
  } else {
    caches = {
      ...caches,
      VNs: {
        ...caches["VNs"],
        [(data as any).id]: data,
      },
    };
  }
  cachesStore.updateState({
    caches,
  });
}

export function deleteCachesField(keyDelete: string) {
  let { caches } = cachesStore.currentState();
  Object.keys(caches).forEach((key) => {
    if (key.includes(keyDelete)) delete caches[key];
  });
  cachesStore.updateState({
    caches,
  });
}
