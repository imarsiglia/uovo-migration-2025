import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import { DeepPartial, FormProvider, useForm } from 'react-hook-form';
import * as yup from 'yup';

export type SubmitModulesFormProps<T> = {
  children?: React.ReactNode;
  schema?: yup.ObjectSchema<DeepPartial<T>>;
  defaultValue?: any  
}

export function BasicFormProvider<T>({
  children,
  defaultValue,
  schema,
}: SubmitModulesFormProps<T>) {
  const currentMethods = useForm({
    defaultValues: defaultValue ?? {},
    mode: 'onTouched',
    reValidateMode: 'onChange',
    resolver: schema ? yupResolver(schema) : undefined,
  });

  return <FormProvider {...currentMethods}>{children}</FormProvider>;
}
