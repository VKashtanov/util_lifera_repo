package ru.gpn.portlet;

import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.servlet.SessionErrors;
import com.liferay.portal.kernel.servlet.SessionMessages;
import com.liferay.portal.kernel.util.ParamUtil;
import com.liferay.portal.kernel.util.Validator;
import ru.gpn.constants.Gratitude_portletPortletKeys;

import com.liferay.portal.kernel.portlet.bridges.mvc.MVCPortlet;

import javax.portlet.*;

import org.osgi.service.component.annotations.Component;

import java.io.IOException;

@Component(
        property = {
                "com.liferay.portlet.display-category=category.sample",
                "com.liferay.portlet.header-portlet-css=/css/main.css",
                "com.liferay.portlet.instanceable=true",
                "javax.portlet.display-name=Gratitude_portlet",
                "javax.portlet.init-param.template-path=/",
                "javax.portlet.init-param.view-template=/view.jsp",
                "javax.portlet.name=" + Gratitude_portletPortletKeys.GRATITUDE_PORTLET,
                "javax.portlet.resource-bundle=content.Language",
                "javax.portlet.security-role-ref=power-user,user"
        },
        service = Portlet.class
)
public class Gratitude_portletPortlet extends MVCPortlet {
    private static final Log log = LogFactoryUtil.getLog(Gratitude_portletPortlet.class);

    @Override
    public void processAction(ActionRequest actionRequest, ActionResponse actionResponse) {
        String mainSiteId = ParamUtil.getString(actionRequest, "mainSiteId", "").trim();
        boolean isWidgetVisible = ParamUtil.getBoolean(actionRequest, "isWidgetVisible", false);
        boolean isListingVisible = ParamUtil.getBoolean(actionRequest, "isListingVisible", false);

        if (Validator.isNull(mainSiteId)) {
            SessionErrors.add(actionRequest, "emptyMainSiteId", "Пожалуйста, введите ID сайта");
            return;
        }

        if (!mainSiteId.matches("\\d+")) {
            SessionErrors.add(actionRequest, "invalidSiteId", "ID сайта должен содержать только цифры");
            return;
        }

        PortletPreferences preferences = actionRequest.getPreferences();
        try {
            preferences.setValue("mainSiteId", mainSiteId);
            preferences.setValue("isWidgetVisible", String.valueOf(isWidgetVisible));
            preferences.setValue("isListingVisible", String.valueOf(isListingVisible));

            preferences.store();
            log.debug("Preferences saved successfully");
            SessionMessages.add(actionRequest, "preferencesSaved", "Настройки успешно сохранены!");
        } catch (Exception e) {
            log.debug("Error saving preferences: " + e.getMessage());
            SessionErrors.add(actionRequest, "saveError", "Ошибка при сохранении настроек: " + e.getMessage());
        }
    }

    @Override
    public void doView(RenderRequest renderRequest, RenderResponse renderResponse)
            throws IOException, PortletException {

        PortletPreferences preferences = renderRequest.getPreferences();
        String mainSiteId = preferences.getValue("mainSiteId", "");
        boolean isWidgetVisible = Boolean.parseBoolean(preferences.getValue("isWidgetVisible", "true"));
        boolean isListingVisible = Boolean.parseBoolean(preferences.getValue("isListingVisible", "true"));

        renderRequest.setAttribute("mainSiteId", mainSiteId);
        renderRequest.setAttribute("isWidgetVisible", isWidgetVisible);
        renderRequest.setAttribute("isListingVisible", isListingVisible);

        boolean isConfigured = !mainSiteId.isEmpty();
        renderRequest.setAttribute("isConfigured", isConfigured);

        log.debug("Widget is configured: " + isConfigured);
        super.doView(renderRequest, renderResponse);
    }
}