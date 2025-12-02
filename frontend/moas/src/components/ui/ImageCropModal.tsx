/**
 * ImageCropModal Component
 *
 * Description:
 * 이미지를 4:3 비율로 크롭하는 모달 컴포넌트
 */

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

import { Button } from '@/components/ui/button';

// react-easy-crop 타입 정의
interface Point {
  x: number;
  y: number;
}

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageCropModalProps {
  imageSrc: string;
  onComplete: (croppedImage: Blob) => void;
  onCancel: () => void;
}

/**
 * 크롭 영역을 실제 이미지로 변환
 */
const createCroppedImage = async (
  imageSrc: string,
  pixelCrop: Area,
): Promise<Blob> => {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', reject);
    img.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  // 캔버스 크기를 크롭 영역 크기로 설정
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // 크롭된 부분을 캔버스에 그리기
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  // 캔버스를 Blob으로 변환
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      resolve(blob);
    }, 'image/jpeg');
  });
};

export function ImageCropModal({ imageSrc, onComplete, onCancel }: ImageCropModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleComplete = useCallback(async () => {
    if (!croppedAreaPixels) return;

    try {
      const croppedImage = await createCroppedImage(imageSrc, croppedAreaPixels);
      onComplete(croppedImage);
    } catch (error) {
      console.error('Failed to crop image:', error);
    }
  }, [imageSrc, croppedAreaPixels, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-3xl rounded-xl bg-white p-6">
        <h2 className="mb-4 text-[24px] font-bold text-moas-text">이미지 크롭</h2>

        {/* 크롭 영역 */}
        <div className="relative h-[400px] w-full overflow-hidden rounded-xl bg-gray-100">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={4 / 3}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* 줌 컨트롤 */}
        <div className="mt-6 px-4">
          <label className="mb-2 block text-[14px] font-medium text-moas-gray-6">
            확대/축소
          </label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* 버튼 영역 */}
        <div className="mt-6 flex justify-end gap-3">
          <Button
            onClick={onCancel}
            className="h-[48px] w-[120px] rounded-xl bg-moas-gray-3 text-[16px] font-bold text-moas-text hover:bg-moas-gray-4"
          >
            취소
          </Button>
          <Button
            onClick={handleComplete}
            className="h-[48px] w-[120px] rounded-xl bg-moas-main text-[16px] font-bold text-moas-text hover:bg-moas-main/90"
          >
            완료
          </Button>
        </div>
      </div>
    </div>
  );
}
