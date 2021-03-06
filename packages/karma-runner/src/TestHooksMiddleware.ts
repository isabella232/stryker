import { RequestHandler } from 'express';
import * as path from 'path';
import * as url from 'url';

export const TEST_HOOKS_FILE_NAME = require.resolve('./testHooksForStryker');

export default class TestHooksMiddleware {
  private constructor() {
    // This `.bind` call is important! The `handler` will be executed with `.apply` (or friends) and otherwise the `this` won't point to this instance!
    this.handler = this.handler.bind(this);
  }

  private static _instance: TestHooksMiddleware;
  public static get instance(): TestHooksMiddleware {
    if (!this._instance) {
      this._instance = new TestHooksMiddleware();
    }
    return this._instance;
  }

  public currentTestHooks: string = '';

  public handler: RequestHandler = (request, response, next) => {
    const pathName = url.parse(request.url).pathname;
    if (pathName && path.normalize(pathName).endsWith(path.join('src', path.basename(TEST_HOOKS_FILE_NAME)))) {
      response.writeHead(200, {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/javascript'
      });
      response.end(this.currentTestHooks);
    } else {
      next();
    }
  };
}
