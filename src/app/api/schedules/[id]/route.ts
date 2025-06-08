import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import * as admin from 'firebase-admin';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "일정 ID가 필요합니다." }, { status: 400 });
    }

    const scheduleRef = adminDb.collection("schedules").doc(id);
    const scheduleDoc = await scheduleRef.get();

    if (!scheduleDoc.exists) {
      return NextResponse.json({ error: "일정을 찾을 수 없습니다." }, { status: 404 });
    }

    const scheduleData = scheduleDoc.data();
    const participants = scheduleData?.participants || [];

    // Fetch nicknames for participants
    const participantDetails = await Promise.all(
      participants.map(async (uid: string) => {
        const userDocRef = adminDb.collection("users").doc(uid);
        const userDocSnap = await userDocRef.get();
        if (userDocSnap.exists) {
          const userData = userDocSnap.data();
          return { uid, nickname: userData?.nickname || "알 수 없음" };
        }
        return { uid, nickname: "알 수 없음" };
      })
    );

    return NextResponse.json({ 
      id: scheduleDoc.id, 
      ...scheduleData,
      participants: participantDetails
    });
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return NextResponse.json(
      { error: "일정을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { action, userId } = body; // action will be 'join' or 'leave'

        if (!id) {
            return NextResponse.json({ error: "일정 ID가 필요합니다." }, { status: 400 });
        }

        if (!userId) {
            return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
        }

        const scheduleRef = adminDb.collection("schedules").doc(id);
        const scheduleDoc = await scheduleRef.get();

        if (!scheduleDoc.exists) {
            return NextResponse.json({ error: "일정을 찾을 수 없습니다." }, { status: 404 });
        }

        let updateData: { participants?: admin.firestore.FieldValue };

        if (action === 'join') {
            updateData = {
                participants: admin.firestore.FieldValue.arrayUnion(userId)
            };
        } else if (action === 'leave') {
            updateData = {
                participants: admin.firestore.FieldValue.arrayRemove(userId)
            };
        } else {
            return NextResponse.json({ error: "잘못된 액션입니다. 'join' 또는 'leave'여야 합니다." }, { status: 400 });
        }

        await scheduleRef.update(updateData);

        return NextResponse.json({ message: "일정 참가 상태가 업데이트되었습니다." });
    } catch (error) {
        console.error("Error updating schedule participation:", error);
        return NextResponse.json(
            { error: "일정 참가 상태 업데이트 중 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId } = body;

    if (!id) {
      return NextResponse.json({ error: "일정 ID가 필요합니다." }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
    }

    const scheduleRef = adminDb.collection("schedules").doc(id);
    const scheduleDoc = await scheduleRef.get();

    if (!scheduleDoc.exists) {
      return NextResponse.json({ error: "일정을 찾을 수 없습니다." }, { status: 404 });
    }

    if (scheduleDoc.data()?.userId !== userId) {
      return NextResponse.json({ error: "이 일정을 삭제할 권한이 없습니다." }, { status: 403 });
    }

    await scheduleRef.delete();

    return NextResponse.json({ message: "일정이 성공적으로 삭제되었습니다." });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json(
      { error: "일정 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}