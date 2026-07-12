package com.finance.finance_tracker_backend.repository;

import com.finance.finance_tracker_backend.entity.Budget;
import com.finance.finance_tracker_backend.entity.User;
import com.finance.finance_tracker_backend.enums.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    Optional<Budget> findByUserAndCategoryAndMonthAndYear(User user, Category category, Integer month, Integer year);

    List<Budget> findByUserAndMonthAndYear(User user, Integer month, Integer year);

    boolean existsByUserAndCategoryAndMonthAndYear(User user, Category category, Integer month, Integer year);
    
    List<Budget> findAllByUser(User user);
}
