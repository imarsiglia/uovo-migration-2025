import {ScrollView, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-fontawesome-pro';
import DropdownMenu from '@components/commons/menu/DropdownMenu';
import {getFormattedDate} from '@utils/functions';
import {StatusJob} from './StatusJob';
import {Icons} from '@assets/icons/icons';
import {SelectableText} from '@components/commons/text/SelectableText';
import {BolCountVisualize} from '@components/jobs/bol/BolCountVisualize';
import ButtonWithIcon from '@components/commons/buttons/ButtonWithIcon';
import {LOAD_STATUS_NS, NSJobType} from '../../api/types/Jobs';
import CustomDropdown from '@components/commons/menu/CustomDropdown';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {COLORS} from '@styles/colors';
import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
import {Label} from '@components/commons/text/Label';

type props = {
  item: NSJobType;
  goToTopsheet: () => void;
  onInitSignature: () => void;
  onInitEditPieceCount: () => void;
  onInitSendBOL: () => void;
};

const CardNationalShuttle = ({
  item,
  goToTopsheet,
  onInitSignature,
  onInitEditPieceCount,
  onInitSendBOL,
}: props) => {
  return (
    <View
      style={{
        backgroundColor: 'white',
        padding: 10,
        width: '100%',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.18,
        shadowRadius: 6,
        marginTop: 0,
        marginBottom: 0,
        elevation: 2,
        gap: 10,
      }}>
      <View style={{display: 'flex', flexDirection: 'row'}}>
        <View style={{display: 'flex', flexDirection: 'row', flex: 1, gap: 5}}>
          <View style={{display: 'flex', flexDirection: 'column'}}>
            <Text
              style={{
                color: '#393939',
                fontWeight: 'bold',
                fontSize: 14,
              }}>
              {item?.wo} • {item.client_name?.replace(/^[\d\s]+/, '')}
            </Text>
            <Text
              style={{
                fontSize: 14,
                marginTop: 0,
                fontWeight: '300',
                color: '#393939',
              }}>
              {getFormattedDate(item?.start_date, 'dddd MMM[.] DD')}
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {item.load_status === LOAD_STATUS_NS.UNLOADED && (
            <UnloadedComponent />
          )}
          {item.load_status === LOAD_STATUS_NS.INPROGRESS && (
            <InProgressComponent />
          )}
          {item.load_status === LOAD_STATUS_NS.LOADED && <LoadedComponent />}
        </View>
      </View>
      <StatusJob status={item?.wo_status} />

      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          flex: 1,
          marginBottom: 10,
        }}>
        <View
          style={{display: 'flex', flex: 0.5, flexDirection: 'column', gap: 3}}>
          <Text
            style={{color: '#707070', fontSize: 14, fontWeight: '400'}}
            numberOfLines={2}>
            {item?.wo_title}
          </Text>
        </View>
        <View
          style={{
            display: 'flex',
            flex: 0.5,
            flexDirection: 'column',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}>
          <Text style={{fontSize: 13}}>{item?.job_type_desc}</Text>
        </View>
      </View>

      {item.instructions?.trim() && (
        <ScrollView
          style={[
            {
              backgroundColor: '#F3F3F3',
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 8,
              flexGrow: 1,
              paddingLeft: 20,
              maxHeight: 85,
            },
          ]}
          nestedScrollEnabled={true}>
          <Text style={{fontSize: 14, marginBottom: 5, fontWeight: '500'}}>
            Dispatcher notes:
          </Text>
          <SelectableText
            style={{fontSize: 13, color: '#707070', paddingBottom: 20}}>
            {item.instructions || 'N/A'}
          </SelectableText>
        </ScrollView>
      )}

      <View
        style={{
          marginTop: 5,
          display: 'flex',
          flexDirection: 'row',
          flex: 1,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
            gap: 10,
          }}>
          <ButtonWithIcon
            onClick={goToTopsheet}
            label="Top sheet"
            icon={<Icon name="eye" type="solid" size={18} color="white" />}
          />

          <CustomDropdown
            button={
              <Wrapper style={[styles.buttonBOL]}>
                <Text style={[styles.buttonText]}>BOL</Text>
                <Icons.DocumentIcon />
              </Wrapper>
            }>
            {({close}) => (
              <Wrapper style={styles.menu}>
                <PressableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    close();
                    setTimeout(() => {
                      onInitEditPieceCount();
                    }, 600);
                  }}>
                  <Label style={styles.menuTitle}>Edit Piece Count</Label>
                </PressableOpacity>
                <PressableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    close();
                    onInitSignature();
                  }}>
                  <Label style={styles.menuTitle}>Signature</Label>
                </PressableOpacity>
                <PressableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    close();
                    setTimeout(() => {
                      onInitSendBOL();
                    }, 600);
                  }}>
                  <Label style={styles.menuTitle}>Send BOL</Label>
                </PressableOpacity>
              </Wrapper>
            )}
          </CustomDropdown>
        </View>
        <BolCountVisualize
          bolSended={item.bol_sended}
          signatureBolCount={item.signature_bol_count}
        />
      </View>
    </View>
  );
};

export default CardNationalShuttle;

const UnloadedComponent = () => (
  <>
    <Icons.UnloadedTruckIcon />
    <Text style={styles.textStatusIcon}>Unloaded</Text>
  </>
);

const InProgressComponent = () => (
  <>
    <Icons.InProgressTruckIcon />
    <Text style={styles.textStatusIcon}>In progress</Text>
  </>
);

const LoadedComponent = () => (
  <>
    <Icons.LoadedTruckIcon />
    <Text style={styles.textStatusIcon}>Loaded</Text>
  </>
);

const styles = StyleSheet.create({
  textStatusIcon: {
    fontSize: 8,
    fontWeight: '400',
    color: '#393939',
  },
  buttonBOL: {
    padding: 6,
    paddingHorizontal: 15,
    backgroundColor: COLORS.primary,
    borderRadius: 100,
    flexDirection: 'row',
    gap: 5,
  },
  menu: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 0,
    marginTop: -10,
  },
  menuItem: {
    paddingVertical: 10,
  },
  menuTitle: {
    textAlign: 'center',
    fontSize: 15,
  },
  buttonText: {
    color: 'white',
  },
});
