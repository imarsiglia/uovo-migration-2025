import { CrewMemberType } from '@api/types/Jobs';
import { Label } from '@components/commons/text/Label';
import { Wrapper } from '@components/commons/wrappers/Wrapper';
import { memo } from 'react';
import { Image, StyleSheet } from 'react-native';
import Icon from 'react-native-fontawesome-pro';

const getInitials = (m: CrewMemberType) =>
  `${(m?.name?.[0] ?? 'T').toUpperCase()}${(
    m?.lastname?.[0] ?? 'R'
  ).toUpperCase()}`;

const photoSrc = (b64: string) => ({uri: `data:image/jpeg;base64,${b64}`});

// Ítem pequeño y puro
export const MemberAvatar = memo(function MemberAvatar({
  member,
  index,
  size,
  overlap,
  ringColor
}: {
  member: CrewMemberType;
  index: number;
  overlap: number;
  size: number;
  ringColor: string;
}) {
  const z = 40 - index * 10;
  const containerStyle = [
    styles.avatarContainer,
    {width: size, height: size, zIndex: z},
    index > 0 && {marginLeft: -overlap},
  ];
  const avatarStyle = [
    styles.avatar,
    {width: size, height: size, borderRadius: size / 2, borderColor: ringColor},
  ];
  return (
    <Wrapper
      hitSlop={6}
      style={containerStyle}
      accessibilityLabel={`${member?.leader ? 'Leader ' : ''}${
        member?.name ?? ''
      } ${member?.lastname ?? ''}`}>
      {member?.photo ? (
        <Image source={photoSrc(member.photo)} style={avatarStyle} />
      ) : (
        <Wrapper style={[avatarStyle, styles.avatarPlaceholder]}>
          <Label style={styles.avatarText}>{getInitials(member)}</Label>
        </Wrapper>
      )}
      {member?.leader && (
        <Wrapper style={styles.leaderBadge}>
          <Icon name="check" size={9} color="white" />
        </Wrapper>
      )}
    </Wrapper>
  );
});

const styles = StyleSheet.create({
  avatarContainer: {position: 'relative'},
  avatar: {
    borderWidth: 2,
    backgroundColor: '#fff',
  },
  avatarPlaceholder: {alignItems: 'center', justifyContent: 'center', backgroundColor: '#1155cc'},
  avatarText: {color: 'white', fontWeight: '700'},
  leaderBadge: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    borderRadius: 7,
    backgroundColor: '#F1A43E',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3
  },
});