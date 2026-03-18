package ru.kashtanov.application.service_impl;

import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.json.JSONArray;
import com.liferay.portal.kernel.json.JSONFactoryUtil;
import com.liferay.portal.kernel.json.JSONObject;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.theme.ThemeDisplay;


import java.time.Instant;
import java.util.ArrayList;
import java.util.List;


public class ResponseServiceImpl {

    public JSONObject buildFoundUsersResponse(List<User> users) throws PortalException {
        var service = new CustomedUserUtilService();
        JSONObject foundUsers = JSONFactoryUtil.createJSONObject();
        JSONObject response = JSONFactoryUtil.createJSONObject();
        response.put("status", "success");
        response.put("timestamp", Instant.now().toString());
        JSONObject data = JSONFactoryUtil.createJSONObject();
        JSONArray jsonArray = JSONFactoryUtil.createJSONArray();
        for (User user : users) {
            JSONObject userItem = JSONFactoryUtil.createJSONObject();
            ThemeDisplay themeDisplay = service.createBasicThemeDisplay(user.getCompanyId());
            String portraitURL = user.getPortraitURL(themeDisplay);

            userItem.put("userId", user.getUserId());
            userItem.put("firstName", user.getFirstName());
            userItem.put("lastName", user.getLastName());
            userItem.put("middleName", user.getMiddleName());
            userItem.put("fullName", user.getLastName() + " " + user.getFirstName() + " " + user.getMiddleName());
            userItem.put("portraitUrl", portraitURL != null ? portraitURL : "");
            userItem.put("position", user.getJobTitle());
            userItem.put("email", user.getEmailAddress());

            jsonArray.put(userItem);
        }
        data.put("items", jsonArray);
        foundUsers.put("response", response);
        foundUsers.put("data", data);

        return foundUsers;
    }

    public JSONObject buildUserJson(User user) throws PortalException {
        JSONObject userItem = JSONFactoryUtil.createJSONObject();
        var service = new CustomedUserUtilService();
        ThemeDisplay themeDisplay = service.createBasicThemeDisplay(user.getCompanyId());
        String portraitURL = user.getPortraitURL(themeDisplay);

        userItem.put("userId", user.getUserId());
        userItem.put("firstName", user.getFirstName());
        userItem.put("lastName", user.getLastName());
        userItem.put("middleName", user.getMiddleName());
        userItem.put("fullName", user.getFullName());
        userItem.put("portraitUrl", portraitURL != null ? portraitURL : "");
        userItem.put("position", user.getJobTitle());
        userItem.put("email", user.getEmailAddress());

        return userItem;
    }



    public JSONObject buildErrorUserFindingResponse(String message, int code) {
        JSONObject response = JSONFactoryUtil.createJSONObject();
        JSONObject status = JSONFactoryUtil.createJSONObject();
        status.put("status", "error");
        status.put("timestamp", Instant.now().toString());
        status.put("message", message);
        status.put("code", code);
        response.put("response", status);
        return response;
    }

    public JSONObject buildSuccessCreatedRegistrationEventResponse(String message, String status, int code, int articleId) {
        JSONObject response = JSONFactoryUtil.createJSONObject();

        JSONObject jsonObject = JSONFactoryUtil.createJSONObject();
        jsonObject.put("status", status);
        jsonObject.put("timestamp", Instant.now().toString());
        jsonObject.put("message", message);
        jsonObject.put("code", code);
        jsonObject.put("articleId", articleId);
        response.put("response", jsonObject);
        return response;
    }


    public JSONObject buildErrorResponse(String message, int code) {
        JSONObject response = JSONFactoryUtil.createJSONObject();
        JSONObject status = JSONFactoryUtil.createJSONObject();
        status.put("status", "error");
        status.put("timestamp", Instant.now().toString());
        status.put("message", message);
        status.put("code", code);
        response.put("response", status);
        return response;
    }
}
