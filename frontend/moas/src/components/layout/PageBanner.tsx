import pageBannerImage from '@/assets/pageBanner1.png';

export function PageBanner() {
  return (
    <div className="-mt-4 w-full h-[108px] flex justify-center items-center overflow-hidden">
      <img
        src={pageBannerImage}
        alt="Page Banner"
        className="w-full h-full object-cover rounded-2xl"
      />
    </div>
  );
}
