import cachesStore from "../store/caches";

export function updateCaches<T>(data: T[], type: string) {
  let { caches } = cachesStore.currentState();

  if (type !== "VNs") {
    if ((data as any).id)
      caches = {
        ...caches,
        [type]: {
          ...caches[type],
          [(data as any).id]: data,
        },
      };
    else
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
