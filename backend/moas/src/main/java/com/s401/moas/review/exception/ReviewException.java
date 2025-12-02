package com.s401.moas.review.exception;

import com.s401.moas.contract.domain.ContractStatus;
import com.s401.moas.global.exception.base.BaseException;

public class ReviewException extends BaseException {
    
    private ReviewException(ReviewErrorCode errorCode) {
        super(errorCode);
    }
    
    private ReviewException(ReviewErrorCode errorCode, Object... args) {
        super(errorCode, args);
    }
    
    public static ReviewException reviewAlreadyExists() {
        return new ReviewException(ReviewErrorCode.REVIEW_ALREADY_EXISTS);
    }
    
    public static ReviewException reviewerNotParticipant() {
        return new ReviewException(ReviewErrorCode.REVIEWER_NOT_PARTICIPANT);
    }
    
    public static ReviewException revieweeNotParticipant() {
        return new ReviewException(ReviewErrorCode.REVIEWEE_NOT_PARTICIPANT);
    }
    
    public static ReviewException cannotReviewSelf() {
        return new ReviewException(ReviewErrorCode.REVIEW_SELF_NOT_ALLOWED);
    }
    
    public static ReviewException invalidReviewPair() {
        return new ReviewException(ReviewErrorCode.REVIEW_PAIR_MISMATCH);
    }
    
    public static ReviewException invalidContractStatus(ContractStatus status) {
        return new ReviewException(ReviewErrorCode.REVIEW_INVALID_CONTRACT_STATUS, status.name());
    }
}

