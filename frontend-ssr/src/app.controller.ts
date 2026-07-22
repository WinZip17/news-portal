import { Controller, Get, Req, Res, Next } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { createCache, extractStyle, StyleProvider } from '@ant-design/cssinjs';
import App from './App';
import { newsService } from './services/news.service';

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

    // Загружаем данные на сервере
    const initialData =
      req.url === '/' || req.url.startsWith('/news')
        ? await newsService.fetchInitialData()
        : { news: [], total: 0 };

    const cache = createCache();

    const html = renderToString(
      React.createElement(
        StyleProvider,
        { cache },
        React.createElement(
          StaticRouter,
          { location: req.url },
          React.createElement(App),
        ),
      ),
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
        <script>window.__INITIAL_DATA__ = ${JSON.stringify(initialData)}</script>
        <script src="/client.js"></script>
      </body>
      </html>
    `);
  }
}
