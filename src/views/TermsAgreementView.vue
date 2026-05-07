<template>
  <div class="min-h-screen bg-gradient-to-br from-sidebar via-background to-card flex items-center justify-center p-4 sm:p-6">
    <div class="max-w-2xl w-full">
      <div class="bg-card border border-border rounded-3xl shadow-2xl p-8 sm:p-12 relative overflow-hidden">
        <!-- Decoration -->
        <div class="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-primary/5 blur-3xl rounded-full"></div>
        
        <div class="relative z-10">
          <header class="mb-10 text-center">
            <div class="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h1 class="text-3xl font-extrabold text-foreground tracking-tight mb-3">Witaj w CoTeach!</h1>
            <p class="text-muted-foreground text-lg">
              Zanim zaczniemy, prosimy o zapoznanie się i zaakceptowanie naszych zasad.
            </p>
          </header>

          <div class="space-y-6 mb-10">
            <div class="flex items-start gap-4 p-4 rounded-xl bg-muted/50 border border-border/50">
              <input 
                id="terms" 
                type="checkbox" 
                v-model="acceptedTerms"
                class="mt-1 w-5 h-5 rounded border-border text-primary focus:ring-primary bg-background"
              >
              <label for="terms" class="text-sm text-foreground leading-relaxed">
                Oświadczam, że zapoznałem się z <router-link to="/legal?tab=terms" target="_blank" class="text-primary font-bold hover:underline">Regulaminem Serwisu</router-link> i akceptuję jego postanowienia.
              </label>
            </div>

            <div class="flex items-start gap-4 p-4 rounded-xl bg-muted/50 border border-border/50">
              <input 
                id="rodo" 
                type="checkbox" 
                v-model="acceptedRodo"
                class="mt-1 w-5 h-5 rounded border-border text-primary focus:ring-primary bg-background"
              >
              <label for="rodo" class="text-sm text-foreground leading-relaxed">
                Wyrażam zgodę na przetwarzanie moich danych osobowych zgodnie z <router-link to="/legal?tab=privacy" target="_blank" class="text-primary font-bold hover:underline">Polityką Prywatności (RODO)</router-link> w celu korzystania z usług Serwisu.
              </label>
            </div>
          </div>

          <div class="flex flex-col gap-4">
            <button
              @click="handleAccept"
              :disabled="!isReady || loading"
              class="w-full py-4 px-6 rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
            >
              <span v-if="loading" class="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></span>
              Zatwierdzam i przechodzę do panelu
            </button>
            <button 
              @click="handleLogout"
              class="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium text-center"
            >
              Wyloguj się
            </button>
          </div>

          <div v-if="error" class="mt-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center font-medium">
            {{ error }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase';

const router = useRouter();
const acceptedTerms = ref(false);
const acceptedRodo = ref(false);
const loading = ref(false);
const error = ref('');

const isReady = computed(() => acceptedTerms.value && acceptedRodo.value);

function normalizeBaseUrl(url) {
  return String(url || "").trim().replace(/\/$/, "");
}

const API_BASE = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL) || "";

async function handleAccept() {
  if (!isReady.value) return;
  
  loading.value = true;
  error.value = '';
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    const token = session?.access_token;

    if (!user || !token) throw new Error('Brak zalogowanego użytkownika.');

    // 1. Update terms acceptance in profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ terms_accepted: true, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (updateError) throw updateError;

    // 2. Grant 7-day trial license automatically
    try {
      await fetch(`${API_BASE}/api/account/grant-license`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
    } catch (trialErr) {
      console.error('Trial auto-grant failed:', trialErr);
      // We don't block the user if trial grant fails, they can try again from dashboard
    }

    router.push('/dashboard');
  } catch (err) {
    console.error('Error accepting terms:', err);
    error.value = 'Wystąpił błąd podczas zapisywania zgody. Spróbuj ponownie.';
  } finally {
    loading.value = false;
  }
}

async function handleLogout() {
  await supabase.auth.signOut();
  router.push('/login');
}
</script>
