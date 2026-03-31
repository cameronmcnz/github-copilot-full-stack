package com.mcnz.copilot.rps.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "RPS_ROUND")
public class RoundEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "MATCH_REF", nullable = false)
    private MatchEntity match;

    @Column(name = "ROUND_NUMBER", nullable = false)
    private int roundNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "PLAYER_MOVE", nullable = false, length = 16)
    private Move playerMove;

    @Enumerated(EnumType.STRING)
    @Column(name = "COMPUTER_MOVE", nullable = false, length = 16)
    private Move computerMove;

    @Enumerated(EnumType.STRING)
    @Column(name = "OUTCOME", nullable = false, length = 16)
    private RoundOutcome outcome;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public MatchEntity getMatch() {
        return match;
    }

    public void setMatch(MatchEntity match) {
        this.match = match;
    }

    public int getRoundNumber() {
        return roundNumber;
    }

    public void setRoundNumber(int roundNumber) {
        this.roundNumber = roundNumber;
    }

    public Move getPlayerMove() {
        return playerMove;
    }

    public void setPlayerMove(Move playerMove) {
        this.playerMove = playerMove;
    }

    public Move getComputerMove() {
        return computerMove;
    }

    public void setComputerMove(Move computerMove) {
        this.computerMove = computerMove;
    }

    public RoundOutcome getOutcome() {
        return outcome;
    }

    public void setOutcome(RoundOutcome outcome) {
        this.outcome = outcome;
    }
}