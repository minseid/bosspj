import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const schedulesSnapshot = await adminDb
      .collection("schedules")
      .orderBy("createdAt", "desc")
      .get();

    const now = new Date();
    const schedules = [];
    const batch = adminDb.batch();

    for (const doc of schedulesSnapshot.docs) {
      const schedule = doc.data();
      const scheduleDate = new Date(schedule.createdAt);
      
      // 일간 보스는 생성일로부터 1일, 주간 보스는 7일이 지나면 삭제
      const expirationDays = schedule.type === "weekly" ? 7 : 1;
      const expirationDate = new Date(scheduleDate);
      expirationDate.setDate(expirationDate.getDate() + expirationDays);

      if (now > expirationDate) {
        // 기한이 지난 일정은 삭제
        batch.delete(doc.ref);
      } else {
        // 기한이 지나지 않은 일정만 반환
        schedules.push({
          id: doc.id,
          ...schedule,
        });
      }
    }

    // 기한이 지난 일정 삭제 실행
    await batch.commit();

    return NextResponse.json(schedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json(
      { error: "일정을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { scheduleTitle, bossName, days, startTime, type, userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }

    const scheduleData = {
      scheduleTitle,
      bossName,
      days,
      startTime,
      type,
      userId,
      createdAt: new Date().toISOString(),
      completed: false,
      participants: [],
    };

    const docRef = await adminDb.collection("schedules").add(scheduleData);

    return NextResponse.json({
      id: docRef.id,
      ...scheduleData,
    });
  } catch (error) {
    console.error("Error creating schedule:", error);
    return NextResponse.json(
      { error: "일정 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}