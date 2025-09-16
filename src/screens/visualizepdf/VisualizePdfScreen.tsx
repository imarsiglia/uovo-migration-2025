import {Label} from '@components/commons/text/Label';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {COLORS} from '@styles/colors';

export const VisualizePdfScreen = () => {
  return (
    <Wrapper style={{flex: 1, backgroundColor: COLORS.bgWhite}}>
      <Label
        style={{backgroundColor: 'yellow', alignSelf: 'flex-start'}}></Label>
    </Wrapper>
  );
};
