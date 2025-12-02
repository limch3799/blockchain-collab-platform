package com.s401.moas.global.validation;

import java.time.LocalDateTime;

/**
 * 시작일(startAt)과 종료일(endAt)을 가지는 객체임을 나타내는 인터페이스입니다.
 */
public interface DateRange {
    LocalDateTime getStartAt();
    LocalDateTime getEndAt();
}