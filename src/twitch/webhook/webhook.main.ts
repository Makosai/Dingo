/**
 * MIT License

 * Copyright (c) 2017 true-dubach
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

 /**
  * Modified https://github.com/true-dubach/node-twitch-webhook to be a typescript variant.
  */

import url from 'url';
import http from 'http';
import https from 'https';
import crypto from 'crypto';
import qs from 'querystring';
import { EventEmitter } from 'events';
import * as request from 'request-promise';
import isAbsoluteUrl from 'is-absolute-url';
import parseLinkHeader from 'parse-link-header';

import { FatalError, RequestDenied, WebhookError } from '@utils/errors.utils';

interface ITwitchWebhookOptions {
  /**
   * Twitch Client ID.
   */
  client_id: string;
  /**
   * The callback URL.
   */
  callback: string;

  secret?: string | false;

  /**
   * Number of seconds until the subscription expires. Default: 0. Maximum: 864000.
   */
  lease_seconds?: number;

  listen?: {
    autoStart?: boolean;
    host?: string;
    port?: number;
  };
  https?: boolean | https.ServerOptions;
  baseApiUrl: string;
}
const defaultOptions = {
  lease_seconds: 864000,
  listen: {
    autoStart: true,
    host: '0.0.0.0',
    port: 8443
  },
  https: false,
  baseApiUrl: 'https://api.twitch.tv/helix/'
};

export default class TwitchWebhook extends EventEmitter {
  options: ITwitchWebhookOptions;
  apiUrl: string;
  hubUrl: string;
  apiPathname: string;
  subscriptions: any;
  server: https.Server | http.Server;

  constructor(options: ITwitchWebhookOptions) {
    options = { ...defaultOptions, ...options };

    // Error handling
    if (!options.client_id) {
      throw new FatalError('Twitch Client ID not provided.');
    }

    if (!options.callback) {
      throw new FatalError('Callback URL not provided.');
    }

    super();

    this.options = options;

    // Append a / to the end of a url.
    if (options.callback.substr(-1) !== '/') {
      this.options.callback += '/';
    }

    if (this.options.baseApiUrl.substr(-1) !== '/') {
      this.options.baseApiUrl += '/';
    }

    this.apiUrl = this.options.baseApiUrl;
    this.hubUrl = this.apiUrl + 'webhooks/hub/';
    this.apiPathname = url.parse(this.apiUrl).pathname || '';

    this.subscriptions = {};

    this.options.https = this.options.https || false;

    if (
      typeof this.options.https !== 'boolean' &&
      Object.keys(this.options.https).length
    ) {
      this.server = https.createServer(
        this.options.https,
        this.requestListener.bind(this)
      );
    } else {
      this.server = http.createServer(this.requestListener.bind(this));
    }

    this.server.on('error', this.emit.bind(this, 'error'));
    this.server.on('listening', this.emit.bind(this, 'listening'));

    if (options.listen?.autoStart) {
      this.listen();
    }
  }

  async listen(...args: any) {
    if (this.isListening()) {
      throw new FatalError('Webhooks is already listening.');
    }

    if (!args.length) {
      this.server.listen(this.options.listen?.port, this.options.listen?.host);
    } else {
      this.server.listen(...args);
    }
  }

  async close() {
    if (!this.isListening()) {
      return;
    }

    this.server.close();
  }

  isListening() {
    return this.server.listening;
  }

  /**
   * Make request
   *
   * @param mode
   * @param topic
   * @param options
   */
  private request(mode: string, topic: string, options = {}) {
    if (!isAbsoluteUrl(topic)) {
      topic = this.apiUrl + topic;
    }
    if (Object.keys(options).length) {
      topic += '?' + qs.stringify(options);
    }

    let requestOptions = {
      url: this.hubUrl,
      headers: { 'Client-ID': this.options.client_id },
      qs: {
        'hub.callback': this.options.callback,
        'hub.mode': mode,
        'hub.topic': topic,
        'hub.lease_seconds': this.options.lease_seconds,
        'hub.secret': ''
      },
      resolveWithFullResponse: true
    };

    if (this.options.secret) {
      const secret = crypto
        .createHmac('sha256', this.options.secret)
        .update(topic)
        .digest('hex');

      requestOptions.qs['hub.secret'] = secret;
    } else {
      delete requestOptions.qs['hub.secret'];
    }

    return request
      .post(requestOptions)
      .catch(err => {
        throw new RequestDenied(err);
      })
      .then(response => {
        this.subscriptions[topic] = {};
        if (this.options.secret) {
          this.subscriptions[topic].secret = requestOptions.qs['hub.secret'];
        }
      });
  }

  /**
   * Subscribe to specific topic
   *
   * @param topic Topic name
   * @param options Topic options
   * @throws {RequestDenied} If hub finds any errors in the request
   */
  subscribe(topic: string, options = {}) {
    return this.request('subscribe', topic, options);
  }

