package com.finance.finance_tracker_backend.dto.budget;

import com.finance.finance_tracker_backend.enums.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetResponse {
    private Long id;
    private Category category;
    private BigDecimal monthlyLimit;
    private BigDecimal spentAmount;
    private BigDecimal remainingBudget;
    private double percentageUsed;
    private Integer month;
    private Integer year;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
