package com.finance.finance_tracker_backend.service.impl;

import com.finance.finance_tracker_backend.dto.budget.BudgetRequest;
import com.finance.finance_tracker_backend.dto.budget.BudgetResponse;
import com.finance.finance_tracker_backend.entity.Budget;
import com.finance.finance_tracker_backend.entity.Transaction;
import com.finance.finance_tracker_backend.entity.User;
import com.finance.finance_tracker_backend.enums.Category;
import com.finance.finance_tracker_backend.enums.TransactionType;
import com.finance.finance_tracker_backend.exception.DuplicateResourceException;
import com.finance.finance_tracker_backend.exception.ForbiddenException;
import com.finance.finance_tracker_backend.exception.ResourceNotFoundException;
import com.finance.finance_tracker_backend.mapper.BudgetMapper;
import com.finance.finance_tracker_backend.repository.BudgetRepository;
import com.finance.finance_tracker_backend.repository.TransactionRepository;
import com.finance.finance_tracker_backend.repository.UserRepository;
import com.finance.finance_tracker_backend.service.BudgetService;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final BudgetMapper budgetMapper;
    private final TransactionRepository transactionRepository;

    public BudgetServiceImpl(BudgetRepository budgetRepository,
                             UserRepository userRepository,
                             BudgetMapper budgetMapper,
                             TransactionRepository transactionRepository) {
        this.budgetRepository = budgetRepository;
        this.userRepository = userRepository;
        this.budgetMapper = budgetMapper;
        this.transactionRepository = transactionRepository;
    }

    @Override
    @Transactional
    public BudgetResponse createBudget(BudgetRequest request, String email) {
        User user = getUser(email);

        if (budgetRepository.existsByUserAndCategoryAndMonthAndYear(
                user, request.getCategory(), request.getMonth(), request.getYear())) {
            throw new DuplicateResourceException(String.format("Budget already exists for category %s in %d-%02d",
                    request.getCategory(), request.getYear(), request.getMonth()));
        }

        Budget budget = budgetMapper.toEntity(request);
        budget.setUser(user);

        // Recalculate spent amount from existing transactions if any
        BigDecimal spent = calculateSpentAmount(user, request.getCategory(), request.getMonth(), request.getYear());
        budget.setSpentAmount(spent);

        Budget savedBudget = budgetRepository.save(budget);
        return budgetMapper.toResponse(savedBudget);
    }

    @Override
    @Transactional
    public BudgetResponse updateBudget(Long id, BudgetRequest request, String email) {
        User user = getUser(email);
        Budget budget = getBudgetAndValidateOwnership(id, user);

        // If category or month or year changed, check for duplicate config
        if (budget.getCategory() != request.getCategory() ||
                !budget.getMonth().equals(request.getMonth()) ||
                !budget.getYear().equals(request.getYear())) {
            
            if (budgetRepository.existsByUserAndCategoryAndMonthAndYear(
                    user, request.getCategory(), request.getMonth(), request.getYear())) {
                throw new DuplicateResourceException("Another budget exists with the target category, month, and year");
            }
        }

        budgetMapper.updateEntityFromRequest(request, budget);
        
        // Recalculate spent amount
        BigDecimal spent = calculateSpentAmount(user, request.getCategory(), request.getMonth(), request.getYear());
        budget.setSpentAmount(spent);

        Budget updatedBudget = budgetRepository.save(budget);
        return budgetMapper.toResponse(updatedBudget);
    }

    @Override
    @Transactional
    public void deleteBudget(Long id, String email) {
        User user = getUser(email);
        Budget budget = getBudgetAndValidateOwnership(id, user);
        budgetRepository.delete(budget);
    }

    @Override
    @Transactional(readOnly = true)
    public BudgetResponse getBudgetById(Long id, String email) {
        User user = getUser(email);
        Budget budget = getBudgetAndValidateOwnership(id, user);
        return budgetMapper.toResponse(budget);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BudgetResponse> getBudgetsByMonthAndYear(Integer month, Integer year, String email) {
        User user = getUser(email);
        List<Budget> budgets = budgetRepository.findByUserAndMonthAndYear(user, month, year);
        return budgets.stream()
                .map(budgetMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BudgetResponse> getAllBudgets(String email) {
        User user = getUser(email);
        List<Budget> budgets = budgetRepository.findAllByUser(user);
        return budgets.stream()
                .map(budgetMapper::toResponse)
                .collect(Collectors.toList());
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    private Budget getBudgetAndValidateOwnership(Long id, User user) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with id: " + id));

        if (!budget.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You do not have permission to access this budget");
        }
        return budget;
    }

    private BigDecimal calculateSpentAmount(User user, Category category, int month, int year) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        Specification<Transaction> spec = Specification.where((root, query, cb) -> cb.and(
                cb.equal(root.get("user"), user),
                cb.equal(root.get("transactionType"), TransactionType.EXPENSE),
                cb.equal(root.get("category"), category),
                cb.between(root.get("transactionDate"), start, end)
        ));

        List<Transaction> transactions = transactionRepository.findAll(spec);
        return transactions.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
