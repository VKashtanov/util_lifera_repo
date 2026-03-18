package ru.kashtanov.application.service;

import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.json.JSONObject;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.model.User;
import org.osgi.service.component.annotations.Component;
import ru.kashtanov.application.dto.UserDto;
import ru.kashtanov.application.service_impl.DtoConvertorServiceImpl;
import ru.kashtanov.application.service_impl.ResponseServiceImpl;
import ru.kashtanov.application.service_impl.UserSearchServiceImpl;

import java.sql.SQLException;
import java.util.Collections;
import java.util.List;

/**
 * @author Viktor Кashtanov
 */
@Component(service = UserService.class)
public class UserService {
    private static final Log log = LogFactoryUtil.getLog(UserService.class);

    private final UserSearchServiceImpl userSearchService = new UserSearchServiceImpl();
    private final ResponseServiceImpl responseService = new ResponseServiceImpl();
    private final DtoConvertorServiceImpl dtoConvertorService = new DtoConvertorServiceImpl();

    public List<UserDto> findUsers(long companyId, String query, int maxResults) {
        try {
            List<User> foundUsers = userSearchService.search(companyId, query, maxResults);
            return dtoConvertorService.convertToDto(foundUsers);
        } catch (SQLException e) {
            log.error("Impossible to find Users: "+ e);
            return Collections.emptyList();
        }


    }


}
