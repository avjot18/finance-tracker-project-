package com.finance.finance_tracker_backend.dto.common;

import lombok.NoArgsConstructor;
import java.util.List;

@NoArgsConstructor
public class ErrorResponse extends com.finance.finance_tracker_backend.common.response.ErrorResponse {

    public ErrorResponse(String message, List<String> details) {
        super(false, message, details, java.time.LocalDateTime.now());
    }
}
