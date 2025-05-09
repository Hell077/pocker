export interface Table {
  id: number;
  name: string;
  players: number;
  maxPlayers: number;
}

export interface Player {
  id: string;
  name: string;
  chips: number;
  seat: number;
  isTurn?: boolean;
  bet?: number;
}

export interface SocketMessage {
  type:
    | "PLAYER_JOIN"
    | "PLAYER_LEAVE"
    | "TABLES_LIST"
    | "TABLE_CREATED"
    | "TABLE_REMOVED"
    | "TABLE_UPDATED"
    | "TABLE_STATE"
    | "PLAYER_JOINED"
    | "PLAYER_LEFT"
    | string;
  id?: string;
  name?: string;
  chips?: number;
  seat?: number;
  tables?: Table[];
  table?: Table;
  tableId?: number;
  players?: Player[];
  player?: Player;
  playerId?: string;
  payload?: unknown;
}
