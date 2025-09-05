import {CrewMemberType} from '@api/types/Jobs';
import SearchInput from '@components/commons/inputs/SearchInput';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import CrewMember from '@components/topheet/CrewMember';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {RoutesNavigation} from '@navigation/types';
import {useAuth} from '@store/auth';
import useTopSheetStore from '@store/topsheet';
import {showToastMessage} from '@utils/toast';
import React, {useCallback, useMemo, useState} from 'react';
import {Keyboard, ScrollView, StyleSheet} from 'react-native';

export const TeamTopsheet = () => {
  const jobDetail = useTopSheetStore((d) => d.jobDetail);
  const userSession = useAuth((d) => d.user);
  const {navigate} = useCustomNavigation();

  const [filter, setFilter] = useState('');

  const initRemoveUser = useCallback((item: CrewMemberType) => {}, []);

  const doCall = useCallback((phone?: string) => {
    if (phone) {
      // pendiente
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
          {/* <Input
            inputStyle={mstyles.sizeSearch}
            inputContainerStyle={mstyles.inputSearch}
            value={filterTeam}
            onChangeText={(text) => setFilterTeam(text)}
            rightIcon={
              <TouchableOpacity
                style={mstyles.containerInputSearchIcon}
                onPress={() => filterMembers()}>
                <Icon name="search" size={16} color="#959595" />
              </TouchableOpacity>
            }></Input> */}
        </Wrapper>

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
      </Wrapper>
      {/* {props.jobDetail && (
        <Modal isVisible={showRemoveUser}>
          <Wrapper style={styles.modalClockOut}>
            <Wrapper style={styles.bodyModalClockOut}>
              <Text style={styles.titleModalClockOut}>REMOVE USER?</Text>
              <Text style={styles.subtitleModalClockOut}>
                Name: {selectedUser}
              </Text>
              <Text style={styles.descModalClockOut}>
                Are you sure you want to remove this user?
              </Text>
              <Text style={styles.descModalClockOut}>
                Once finished you will not be able to make changes.
              </Text>
            </Wrapper>

            <Wrapper style={[styles.containerOptionsModalClockOut]}>
              <TouchableHighlight
                onPress={() => setShowRemoveUser(false)}
                underlayColor="#08141F21"
                style={[styles.btnOptionModalClockOut]}>
                <Text style={styles.optionModalClockOut}>Cancel</Text>
              </TouchableHighlight>
              <TouchableHighlight
                onPress={() => removeUser()}
                underlayColor="#08141F21"
                style={[styles.btnOptionModalClockOut, styles.borderFull]}>
                <Text style={[styles.optionModalClockOut, mstyles.bold]}>
                  Ok
                </Text>
              </TouchableHighlight>
            </Wrapper>
          </Wrapper>
        </Modal>
      )} */}
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
