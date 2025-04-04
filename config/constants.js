// config/constants.js

export const ROLES = {
    USER: 0,
    ADMIN: 1,
    SUPER_ADMIN: 2
  };
  
  export const STATUS_CODES = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500
  };
  
  export const AUTH = {
    TOKEN_EXPIRY: '1d',
    REFRESH_TOKEN_EXPIRY: '7d'
  };