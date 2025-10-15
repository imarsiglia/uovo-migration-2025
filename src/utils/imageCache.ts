import RNFS from 'react-native-fs';
import {Platform} from 'react-native';

export async function base64ToFileCache(
  base64: string,
  filename: string,
): Promise<string> {
  const dir = `${RNFS.CachesDirectoryPath}/photos`;
  const path = `${dir}/${filename}`;
  try {
    const exists = await RNFS.exists(dir);
    if (!exists) await RNFS.mkdir(dir);
  } catch {}

  const exists = await RNFS.exists(path);
  if (!exists) await RNFS.writeFile(path, base64, 'base64');

  return Platform.OS === 'android' ? `file://${path}` : path;
}
