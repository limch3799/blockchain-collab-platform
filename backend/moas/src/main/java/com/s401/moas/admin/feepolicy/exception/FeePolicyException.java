package com.s401.moas.admin.feepolicy.exception;

import com.s401.moas.global.exception.base.BaseException;

public class FeePolicyException extends BaseException {

    public FeePolicyException(FeePolicyErrorCode errorCode) {
        super(errorCode);
    }

    public FeePolicyException(FeePolicyErrorCode errorCode, Object... args) {
        super(errorCode, args);
    }

    public FeePolicyException(FeePolicyErrorCode errorCode, Throwable cause) {
        super(errorCode, cause);
    }

    // Static factory methods
    public static FeePolicyException notFound() {
        return new FeePolicyException(FeePolicyErrorCode.FEE_POLICY_NOT_FOUND);
    }

    public static FeePolicyException invalidFeeRate() {
        return new FeePolicyException(FeePolicyErrorCode.INVALID_FEE_RATE);
    }

    public static FeePolicyException invalidStartDate() {
        return new FeePolicyException(FeePolicyErrorCode.INVALID_START_DATE);
    }

    public static FeePolicyException pastPolicyImmutable() {
        return new FeePolicyException(FeePolicyErrorCode.PAST_POLICY_IMMUTABLE);
    }
}