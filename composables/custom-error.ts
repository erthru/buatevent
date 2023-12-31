export const useCustomError = () => {
  const error = useError();
  const isError = useState("isError", () => false);

  const errorCode = useState(
    "errorCode",
    () => (error.value as any)?.statusCode || 500
  );

  const errorMessage = useState(
    "errorMessage",
    () => error.value?.message || ""
  );

  const setError = (code: number, message: string) => {
    isError.value = true;
    errorCode.value = code;
    errorMessage.value = message;
  };

  return {
    isError,
    errorCode,
    errorMessage,
    setError,
  };
};
