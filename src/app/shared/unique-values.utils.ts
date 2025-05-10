export const getUniqueValues = (data: any[], key: string): string[] => {
  return [...new Set(data.map(item => item[key]).filter(Boolean))];
};
export function getUniqueValues2(data:{ results: any[] }, nameKey: string, keyId: string): { id: any, name: string }[] {
  const seen = new Map();
  console.log(data, 'data');
  data?.results?.forEach(item => {
    const name = item[nameKey];
    const id = item[keyId];
    if (id && name && !seen.has(id)) {
      seen.set(id, name);
    }
  });
  return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
}
export function getUniqueValues3(data:any[], nameKey: string, keyId: string): { id: any, name: string }[] {
  const seen = new Map();
  data?.forEach(item => {
    const name = item[nameKey];
    const id = item[keyId];
    if (id && name && !seen.has(id)) {
      seen.set(id, name);
    }
  });
  return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
}

