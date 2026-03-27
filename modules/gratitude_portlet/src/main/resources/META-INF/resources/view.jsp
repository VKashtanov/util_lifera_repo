<%@ page import="com.liferay.portal.kernel.util.PortalUtil" %>
<%@ page import="com.liferay.portal.kernel.exception.PortalException" %>
<%@ page import="com.liferay.portal.kernel.model.User" %>
<%@ page import="com.liferay.portal.kernel.util.Validator" %>
<%@ taglib uri="http://java.sun.com/portlet_2_0" prefix="portlet" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<portlet:defineObjects/>

<%
    // Получение настроек из preferences
    String mainSiteIdStr = (String) renderRequest.getAttribute("mainSiteId");
    Boolean isWidgetVisibleObj = (Boolean) renderRequest.getAttribute("isWidgetVisible");
    Boolean isListingVisibleObj = (Boolean) renderRequest.getAttribute("isListingVisible");
    Boolean isConfiguredObj = (Boolean) renderRequest.getAttribute("isConfigured");

    if (mainSiteIdStr == null) mainSiteIdStr = "";
    if (isWidgetVisibleObj == null) isWidgetVisibleObj = true;
    if (isListingVisibleObj == null) isListingVisibleObj = true;
    if (isConfiguredObj == null) isConfiguredObj = false;

    boolean isWidgetVisible = isWidgetVisibleObj.booleanValue();
    boolean isListingVisible = isListingVisibleObj.booleanValue();
    boolean isConfigured = isConfiguredObj.booleanValue();

    String contextPath = request.getContextPath();
    long siteId = 0;
    long companyId = 0;
    long currentUserId = 0;


    try {

        if (Validator.isNotNull(mainSiteIdStr) && !mainSiteIdStr.isEmpty()) {
            siteId = Long.parseLong(mainSiteIdStr);
        } else {
            siteId = PortalUtil.getScopeGroupId(request);
        }

        companyId = PortalUtil.getCompanyId(request);
        User user = PortalUtil.getUser(request);
        if (user != null) {
            currentUserId = user.getUserId();
        }
    } catch (PortalException e) {
        throw new RuntimeException(e);
    }
%>

