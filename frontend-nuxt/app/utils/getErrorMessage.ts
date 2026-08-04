export function getErrorMessage(err: unknown, message = 'Неизвестная ошибка'): string {
  if (err instanceof Error) return err.message;
  return message;
}
