import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
import {Label} from '@components/commons/text/Label';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import {RoutesNavigation} from '@navigation/types';
import useTopSheetStore from '@store/topsheet';
import {COLORS} from '@styles/colors';
import React, {useCallback} from 'react';
import {StyleSheet} from 'react-native';
import Icon from 'react-native-fontawesome-pro';

export const ReportLocationProblem = () => {
  const {navigate} = useCustomNavigation();
  const jobDetail = useTopSheetStore((d) => d.jobDetail);

  const goToReportIssue = useCallback((type: number) => {
    navigate(RoutesNavigation.ReportIssue, {
      type: type.toString(),
      idJob: jobDetail?.id!,
    });
  }, []);

  return (
    <>
      <Wrapper style={[styles.containerOptionReportProblem]}>
        <PressableOpacity
          onPress={() => goToReportIssue(1)}
          style={styles.btnOptionReportProblem}>
          <Icon name="car-crash" color="white" type="solid" size={16} />
          <Label
            allowFontScaling={false}
            style={[styles.btnOptionLocationText, {fontSize: 13}]}>
            Road problem
          </Label>
        </PressableOpacity>

        <PressableOpacity
          onPress={() => goToReportIssue(2)}
          style={styles.btnOptionReportProblem}>
          <Icon
            name="map-marker-alt-slash"
            color="white"
            type="solid"
            size={16}
          />
          <Label
            allowFontScaling={false}
            style={[styles.btnOptionLocationText, {fontSize: 13}]}>
            Wrong address
          </Label>
        </PressableOpacity>
      </Wrapper>

      <Wrapper style={[styles.containerOptionReportProblem]}>
        <PressableOpacity
          onPress={() => goToReportIssue(3)}
          style={styles.btnOptionReportProblem}>
          <Icon name="phone-slash" color="white" type="solid" size={16} />
          <Label
            allowFontScaling={false}
            style={[styles.btnOptionLocationText, {fontSize: 13}]}>
            Does not answer the phone
          </Label>
        </PressableOpacity>

        <PressableOpacity
          onPress={() => goToReportIssue(4)}
          style={styles.btnOptionReportProblem}>
          <Icon name="thunderstorm" color="white" type="solid" size={16} />
          <Label
            allowFontScaling={false}
            style={[styles.btnOptionLocationText, {fontSize: 13}]}>
            Weather
          </Label>
        </PressableOpacity>
      </Wrapper>

      <Wrapper style={[styles.containerOptionReportProblem]}>
        <PressableOpacity
          onPress={() => goToReportIssue(5)}
          style={styles.btnOptionReportProblem}>
          <Icon name="user-slash" color="white" type="solid" size={16} />
          <Label
            allowFontScaling={false}
            style={[styles.btnOptionLocationText, {fontSize: 13}]}>
            Wrong contact info
          </Label>
        </PressableOpacity>

        <PressableOpacity
          onPress={() => goToReportIssue(6)}
          style={styles.btnOptionReportProblem}>
          <Icon name="do-not-enter" color="white" type="solid" size={16} />
          <Label
            allowFontScaling={false}
            style={[styles.btnOptionLocationText, {fontSize: 13}]}>
            Impossible access
          </Label>
        </PressableOpacity>
      </Wrapper>

      <Wrapper style={[styles.containerOptionReportProblem]}>
        <PressableOpacity
          onPress={() => goToReportIssue(7)}
          style={styles.btnOptionReportProblem}>
          <Icon name="calendar-times" color="white" type="solid" size={16} />
          <Label
            allowFontScaling={false}
            style={[styles.btnOptionLocationText, {fontSize: 13}]}>
            Postponed by the customer
          </Label>
        </PressableOpacity>

        <PressableOpacity
          onPress={() => goToReportIssue(8)}
          style={styles.btnOptionReportProblemDanger}>
          <Icon name="file" color="white" type="solid" size={16} />
          <Label
            allowFontScaling={false}
            style={[styles.btnOptionLocationText, {fontSize: 13}]}>
            Another
          </Label>
        </PressableOpacity>
      </Wrapper>

      <Wrapper style={[styles.containerOptionReportProblem]}>
        <Label style={styles.labelInfoRp}>
          Press a button for report sending.
        </Label>
      </Wrapper>
    </>
  );
};

const styles = StyleSheet.create({
  containerOptionReportProblem: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 15,
    gap: 5,
  },
  btnOptionLocationText: {
    color: 'white',
    fontSize: 12,
  },
  btnOptionReportProblem: {
    backgroundColor: COLORS.terteary,
    flexDirection: 'row',
    borderRadius: 20,
    padding: 4,
    paddingLeft: 10,
    paddingRight: 10,
    alignItems: 'center',
    gap: 5,
  },
  btnOptionReportProblemDanger: {
    backgroundColor: '#C13737',
    flexDirection: 'row',
    borderRadius: 20,
    padding: 4,
    paddingLeft: 10,
    paddingRight: 10,
    alignItems: 'center',
    gap: 5,
  },
  labelInfoRp: {
    paddingLeft: 10,
    paddingRight: 10,
    color: '#1F2D3F',
    opacity: 0.52,
    fontSize: 13,
  },
});
