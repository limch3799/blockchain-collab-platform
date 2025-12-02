// src/pages/project-post/bookmarkUtils.ts

const BOOKMARK_STORAGE_KEY = 'bookmarkedProjects';

/**
 * 로컬스토리지에 북마크 목록 저장
 */
export const saveBookmarksToStorage = (projectIds: number[]): void => {
  localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(projectIds));
};

/**
 * 로컬스토리지에서 북마크 목록 조회
 */
export const getBookmarksFromStorage = (): number[] => {
  const stored = localStorage.getItem(BOOKMARK_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

/**
 * 특정 프로젝트가 북마크되어 있는지 확인
 */
export const isProjectBookmarked = (projectId: number): boolean => {
  const bookmarks = getBookmarksFromStorage();
  return bookmarks.includes(projectId);
};

/**
 * 북마크 추가 (로컬스토리지)
 */
export const addBookmarkToStorage = (projectId: number): void => {
  const bookmarks = getBookmarksFromStorage();
  if (!bookmarks.includes(projectId)) {
    bookmarks.push(projectId);
    saveBookmarksToStorage(bookmarks);
  }
};

/**
 * 북마크 제거 (로컬스토리지)
 */
export const removeBookmarkFromStorage = (projectId: number): void => {
  const bookmarks = getBookmarksFromStorage();
  const filtered = bookmarks.filter(id => id !== projectId);
  saveBookmarksToStorage(filtered);
};

/**
 * 북마크 목록 초기화
 */
export const clearBookmarksFromStorage = (): void => {
  localStorage.removeItem(BOOKMARK_STORAGE_KEY);
};