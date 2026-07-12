package com.finance.finance_tracker_backend.dto.dashboard;

import com.finance.finance_tracker_backend.dto.transaction.TransactionResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal currentBalance;
    private List<TransactionResponse> recentTransactions;
    private List<CategoryExpenseDTO> categoryExpenses;
    private List<MonthlySummaryDTO> monthlySummary;
}
