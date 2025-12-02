package com.s401.moas.application.controller.response;

import com.s401.moas.application.service.dto.ApplicationStatusUpdateDto;
import lombok.Getter;

@Getter
public class ApplicationRejectResponse {
    private final Long applicationId;
    private final String status;

    private ApplicationRejectResponse(Long applicationId, String status) {
        this.applicationId = applicationId;
        this.status = status;
    }

    public static ApplicationRejectResponse from(ApplicationStatusUpdateDto dto) {
        return new ApplicationRejectResponse(dto.getApplicationId(), dto.getStatus().name());
    }
}