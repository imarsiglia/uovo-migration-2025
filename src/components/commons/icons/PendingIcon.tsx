import {Icons} from '@assets/icons/icons';
import {COLORS} from '@styles/colors';

export const PendingIcon = () => {
  return (
    <Icons.HourglassClock
      style={{marginLeft: 5}}
      color={COLORS.error}
      width={15}
      height={15}
    />
  );
};
