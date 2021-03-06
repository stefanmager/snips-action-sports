import { slot } from '../slot'
import { i18n, logger, config } from 'snips-toolkit'

export type SportMapping = {
    id: string,
    name: string
}

export type TeamMapping = {
    id: string,
    name: string,
    sport: SportMapping
}

export type TournamentMapping = {
    id: string,
    name: string,
    sport: SportMapping
}

export class SportHomogeneousness {
    homogeneous: boolean;
    message: string;

    constructor(homegeneous: boolean, message: string) {
        this.homogeneous = homegeneous
        this.message = message
    }
}

export class Mappings {
    teams: TeamMapping[];
    tournament: TournamentMapping;
    homogeneousness: SportHomogeneousness;

    constructor(teams: TeamMapping[], tournament: TournamentMapping) {
        this.teams = teams
        this.tournament = tournament
        this.homogeneousness = this.checkSportHomogeneousness()
    }

    checkSportHomogeneousness(): SportHomogeneousness {
        let homogeneous = true
        let message: string = null

        switch (this.teams.length) {
            case 1:
                if (this.tournament && this.teams[0].sport.id !== this.tournament.sport.id) {
                    homogeneous = false
                    message = i18n.translate('sports.dialog.teamDifferentSportFromTournament')
                }
                break
            case 2:
                if (this.teams[0].sport.id !== this.teams[1].sport.id) {
                    homogeneous = false
                    message = i18n.translate('sports.dialog.teamsDifferentSports')
                }
                if (this.tournament && this.teams[0].sport.id !== this.tournament.sport.id) {
                    homogeneous = false
                    message = i18n.translate('sports.dialog.teamsDifferentSportFromTournament')
                }
        }
    
        return new SportHomogeneousness(homogeneous, message)
    }
}

export const reader = function (teamNames: string[], tournamentName: string): Mappings {
    const mapping = require(`../../../assets/mappings/${ config.get().locale }.json`)

    let teams: TeamMapping[] = []
    let tournament: TournamentMapping

    // Searching for the teams ids
    if (!slot.missing(teamNames)) {
        for (let teamName of teamNames) {
            const matchingTeam = mapping.teams[teamName.toLowerCase()]

            if (!matchingTeam || !matchingTeam.id) {
                throw new Error('team')
            }
    
            teams.push(matchingTeam)
            logger.debug(matchingTeam)
        }
    }
    
    // Searching for the tournament id
    if (!slot.missing(tournamentName)) {
        const matchingTournament = mapping.tournaments[tournamentName.toLowerCase()]
        
        if (!matchingTournament || !matchingTournament.id) {
            throw new Error('tournament')
        }

        tournament = matchingTournament
        logger.debug(tournament)
    }

    return new Mappings(teams, tournament)
}
