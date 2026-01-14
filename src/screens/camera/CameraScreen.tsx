import { Wrapper } from '@components/commons/wrappers/Wrapper';
import { RootStackParamList } from '@navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS } from '@styles/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'CameraScreen'>;
export const CameraScreen = (props: Props) => {
//   const {goBack} = useCustomNavigation();
//   const shouldOpenCamera = useCameraTrigger((d) => d.shouldOpen);
//   const clearCamera = useCameraTrigger((d) => d.clear);
//   const params = props.route.params;
//   useEffect(() => {
//     if (shouldOpenCamera) {
//       console.log('shouldOpenCamera');
//       console.log(shouldOpenCamera);
//       clearCamera();
//       onLaunchCamera(
//         () => {
//           if (params?.onClose) {
//             params.onClose();
//           }
//         },
//         (photo: any) => {
//           goBack();
//           if (params?.manageImage) {
//             params.manageImage(photo);
//           }
//         },
//       );
//     }
//   }, []);

  return (
    <Wrapper
      style={{
        backgroundColor: COLORS.black,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {/* <LoadingSpinner color={COLORS.white} /> */}
    </Wrapper>
  );
};