  /**
   * Unsubscribe from specific topic.
   * "*" will unsubscribe from all topics that were subscribed on this session
   *
   * @param topic Topic name
   * @throws {RequestDenied} If hub finds any errors in the request
   */
  unsubscribe(topic: string, options = {}) {
    if (topic !== '*') {
      return this.request('unsubscribe', topic, options);
    }

    let poll = [];
    for (let topic of Object.keys(this.subscriptions)) {
      poll.push(() => this.request('unsubscribe', topic));
    }
    return Promise.all(poll);
  }

  /**
   * Fix fields with date
   *
   * @private
   * @param topic Topic name
   * @param data - Request data
   */
  private fixDate(topic: string, data: any) {
    switch (topic) {
      case 'users/follows':
        if (data.timestamp) {
          // for compatibility with old payloads
          data.timestamp = new Date(data.timestamp);
        } else {
          const userFollows: UserFollows = data;

          for (let follow of userFollows.data) {
            follow.followed_at = new Date(follow.followed_at);
          }
        }
        break;
      case 'streams':
        const streams: StreamChanged = data;

        for (let stream of streams.data) {
          stream.started_at = new Date(stream.started_at);
        }
        break;
    }

    return data;
  }

  private processConnection(
    request: http.IncomingMessage,
    response: http.ServerResponse
  ) {
    if (request.url === undefined) {
      throw new FatalError('URL does not exist.');
    }

    const queries = url.parse(request.url, true).query;

    switch (queries['hub.mode']) {
      case 'denied':
        response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.end();

        this.emit('denied', queries);
        break;

      case 'unsubscribe':
        if (queries['hub.topic'] === undefined) {
          throw new FatalError('hub.topic required.');
        }

        if (typeof queries['hub.topic'] !== 'string') {
          throw new FatalError('hub.topic returned a corrupted value.');
        }

        delete this.subscriptions[queries['hub.topic']];

        response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.end(queries['hub.challenge']);

        this.emit('unsubscribe', queries);
        break;

      case 'subscribe':
        response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.end(queries['hub.challenge']);

        this.emit('subscribe', queries);
        break;

      default:
        response.writeHead(400, { 'Content-Type': 'text/plain' });
        response.end();
        break;
    }
  }

  private processUpdates(
    request: http.IncomingMessage,
    response: http.ServerResponse
  ) {
    if (typeof request.headers.link !== 'string') {
      throw new FatalError('Invalid webhook header link.');
    }

    const links = parseLinkHeader(request.headers.link);
    const endpoint = links && links.self && links.self.url;
    const params = endpoint && url.parse(endpoint, true);
    const topic = params && params.pathname?.replace(this.apiPathname, '');
    const options = params && params.query;

    if (!endpoint || !topic) {
      this.emit(
        'webhook-error',
        new WebhookError('Topic is missing or incorrect')
      );
      response.writeHead(202, { 'Content-Type': 'text/plain' });
      response.end();
      return;
    }

    let signature: string | false;
    if (this.options.secret) {
      signature =
        request.headers['x-hub-signature'] !== undefined &&
        (request.headers['x-hub-signature'] as string).split('=')[1];

      if (
        !signature ||
        !this.subscriptions[endpoint] ||
        !this.subscriptions[endpoint].secret
      ) {
        this.emit(
          'webhook-error',
          new WebhookError('"x-hub-signature" is missing')
        );
        response.writeHead(202, { 'Content-Type': 'text/plain' });
        response.end();
        return;
      }
    }

    let body = '';
    request.on('data', data => {
      body += data;

      // Too much data, destroy the connection
      if (body.length > 1e6) {
        body = '';
        this.emit('webhook-error', new WebhookError('Request is very large'));
        response.writeHead(202, { 'Content-Type': 'text/plain' });
        response.end();
        request.connection.destroy();
      }
    });

    request.on('end', () => {
      let data;
      try {
        data = JSON.parse(body);
      } catch (err) {
        this.emit('webhook-error', new WebhookError('JSON is malformed'));
        response.writeHead(202, { 'Content-Type': 'text/plain' });
        response.end();
        return;
      }

      if (this.options.secret) {
        let storedSign = crypto
          .createHmac('sha256', this.subscriptions[endpoint].secret)
          .update(body)
          .digest('hex');

        if (storedSign !== signature) {
          this.emit(
            'webhook-error',
            new WebhookError('"x-hub-signature" is incorrect')
          );
          response.writeHead(202, { 'Content-Type': 'text/plain' });
          response.end();
          return;
        }
      }

      response.writeHead(200, { 'Content-Type': 'text/plain' });
      response.end();

      let payload = {
        topic,
        options,
        endpoint,
        event: this.fixDate(topic, data)
      };

      this.emit(topic, payload);
      this.emit('*', payload);
    });
  }

  private requestListener(
    request: http.IncomingMessage,
    response: http.ServerResponse
  ) {
    switch (request.method) {
      case 'GET':
        this.processConnection(request, response);
        break;

      case 'POST':
        this.processUpdates(request, response);
        break;

      default:
        response.writeHead(405, { 'Content-Type': 'text/plain' });
        response.end();
        break;
    }
  }
}
