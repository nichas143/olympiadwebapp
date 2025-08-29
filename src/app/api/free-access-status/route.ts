import { NextResponse } from 'next/server';

export async function GET() {
  const freeAccess = process.env.FREE_ACCESS === 'true';
  
  return NextResponse.json({ 
    freeAccess,
    message: freeAccess ? 'Free access is enabled' : 'Free access is disabled'
  });
}
