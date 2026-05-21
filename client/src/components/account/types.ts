export type StoredUser = {
  name: string
  email: string
  password: string
}

export type PublicUser = {
  name: string
  email: string
}

export type AccountView = 'login' | 'register' | 'cabinet'
