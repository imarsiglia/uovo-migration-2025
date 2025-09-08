import { Label } from '@components/commons/text/Label';
import { Wrapper } from '@components/commons/wrappers/Wrapper';

export const ColumnHeader = ({ text, style }: { text: string, style?: any }) => (
    <Wrapper
      style={{
        backgroundColor: 'white',
        width: 71,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        borderRightWidth: 1,
        borderColor: '#DDDDDD',
        borderBottomWidth: 1,
        ...style
      }}
    >
      <Label style={{ fontSize: 12, color: '#696969' }}>{text}</Label>
    </Wrapper>
  );


export const Column = ({ text, style }: { text: string, style?: any }) => (
    <Wrapper
      style={{
        backgroundColor: 'white',
        width: 71,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderRightWidth: 1,
        borderColor: '#DDDDDD',
        borderBottomWidth: 1,
        ...style
      }}
    >
      <Label style={{ fontSize: 12, color: '#696969' }}>{text}</Label>
    </Wrapper>
  );