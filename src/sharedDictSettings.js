export const SHARED_DICT_SET_IDS_STORAGE_KEY = "sharedDictPhraseSetIds";

export function getStoredSharedDictSetIds() {
  const rawValue = window.localStorage.getItem(
    SHARED_DICT_SET_IDS_STORAGE_KEY
  );

  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue);

    if (!Array.isArray(parsedValue)) {
      return null;
    }

    return parsedValue.filter((id) => id !== null && id !== undefined);
  } catch {
    return null;
  }
}

export function storeSharedDictSetIds(setIds) {
  window.localStorage.setItem(
    SHARED_DICT_SET_IDS_STORAGE_KEY,
    JSON.stringify(setIds)
  );
}
