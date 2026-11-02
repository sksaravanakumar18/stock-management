package com.stockmanagement.stock_management_api.master.identity.auth.security;

import com.stockmanagement.stock_management_api.master.identity.auth.dto.LoginResponse;
import com.stockmanagement.stock_management_api.master.identity.user.entity.AppUser;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private static final Duration TOKEN_TTL = Duration.ofMinutes(15);

    private final JwtEncoder encoder;

    public JwtService(JwtEncoder encoder) {
        this.encoder = encoder;
    }

    public LoginResponse createLoginResponse(AppUser user, List<String> permissions) {
        Instant now = Instant.now();
        Instant expiresAt = now.plus(TOKEN_TTL);

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("stock-management-master")
                .issuedAt(now)
                .expiresAt(expiresAt)
                .subject(user.getEmail())
                .claim("userId", user.getId().toString())
                .claim("roleId", user.getRoleId().toString())
                .claim("permissions", permissions)
                .claim("scope", String.join(" ", permissions))
                .build();

        String token = encoder.encode(JwtEncoderParameters.from(
                JwsHeader.with(MacAlgorithm.HS256).build(),
                claims
        )).getTokenValue();

        var userInfo = new LoginResponse.UserInfo(
                user.getId().toString(),
                user.getName(),
                user.getEmail(),
                user.getRoleId().toString(),
                user.getDepartmentId() == null ? null : user.getDepartmentId().toString(),
                user.getIsActive(),
                permissions
        );

        return new LoginResponse(token, "Bearer", expiresAt, userInfo);
    }
}