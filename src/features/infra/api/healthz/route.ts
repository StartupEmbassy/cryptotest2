/**
 * @fileoverview `/healthz` endpoint for CryptoPanel.
 * - Returns static health payload for monitoring.
 */
import { NextResponse } from 'next/server';

import { getRuntimeConfig } from '@/config';

export const GET = async () => {
  const runtime = getRuntimeConfig();
  return NextResponse.json(
    {
      status: 'ok',
      version: '0.1.0',
      time: new Date().toISOString(),
      env: runtime.runtimeEnv
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache'
      }
    }
  );
};
