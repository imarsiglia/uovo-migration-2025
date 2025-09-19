import {yupResolver} from '@hookform/resolvers/yup';
import React, {useEffect} from 'react';
import {DeepPartial, FormProvider, useForm} from 'react-hook-form';
import * as yup from 'yup';

export type SubmitModulesFormProps<T> = {
  children?: React.ReactNode;
  schema?: yup.ObjectSchema<DeepPartial<T>>;
  defaultValue?: any;
  resetDefaultValue?: boolean;
  key?: string
};

export function BasicFormProvider<T>({
  children,
  defaultValue,
  schema,
  resetDefaultValue,
  key
}: SubmitModulesFormProps<T>) {
  const currentMethods = useForm({
    defaultValues: defaultValue ?? {},
    mode: 'onTouched',
    reValidateMode: 'onChange',
    resolver: schema ? yupResolver(schema) : undefined,
  });

  useEffect(() => {
    if (resetDefaultValue) {
      currentMethods.reset(defaultValue);
    }
  }, [resetDefaultValue, defaultValue, currentMethods]);

  return <FormProvider key={key} {...currentMethods}>{children}</FormProvider>;
}
