package com.mcnz.copilot.rps.controller;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import com.mcnz.copilot.rps.entity.PlayerEntity;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class PlayerController {

    public static final String PLAYER_COOKIE_NAME = "rps-player-id";

    @PersistenceContext(unitName = "rpsPersistence")
    private EntityManager entityManager;

    @Transactional
    public PlayerResolution resolvePlayer(String requestedPlayerId) {
        PlayerEntity player = null;
        String playerId = requestedPlayerId;

        if (playerId != null && !playerId.isBlank()) {
            player = findByPlayerId(playerId);
        }

        if (player == null) {
            playerId = UUID.randomUUID().toString();
            player = new PlayerEntity();
            player.setPlayerId(playerId);
            player.setCreatedAt(OffsetDateTime.now());
            entityManager.persist(player);
            entityManager.flush();
        }

        return new PlayerResolution(player, playerId);
    }

    public PlayerEntity requirePlayer(String requestedPlayerId) {
        PlayerResolution resolution = resolvePlayer(requestedPlayerId);
        return resolution.player();
    }

    public PlayerView toView(PlayerEntity player) {
        return new PlayerView(player.getPlayerId(), player.getCreatedAt());
    }

    private PlayerEntity findByPlayerId(String playerId) {
        PlayerEntity player = null;

        try {
            player = entityManager.createQuery("select p from PlayerEntity p where p.playerId = :playerId", PlayerEntity.class)
                    .setParameter("playerId", playerId)
                    .getSingleResult();
        } catch (NoResultException ignored) {
            player = null;
        }

        return player;
    }

    public List<PlayerEntity> listPlayers() {
        return entityManager.createQuery("select p from PlayerEntity p", PlayerEntity.class).getResultList();
    }
}