import {yupResolver} from '@hookform/resolvers/yup';
import React, {forwardRef, Ref, useEffect, useImperativeHandle} from 'react';
import {
  DeepPartial,
  FormProvider,
  useForm,
  UseFormReturn,
} from 'react-hook-form';
import * as yup from 'yup';

export type BasicFormHandle<T = any> = {
  /** Resetea el formulario; si pasas valores los toma como nuevos defaultValues */
  reset: (values?: DeepPartial<T>) => void;
  /** Métodos útiles que quizás quieras usar desde afuera */
  getValues: UseFormReturn['getValues'];
  setValue: UseFormReturn['setValue'];
  trigger: UseFormReturn['trigger'];
  clearErrors: UseFormReturn['clearErrors'];
  submit: () => void;
};

export type SubmitModulesFormProps<T> = {
  children?: React.ReactNode;
  schema?: yup.ObjectSchema<DeepPartial<T>>;
  defaultValue?: any;
  resetDefaultValue?: boolean;
  key?: string;
};

function BasicFormProviderInner<T>(
  {
    children,
    defaultValue,
    schema,
    resetDefaultValue,
    key,
  }: SubmitModulesFormProps<T>,
  ref: Ref<BasicFormHandle<T>>,
) {
  const currentMethods = useForm({
    defaultValues: defaultValue ?? {},
    mode: 'onTouched',
    reValidateMode: 'onChange',
    resolver: schema ? yupResolver(schema) : undefined,
  });

  useImperativeHandle(
    ref,
    () => ({
      reset: (values?: DeepPartial<T>) => {
        currentMethods.reset(values ?? defaultValue);
      },
      getValues: currentMethods.getValues,
      setValue: currentMethods.setValue,
      trigger: currentMethods.trigger,
      clearErrors: currentMethods.clearErrors,
      submit: () => currentMethods.handleSubmit(() => {})(),
    }),
    [currentMethods, defaultValue],
  );

  useEffect(() => {
    if (resetDefaultValue) {
      currentMethods.reset(defaultValue);
    }
  }, [resetDefaultValue, defaultValue, currentMethods]);

  return (
    <FormProvider key={key} {...currentMethods}>
      {children}
    </FormProvider>
  );
}
export const BasicFormProvider = forwardRef(BasicFormProviderInner) as <T>(
  p: SubmitModulesFormProps<T> & {ref?: React.Ref<BasicFormHandle<T>>},
) => React.ReactElement;
