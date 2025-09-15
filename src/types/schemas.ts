import {LaborCodeType} from '@api/types/Jobs';
import {EmployeeType, IdReportMaterialType} from '@api/types/Task';
import * as yup from 'yup';

const DEFAULT_REQUIRED_MESSAGE = 'This field is required';
const DEFAULT_NUMBER_TYPE_MESSAGE = 'Must input a number';
const DEFAULT_DATE_TYPE_MESSAGE = 'Invalid date';
const DEFAULT_EMAIL_TYPE_MESSAGE = 'Invalid email';

const decimalRegex = /^\d*((\.|\,)\d{1,2})?$/;
const decimalIntegerRegex = /^\d+((\.|\,)\d{1,2})?$/;
const decimalNoIntegerRegex = /^((\.|\,)\d{1,2})?$/;
const numberRegex = /^\d+$/;

const decimalString = (maxDecimals = 5) =>
  yup
    .string()
    .transform((v) => {
      const raw = (v ?? '').toString().trim();
      if (raw === '') return '0'; // vacío => "0"
      return raw.replace(',', '.'); // normaliza coma a punto
    })
    .matches(
      new RegExp(`^\\d+(?:\\.\\d{1,${maxDecimals}})?$`),
      `It must be a valid number`,
    );

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

export const AddLaborSchema = yup
  .object({
    handler: yup
      .mixed<EmployeeType & {title: string}>()
      .required(DEFAULT_REQUIRED_MESSAGE),
    code: yup.string().required(DEFAULT_REQUIRED_MESSAGE),
    hours: yup
      .number()
      .transform((val, orig) => {
        // Vacío -> undefined (para permitir la validación combinada)
        if (orig === '' || orig === null || typeof orig === 'undefined')
          return undefined;
        return Number.isFinite(val) ? val : NaN;
      })
      .typeError('Hours must be a number')
      .integer('Hours must be an integer')
      .min(0, "Hours can't be inferior than 0")
      .max(999, "Hours can't be superior to 999")
      .nullable(),
    minutes: yup
      .number()
      .transform((val, orig) => {
        if (orig === '' || orig === null || typeof orig === 'undefined')
          return undefined;
        return Number.isFinite(val) ? val : NaN;
      })
      .typeError('Minutes must be a number')
      .integer('Minutes must be an integer')
      .min(0, "Minutes can't be inferior than 0")
      .max(59, "Minutes can't be superior to 59")
      .nullable(),
  })
  // Autorrelleno: si uno es válido y el otro no, rellenar con 0
  .transform((current) => {
    if (!current) return current;
    const hoursValid =
      Number.isInteger(current.hours) &&
      current.hours >= 0 &&
      current.hours <= 999;

    const minutesValid =
      Number.isInteger(current.pbs) && current.pbs >= 0 && current.pbs <= 59;

    if (hoursValid && !minutesValid) {
      return {...current, pbs: 0};
    }
    if (minutesValid && !hoursValid) {
      return {...current, hours: 0};
    }
    return current;
  })
  // Regla combinada: al menos uno válido
  .test(
    'at-least-one',
    'Provide at least Hours or Minutes (integers).',
    (value) => {
      if (!value) return false;
      const hoursValid =
        Number.isInteger(value.hours) &&
        value.hours! >= 0 &&
        value.hours! <= 999;

      const minutesValid =
        Number.isInteger(value.minutes) &&
        value.minutes! >= 0 &&
        value.minutes! <= 59;

      return hoursValid || minutesValid;
    },
  );

export type AddLaborSchemaType = yup.InferType<typeof AddLaborSchema>;

export const ClockInSchema = yup.object().shape({
  code: yup.string().required(DEFAULT_REQUIRED_MESSAGE),
});

export type ClockInSchemaType = yup.InferType<typeof ClockInSchema>;

export const TakeDimensionsSchema = yup.object().shape({
  unpacked_height: decimalString(),
  unpacked_length: decimalString(),
  unpacked_width: decimalString(),
  packed_height: decimalString(),
  packed_length: decimalString(),
  packed_width: decimalString(),
  weight: decimalString(),
  additional_info: yup.string().optional().nullable(),
  packing_detail: yup.string().optional().nullable(),
});

export type TakeDimensionsSchemaType = yup.InferType<
  typeof TakeDimensionsSchema
>;
