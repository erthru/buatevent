export const useCustomError = () => {
  const isError = useState("isError", () => false);
  const errorCode = useState("errorCode", () => 0);
  const errorMessage = useState("errorMessage", () => "");

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
