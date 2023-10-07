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

export const generateSlug = (str: string): string => {
  const trimmedStr = str.trim();

  const slug = trimmedStr
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const time = new Date().getTime();

  return `${slug}-${time}`;
};

export const generateUniqueString = () => {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let result = "";

  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    const randomCharacter = characters.charAt(randomIndex);
    result += randomCharacter;
  }

  return result;
};
