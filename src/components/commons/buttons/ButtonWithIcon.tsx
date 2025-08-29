import {Label} from '@components/commons/text/Label';
import {PressableOpacity} from './PressableOpacity';
import {COLORS} from '@styles/colors';

const ButtonWithIcon = ({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactElement;
  onClick?: () => void;
}) => {
  return (
    <PressableOpacity
      onPress={onClick}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingLeft: 13,
        paddingRight: 13,
        borderRadius: 20,
        paddingTop: 5,
        paddingBottom: 5,
      }}>
      <Label
        style={{
          color: 'white',
          fontSize: 13,
          marginRight: 5,
          fontWeight: '400',
          maxWidth: 150,
        }}>
        {label}
      </Label>

      {icon && icon}
    </PressableOpacity>
  );
};

export default ButtonWithIcon;
