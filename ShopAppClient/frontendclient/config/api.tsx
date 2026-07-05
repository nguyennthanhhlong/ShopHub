const API_CONFIG = {
  //   IMAGE_URL: 'http://localhost:1337',
  BASE_URL: `${process.env.NEXT_PUBLIC_API_URL}/public/`,
  //   APP_KEY: process.env.NEXT_PUBLIC_APP_KEY || '',
  HEADERS: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};

export default API_CONFIG;
