package com.finance.finance_tracker_backend.common.util;

import com.finance.finance_tracker_backend.common.constants.AppConstants;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

public final class DateUtil {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern(AppConstants.DATE_FORMAT);

    private DateUtil() {
        // Restrict instantiation
    }

    public static LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(dateStr, DATE_FORMATTER);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid date format. Expected " + AppConstants.DATE_FORMAT, e);
        }
    }

    public static String formatDate(LocalDate date) {
        if (date == null) {
            return null;
        }
        return date.format(DATE_FORMATTER);
    }

    public static LocalDate getStartOfMonth(int year, int month) {
        return LocalDate.of(year, month, 1);
    }

    public static LocalDate getEndOfMonth(int year, int month) {
        LocalDate start = getStartOfMonth(year, month);
        return start.withDayOfMonth(start.lengthOfMonth());
    }

    public static LocalDateTime parseDateTime(String dateTimeStr) {
        if (dateTimeStr == null || dateTimeStr.isBlank()) {
            return null;
        }
        return LocalDateTime.parse(dateTimeStr);
    }
}
