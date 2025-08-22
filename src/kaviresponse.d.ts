export interface SeriesResponseRoot {
  count: number
  programs: Program[]
  err: any
}

export interface Program {
  _id: string
  sequenceId: number
  programType: number
  episodes: Episodes
  classifications: any[]
  actors: string[]
  directors: any[]
  legacyGenre: any[]
  genre: any[]
  productionCompanies: string[]
  country: string[]
  nameOther: any[]
  nameSv: any[]
  nameFi: string[]
  name: string[]
  __v?: number
  agelimitForSorting?: number
  deleted?: boolean
  synopsis?: string
  year?: string
}

export interface Episodes {
  count: number
  criteria: number[]
  legacyAgeLimit?: number
  agelimit: number
  warnings: string[]
  warningOrder: string[]
}

export interface EpisodeRoot {
  _id: string
  sequenceId: number
  programType: number
  year?: string
  synopsis: string
  episodes: IEpisodes
  classifications: Partial<Classification>[]
  actors: string[]
  directors: string[]
  legacyGenre: string[]
  genre: string[]
  productionCompanies: string[]
  country: string[]
  nameOther: string[]
  nameSv: any[]
  nameFi: string[]
  name: string[]
  __v?: number
  episode: number
  season: number
  series: Series
  agelimitForSorting: number
}

export interface IEpisodes {
  warningOrder: any[]
  warnings: any[]
  criteria: any[]
}

export interface Classification {
  format: string
  duration: string
  creationDate: string
  registrationDate: string
  status: string
  agelimit: number
  isReclassification: boolean
  _id: string
  warnings: string[]
  warningOrder: string[]
  criteria: number[]
  comments: string
  userComments: string
  reason?: number
  authorOrganization?: number
  publicComments?: string
}

export interface Series {
  _id: string
  name: string
}
