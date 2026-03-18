package ru.kashtanov.application.dto;

import java.util.Objects;

public class UserDto {
    private long userId;
    private String fullName;
    private String firstName;
    private String lastName;
    private String email;        // ← только если разрешено!
    private String position;
    private String portraitUrl;
    private String phone="";

    public UserDto() {
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
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

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        UserDto userDto = (UserDto) o;
        return userId == userDto.userId && Objects.equals(fullName, userDto.fullName) && Objects.equals(firstName, userDto.firstName) && Objects.equals(lastName, userDto.lastName) && Objects.equals(email, userDto.email) && Objects.equals(position, userDto.position) && Objects.equals(portraitUrl, userDto.portraitUrl) && Objects.equals(phone, userDto.phone);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, fullName, firstName, lastName, email, position, portraitUrl, phone);
    }

    @Override
    public String toString() {
        return "UserDto{" +
                "userId=" + userId +
                ", fullName='" + fullName + '\'' +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", position='" + position + '\'' +
                ", portraitUrl='" + portraitUrl + '\'' +
                ", phone='" + phone + '\'' +
                '}';
    }
}
