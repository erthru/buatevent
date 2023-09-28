export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const base64String = reader.result as string;
      resolve(base64String);
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsDataURL(file);
  });
};

export const formatPhoneNumber = (input: string): string => {
  let phoneNumber = input.trim();
  phoneNumber = phoneNumber.replace(/\D/g, "");

  if (phoneNumber.startsWith("62")) {
    phoneNumber = phoneNumber.substring(2);
  } else if (phoneNumber.startsWith("0")) {
    phoneNumber = phoneNumber.substring(1);
  }

  return phoneNumber;
};

export const paginateArray = <T>(
  array: T[],
  page: number,
  pageSize: number
): T[] => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return array.slice(startIndex, endIndex);
};
