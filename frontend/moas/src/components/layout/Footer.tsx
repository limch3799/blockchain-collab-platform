import LogoGray from '@/assets/footer/gray_logo.png';

export function Footer() {
  return (
    <footer className="border-t border-gray-300 mt-auto font-pretendard">
      <div className="mx-auto py-12 w-[80%]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 로고 및 소개 */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-start gap-4 mb-4">
              <img src={LogoGray} alt="MOAS Logo" className="h-16 w-auto" />
              <div className="flex flex-col justify-center">
                <h3 className="text-3xl font-bold text-moas-gray-4 pt-2">Team S401</h3>
                <p className="text-sm text-moas-gray-4">
                  Blockchain-based Collaboration Matching Platform
                </p>
              </div>
            </div>
            <p className="text-base text-moas-gray-4 leading-relaxed">
              Web3Auth&블록체인 기반 프로젝트 협업 플랫폼입니다. <br></br>
              아티스트와 리더가 만나 투명하고 안전한 계약으로 창의적인 프로젝트를 완성해보세요.
            </p>
          </div>

          {/* 링크 및 문의 */}
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-moas-gray-2 mb-3">MOAS 모아스</h4>
              <ul className="space-y-2 text-sm text-moas-gray-2">
                <li>.</li>
                <li>.</li>
                <li>.</li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-moas-gray-2 mb-3">.</h4>
              <div className="px-4 py-2  text-moas-gray-2 rounded-md text-sm inline-block">.</div>
            </div>
          </div>
        </div>

        {/* 하단 정보 */}
        <div className="mt-0 pt-6 ">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-base text-moas-gray-2">
            <p>© 2025 MOAS. All rights reserved.</p>
            <div className="flex gap-6">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
