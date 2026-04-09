declare const __APP_VERSION__: string

export function GET() {
  return Response.json({ version: __APP_VERSION__ })
}
