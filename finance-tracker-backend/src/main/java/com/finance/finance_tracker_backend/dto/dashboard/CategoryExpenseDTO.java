package com.finance.finance_tracker_backend.dto.dashboard;

import com.finance.finance_tracker_backend.enums.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryExpenseDTO {
    private Category category;
    private BigDecimal amount;
}
