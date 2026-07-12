package com.finance.finance_tracker_backend.common.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorResponse {
    @Builder.Default
    private boolean success = false;
    private String message;
    private List<String> details;
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
