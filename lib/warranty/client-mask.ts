export const maskCustomerName = (value: string) => {
  const characters = Array.from(value.trim());
  if (characters.length <= 1) return "*";
  if (characters.length === 2) return `${characters[0]}*`;
  return `${characters[0]}${"*".repeat(characters.length - 2)}${characters.at(-1)}`;
};
