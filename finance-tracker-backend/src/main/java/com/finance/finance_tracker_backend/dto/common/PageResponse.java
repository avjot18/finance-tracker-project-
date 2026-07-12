package com.finance.finance_tracker_backend.dto.common;

import lombok.NoArgsConstructor;
import java.util.List;

@NoArgsConstructor
public class PageResponse<T> extends com.finance.finance_tracker_backend.common.response.PageResponse<T> {

    public PageResponse(List<T> content, int pageNo, int pageSize, long totalElements, int totalPages, boolean last) {
        super(content, pageNo, pageSize, totalElements, totalPages, last);
    }
}
