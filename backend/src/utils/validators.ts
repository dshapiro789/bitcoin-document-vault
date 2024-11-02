export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return passwordRegex.test(password);
};

export const isValidAddress = (address: string): boolean => {
  // Basic Bitcoin address validation (this is a simplified check)
  return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address);
};
