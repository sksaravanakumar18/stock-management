package com.stockmanagement.stock_management_api.master.identity.user.service;

import com.stockmanagement.stock_management_api.master.identity.user.dto.UserRequest;
import com.stockmanagement.stock_management_api.master.identity.user.dto.UserResponse;
import com.stockmanagement.stock_management_api.master.identity.user.entity.AppUser;
import com.stockmanagement.stock_management_api.master.identity.user.repository.AppUserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.UUID;

@Service
public class UserService {
    private final AppUserRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UserService(AppUserRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> findAll() {
        return repository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserResponse> findActive() {
        return repository.findByIsActive(true)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse findById(UUID id) {
        return toResponse(findEntity(id));
    }

    @Transactional(readOnly = true)
    public UserResponse findByEmail(String email) {
        return toResponse(repository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + email)));
    }

    @Transactional
    public UserResponse create(UserRequest request) {
        if (repository.findByEmail(request.email()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists: " + request.email());
        }

        AppUser user = new AppUser();
        apply(user, request);
        user.setPasswordHash(passwordEncoder.encode(request.password()));

        return toResponse(repository.save(user));
    }

    @Transactional
    public UserResponse update(UUID id, UserRequest request) {
        AppUser user = findEntity(id);

        if (!user.getEmail().equals(request.email()) &&
                repository.findByEmail(request.email()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists: " + request.email());
        }

        apply(user, request);
        if (request.password() != null && !request.password().isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(request.password()));
        }

        return toResponse(repository.save(user));
    }

    @Transactional
    public void delete(UUID id) {
        AppUser user = findEntity(id);
        user.setIsActive(false);
        repository.save(user);
    }

    @Transactional
    public void activate(UUID id) {
        AppUser user = findEntity(id);
        user.setIsActive(true);
        repository.save(user);
    }

    @Transactional
    public void deactivate(UUID id) {
        AppUser user = findEntity(id);
        user.setIsActive(false);
        repository.save(user);
    }

    private AppUser findEntity(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + id));
    }

    private void apply(AppUser user, UserRequest request) {
        user.setName(request.name());
        user.setEmail(request.email());
        user.setRoleId(request.roleId());
        user.setDepartmentId(request.departmentId());
        user.setIsActive(request.isActive());
    }

    private UserResponse toResponse(AppUser entity) {
        return new UserResponse(
                entity.getId(),
                entity.getName(),
                entity.getEmail(),
                entity.getRoleId(),
                entity.getDepartmentId(),
                entity.getIsActive()
        );
    }
}
