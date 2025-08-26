import {Icons} from '@assets/icons/icons';
import {COLORS} from '@styles/colors';
import {StyleSheet, Text, View} from 'react-native';

type BolCountVisualizeType = {
  signatureBolCount: number;
  bolSended: boolean;
};

export const BolCountVisualize = ({
  signatureBolCount,
  bolSended,
}: BolCountVisualizeType) => {
  return (
    <>
      {signatureBolCount >= 0 && !bolSended && (
        <View style={styles.container}>
          <Text style={styles.buttonText} allowFontScaling={false}>
            Signatures
          </Text>
          <View style={styles.containerNumber}>
            <Text style={styles.numberText} allowFontScaling={false}>
              {signatureBolCount}
            </Text>
          </View>
        </View>
      )}

      {signatureBolCount >= 0 && bolSended && (
        <View style={styles.container}>
          <Text
            style={[styles.buttonText, {color: COLORS.primary}]}
            allowFontScaling={false}>
            BOL Sent
          </Text>
          <Icons.SignatureCountIcon
            color={COLORS.primary}
            width={18}
            height={15}
          />
          <Text
            style={[styles.numberText, {color: COLORS.primary}]}
            allowFontScaling={false}>
            {signatureBolCount}
          </Text>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    gap: 4,
    backgroundColor: '#DEDEDE',
    borderRadius: 100,
    alignItems: 'center',
    paddingHorizontal: 10,
    height: '100%',
  },
  buttonText: {
    fontSize: 11,
    fontWeight: '500',
  },
  containerNumber: {
    backgroundColor: 'white',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
    minWidth: 20,
    minHeight: 20,
  },
  numberText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
