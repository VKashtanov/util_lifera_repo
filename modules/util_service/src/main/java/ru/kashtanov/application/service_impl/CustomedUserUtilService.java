package ru.kashtanov.application.service_impl;

import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.model.Company;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.model.UserConstants;
import com.liferay.portal.kernel.service.CompanyLocalServiceUtil;
import com.liferay.portal.kernel.service.UserLocalServiceUtil;
import com.liferay.portal.kernel.theme.ThemeDisplay;
import ru.kashtanov.application.dto.UserDto;


public class CustomedUserUtilService {

    public ThemeDisplay createBasicThemeDisplay(long companyId) throws PortalException {
            var themeDisplay = new ThemeDisplay();
            Company company = CompanyLocalServiceUtil.getCompany(companyId);

            themeDisplay.setCompany(company);
            themeDisplay.setPathImage("/image");
            themeDisplay.setPathContext("");

            String portalURL = getPortalURLFromCompany(companyId);
            themeDisplay.setURLPortal(portalURL);
            return themeDisplay;

    }

    public String getPortalURLFromCompany(long companyId) throws PortalException {
        if (companyId == 0) {
            throw new PortalException("Invalid company ID: " + companyId);
        }
        Company company = CompanyLocalServiceUtil.getCompany(companyId);
        String portalURL = company.getPortalURL(UserConstants.USER_ID_DEFAULT);
        if (portalURL != null && !portalURL.isEmpty()) {
            return portalURL;
        }
        return "http://localhost:8080";
    }

    public UserDto getUserDtoById(long userId) throws PortalException {
        User user = UserLocalServiceUtil.getUserById(userId);
        UserDto userDto = new UserDto();
        fillUserDto(userDto, user);
        return userDto;
    }

    private void fillUserDto(UserDto userDto, User user) {
        userDto.setUserId(user.getUserId());
        userDto.setFirstName(user.getFirstName());
        userDto.setLastName(user.getLastName());
        userDto.setEmail(user.getEmailAddress());
        userDto.setFullName(user.getFullName());
        userDto.setPosition(user.getJobTitle());

        String portraitUrl = buildUniversalPortraitUrl(user);
        userDto.setPortraitUrl(portraitUrl);
    }

    private String buildUniversalPortraitUrl(User user) {
        try {
            ThemeDisplay themeDisplay = createBasicThemeDisplay(user.getCompanyId());
            return user.getPortraitURL(themeDisplay);
        } catch (Exception e) {
            return "/image/user_male_portrait";
        }
    }
}
