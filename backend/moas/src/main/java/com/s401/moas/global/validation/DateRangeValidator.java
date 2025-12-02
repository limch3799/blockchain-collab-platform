package com.s401.moas.global.validation;

import com.s401.moas.application.controller.request.ContractOfferRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.time.LocalDateTime;

// ConstraintValidator<어노테이션, 검증할 객체의 타입>
public class DateRangeValidator implements ConstraintValidator<ValidDateRange, DateRange> {

    @Override
    public void initialize(ValidDateRange constraintAnnotation) {
        // 어노테이션의 속성을 검증 로직으로 가져와야 할 때 사용 (이번에는 불필요)
    }

    @Override
    public boolean isValid(DateRange dateRangeObject, ConstraintValidatorContext context) {
        LocalDateTime startAt = dateRangeObject.getStartAt();
        LocalDateTime endAt = dateRangeObject.getEndAt();

        // 필드 자체의 null 여부는 @NotNull이 처리하므로, 여기서는 둘 다 null이 아닌 경우만 비교
        if (startAt == null || endAt == null) {
            return true; // @NotNull이 검증하도록 위임
        }

        // 시작일이 종료일보다 이후(after)가 아니면 유효 (같거나 이전이면 true)
        return !startAt.isAfter(endAt);
    }
}