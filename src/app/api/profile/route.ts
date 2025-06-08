import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { userId, nickname, profileImageUrl } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }

    const userRef = adminDb.collection("users").doc(userId);
    const updateData: { nickname?: string; profileImageUrl?: string } = {};

    if (nickname !== undefined) {
      updateData.nickname = nickname;
    }
    if (profileImageUrl !== undefined) {
      updateData.profileImageUrl = profileImageUrl;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "업데이트할 데이터가 없습니다." },
        { status: 400 }
      );
    }

    await userRef.update(updateData);

    return NextResponse.json({ message: "프로필이 성공적으로 업데이트되었습니다." });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "프로필 업데이트 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 