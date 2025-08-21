import {useMutation} from '@tanstack/react-query';
import {generalServices} from '@api/services/generalServices';

export const useHelpDesk = () => {
  return useMutation({
    mutationFn: generalServices.helpDesk,
  });
};
