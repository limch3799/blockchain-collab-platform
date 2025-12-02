package com.s401.moas.application.service.dto;

import com.s401.moas.application.domain.ApplicationStatus;
import com.s401.moas.application.domain.ProjectApplication;
import lombok.Builder;
import lombok.Getter;

@Getter
public class ApplicationStatusUpdateDto {
    private final Long applicationId;
    private final ApplicationStatus status;

    public ApplicationStatusUpdateDto(Long applicationId, ApplicationStatus status) {
        this.applicationId = applicationId;
        this.status = status;
    }

    public static ApplicationStatusUpdateDto from(ProjectApplication application) {
        return new ApplicationStatusUpdateDto(application.getId(), application.getStatus());
    }
}
