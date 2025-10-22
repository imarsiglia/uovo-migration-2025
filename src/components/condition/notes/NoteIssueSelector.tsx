import {useHeaderHeight} from '@react-navigation/elements';
import StickyNote, {StickyNoteProps} from './StickyNote';
import NoteArea from './NoteArea';

const NoteIssueSelector = function NoteIssueSelector(props: StickyNoteProps) {
  const headerHeight = useHeaderHeight();
  if (props?.note?.areaSet && !props?.note?.updating) {
    return <StickyNote {...props} headerHeight={headerHeight} />;
  }
  // @ts-ignore
  return <NoteArea {...props} headerHeight={headerHeight} />;
};

export default NoteIssueSelector;
