import {IdReportMaterialType} from '@api/types/Task';
import * as yup from 'yup';

const DEFAULT_REQUIRED_MESSAGE = 'This field is required';
const DEFAULT_NUMBER_TYPE_MESSAGE = 'Must input a number';
const DEFAULT_DATE_TYPE_MESSAGE = 'Invalid date';
const DEFAULT_EMAIL_TYPE_MESSAGE = 'Invalid email';

const decimalRegex = /^\d*((\.|\,)\d{1,2})?$/;
const decimalIntegerRegex = /^\d+((\.|\,)\d{1,2})?$/;
const decimalNoIntegerRegex = /^((\.|\,)\d{1,2})?$/;
const numberRegex = /^\d+$/;

const quantitySchema = yup
  .string()
  .transform(function (value, originalValue) {
    // 🔥 Recortar espacios en blanco
    const trimmed = originalValue?.trim?.() ?? '';
    return trimmed;
  })
  .required('Empty quantity')
  .test(
    'not-empty-after-trim',
    'Empty quantity',
    (value) => !!value && value.trim() !== '',
  )
  .test(
    'is-valid-decimal',
    'System only allows two decimal numbers',
    function (value) {
      if (!value) return false;
      const trimmed = value.trim();

      if (!decimalRegex.test(trimmed)) return false;

      return true;
    },
  )
  .transform((value) => {
    if (!value) return value;

    const trimmed = value.trim();
    let quantityTemp = trimmed.replace(',', '.');

    if (decimalIntegerRegex.test(trimmed)) {
      return quantityTemp;
    } else if (decimalNoIntegerRegex.test(trimmed)) {
      return '0' + quantityTemp;
    }

    return value;
  });

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

export const PreSaveSignatureSchema = yup.object().shape({
  name: yup.string().required(DEFAULT_REQUIRED_MESSAGE),
  type: yup.string().required(DEFAULT_REQUIRED_MESSAGE),
});

export type PreSaveSignatureSchemaType = yup.InferType<
  typeof PreSaveSignatureSchema
>;

export const SaveNoteSchema = yup.object({
  title: yup.string().required(DEFAULT_REQUIRED_MESSAGE),
  description: yup.string().required(DEFAULT_REQUIRED_MESSAGE),
});

export type SaveNoteSchemaType = yup.InferType<typeof SaveNoteSchema>;

export const SaveReportMaterialSchema = yup.object().shape({
  material: yup
    .mixed<IdReportMaterialType>()
    .required(DEFAULT_REQUIRED_MESSAGE),
  quantity: quantitySchema,
});

export type SaveReportMaterialSchemaType = yup.InferType<
  typeof SaveReportMaterialSchema
>;

const packageCountSchema = yup
  .string()
  .transform(function (value, originalValue) {
    // 🔥 Recortar espacios en blanco
    const trimmed = originalValue?.trim?.() ?? '';
    return trimmed;
  })
  .required('Empty quantity')
  .test(
    'not-empty-after-trim',
    'Empty quantity',
    (value) => !!value && value.trim() !== '',
  )
  .test('is-valid-number', 'Please, enter a valid number', function (value) {
    if (!value) return false;
    const trimmed = value.trim();

    if (!numberRegex.test(trimmed)) return false;

    return true;
  });

export const PieceCountSchema = yup.object().shape({
  packageCount: packageCountSchema,
  pbs: yup
    .string()
    .oneOf(['Yes', 'No'], 'Must be "Yes" or "No"')
    .required(DEFAULT_REQUIRED_MESSAGE),
});

export type PieceCountSchemaType = yup.InferType<typeof PieceCountSchema>;
