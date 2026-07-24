export function useAppToast() {
  const toast = useToast();

  function showSuccess(detail: string, summary = 'Успешно', life = 3000) {
    toast.add({ severity: 'success', summary, detail, life });
  }

  function showError(detail: string, summary = 'Ошибка', life = 5000) {
    toast.add({ severity: 'error', summary, detail, life });
  }

  function showWarning(detail: string, summary = 'Предупреждение', life = 4000) {
    toast.add({ severity: 'warn', summary, detail, life });
  }

  function showInfo(detail: string, summary = 'Информация', life = 3000) {
    toast.add({ severity: 'info', summary, detail, life });
  }

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}
