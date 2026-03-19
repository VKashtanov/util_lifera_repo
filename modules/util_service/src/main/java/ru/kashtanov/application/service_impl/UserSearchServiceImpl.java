package ru.kashtanov.application.service_impl;

import com.liferay.portal.kernel.dao.jdbc.DataAccess;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.service.UserLocalServiceUtil;
import com.liferay.portal.kernel.workflow.WorkflowConstants;
import ru.kashtanov.application.dto.UserDto;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;


public class UserSearchServiceImpl {
    private static final Log log = LogFactoryUtil.getLog(UserSearchServiceImpl.class);


    private static List<String> splitQuery(String word) {
        List<String> list = new ArrayList<>();
        if (word == null || word.trim().isEmpty()) {
            return list;
        }
        String[] parts = word.trim().split("\\s+", 3);
        for (String part : parts) {
            String trimmed = part.trim();
            if (!part.trim().isEmpty()) {
                list.add(trimmed);
            }
        }
        return list;
    }

    // To check requests you may in sql_querries_for_searching.sql
    public List<User> search(long companyId, String query, int limit,int offset) throws SQLException {

        List<User> users = new ArrayList<>();
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = DataAccess.getConnection();

            StringBuilder sql = new StringBuilder();
            sql.append("SELECT userId FROM User_ WHERE companyId = ? AND status = ?");

            List<String> conditions = new ArrayList<>();
            List<Object> params = new ArrayList<>();

            params.add(companyId);
            params.add(WorkflowConstants.STATUS_APPROVED);

            List<String> splitQuery = splitQuery(query);
            int querySize = splitQuery.size();
            switch (querySize) {
                case 0:
                    return users;
                case 1:
                    handleOneWord(splitQuery, conditions, params);
                    break;
                case 2:
                    handleTwoWords(splitQuery, conditions, params);
                    break;
                case 3:
                    handleThreeWords(splitQuery, conditions, params);
                    break;
                default:
                    break;
            }
            for (String cond : conditions) {
                sql.append(" AND ").append(cond);
            }

            sql.append(" ORDER BY lastName, firstName LIMIT ? OFFSET ?");
            params.add(limit);
            params.add(offset);

            ps = conn.prepareStatement(sql.toString());
            for (int i = 0; i < params.size(); i++) {
                ps.setObject(i + 1, params.get(i));
            }
            log.debug("SQL: " + sql);

            rs = ps.executeQuery();

            while (rs.next()) {
                long userId = rs.getLong("userId");
                users.add(UserLocalServiceUtil.getUserById(userId));
            }

        } catch (PortalException e) {
            throw new RuntimeException(e);
        } finally {
            DataAccess.cleanUp(conn, ps, rs);
        }
        return users;
    }


    private static void handleOneWord(List<String> splitQuery, List<String> conditions, List<Object> params) {
        String word = splitQuery.get(0).trim().toLowerCase();
        conditions.add("(" +
                "LOWER(firstName) LIKE ? OR " +
                "LOWER(lastName) LIKE ? OR " +
                "LOWER(emailAddress) LIKE ?" +
                ")");
        params.add(word + "%"); // firstName
        params.add(word + "%"); // lastName
        params.add(word + "%"); // emailAddress
    }

    private static void handleTwoWords(List<String> splitQuery, List<String> conditions, List<Object> params) {
        String word1 = splitQuery.get(0).trim().toLowerCase();
        String word2 = splitQuery.get(1).trim().toLowerCase();
        conditions.add("(" +

                "(LOWER(firstName) = ? AND LOWER(lastName) LIKE ?) OR " +

                "(LOWER(lastName) = ? AND LOWER(firstName) LIKE ?) OR " +

                "(LOWER(firstName) = ? AND LOWER(middleName) LIKE ?)" +
                ")");

        params.add(word1);
        params.add(word2 + "%");

        params.add(word1);
        params.add(word2 + "%");

        params.add(word1);
        params.add(word2 + "%");
    }

    private static void handleThreeWords(List<String> splitQuery, List<String> conditions, List<Object> params) {
        String word1 = splitQuery.get(0).trim().toLowerCase();
        String word2 = splitQuery.get(1).trim().toLowerCase();
        String word3 = splitQuery.get(2).trim().toLowerCase();

        conditions.add("(" +

                "(LOWER(firstName) = ? AND LOWER(middleName) = ? AND LOWER(lastName) LIKE ?  ) OR " +
                "(LOWER(lastName) = ? AND LOWER(firstName) = ? AND LOWER(middleName) LIKE ?  )" +
                ")");
        params.add(word1);        // firstName
        params.add(word2);        // middleName
        params.add(word3 + "%");  // lastName

        params.add(word1);        // lastName
        params.add(word2);        // firstName
        params.add(word3 + "%");  // middleName

    }




}
