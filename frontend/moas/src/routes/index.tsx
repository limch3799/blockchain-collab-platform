// src/routes/index.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';

// 기존 페이지 임포트
import ApplicantListPage from '@/pages/applicant-list/ApplicantListPage';
import ArtistProjectList from '@/pages/artist-project-list/ArtistProjectList';
import { ChatLayout } from '@/components/layout';
import { ChatPage } from '@/pages/chat';
import ContractDraftPage from '@/pages/contract-draft/ContractDraftPage';
import ContractList from '@/pages/contract-list/ContractList';
import ContractViewPage from '@/pages/contract-view/ContractViewPage';
import HelpPage from '@/pages/help/HelpPage';
import Home from '@/pages/home/Home';
import InquiryDetail from '@/pages/help/InquiryDetail';
import InquiryEdit from '@/pages/help/InquiryEdit';
import LeaderProjectEdit from '@/pages/leader-project-edit/LeaderProjectEdit';
import LeaderProjectList from '@/pages/leader-project-list/LeaderProjectList';
import LeaderProjectPost from '@/pages/leader-project-post/LeaderProjectPost';
import { MainLayout } from '@/components/layout/MainLayout';
import { MyAccountPage } from '@/pages/my-account';
import { AccountSection, MainAccountSection, MyReviewsSection } from '@/pages/my-account/sections';
import MyBookmark from '@/pages/project-post/MyBookmark';
import MyPortfolio from '@/pages/portfolio/my-portfolio/MyPortfolio';
import NotFound from '@/pages/NotFound.tsx';
import PaymentSuccessPage from '@/pages/payment/PaymentSuccessPage';
import PaymentFailPage from '@/pages/payment/PaymentFailPage';
import PortfolioEditor from '@/pages/portfolio/portfolio-editor/PortfolioEditor';
import { ProfilePage } from '@/pages/profile';
import ProjectPostDetail from '@/pages/project-post-detail/ProjectPostDetail';
import ProjectPostMain from '@/pages/project-post/ProjectPostMain';
import { ProjectApplyPage } from '@/pages/project-apply/ProjectApplyPage';
import SelectRole from '@/pages/sign-up/SelectRole';
import SetupMyProfile from '@/pages/sign-up/SetupMyProfile';

// 관리자 페이지 임포트
import AdminLayout from '@/components/layout/AdminLayout';
import AdminLogin from '@/pages/admin/login/AdminLogin';
import AdminSignup from '@/pages/admin/login/AdminSignup';
import Dashboard from '@/pages/admin/dashboard/Dashboard';
import { Users } from '@/pages/admin/user/Users';
import { ProjectPost } from '@/pages/admin/projectPost/ProjectPost';
import { Settlement } from '@/pages/admin/settlement/Settlement';
import { Analytics } from '@/pages/admin/analytics/Analytics';
import { Settings } from '@/pages/admin/settings/Settings';
import { Portfolio } from '@/pages/admin/portfolio/Portfolio';
import { Inquiry } from '@/pages/admin/inquiry/Inquiry';
import { Contract } from '@/pages/admin/contract/Contract.tsx';
import AdminProtectedRoute from '@/pages/admin/components/AdminProtectedRoute';
import { InquiryDetailPage } from '@/pages/admin/inquiry/components/InquiryDetailPage';

export const router = createBrowserRouter([
  // 기존 사용자 라우트
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },
      { path: 'project-post', element: <ProjectPostMain /> },
      { path: 'project-post/:id', element: <ProjectPostDetail /> },
      { path: 'leader-project-list', element: <LeaderProjectList /> },
      { path: 'artist-project-list', element: <ArtistProjectList /> },
      { path: 'my-portfolio', element: <MyPortfolio /> },
      { path: 'write-portfolio', element: <PortfolioEditor /> },
      { path: 'my-bookmark', element: <MyBookmark /> },
      { path: 'leader-project-edit/:id', element: <LeaderProjectEdit /> },
      { path: 'leader-project-post', element: <LeaderProjectPost /> },
      { path: 'profile/:id', element: <ProfilePage /> },
      {
        path: 'my-account',
        element: <MyAccountPage />,
        children: [
          { index: true, element: <MainAccountSection /> },
          { path: 'account', element: <AccountSection /> },
          { path: 'canceled-contracts', element: <AccountSection /> },
          { path: 'reviews', element: <MyReviewsSection /> },
        ],
      },
      { path: 'help', element: <HelpPage /> },
      { path: 'applicant-list', element: <ApplicantListPage /> },
      { path: 'contract/:contractId', element: <ContractViewPage /> },
      { path: 'contract-draft', element: <ContractDraftPage /> },
      { path: 'contract-list', element: <ContractList /> },
      { path: 'project-apply', element: <ProjectApplyPage /> },
      { path: 'payment-success', element: <PaymentSuccessPage /> },
      { path: 'payment-fail', element: <PaymentFailPage /> },
      { path: 'select-role', element: <SelectRole /> },
      { path: 'setup-profile', element: <SetupMyProfile /> },
      { path: 'inquiry-edit', element: <InquiryEdit /> },
      { path: 'inquiry/:inquiryId', element: <InquiryDetail /> },
      {
        path: '/write-portfolio/:portfolioId',
        element: <PortfolioEditor />,
      },
    ],
  },

  // 채팅
  {
    path: '/chat',
    element: <ChatLayout />,
    children: [{ index: true, element: <ChatPage /> }],
  },

  // 관리자 로그인 라우트
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },

  // 관리자 회원가입 라우트
  {
    path: '/admin/signup',
    element: <AdminSignup />,
  },

  // 관리자 대시보드 라우트
  {
    path: '/admin',
    element: (
      <AdminProtectedRoute>
        <AdminLayout />
      </AdminProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'users',
        element: <Users />,
      },
      {
        path: 'project',
        element: <ProjectPost />,
      },
      {
        path: 'settlement',
        element: <Settlement />,
      },
      {
        path: 'analytics',
        element: <Analytics />,
      },
      {
        path: 'portfolio',
        element: <Portfolio />,
      },
      {
        path: 'inquiry',
        element: <Inquiry />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: 'contract',
        element: <Contract />,
      },
      {
        path: 'inquiry/:inquiryId',
        element: <InquiryDetailPage />,
      },
    ],
  },
]);
