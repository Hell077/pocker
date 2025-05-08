export const ru = {
  common: {
    appName: 'PokerKingdom',
  },
  wheel: {
    spin: 'Крутить',
    you_won: 'Вы выиграли',
    reward_not_found: (amount: string | number) => `Награда ${amount}$ не найдена на колесе`,
    reward_fetch_error: (err: unknown) => `Ошибка при получении награды: ${err}`,
    spin_check_error: (err: unknown) => `Ошибка при проверке возможности вращения: ${err}`,
    next_spin_in: (formatted: string) => `Следующее вращение через ${formatted}`,
    load_rewards_error: (err: unknown) => `Не удалось загрузить список наград: ${err}`,
    invalid_data_format: 'Неверный формат данных',
  },

  nav: {
    lobby: 'Лобби',
    leaderboard: 'Лидерборд',
    profile: 'Профиль',
    login: 'Войти',
  },
  lobby: {
    pokerLobby: 'Покерное лобби',
    createTableDescription: 'Выбери настройки и создай стол',
    createRoomButton: 'Создать комнату',
    bet:'Ставка',
    players:'Игроков',
    join:'Войти'
  },
  createRoomModal: {
    title: 'Создать комнату',
    roomNamePlaceholder: 'Название комнаты',
    playersCountLabel: 'Количество игроков:',
    stakesLabel: 'Ставка:',
    createButton: 'Создать комнату',
  },
  footer: {
    aboutTitle: 'О ПЛАТФОРМЕ',
    aboutText: 'POCKER — онлайн-платформа для игры в покер с друзьями и соперниками со всего мира.',
    navigationTitle: 'НАВИГАЦИЯ',
    navLobby: 'Лобби',
    navTerms: 'Условия',
    navPrivacy: 'Конфиденциальность',
    contactsTitle: 'КОНТАКТЫ',
    contactEmail: 'support@pocker.com',
    contactTelegram: '@pocker_support',
    copyright: '© 2025 Pocker Inc. Все права защищены.',
  },
  leaderboard: {
    title: 'ЛИДЕРБОРД',
    firstPlace: '1 Место',
    secondPlace: '2 Место',
    thirdPlace: '3 Место',
    eloLabel: 'Elo',
    positionHeader: 'Позиция',
    nicknameHeader: 'Никнейм',
    eloHeader: 'ELO',
    load_error: (err: unknown) => `Ошибка загрузки лидерборда: ${err}`,

  },
  profile: {
    logout: 'Выйти',
    profileTab: 'Профиль',
    historyTab: 'История',
    settingsTab: 'Настройки',
    balance: 'Баланс:',
    gamesPlayed: 'Сыграно игр',
    wins: 'Побед',
    chipsWon: 'Выиграно фишек',
    eloRating: 'Рейтинг Elo',
    gamesHistory: 'История игр',
    settingsTitle: 'Настройки профиля',
    nickname: 'Никнейм',
    nicknamePlaceholder: 'Введите новый ник',
    avatar: 'Аватар',
    avatarPlaceholder: 'Ссылка на изображение',
    uploadHint: 'или загрузите своё изображение:',
    uploadFile: 'Загрузить файл',
    changePassword: 'Изменить пароль',
  },
  main:{
    luck:'Испытай удачу'
  }
};
