import cookie from "cookie";
import jose from "jose";

const DEFAULT_CONFIG = { debug: false, verification: {} };

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

    return new Promise(async (resolve, reject) => {
      const cookiesHeader = evt.request.headers.get("Cookie") || "";
      const cookies = cookie.parse(cookiesHeader);
      this.log(`Parsed cookies: ${cookies}`);

      try {
        const authCookie = cookies["CF_Authorization"];
        if (!authCookie)
          throw new Error("CF_Authorization wasn't found in cookie");

        this.log(`Found CF_Authorization cookie`);

        const certificate_url = this._config.verification.certificateUrl;
        this.log(`Requesting certs from ${certificate_url}`);
        const resp = await fetch(certificate_url);
        const { keys } = await resp.json();
        this.log(`Requested verification keys, received ${keys.length}`);

        this.log(`Verifying...`);
        const keyStore = jose.JWKS.asKeyStore(keys);
        jose.JWT.verify(authCookie, keyStore);
        return resolve({ authorized: true, event: evt });
      } catch (err) {
        this.log("Unable to authorize, rejecting promise");
        reject(err);
      }
    });
  }
}
