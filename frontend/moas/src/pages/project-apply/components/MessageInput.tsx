// src/pages/project-apply/components/MessageInput.tsx
import { MessageSquare } from 'lucide-react';

interface MessageInputProps {
  message: string;
  onMessageChange: (message: string) => void;
}

export function MessageInput({ message, onMessageChange }: MessageInputProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-moas-gray-6" />
        <h2 className="text-xl font-bold text-moas-text">지원 메시지</h2>
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="block text-sm font-semibold text-moas-gray-6">
          프로젝트 리더에게 보낼 메시지를 작성해주세요
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="자기소개 및 프로젝트에 대한 의지를 표현해주세요."
          className="w-full min-h-[150px] p-4 border-2 border-moas-gray-3 rounded-lg focus:border-moas-main focus:outline-none resize-none text-moas-text"
          maxLength={500}
        />
        <div className="text-right text-sm text-moas-gray-6">{message.length} / 100자</div>
      </div>
    </div>
  );
}