<portlet:actionURL var="savePreferencesURL" />

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title>Просто огонь</title>
    <style>
        #wrapper {
            background-color: #f2f2f2 !important;
        }

        :root {
            --space-xs: 4px;
            --space-s: 8px;
            --space-m: 16px;
            --space-m-2: 18px;
            --space-l: 24px;
            --space-xl: 32px;
            --space-2xl: 48px;

            --white: #fff;
            --typo-primary: #002033;
            --typo-secondary: #00203399;
            --control-default-bg-border: #00426947;
            --bg-default: #f2f2f2;
            --control-primary-bg: #0078d2;
            --bg-tone: #002033d9;
            --control-default-typo-placeholder: #00203359;
            --control-ghost-bg: #00426912;
            --bg-ghost: #00203314;
            --bg-border: #00416633;
            --color-control-bg-primary-hover: #0091ff;
            --bg-alert: #eb5757;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        a {
            text-decoration: none;
        }

        p {
            margin-bottom: 0rem;
            margin-top: 0;
        }

        a,
        button {
            -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
            background: transparent;
        }

        input,
        textarea {
            background: transparent;
            border: none;
            color: currentColor;
            outline: none;
            padding: 0;
            width: 100%;
        }

        button {
            padding: 0;
            border: 0;
            cursor: pointer;
        }

        ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        html {
            background-color: #f2f2f2;
        }

        body {
            font-family: Inter, Arial, sans-serif;
            background-color: #f2f2f2;
            margin: 0;
            padding: 0;
            min-height: 100vh;
        }

        .cover-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
        }

        .visibility-hidden {
            visibility: hidden;
            position: absolute;
            width: 0;
            height: 0;
            margin: 0;
        }

        .with-custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #0042693d #0042690f;
        }

        .with-custom-scrollbar::-webkit-scrollbar {
            width: 5px;
        }

        .thanks-stats-user_active {
            background-color: var(--control-ghost-bg) !important;
            border-left: 3px solid var(--control-primary-bg);
            padding-left: calc(var(--space-s) - 3px);
        }

        .with-custom-scrollbar::-webkit-scrollbar-thumb {
            border-radius: 4px;
            background-color: #0042693d;
        }

        .with-custom-scrollbar::-webkit-scrollbar-track {
            border-radius: 4px;
            background-color: #0042690f;
        }

        .text {
            line-height: 1.5;
            color: var(--typo-primary);
            font-size: 14px;
            font-weight: 400;
        }

        .title-1 {
            font-weight: 700;
            font-size: var(--space-l);
            line-height: 1.8;
        }

        .title-2 {
            font-size: var(--space-l);
            line-height: 1.5;
            color: var(--typo-primary);
            font-weight: 400;
        }

        .title-3 {
            font-size: var(--space-m-2);
            line-height: 1.5;
            color: var(--typo-secondary);
            font-weight: 400;
        }

        .banner {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            width: 100%;
            height: 385px;
            z-index: 0;
        }

        .banner__image {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .main {
            margin-inline: auto;
            max-width: 1400px;
            position: relative;
            z-index: 1;
        }

        #content {
            max-width: 100% !important;
        }

        .create-thanks {
            max-width: 1010px;
            margin-inline: auto;
            padding: var(--space-2xl) var(--space-m) 0;
            position: relative;
            z-index: 1;
        }

        .create-thanks__inner {
            max-width: 640px;
            padding: var(--space-l);
            background-color: var(--white);
            border-radius: var(--space-m);
            box-shadow: 0 4px var(--space-m) var(--bg-ghost);
            margin-bottom: var(--space-xl);
            color: var(--typo-primary);
        }

        .create-thanks__text {
            font-size: var(--space-m);
            font-weight: 400;
            line-height: 1.8;
        }

        .create-thanks__form {
            margin-top: var(--space-l);
            color: var(--typo-primary);
        }

        .create-thanks-form_is-loading {
            opacity: 0.5;
            pointer-events: none;
        }

        .create-thanks-form__item {
            display: flex;
            flex-direction: column;
        }

        .create-thanks-form__item:not(:first-child) {
            margin-top: var(--space-m);
        }

        .create-thanks-form__label {
            color: var(--typo-secondary);
            margin-bottom: var(--space-xs);
        }

        .create-thanks-form__textarea textarea {
            padding: var(--space-s);
            border: 1px solid var(--control-default-bg-border);
            border-radius: var(--space-xs);
            min-height: 95px;
            resize: none;
        }

        .create-thanks__submit {
            margin-top: var(--space-l);
            width: 100%;
        }

        .button {
            min-height: var(--space-xl);
            border-radius: var(--space-xs);
            padding-inline: 12px;
            background-color: var(--control-primary-bg);
            color: var(--white);
            transition: background-color 0.2s;
        }

        .button:hover,
        .button:not(:disabled):hover,
        .button:not(:disabled):not(.button_loading):hover {
            background: var(--color-control-bg-primary-hover);
        }

        /* Error styles */
        .create-thanks-form__combobox._error .search-input-wrapper {
            border-color: var(--bg-alert);
        }

        .create-thanks-form__textarea._error textarea {
            border-color: var(--bg-alert);
        }

        .create-thanks-error {
            font-size: 12px;
            color: var(--bg-alert);
            margin-top: var(--space-xs);
            display: none;
        }

        .create-thanks-error._visible {
            display: inline-block;
        }

        /* Стили для поиска с чипсами */
        .search-container {
            position: relative;
        }

        .search-input-wrapper {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 8px;
            min-height: 44px;
            padding: 8px 12px;
            border: 1px solid var(--control-default-bg-border);
            border-radius: var(--space-xs);
            background: var(--white);
            transition: border-color 0.3s;
        }

        .search-input-wrapper:focus-within {
            border-color: var(--control-primary-bg);
            outline: none;
        }

        .selected-user-chip {
            display: inline-flex;
            align-items: center;
            background-color: var(--control-ghost-bg);
            border: 1px solid var(--control-primary-bg);
            border-radius: 16px;
            padding: 4px 8px;
            font-size: 13px;
            color: var(--typo-primary);
            font-weight: 500;
            animation: fadeIn 0.2s ease-in;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: scale(0.8);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }

        .remove-user-btn {
            background: none;
            border: none;
            color: var(--control-primary-bg);
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            margin-left: 6px;
            padding: 0;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }

        .remove-user-btn:hover {
            background-color: var(--control-primary-bg);
            color: white;
        }

        .search-input {
            flex: 1;
            min-width: 120px;
            border: none;
            outline: none;
            font-size: 14px;
            background: transparent;
        }

        .clear-all-btn {
            background: none;
            border: none;
            color: var(--typo-secondary);
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }

        .clear-all-btn:hover {
            background-color: var(--control-ghost-bg);
            color: var(--typo-primary);
        }

        .search-results {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--white);
            border: 1px solid var(--control-default-bg-border);
            border-radius: var(--space-xs);
            max-height: 300px;
            overflow-y: auto;
            z-index: 100;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            display: none;
        }

        .search-result-item {
            cursor: pointer;
            padding: 12px;
            border-bottom: 1px solid var(--control-ghost-bg);
            transition: background-color 0.2s;
        }

        .search-result-item:hover {
            background-color: var(--control-ghost-bg);
        }

        .search-result-item:last-child {
            border-bottom: none;
        }

        .search-result-content {
            display: flex;
            align-items: center;
        }

        .search-result-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin-right: 12px;
            border: 2px solid var(--white);
        }

        .search-result-info {
            flex-grow: 1;
        }

        .result-name {
            font-weight: bold;
            margin-bottom: 4px;
            color: var(--typo-primary);
            font-size: 14px;
        }

        .result-email,
        .result-position {
            font-size: 12px;
            color: var(--typo-secondary);
            margin-bottom: 2px;
        }

        .no-results {
            padding: 20px;
            text-align: center;
            color: var(--typo-secondary);
            font-style: italic;
        }

        .search-error {
            padding: 15px;
            text-align: center;
            color: #f44336;
            background-color: #ffebee;
            border: 1px solid #f44336;
            border-radius: 4px;
            margin: 10px 0;
        }

        .search-info {
            font-size: 12px;
            color: var(--typo-secondary);
            margin: 5px 0;
            padding: 5px;
            min-height: 15px;
        }

        .search-info.info {
            color: var(--control-primary-bg);
            background-color: var(--control-ghost-bg);
            border: 1px solid var(--control-primary-bg);
            border-radius: 3px;
            padding: 8px;
        }

        .search-info.error {
            color: #f44336;
            background-color: #ffebee;
            border: 1px solid #f44336;
            border-radius: 3px;
            padding: 8px;
        }

        .comment-section {
            margin-top: 25px;
            margin-bottom: 20px;
        }

        .comment-section h3 {
            margin-bottom: 12px;
            color: var(--typo-primary);
            font-size: 16px;
            font-weight: 600;
        }

        .comment-textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid var(--control-default-bg-border);
            border-radius: 4px;
            font-family: inherit;
            font-size: 14px;
            resize: vertical;
            box-sizing: border-box;
            min-height: 100px;
            line-height: 1.4;
        }

        .comment-textarea:focus {
            border-color: var(--control-primary-bg);
            outline: none;
        }

        .thanks {
            display: flex;
            align-items: flex-start;
            justify-content: center;
            gap: var(--space-xl);
            margin-bottom: var(--space-2xl);
            padding: 0 var(--space-m);
        }

        .thanks__main {
            display: flex;
            flex-direction: column;
            max-width: 640px;
            flex: 1;
        }

        .thanks__title {
            margin-bottom: var(--space-m);
        }

        .thanks__list {
            display: flex;
            flex-direction: column;
            gap: var(--space-m-2);
            min-height: 400px;
        }

        .thanks-item {
            width: 100%;
        }

        .thanks-item__card {
            cursor: pointer;
            background-color: var(--white);
            padding: var(--space-m-2);
            border-radius: var(--space-m-2);
            transition: transform 0.2s;
            display: flex;
            flex-direction: column;
            height: auto;
            min-height: 0;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }

        .thanks-item__card:hover {
            transform: translateY(-2px);
        }

        .thanks-item__avatars {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            margin-bottom: var(--space-m-2);
            row-gap: var(--space-m);
        }

        .thanks-item__avatars-item {
            position: relative;
        }

        .thanks-item__avatars-item-name {
            color: var(--white);
            font-size: 10px;
            font-weight: 500;
        }

        .thanks-item__avatars-item-avatar {
            width: var(--space-xl);
            height: var(--space-xl);
            overflow: hidden;
            border-radius: 50%;
            border: 2px solid var(--white);
            margin-left: -6px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }

        .thanks-item__avatars-item-avatar img {
            position: absolute;
            inset: 0;
        }

        .thanks-item__avatars-item-avatar:hover + .thanks-item__avatars-item-tooltip {
            opacity: 1;
        }

        .thanks-item__avatars-item-tooltip {
            position: absolute;
            opacity: 0;
            bottom: calc(100% + var(--space-s));
            left: 50%;
            transform: translateX(-50%);
            color: var(--typo-primary);
            display: flex;
            align-items: center;
            flex-direction: column;
            gap: var(--space-xs);
            width: 205px;
            background-color: var(--white);
            padding: var(--space-s);
            border-radius: var(--space-xs);
            box-shadow: 0 var(--space-s) var(--space-l) #0020331f;
            pointer-events: none;
            transition: opacity 0.2s;
            z-index: 10;
        }

        .thanks-item__avatars-item-tooltip::after {
            content: "";
            position: absolute;
            bottom: 0%;
            left: 50%;
            margin-left: -5px;
            border-width: 5px;
            border-style: solid;
            transform: translateY(100%) rotate(180deg);
            border-color: transparent transparent var(--white) transparent;
        }

        .thanks-item__avatars-item-tooltip-name,
        .thanks-item__avatars-item-tooltip-work {
            font-size: 12px;
            font-weight: 400;
            line-height: 1.5;
            text-align: center;
        }

        .thanks-item__avatars-item-tooltip-name {
            font-weight: 700;
        }

        .thanks-item__text {
            margin-bottom: var(--space-m-2);
            line-height: 1.4;
            word-wrap: break-word;
            overflow-wrap: break-word;
            white-space: normal;
            width: 100%;
            flex: 1;
            min-height: 0;
            overflow: visible;
            max-height: none !important;
            height: auto !important;
        }

        .user-label {
            display: flex;
            align-items: center;
        }

        .user-label__name {
            line-height: 1;
            margin-bottom: 2px;
        }

        .user-label__avatar {
            width: var(--space-l);
            height: var(--space-l);
            border-radius: 50%;
            overflow: hidden;
            margin-right: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }

        .user-label__avatar img {
            position: absolute;
            inset: 0;
        }

        .user-label__avatar-name {
            color: var(--white);
            font-size: 10px;
            font-weight: 500;
        }

        .user-label__description {
            font-size: 10px;
            line-height: 1.1;
            color: var(--typo-secondary);
            display: flex;
            align-items: center;
            gap: var(--space-s);
        }

        .user-label__description-item {
            position: relative;
        }

        .user-label__description-item:not(:first-child):before {
            content: "";
            width: 1px;
            height: 100%;
            background-color: var(--typo-secondary);
            position: absolute;
            top: 0;
            left: -4px;
        }

        .user-label__btn {
            margin-left: auto;
        }

        .thanks-btn {
            color: #00395ccc;
            background-color: var(--control-ghost-bg);
            min-height: var(--space-xl);
            padding-inline: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            border-radius: 99px;
            transition: all 0.2s;
        }

        .thanks-btn:hover {
            background-color: var(--control-default-bg-border);
        }

        .thanks-btn svg {
            fill: currentColor;
            width: 12px;
            height: 12px;
        }

        .thanks-btn_active {
            color: var(--white);
            background: linear-gradient(90deg, #e65907 0%, #e65907 100%);
        }

        .thanks-filters {
            display: flex;
            align-items: center;
            gap: var(--space-s);
            margin-bottom: var(--space-m-2);
            flex-wrap: wrap;
        }

        .thanks-filters_is-loading {
            opacity: 0.5;
            pointer-events: none;
        }

        .thanks-filters-radio {
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: var(--space-xl);
            padding-inline: 12px;
            border-radius: 99px;
            background-color: var(--control-ghost-bg);
            color: #00395ccc;
            border: 1px solid transparent;
            flex-shrink: 0;
            transition: all 0.2s;
        }

        .thanks-filters-radio:hover {
            background-color: var(--control-default-bg-border);
        }

        .thanks-filters-radio:has(> .thanks-filters-radio__input:checked) {
            background-color: transparent;
            border-color: var(--control-primary-bg);
            color: var(--control-primary-bg);
        }

        .thanks-filters-radio__text {
            color: inherit;
        }

        .thanks-filters-radio__input {
            visibility: hidden;
            position: absolute;
            width: 100%;
            height: 100%;
            margin: 0;
        }

        .thanks-stats-user {
            display: flex;
            align-items: center;
            width: 100%;
            padding: var(--space-s);
            border-radius: var(--space-xs);
            transition: background-color 0.2s;
            cursor: pointer;
        }

        .thanks-stats-user:hover {
            background-color: var(--control-ghost-bg);
        }

        .thanks-stats-user__avatar {
            width: var(--space-xl);
            height: var(--space-xl);
            border-radius: 50%;
            overflow: hidden;
            margin-right: var(--space-s);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }

        .thanks-stats-user__avatar img {
            position: absolute;
            inset: 0;
        }

        .thanks-stats-user__avatar-name {
            color: var(--white);
            font-size: 10px;
            font-weight: 500;
        }

        .thanks-stats {
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
            width: 338px;
        }

        .thanks-stats__section:not(:first-child) {
            margin-top: var(--space-xl);
        }

        .thanks-stats__subtitle {
            margin-bottom: var(--space-m);
        }

        .thanks-stats__list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .thanks-stats-user__counter {
            margin-left: auto;
            color: #00395ccc;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .thanks-stats-user__counter svg {
            fill: currentColor;
            width: 12px;
            height: 12px;
        }

        .thanks-stats-user__about {
            font-size: 12px;
            line-height: 1.1;
            color: var(--typo-secondary);
            display: flex;
            flex-direction: column;
            gap: var(--space-xs);
            flex: 1;
        }

        .thanks-stats-user__work {
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 1;
            line-clamp: 1;
            -webkit-box-orient: vertical;
        }

        /* Стили для селектора количества элементов на странице */
        .page-size-selector {
            display: flex;
            align-items: center;
            gap: var(--space-s);
            margin-bottom: var(--space-m-2);
            padding: var(--space-s) 0;
        }

        .page-size-label {
            color: var(--typo-secondary);
            white-space: nowrap;
        }

        .page-size-select {
            padding: var(--space-xs) var(--space-s);
            border: 1px solid var(--control-default-bg-border);
            border-radius: var(--space-xs);
            background-color: var(--white);
            color: var(--typo-primary);
            font-size: 14px;
            cursor: pointer;
        }

        .page-size-select:focus {
            outline: none;
            border-color: var(--control-primary-bg);
        }

        /* Стили для пагинации */
        .pagination {
            margin-top: var(--space-m-2);
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            gap: var(--space-m);
        }

        .pagination_is-loading {
            opacity: 0.5;
            pointer-events: none;
        }

        .pagination__controls {
            display: flex;
            align-items: center;
            gap: var(--space-s);
        }

        .pagination__btn {
            color: #00395ccc;
            min-height: var(--space-xl);
            min-width: var(--space-xl);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            border-radius: var(--space-xs);
            font-size: 16px;
            font-weight: 500;
            background: transparent;
            border: 1px solid var(--control-default-bg-border);
            cursor: pointer;
        }

        .pagination__btn:not(.pagination__btn_disabled):hover {
            background-color: var(--control-ghost-bg);
            border-color: var(--control-primary-bg);
            color: var(--control-primary-bg);
        }

        .pagination__btn_disabled {
            cursor: not-allowed;
            color: #00203342;
            background-color: var(--control-ghost-bg);
            border-color: var(--control-default-bg-border);
            opacity: 0.5;
        }

        .pagination__info {
            display: flex;
            align-items: center;
            gap: var(--space-xs);
            padding: 0 var(--space-s);
        }

        .pagination__current {
            font-weight: 600;
            color: var(--control-primary-bg);
        }

        .pagination__separator {
            color: var(--typo-secondary);
        }

        .pagination__total {
            color: var(--typo-secondary);
        }

        .widget_footer {
            background-color: var(--bg-ghost);
            display: none;
        }

        .widget_footer__content {
            max-width: 1010px;
            width: 100%;
            padding-block: var(--space-xl);
            margin-inline: auto;
            padding-inline: var(--space-m);
        }

        .widget_footer__copyright {
            margin-top: 64px;
            padding-top: var(--space-l);
            border-top: 1px solid var(--bg-border);
            color: var(--typo-primary);
        }

        .widget_footer__title {
            margin-bottom: var(--space-m);
            font-size: var(--space-m);
            color: var(--typo-primary);
            font-weight: 700;
            line-height: 1.5;
        }

        .widget_footer-user {
            display: flex;
            align-items: flex-start;
        }

        .widget_footer-user__avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            overflow: hidden;
            margin-right: var(--space-s);
        }

        .widget_footer-user__name {
            font-size: var(--space-m);
            line-height: 1.5;
            font-weight: 400;
            color: var(--typo-primary);
        }

        .widget_footer-user__work {
            color: var(--typo-secondary);
            margin-top: var(--space-s);
        }

        .widget_footer-user__contacts {
            margin-top: var(--space-s);
            display: flex;
            flex-direction: column;
            gap: var(--space-s);
        }

        .widget_footer-user__contacts-item {
            display: flex;
            align-items: center;
            gap: var(--space-s);
            display: flex;
            justify-content: start;
            position: relative;
        }

        .widget_footer-user__contacts-item img {
            width: 16px;
            height: 16px;
        }

        .widget_footer-user__avatar {
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }

        .widget_footer-user__avatar img {
            position: absolute;
            inset: 0;
        }

        .widget_footer-user__avatar-name {
            color: var(--white);
            font-size: 12px;
            font-weight: 500;
        }

        .widget_footer-user__contacts-item-text {
            font-size: 12px;
            font-weight: 400;
            line-height: 1.45;
            color: var(--typo-primary);
        }

        .loading-spinner {
            text-align: center;
            padding: 20px;
            color: var(--typo-secondary);
            font-style: italic;
        }

        .no-gratitudes {
            text-align: center;
            padding: 40px;
            color: var(--typo-secondary);
            font-style: italic;
            background-color: var(--bg-ghost);
            border-radius: 6px;
        }

        .no-stats {
            text-align: center;
            padding: 20px;
            color: var(--typo-secondary);
            font-style: italic;
            background-color: var(--bg-ghost);
            border-radius: 4px;
        }

        .stats-loading {
            text-align: center;
            padding: 15px;
            color: var(--typo-secondary);
            font-style: italic;
        }


        .gratitude-modal {
            position: fixed;
            inset: 0;
            height: 100%;
            width: 100%;
            background-color: var(--bg-tone);
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }

        .gratitude-modal_is-open {
            opacity: 1;
            visibility: visible;
        }

        .gratitude-modal__content {
            background-color: var(--white);
            max-width: 640px;
            padding: var(--space-m-2);
            border-radius: 12px;
            height: 100%;
            max-height: 700px;
            width: 90%;
            margin: var(--space-m);
        }

        .thanks-gratitude-modal__content {
            display: flex;
            flex-direction: column;
            height: 100%;
            max-height: 700px;
            overflow: hidden;
        }

        .thanks-gratitude-modal__author {
            margin-bottom: var(--space-m-2);
        }

        .thanks-gratitude-modal__author .user-label__avatar {
            width: var(--space-l);
            height: var(--space-l);
            border-radius: 50%;
            overflow: hidden;
            margin-right: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }

        .thanks-gratitude-modal__author .user-label__avatar img {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .thanks-gratitude-modal__author .user-label__avatar-name {
            color: var(--white);
            font-size: 10px;
            font-weight: 500;
            z-index: 1;
        }

        .thanks-gratitude-modal__text {
            max-height: none !important;
            height: auto !important;
            overflow: visible !important;
            line-height: 1.4;
            word-wrap: break-word;
            overflow-wrap: break-word;
            white-space: normal;
            flex: 0 1 auto;
            margin-bottom: var(--space-m-2);
        }

        .thanks-gratitude-modal__bottom {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            margin-top: auto;
            padding-top: var(--space-m);
        }

        .thanks-gratitude-modal__subtitle {
            margin-bottom: 12px;
            color: var(--typo-secondary);
        }

        .thanks-gratitude-modal-list {
            overflow: auto;
            max-height: 300px;
            gap: var(--space-s);
            display: flex;
            flex-direction: column;
            flex: 1;
            min-height: 0;
        }

        .thanks-gratitude-modal-list__item-content {
            display: flex;
            align-items: center;
            padding: var(--space-s);
            border-radius: var(--space-xs);
            transition: background-color 0.2s;
        }

        .thanks-gratitude-modal-list__item-content:hover {
            background-color: var(--control-ghost-bg);
        }

        .thanks-gratitude-modal-list__item-name {
            font-size: var(--space-m);
            font-weight: 400;
            line-height: 1;
            margin-bottom: 2px;
        }

        .thanks-gratitude-modal-list__item-work {
            font-size: 12px;
            font-weight: 400;
            line-height: 1.1;
            color: var(--typo-secondary);
        }

        .thanks-gratitude-modal-list__item-avatar {
            width: var(--space-xl);
            height: var(--space-xl);
            border-radius: 50%;
            overflow: hidden;
            margin-right: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }

        .thanks-gratitude-modal-list__item-avatar img {
            position: absolute;
            inset: 0;
        }

        .thanks-gratitude-modal-list__item-avatar-name {
            color: var(--white);
            font-size: 10px;
            font-weight: 500;
        }

        .thanks-gratitude-modal__close {
            margin-left: var(--space-s);
        }

        .gratitude-modal__content.thanks-gratitude-modal__content {
            overflow: hidden;
        }

        .thanks-gratitude-modal__text.with-custom-scrollbar {
            overflow: visible !important;
            scrollbar-width: none;
        }

        .thanks-gratitude-modal__text.with-custom-scrollbar::-webkit-scrollbar {
            display: none;
        }

        .text {
            word-break: break-word;
            overflow-wrap: break-word;
            hyphens: auto;
        }


        @media (max-width: 1024px) {
            .thanks {
                flex-direction: column;
            }

            .thanks-stats {
                width: 100%;
                max-width: 640px;
            }
        }

        /* ==================== SECTION-INFO STYLES ==================== */
        .section-info {
            display: flex;
            justify-content: flex-end;
            width: 100%;
            margin-top: var(--space-xl);
            position: relative;
        }

        .section-info__btn {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background-color: var(--control-primary-bg);
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            cursor: pointer;
            transition: background-color 0.2s;
        }

        .section-info__btn:hover {
            background-color: var(--color-control-bg-primary-hover);
        }

        .section-info__btn img {
            width: 24px;
            height: 24px;
        }

        .section-info__popover {
            width: 270px;
            background-color: var(--white);
            position: absolute;
            bottom: calc(100% + 12px);
            right: 0;
            box-shadow: 0 4px 16px 0 #00203314;
            border-radius: var(--space-m) var(--space-m) var(--space-xs) var(--space-m);
            padding: 12px;
            display: none;
            z-index: 1000;
        }

        .section-info__popover_is-open {
            display: block;
        }

        .section-info__popover-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            margin-bottom: 12px;
        }

        .section-info__popover-title {
            font-size: 12px;
            line-height: 1.5;
            font-weight: 700;
            color: var(--typo-primary);
        }

        .section-info__popover-close {
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: var(--control-ghost-bg);
            border-radius: 50%;
            border: none;
            cursor: pointer;
            transition: background-color 0.2s;
        }

        .section-info__popover-close:hover {
            background-color: var(--control-default-bg-border);
        }

        .section-info__popover-close img {
            width: 12px;
            height: 12px;
        }

        .section-info__popover-contacts {
            display: flex;
            flex-direction: column;
            padding: 8px 12px;
            gap: 4px;
            border-radius: 12px;
            background-color: #ecf1f4;
            color: var(--typo-primary);
            margin-bottom: 16px;
        }

        .section-info__popover-contacts a {
            color: var(--control-primary-bg);
            text-decoration: none;
        }

        .section-info__popover-contacts a:hover {
            text-decoration: underline;
        }

        .section-info__popover-user {
            margin-top: 0;
        }

        .section-info__popover-user .user-label__avatar {
            width: 40px;
            height: 40px;
        }

        .section-info__popover-user .user-label__name {
            font-size: 14px;
        }

        @media (max-width: 768px) {
            .section-info__popover {
                right: -50px;
            }
        }

        @media (max-width: 768px) {
            .thanks-filters {
                flex-direction: column;
                align-items: stretch;
            }

            .thanks-filters-radio {
                text-align: center;
            }

            .search-input-wrapper {
                min-height: 52px;
            }

            .search-input {
                min-width: 100px;
            }

            .page-size-selector {
                flex-direction: column;
                align-items: flex-start;
            }

            .pagination {
                flex-direction: column;
                gap: var(--space-s);
            }

            .thanks-gratitude-modal__bottom {
                flex-direction: column;
                gap: var(--space-s);
            }

            .thanks-gratitude-modal__close {
                margin-left: 0;
                width: 100%;
            }
        }

        /* ==================== CONFIGURATION STYLES ==================== */
        .config-form {
            background: #f9f9f9;
            padding: 15px;
            border-radius: 4px;
        }

        .form-group {
            margin-bottom: 12px;
        }

        .form-label {
            display: block;
            font-weight: bold;
            margin-bottom: 4px;
            font-size: 13px;
            color: #333;
        }

        .form-input {
            width: 100%;
            padding: 6px;
            border: 1px solid #ddd;
            border-radius: 3px;
            box-sizing: border-box;
            font-size: 13px;
        }

        .form-checkbox {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            color: #333;
        }

        .form-button {
            width: 100%;
            padding: 8px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 13px;
        }

        .form-button:hover {
            background: #0056b3;
        }

        .alert {
            padding: 8px 12px;
            border-radius: 3px;
            margin-bottom: 10px;
            font-size: 13px;
        }

        .alert-success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }

        .alert-error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }

        .config-content {
            width: 100%;
        }


    </style>
