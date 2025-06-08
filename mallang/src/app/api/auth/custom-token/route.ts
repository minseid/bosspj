import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { nickname } = await request.json();

    if (!nickname) {
      return NextResponse.json(
        { error: '닉네임이 필요합니다.' },
        { status: 400 }
      );
    }

    // 커스텀 토큰 생성
    const customToken = await adminAuth.createCustomToken(nickname);

    return NextResponse.json({ customToken });
  } catch (error) {
    console.error('커스텀 토큰 생성 중 오류 발생:', error);
    return NextResponse.json(
      { error: '커스텀 토큰 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 