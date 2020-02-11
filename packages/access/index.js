import cookie from "cookie";

const DEFAULT_CONFIG = { debug: false };

export default class AccessAuthorizer {
  constructor(config = DEFAULT_CONFIG) {
    this._config = config;
  }

  log(message) {
    if (this._config.debug == true) {
      console.log(`[ACCESS_AUTHORIZER]: ${message}`);
    }
  }

  try(evt) {
    this.log("Trying to run middleware");
    this.log(JSON.stringify(evt));
    return new Promise((resolve, reject) => {
      const cookiesHeader = evt.request.headers.get("Cookie") || "";
      const cookies = cookie.parse(cookiesHeader);
      if (cookies["CF_Authorization"]) {
        this.log("Found header, resolving promise");
        return resolve({ authorized: true, event: evt });
      } else {
        this.log("Unable to authorize, rejecting promise");
        reject(new Error("Unable to authorize"));
      }
    });
  }
}
