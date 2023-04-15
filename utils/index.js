const requester = require("./requester");

class BMC {
  constructor(access_token) {
    this.access_token = access_token;
  }

  Subscription(id) {
    return this._sendRequest(`subscriptions/${id}`);
  }

  Supporter(id) {
    return this._sendRequest(`supporters/${id}`);
  }

  Supporters(page) {
    if (!page) return this._sendRequest("supporters");
    return this._sendRequest(`supporters?page=${page}`);
  }

  Subscriptions(page) {
    if (!page) return this._sendRequest("subscriptions");
    return this._sendRequest(`subscriptions?page=${page}`);
  }

  Extras(page) {
    if (!page) return this._sendRequest("extras");
    return this._sendRequest(`extras?page=${page}`);
  }

  async _sendRequest(path) {
    const response = await requester.get(path, {
      headers: {
        Authorization: "Bearer " + this.access_token,
      },
      validateStatus: function (status) {
        return status >= 200 && status < 300; // default
      },
    });
    return response.data;
  }
}

module.exports = BMC;
