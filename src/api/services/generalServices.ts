import {
  API_CONTACT_US,
  API_HELPDESK,
  SUCCESS_MESSAGES,
} from '@api/contants/endpoints';
import {postRequest} from '@api/helpers/apiClientHelper';

type PropsContactUs = {
  title: string;
  description: string;
  attachment?: string | null;
  deviceInfo: string;
  name: string;
  email: string;
};
const contactUs = async (props: PropsContactUs): Promise<boolean> => {
  const response = await postRequest(API_CONTACT_US, props);
  return response.message == SUCCESS_MESSAGES.SUCCESS;
};

type PropsHelpDesk = {
  title: string;
  description: string;
  attachment?: string | null;
  deviceInfo: string;
};
const helpDesk = async (props: PropsHelpDesk): Promise<boolean> => {
  const response = await postRequest(API_HELPDESK, props);
  return response.message == SUCCESS_MESSAGES.SUCCESS;
};

export const generalServices = {
  contactUs,
  helpDesk,
};
