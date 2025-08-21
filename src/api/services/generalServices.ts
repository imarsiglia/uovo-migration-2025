import {UserType} from '@api/types/User';
import {
  API_HELPDESK,
  API_REFRESH_TOKEN,
  SUCCESS_MESSAGES,
} from '@api/contants/endpoints';
import {postRequest} from '@api/helpers/apiClientHelper';

type PropsHelpDesk = {
  title: string;
  description: string;
  attachment?: string | null;
  deviceInfo: string;
  name: string;
  email: string;
};

const helpDesk = async (props: PropsHelpDesk): Promise<boolean> => {
  const response = await postRequest(API_HELPDESK, props);
  return response.message == SUCCESS_MESSAGES.SUCCESS;
};

export const generalServices = {
  helpDesk,
};
