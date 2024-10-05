import Cookies from 'js-cookie';

export const setAccessToken = (token) => {
  Cookies.set('accessToken', token);
};

export const getAccessToken = () => {
  return Cookies.get('accessToken');
};

export const removeAccessToken = () => {
  Cookies.remove('accessToken');
};
