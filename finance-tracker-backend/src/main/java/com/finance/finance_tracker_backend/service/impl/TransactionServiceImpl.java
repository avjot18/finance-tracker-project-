package com.finance.finance_tracker_backend.service.impl;

import com.finance.finance_tracker_backend.common.response.PageResponse;
import com.finance.finance_tracker_backend.dto.transaction.TransactionRequest;
import com.finance.finance_tracker_backend.dto.transaction.TransactionResponse;
import com.finance.finance_tracker_backend.dto.transaction.TransactionSummaryDTO;
import com.finance.finance_tracker_backend.entity.Budget;
import com.finance.finance_tracker_backend.entity.Transaction;
import com.finance.finance_tracker_backend.entity.User;
import com.finance.finance_tracker_backend.enums.Category;
import com.finance.finance_tracker_backend.enums.TransactionType;
import com.finance.finance_tracker_backend.exception.ForbiddenException;
import com.finance.finance_tracker_backend.exception.ResourceNotFoundException;
import com.finance.finance_tracker_backend.mapper.TransactionMapper;
import com.finance.finance_tracker_backend.repository.BudgetRepository;
import com.finance.finance_tracker_backend.repository.TransactionRepository;
import com.finance.finance_tracker_backend.repository.UserRepository;
import com.finance.finance_tracker_backend.service.TransactionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final TransactionMapper transactionMapper;
    private final BudgetRepository budgetRepository;

    public TransactionServiceImpl(TransactionRepository transactionRepository,
                                  UserRepository userRepository,
                                  TransactionMapper transactionMapper,
                                  BudgetRepository budgetRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.transactionMapper = transactionMapper;
        this.budgetRepository = budgetRepository;
    }

    @Override
    @Transactional
    public TransactionResponse createTransaction(TransactionRequest request, String email) {
        User user = getUser(email);
        Transaction transaction = transactionMapper.toEntity(request);
        transaction.setUser(user);

        Transaction savedTransaction = transactionRepository.save(transaction);

        // Adjust budget spent amount if transaction is an EXPENSE
        if (savedTransaction.getTransactionType() == TransactionType.EXPENSE) {
            updateBudgetSpentAmount(user, savedTransaction.getCategory(), 
                    savedTransaction.getTransactionDate().getMonthValue(), 
                    savedTransaction.getTransactionDate().getYear());
        }

        return transactionMapper.toResponse(savedTransaction);
    }

    @Override
    @Transactional
    public TransactionResponse updateTransaction(Long id, TransactionRequest request, String email) {
        User user = getUser(email);
        Transaction transaction = getTransactionAndValidateOwnership(id, user);

        // Track details before update to adjust budgets
        Category oldCategory = transaction.getCategory();
        TransactionType oldType = transaction.getTransactionType();
        LocalDate oldDate = transaction.getTransactionDate();

        transactionMapper.updateEntityFromRequest(request, transaction);
        Transaction updatedTransaction = transactionRepository.save(transaction);

        // Update budgets for both old and new parameters
        if (oldType == TransactionType.EXPENSE) {
            updateBudgetSpentAmount(user, oldCategory, oldDate.getMonthValue(), oldDate.getYear());
        }
        if (updatedTransaction.getTransactionType() == TransactionType.EXPENSE) {
            updateBudgetSpentAmount(user, updatedTransaction.getCategory(), 
                    updatedTransaction.getTransactionDate().getMonthValue(), 
                    updatedTransaction.getTransactionDate().getYear());
        }

        return transactionMapper.toResponse(updatedTransaction);
    }

    @Override
    @Transactional
    public void deleteTransaction(Long id, String email) {
        User user = getUser(email);
        Transaction transaction = getTransactionAndValidateOwnership(id, user);

        Category category = transaction.getCategory();
        TransactionType type = transaction.getTransactionType();
        LocalDate date = transaction.getTransactionDate();

        transactionRepository.delete(transaction);

        if (type == TransactionType.EXPENSE) {
            updateBudgetSpentAmount(user, category, date.getMonthValue(), date.getYear());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public TransactionResponse getTransactionById(Long id, String email) {
        User user = getUser(email);
        Transaction transaction = getTransactionAndValidateOwnership(id, user);
        return transactionMapper.toResponse(transaction);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TransactionResponse> getAllTransactions(
            String email, int pageNo, int pageSize, String sortBy, String sortDir,
            String search, String category, String type, String startDate, String endDate) {
        
        User user = getUser(email);

        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);

        Specification<Transaction> spec = Specification.where((root, query, cb) -> cb.equal(root.get("user"), user));

        if (search != null && !search.isBlank()) {
            String likePattern = "%" + search.toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("title")), likePattern),
                    cb.like(cb.lower(root.get("description")), likePattern)
            ));
        }

        if (category != null && !category.isBlank()) {
            try {
                Category cat = Category.valueOf(category.toUpperCase());
                spec = spec.and((root, query, cb) -> cb.equal(root.get("category"), cat));
            } catch (IllegalArgumentException e) {
                // Ignore invalid category
            }
        }

        if (type != null && !type.isBlank()) {
            try {
                TransactionType tType = TransactionType.valueOf(type.toUpperCase());
                spec = spec.and((root, query, cb) -> cb.equal(root.get("transactionType"), tType));
            } catch (IllegalArgumentException e) {
                // Ignore invalid type
            }
        }

        if (startDate != null && !startDate.isBlank()) {
            try {
                LocalDate start = LocalDate.parse(startDate);
                spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("transactionDate"), start));
            } catch (Exception e) {
                // Ignore invalid date
            }
        }

        if (endDate != null && !endDate.isBlank()) {
            try {
                LocalDate end = LocalDate.parse(endDate);
                spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("transactionDate"), end));
            } catch (Exception e) {
                // Ignore invalid date
            }
        }

        Page<Transaction> transactionsPage = transactionRepository.findAll(spec, pageable);
        List<TransactionResponse> content = transactionsPage.getContent().stream()
                .map(transactionMapper::toResponse)
                .collect(Collectors.toList());

        return PageResponse.<TransactionResponse>builder()
                .content(content)
                .pageNo(transactionsPage.getNumber())
                .pageSize(transactionsPage.getSize())
                .totalElements(transactionsPage.getTotalElements())
                .totalPages(transactionsPage.getTotalPages())
                .last(transactionsPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public TransactionSummaryDTO getTransactionSummary(String email) {
        User user = getUser(email);
        BigDecimal totalIncome = transactionRepository.sumAmountByUserAndType(user, TransactionType.INCOME);
        BigDecimal totalExpense = transactionRepository.sumAmountByUserAndType(user, TransactionType.EXPENSE);
        BigDecimal netBalance = totalIncome.subtract(totalExpense);
        
        long count = transactionRepository.count(Specification.where((root, query, cb) -> cb.equal(root.get("user"), user)));

        return TransactionSummaryDTO.builder()
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .netBalance(netBalance)
                .transactionCount(count)
                .build();
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    private Transaction getTransactionAndValidateOwnership(Long id, User user) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You do not have permission to access this transaction");
        }
        return transaction;
    }

    private void updateBudgetSpentAmount(User user, Category category, int month, int year) {
        Optional<Budget> budgetOpt = budgetRepository.findByUserAndCategoryAndMonthAndYear(user, category, month, year);
        if (budgetOpt.isPresent()) {
            Budget budget = budgetOpt.get();
            // Calculate sum of expenses for this category, month, and year
            LocalDate start = LocalDate.of(year, month, 1);
            LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
            
            BigDecimal spent = transactionRepository.sumAmountByUserAndTypeAndDateBetween(
                    user, TransactionType.EXPENSE, start, end
            );
            
            // Filter by specific category as well
            // We can fetch it by custom query, or let the transactionRepository support it.
            // Let's implement a filter query in transactionRepository if needed. Or we can query using stream/specification.
            // Wait, we need to calculate spent amount specifically for this user, category, month, year.
            // Let's look at transactionRepository. We did not specify a sumAmountByUserAndTypeAndCategoryAndDateBetween query, 
            // but we can query it using specification or add it. Let's add it or write a JPA query in TransactionRepository later, 
            // or we can just fetch all transactions for that range and filter them. But a direct query is much more efficient!
            // Let's check how we can get the sum of transactions for this category.
            // Let's define the spent amount by querying transactions:
            BigDecimal categorySpent = getSpentAmountByCategoryMonthYear(user, category, start, end);
            budget.setSpentAmount(categorySpent);
            budgetRepository.save(budget);
        }
    }

    private BigDecimal getSpentAmountByCategoryMonthYear(User user, Category category, LocalDate start, LocalDate end) {
        // Query database directly: We can write a quick spec or we can query all and filter, 
        // but direct Specification is cleanest:
        Specification<Transaction> spec = Specification.where((root, query, cb) -> cb.and(
                cb.equal(root.get("user"), user),
                cb.equal(root.get("transactionType"), TransactionType.EXPENSE),
                cb.equal(root.get("category"), category),
                cb.between(root.get("transactionDate"), start, end)
        ));
        List<Transaction> txs = transactionRepository.findAll(spec);
        return txs.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
