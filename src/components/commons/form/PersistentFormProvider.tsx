import {useFormContext} from 'react-hook-form';
import {useEffect, useRef} from 'react';
import { cameraLifecycle } from '@utils/cameraLifecycle';
import { useFormSnapshotStore } from '@store/formSnapshot';

export const PersistentFormProvider = ({children, formKey}: any) => {
  const methods = useFormContext();
  const saveForm = useFormSnapshotStore((s) => s.saveForm);
  const getForm = useFormSnapshotStore((s) => s.getForm);

  const isCameraFlow = useRef(false);

  useEffect(() => {
    const offBefore = cameraLifecycle.onBeforeOpen(() => {
      isCameraFlow.current = true;
      saveForm(formKey, methods.getValues());
    });

    const offAfter = cameraLifecycle.onAfterClose(() => {
      const snapshot = getForm(formKey);
      if (snapshot) {
        methods.reset(snapshot);
      }
      isCameraFlow.current = false;
    });

    return () => {
      offBefore();
      offAfter();
    };
  }, []);

  return children;
};
