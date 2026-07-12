package com.finance.finance_tracker_backend.repository;

import com.finance.finance_tracker_backend.entity.Transaction;
import com.finance.finance_tracker_backend.entity.User;
import com.finance.finance_tracker_backend.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long>, JpaSpecificationExecutor<Transaction> {

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user = :user AND t.transactionType = :type")
    BigDecimal sumAmountByUserAndType(@Param("user") User user, @Param("type") TransactionType type);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user = :user AND t.transactionType = :type AND t.transactionDate BETWEEN :startDate AND :endDate")
    BigDecimal sumAmountByUserAndTypeAndDateBetween(@Param("user") User user, 
                                                    @Param("type") TransactionType type, 
                                                    @Param("startDate") LocalDate startDate, 
                                                    @Param("endDate") LocalDate endDate);

    @Query("SELECT t.category, COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user = :user AND t.transactionType = :type GROUP BY t.category")
    List<Object[]> sumAmountByCategory(@Param("user") User user, @Param("type") TransactionType type);

    @Query("SELECT t.category, COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user = :user AND t.transactionType = :type AND t.transactionDate BETWEEN :startDate AND :endDate GROUP BY t.category")
    List<Object[]> sumAmountByCategoryAndDateBetween(@Param("user") User user, 
                                                     @Param("type") TransactionType type, 
                                                     @Param("startDate") LocalDate startDate, 
                                                     @Param("endDate") LocalDate endDate);

    @Query("SELECT FUNCTION('YEAR', t.transactionDate) as yr, FUNCTION('MONTH', t.transactionDate) as mth, t.transactionType, COALESCE(SUM(t.amount), 0) " +
           "FROM Transaction t WHERE t.user = :user GROUP BY FUNCTION('YEAR', t.transactionDate), FUNCTION('MONTH', t.transactionDate), t.transactionType " +
           "ORDER BY yr DESC, mth DESC")
    List<Object[]> sumAmountByMonthAndType(@Param("user") User user);
    
    List<Transaction> findAllByUser(User user);
    
    List<Transaction> findAllByUserAndTransactionDateBetween(User user, LocalDate start, LocalDate end);
}
