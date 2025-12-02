FROM gradle:8.5-jdk21

WORKDIR /app

# Node.js 20.x 설치 (공식 저장소)
RUN apt-get update && \
    apt-get install -y tzdata curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g pnpm && \
    ln -snf /usr/share/zoneinfo/Asia/Seoul /etc/localtime && \
    echo "Asia/Seoul" > /etc/timezone && \
    apt-get clean

# 1. pnpm 의존성 파일 먼저 (변동 거의 없음)
COPY package.json pnpm-lock.yaml ./

# 2. pnpm 의존성 설치 (캐싱)
RUN pnpm install

# 3. Gradle 의존성 파일 복사 (가끔 변동)
COPY build.gradle settings.gradle gradlew ./
COPY gradle gradle/

# 4. Gradle 의존성 다운로드 (캐싱)
RUN chmod +x ./gradlew && \
    ./gradlew dependencies --no-daemon || true

# 5. 소스 코드 복사 (자주 변동)
COPY . .

# 6. gradlew 권한 재부여 (COPY . . 후!)
RUN chmod +x ./gradlew

# 7. 빌드
RUN ./gradlew bootJar --no-daemon

EXPOSE 8080

CMD ["sh", "-c", "java -Duser.timezone=Asia/Seoul -jar build/libs/*.jar"]