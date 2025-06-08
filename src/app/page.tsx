"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProtectedLayout from "@/components/ProtectedLayout";
import Image from "next/image";

interface Schedule {
  id: string;
  scheduleTitle: string;
  bossName: string;
  days: string[];
  startTime: string;
  type: "daily" | "weekly";
  completed: boolean;
  userId: string;
  participants: string[];
}

export default function Home() {
  const router = useRouter();
  const { user, nickname, profileImageUrl, loading: authLoading } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchSchedules = async () => {
      if (!user) return;

      try {
        const response = await fetch(`/api/schedules`);
        if (!response.ok) {
          throw new Error("일정을 불러오는데 실패했습니다.");
        }
        const data = await response.json();
        setSchedules(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "일정을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoadingSchedules(false);
      }
    };

    if (user) {
      fetchSchedules();
    }
  }, [user]);

  if (authLoading || loadingSchedules) {
    return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">오류: {error}</div>;
  }

  return (
    <ProtectedLayout>
      <header className="flex items-center p-4 bg-white shadow-sm">
        <div className="w-16 h-16 rounded-full mr-4 overflow-hidden flex items-center justify-center bg-gray-300">
          {profileImageUrl ? (
            <Image 
              src={profileImageUrl} 
              alt="Profile" 
              width={64} 
              height={64} 
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-gray-500 text-xs">No Image</span>
          )}
        </div>
        <div>
          <p className="text-lg font-semibold">{nickname || "말랑길드"}</p>
          <p className="text-sm text-gray-500">화이팅</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">보스 일정</h1>
          <button
            onClick={() => router.push("/create-boss-schedule")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            일정 추가
          </button>
        </div>

        {error && (
          <div className="text-red-500 mb-4">{error}</div>
        )}

        {schedules.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            등록된 일정이 없습니다. 일정을 추가해보세요!
          </div>
        ) : (
          <div className="grid gap-4">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/boss-detail/${schedule.id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                      schedule.type === "weekly" ? "bg-purple-100 text-purple-800" : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {schedule.type === "weekly" ? "주간 보스" : "일간 보스"}
                    </span>
                    <h2 className="text-xl font-bold mt-2">{schedule.scheduleTitle}</h2>
                  </div>
                  <span className={`text-2xl ${schedule.participants && schedule.participants.includes(user?.uid || '') ? "text-green-500" : "text-gray-300"}`}>
                    {schedule.participants && schedule.participants.includes(user?.uid || '') ? "✓" : "○"}
                  </span>
                </div>
                <div className="text-gray-600">
                  <p className="mb-2">보스: {schedule.bossName}</p>
                  <p>요일: {schedule.days.join(", ")}</p>
                  <p>시간: {schedule.startTime}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </ProtectedLayout>
  );
}
