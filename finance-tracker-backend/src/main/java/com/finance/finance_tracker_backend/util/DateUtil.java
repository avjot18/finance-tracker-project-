package com.finance.finance_tracker_backend.util;

import java.time.LocalDate;
import java.time.LocalDateTime;

public final class DateUtil {

    private DateUtil() {
        // Restrict instantiation
    }

    public static LocalDate parseDate(String dateStr) {
        return com.finance.finance_tracker_backend.common.util.DateUtil.parseDate(dateStr);
    }

    public static String formatDate(LocalDate date) {
        return com.finance.finance_tracker_backend.common.util.DateUtil.formatDate(date);
    }

    public static LocalDate getStartOfMonth(int year, int month) {
        return com.finance.finance_tracker_backend.common.util.DateUtil.getStartOfMonth(year, month);
    }

    public static LocalDate getEndOfMonth(int year, int month) {
        return com.finance.finance_tracker_backend.common.util.DateUtil.getEndOfMonth(year, month);
    }

    public static LocalDateTime parseDateTime(String dateTimeStr) {
        return com.finance.finance_tracker_backend.common.util.DateUtil.parseDateTime(dateTimeStr);
    }
}
