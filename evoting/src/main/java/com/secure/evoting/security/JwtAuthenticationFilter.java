package com.secure.evoting.security;


import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;

    public JwtAuthenticationFilter(JwtTokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        String token = parseBearerToken(request);
        
        if (token != null && tokenProvider.validateTokenSignature(token)) {
            String principalId = tokenProvider.getSubjectFromToken(token);
         //this maps the role of the user to be put into token to stop quering the user role for each action
            List<String> rolesFromToken = tokenProvider.getRolesFromToken(token);

            List<SimpleGrantedAuthority> authorities = rolesFromToken.stream()
                    .map(role -> new SimpleGrantedAuthority(role)) // Maps strings like "ROLE_USER"
                    .collect(Collectors.toList());

            UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(principalId, null, authorities);
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
        
        filterChain.doFilter(request, response);
    }

    private String parseBearerToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}