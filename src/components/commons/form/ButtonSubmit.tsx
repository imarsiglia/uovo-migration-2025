import { COLORS } from '@styles/colors';
import { showToastMessage } from '@utils/toast';
import { useFormContext } from 'react-hook-form';
import { RoundedButton, RoundedButtonProps } from '../buttons/RoundedButton';

type Props = RoundedButtonProps & {
  onSubmit: (data: any) => void;
  onInvalid?: () => void;
};

export const ButtonSubmit = ({onSubmit, onInvalid, ...restProps}: Props) => {
  const {handleSubmit} = useFormContext();

  return (
    <RoundedButton
      {...restProps}
      onPress={handleSubmit(onSubmit, () =>
        onInvalid
          ? onInvalid()
          : showToastMessage('Please, complete required fields', undefined, {
              backgroundColor: COLORS.error,
              tapToDismissEnabled: true
            }),
      )}
    />
  );
};
