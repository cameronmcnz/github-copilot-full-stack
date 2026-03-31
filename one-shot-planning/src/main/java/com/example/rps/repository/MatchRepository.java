package com.example.rps.repository;

import com.example.rps.entity.Match;
import com.example.rps.entity.MatchStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MatchRepository extends JpaRepository<Match, Long> {

    @EntityGraph(attributePaths = {"rounds"})
    Optional<Match> findByPublicIdAndUser_PublicId(String publicId, String userPublicId);

    @EntityGraph(attributePaths = {"rounds"})
    Optional<Match> findFirstByUser_PublicIdAndStatusOrderByCreatedAtDesc(String userPublicId, MatchStatus status);

    Page<Match> findByUser_PublicIdOrderByCreatedAtDesc(String userPublicId, Pageable pageable);

    List<Match> findByUser_PublicIdAndStatus(String userPublicId, MatchStatus status);
}