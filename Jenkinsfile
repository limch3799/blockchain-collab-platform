pipeline {
    agent any
    
    environment {
        SPRING_PROFILES_ACTIVE = 'prod'
        ADMIN_SERVER = '54.180.99.55'
        ADMIN_USER = 'ubuntu'
        ADMIN_DIR = '/home/ubuntu/moas-admin'
        DOCKER_BUILDKIT = '1'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📥 소스 코드 체크아웃'
                checkout scm
            }
        }
        
        stage('Stop Containers') {
            steps {
                echo '🛑 기존 컨테이너 중지'
                sh 'docker-compose down || true'
            }
        }
        
        stage('Deploy Backend') {
            steps {
                echo '🔨 백엔드 빌드 & 배포'
                withCredentials([
                    string(credentialsId: 'DB_USERNAME', variable: 'DB_USERNAME'),  // 추가
                    string(credentialsId: 'DB_PASSWORD', variable: 'DB_PASSWORD'),  // 추가
                    string(credentialsId: 'DB_URL', variable: 'DB_URL'),
                    string(credentialsId: 'DEV_DB_USERNAME', variable: 'DEV_DB_USERNAME'),
                    string(credentialsId: 'DEV_DB_PASSWORD', variable: 'DEV_DB_PASSWORD'),
                    string(credentialsId: 'JWT_SECRET', variable: 'JWT_SECRET'),
                    string(credentialsId: 'AWS_S3_ACCESS_KEY', variable: 'AWS_S3_ACCESS_KEY'),
                    string(credentialsId: 'AWS_S3_SECRET_KEY', variable: 'AWS_S3_SECRET_KEY'),
                    string(credentialsId: 'AWS_S3_BUCKET_NAME', variable: 'AWS_S3_BUCKET_NAME'),
                    string(credentialsId: 'BLOCKCHAIN_RPC_URL', variable: 'BLOCKCHAIN_RPC_URL'),
                    string(credentialsId: 'BLOCKCHAIN_WS_URL', variable: 'BLOCKCHAIN_WS_URL'),
                    string(credentialsId: 'BLOCKCHAIN_CHAIN_ID', variable: 'BLOCKCHAIN_CHAIN_ID'),
                    string(credentialsId: 'WEB3AUTH_AUDIENCE', variable: 'WEB3AUTH_AUDIENCE'),
                    string(credentialsId: 'SERVER_WALLET_PRIVATE_KEY', variable: 'SERVER_WALLET_PRIVATE_KEY'),
                    string(credentialsId: 'MOAS_CONTRACT_ADDRESS', variable: 'MOAS_CONTRACT_ADDRESS'),
                    string(credentialsId: 'FORWARDER_CONTRACT_ADDRESS', variable: 'FORWARDER_CONTRACT_ADDRESS'),
                    string(credentialsId: 'TOSS_PAYMENTS_SECRET_KEY', variable: 'TOSS_PAYMENTS_SECRET_KEY'),
                    string(credentialsId: 'TOSS_PAYMENTS_API_URL', variable: 'TOSS_PAYMENTS_API_URL'),
                    string(credentialsId: 'REDIS_PASSWORD', variable: 'REDIS_PASSWORD'),
                    string(credentialsId: 'GMS_KEY', variable: 'GMS_KEY'),
                    string(credentialsId: 'ACCOUNT_ENCRYPTION_KEY', variable: 'ACCOUNT_ENCRYPTION_KEY'),
                    string(credentialsId: 'QDRANT_API_KEY', variable: 'QDRANT_API_KEY')
                ]) {
                    sh """
                        echo 'DEV_DB_USERNAME=${DEV_DB_USERNAME}' > .env
                        echo 'DEV_DB_PASSWORD=${DEV_DB_PASSWORD}' >> .env
                        echo 'DB_USERNAME=${DB_USERNAME}' >> .env
                        echo 'DB_PASSWORD=${DB_PASSWORD}' >> .env
                        echo 'DB_URL=${DB_URL}' >> .env
                        echo 'JWT_SECRET=${JWT_SECRET}' >> .env
                        echo 'AWS_S3_ACCESS_KEY=${AWS_S3_ACCESS_KEY}' >> .env
                        echo 'AWS_S3_SECRET_KEY=${AWS_S3_SECRET_KEY}' >> .env
                        echo 'AWS_S3_BUCKET_NAME=${AWS_S3_BUCKET_NAME}' >> .env
                        echo 'BLOCKCHAIN_RPC_URL=${BLOCKCHAIN_RPC_URL}' >> .env
                        echo 'BLOCKCHAIN_WS_URL=${BLOCKCHAIN_WS_URL}' >> .env
                        echo 'BLOCKCHAIN_CHAIN_ID=${BLOCKCHAIN_CHAIN_ID}' >> .env
                        echo 'WEB3AUTH_AUDIENCE=${WEB3AUTH_AUDIENCE}' >> .env
                        echo 'SERVER_WALLET_PRIVATE_KEY=${SERVER_WALLET_PRIVATE_KEY}' >> .env
                        echo 'MOAS_CONTRACT_ADDRESS=${MOAS_CONTRACT_ADDRESS}' >> .env
                        echo 'FORWARDER_CONTRACT_ADDRESS=${FORWARDER_CONTRACT_ADDRESS}' >> .env
                        echo 'TOSS_PAYMENTS_SECRET_KEY=${TOSS_PAYMENTS_SECRET_KEY}' >> .env
                        echo 'TOSS_PAYMENTS_API_URL=${TOSS_PAYMENTS_API_URL}' >> .env
                        echo 'REDIS_PASSWORD=${REDIS_PASSWORD}' >> .env
                        echo 'GMS_KEY=${GMS_KEY}' >> .env
                        echo 'ACCOUNT_ENCRYPTION_KEY=${ACCOUNT_ENCRYPTION_KEY}' >> .env
                        echo 'QDRANT_API_KEY=${QDRANT_API_KEY}' >> .env
                        
                        docker-compose down
                        docker-compose up -d --build backend redis
                    """
                }
                echo '✅ 백엔드 배포 완료'
            }
        }
        
        stage('Deploy Frontend') {
            steps {
                echo '🔨 프론트엔드 빌드 & 배포'
                
                withCredentials([
                    string(credentialsId: 'VITE_TOSS_CLIENT_KEY', variable: 'VITE_TOSS_CLIENT_KEY'),
                    string(credentialsId: 'VITE_WEB3_AUTH_KEY', variable: 'VITE_WEB3_AUTH_KEY')
                ]) {
                    sh """
                        # 백엔드 단계에서 생성된 .env 파일에 프론트엔드 환경변수를 추가합니다. (>>)
                        echo 'VITE_TOSS_CLIENT_KEY=${VITE_TOSS_CLIENT_KEY}' >> .env
                        echo 'VITE_WEB3_AUTH_KEY=${VITE_WEB3_AUTH_KEY}' >> .env
                        # .env 파일을 참조하여 frontend 서비스를 빌드하고 실행합니다.
                        docker-compose up -d --build frontend
                    """
                }
                
                echo '✅ 프론트엔드 배포 완료'
            }
        }

        
        stage('Deploy Monitoring') {
            steps {
                echo '🔨 모니터링 스택 배포'
                
                sh '''
                    # 디렉토리로 생성된 경우만 제거
                    [ -d promtail-config.yml ] && rm -rf promtail-config.yml
                    
                    # promtail-config.yml 파일 존재 확인
                    if [ ! -f promtail-config.yml ]; then
                        echo "❌ promtail-config.yml 파일이 없습니다!"
                        exit 1
                    fi
                    
                    echo "📋 Promtail 설정 파일:"
                    ls -lh promtail-config.yml
                    mkdir -p backend-logs
                '''
                
                withCredentials([
                    string(credentialsId: 'GRAFANA_ADMIN_PASSWORD', variable: 'GRAFANA_ADMIN_PASSWORD')
                ]) {
                    sh '''
                        # Loki & Grafana만 시작
                        docker-compose up -d loki grafana 2>/dev/null || echo "Loki/Grafana already running"
                        
                        # Promtail이 없을 때만 시작 (있으면 그냥 놔둠)
                        if ! docker ps | grep -q moas-promtail; then
                            echo "🚀 Promtail 시작"
                            docker run -d \
                            --name moas-promtail \
                            --network moas_release_moas-network \
                            --restart unless-stopped \
                            -v /var/jenkins_home/workspace/moas_release/promtail-config.yml:/tmp/promtail-config.yml:ro \
                            -v /var/jenkins_home/workspace/moas_release/backend-logs:/logs:ro \
                            grafana/promtail:latest \
                            -config.file=/tmp/promtail-config.yml
                        else
                            echo "✅ Promtail 이미 실행 중 - 재시작 건너뜀"
                        fi
                    '''
                }
                
                sh '''
                    sleep 3
                    echo "🔍 모니터링 스택 상태:"
                    docker ps | grep -E "promtail|loki|grafana"
                '''
                
                echo '✅ 모니터링 스택 배포 완료'
            }
        }

        stage('Deploy Admin Server') {
            steps {
                echo '🔨 관리자 서버 배포 시작'
                
                sshagent(['admin-server-ssh']) {
                    sh '''
                        # 관리자 서버 디렉토리 생성
                        ssh -o StrictHostKeyChecking=no ${ADMIN_USER}@${ADMIN_SERVER} "mkdir -p ${ADMIN_DIR}"
                        
                        # .env 파일 전송
                        scp .env ${ADMIN_USER}@${ADMIN_SERVER}:${ADMIN_DIR}/.env
                        
                        # docker-compose-admin.yml을 docker-compose.yml로 전송
                        scp docker-compose-admin.yml ${ADMIN_USER}@${ADMIN_SERVER}:${ADMIN_DIR}/docker-compose.yml
                        
                        # backend 디렉토리 전송
                        scp -r ./backend ${ADMIN_USER}@${ADMIN_SERVER}:${ADMIN_DIR}/
                        
                        # frontend 디렉토리 전송
                        scp -r ./frontend ${ADMIN_USER}@${ADMIN_SERVER}:${ADMIN_DIR}/
                        
                        # 관리자 서버에서 배포 실행 (docker compose로 변경!)
                        ssh ${ADMIN_USER}@${ADMIN_SERVER} "cd ${ADMIN_DIR} && echo '🛑 기존 컨테이너 중지' && docker compose down && echo '🚀 관리자 서버 빌드 & 시작' && docker compose up -d --build && echo '🔍 컨테이너 상태 확인' && docker ps && echo '✅ 관리자 서버 배포 완료'"
                    '''
                }
                
                echo '✅ 관리자 서버 배포 완료'
            }
        }
        
        stage('Cleanup') {
            steps {
                echo '🧹 미사용 Docker 리소스 정리'
                sh '''
                    rm -f .env
                    docker image prune -f --filter "dangling=true"
                '''
            }
        }
    }
    
    post {
        success {
            echo '''
            ========================================
            ✅ MOAS 환경 배포 성공!
            ========================================
            🔗 백엔드:     http://K13S401.p.ssafy.io:8081
            🔗 프론트엔드: http://K13S401.p.ssafy.io:3000
            🔗 Grafana:    http://K13S401.p.ssafy.io:3001
            
            [관리자 서버]
            🔗 백엔드:     http://54.180.99.55/admin/api
            🔗 프론트엔드: http://54.180.99.55
            ========================================
            '''
        }
        failure {
            echo '❌ 배포 실패!'
            sh 'docker-compose logs --tail=50 || true'
        }
        always {
            sh 'docker ps || true'
        }
    }
}