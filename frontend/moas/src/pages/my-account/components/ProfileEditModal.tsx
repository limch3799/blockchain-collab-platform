import React, { useState, useRef } from 'react';
import { X, Pencil } from 'lucide-react';

import { Button, Input } from '@/components/ui';
import apiClient from '@/api/axios';

import DefaultProfileImage1 from '@/assets/header/default_profile/default_profile_1.png';

interface ProfileEditModalProps {
  isOpen: boolean;
  initialData: {
    nickname: string;
    biography: string;
    phoneNumber: string;
    profileImageUrl: string | null;
  };
  onClose: () => void;
  onSave: (data: {
    nickname: string;
    biography: string;
    phoneNumber: string;
    profileImageUrl: string | null;
  }) => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  initialData,
  onClose,
  onSave,
}) => {
  const [nickname, setNickname] = useState<string>(initialData?.nickname || '');
  const [biography, setBiography] = useState<string>(initialData?.biography || '');
  const [phoneNumber, setPhoneNumber] = useState<string>(initialData?.phoneNumber || '');
  const [profileImageUrl, setProfileImageUrl] = useState(initialData?.profileImageUrl);
  const [uploading, setUploading] = useState<boolean>(false);

  // ?
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // ?
  const handleImageClick = () => fileInputRef.current?.click();

  // TODO: API 연동
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Simulate S3 upload
    setUploading(true);
    const imageUrl = URL.createObjectURL(file);
    // setProfileImageUrl(imageUrl);
    setTimeout(() => {
      setProfileImageUrl(imageUrl); // preview instead of actual upload
      setUploading(false);
    }, 2000);
  };

  const handleSave = async () => {
    // mock API call
    const body = {
      nickname,
      biography,
      phoneNumber,
      profileImageUrl,
    };

    // // simulate API delay
    // await new Promise((res) => setTimeout(res, 3000)); // simulate delay

    try {
      await apiClient.patch('/members/me', body);

      alert('프로필이 저장되었습니다!');
      onSave(body);
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  // TODO: fix 'close' button's lower left quarter cursor problem
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      {/*<div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">*/}
      <div className="bg-white rounded-2xl w-[400px] p-6 relative shadow-lg">
        {/* <div className="bg-white rounded-2xl shadow-xl w-[420px] p-8 relative"> */}
        {/* Close button */}
        <button
          className="absolute top-4 right-4 p-4 -m-4 text-gray-400 hover:text-gray-600 cursor-pointer"
          // className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer
          //    before:content-[''] before:absolute before:inset-[-16px] before:block before:pointer-events-auto"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        {/* Profile Image */}
        <div className="flex flex-col items-center space-y-3 mb-6 relative">
          <div className="relative">
            <img
              src={profileImageUrl || DefaultProfileImage1}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover cursor-pointer"
              onClick={handleImageClick}
            />
            {/* Edit icon */}
            {/* <label
              htmlFor="profileImageInput"
              className="absolute bottom-0 right-0 bg-gray-700 text-white p-1 rounded-full cursor-pointer text-xs hover:bg-gray-800"
            >
              ✎
            </label> */}
            <div
              className="absolute bottom-2 right-0 bg-yellow-400 p-1 rounded-full cursor-pointer hover:bg-yellow-500"
              onClick={handleImageClick}
            >
              <Pencil size={14} className="text-white" />
            </div>
          </div>
          <input
            ref={fileInputRef}
            // id="profileImageInput"
            type="file"
            accept="image/*"
            className="hidden"
            style={{ borderColor: 'red', borderWidth: 5 }}
            onChange={handleFileChange}
          />
        </div>

        {/* 닉네임 */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">닉네임</label>
          <Input
            value={nickname}
            placeholder="닉네임을 입력하세요"
            onChange={(e) => setNickname(e.target.value.slice(0, 10))}
          />
          <p className="text-xs text-gray-400 text-right mt-1">{nickname.length}/10</p>
        </div>

        {/* 자기소개 */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">자기소개</label>
          {/* <Textarea
            value={biography}
            onChange={e => setBiography(e.target.value.slice(0, 200))}
            placeholder="소개글을 입력하세요"
          /> */}
          <textarea
            value={biography}
            onChange={(e) => setBiography(e.target.value.slice(0, 200))}
            placeholder="소개글을 입력하세요"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 resize-none h-24 focus:outline-none focus:ring focus:ring-yellow-300"
          />
          <p className="text-xs text-gray-400 text-right mt-1">{biography.length}/200</p>
        </div>

        {/* 전화번호 */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">전화번호</label>
          <Input
            value={phoneNumber}
            placeholder="전화번호를 입력하세요"
            onChange={(e) => setPhoneNumber(e.target.value.slice(0, 13))}
          />
          {/* <p className="text-xs text-gray-400 text-right mt-1">{phoneNumber.length}/11</p> */}
        </div>

        {/* Save button */}
        <Button
          disabled={uploading}
          className="w-full bg-yellow-400 hover:bg-yellow-500 cursor-pointer"
          onClick={handleSave}
        >
          {uploading ? '업로드 중...' : '저장'}
        </Button>
      </div>
    </div>
  );
};

export default ProfileEditModal;
