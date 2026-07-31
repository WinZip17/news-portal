<script setup lang="ts">
import { useUIStore } from '@/stores';
const { isDark, toggleTheme, theme } = useUIStore();
</script>

<template>
  <v-container class="fill-height">
    <v-row justify="center">
      <v-col cols="8">
        <v-card>
          <v-card-title> News Portal </v-card-title>

          <v-card-text>
            Theme:
            {{ isDark ? 'Dark' : 'Light' }}
            ... {{ theme }}
          </v-card-text>

          <v-card-actions>
            <v-btn color="primary" @click="toggleTheme"> Toggle theme </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