</head>
<body class="root">
<!-- Configuration Form -->
<div class="config-content" style="display: <%= !isConfigured ? "block" : "none" %>">
    <div class="config-form">
        <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #333">Настройка виджета благодарностей</h3>

        <c:if test="${not empty preferencesSaved}">
            <div class="alert alert-success">${preferencesSaved}</div>
        </c:if>

        <c:if test="${not empty saveError}">
            <div class="alert alert-error">${saveError}</div>
        </c:if>

        <form action="<%= savePreferencesURL %>" method="post">
            <div class="form-group">
                <label class="form-label">Main Site ID:</label>
                <input
                        type="text"
                        name="<portlet:namespace />mainSiteId"
                        class="form-input"
                        placeholder="Enter site ID"
                        value="<%= mainSiteIdStr %>"
                        required
                        pattern="[0-9]+"
                />
            </div>

            <!-- Visibility configuration checkboxes -->
            <div class="form-group">
                <label class="form-checkbox">
                    <input type="checkbox" name="<portlet:namespace />isWidgetVisible" value="true"
                        <%= isWidgetVisible ? "checked" : "" %>> Показывать форму создания благодарностей
                </label>
            </div>

            <div class="form-group">
                <label class="form-checkbox">
                    <input type="checkbox" name="<portlet:namespace />isListingVisible" value="true"
                        <%= isListingVisible ? "checked" : "" %>> Показывать список благодарностей
                </label>
            </div>

            <button type="submit" class="form-button">Сохранить настройки</button>
        </form>
    </div>
