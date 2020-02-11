const DEFAULT_CONFIG = {};

const AccessAuthorizer = (config = DEFAULT_CONFIG) => evt => {
  if (evt.request.header["CF-Authorization"]) {
    return { authorized: true, event: evt };
  } else {
    throw new Error("Unable to authorize");
  }
};

export default config => AccessAuthorizer(config);
