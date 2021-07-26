export interface IMarket {
  name: string;
  longitude: string;
  latitude: string;
  address: string;
}

export function toTitleCase(str) {
  return str.toLowerCase().split(' ').map((word) => {
    return (word.charAt(0).toUpperCase() + word.slice(1));
  }).join(' ');
}