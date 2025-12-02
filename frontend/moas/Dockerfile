FROM node:20-alpine AS build

WORKDIR /app

# pnpm 설치
RUN corepack enable && corepack prepare pnpm@latest --activate

# 의존성 파일 복사
COPY package.json pnpm-lock.yaml ./

# 의존성 설치 (빌드 스크립트 승인)
RUN pnpm install --frozen-lockfile

# 소스 코드 복사
COPY . .

# 빌드 인수 설정
ARG VITE_API_URL
ARG VITE_TOSS_CLIENT_KEY
ARG VITE_WEB3_AUTH_KEY

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_TOSS_CLIENT_KEY=${VITE_TOSS_CLIENT_KEY}
ENV VITE_WEB3_AUTH_KEY=${VITE_WEB3_AUTH_KEY}

# 빌드
RUN pnpm run build

# 프로덕션 이미지
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]