// src/pages/admin/inquiry/Inquiry.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAdminInquiryList, searchAdminInquiries, getMemberDetail } from '@/api/admin/inquiry';
import type { AdminInquiryListItem } from '@/api/admin/inquiry';
import { InquiryHeader } from './components/InquiryHeader';
import { InquiryList } from './components/InquiryList';
import { Loader2 } from 'lucide-react';

type TabType = 'all' | 'pending' | 'answered';
type CategoryType = 'all' | 'MEMBER' | 'CONTRACT' | 'PAYMENT' | 'OTHERS';

interface InquiryWithMember extends AdminInquiryListItem {
  memberNickname?: string;
  profileImageUrl?: string;
}

export const Inquiry = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [_, setSearchKeyword] = useState('');
  const [allInquiries, setAllInquiries] = useState<InquiryWithMember[]>([]);
  const [filteredInquiries, setFilteredInquiries] = useState<InquiryWithMember[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    // 대시보드에서 전달된 상태 확인
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      // state 초기화
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    loadInquiries();
  }, [activeCategory]);

  useEffect(() => {
    filterInquiries();
  }, [activeTab, allInquiries, currentPage]);

  const loadInquiries = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const category = activeCategory === 'all' ? undefined : activeCategory;
      const data = await getAdminInquiryList(0, 100, category);

      // 각 문의의 회원 정보 조회
      const inquiriesWithMember = await Promise.all(
        data.content.map(async (inquiry) => {
          try {
            const memberData = await getMemberDetail(inquiry.memberId);
            return {
              ...inquiry,
              memberNickname: memberData.nickname,
              profileImageUrl: memberData.profileImageUrl,
            };
          } catch {
            return {
              ...inquiry,
              memberNickname: '알 수 없음',
              profileImageUrl: undefined,
            };
          }
        }),
      );

      setAllInquiries(inquiriesWithMember);
    } catch (err) {
      setError('문의 목록을 불러오는데 실패했습니다.');
      console.error('문의 목록 로드 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (keyword: string) => {
    if (!keyword.trim()) {
      setSearchKeyword('');
      loadInquiries();
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSearchKeyword(keyword);
      const category = activeCategory === 'all' ? undefined : activeCategory;
      const data = await searchAdminInquiries(keyword, 0, 100, category);

      const inquiriesWithMember = await Promise.all(
        data.content.map(async (inquiry) => {
          try {
            const memberData = await getMemberDetail(inquiry.memberId);
            return {
              ...inquiry,
              memberNickname: memberData.nickname,
              profileImageUrl: memberData.profileImageUrl,
            };
          } catch {
            return {
              ...inquiry,
              memberNickname: '알 수 없음',
              profileImageUrl: undefined,
            };
          }
        }),
      );

      setAllInquiries(inquiriesWithMember);
      setCurrentPage(1);
    } catch (err) {
      setError('검색에 실패했습니다.');
      console.error('검색 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterInquiries = () => {
    let filtered = [...allInquiries];

    if (activeTab === 'pending') {
      filtered = filtered.filter((inquiry) => inquiry.status === 'PENDING');
    } else if (activeTab === 'answered') {
      filtered = filtered.filter((inquiry) => inquiry.status === 'ANSWERED');
    }

    setFilteredInquiries(filtered);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: CategoryType) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  const handleInquiryClick = (inquiryId: number, profileImageUrl?: string) => {
    navigate(`/admin/inquiry/${inquiryId}`, { state: { profileImageUrl } });
  };

  const totalPages = Math.ceil(filteredInquiries.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentInquiries = filteredInquiries.slice(startIndex, endIndex);

  const getCounts = () => {
    return {
      all: allInquiries.length,
      pending: allInquiries.filter((i) => i.status === 'PENDING').length,
      answered: allInquiries.filter((i) => i.status === 'ANSWERED').length,
    };
  };

  return (
    <div className="p-8 font-pretendard">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">이용 문의</h1>
      </div>

      <InquiryHeader
        activeTab={activeTab}
        activeCategory={activeCategory}
        onTabChange={handleTabChange}
        onCategoryChange={handleCategoryChange}
        onSearch={handleSearch}
        counts={getCounts()}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">문의 목록을 불러오는 중...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <InquiryList
          inquiries={currentInquiries}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onInquiryClick={handleInquiryClick}
        />
      )}
    </div>
  );
};
