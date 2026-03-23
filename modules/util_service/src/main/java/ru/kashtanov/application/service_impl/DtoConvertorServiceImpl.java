package ru.kashtanov.application.service_impl;

import com.liferay.portal.kernel.model.Phone;
import com.liferay.portal.kernel.model.User;
import ru.kashtanov.application.dto.UserDto;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author Viktor Кashtanov
 */
public class DtoConvertorServiceImpl {
    private final CustomedUserUtilService customedUserUtilService = new CustomedUserUtilService();


    public List<UserDto> convertToDtoList(List<User> users) {
        return users.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public UserDto convertToDto(User user) {
        var dto = new UserDto();
        dto.setUserId(user.getUserId());
        dto.setFirstName(user.getFirstName());
        dto.setMiddleName(user.getMiddleName());
        dto.setLastName(user.getLastName());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmailAddress());
        dto.setPosition(user.getJobTitle());
        dto.setPortraitUrl(customedUserUtilService.buildUniversalPortraitUrl(user));
        List<Phone> phones = user.getPhones();
        dto.setPhone(phones.isEmpty() ? Collections.emptyList().toString() : phones.get(0).toString());
        return dto;
    }
}
