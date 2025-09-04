import * as yup from 'yup';

const DEFAULT_REQUIRED_MESSAGE = 'This field is required';
const DEFAULT_NUMBER_TYPE_MESSAGE = 'Must input a number';
const DEFAULT_DATE_TYPE_MESSAGE = 'Invalid date';
const DEFAULT_EMAIL_TYPE_MESSAGE = 'Invalid email';

export const LoginSchema = yup.object().shape({
  username: yup
    .string()
    .email(DEFAULT_EMAIL_TYPE_MESSAGE)
    .required('Enter an email'),
  password: yup.string().required('Enter a password'),
});

export type LoginSchemaType = yup.InferType<typeof LoginSchema>;

export const ContactUsSchema = yup.object().shape({
  name: yup.string().required(DEFAULT_REQUIRED_MESSAGE),
  email: yup
    .string()
    .email(DEFAULT_EMAIL_TYPE_MESSAGE)
    .required(DEFAULT_REQUIRED_MESSAGE),
  title: yup.string().required(DEFAULT_REQUIRED_MESSAGE),
  description: yup.string().required(DEFAULT_REQUIRED_MESSAGE),
  photo: yup.string().optional().nullable(),
});

export type ContactUsSchemaType = yup.InferType<typeof ContactUsSchema>;

export const HelpDeskSchema = yup.object().shape({
  title: yup.string().required(DEFAULT_REQUIRED_MESSAGE),
  description: yup.string().required(DEFAULT_REQUIRED_MESSAGE),
  photo: yup.string().optional().nullable(),
});

export type HelpDeskSchemaType = yup.InferType<typeof HelpDeskSchema>;

export const ReportIssueSchema = yup.object().shape({
  idProblemType: yup.string().required(DEFAULT_REQUIRED_MESSAGE),
  description: yup.string().optional().nullable(),
  photo: yup.string().optional().nullable(),
});

export type ReportIssueSchemaType = yup.InferType<typeof ReportIssueSchema>;

export const SaveLocationNoteSchema = yup.object().shape({
  value: yup.string().required(DEFAULT_REQUIRED_MESSAGE),
});

export type SaveLocationNoteSchemaType = yup.InferType<
  typeof SaveLocationNoteSchema
>;
