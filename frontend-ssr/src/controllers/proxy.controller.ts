import { All, Controller, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import axios from 'axios';

@Controller('api')
export class ProxyController {
  @All('*')
  async proxy(@Req() req: Request, @Res() res: Response) {
    try {
      const response = await axios({
        method: req.method,
        url: `http://localhost:3001${req.url}`,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: req.body,
        headers: req.headers,
      });
      res.status(response.status).json(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        res.status(err.response.status).json(err.response.data);
      }
    }
  }
}
