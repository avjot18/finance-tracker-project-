package com.finance.finance_tracker_backend.dto.common;

import lombok.NoArgsConstructor;

@NoArgsConstructor
public class ApiResponse<T> extends com.finance.finance_tracker_backend.common.response.ApiResponse<T> {
    
    public ApiResponse(boolean success, String message, T data) {
        super(success, message, data, java.time.LocalDateTime.now());
    }
}
