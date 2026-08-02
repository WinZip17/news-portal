import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export type Theme = 'light' | 'dark';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  description?: string;
  duration?: number;
}

export const useUIStore = defineStore('ui', () => {
  const theme = ref<Theme>((localStorage.getItem('theme') as Theme) || 'light');

  const sidebarCollapsed = ref(false);

  const loading = ref(false);

  const modalVisible = ref<Record<string, boolean>>({});

  const notifications = ref<Notification[]>([]);

  const isDark = computed(() => theme.value === 'dark');

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', theme.value);
  }

  function setTheme(value: Theme) {
    theme.value = value;
    localStorage.setItem('theme', value);
  }

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  }

  function setLoading(value: boolean) {
    loading.value = value;
  }

  function setModalVisible(modal: string, visible: boolean) {
    modalVisible.value[modal] = visible;
  }

  function addNotification(notification: Notification) {
    notifications.value.push(notification);
  }

  function removeNotification(id: string) {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  }

  function clearNotifications() {
    notifications.value = [];
  }

  return {
    theme,
    isDark,

    sidebarCollapsed,
    loading,
    modalVisible,
    notifications,

    toggleTheme,
    setTheme,
    toggleSidebar,
    setLoading,
    setModalVisible,
    addNotification,
    removeNotification,
    clearNotifications
  };
});
