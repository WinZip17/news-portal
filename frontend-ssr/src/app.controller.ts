import { Controller, Get, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import App from './App';

@Controller()
export class AppController {
  @Get()
  serve(@Req() req: Request, @Res() res: Response) {
    const html = renderToString(
      React.createElement(
        StaticRouter,
        { location: req.url },
        React.createElement(App),
      ),
    );

    res.send(`
      <!DOCTYPE html>
      <html lang="ru">
      <head><meta charset="UTF-8"><title>News Portal - SSR</title></head>
      <body><div id="root">${html}</div><script src="/client.js"></script></body>
      </html>
    `);
  }
}
