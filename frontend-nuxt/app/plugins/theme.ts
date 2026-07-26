export default defineNuxtPlugin(() => {
  const themeCookie = useCookie<'light' | 'dark'>('theme', {
    default: () => 'light',
    sameSite: 'lax',
  });
  const uiStore = useUIStore();
  const theme = themeCookie.value === 'dark' ? 'dark' : 'light';
  if (theme) {
    uiStore.setServerTheme(theme);
    useHead({
      htmlAttrs: {
        class: computed(() => (theme === 'dark' ? 'p-dark' : undefined)),
      },
    });
  }
});
