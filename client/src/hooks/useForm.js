import { useState, useCallback, useEffect } from 'react';

export const useForm = (initialValues = {}, validationSchema = null, onSubmit = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const validateField = useCallback(async (name, value) => {
    if (!validationSchema) return '';

    try {
      await validationSchema.validateAt(name, { [name]: value });
      return '';
    } catch (error) {
      return error.message;
    }
  }, [validationSchema]);

  const validateForm = useCallback(async (data = values) => {
    if (!validationSchema) return {};

    try {
      await validationSchema.validate(data, { abortEarly: false });
      return {};
    } catch (error) {
      const errors = {};
      error.inner.forEach(err => {
        errors[err.path] = err.message;
      });
      return errors;
    }
  }, [validationSchema, values]);

  const handleChange = useCallback(async (event) => {
    const { name, value } = event.target;
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = await validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [touched, validateField]);

  const handleBlur = useCallback(async (event) => {
    const { name } = event.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = await validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [validateField, values]);

  const handleSubmit = useCallback(async (event) => {
    if (event) event.preventDefault();
    
    setSubmitCount(prev => prev + 1);
    setIsSubmitting(true);

    try {
      const newErrors = await validateForm();
      setErrors(newErrors);

      if (Object.keys(newErrors).length === 0 && onSubmit) {
        await onSubmit(values);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, values, onSubmit]);

  const setFieldValue = useCallback(async (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = await validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [touched, validateField]);

  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched(prev => ({ ...prev, [name]: isTouched }));
  }, []);

  const resetForm = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    submitCount,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    resetForm,
    setValues
  };
};

export default useForm; 