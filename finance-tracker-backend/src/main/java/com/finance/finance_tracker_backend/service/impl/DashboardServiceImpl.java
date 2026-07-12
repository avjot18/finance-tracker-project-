package com.finance.finance_tracker_backend.service.impl;

import com.finance.finance_tracker_backend.dto.dashboard.CategoryExpenseDTO;
import com.finance.finance_tracker_backend.dto.dashboard.DashboardResponse;
import com.finance.finance_tracker_backend.dto.dashboard.MonthlySummaryDTO;
import com.finance.finance_tracker_backend.dto.transaction.TransactionResponse;
import com.finance.finance_tracker_backend.entity.Transaction;
import com.finance.finance_tracker_backend.entity.User;
import com.finance.finance_tracker_backend.enums.Category;
import com.finance.finance_tracker_backend.enums.TransactionType;
import com.finance.finance_tracker_backend.exception.ResourceNotFoundException;
import com.finance.finance_tracker_backend.mapper.TransactionMapper;
import com.finance.finance_tracker_backend.repository.TransactionRepository;
import com.finance.finance_tracker_backend.repository.UserRepository;
import com.finance.finance_tracker_backend.service.DashboardService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Month;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardServiceImpl implements DashboardService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final TransactionMapper transactionMapper;

    public DashboardServiceImpl(TransactionRepository transactionRepository,
                                UserRepository userRepository,
                                TransactionMapper transactionMapper) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.transactionMapper = transactionMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardResponse getDashboardData(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        // 1. Core aggregations
        BigDecimal totalIncome = transactionRepository.sumAmountByUserAndType(user, TransactionType.INCOME);
        BigDecimal totalExpense = transactionRepository.sumAmountByUserAndType(user, TransactionType.EXPENSE);
        BigDecimal currentBalance = totalIncome.subtract(totalExpense);

        // 2. Fetch top 5 recent transactions
        Pageable limit = PageRequest.of(0, 5, Sort.by("transactionDate").descending().and(Sort.by("id").descending()));
        Specification<Transaction> userSpec = (root, query, cb) -> cb.equal(root.get("user"), user);
        Page<Transaction> recentPage = transactionRepository.findAll(userSpec, limit);
        List<TransactionResponse> recentTransactions = recentPage.getContent().stream()
                .map(transactionMapper::toResponse)
                .collect(Collectors.toList());

        // 3. Category expense breakdown
        List<Object[]> categorySums = transactionRepository.sumAmountByCategory(user, TransactionType.EXPENSE);
        List<CategoryExpenseDTO> categoryExpenses = categorySums.stream()
                .map(row -> CategoryExpenseDTO.builder()
                        .category((Category) row[0])
                        .amount((BigDecimal) row[1])
                        .build())
                .collect(Collectors.toList());

        // 4. Chronological monthly summary chart data (Income vs Expense vs Savings)
        List<Object[]> monthlySums = transactionRepository.sumAmountByMonthAndType(user);
        Map<String, MonthlySummaryDTO> summaryMap = new LinkedHashMap<>();

        for (Object[] row : monthlySums) {
            Integer year = (Integer) row[0];
            Integer monthValue = (Integer) row[1];
            TransactionType type = (TransactionType) row[2];
            BigDecimal amount = (BigDecimal) row[3];

            String key = year + "-" + monthValue;
            MonthlySummaryDTO summary = summaryMap.computeIfAbsent(key, k -> {
                String monthName = Month.of(monthValue).name();
                return MonthlySummaryDTO.builder()
                        .year(year)
                        .month(monthValue)
                        .monthName(monthName)
                        .income(BigDecimal.ZERO)
                        .expense(BigDecimal.ZERO)
                        .savings(BigDecimal.ZERO)
                        .build();
            });

            if (type == TransactionType.INCOME) {
                summary.setIncome(amount);
            } else if (type == TransactionType.EXPENSE) {
                summary.setExpense(amount);
            }
        }

        // Calculate net savings per month and convert to sorted list
        List<MonthlySummaryDTO> monthlySummary = summaryMap.values().stream()
                .peek(summary -> summary.setSavings(summary.getIncome().subtract(summary.getExpense())))
                // Sort chronologically: oldest to newest for charting compatibility
                .sorted(Comparator.comparing(MonthlySummaryDTO::getYear).thenComparing(MonthlySummaryDTO::getMonth))
                .collect(Collectors.toList());

        return DashboardResponse.builder()
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .currentBalance(currentBalance)
                .recentTransactions(recentTransactions)
                .categoryExpenses(categoryExpenses)
                .monthlySummary(monthlySummary)
                .build();
    }
}
