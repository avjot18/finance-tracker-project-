package com.finance.finance_tracker_backend.dto.budget;

import com.finance.finance_tracker_backend.enums.Category;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetRequest {

    @NotNull(message = "Category is required")
    private Category category;

    @NotNull(message = "Monthly limit is required")
    @Positive(message = "Monthly limit must be positive")
    private BigDecimal monthlyLimit;

    @NotNull(message = "Month is required")
    @Min(value = 1, message = "Month must be between 1 and 12")
    @Max(value = 12, message = "Month must be between 1 and 12")
    private Integer month;

    @NotNull(message = "Year is required")
    @Min(value = 2000, message = "Year must be greater than 2000")
    @Max(value = 2100, message = "Year must be less than 2100")
    private Integer year;
}
