"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedLayout from "@/components/ProtectedLayout";
import { useAuth } from "@/context/AuthContext";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Image from "next/image";

export default function SettingsPage() {
  const router = useRouter();
  const { user, nickname, profileImageUrl, loading: authLoading, setUser } = useAuth();

  const [currentNickname, setCurrentNickname] = useState(nickname || "");
  const [newProfileImage, setNewProfileImage] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(profileImageUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    setCurrentNickname(nickname || "");
    setPreviewImageUrl(profileImageUrl);
  }, [user, nickname, profileImageUrl, authLoading, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewProfileImage(file);
      setPreviewImageUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError("");
    setSuccess("");

    let updatedProfileImageUrl = profileImageUrl;

    try {
      if (newProfileImage) {
        const storageRef = ref(storage, `profile_images/${user.uid}/${newProfileImage.name}`);
        const snapshot = await uploadBytes(storageRef, newProfileImage);
        updatedProfileImageUrl = await getDownloadURL(snapshot.ref);
      }

      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
          nickname: currentNickname,
          profileImageUrl: updatedProfileImageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("프로필 업데이트에 실패했습니다.");
      }

      // Update AuthContext with new data
      setUser(user, currentNickname, updatedProfileImageUrl);

      setSuccess("프로필이 성공적으로 업데이트되었습니다.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "프로필 업데이트 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">오류: {error}</div>;
  }

  return (
    <ProtectedLayout>
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold mb-8">설정</h1>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">프로필 이미지</label>
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {previewImageUrl ? (
                    <Image src={previewImageUrl} alt="Profile" width={80} height={80} className="object-cover" />
                  ) : (
                    <span className="text-gray-500">업로드</span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
              </div>
            </div>

            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">닉네임</label>
              <input
                type="text"
                id="nickname"
                value={currentNickname}
                onChange={(e) => setCurrentNickname(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {success && <p className="text-green-500 text-sm mt-4">{success}</p>}
            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? "저장 중..." : "프로필 저장"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </ProtectedLayout>
  );
} 