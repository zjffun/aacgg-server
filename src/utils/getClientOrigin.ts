export default function getClientOrigin() {
  if (process.env.NODE_ENV === 'development') {
    return 'https://dev.aacgg.com';
  } else {
    return 'https://www.aacgg.com';
  }
}
