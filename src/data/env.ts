export type EnvKey =
  | 'BASE_URL'
  | 'DEV'
  | 'MODE'
  | 'PROD'
  | 'SSR'
  | 'VITE_PORT'

export const getEnv = (key: EnvKey): any => {
  return import.meta.env[key]
}