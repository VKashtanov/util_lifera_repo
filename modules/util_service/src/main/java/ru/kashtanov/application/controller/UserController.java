package ru.kashtanov.application.controller;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;

import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.service.UserLocalServiceUtil;
import io.swagger.v3.oas.annotations.Parameter;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import ru.kashtanov.application.dto.SearchUserRequest;
import ru.kashtanov.application.dto.UserDto;
import ru.kashtanov.application.service.UserService;

import javax.ws.rs.*;
import javax.ws.rs.core.Application;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;


/**
 * @author ASUS
 */
@Component(
        property = {
                "osgi.jaxrs.application.base=/util-incomand-api",
                "osgi.jaxrs.name=EventRegistrationController",
                "liferay.access.control.disable=true",
                "liferay.oauth.disable=true"
        },
        service = Application.class
)
public class UserController extends Application {
    private static final Log log = LogFactoryUtil.getLog(UserController.class);

    @Reference
    private UserService userService;


    @POST
    @Path("/users/_search")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public List<UserDto> searchColleagues(SearchUserRequest request) {
        var companyId = request.getCompanyId();
        var keyword = request.getKeyword();
        var limit = request.getLimit();
        var offset = request.getOffset();
        List<UserDto> users = userService.findUsers(companyId, keyword, limit, offset);
        log.debug("searchColleagues called. Searching users limit " + limit + " for " + keyword);
        return users;
    }


    @GET
    @Path("/users/{userId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getUser(@PathParam("userId") Long userId) {
        Optional<UserDto> userById1 = userService.findUserById(userId);
        return userById1.map(user -> Response.ok(user).build())
                .orElse(Response.status(Response.Status.NOT_FOUND).build());
    }


    @GET
    @Path("/health")
    @Produces("text/plain")
    public String healthCheck() {
        return "It works";
    }

    public Set<Object> getSingletons() {
        return Collections.<Object>singleton(this);
    }

}