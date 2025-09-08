import {PressableOpacity} from './PressableOpacity';
import {Wrapper} from '../wrappers/Wrapper';
import {Label} from '../text/Label';
import Icon from 'react-native-fontawesome-pro';
import {StyleSheet} from 'react-native';
import {COLORS} from '@styles/colors';

type Props = {
  title?: string;
  onPress: () => void;
};
export const BackButton = ({title = "Back", onPress}: Props) => {
  return (
    <PressableOpacity onPress={onPress}>
      <Wrapper style={styles.backBtn}>
        <Icon name="chevron-left" color={COLORS.gray} type="light" size={15} />
        <Label style={styles.backBtnText}>{title}</Label>
      </Wrapper>
    </PressableOpacity>
  );
};

const styles = StyleSheet.create({
  backBtn: {
    flexDirection: 'row',
    opacity: 0.8,
    height: 40,
    alignItems: 'center',
    gap: 2
  },
  backBtnText: {
    color: COLORS.gray,
    fontSize: 18,
    paddingBottom: 1,
  },
});
