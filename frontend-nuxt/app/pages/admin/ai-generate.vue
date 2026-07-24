<template>
  <div class="ai-generate-page">
    <h1 class="page-title">AI Генерация новостей</h1>

    <div v-if="!authStore.isSuperAdmin" class="access-denied">
      <Message severity="error">
        Доступ запрещен. Только супер-администратор может генерировать новости.
      </Message>
    </div>

    <div v-else class="generate-content">
      <!-- Статус AI -->
      <Card class="status-card">
        <template #content>
          <div class="status-header">
            <i class="pi pi-cloud" style="font-size: 2rem; color: var(--primary-color)"></i>
            <div>
              <h3>Статус AI сервиса</h3>
              <p v-if="aiStatus === null">Проверка...</p>
              <p v-else-if="aiStatus" class="status-online">
                <i class="pi pi-check-circle"></i> Онлайн
              </p>
              <p v-else class="status-offline"><i class="pi pi-times-circle"></i> Офлайн</p>
            </div>
          </div>
        </template>
      </Card>

      <!-- Ручная генерация -->
      <Card class="generate-card">
        <template #header>
          <div class="card-header">
            <h3>Ручная генерация</h3>
          </div>
        </template>
        <template #content>
          <div class="generate-form">
            <div class="form-field">
              <label>Категория</label>
              <Dropdown
                v-model="generateForm.category"
                :options="categories"
                option-label="label"
                option-value="value"
                placeholder="Выберите категорию"
                class="w-full"
              />
            </div>

            <div class="form-field">
              <label>Тема (опционально)</label>
              <InputText
                v-model="generateForm.topic"
                placeholder="Например: искусственный интеллект"
                class="w-full"
              />
            </div>

            <div class="form-field">
              <label>Количество новостей</label>
              <InputNumber v-model="generateForm.count" :min="1" :max="5" class="w-full" />
            </div>

            <Button
              label="Сгенерировать"
              icon="pi pi-bolt"
              severity="primary"
              :loading="isGenerating"
              @click="generateNews"
            />
          </div>
        </template>
      </Card>

      <!-- Авто-генерация -->
      <Card class="generate-card">
        <template #header>
          <div class="card-header">
            <h3>Автоматическая генерация</h3>
          </div>
        </template>
        <template #content>
          <div class="generate-form">
            <div class="form-field">
              <label>Количество на категорию</label>
              <InputNumber v-model="autoGenerateCount" :min="1" :max="10" class="w-full" />
            </div>

            <p class="generate-info">
              Будут сгенерированы новости для всех категорий (по {{ autoGenerateCount }} шт. на
              каждую)
            </p>

            <Button
              label="Запустить авто-генерацию"
              icon="pi pi-cog"
              severity="warning"
              :loading="isAutoGenerating"
              @click="autoGenerate"
            />
          </div>
        </template>
      </Card>

      <!-- Сообщения -->
      <Message v-if="error" severity="error" :closable="true" @close="error = ''">
        {{ error }}
      </Message>
      <Message v-if="success" severity="success" :closable="true" @close="success = ''">
        {{ success }}
      </Message>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NewsCategory } from '@/app/types';
import Card from 'primevue/card';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Message from 'primevue/message';

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
});

const authStore = useAuthStore();
const aiService = useAiService();

const aiStatus = ref<boolean | null>(null);
const isGenerating = ref(false);
const isAutoGenerating = ref(false);
const autoGenerateCount = ref(1);
const error = ref('');
const success = ref('');

const generateForm = ref({
  category: null as NewsCategory | null,
  topic: '',
  count: 1,
});

const categories = [
  { label: 'Политика', value: 'politics' },
  { label: 'Экономика', value: 'economy' },
  { label: 'Технологии', value: 'technology' },
  { label: 'Наука', value: 'science' },
  { label: 'Спорт', value: 'sports' },
  { label: 'Развлечения', value: 'entertainment' },
  { label: 'Здоровье', value: 'health' },
  { label: 'Мир', value: 'world' },
  { label: 'Другое', value: 'other' },
];

// Проверка прав
if (!authStore.isSuperAdmin) {
  // Не делаем редирект, показываем сообщение
}

onMounted(async () => {
  await checkAiStatus();
});

async function checkAiStatus() {
  try {
    const status = await aiService.checkStatus();
    aiStatus.value = status?.available || false;
  } catch {
    aiStatus.value = false;
  }
}

async function generateNews() {
  if (!generateForm.value.category) {
    error.value = 'Выберите категорию';
    return;
  }

  try {
    isGenerating.value = true;
    error.value = '';
    success.value = '';

    await aiService.generateNews({
      category: generateForm.value.category,
      topic: generateForm.value.topic || undefined,
      count: generateForm.value.count,
    });

    success.value = `Сгенерировано новостей: ${generateForm.value.count}`;
    generateForm.value.topic = '';
  } catch (err: any) {
    error.value = err.message || 'Ошибка при генерации';
  } finally {
    isGenerating.value = false;
  }
}

async function autoGenerate() {
  try {
    isAutoGenerating.value = true;
    error.value = '';
    success.value = '';

    await aiService.autoGenerate({
      countPerCategory: autoGenerateCount.value,
    });

    success.value = 'Авто-генерация успешно запущена';
  } catch (err: any) {
    error.value = err.message || 'Ошибка при авто-генерации';
  } finally {
    isAutoGenerating.value = false;
  }
}
</script>

<style scoped>
.ai-generate-page {
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 2rem;
}

.access-denied {
  max-width: 500px;
  margin: 0 auto;
}

.generate-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.status-card {
  background-color: var(--surface-card);
  border: 1px solid var(--surface-border);
}

.status-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status-header h3 {
  color: var(--text-color);
  margin-bottom: 0.25rem;
}

.status-online {
  color: #22c55e;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.status-offline {
  color: #ef4444;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.generate-card {
  background-color: var(--surface-card);
  border: 1px solid var(--surface-border);
}

.card-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--surface-border);
}

.card-header h3 {
  color: var(--text-color);
  margin: 0;
}

.generate-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field label {
  font-weight: 500;
  color: var(--text-color);
  font-size: 0.875rem;
}

.generate-info {
  color: var(--text-color-secondary);
  font-size: 0.875rem;
  padding: 0.5rem;
  background-color: var(--surface-hover);
  border-radius: var(--border-radius);
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }
}
</style>
