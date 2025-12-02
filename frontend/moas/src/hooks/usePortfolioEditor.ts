// src/hooks/usePortfolioEditor.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPortfolio, updatePortfolio, getPortfolioById } from '@/api/portfolio';
import type { CreatePortfolioRequest, EditPortfolioRequest, PortfolioImage, PortfolioFile } from '@/types/portfolio';

interface ExistingImage extends PortfolioImage {
  isExisting: true;
}

interface ExistingFile extends PortfolioFile {
  isExisting: true;
}

interface NewImage {
  id: string;
  file: File;
  preview: string;
  isExisting: false;
}

interface NewOtherFile {
  id: string;
  file: File;
  name: string;
  isExisting: false;
}

export type ImageItem = ExistingImage | NewImage;
export type FileItem = ExistingFile | NewOtherFile;

export interface ThumbnailItem {
  file?: File;
  preview: string;
  isExisting: boolean;
  url?: string;
}

export function usePortfolioEditor() {
  const navigate = useNavigate();
  const { portfolioId } = useParams<{ portfolioId: string }>();
  const isEditMode = !!portfolioId;

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [tempCategory, setTempCategory] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [thumbnail, setThumbnail] = useState<ThumbnailItem | null>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [otherFiles, setOtherFiles] = useState<FileItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const MAX_FILE_SIZE = 100 * 1024 * 1024;
  const MAX_IMAGE_COUNT = 10;

  useEffect(() => {
    if (isEditMode && portfolioId) {
      loadPortfolioData(Number(portfolioId));
    }
  }, [isEditMode, portfolioId]);

  const loadPortfolioData = async (id: number) => {
    try {
      setIsLoading(true);
      const data = await getPortfolioById(id);

      setSelectedCategory(data.positionId);
      setTempCategory(data.positionId);
      setTitle(data.title);
      setContent(data.description);

      setThumbnail({
        preview: data.thumbnailImageUrl,
        isExisting: true,
        url: data.thumbnailImageUrl,
      });

      const existingImages: ExistingImage[] = data.images
        .sort((a, b) => a.imageOrder - b.imageOrder)
        .map((img) => ({
          ...img,
          isExisting: true as const,
        }));
      setImages(existingImages);

      const existingFiles: ExistingFile[] = data.files.map((file) => ({
        ...file,
        isExisting: true as const,
      }));
      setOtherFiles(existingFiles);
    } catch (error) {
      console.error('포트폴리오 로드 실패:', error);
      alert('포트폴리오를 불러오는데 실패했습니다.');
      navigate('/my-portfolio');
    } finally {
      setIsLoading(false);
    }
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('=== 썸네일 업로드 시도 ===');
    console.log('파일명:', file.name);
    console.log('파일 크기:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    console.log('파일 타입:', file.type);

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('JPG 또는 PNG 파일만 업로드 가능합니다.');
      return;
    }

    const MAX_SINGLE_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SINGLE_FILE_SIZE) {
      alert('파일 크기는 10MB를 초과할 수 없습니다.');
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      console.log('이미지 해상도:', img.width, 'x', img.height);

      const MAX_DIMENSION = 4096;
      if (img.width > MAX_DIMENSION || img.height > MAX_DIMENSION) {
        alert(`이미지 크기는 ${MAX_DIMENSION}x${MAX_DIMENSION}px를 초과할 수 없습니다.`);
        URL.revokeObjectURL(objectUrl);
        return;
      }

      console.log('✅ 썸네일 업로드 성공');
      setThumbnail({
        file,
        preview: objectUrl,
        isExisting: false,
      });
    };

    img.onerror = () => {
      console.error('❌ 이미지 로드 실패');
      alert('이미지 파일을 읽을 수 없습니다. 다른 파일을 선택해주세요.');
      URL.revokeObjectURL(objectUrl);
    };

    img.src = objectUrl;
  };

  const removeThumbnail = () => {
    if (thumbnail?.preview && !thumbnail.isExisting) {
      URL.revokeObjectURL(thumbnail.preview);
    }
    setThumbnail(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    console.log('=== 추가 이미지 업로드 시도 ===');
    console.log('파일 개수:', files.length);

    const MAX_SINGLE_FILE_SIZE = 10 * 1024 * 1024;
    const validFiles: NewImage[] = [];

    files.forEach((file, index) => {
      console.log(`파일 ${index + 1}:`, file.name, (file.size / 1024 / 1024).toFixed(2), 'MB');

      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        alert(`${file.name}: JPG 또는 PNG 파일만 업로드 가능합니다.`);
        return;
      }

      if (file.size > MAX_SINGLE_FILE_SIZE) {
        alert(`${file.name}: 파일 크기는 10MB를 초과할 수 없습니다.`);
        return;
      }

      validFiles.push({
        id: `new-${Date.now()}-${index}`,
        file,
        preview: URL.createObjectURL(file),
        isExisting: false,
      });
    });

    if (images.length + validFiles.length > MAX_IMAGE_COUNT) {
      alert(`이미지는 최대 ${MAX_IMAGE_COUNT}개까지만 업로드 가능합니다.`);
      return;
    }

    console.log('✅ 추가 이미지 업로드 성공:', validFiles.length, '개');
    setImages([...images, ...validFiles]);
  };

  const removeImage = (id: string | number) => {
    const imageToRemove = images.find((img) =>
      img.isExisting ? img.imageId === id : img.id === id
    );

    if (imageToRemove && !imageToRemove.isExisting) {
      URL.revokeObjectURL(imageToRemove.preview);
    }

    setImages(images.filter((img) =>
      img.isExisting ? img.imageId !== id : img.id !== id
    ));
  };

  const handleOtherFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFiles: NewOtherFile[] = files.map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      file,
      name: file.name,
      isExisting: false,
    }));

    setOtherFiles([...otherFiles, ...newFiles]);
  };

  const removeOtherFile = (id: string | number) => {
    setOtherFiles(otherFiles.filter((file) =>
      file.isExisting ? file.fileId !== id : file.id !== id
    ));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);

    setImages(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSubmit = async () => {
    console.log('=== 포트폴리오 저장 시도 ===');
    console.log('수정 모드:', isEditMode);
    console.log('카테고리 ID:', selectedCategory);
    console.log('제목:', title);
    console.log('내용 길이:', content.length);
    console.log('썸네일:', thumbnail);
    console.log('추가 이미지:', images.length, '개');
    console.log('기타 파일:', otherFiles.length, '개');

    if (!isFormValid) {
      console.error('❌ 필수 항목 미입력');
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (isEditMode && portfolioId) {
        const editData = buildEditRequest();
        console.log('수정 요청 데이터:', editData);
        await updatePortfolio(Number(portfolioId), editData);
        console.log('✅ 포트폴리오 수정 성공');
        alert('포트폴리오가 수정되었습니다!');
      } else {
        const createData: CreatePortfolioRequest = {
          positionId: selectedCategory!,
          title,
          description: content,
          thumbnailImage: thumbnail!.file!,
          images: images.filter((img): img is NewImage => !img.isExisting).map((img) => img.file),
          files: otherFiles.filter((file): file is NewOtherFile => !file.isExisting).map((f) => f.file),
        };
        console.log('생성 요청 데이터:', {
          positionId: createData.positionId,
          title: createData.title,
          thumbnailImage: createData.thumbnailImage.name,
          imagesCount: createData.images?.length || 0,
          filesCount: createData.files?.length || 0,
        });
        await createPortfolio(createData);
        console.log('✅ 포트폴리오 등록 성공');
        alert('포트폴리오가 등록되었습니다!');
      }

      navigate('/my-portfolio');
    } catch (error: any) {
      console.error('❌ 포트폴리오 저장 실패:', error);
      console.error('에러 상세:', error.response?.data);

      const errorMessage = error.response?.data?.message || '포트폴리오 저장에 실패했습니다.';
      setSubmitError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const buildEditRequest = (): EditPortfolioRequest => {
    const request: EditPortfolioRequest = {
      positionId: selectedCategory!,
      title,
      description: content,
    };

    if (thumbnail) {
      if (thumbnail.isExisting && thumbnail.url) {
        request.thumbnailUrl = thumbnail.url;
      } else if (thumbnail.file) {
        request.thumbnailImage = thumbnail.file;
      }
    }

    if (images.length > 0) {
      const imageSequenceParts: string[] = [];
      const newImages: File[] = [];
      let newImageIndex = 0;

      images.forEach((img) => {
        if (img.isExisting) {
          imageSequenceParts.push(`prev:${img.imageId}`);
        } else {
          imageSequenceParts.push(`new:${newImageIndex}`);
          newImages.push(img.file);
          newImageIndex++;
        }
      });

      request.imageSequence = imageSequenceParts.join(',');
      if (newImages.length > 0) {
        request.newImages = newImages;
      }
    }

    if (otherFiles.length > 0) {
      const fileSequenceParts: string[] = [];
      const newFiles: File[] = [];
      let newFileIndex = 0;

      otherFiles.forEach((file) => {
        if (file.isExisting) {
          fileSequenceParts.push(`prev:${file.fileId}`);
        } else {
          fileSequenceParts.push(`new:${newFileIndex}`);
          newFiles.push(file.file);
          newFileIndex++;
        }
      });

      request.fileSequence = fileSequenceParts.join(',');
      if (newFiles.length > 0) {
        request.newFiles = newFiles;
      }
    }

    return request;
  };

  const getTotalFileSize = () => {
    let total = 0;

    if (thumbnail?.file) {
      total += thumbnail.file.size;
    }

    images.forEach((img) => {
      if (!img.isExisting) {
        total += img.file.size;
      }
    });

    otherFiles.forEach((file) => {
      if (!file.isExisting) {
        total += file.file.size;
      }
    });

    return total;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const isFormValid =
    selectedCategory !== null &&
    title.trim() !== '' &&
    content.trim() !== '' &&
    thumbnail !== null &&
    getTotalFileSize() <= MAX_FILE_SIZE;

  const handleCategoryApply = () => {
    setSelectedCategory(tempCategory);
    setShowCategoryModal(false);
  };

  const openCategoryModal = () => {
    setTempCategory(selectedCategory);
    setShowCategoryModal(true);
  };

  return {
    showCategoryModal,
    selectedCategory,
    tempCategory,
    title,
    content,
    thumbnail,
    images,
    otherFiles,
    isSubmitting,
    submitError,
    isFormValid,
    isEditMode,
    isLoading,
    setShowCategoryModal,
    setTempCategory,
    setTitle,
    setContent,
    handleCategoryApply,
    openCategoryModal,
    handleThumbnailUpload,
    removeThumbnail,
    handleImageUpload,
    handleOtherFileUpload,
    removeImage,
    removeOtherFile,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleSubmit,
    getTotalFileSize,
    formatFileSize,
    MAX_FILE_SIZE,
    MAX_IMAGE_COUNT,
  };
}