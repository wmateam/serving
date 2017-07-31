/**
 * Created by afkari on 7/11/17.
 */
"use strict";

const URL = require('url');
const HTTP = require('http');
const debugLog = require('util').debuglog('serving::router');

class Serving {

  constructor() {
    debugLog('constructor');
    /**
     *
     * @type {number}
     * @private
     */
    this._port = process.env.PORT || 3000;
    /**
     *
     * @type {{get: Map, post: Map, put: Map, delete: Map, all: Map}}
     * @private
     */
    this._handlers = {
      get: new Map(),
      post: new Map(),
      put: new Map(),
      delete: new Map(),
      all: new Map()
    };
    this._server = null;
  }

  /**
   *
   * @param {Number} [port]
   */
  start(port) {
    if (!isNaN(port))
      this._port = port;
    this._server = HTTP.createServer(Serving._handler);
    try {
      this._server.listen(this._port);
      console.log('Server started at :%d port', this._port);
    } catch (ex) {
      console.log(ex);
      process.exit(0);
    }
  }

  ALL(uri, ...handlers) {
    this._handlers.all.set(uri, ...handlers);
  }

  get(uri, ...handlers) {
    this._handlers.get.set(uri, ...handlers);
  }

  POST(uri, ...handlers) {
    this._handlers.post.set(uri, ...handlers);
  }

  PUT(uri, ...handlers) {
    this._handlers.put.set(uri, ...handlers);
  }

  DELETE(uri, ...handlers) {
    this._handlers.delete.set(uri, ...handlers);
  }

  static _handler(request, response) {
    request.params = [];
    request.url = request.url.replace(/^\/+|\/+$/g, '');
    request.url = URL.parse(req.url, true);
    if (!request.url.pathname) request.url.pathname = request.url.name = '/';
    console.log(request.url.name);
    response.writeHead(200, {
      'content-type': 'application/json',
      'x-powered-by': 'wmateam/stars',
    });
    response.end(new Date() + '\n');
  }
}

const app = new Serving();
app.get('javad', (request, response) => {
  console.log('javad');
});
app.start(2030);