import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    const { nickname, password } = await request.json();

    if (!nickname || !password) {
      return NextResponse.json(
        { error: "닉네임과 비밀번호가 필요합니다." },
        { status: 400 }
      );
    }

    // 사용자 정보 확인
    const usersRef = adminDb.collection("users");
    const snapshot = await usersRef
      .where("nickname", "==", nickname)
      .where("password", "==", password)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        { error: "닉네임 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    // 커스텀 토큰 생성
    const customToken = await adminAuth.createCustomToken(nickname);

    return NextResponse.json({ customToken });
  } catch (error) {
    console.error("로그인 중 오류 발생:", error);
    return NextResponse.json(
      { error: "로그인 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 