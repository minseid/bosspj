"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedLayout from "@/components/ProtectedLayout";
import { useAuth } from "@/context/AuthContext";
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

export default function SchedulePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSchedules = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/schedules`);
      if (!response.ok) {
        throw new Error("일정을 불러오는데 실패했습니다.");
      }
      const data = await response.json();
      const participatedSchedules = data.filter((s: Schedule) => s.participants && s.participants.includes(user.uid));
      setSchedules(participatedSchedules);
    } catch (err) {
      setError(err instanceof Error ? err.message : "일정을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    fetchSchedules();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">오류: {error}</div>;
  }

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">일정</h1>
          {/* 여기에 일정 목록을 표시하는 코드를 추가할 예정입니다 */}
          {/* Header */}
          <header className="flex items-center p-4 bg-white shadow-sm">
            <button className="mr-4">
              <Image src="/arrow-left.svg" alt="Back" width={24} height={24} /> {/* Placeholder for back icon */}
            </button>
            <h1 className="text-xl font-bold">My Schedule</h1>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">내 일정</h1>
            </div>

            {schedules.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                참가한 일정이 없습니다.
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
        </div>
      </div>
    </ProtectedLayout>
  );
} 