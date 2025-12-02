-- -----------------------------------------------------
-- Schema moas_db
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `moas_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `moas_db` ;

-- -----------------------------------------------------
-- Table `moas_db`.`action_log`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `moas_db`.`action_log` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '로그 ID',
  `related_id` BIGINT UNSIGNED NOT NULL COMMENT '관련 ID',
  `action_type` VARCHAR(50) NOT NULL COMMENT '액션 타입',
  `actor_member_id` INT UNSIGNED NULL DEFAULT NULL COMMENT '수행자 회원 ID',
  `details` JSON NULL DEFAULT NULL COMMENT '상세 정보 (JSON)',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  PRIMARY KEY (`id`),
  INDEX `idx_action_log_related_id` (`related_id` ASC) VISIBLE,
  INDEX `idx_action_log_actor_id` (`actor_member_id` ASC) VISIBLE,
  INDEX `idx_action_log_type` (`action_type` ASC, `created_at` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = '액션 로그';


-- -----------------------------------------------------
-- Table `moas_db`.`admin`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `moas_db`.`admin` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '관리자 ID',
  `login_id` VARCHAR(50) NOT NULL COMMENT '로그인 ID',
  `password_hash` VARCHAR(255) NOT NULL COMMENT '비밀번호 해시',
  `name` VARCHAR(50) NOT NULL COMMENT '관리자명',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  `deleted_at` DATETIME NULL DEFAULT NULL COMMENT '삭제일시',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_admin_login_id` (`login_id` ASC) VISIBLE,
  INDEX `idx_admin_deleted_at` (`deleted_at` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = '관리자';


-- -----------------------------------------------------
-- Table `moas_db`.`bank`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `moas_db`.`bank` (
  `code` CHAR(3) NOT NULL COMMENT '은행 코드',
  `name` VARCHAR(20) NOT NULL COMMENT '은행명',
  PRIMARY KEY (`code`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = '은행 코드 마스터';

-- 은행 코드 마스터 데이터 삽입
INSERT INTO `moas_db`.`bank` (`code`, `name`) VALUES
('002', '산업'),
('003', '기업'),
('004', '국민'),
('007', '수협'),
('011', '농협'),
('012', '지역농.축협'),
('020', '우리'),
('023', 'SC'),
('027', '한국씨티'),
('030', '회원수협'),
('031', '아이엠뱅크(대구)'),
('032', '부산'),
('034', '광주'),
('035', '제주'),
('037', '전북'),
('039', '경남'),
('045', '새마을'),
('048', '신협'),
('050', '저축은행'),
('054', 'HSBC'),
('055', '도이치'),
('057', 'JP모간'),
('060', 'BOA'),
('061', 'BNP파리바'),
('062', '중국공상'),
('063', '중국'),
('064', '산림조합'),
('067', '중국건설'),
('071', '우체국'),
('081', '하나'),
('088', '신한'),
('089', '케이뱅크'),
('090', '카카오뱅크'),
('092', '토스뱅크'),
('209', '유안타증권'),
('218', 'KB증권'),
('221', '상상인증권'),
('224', 'BNK투자증권'),
('225', 'IBK투자증권'),
('227', '다올투자증권'),
('238', '미래에셋증권'),
('240', '삼성증권'),
('243', '한국투자증권'),
('247', 'NH투자증권'),
('261', '교보증권'),
('262', '아이엠증권'),
('263', '현대차증권'),
('264', '키움증권'),
('265', 'LS증권'),
('266', '에스케이증권'),
('267', '대신증권'),
('269', '한화투자증권'),
('270', '하나증권'),
('271', '토스증권'),
('278', '신한투자증권'),
('279', 'DB증권'),
('280', '유진투자증권'),
('287', '메리츠증권'),
('288', '카카오페이증권'),
('290', '부국증권'),
('291', '신영증권'),
('292', '케이프투자증권'),
('294', '우리투자증권')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);


-- -----------------------------------------------------
-- Table `moas_db`.`category`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `moas_db`.`category` (
  `id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '카테고리 ID',
  `category_name` VARCHAR(30) NOT NULL COMMENT '카테고리명',
  PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = '직무 카테고리';


-- -----------------------------------------------------
-- Table `moas_db`.`chat_member`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `moas_db`.`chat_member` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '채팅 멤버 ID',
  `chatroom_id` BIGINT UNSIGNED NOT NULL COMMENT '채팅방 ID',
  `member_id` INT UNSIGNED NOT NULL COMMENT '회원 ID',
  `joined_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '참여일시',
  `left_at` DATETIME NULL DEFAULT NULL COMMENT '퇴장일시',
  `last_read_message_id` BIGINT UNSIGNED NULL DEFAULT NULL COMMENT '마지막 읽은 메시지 ID',
  `is_blocked` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '차단 여부',
  `is_valid` TINYINT(1) NOT NULL DEFAULT '1' COMMENT '유효 여부',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_chat_member` (`chatroom_id` ASC, `member_id` ASC, `left_at` ASC) VISIBLE,
  INDEX `idx_chat_member_member_id` (`member_id` ASC) VISIBLE,
  INDEX `idx_chat_member_valid` (`chatroom_id` ASC, `is_valid` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = '채팅방 참여자';


-- -----------------------------------------------------
-- Table `moas_db`.`chatmessage`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `moas_db`.`chatmessage` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '메시지 ID',
  `chat_member_id` BIGINT UNSIGNED NOT NULL COMMENT '채팅 멤버 ID',
  `content` VARCHAR(500) NOT NULL COMMENT '메시지 내용',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  `deleted_at` DATETIME NULL DEFAULT NULL COMMENT '삭제일시',
  PRIMARY KEY (`id`),
  INDEX `idx_chatmessage_chat_member_id` (`chat_member_id` ASC) VISIBLE,
  INDEX `idx_chatmessage_created_at` (`created_at` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = '채팅 메시지';


-- -----------------------------------------------------
-- Table `moas_db`.`chatmessage_file`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `moas_db`.`chatmessage_file` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '파일 ID',
  `message_id` BIGINT UNSIGNED NOT NULL COMMENT '메시지 ID',
  `file_url` VARCHAR(512) NOT NULL COMMENT '파일 URL',
  `original_file_name` VARCHAR(100) NOT NULL COMMENT '원본 파일명',
  `file_type` VARCHAR(100) NOT NULL COMMENT '파일 타입',
  `file_size` INT UNSIGNED NOT NULL COMMENT '파일 크기 (bytes)',
  `uploaded_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '업로드일시',
  PRIMARY KEY (`id`),
  INDEX `idx_chatmessage_file_message_id` (`message_id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = '채팅 메시지 파일';


-- -----------------------------------------------------
-- Table `moas_db`.`chatroom`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `moas_db`.`chatroom` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '채팅방 ID',
  `project_id` INT UNSIGNED NULL DEFAULT NULL COMMENT '프로젝트 ID',
  `last_message_id` BIGINT UNSIGNED NULL DEFAULT NULL COMMENT '마지막 메시지 ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  PRIMARY KEY (`id`),
  INDEX `idx_chatroom_project_id` (`project_id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = '채팅방';


-- -----------------------------------------------------
-- Table `moas_db`.`contract`
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS `moas_db`.`contract` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '계약 ID',
  `project_id` INT UNSIGNED NOT NULL COMMENT '프로젝트 ID',
  `leader_member_id` INT UNSIGNED NOT NULL COMMENT '리더 회원 ID',
  `artist_member_id` INT UNSIGNED NOT NULL COMMENT '아티스트(계약자) 회원 ID',
  `nft_image_url` VARCHAR(255) NULL DEFAULT NULL COMMENT 'NFT 기본 이미지 원본 URL' ,
  `title` VARCHAR(100) NOT NULL COMMENT '계약명',
  `description` TEXT NULL DEFAULT NULL COMMENT '계약 설명',
  `start_at` DATETIME NOT NULL COMMENT '계약 시작일',
  `end_at` DATETIME NOT NULL COMMENT '계약 종료일',
  `status` ENUM(
      'PENDING',              -- 아티스트 응답 대기
      'DECLINED',               -- 리더 응답 대기 (재제시/철회)
      'WITHDRAWN',              -- 협상 종료 (리더가 철회)
      'ARTIST_SIGNED',          -- 아티스트 서명 완료, 리더 서명/결제 대기
      'PAYMENT_PENDING',        -- 리더 결제 진행중
      'PAYMENT_COMPLETED',      -- 결제 완료, NFT 발행 대기
      'COMPLETED',              -- 모든 절차 완료 (계약 이행 완료)
      'CANCELLATION_REQUESTED', -- 파기 요청됨
      'CANCELED'                -- 계약 파기됨 (최종 실패)
  ) NOT NULL DEFAULT 'PENDING' COMMENT '계약 상태',
  `total_amount` BIGINT UNSIGNED NOT NULL COMMENT '총 계약금액',
  `applied_fee_rate` DECIMAL(5,2) UNSIGNED NOT NULL COMMENT '적용된 수수료율 (%)',
  `leader_signature` VARCHAR(132) NULL DEFAULT NULL COMMENT '리더 EIP-712 오프체인 서명',
  `artist_signature` VARCHAR(132) NULL DEFAULT NULL COMMENT '아티스트 EIP-712 오프체인 서명',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  `updated_at` DATETIME NULL DEFAULT NULL COMMENT '수정일시',
  PRIMARY KEY (`id`),
  INDEX `idx_contract_project_id` (`project_id` ASC) VISIBLE,
  INDEX `idx_contract_leader_id` (`leader_member_id` ASC) VISIBLE,
  INDEX `idx_contract_artist_id` (`artist_member_id` ASC) VISIBLE,
  INDEX `idx_contract_status` (`status` ASC, `created_at` ASC) VISIBLE,
  INDEX `idx_contract_dates` (`start_at` ASC, `end_at` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = '프로젝트 계약 (EIP-712 서명 포함)';


-- -----------------------------------------------------
-- Table `moas_db`.`contract_nft`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `moas_db`.`contract_nft` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'NFT ID',
  `contract_id` BIGINT UNSIGNED NOT NULL COMMENT '계약 ID (온체인의 Token ID)',
  `mint_tx_hash` VARCHAR(66) NOT NULL COMMENT '민팅 트랜잭션 해시',
  `owner_member_id` INT UNSIGNED NOT NULL COMMENT '소유자 회원 ID',
  `quantity` TINYINT UNSIGNED NOT NULL DEFAULT '1' COMMENT '수량',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  `deleted_at` DATETIME NULL DEFAULT NULL COMMENT '삭제일시',
  PRIMARY KEY (`id`),
  INDEX `idx_nft_contract_id` (`contract_id` ASC) VISIBLE,
  INDEX `idx_nft_owner_id` (`owner_member_id` ASC) VISIBLE,
  INDEX `idx_nft_deleted_at` (`deleted_at` ASC) VISIBLE,
  UNIQUE INDEX `uk_nft_contract_owner` (`contract_id` ASC, `owner_member_id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = '계약 NFT';


-- -----------------------------------------------------
-- Table `moas_db`.`district`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `moas_db`.`district` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '시군구 ID',
  `province_id` INT UNSIGNED NOT NULL COMMENT '시도 ID',
  `code` VARCHAR(10) NOT NULL COMMENT '시군구 코드',
  `name_ko` VARCHAR(50) NOT NULL COMMENT '시군구명',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_district_code` (`code` ASC) VISIBLE,
  INDEX `idx_district_province_id` (`province_id` ASC) VISIBLE,
  INDEX `idx_district_name` (`name_ko` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = '시/군/구 마스터';


-- -----------------------------------------------------
-- Table `moas_db`.`fee_policy`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `moas_db`.`fee_policy` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '정책 ID',
  `created_by` INT UNSIGNED NOT NULL COMMENT '생성자 관리자 ID',
  `fee_rate` DECIMAL(5,2) UNSIGNED NOT NULL COMMENT '수수료율 (%)',
  `start_at` DATETIME NOT NULL COMMENT '적용 시작일',
  `updated_at` DATETIME NULL DEFAULT NULL COMMENT '수정일시',
  PRIMARY KEY (`id`),
  INDEX `idx_fee_policy_start_at` (`start_at` DESC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = '수수료 정책';


-- -----------------------------------------------------
-- Table `moas_db`.`inquiry`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `moas_db`.`inquiry` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '문의 ID',
  `member_id` INT UNSIGNED NOT NULL COMMENT '회원 ID',
  `category` ENUM('MEMBER', 'CONTRACT', 'PAYMENT', 'OTHERS') NOT NULL COMMENT '문의 유형',
  `title` VARCHAR(200) NOT NULL COMMENT '제목',
  `content` TEXT NOT NULL COMMENT '내용',
  `status` ENUM('PENDING', 'ANSWERED', 'CLOSED') NOT NULL DEFAULT 'PENDING' COMMENT '문의 상태',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  `updated_at` DATETIME NULL DEFAULT NULL COMMENT '수정일시',
  PRIMARY KEY (`id`),
  INDEX `idx_inquiry_member_id` (`member_id` ASC) VISIBLE,
  INDEX `idx_inquiry_status` (`status` ASC, `created_at` ASC) VISIBLE,
  INDEX `idx_inquiry_category` (`category` ASC, `created_at` ASC) VISIBLE,
  FULLTEXT INDEX `ft_inquiry_title_content` (`title`, `content`) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = '회원 문의';


-- -----------------------------------------------------
-- Table `moas_db`.`inquiry_comment`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `moas_db`.`inquiry_comment` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '답변 ID',
  `inquiry_id` INT UNSIGNED NOT NULL COMMENT '문의 ID',
  `admin_id` INT UNSIGNED NULL DEFAULT NULL COMMENT '관리자 ID',
  `content` TEXT NOT NULL COMMENT '답변 내용',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  `updated_at` DATETIME NULL DEFAULT NULL COMMENT '수정일시',
  `deleted_at` DATETIME NULL DEFAULT NULL COMMENT '삭제일시',
  PRIMARY KEY (`id`),
  INDEX `idx_inquiry_comment_inquiry_id` (`inquiry_id` ASC) VISIBLE,
  INDEX `idx_inquiry_comment_admin_id` (`admin_id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = '문의 답변';


-- -----------------------------------------------------
-- Table `moas_db`.`inquiry_comment_file`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `moas_db`.`inquiry_comment_file` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '파일 ID',
  `inquiry_comment_id` BIGINT UNSIGNED NOT NULL COMMENT '답변 ID',
  `stored_file_url` VARCHAR(512) NOT NULL COMMENT '저장된 파일 URL',
  `original_file_name` VARCHAR(100) NOT NULL COMMENT '원본 파일명',
  `file_type` VARCHAR(100) NOT NULL COMMENT '파일 타입',
  `file_size` INT UNSIGNED NOT NULL COMMENT '파일 크기 (bytes)',
  `uploaded_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '업로드일시',
  PRIMARY KEY (`id`),
  INDEX `idx_inquiry_comment_file_comment_id` (`inquiry_comment_id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = '문의 답변 첨부파일';


-- -----------------------------------------------------
-- Table `moas_db`.`inquiry_file`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `moas_db`.`inquiry_file` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '파일 ID',
  `inquiry_id` INT UNSIGNED NOT NULL COMMENT '문의 ID',
  `stored_file_url` VARCHAR(512) NOT NULL COMMENT '저장된 파일 URL',
  `original_file_name` VARCHAR(100) NOT NULL COMMENT '원본 파일명',
  `file_type` VARCHAR(100) NOT NULL COMMENT '파일 타입',
  `file_size` INT UNSIGNED NOT NULL COMMENT '파일 크기 (bytes)',
  `uploaded_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '업로드일시',
  PRIMARY KEY (`id`),
  INDEX `idx_inquiry_file_inquiry_id` (`inquiry_id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = '문의 첨부파일';


-- -----------------------------------------------------
-- Table `moas_db`.`member`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `moas_db`.`member` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '회원 ID',
  `nickname` VARCHAR(50) NOT NULL COMMENT '닉네임',
  `biography` VARCHAR(200) NULL DEFAULT NULL COMMENT '자기소개',
  `email` VARCHAR(254) NULL DEFAULT NULL COMMENT '이메일',
  `provider` ENUM('GOOGLE', 'KAKAO') NOT NULL COMMENT 'OAuth 제공자',
  `provider_id` VARCHAR(128) NOT NULL COMMENT 'OAuth 제공자 ID',
  `phone_number` VARCHAR(20) NULL DEFAULT NULL COMMENT '전화번호',
  `profile_image_url` VARCHAR(512) NULL DEFAULT NULL COMMENT '프로필 이미지 URL',
  `wallet_address` VARCHAR(128) NULL DEFAULT NULL COMMENT '지갑 주소',
  `role` ENUM('PENDING', 'LEADER', 'ARTIST') NOT NULL DEFAULT 'PENDING' COMMENT '역할',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  `updated_at` DATETIME NULL DEFAULT NULL COMMENT '수정일시',
  `deleted_at` DATETIME NULL DEFAULT NULL COMMENT '삭제일시',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_member_provider` (`provider` ASC, `provider_id` ASC) VISIBLE,
  INDEX `idx_member_deleted_at` (`deleted_at` ASC) VISIBLE,
  INDEX `idx_member_wallet_address` (`wallet_address` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = '회원';

-- -----------------------------------------------------
-- Table `moas_db`.`member_bank`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `moas_db`.`member_bank` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '계좌 ID',
  `member_id` INT UNSIGNED NOT NULL COMMENT '회원 ID',
  `bank_code` CHAR(3) NOT NULL COMMENT '은행 코드',
  `account_holder_name` VARCHAR(50) NOT NULL COMMENT '예금주명',
  `account_number_cipher` VARBINARY(64) NOT NULL COMMENT '암호화된 계좌번호',
  `account_number_iv` VARBINARY(16) NOT NULL COMMENT '암호화 IV',
  `account_last4` CHAR(4) NOT NULL COMMENT '계좌번호 뒤 4자리',
  `status` ENUM('PENDING', 'VERIFIED') NOT NULL DEFAULT 'PENDING' COMMENT '인증 상태',
  `verified_at` DATETIME NULL DEFAULT NULL COMMENT '인증일시',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일시',
  `deleted_at` DATETIME NULL DEFAULT NULL COMMENT '삭제일시',
  PRIMARY KEY (`id`),
  INDEX `idx_member_bank_status` (`member_id` ASC, `status` ASC) VISIBLE,
  INDEX `idx_member_bank_deleted_at` (`deleted_at` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = '회원 계좌 정보';


-- -----------------------------------------------------
-- Table `moas_db`.`notification`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `moas_db`.`notification` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '알림 ID',
  `member_id` INT UNSIGNED NOT NULL COMMENT '회원 ID',
  `related_id` BIGINT UNSIGNED NOT NULL COMMENT '관련 ID',
  `alarm_type` VARCHAR(50) NOT NULL COMMENT '알림 타입',
  `is_read` TINYINT(1) NOT NULL DEFAULT '0' COMMENT '읽음 여부',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  PRIMARY KEY (`id`),
  INDEX `idx_notification_member_read` (`member_id` ASC, `is_read` ASC, `id` DESC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = '알림';


-- -----------------------------------------------------
-- Table `moas_db`.`onchain_record`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `moas_db`.`onchain_record` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '온체인 기록 ID',
  `contract_id` BIGINT UNSIGNED NOT NULL COMMENT '계약 ID',
  `tx_hash` VARCHAR(66) NULL COMMENT '트랜잭션 해시',
  `action_type` ENUM('MINT', 'UPDATE_STATUS', 'BURN') NOT NULL COMMENT '액션 타입',
  `status` ENUM('PENDING', 'SUCCEEDED', 'FAILED') NOT NULL DEFAULT 'PENDING' COMMENT '트랜잭션 상태',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  `updated_at` DATETIME NULL DEFAULT NULL COMMENT '수정일시',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_onchain_tx_hash` (`tx_hash` ASC) VISIBLE,
  INDEX `idx_onchain_contract_id` (`contract_id` ASC) VISIBLE,
  INDEX `idx_onchain_status` (`status` ASC, `created_at` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = '온체인 트랜잭션 기록';


-- -----------------------------------------------------
-- Table `moas_db`.`payment`
-- -----------------------------------------------------
CREATE TABLE moas_db.payment (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '거래 ID',
    order_id VARCHAR(64) NOT NULL COMMENT '관련 주문 ID',
    member_id INT UNSIGNED NOT NULL COMMENT '거래 주체 ID (수익자/지출자)',
    amount BIGINT NOT NULL COMMENT '금액',
    type ENUM('PAYMENT', 'SETTLEMENT', 'FEE', 'REFUND') NOT NULL COMMENT '거래 유형',
    status ENUM('PENDING', 'COMPLETED', 'FAILED') NOT NULL COMMENT '거래 상태 (정산 지급 상태)',
    completed_at DATETIME NULL COMMENT '거래 완료(지급 완료) 일시',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    PRIMARY KEY (id),
    INDEX idx_payment_order_id (order_id ASC),
    INDEX idx_payment_member_status (member_id ASC, status ASC)
) COMMENT '거래 원장';


-- -----------------------------------------------------
-- Table `moas_db`.`penalty_record`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `moas_db`.`penalty_record` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '페널티 이력 ID',
  `member_id` INT UNSIGNED NOT NULL COMMENT '대상 회원 ID',
  `contract_id` BIGINT UNSIGNED NULL DEFAULT NULL COMMENT '계약 ID',
  `changed_by` INT UNSIGNED NULL DEFAULT NULL COMMENT '처리자 회원 ID',
  `penalty_score` TINYINT NOT NULL COMMENT '페널티 점수 (음수 가능)',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  `changed_at` DATETIME NULL DEFAULT NULL COMMENT '변경일시',
  PRIMARY KEY (`id`),
  INDEX `idx_penalty_record_member_id` (`member_id` ASC) VISIBLE,
  INDEX `idx_penalty_record_contract_id` (`contract_id` ASC) VISIBLE,
  INDEX `idx_penalty_record_created_at` (`created_at` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = '페널티 이력';


-- -----------------------------------------------------
-- Table `moas_db`.`portfolio`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `moas_db`.`portfolio` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '포트폴리오 ID',
  `member_id` INT UNSIGNED NOT NULL COMMENT '회원 ID',
  `position_id` INT UNSIGNED NOT NULL COMMENT '포지션 ID',
  `title` VARCHAR(100) NOT NULL COMMENT '제목',
  `description` TEXT NULL DEFAULT NULL COMMENT '설명',
  `thumbnail_image_url` VARCHAR(512) NULL DEFAULT NULL COMMENT '썸네일 이미지 URL',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  `deleted_at` DATETIME NULL DEFAULT NULL COMMENT '삭제일시',
  PRIMARY KEY (`id`),
  INDEX `idx_portfolio_position_id` (`position_id` ASC) VISIBLE,
  INDEX `idx_portfolio_member_deleted` (`member_id` ASC, `deleted_at` ASC) VISIBLE,
  INDEX `idx_portfolio_created_at` (`created_at` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = '포트폴리오';


-- -----------------------------------------------------
-- Table `moas_db`.`portfolio_file`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `moas_db`.`portfolio_file` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '파일 ID',
  `portfolio_id` BIGINT UNSIGNED NOT NULL COMMENT '포트폴리오 ID',
  `original_file_name` VARCHAR(100) NOT NULL COMMENT '원본 파일명',
  `stored_file_url` VARCHAR(512) NOT NULL COMMENT '저장된 파일 URL',
  `file_type` VARCHAR(100) NOT NULL COMMENT '파일 타입',
  `file_size` INT UNSIGNED NOT NULL COMMENT '파일 크기 (bytes)',
  `uploaded_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '업로드일시',
  PRIMARY KEY (`id`),
  INDEX `idx_portfolio_file_portfolio_id` (`portfolio_id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = '포트폴리오 첨부파일';


-- -----------------------------------------------------
-- Table `moas_db`.`portfolio_image`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `moas_db`.`portfolio_image` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '이미지 ID',
  `portfolio_id` BIGINT UNSIGNED NOT NULL COMMENT '포트폴리오 ID',
  `original_image_id` BIGINT UNSIGNED NULL DEFAULT NULL COMMENT '원본 이미지 ID',
  `image_url` VARCHAR(512) NOT NULL COMMENT '이미지 URL',
  `image_order` TINYINT UNSIGNED NOT NULL COMMENT '이미지 순서',
  `image_size` INT UNSIGNED NOT NULL COMMENT '이미지 크기 (bytes)',
  `uploaded_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '업로드일시',
  PRIMARY KEY (`id`),
  INDEX `idx_portfolio_image_portfolio_id` (`portfolio_id` ASC) VISIBLE,
  INDEX `idx_portfolio_image_order` (`portfolio_id` ASC, `image_order` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = '포트폴리오 이미지';


-- -----------------------------------------------------
-- Table `moas_db`.`position`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `moas_db`.`position` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '포지션 ID',
  `category_id` TINYINT UNSIGNED NOT NULL COMMENT '카테고리 ID',
  `position_name` VARCHAR(30) NOT NULL COMMENT '포지션명',
  PRIMARY KEY (`id`),
  INDEX `idx_position_category_id` (`category_id` ASC) VISIBLE,
  INDEX `idx_position_name` (`position_name` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = '직무 포지션';


-- -----------------------------------------------------
-- Table `moas_db`.`project_application`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `moas_db`.`project_application` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '지원 ID',
  `project_position_id` BIGINT UNSIGNED NOT NULL COMMENT '프로젝트 직무 ID',
  `member_id` INT UNSIGNED NOT NULL COMMENT '지원자 회원 ID',
  `portfolio_id` BIGINT UNSIGNED NOT NULL COMMENT '포트폴리오 ID',
  `contract_id` BIGINT UNSIGNED NULL DEFAULT NULL COMMENT '계약 ID',
  `status` ENUM('PENDING', 'REJECTED', 'OFFERED', 'COMPLETED') NOT NULL DEFAULT 'PENDING' COMMENT '지원 상태',
  `message` VARCHAR(100) NULL DEFAULT NULL COMMENT '지원 메시지',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '지원일시',
  `updated_at` DATETIME NULL DEFAULT NULL COMMENT '수정일시',
  `deleted_at` DATETIME NULL DEFAULT NULL COMMENT '삭제일시',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_application` (`project_position_id` ASC, `member_id` ASC, `portfolio_id` ASC, `deleted_at` ASC) VISIBLE,
  INDEX `idx_application_member_id` (`member_id` ASC) VISIBLE,
  INDEX `idx_application_portfolio_id` (`portfolio_id` ASC) VISIBLE,
  INDEX `idx_application_status` (`status` ASC, `created_at` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = '프로젝트 지원';


-- -----------------------------------------------------
-- Table `moas_db`.`project_bookmark`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `moas_db`.`project_bookmark` (
  `member_id` INT UNSIGNED NOT NULL COMMENT '회원 ID',
  `project_id` INT UNSIGNED NOT NULL COMMENT '프로젝트 ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '북마크일시',
  PRIMARY KEY (`member_id`, `project_id`),
  INDEX `idx_bookmark_project_id` (`project_id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = '프로젝트 북마크';


-- -----------------------------------------------------
-- Table `moas_db`.`project_position`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `moas_db`.`project_position` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '프로젝트 포지션 ID',
  `project_id` INT UNSIGNED NOT NULL COMMENT '프로젝트 ID',
  `position_id` INT UNSIGNED NOT NULL COMMENT '포지션 ID',
  `budget` INT UNSIGNED NOT NULL COMMENT '예산',
    `status` ENUM('RECRUITING', 'COMPLETED') NOT NULL default 'RECRUITING' COMMENT '직무별 모집 상태',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일시',
  `deleted_at` DATETIME NULL DEFAULT NULL COMMENT '삭제일시',
  PRIMARY KEY (`id`),
  INDEX `idx_project_position_project_id` (`project_id` ASC) VISIBLE,
  INDEX `idx_project_position_position_id` (`position_id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = '프로젝트 포지션별 모집';


-- -----------------------------------------------------
-- Table `moas_db`.`project`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `moas_db`.`project` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '프로젝트 ID',
  `member_id` INT UNSIGNED NOT NULL COMMENT '작성자 회원 ID',
  `district_id` INT UNSIGNED NULL DEFAULT NULL COMMENT '지역 ID',
  `title` VARCHAR(30) NOT NULL COMMENT '제목',
  `description` TEXT NULL DEFAULT NULL COMMENT '상세 설명',
  `summary` VARCHAR(100) NULL DEFAULT NULL COMMENT '요약',
  `view_count` INT UNSIGNED NOT NULL DEFAULT '0' COMMENT '조회수',
  `start_at` DATETIME NOT NULL COMMENT '프로젝트 시작일시',
  `end_at` DATETIME NOT NULL COMMENT '프로젝트 종료일시',
  `apply_deadline` DATETIME NOT NULL COMMENT '지원 마감일시',
  `thumbnail_url` VARCHAR(512) NULL DEFAULT NULL COMMENT '썸네일 URL',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일시',
  `updated_at` DATETIME NULL DEFAULT NULL COMMENT '수정일시',
  `closed_at` DATETIME NULL DEFAULT NULL COMMENT '마감일시',
  `deleted_at` DATETIME NULL DEFAULT NULL COMMENT '삭제일시',
  `deleted_by` INT UNSIGNED NULL DEFAULT NULL COMMENT '삭제자 관리자 ID',
  PRIMARY KEY (`id`),
  INDEX `idx_project_member_id` (`member_id` ASC) VISIBLE,
  INDEX `idx_project_district_id` (`district_id` ASC) VISIBLE,
  INDEX `idx_project_dates` (`apply_deadline` ASC, `start_at` ASC, `deleted_at` ASC) VISIBLE,
  INDEX `idx_project_created_at` (`created_at` DESC) VISIBLE,
  FULLTEXT INDEX `ft_project_title_desc` (`title`, `description`) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = '프로젝트';


-- -----------------------------------------------------
-- Table `moas_db`.`province`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `moas_db`.`province` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '시도 ID',
  `code` VARCHAR(10) NOT NULL COMMENT '시도 코드',
  `name_ko` VARCHAR(50) NOT NULL COMMENT '시도명',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_province_code` (`code` ASC) VISIBLE,
  INDEX `idx_province_name` (`name_ko` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = '시/도 마스터';

-- 시/도 마스터 데이터 삽입
INSERT INTO `moas_db`.`province` (`code`, `name_ko`) VALUES
('1100000000', '서울특별시'),
('2600000000', '부산광역시'),
('2700000000', '대구광역시'),
('2800000000', '인천광역시'),
('2900000000', '광주광역시'),
('3000000000', '대전광역시'),
('3100000000', '울산광역시'),
('3600000000', '세종특별자치시'),
('4100000000', '경기도'),
('4300000000', '충청북도'),
('4400000000', '충청남도'),
('4600000000', '전라남도'),
('4700000000', '경상북도'),
('4800000000', '경상남도'),
('5000000000', '제주특별자치도'),
('5100000000', '강원특별자치도'),
('5200000000', '전북특별자치도');

-- 서울특별시 (1100000000)
SET @province_id = (SELECT id FROM `moas_db`.`province` WHERE code = '1100000000');
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '1111000000','서울특별시 종로구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '1114000000','서울특별시 중구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '1117000000','서울특별시 용산구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '1120000000','서울특별시 성동구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '1121500000','서울특별시 광진구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '1123000000','서울특별시 동대문구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '1126000000','서울특별시 중랑구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '1129000000','서울특별시 성북구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '1130500000','서울특별시 강북구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '1132000000','서울특별시 도봉구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '1135000000','서울특별시 노원구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '1138000000','서울특별시 은평구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '1141000000','서울특별시 서대문구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '1144000000','서울특별시 마포구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '1147000000','서울특별시 양천구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '1150000000','서울특별시 강서구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '1153000000','서울특별시 구로구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '1154500000','서울특별시 금천구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '1156000000','서울특별시 영등포구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '1159000000','서울특별시 동작구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '1162000000','서울특별시 관악구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '1165000000','서울특별시 서초구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '1168000000','서울특별시 강남구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '1171000000','서울특별시 송파구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '1174000000','서울특별시 강동구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);

-- 부산광역시 (2600000000)
SET @province_id = (SELECT id FROM `moas_db`.`province` WHERE code = '2600000000');
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '2611000000','부산광역시 중구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '2614000000','부산광역시 서구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '2617000000','부산광역시 동구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '2620000000','부산광역시 영도구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '2623000000','부산광역시 부산진구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '2626000000','부산광역시 동래구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '2629000000','부산광역시 남구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '2632000000','부산광역시 북구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '2635000000','부산광역시 해운대구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '2638000000','부산광역시 사하구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '2641000000','부산광역시 금정구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '2644000000','부산광역시 강서구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '2647000000','부산광역시 연제구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '2650000000','부산광역시 수영구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '2653000000','부산광역시 사상구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '2671000000','부산광역시 기장군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);

-- 대구광역시 (2700000000)
SET @province_id = (SELECT id FROM `moas_db`.`province` WHERE code = '2700000000');
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '2711000000','대구광역시 중구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '2714000000','대구광역시 동구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '2717000000','대구광역시 서구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '2720000000','대구광역시 남구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '2723000000','대구광역시 북구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '2726000000','대구광역시 수성구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '2729000000','대구광역시 달서구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '2771000000','대구광역시 달성군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '2772000000','대구광역시 군위군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);

-- 인천광역시 (2800000000)
SET @province_id = (SELECT id FROM `moas_db`.`province` WHERE code = '2800000000');
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '2811000000','인천광역시 중구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '2814000000','인천광역시 동구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '2817700000','인천광역시 미추홀구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '2818500000','인천광역시 연수구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '2820000000','인천광역시 남동구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '2823700000','인천광역시 부평구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '2824500000','인천광역시 계양구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '2826000000','인천광역시 서구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '2871000000','인천광역시 강화군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '2872000000','인천광역시 옹진군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);

-- 광주광역시 (2900000000)
SET @province_id = (SELECT id FROM `moas_db`.`province` WHERE code = '2900000000');
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '2911000000','광주광역시 동구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '2914000000','광주광역시 서구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '2915500000','광주광역시 남구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '2917000000','광주광역시 북구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '2920000000','광주광역시 광산구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);

-- 대전광역시 (3000000000)
SET @province_id = (SELECT id FROM `moas_db`.`province` WHERE code = '3000000000');
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '3011000000','대전광역시 동구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '3014000000','대전광역시 중구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '3017000000','대전광역시 서구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '3020000000','대전광역시 유성구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '3023000000','대전광역시 대덕구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);

-- 울산광역시 (3100000000)
SET @province_id = (SELECT id FROM `moas_db`.`province` WHERE code = '3100000000');
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '3111000000','울산광역시 중구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '3114000000','울산광역시 남구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '3117000000','울산광역시 동구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '3120000000','울산광역시 북구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '3171000000','울산광역시 울주군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);

-- 세종특별자치시 (3600000000)
SET @province_id = (SELECT id FROM `moas_db`.`province` WHERE code = '3600000000');
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '3611000000', '세종특별자치시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);

-- 경기도 (4100000000)
SET @province_id = (SELECT id FROM `moas_db`.`province` WHERE code = '4100000000');
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4111000000','경기도 수원시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4111100000','경기도 수원시 장안구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4111300000','경기도 수원시 권선구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4111500000','경기도 수원시 팔달구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4111700000','경기도 수원시 영통구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4113000000','경기도 성남시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4113100000','경기도 성남시 수정구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4113300000','경기도 성남시 중원구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4113500000','경기도 성남시 분당구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4115000000','경기도 의정부시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4117000000','경기도 안양시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4117100000','경기도 안양시 만안구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4117300000','경기도 안양시 동안구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4119000000','경기도 부천시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4119200000','경기도 부천시 원미구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4119400000','경기도 부천시 소사구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4119600000','경기도 부천시 오정구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4121000000','경기도 광명시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4122000000','경기도 평택시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4125000000','경기도 동두천시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4127000000','경기도 안산시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4127100000','경기도 안산시 상록구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4127300000','경기도 안산시 단원구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4128000000','경기도 고양시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4128100000','경기도 고양시 덕양구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4128500000','경기도 고양시 일산동구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4128700000','경기도 고양시 일산서구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4129000000','경기도 과천시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4131000000','경기도 구리시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4136000000','경기도 남양주시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4137000000','경기도 오산시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4139000000','경기도 시흥시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4141000000','경기도 군포시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4143000000','경기도 의왕시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4145000000','경기도 하남시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4146000000','경기도 용인시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4146100000','경기도 용인시 처인구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4146300000','경기도 용인시 기흥구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4146500000','경기도 용인시 수지구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4148000000','경기도 파주시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4150000000','경기도 이천시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4155000000','경기도 안성시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4157000000','경기도 김포시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4159000000','경기도 화성시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4161000000','경기도 광주시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4163000000','경기도 양주시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4165000000','경기도 포천시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4167000000','경기도 여주시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4180000000','경기도 연천군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4182000000','경기도 가평군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4183000000','경기도 양평군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);


-- 충청북도 (4300000000)
SET @province_id = (SELECT id FROM `moas_db`.`province` WHERE code = '4300000000');
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4311000000','충청북도 청주시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4311100000','충청북도 청주시 상당구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4311200000','충청북도 청주시 서원구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4311300000','충청북도 청주시 흥덕구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4311400000','충청북도 청주시 청원구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4313000000','충청북도 충주시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4315000000','충청북도 제천시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4372000000','충청북도 보은군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4373000000','충청북도 옥천군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4374000000','충청북도 영동군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4374500000','충청북도 증평군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4375000000','충청북도 진천군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4376000000','충청북도 괴산군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4377000000','충청북도 음성군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4380000000','충청북도 단양군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);

-- 충청남도 (4400000000)
SET @province_id = (SELECT id FROM `moas_db`.`province` WHERE code = '4400000000');
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4413000000','충청남도 천안시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4413100000','충청남도 천안시 동남구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4413300000','충청남도 천안시 서북구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4415000000','충청남도 공주시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4418000000','충청남도 보령시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4420000000','충청남도 아산시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4421000000','충청남도 서산시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4423000000','충청남도 논산시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4425000000','충청남도 계룡시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4427000000','충청남도 당진시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4471000000','충청남도 금산군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4476000000','충청남도 부여군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4477000000','충청남도 서천군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4479000000','충청남도 청양군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4480000000','충청남도 홍성군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4481000000','충청남도 예산군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4482500000','충청남도 태안군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);

-- 전라남도 (4600000000)
SET @province_id = (SELECT id FROM `moas_db`.`province` WHERE code = '4600000000');
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4611000000','전라남도 목포시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4613000000','전라남도 여수시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4615000000','전라남도 순천시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4617000000','전라남도 나주시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4623000000','전라남도 광양시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4671000000','전라남도 담양군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4672000000','전라남도 곡성군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4673000000','전라남도 구례군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4677000000','전라남도 고흥군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4678000000','전라남도 보성군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4679000000','전라남도 화순군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4680000000','전라남도 장흥군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4681000000','전라남도 강진군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4682000000','전라남도 해남군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4683000000','전라남도 영암군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4684000000','전라남도 무안군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4686000000','전라남도 함평군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4687000000','전라남도 영광군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4688000000','전라남도 장성군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4689000000','전라남도 완도군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4690000000','전라남도 진도군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4691000000','전라남도 신안군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);

-- 경상북도 (4700000000)
SET @province_id = (SELECT id FROM `moas_db`.`province` WHERE code = '4700000000');
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4711000000','경상북도 포항시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4711100000','경상북도 포항시 남구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4711300000','경상북도 포항시 북구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4713000000','경상북도 경주시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4715000000','경상북도 김천시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4717000000','경상북도 안동시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4719000000','경상북도 구미시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4721000000','경상북도 영주시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4723000000','경상북도 영천시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4725000000','경상북도 상주시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4728000000','경상북도 문경시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4729000000','경상북도 경산시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4773000000','경상북도 의성군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4775000000','경상북도 청송군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4776000000','경상북도 영양군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4777000000','경상북도 영덕군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4782000000','경상북도 청도군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4783000000','경상북도 고령군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4784000000','경상북도 성주군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4785000000','경상북도 칠곡군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4790000000','경상북도 예천군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4792000000','경상북도 봉화군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4793000000','경상북도 울진군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4794000000','경상북도 울릉군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);

-- 경상남도 (4800000000)
SET @province_id = (SELECT id FROM `moas_db`.`province` WHERE code = '4800000000');
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4812000000','경상남도 창원시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4812100000','경상남도 창원시 의창구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4812300000','경상남도 창원시 성산구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4812500000','경상남도 창원시 마산합포구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4812700000','경상남도 창원시 마산회원구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4812900000','경상남도 창원시 진해구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4817000000','경상남도 진주시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4822000000','경상남도 통영시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4824000000','경상남도 사천시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4825000000','경상남도 김해시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4827000000','경상남도 밀양시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4831000000','경상남도 거제시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4833000000','경상남도 양산시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4872000000','경상남도 의령군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4873000000','경상남도 함안군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4874000000','경상남도 창녕군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4882000000','경상남도 고성군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4884000000','경상남도 남해군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4885000000','경상남도 하동군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4886000000','경상남도 산청군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4887000000','경상남도 함양군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4888000000','경상남도 거창군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '4889000000','경상남도 합천군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);

-- 제주특별자치도 (5000000000)
SET @province_id = (SELECT id FROM `moas_db`.`province` WHERE code = '5000000000');
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '5011000000','제주특별자치도 제주시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '5013000000','제주특별자치도 서귀포시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);

-- 강원특별자치도 (5100000000)
SET @province_id = (SELECT id FROM `moas_db`.`province` WHERE code = '5100000000');
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '5111000000','강원특별자치도 춘천시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '5113000000','강원특별자치도 원주시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '5115000000','강원특별자치도 강릉시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '5117000000','강원특별자치도 동해시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '5119000000','강원특별자치도 태백시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '5121000000','강원특별자치도 속초시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '5123000000','강원특별자치도 삼척시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '5172000000','강원특별자치도 홍천군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '5173000000','강원특별자치도 횡성군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '5175000000','강원특별자치도 영월군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '5176000000','강원특별자치도 평창군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '5177000000','강원특별자치도 정선군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '5178000000','강원특별자치도 철원군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '5179000000','강원특별자치도 화천군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '5180000000','강원특별자치도 양구군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '5181000000','강원특별자치도 인제군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '5182000000','강원특별자치도 고성군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '5183000000','강원특별자치도 양양군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);

-- 전북특별자치도 (5200000000)
SET @province_id = (SELECT id FROM `moas_db`.`province` WHERE code = '5200000000');
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '5211000000','전북특별자치도 전주시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '5211100000','전북특별자치도 전주시 완산구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '5211300000','전북특별자치도 전주시 덕진구') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '5213000000','전북특별자치도 군산시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '5214000000','전북특별자치도 익산시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '5218000000','전북특별자치도 정읍시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '5219000000','전북특별자치도 남원시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '5221000000','전북특별자치도 김제시') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '5271000000','전북특별자치도 완주군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '5272000000','전북특별자치도 진안군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '5273000000','전북특별자치도 무주군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '5274000000','전북특별자치도 장수군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '5275000000','전북특별자치도 임실군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '5277000000','전북특별자치도 순창군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '5279000000','전북특별자치도 고창군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);
INSERT INTO `moas_db`.`district` (province_id, code, name_ko) VALUES (@province_id, '5280000000','전북특별자치도 부안군') ON DUPLICATE KEY UPDATE name_ko=VALUES(name_ko), province_id=VALUES(province_id);



-- -----------------------------------------------------
-- Table `moas_db`.`review`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `moas_db`.`review` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '리뷰 ID',
  `contract_id` BIGINT UNSIGNED NOT NULL COMMENT '계약 ID',
  `reviewer_member_id` INT UNSIGNED NOT NULL COMMENT '평가자 회원 ID',
  `reviewee_member_id` INT UNSIGNED NOT NULL COMMENT '피평가자 회원 ID',
  `rating` TINYINT UNSIGNED NOT NULL COMMENT '평점 (1-5)',
  `comment` VARCHAR(500) NULL DEFAULT NULL COMMENT '리뷰 내용',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_review` (`contract_id` ASC, `reviewer_member_id` ASC, `reviewee_member_id` ASC) VISIBLE,
  INDEX `idx_review_reviewer_id` (`reviewer_member_id` ASC) VISIBLE,
  INDEX `idx_review_reviewee_id` (`reviewee_member_id` ASC) VISIBLE,
  INDEX `idx_review_created_at` (`created_at` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = '프로젝트 리뷰';


-- -----------------------------------------------------
-- Table `moas_db`.`total_penalty`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `moas_db`.`total_penalty` (
  `id` INT UNSIGNED NOT NULL COMMENT '회원 ID',
  `score` TINYINT UNSIGNED NOT NULL DEFAULT '0' COMMENT '누적 페널티 점수',
  `updated_at` DATETIME NULL DEFAULT NULL COMMENT '수정일시',
  PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = '회원 누적 페널티';


-- 카테고리 (대분류) 삽입
INSERT INTO `moas_db`.`category` (`category_name`) VALUES
('음악/공연'),
('사진/영상/미디어'),
('디자인'),
('기타');

-- 포지션 (소분류) 삽입
-- 음악/공연 (category_id = 1)
INSERT INTO `moas_db`.`position` (`category_id`, `position_name`) VALUES
(1, '댄서'),
(1, '뮤지션'),
(1, 'DJ'),
(1, '가수');

-- 사진/영상/미디어 (category_id = 2)
INSERT INTO `moas_db`.`position` (`category_id`, `position_name`) VALUES
(2, '포토그래퍼'),
(2, '영상감독'),
(2, '크리에이터'),
(2, '배우'),
(2, '모델');

-- 디자인 (category_id = 3)
INSERT INTO `moas_db`.`position` (`category_id`, `position_name`) VALUES
(3, '디자이너'),
(3, '그래피티 아티스트'),
(3, '일러스트레이터'),
(3, '그래픽 디자이너'),
(3, '타투이스트');

-- 기타 (category_id = 4)
INSERT INTO `moas_db`.`position` (`category_id`, `position_name`) VALUES
(4, '기타');

-- 결제 주문 정보
CREATE TABLE IF NOT EXISTS moas_db.order (
id VARCHAR(64) NOT NULL COMMENT '주문 ID (merchant_uid)',
contract_id BIGINT UNSIGNED NOT NULL COMMENT '관련 계약 ID',
member_id INT UNSIGNED NOT NULL COMMENT '결제자 회원 ID',
amount BIGINT UNSIGNED NOT NULL COMMENT '결제 요청 금액',
status ENUM('PENDING', 'PAID', 'FAILED', 'CANCELED', 'PARTIAL_CANCELED') NOT NULL DEFAULT 'PENDING' COMMENT '주문 상태',
payment_key VARCHAR(200) NULL DEFAULT NULL COMMENT '결제 KEY',
created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
updated_at DATETIME NULL DEFAULT NULL COMMENT '수정일시',
PRIMARY KEY (id),
INDEX idx_order_contract_id (contract_id ASC) VISIBLE,
INDEX idx_order_member_id (member_id ASC) VISIBLE,
INDEX idx_order_status (status ASC, created_at ASC) VISIBLE
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci
COMMENT = '결제 주문 정보';

