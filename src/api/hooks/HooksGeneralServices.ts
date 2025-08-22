import {useMutation} from '@tanstack/react-query';
import {generalServices} from '@api/services/generalServices';

export const useContactUsService = () => {
  return useMutation({
    mutationFn: generalServices.contactUs,
  });
};


export const useHelpDeskService = () => {
  return useMutation({
    mutationFn: generalServices.helpDesk,
  });
};
