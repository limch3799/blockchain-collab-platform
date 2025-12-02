package com.s401.moas.global.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.TYPE}) // 클래스, 인터페이스, Enum에 적용 가능
@Retention(RetentionPolicy.RUNTIME) // 런타임까지 어노테이션 정보 유지
@Constraint(validatedBy = DateRangeValidator.class) // 이 어노테이션의 유효성 검증 로직을 담은 클래스 지정
public @interface ValidDateRange {

    // 유효성 검증 실패 시 보여줄 기본 메시지
    String message() default "종료일은 시작일보다 빠를 수 없습니다.";

    // 유효성 검증 그룹을 지정 (사용하지 않으면 기본 그룹)
    Class<?>[] groups() default {};

    // 유효성 검증에 대한 심각도 등을 표현 (사용하지 않으면 빈 배열)
    Class<? extends Payload>[] payload() default {};
}