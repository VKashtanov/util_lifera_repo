package ru.kashtanov.application.dto;

import java.util.Objects;

/**
 * @author Viktor Кashtanov
 */
public class SearchUserRequest {
    private Long companyId;
    private String keyword;
    private Integer limit;
    private Integer offset;

    public Long getCompanyId() {
        return companyId;
    }

    public void setCompanyId(Long companyId) {
        this.companyId = companyId;
    }

    public String getKeyword() {
        return keyword;
    }

    public void setKeyword(String keyword) {
        this.keyword = keyword;
    }

    public Integer getLimit() {
        return limit;
    }

    public void setLimit(Integer limit) {
        this.limit = limit;
    }

    public Integer getOffset() {
        return offset;
    }

    public void setOffset(Integer offset) {
        this.offset = offset;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        SearchUserRequest that = (SearchUserRequest) o;
        return Objects.equals(companyId, that.companyId) && Objects.equals(keyword, that.keyword) && Objects.equals(limit, that.limit) && Objects.equals(offset, that.offset);
    }

    @Override
    public int hashCode() {
        return Objects.hash(companyId, keyword, limit, offset);
    }

    @Override
    public String toString() {
        return "SearchUserRequest{" +
                "companyId=" + companyId +
                ", keyword='" + keyword + '\'' +
                ", limit=" + limit +
                ", offset=" + offset +
                '}';
    }
}
