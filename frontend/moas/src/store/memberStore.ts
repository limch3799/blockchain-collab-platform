// store/memberStore.ts
import { create } from 'zustand';

import { getMemberMe } from '@/api/auth';
import type { MemberMeResponse } from '@/types/member';

interface MemberState {
  memberInfo: MemberMeResponse | null;
  fetchMemberInfo: () => Promise<void>;
}

export const useMemberStore = create<MemberState>((set) => ({
  memberInfo: null,

  fetchMemberInfo: async () => {
    const response = await getMemberMe();
    set({ memberInfo: response });
  },
}));
