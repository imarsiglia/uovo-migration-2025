import RNFS from 'react-native-fs';

export function getTemporaryDirectoryPath() {
  return RNFS.TemporaryDirectoryPath;
}

type WriteFileProps = {
  filepath: string;
  contents: string;
  encodingOrOptions?: any;
};

export async function writeToFileSystem({
  filepath,
  contents,
  encodingOrOptions,
}: WriteFileProps) {
  return RNFS.writeFile(filepath, contents, encodingOrOptions);
}

type WriteFileTemporaryDirProps = {
  contents: string;
  encodingOrOptions?: any;
  extension?: 'jpg' | 'png';
  position?: number;
};

export async function writeToFileSystemWithTemporaryDirectory({
  contents,
  encodingOrOptions = 'base64',
  extension = 'jpg',
  position,
}: WriteFileTemporaryDirProps) {
  const temporaryPath =
    `${getTemporaryDirectoryPath()}${new Date().toISOString()}.${extension}`.replace(
      /:/g,
      '-',
    );
  await RNFS.write(temporaryPath, contents, position, encodingOrOptions);
  return temporaryPath;
}

export function deleteFileSystem(path: string) {
  return RNFS.unlink(path);
}
