import RNFS from 'react-native-fs';

const directoryPathOffline = `${RNFS.DocumentDirectoryPath}/uovo/offline/`;
const directoryPathOff2line = `${RNFS.DocumentDirectoryPath}/uovo/off2line/`;

export const getFromStorageOffline = async (key: string) => {
  try {
    const value = await RNFS.readFile(
      decodeURIComponent(`${directoryPathOffline}${key}.json`),
      'utf8',
    );
    return value;
  } catch (error) {
    return null;
  }
};

export const saveToStorageOffline = async (key: string, value: string) => {
  try {
    await RNFS.writeFile(
      decodeURIComponent(`${directoryPathOffline}${key}.json`),
      value,
      'utf8',
    );
  } catch (e) {
    try {
      await RNFS.mkdir(directoryPathOffline);
      await saveToStorageOffline(key, value);
    } catch (error) {
      console.log('error creating directory offline');
      console.log(error);
    }
  }
};

export const getAllStorageKeysOffline = async () => {
  try {
    const values = await RNFS.readDir(decodeURIComponent(directoryPathOffline));
    const tempList = values.map((item) => item.name.replace('.json', ''));
    return tempList;
  } catch (e) {
    return [];
  }
};

export const removeFromStorageOffline = async (key: string) => {
  try {
    await RNFS.unlink(decodeURIComponent(`${directoryPathOffline}${key}.json`));
  } catch (e) {}
};

export const removeMultiFromStorageOffline = async (keys = []) => {
  try {
    const promises = keys.map(async (item: string) => {
      await removeFromStorageOffline(item.replace('.json', ''));
    });
    await Promise.all(promises);
  } catch (e) {}
};

export const getFromStorageOff2line = async (key: string) => {
  try {
    const value = await RNFS.readFile(
      decodeURIComponent(`${directoryPathOff2line}${key}.json`),
      'utf8',
    );
    return value;
  } catch (error) {
    return null;
  }
};

export const saveToStorageOff2line = async (key: string, value: string) => {
  try {
    await RNFS.writeFile(
      decodeURIComponent(`${directoryPathOff2line}${key}.json`),
      value,
      'utf8',
    );
  } catch (e) {
    try {
      await RNFS.mkdir(directoryPathOff2line);
      await saveToStorageOff2line(key, value);
    } catch (error) {
      console.log('error creating directory offline 2');
      console.log(error);
    }
  }
};

export const getAllStorageKeysOff2line = async () => {
  try {
    const values = await RNFS.readDir(
      decodeURIComponent(directoryPathOff2line),
    );
    const tempList = values.map((item) => item.name.replace('.json', ''));
    return tempList;
  } catch (e) {
    return [];
  }
};

export const removeFromStorageOff2line = async (key: string) => {
  try {
    await RNFS.unlink(
      decodeURIComponent(`${directoryPathOff2line}${key}.json`),
    );
  } catch (e) {}
};

export const removeMultiFromStorageOff2line = async (keys = []) => {
  try {
    const promises = keys.map(async (item: string) => {
      await removeFromStorageOff2line(item.replace('.json', ''));
    });
    await Promise.all(promises);
  } catch (e) {}
};

export const getMultiFromStorageOffline = async (keys = []) => {
  try {
    const values = await RNFS.readDir(decodeURIComponent(directoryPathOffline));
    const promises = values
      .filter((item) => keys.some((x) => x == item.name.replace('.json', '')))
      .map(
        async (item) =>
          await getValueKeyFromStorageOffline(item.name.replace('.json', '')),
      );
    const results = await Promise.all(promises);
    return results;
  } catch (e) {
    return [];
  }
};

export const getMultiFromStorageOff2line = async (keys = []) => {
  try {
    const values = await RNFS.readDir(
      decodeURIComponent(directoryPathOff2line),
    );
    const promises = values
      .filter((item) => keys.some((x) => x == item.name.replace('.json', '')))
      .map(
        async (item) =>
          await getValueKeyFromStorageOff2line(item.name.replace('.json', '')),
      );
    const results = await Promise.all(promises);
    return results;
  } catch (e) {
    return [];
  }
};

const getValueKeyFromStorageOffline = async (key: string) => {
  try {
    const value = await RNFS.readFile(
      decodeURIComponent(`${directoryPathOffline}${key}.json`),
      'utf8',
    );
    return {0: key, 1: value};
  } catch (error) {
    return null;
  }
};

const getValueKeyFromStorageOff2line = async (key: string) => {
  try {
    const value = await RNFS.readFile(
      decodeURIComponent(`${directoryPathOff2line}${key}.json`),
      'utf8',
    );
    return {0: key, 1: value};
  } catch (error) {
    return null;
  }
};

export const getAllValuesFrom2Offline = async () => {
  try {
    const values = await RNFS.readDir(
      decodeURIComponent(directoryPathOff2line),
    );
    const promises = values.map(
      async (item) =>
        await getValueKeyFromStorageOff2line(item.name.replace('.json', '')),
    );
    const results = await Promise.all(promises);
    return results;
  } catch (e) {
    return [];
  }
};

export const existRequestOffline = async (requestsName = [], job: string) => {
  try {
    const requests = await getAllValuesFrom2Offline();
    const isSome = requests.some((item: any) => {
      const tempJson = JSON.parse(item[1]);
      if (!tempJson?.url) {
        return false;
      }
      return (
        requestsName.some((subitem) => tempJson.url.includes(subitem)) &&
        tempJson.job == job
      );
    });
    return isSome;
  } catch (error) {
    return false;
  }
};

export const existRequestInventoryOffline = async (
  requestsName = [],
  job: string,
  idInventory: string,
) => {
  try {
    const requests = await getAllValuesFrom2Offline();
    const isSome = requests.some((item: any) => {
      const tempJson = JSON.parse(item[1]);
      return (
        requestsName.some((subitem) => tempJson.url.includes(subitem)) &&
        tempJson.job == job &&
        tempJson.idInventory == idInventory
      );
    });
    return isSome;
  } catch (error) {
    return false;
  }
};

export const existRequestConditionPhotosOffline = async (
  requestsName = [],
  job: string,
  idInventory: string,
  conditionType: string,
  reportType: string,
) => {
  try {
    const requests = await getAllValuesFrom2Offline();
    const isSome = requests.some((item: any) => {
      const tempJson = JSON.parse(item[1]);
      return (
        requestsName.some((subitem) => tempJson.url.includes(subitem)) &&
        tempJson.job == job &&
        tempJson.idInventory == idInventory &&
        tempJson.conditionType == conditionType &&
        tempJson.reportType == reportType
      );
    });
    return isSome;
  } catch (error) {
    return false;
  }
};

export const existRequestConditionPhotosOfflineSubtype = async (
  requestsName = [],
  job: string,
  idInventory: string,
  conditionType: string,
  reportType: string,
  reportSubType: string,
) => {
  try {
    const requests = await getAllValuesFrom2Offline();
    const isSome = requests.some((item: any) => {
      const tempJson = JSON.parse(item[1]);
      return (
        requestsName.some((subitem) => tempJson.url.includes(subitem)) &&
        tempJson.job == job &&
        tempJson.idInventory == idInventory &&
        tempJson.conditionType == conditionType &&
        tempJson.reportType == reportType &&
        tempJson.reportSubType == reportSubType
      );
    });
    return isSome;
  } catch (error) {
    return false;
  }
};
