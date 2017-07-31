/**
 * Created by afkari on 7/11/17.
 */
"use strict";
/**
 * Created by afkari on 2/1/17.
 */

const URL = require('url');
const QUERY_STRING = require('querystring');
const FORMIDABLE = require('formidable');
const PATH = require('path');

exports.createHandler = (method, uri, cb) => {
  return new Handler(method, uri, cb);
};

/**
 *
 * @param {string} method
 * @param {string} uri
 * @param {function} cb
 * @constructor
 */
function Handler(method, uri, cb) {

  this.method = method;
  this._r = '^\/?' + uri.replace(/^\/+|\/+$/g, '').replace(/(:\w+)/g, '(\\w+|\\d+)').replace(/(\d)/g, '[1-9]') + '\/?';
  this._hasParams = (/(:\w+)/ig.exec(uri) != null);

  this.regex = () => {
    if (this._hasParams) {
      return new RegExp(this._r, 'ig');
    }
    else {
      return null;
    }
  };


  this.go = (req, res) => {
    req.url = URL.parse(req.url, true);
    req.inputs = [];
    req.json = null;
    if (req.method.toLowerCase() === 'post' || req.method.toLowerCase() === 'put') {
      if (/^multipart\/form-data;.*/.exec(req.headers['content-type'])) {
        let form = new FORMIDABLE.IncomingForm();
        form.uploadDir = PATH.normalize(PATH.join(__dirname, '..', '..', '/tmp'));
        form.multiples = false;
        form.hash = 'sha1';
        form.parse(req, (error, fields, files)=> {
          if (error) {
            res.writeHead(400, {'content-type': 'application/json'});
            res.end(JSON.stringify(error));
          } else {
            req.inputs = fields;
            req.json = null;
            req.files = files;
            return cb.apply(this, [req, res]);
          }
        });
      } else {
        BODY_PARSER(req).then((data) => {
          req.inputs = data.inputs;
          req.json = data.json;
          req.files = [];
          return cb.apply(this, [req, res]);
        }).catch((err) => {
          res.writeHead(400, {'content-type': 'application/json'});
          res.end(err.message);
        });
      }
    } else {
      return cb.apply(this, [req, res]);
    }
  }
}

const BODY_PARSER = (req) => {
  return new Promise((resolve, reject) => {
    let rawData = '';
    req.on('data', (data) => {
      rawData += data;
      if (rawData.length > 1e6) {
        req.connection.destroy();
        reject('Body length > 1e6');
      }
    });
    req.on('end', function () {
      let isJson = req.headers['content-type'] === 'application/json';
      if (!isJson) {
        rawData = QUERY_STRING.parse(rawData);
        resolve({json: null, inputs: rawData});
      } else {
        try {
          resolve({json: JSON.parse(rawData), inputs: []});
        } catch (ex) {
          reject({message: "Bad request.JSON data is required"});
        }

      }
    });
    req.on('error', (e) => {
      reject(`Got error: ${e.message}`);
    });
  });
};