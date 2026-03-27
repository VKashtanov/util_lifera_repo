package ru.kashtanov.application.dto;

import com.liferay.portal.kernel.model.Phone;

import java.util.List;
import java.util.Objects;

public class UserDto {
    private long userId;
    private String fullName;
    private String firstName;
    private String middleName;
    private String lastName;
    private String email;        // ← только если разрешено!
    private String position;
    private String portraitUrl;
    private List<Phone> phones;

    public UserDto() {
    }

    public String getMiddleName() {
        return middleName;
    }

    public void setMiddleName(String middleName) {
        this.middleName = middleName;
    }


    public long getUserId() {
        return userId;
    }

    public void setUserId(long userId) {
        this.userId = userId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public String getPortraitUrl() {
        return portraitUrl;
    }

    public void setPortraitUrl(String portraitUrl) {
        this.portraitUrl = portraitUrl;
    }

    public List<Phone> getPhones() {
        return phones;
    }

    public void setPhones(List<Phone> phones) {
        this.phones = phones;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        UserDto dto = (UserDto) o;
        return userId == dto.userId && Objects.equals(fullName, dto.fullName) && Objects.equals(firstName, dto.firstName) && Objects.equals(middleName, dto.middleName) && Objects.equals(lastName, dto.lastName) && Objects.equals(email, dto.email) && Objects.equals(position, dto.position) && Objects.equals(portraitUrl, dto.portraitUrl) && Objects.equals(phones, dto.phones);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, fullName, firstName, middleName, lastName, email, position, portraitUrl, phones);
    }

    @Override
    public String toString() {
        return "UserDto{" +
                "userId=" + userId +
                ", fullName='" + fullName + '\'' +
                ", firstName='" + firstName + '\'' +
                ", middleName='" + middleName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", position='" + position + '\'' +
                ", portraitUrl='" + portraitUrl + '\'' +
                ", phones=" + phones +
                '}';
    }
}


