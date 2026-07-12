package com.finance.finance_tracker_backend.service;

import java.io.ByteArrayInputStream;

public interface ReportService {

    ByteArrayInputStream generateTransactionsCsvReport(String email);

    ByteArrayInputStream generateTransactionsPdfReport(String email);
}
