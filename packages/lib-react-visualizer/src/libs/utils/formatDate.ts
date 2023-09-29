export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);

  return [date.toLocaleDateString(), date.toLocaleTimeString()].join(' - ');
};
