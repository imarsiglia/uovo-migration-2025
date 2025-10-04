// import {useOutboxProcessor} from '@offline/useOutboxProcessor';
import {useQueryClient} from '@tanstack/react-query';
import { useOutboxProcessor } from './processor';

export const OutboxProcessor = () => {
  const qc = useQueryClient();
  useOutboxProcessor(qc);

  return null;
};
