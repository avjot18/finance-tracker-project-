package com.finance.finance_tracker_backend.service;

import com.finance.finance_tracker_backend.dto.dashboard.DashboardResponse;

public interface DashboardService {
    
    DashboardResponse getDashboardData(String email);
}
