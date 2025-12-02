// src/api/bookmark.ts

import apiClient from './axios';

export interface BookmarkResponse {
  memberId: number;
  projectId: number;
  createdAt: string;
}

/**
 * 북마크 등록
 */
export const addBookmark = async (projectId: number): Promise<BookmarkResponse> => {
  console.log('🔵 북마크 등록 API 호출:', projectId);
  try {
    const response = await apiClient.post<BookmarkResponse>(`/projects/${projectId}/bookmarks`);
    console.log('✅ 북마크 등록 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ 북마크 등록 실패:', error);
    throw error;
  }
};

/**
 * 북마크 해제
 */
export const removeBookmark = async (projectId: number): Promise<void> => {
  console.log('🔴 북마크 해제 API 호출:', projectId);
  try {
    await apiClient.delete(`/projects/${projectId}/bookmarks`);
    console.log('✅ 북마크 해제 성공:', projectId);
  } catch (error) {
    console.error('❌ 북마크 해제 실패:', error);
    throw error;
  }
};

/**
 * 내 북마크 목록 조회 (프로젝트 ID 배열만)
 */
export const getMyBookmarks = async (): Promise<number[]> => {
  // console.log('📋 북마크 목록 조회 API 호출');
  try {
    const response = await apiClient.get('/projects', {
      params: {
        bookmarked: true,
        size: 10,
      },
    });
    const projectIds = response.data.items.map((item: { id: number }) => item.id);
    // console.log('✅ 북마크 목록 조회 성공:', projectIds);
    return projectIds;
  } catch (error) {
    console.error('❌ 북마크 목록 조회 실패:', error);
    throw error;
  }
};
