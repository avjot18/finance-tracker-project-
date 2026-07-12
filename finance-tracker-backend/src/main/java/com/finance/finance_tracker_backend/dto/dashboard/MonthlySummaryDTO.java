package com.finance.finance_tracker_backend.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlySummaryDTO {
    private Integer month;
    private Integer year;
    private String monthName;
    private BigDecimal income;
    private BigDecimal expense;
    private BigDecimal savings;
}
