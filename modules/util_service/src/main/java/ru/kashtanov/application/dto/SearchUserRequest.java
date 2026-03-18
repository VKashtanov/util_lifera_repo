package ru.kashtanov.application.dto;

import java.util.Objects;

/**
 * @author Viktor Кashtanov
 */
public class SearchUserRequest {
    private Long companyId;
    private String keyword;
    private Integer limit;

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

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        SearchUserRequest that = (SearchUserRequest) o;
        return Objects.equals(companyId, that.companyId) && Objects.equals(keyword, that.keyword) && Objects.equals(limit, that.limit);
    }

    @Override
    public int hashCode() {
        return Objects.hash(companyId, keyword, limit);
    }

    @Override
    public String toString() {
        return "SearchUserRequest{" +
                "companyId=" + companyId +
                ", keyword='" + keyword + '\'' +
                ", limit=" + limit +
                '}';
    }
}
