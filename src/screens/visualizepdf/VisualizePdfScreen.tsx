import {Label} from '@components/commons/text/Label';
import {Wrapper} from '@components/commons/wrappers/Wrapper';

export const VisualizePdfScreen = () => {
  return (
    <Wrapper style={{flexGrow: 1, backgroundColor: 'red'}}>
      <Label style={{backgroundColor: 'yellow', alignSelf: 'flex-start'}}>
        Hola
      </Label>
    </Wrapper>
  );
};
