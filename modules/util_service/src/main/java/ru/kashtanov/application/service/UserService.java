package ru.kashtanov.application.service;

import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.json.JSONObject;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.model.User;
import org.osgi.service.component.annotations.Component;
import ru.kashtanov.application.service_impl.ResponseServiceImpl;
import ru.kashtanov.application.service_impl.UserSearchServiceImpl;

import java.sql.SQLException;
import java.util.List;

/**
 * @author Viktor Кashtanov
 */
@Component(service = UserService.class)
public class UserService {
    private static final Log log = LogFactoryUtil.getLog(UserService.class);

    private final UserSearchServiceImpl userSearchService = new UserSearchServiceImpl();
    private final ResponseServiceImpl responseService = new ResponseServiceImpl();


    public JSONObject findUsers(long companyId, String query, int maxResults) {
        try {
            List<User> foundUsers = userSearchService.search(companyId, query, maxResults);
            return responseService.buildFoundUsersResponse(foundUsers);
        } catch (SQLException | PortalException e) {
            String message = "Error while searching users: " + e.getMessage();
            log.debug(message);
            return responseService.buildErrorUserFindingResponse(message, 500);
        }
    }
}
