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

    // 닉네임 중복 확인
    const usersRef = adminDb.collection("users");
    const snapshot = await usersRef.where("nickname", "==", nickname).get();

    if (!snapshot.empty) {
      return NextResponse.json(
        { error: "이미 사용 중인 닉네임입니다." },
        { status: 400 }
      );
    }

    // 커스텀 토큰 생성 (여기서 닉네임이 Firebase Auth UID가 됩니다)
    const customToken = await adminAuth.createCustomToken(nickname);

    // 사용자 정보 저장 (Firestore 문서 ID를 닉네임으로 설정)
    await usersRef.doc(nickname).set({
      nickname,
      // 실제 프로덕션에서는 비밀번호를 해시화하여 저장해야 합니다.
      // 여기서는 예시를 위해 그대로 저장합니다.
      password, 
      createdAt: new Date(),
      profileImageUrl: null, // 프로필 이미지 URL 초기화
    }, { merge: true }); // merge: true를 사용하여 기존 문서가 있더라도 데이터를 병합합니다.

    return NextResponse.json({ customToken });
  } catch (error) {
    console.error("회원가입 중 오류 발생:", error);
    return NextResponse.json(
      { error: "회원가입 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 