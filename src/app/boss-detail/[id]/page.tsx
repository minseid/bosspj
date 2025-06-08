"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProtectedLayout from "@/components/ProtectedLayout";

interface Schedule {
  id: string;
  scheduleTitle: string;
  bossName: string;
  days: string[];
  startTime: string;
  type: "daily" | "weekly";
  completed: boolean;
  userId: string;
  participants: { uid: string; nickname: string }[];
}

export default function BossDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user, loading: authLoading, nickname } = useAuth();
  const [id, setId] = useState<string>("");
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // params를 Promise로 처리
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (authLoading || !id) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchSchedule = async () => {
      try {
        const response = await fetch(`/api/schedules/${id}`);
        if (!response.ok) {
          throw new Error("일정을 불러오는데 실패했습니다.");
        }
        const data = await response.json();
        setSchedule({ ...data, participants: data.participants || [] });
      } catch (err) {
        setError(err instanceof Error ? err.message : "일정을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [id, user, authLoading, router]);

  const handleToggleParticipation = async () => {
    if (!user || !schedule) return;

    const isParticipatingNow = schedule.participants && Array.isArray(schedule.participants) && schedule.participants.some(p => p.uid === user.uid);
    const action = isParticipatingNow ? "leave" : "join";

    try {
      const response = await fetch(`/api/schedules/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, userId: user.uid }),
      });

      if (!response.ok) {
        throw new Error("참가 상태 업데이트에 실패했습니다.");
      }

      setSchedule(prev => {
        if (!prev) return null;
        const newParticipants = action === "join"
          ? [...(prev.participants || []), { uid: user.uid, nickname: nickname || user.uid }]
          : (prev.participants || []).filter(p => p.uid !== user.uid);
        return { ...prev, participants: newParticipants };
      });
      alert(`일정 참가 상태가 ${action === "join" ? "참가" : "불참"}으로 변경되었습니다.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "참가 상태 업데이트 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!user || !schedule) return;
    if (!window.confirm("정말 이 일정을 삭제하시겠습니까?")) {
      return;
    }

    try {
      if (schedule.userId !== user.uid) {
          setError("이 일정을 삭제할 권한이 없습니다.");
          return;
      }

      const response = await fetch(`/api/schedules/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.uid }),
      });

      if (!response.ok) {
        throw new Error("일정 삭제에 실패했습니다.");
      }

      alert("일정이 성공적으로 삭제되었습니다.");
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "일정 삭제 중 오류가 발생했습니다.");
    }
  };

  if (authLoading || loading || !id) {
    return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">오류: {error}</div>;
  }

  if (!schedule) {
    return <div className="text-center py-8 text-gray-500">일정을 찾을 수 없습니다.</div>;
  }

  // Calculate isParticipating here, after schedule is confirmed to be non-null
  const isParticipating = user && schedule.participants && Array.isArray(schedule.participants) && schedule.participants.some(p => p.uid === user.uid);

  return (
    <ProtectedLayout>
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">{schedule.scheduleTitle}</h1>
            <button
              onClick={() => router.back()}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
            >
              뒤로가기
            </button>
          </div>

          <div className="text-gray-700 mb-6">
            <p className="mb-2"><strong>보스 이름:</strong> {schedule.bossName}</p>
            <p className="mb-2"><strong>보스 유형:</strong> {schedule.type === "weekly" ? "주간 보스" : "일간 보스"}</p>
            <p className="mb-2"><strong>요일:</strong> {schedule.days.join(", ")}</p>
            <p className="mb-2"><strong>시작 시간:</strong> {schedule.startTime}</p>
          </div>

          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-bold mb-3">참여 인원 ({schedule.participants?.length || 0}명)</h3>
            {schedule.participants && schedule.participants.length > 0 ? (
              <ul>
                {schedule.participants.map((participant) => (
                  <li key={participant.uid} className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 text-xs font-semibold mr-2">
                      {participant.nickname.substring(0, 2).toUpperCase()}
                    </div>
                    <p className="text-sm">{participant.nickname}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">아직 참가자가 없습니다.</p>
            )}
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={handleToggleParticipation}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isParticipating ? "bg-gray-500 hover:bg-gray-600" : "bg-green-500 hover:bg-green-600"
              } text-white`}
            >
              {isParticipating ? "불참" : "참가"}
            </button>

            {schedule.userId === user?.uid && (
                <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                삭제
                </button>
            )}
          </div>
        </div>
      </main>
    </ProtectedLayout>
  );
}