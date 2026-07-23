import { Controller, Get, Req, Res, Next } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { createCache, extractStyle, StyleProvider } from '@ant-design/cssinjs';
import App from './App';
import { newsService } from './services/news.service';
import type { NewsResponse } from './types';
import { createNewsStore } from './store/newsStore';
import { NewsStoreProvider } from './store/newsStoreProvider';

const routes = ['/', '/news', '/login', '/register', '/profile', '/admin'];

@Controller()
export class AppController {
  @Get(routes)
  async serve(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    if (req.url.startsWith('/api')) return next();

    let initialData: NewsResponse = {
      data: [],
      total: 0,
      page: 0,
      limit: 0,
      totalPages: 0,
    };

    if (req.url === '/' || req.url.startsWith('/news')) {
      initialData = await newsService.fetchInitialData();
    }

    const store = createNewsStore({
      news: initialData.data ?? [],
      total: initialData.total ?? 0,
      loading: false,
    });

    const cache = createCache();

    const html = renderToString(
      <StyleProvider cache={cache}>
        <NewsStoreProvider store={store}>
          <StaticRouter location={req.url}>
            <App />
          </StaticRouter>
        </NewsStoreProvider>
      </StyleProvider>,
    );

    const styleText = extractStyle(cache);

    res.send(`
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>News Portal - SSR</title>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <style>${styleText}</style>
      </head>
      <body>
        <div id="root">${html}</div>
        <script>
          window.__INITIAL_DATA__ = ${JSON.stringify(initialData).replace(/</g, '\\u003c')};
        </script>
        <script src="/client.js"></script>
      </body>
      </html>
    `);
  }
}
