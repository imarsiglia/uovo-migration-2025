import {PressableOpacity} from '@components/commons/buttons/PressableOpacity';
import {Label} from '@components/commons/text/Label';
import {SelectableText} from '@components/commons/text/SelectableText';
import {Wrapper} from '@components/commons/wrappers/Wrapper';
import {useCustomNavigation} from '@hooks/useCustomNavigation';
import useTopSheetStore from '@store/topsheet';
import {COLORS} from '@styles/colors';
import {GLOBAL_STYLES} from '@styles/globalStyles';
import {getFormattedDate} from '@utils/functions';
import React, {useMemo} from 'react';
import {Platform, ScrollView, StyleSheet} from 'react-native';
import Icon from 'react-native-fontawesome-pro';

export const ResumeTopsheet = () => {
  const {navigate} = useCustomNavigation();
  const jobDetail = useTopSheetStore((d) => d.jobDetail);

  const formattedWoName = useMemo(() => {
    return jobDetail?.client_name?.substring(
      jobDetail?.client_name?.indexOf(' '),
    );
  }, [jobDetail?.client_name]);

  const formattedStartDate = useMemo(() => {
    return getFormattedDate(jobDetail?.start_date, 'dddd DD [•] MMM YYYY');
  }, [jobDetail?.start_date]);

  const formattedEndtDate = useMemo(() => {
    return getFormattedDate(jobDetail?.end_date, 'dddd DD [•] MMM YYYY');
  }, [jobDetail?.end_date]);

  if (!jobDetail) {
    return <></>;
  }

  return (
    <ScrollView
      bounces={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      <Wrapper style={GLOBAL_STYLES.row}>
        <Label style={styles.clientNameTitle}>Client:</Label>
        <Label style={styles.clientName}>{formattedWoName}</Label>
      </Wrapper>

      <Wrapper style={{marginTop: 10}}>
        <Label style={styles.dateTitle}>Start date</Label>
        <Label style={styles.date}>{formattedStartDate}</Label>
      </Wrapper>

      {jobDetail.end_date != null && (
        <Wrapper style={{marginTop: 10}}>
          <Label style={styles.dateTitle}>End date</Label>
          <Label style={styles.date}>{formattedEndtDate}</Label>
        </Wrapper>
      )}

      <Wrapper style={{marginTop: 20}}>
        <Wrapper style={GLOBAL_STYLES.row}>
          <Label style={styles.nameBold}>Title: </Label>
          <Label style={styles.name}>
            {jobDetail.wo_title ? jobDetail.wo_title : 'N/A'}
          </Label>
        </Wrapper>

        <Wrapper style={GLOBAL_STYLES.row}>
          <Label style={styles.nameBold}>WO Type: </Label>
          <Label style={styles.name}>{jobDetail.job_type_desc}</Label>
        </Wrapper>
      </Wrapper>

      <Wrapper style={{marginTop: 5}}>
        <Label style={[styles.nameBold, {marginTop: 20}]}>BOL Notes:</Label>
        <SelectableText style={[styles.name, {marginBottom: 10}]}>
          {jobDetail.bol_notes ? jobDetail.bol_notes : 'N/A'}
        </SelectableText>
      </Wrapper>

      <Wrapper
        style={{
          alignItems: 'center',
          width: '100%',
        }}>
        <PressableOpacity
          style={styles.btnOptionAttachments}
          onPress={() => navigate('Account')}>
          <Label style={styles.btnOptionAttachmentsText}>WO Attachments</Label>
          <Wrapper style={styles.btnOptionAttachmentsCounter}>
            <Label style={styles.btnOptionAttachmentsNumeric}>
              {jobDetail.file_counter ? jobDetail.file_counter : '0'}
            </Label>
          </Wrapper>
          <Icon name="file" color="white" type="solid" size={16} />
        </PressableOpacity>
      </Wrapper>

      <Wrapper style={[GLOBAL_STYLES.row, {marginTop: 20, paddingBottom: 80}]}>
        <Wrapper style={styles.containerInstructions}>
          <Label style={styles.nameBold}>Instructions:</Label>
          <SelectableText style={styles.name}>
            {jobDetail.description ? jobDetail.description : 'N/A'}
          </SelectableText>
        </Wrapper>
      </Wrapper>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgWhite,
    minHeight: '100%',
    paddingHorizontal: 20,
    paddingTop: 10
  },
  nameBold: {
    color: COLORS.subtitleColor,
    fontWeight: 'bold',
    fontSize: 14,
  },
  name: {
    color: '#3e434c',
    fontSize: 14,
    opacity: 0.86,
  },
  btnOptionAttachmentsCounter: {
    backgroundColor: 'white',
    borderRadius: 50,
    fontSize: 14,
    marginRight: 8,
    paddingLeft: 3,
    paddingRight: 3,
    minWidth: 25,
    height: 25,
    justifyContent: 'center',
  },
  btnOptionAttachmentsText: {
    color: 'white',
    fontSize: 14,
    marginRight: 8,
  },
  btnOptionAttachments: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    borderRadius: 30,
    padding: 4,
    paddingLeft: 20,
    paddingRight: 20,
    alignItems: 'center',
    marginRight: 2,
    height: 40,
    shadowColor: COLORS.primary,
    shadowOffset: {height: 5, width: 1},
    shadowRadius: 10,
    shadowOpacity: 0.5,
  },
  btnOptionAttachmentsNumeric: {
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
  },
  dateTitle: {
    color: COLORS.terteary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  date: {
    color: COLORS.subtitleColor,
    fontSize: 16,
    fontWeight: 'bold',
  },
  clientNameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.subtitleColor,
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.subtitleColor,
  },
  containerInstructions: {
    borderRadius: 15,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.placeholderInput,
        shadowOffset: {width: 1, height: 1},
        shadowOpacity: 1,
        shadowRadius: 8,
      },
      android: {elevation: 1},
    }),
    backgroundColor: 'white',
    padding: 10,
    width: '100%',
    paddingBottom: 20,
  },
});
