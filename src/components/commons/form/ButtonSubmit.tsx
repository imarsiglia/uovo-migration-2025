import {COLORS} from '@styles/colors';
import {showToastMessage} from '@utils/toast';
import {useFormContext} from 'react-hook-form';
import {RoundedButton, RoundedButtonProps} from '../buttons/RoundedButton';
import {forwardRef, Ref} from 'react';
import {View} from 'react-native';

type Props = RoundedButtonProps & {
  onSubmit: (data: any) => void;
  onInvalid?: () => void;
};

export const ButtonSubmit = forwardRef(
  ({onSubmit, onInvalid, ...restProps}: Props, ref: Ref<View>) => {
    const {handleSubmit} = useFormContext();

    return (
      <RoundedButton
        ref={ref}
        {...restProps}
        onPress={handleSubmit(onSubmit, () =>
          onInvalid
            ? onInvalid()
            : showToastMessage('Please, complete required fields', undefined, {
                backgroundColor: COLORS.error,
                tapToDismissEnabled: true,
              }),
        )}
      />
    );
  },
);
