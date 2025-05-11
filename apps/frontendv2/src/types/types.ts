export interface Player {
  id: string
  nickname: string
  avatarUrl: string
  chips: number
  cards?: string[]
  hasFolded?: boolean
}
