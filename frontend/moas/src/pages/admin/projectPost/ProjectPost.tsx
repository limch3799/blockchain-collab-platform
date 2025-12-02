// src/pages/admin/projectPost/ProjectPost.tsx
import { useState } from 'react';
import { AllProjects } from './components/AllProjects';
import { SearchProjects } from './components/SearchProjects';
import { ProjectStatistics } from './components/ProjectStatsView';
import { AllApplications } from './components/AllApplications';
import { SearchApplications } from './components/SearchApplications';

type MainTab = 'announcement' | 'application';
type AnnouncementTab = 'all' | 'search' | 'statistics';
type ApplicationTab = 'all' | 'search';

export const ProjectPost = () => {
  const [mainTab, setMainTab] = useState<MainTab>('announcement');
  const [announcementTab, setAnnouncementTab] = useState<AnnouncementTab>('all');
  const [applicationTab, setApplicationTab] = useState<ApplicationTab>('all');

  const mainTabs = [
    { id: 'announcement' as MainTab, label: '프로젝트 공고' },
    { id: 'application' as MainTab, label: '프로젝트 지원' },
  ];

  const announcementTabs = [
    { id: 'all' as AnnouncementTab, label: '전체' },
    { id: 'search' as AnnouncementTab, label: '프로젝트 검색' },
    { id: 'statistics' as AnnouncementTab, label: '통계' },
  ];

  const applicationTabs = [
    { id: 'all' as ApplicationTab, label: '전체' },
    { id: 'search' as ApplicationTab, label: '검색' },
  ];

  return (
    <div className="p-8 font-pretendard">
      {/* 메인 탭 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4">
          {mainTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setMainTab(tab.id);
                if (tab.id === 'announcement') {
                  setAnnouncementTab('all');
                } else {
                  setApplicationTab('all');
                }
              }}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                mainTab === tab.id
                  ? 'bg-moas-navy2 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 서브 탭 */}
      {mainTab === 'announcement' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3">
            {announcementTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setAnnouncementTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  announcementTab === tab.id
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {mainTab === 'application' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3">
            {applicationTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setApplicationTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  applicationTab === tab.id
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 컨텐츠 */}
      {mainTab === 'announcement' && (
        <>
          {announcementTab === 'all' && <AllProjects />}
          {announcementTab === 'search' && <SearchProjects />}
          {announcementTab === 'statistics' && <ProjectStatistics />}
        </>
      )}

      {mainTab === 'application' && (
        <>
          {applicationTab === 'all' && <AllApplications />}
          {applicationTab === 'search' && <SearchApplications />}
        </>
      )}
    </div>
  );
};
