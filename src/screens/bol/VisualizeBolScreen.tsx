import {useGetBolPdf} from '@api/hooks/HooksJobServices';
import {BackButton} from '@components/commons/buttons/BackButton';
import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
import {GeneralLoading} from '@components/commons/loading/GeneralLoading';
import {Label} from '@components/commons/text/Label';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import useTopSheetStore from '@store/topsheet';
import {COLORS} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import sharePdf from '@utils/sharePdf';
import {showErrorToastMessage} from '@utils/toast';
import {useCallback, useMemo, useState} from 'react';
import {Dimensions, Platform, StyleSheet} from 'react-native';
import Icon from 'react-native-fontawesome-pro';
import Pdf from 'react-native-pdf';

export const VisualizeBolScreen = () => {
  const {goBack} = useCustomNavigation();
  const [filePath, setFilePath] = useState<string | null>(null);

  const {
    id: idJob,
    wo_title,
    client_name,
  } = useTopSheetStore((d) => d.jobDetail!);
  const {data: bolBase64, isLoading} = useGetBolPdf({
    idJob,
  });

  const source = useMemo(() => {
    if (bolBase64) {
      return `data:application/pdf;base64,${bolBase64}`;
    } else {
      return null;
    }
  }, [bolBase64]);

  const filename = useMemo(() => {
    return `BOL_${wo_title}_${client_name}_${idJob}.pdf`.replaceAll(' ', '');
  }, [wo_title, client_name]);

  const handleShare = useCallback(() => {
    if (filePath && filename) {
      sharePdf(filePath, filename);
    }
  }, [filename, filePath]);

  return (
    <Wrapper style={[styles.container]}>
      <Wrapper style={GLOBAL_STYLES.bgwhite}>
        <Wrapper style={GLOBAL_STYLES.containerBtnOptTop}>
          <BackButton title="Back" onPress={goBack} />

          {filePath && (
            <PressableOpacity onPress={handleShare} style={styles.shareButton}>
              <Icon name="share-alt" color="white" type="solid" size={14} />
            </PressableOpacity>
          )}
        </Wrapper>
      </Wrapper>

      {isLoading && <GeneralLoading />}

      {!isLoading && source && (
        <Pdf
          source={{
            uri: source,
          }}
          onLoadComplete={(numberOfPages, filePath) => {
            setFilePath(filePath);
          }}
          onError={(error) => {
            console.log(error);
          }}
          onPressLink={(uri) => {
            //console.log(`Link presse: ${uri}`)
          }}
          style={styles.pdf}
          trustAllCerts
        />
      )}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfbfb',
  },
  pdf: {
    flex: 1,
  },
  shareButton: {
    padding: 7,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
});
