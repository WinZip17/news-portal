<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import { useHead } from '@unhead/vue';
import { HOME_NEWS_KEY } from '@/composables/useHomeNews';
import NewspaperLeadStory from '@/components/newspaper/NewspaperLeadStory.vue';
import NewspaperTeaser from '@/components/newspaper/NewspaperTeaser.vue';
import NewspaperArticle from '@/components/newspaper/NewspaperArticle.vue';
import NewspaperBriefList from '@/components/newspaper/NewspaperBriefList.vue';
import NewspaperDetailDialog from '@/components/newspaper/NewspaperDetailDialog.vue';
import { getCategoryLabel } from '@/utils/getCategoryLabel';
import { formatDate } from '@/utils/formatDate';
import type { News } from '@/types';

const homeNews = inject(HOME_NEWS_KEY);
if (!homeNews) {
  throw new Error('HomeView must be rendered inside HomeLayout');
}

const { news, loading, error } = homeNews;

const selectedNews = ref<News | null>(null);
const modalVisible = ref(false);

const leadStory = computed(() => news.value[0] ?? null);
const teasers = computed(() => news.value.slice(1, 4));
const columnArticles = computed(() => news.value.slice(4, 10));
const briefItems = computed(() => news.value.slice(10, 15));

useHead({ title: 'Главный выпуск' });

function openNews(item: News) {
  selectedNews.value = item;
  modalVisible.value = true;
}

function articleDate(item: News) {
  return formatDate(item.publishedAt ?? item.createdAt);
}
</script>

<template>
  <div class="newspaper-issue">
    <div v-if="loading" class="newspaper-loading" aria-busy="true">
      <div class="newspaper-loading__bar newspaper-loading__bar--wide" />
      <div class="newspaper-loading__bar" />
      <div class="newspaper-loading__bar" />
      <p>Готовим выпуск…</p>
    </div>

    <div v-else-if="error" class="newspaper-empty">
      <p>{{ error }}</p>
    </div>

    <div v-else-if="!leadStory" class="newspaper-empty">
      <p>Нет опубликованных материалов с фотографиями для главного выпуска.</p>
    </div>

    <template v-else>
      <section v-if="teasers.length" class="newspaper-teasers" aria-label="На первой полосе">
        <NewspaperTeaser
          v-for="(item, idx) in teasers"
          :key="item.id"
          :item="item"
          :index="idx + 2"
          @click="openNews(item)"
        />
      </section>

      <div class="newspaper-body">
        <div class="newspaper-body__main">
          <NewspaperLeadStory
            :item="leadStory"
            :category-label="getCategoryLabel(leadStory.category)"
            :formatted-date="articleDate(leadStory)"
            @click="openNews(leadStory)"
          />

          <section v-if="columnArticles.length" class="newspaper-columns" aria-label="Полоса">
            <NewspaperArticle
              v-for="item in columnArticles"
              :key="item.id"
              :item="item"
              :category-label="getCategoryLabel(item.category)"
              :formatted-date="articleDate(item)"
              @click="openNews(item)"
            />
          </section>
        </div>

        <NewspaperBriefList v-if="briefItems.length" :items="briefItems" @select="openNews" />
      </div>
    </template>

    <NewspaperDetailDialog v-model="modalVisible" :news="selectedNews" />
  </div>
</template>