</div>

<!-- Основной контент виджета (показывать только если настроено) -->
<% if (isConfigured && isWidgetVisible) { %>
<div class="banner">
    <img class="banner__image cover-image" src="<%= contextPath %>/images/banner.jpg" alt="Баннер"/>
</div>

<main class="main">
    <section class="create-thanks">
        <div class="create-thanks__inner">
            <h1 class="create-thanks__title title-1">Работа коллег достойна внимания!</h1>
            <p class="create-thanks__text">Отметь команды, продукты, проекты!</p>

            <!-- Форма создания благодарности -->
            <form action="#" class="create-thanks__form create-thanks-form" id="gratitudeForm">
                <div class="create-thanks-form__item create-thanks-form__combobox" id="userSearchContainer">
                    <label for="searchInput" class="create-thanks-area create-thanks-form__label text">ФИО</label>
                    <div class="search-container">
                        <div class="search-input-wrapper" id="searchInputWrapper">
                            <!-- Выбранные пользователи будут здесь -->
                            <input
                                    type="text"
                                    id="searchInput"
                                    class="search-input text"
                                    placeholder="Введите имя или email для поиска коллег..."
                                    autocomplete="off"
                            />
                        </div>
                        <div id="searchResults" class="search-results"></div>
                        <div id="searchInfo" class="search-info"></div>
                    </div>
                    <span class="create-thanks-error text" id="userSearchError">Поле обязательно для заполнения</span>
                </div>

                <div class="create-thanks-form__item create-thanks-form__textarea" id="commentContainer">
                    <label class="create-thanks-area create-thanks-form__label text" for="gratitudeComment">Благодарность</label>
                    <textarea
                            id="gratitudeComment"
                            name="gratitudeComment"
                            class="comment-textarea text"
                            placeholder="Напишите вашу благодарность..."
                    ></textarea>
                    <span class="create-thanks-error text"
                          id="commentError">Минимальное количество символов — 100</span>
                </div>
                <button type="button" class="create-thanks__submit button text" id="sendGratitudeBtn">
                    Отправить благодарность
                </button>
            </form>
        </div>
    </section>

    <section class="thanks">
        <div class="thanks__main">
            <h2 class="thanks__title title-2">Благодарности</h2>

            <!-- Фильтры для карточек с благодарностями -->
            <form action="#" class="thanks-filters" id="gratitudesFilters">
                <label class="thanks__filters-item thanks-filters-radio">
                    <input class="thanks-filters-radio__input" type="radio" name="type" value="all" checked/>
                    <span class="thanks-filters-radio__text text">Все</span>
                </label>
                <label class="thanks__filters-item thanks-filters-radio">
                    <input class="thanks-filters-radio__input" type="radio" name="type" value="gd"/>
                    <span class="thanks-filters-radio__text text">От ГД</span>
                </label>
                <label class="thanks__filters-item thanks-filters-radio">
                    <input class="thanks-filters-radio__input" type="radio" name="type" value="received"/>
                    <span class="thanks-filters-radio__text text">Полученные</span>
                </label>
                <label class="thanks__filters-item thanks-filters-radio">
                    <input class="thanks-filters-radio__input" type="radio" name="type" value="sent"/>
                    <span class="thanks-filters-radio__text text">Отправленные</span>
                </label>
            </form>

            <!-- Список карточек с благодарностями -->
            <ul class="thanks__list" id="gratitudesList">
                <!-- Благодарности будут загружаться здесь -->
            </ul>

            <!-- Пагинация -->
            <nav class="pagination" id="pagination" aria-label="Постраничная навигация">
                <!-- Пагинация будет генерироваться здесь динамически -->
            </nav>
        </div>

        <!-- Боковые списки -->
        <div class="thanks__aside thanks-stats">
            <h2 class="title-2">Фильтры</h2>
            <div class="thanks-stats__section">
                <h3 class="thanks-stats__subtitle title-3">Коллеги чаще отмечают</h3>
                <ul class="thanks-stats__list" id="topThankedList">
                    <div class="stats-loading">Загрузка...</div>
                </ul>
            </div>
            <div class="thanks-stats__section">
                <h3 class="thanks-stats__subtitle title-3">Чаще отмечают коллег</h3>
                <ul class="thanks-stats__list" id="topThankersList">
                    <div class="stats-loading">Загрузка...</div>
                </ul>
            </div>
        </div>
    </section>
</main>

<footer class="widget_footer">
    <div class="widget_footer__content">
        <h2 class="widget_footer__title">Контакты</h2>
        <div class="widget_footer-user">
            <div class="widget_footer-user__avatar" style="background-color: #f9a825">
                <img class="cover-image" src="<%= contextPath %>/images/avatar-1.jpg" alt="Аватар-1"/>
                <span class="widget_footer-user__avatar-name">НР</span>
            </div>
            <div class="widget_footer-user__about">
                <p class="widget_footer-user__name"></p>
                <div class="user-label__description">
                    <span class="widget_footer-user__work text"></span>
                </div>
                <div class="widget_footer-user__contacts">
                    <a href="tel:(078)3213" class="widget_footer-user__contacts-item">
                        <img aria-hidden="true" src="<%= contextPath %>/icons/phone.svg" alt="Телефон"/>
                        <span class="widget_footer-user__contacts-item-text"></span>
                    </a>
                    <a href="mailto:tarzudina.va@gazprom-neft.ru" class="widget_footer-user__contacts-item">
                        <img aria-hidden="true" src="<%= contextPath %>/icons/mail.svg" alt="Сообщение"/>
                        <span class="widget_footer-user__contacts-item-text"></span>
                    </a>
                </div>
            </div>
        </div>
        <p class="widget_footer__copyright">© 1995-2023 ПАО «Газпром нефть»</p>
    </div>
</footer>


<div id="gratitudeModal" class="gratitude-modal thanks-gratitude-modal">
    <div class="gratitude-modal__content thanks-gratitude-modal__content">
        <div class="thanks-gratitude-modal__author user-label">
            <div class="user-label__avatar" id="modalAuthorAvatar">
                <!-- Аватар будет заполняться динамически -->
                <span class="user-label__avatar-name" id="modalAuthorInitials"></span>
            </div>
            <div class="user-label__about">
                <p class="user-label__name text" id="modalAuthorName">Author Name</p>
                <div class="user-label__description">
                    <span class="user-label__description-item user-label__date" id="modalDate">Date</span>
                    <span class="user-label__description-item user-label__work" id="modalAuthorPosition">Position</span>
                </div>
            </div>
        </div>

        <p class="thanks-gratitude-modal__text text with-custom-scrollbar" id="modalGratitudeText">
            Gratitude text will appear here...
        </p>

        <h3 class="thanks-gratitude-modal__subtitle text">Получили благодарность</h3>
        <ul class="thanks-gratitude-modal-list with-custom-scrollbar" id="modalRecipientsList">
            <!-- Recipients will be populated here -->
        </ul>

        <div class="thanks-gratitude-modal__bottom">
            <button class="thanks-btn text" id="modalLikeBtn" type="button" aria-label="Оценить пожелание">
                <span class="thanks-btn__text" id="modalLikeCount">0</span>
                <svg width="9" height="12" viewBox="0 0 9 12" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.5 12C2.0145 12 0 10.5 0 7.875C0 6.75 0.375 4.875 1.875 3.375C1.6875 4.5 2.8125 4.875 2.8125 4.875C2.25 3 3.75 0.375 6 0C5.73225 1.5 5.625 3 7.5 4.5C8.4375 5.25 9 6.54675 9 7.875C9 10.5 6.9855 12 4.5 12ZM4.5 11.25C5.74275 11.25 6.75 10.5 6.75 9.1875C6.75 8.625 6.5625 7.6875 5.8125 6.9375C5.90625 7.5 5.25 7.875 5.25 7.875C5.53125 6.9375 4.875 5.4375 3.75 5.25C3.88425 6 3.9375 6.75 3 7.5C2.53125 7.875 2.25 8.523 2.25 9.1875C2.25 10.5 3.25725 11.25 4.5 11.25Z"/>
                </svg>
            </button>
            <button class="thanks-gratitude-modal__close button text" id="modalCloseBtn">
                Закрыть
            </button>
        </div>
    </div>
</div>

<script>
    const appConfig = {
        mainSiteId: '<%= mainSiteIdStr %>',
        siteId: '<%= siteId %>',
        companyId: '<%= companyId %>',
        currentUserId: '<%= currentUserId %>',
        contextPath: '<%= contextPath %>',
        isConfigured: <%= isConfigured %>,
        isWidgetVisible: <%= isWidgetVisible %>,
        isListingVisible: <%= isListingVisible %>,
        springApiUrl: 'http://10.0.2.2:8081/api'   };

    console.log("11 2 Config: " + appConfig.springApiUrl)
</script>
<script src="<%= contextPath %>/js/widget.js"></script>
<% } %>
</body>
</html>