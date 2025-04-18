export const getUniqueValues = (data: any[], key: string): string[] => {
  return [...new Set(data.map(item => item[key]).filter(Boolean))];
};
