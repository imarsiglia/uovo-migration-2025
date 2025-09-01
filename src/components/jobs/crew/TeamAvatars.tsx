import {CrewMemberType} from '@api/types/Jobs';
import {CustomPressable} from '@components/commons/pressable/CustomPressable';
import {Label} from '@components/commons/text/Label';
import {memo, useMemo} from 'react';
import {MemberAvatar} from './MemberAvatar';
import {
  FINALIZED_COLOR_CREW,
  FINALIZED_STATUS_CREW,
  INITIAL_COLOR_CREW,
  PAUSED_COLOR_CREW,
  PAUSED_STATUS_CREW,
  STARTED_COLOR_CREW,
  STARTED_STATUS_CREW,
} from '@api/contants/constants';

export const TeamAvatars = memo(function TeamAvatars({
  crew = [],
  maxVisible = 4,
  size = 36,
  overlap = 10,
  onPress,
}: {
  crew: CrewMemberType[];
  size?: number;
  overlap?: number;
  maxVisible?: number;
  onPress?: () => void;
}) {
  const visible = useMemo(() => crew.slice(0, maxVisible), [crew, maxVisible]);
  const extra = useMemo(
    () => Math.max(crew.length - maxVisible, 0),
    [crew, maxVisible],
  );

  return (
    <CustomPressable onPress={onPress} style={{alignItems: 'center', flexDirection: "row"}}>
      {visible.map((m, i) => (
        <MemberAvatar
          key={m?.id_user ?? i}
          member={m}
          index={i}
          size={size}
          overlap={overlap}
          ringColor={getColorStatus?.(m.status) ?? '#ddd'}
        />
      ))}
      {extra > 0 && (
        <Label style={{marginLeft: 6, color: '#707070', fontSize: 12}}>
          +{extra} people
        </Label>
      )}
    </CustomPressable>
  );
});

export type KnownCrewStatus =
  | typeof STARTED_STATUS_CREW
  | typeof PAUSED_STATUS_CREW
  | typeof FINALIZED_STATUS_CREW;

export type CrewStatus = KnownCrewStatus | '' | null | undefined;

const STATUS_TO_COLOR = {
  [STARTED_STATUS_CREW]: STARTED_COLOR_CREW,
  [PAUSED_STATUS_CREW]: PAUSED_COLOR_CREW,
  [FINALIZED_STATUS_CREW]: FINALIZED_COLOR_CREW,
} satisfies Record<KnownCrewStatus, string>;

export const getColorStatus = (status?: string | null): string => {
  const key = (status ?? '').trim().toUpperCase();
  // Tip-safety: si no está en el mapa, cae al color inicial
  return (STATUS_TO_COLOR as Record<string, string>)[key] ?? INITIAL_COLOR_CREW;
};
