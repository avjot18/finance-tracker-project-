package com.finance.finance_tracker_backend.service;

import com.finance.finance_tracker_backend.dto.budget.BudgetResponse;
import com.finance.finance_tracker_backend.dto.budget.BudgetRequest;

import java.util.List;

public interface BudgetService {

    BudgetResponse createBudget(BudgetRequest request, String email);

    BudgetResponse updateBudget(Long id, BudgetRequest request, String email);

    void deleteBudget(Long id, String email);

    BudgetResponse getBudgetById(Long id, String email);

    List<BudgetResponse> getBudgetsByMonthAndYear(Integer month, Integer year, String email);

    List<BudgetResponse> getAllBudgets(String email);
}
