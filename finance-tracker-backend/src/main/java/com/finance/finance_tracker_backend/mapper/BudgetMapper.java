package com.finance.finance_tracker_backend.mapper;

import com.finance.finance_tracker_backend.dto.budget.BudgetRequest;
import com.finance.finance_tracker_backend.dto.budget.BudgetResponse;
import com.finance.finance_tracker_backend.entity.Budget;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
public class BudgetMapper {

    public Budget toEntity(BudgetRequest request) {
        if (request == null) {
            return null;
        }

        return Budget.builder()
                .category(request.getCategory())
                .monthlyLimit(request.getMonthlyLimit())
                .spentAmount(BigDecimal.ZERO)
                .month(request.getMonth())
                .year(request.getYear())
                .build();
    }

    public BudgetResponse toResponse(Budget budget) {
        if (budget == null) {
            return null;
        }

        BigDecimal limit = budget.getMonthlyLimit();
        BigDecimal spent = budget.getSpentAmount() != null ? budget.getSpentAmount() : BigDecimal.ZERO;
        BigDecimal remaining = limit.subtract(spent);

        double percentage = 0.0;
        if (limit.compareTo(BigDecimal.ZERO) > 0) {
            percentage = spent.multiply(BigDecimal.valueOf(100))
                    .divide(limit, 2, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        return BudgetResponse.builder()
                .id(budget.getId())
                .category(budget.getCategory())
                .monthlyLimit(limit)
                .spentAmount(spent)
                .remainingBudget(remaining)
                .percentageUsed(percentage)
                .month(budget.getMonth())
                .year(budget.getYear())
                .createdAt(budget.getCreatedAt())
                .updatedAt(budget.getUpdatedAt())
                .build();
    }

    public void updateEntityFromRequest(BudgetRequest request, Budget budget) {
        if (request == null || budget == null) {
            return;
        }

        budget.setCategory(request.getCategory());
        budget.setMonthlyLimit(request.getMonthlyLimit());
        budget.setMonth(request.getMonth());
        budget.setYear(request.getYear());
    }
}
