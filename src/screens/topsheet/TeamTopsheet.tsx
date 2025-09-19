import {QUERY_KEYS} from '@api/contants/constants';
import {useRemoveMemberTeam} from '@api/hooks/HooksJobServices';
import {CrewMemberType} from '@api/types/Jobs';
import SearchInput from '@components/commons/inputs/SearchInput';
import {SwipeableListProvider} from '@components/commons/swipeable/SwipeableRow';
import {Label} from '@components/commons/text/Label';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import CrewMember from '@components/topheet/CrewMember';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {useRefreshIndicator} from '@hooks/useRefreshIndicator';
import {RoutesNavigation} from '@navigation/types';
import {loadingWrapperPromise} from '@store/actions';
import {useAuth} from '@store/auth';
import {openCallSheet} from '@store/callSheetStore';
import {useModalDialogStore} from '@store/modals';
import useTopSheetStore from '@store/topsheet';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import openCallOptions from '@utils/openCallOptions';
import {showErrorToastMessage, showToastMessage} from '@utils/toast';
import {useCallback, useMemo, useState} from 'react';
import {Keyboard, ScrollView, StyleSheet} from 'react-native';

export const TeamTopsheet = () => {
  const jobDetail = useTopSheetStore((d) => d.jobDetail);
  const isJobQueue = useTopSheetStore((d) => d.isJobQueue);
  const userSession = useAuth((d) => d.user);
  const {navigate} = useCustomNavigation();
  const showDialog = useModalDialogStore((d) => d.showVisible);
  const {mutateAsync: removeMemberTeam} = useRemoveMemberTeam();
  const {refetchAll} = useRefreshIndicator([
    [QUERY_KEYS.TOPSHEET, {id: jobDetail?.id?.toString(), queue: isJobQueue}],
  ]);

  const [filter, setFilter] = useState('');

  const initRemoveUser = useCallback(
    (item: CrewMemberType) => {
      Keyboard.dismiss();
      showDialog({
        modalVisible: true,
        type: 'warning',
        cancelable: true,
        message: (
          <Wrapper
            style={[GLOBAL_STYLES.bodyModalClockOut, {paddingHorizontal: 0}]}>
            <Label style={GLOBAL_STYLES.titleModalClockOut}>REMOVE USER?</Label>
            <Label style={GLOBAL_STYLES.subtitleModalClockOut}>
              Name: {item.name} {item.lastname}
            </Label>
            <Label style={GLOBAL_STYLES.descModalClockOut}>
              Are you sure you want to remove this user?
            </Label>
            <Label style={GLOBAL_STYLES.descModalClockOut}>
              Once finished you will not be able to make changes.
            </Label>
          </Wrapper>
        ),
        onConfirm: () => {
          showDialog({
            modalVisible: false,
          });
          loadingWrapperPromise(
            removeMemberTeam({
              idJob: jobDetail?.id!,
              idUser: item.id_user,
              jobQueue: isJobQueue!,
            })
              .then((d) => {
                if (d) {
                  showToastMessage('User removed successfully');
                  refetchAll();
                } else {
                  showErrorToastMessage('Error while removing user');
                }
              })
              .catch(() => {
                showErrorToastMessage('Error while removing user');
              }),
          );
        },
      });
    },
    [showDialog, jobDetail?.id, isJobQueue, removeMemberTeam, refetchAll],
  );

  const doCall = useCallback((phone?: string) => {
    if (phone) {
      openCallSheet(phone);
    } else {
      showToastMessage('Undefined phone');
    }
  }, []);

  const filteredCrew = useMemo(() => {
    return jobDetail?.crew?.filter(
      (x) =>
        x.name.toUpperCase().includes(filter.trim().toUpperCase()) ||
        x.lastname.toUpperCase().includes(filter.trim().toUpperCase()) ||
        (x.name.toUpperCase() + ' ' + x.lastname.toUpperCase()).includes(
          filter.trim().toUpperCase(),
        ) ||
        (x.lastname.toUpperCase() + ' ' + x.name.toUpperCase()).includes(
          filter.trim().toUpperCase(),
        ),
    );
  }, [jobDetail?.crew, filter]);

  return (
    <>
      <Wrapper
        style={[
          styles.containerTabScreen,
          {
            paddingTop: 15,
            flex: 1,
          },
        ]}>
        <Wrapper
          style={{
            paddingLeft: 10,
            paddingRight: 10,
            paddingBottom: 0,
            height: 45,
          }}>
          <SearchInput
            value={filter}
            onChange={(d) => setFilter(d as string)}
          />
        </Wrapper>

        <SwipeableListProvider>
          <ScrollView
            bounces={false}
            style={{
              flex: 1,
              paddingLeft: 20,
              paddingRight: 20,
              paddingTop: 10,
              marginBottom: 65,
              height: '100%',
            }}>
            {filteredCrew?.map((item, index) => {
              return (
                <Wrapper key={index}>
                  <CrewMember
                    item={item}
                    currentUser={userSession?.user_id}
                    onPressProfile={() =>
                      navigate(RoutesNavigation.DigitalId, {
                        member: true,
                        person: item,
                      })
                    }
                    onPressCall={() => doCall(item.phone)}
                    onRemoveUser={() => initRemoveUser(item)}
                  />
                </Wrapper>
              );
            })}
          </ScrollView>
        </SwipeableListProvider>
      </Wrapper>
    </>
  );
};

const styles = StyleSheet.create({
  containerTabScreen: {
    height: '100%',
    width: '100%',
    backgroundColor: '#fbfbfb',
  },
});
