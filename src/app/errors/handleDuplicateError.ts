import { TErrorSources, TGenericErrorResponse } from '../interface/error';

const handleDuplicateError = (err: {
  message?: string;
  keyValue?: Record<string, unknown>;
}): TGenericErrorResponse => {
  const match = err.message?.match(/"([^"]*)"/);
  const extractedMessage = match ? match[1] : 'Invalid value';

  const errorSources: TErrorSources = [
    {
      path: '',
      message: `${extractedMessage} is already exists`,
    },
  ];

  const statusCode = 400;

  return {
    statusCode,
    message: 'Duplicate Key Error',
    errorSources,
  };
};

export default handleDuplicateError;
