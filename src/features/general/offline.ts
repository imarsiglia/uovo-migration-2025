import {QUERY_KEYS} from '@api/contants/constants';
import {DAYS_IN_MS} from '@api/hooks/HooksTaskServices';
import {generalServices} from '@api/services/generalServices';
import {QueryClient} from '@tanstack/react-query';

export async function prefetchPackingDetailsAll(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: [QUERY_KEYS.PACKING_DETAILS],
    queryFn: generalServices.getPackingDetails,
    staleTime: DAYS_IN_MS * 7,
    gcTime: DAYS_IN_MS * 7,
  });
}