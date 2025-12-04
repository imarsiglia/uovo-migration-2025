import {useHeaderHeight} from '@react-navigation/elements';
import StickyNote from './StickyNote';
import NoteArea from './NoteArea';
import {StickyNoteProps} from './StickyNoteFunctional';

const NoteIssueSelector = function NoteIssueSelector(props: StickyNoteProps) {
  const headerHeight = useHeaderHeight();
  console.log("headerHeight NoteIssueSelector")
  console.log(headerHeight)
  if (props?.note?.areaSet && !props?.note?.updating) {
    return <StickyNote {...props} headerHeight={headerHeight} />;
  }
  // @ts-ignore
  return <NoteArea {...props} headerHeight={headerHeight} />;
};

export default NoteIssueSelector;
