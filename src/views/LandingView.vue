<template>
  <div class="relative overflow-hidden bg-background text-foreground">
    <div class="pointer-events-none absolute inset-0 opacity-60">
      <div class="absolute -left-20 top-10 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div class="absolute right-0 top-0 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl" />
      <div class="absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-amber-300/20 blur-3xl" />
    </div>

    <section class="relative mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 lg:px-8 lg:pt-20">
      <div class="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p class="mb-3 inline-flex items-center rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Asystent AI dla nauczycieli
          </p>
          <h1 class="text-4xl font-black leading-tight sm:text-5xl">
            Prowadź lekcję,
            <span class="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">nie walcz z notatkami</span>
          </h1>
          <p class="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            CoTeach zamienia Twoje materiały w plan lekcji, śledzi realizację podtematów na żywo i tworzy gotową notatkę końcową dla uczniów.
          </p>

          <div class="mt-8 flex flex-wrap gap-3">
            <RouterLink
              to="/register"
              class="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Załóż konto
            </RouterLink>
            <RouterLink
              to="/dashboard"
              class="rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted/40"
            >
              Przejdź do panelu
            </RouterLink>
          </div>

         
        </div>

        <div class="rounded-3xl border border-border bg-card/90 p-6 shadow-xl shadow-blue-900/5 backdrop-blur">
          <div class="rounded-2xl border border-border bg-background p-5">
            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Przepływ lekcji</p>
            <ol class="mt-4 space-y-4 text-sm">
              <li class="flex items-start gap-3">
                <span class="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-700 font-bold dark:text-cyan-300">1</span>
                <div>
                  <p class="font-semibold">Dodajesz temat i klasę</p>
                  <p class="text-muted-foreground">Wklejasz notatkę lub wybierasz zapisaną.</p>
                </div>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-blue-700 font-bold dark:text-blue-300">2</span>
                <div>
                  <p class="font-semibold">AI układa plan punkt po punkcie</p>
                  <p class="text-muted-foreground">Ty możesz ręcznie zatwierdzać realizację podtematów.</p>
                </div>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-700 font-bold dark:text-amber-300">3</span>
                <div>
                  <p class="font-semibold">Na końcu generujesz notatkę dla uczniów</p>
                  <p class="text-muted-foreground">Gotową do udostępnienia linkiem lub QR.</p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </section>

    <section class="relative border-y border-border bg-card/50 py-14">
      <div class="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
        <article class="rounded-2xl border border-border bg-card p-6">
          <p class="text-sm font-semibold text-foreground">Generator notatek</p>
          <p class="mt-2 text-sm leading-6 text-muted-foreground">Twórz i zapisuj notatki przed lekcją, a potem używaj ich do planu jednym kliknięciem.</p>
        </article>
        <article class="rounded-2xl border border-border bg-card p-6">
          <p class="text-sm font-semibold text-foreground">Lekcja na żywo</p>
          <p class="mt-2 text-sm leading-6 text-muted-foreground">Monitoruj postęp i ręcznie oznaczaj omówione punkty, gdy to Ty decydujesz o tempie.</p>
        </article>
        <article class="rounded-2xl border border-border bg-card p-6">
          <p class="text-sm font-semibold text-foreground">Archiwum i udostępnianie</p>
          <p class="mt-2 text-sm leading-6 text-muted-foreground">Edytuj metadane końcowej notatki, udostępniaj uczniom i zachowuj porządek materiałów.</p>
        </article>
      </div>
    </section>

    <section class="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div class="rounded-3xl border border-border bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-amber-500/10 p-8 sm:p-10">
        <h2 class="text-2xl font-black sm:text-3xl">Gotowy, żeby uprościć przygotowanie lekcji?</h2>
        <p class="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
          Wchodzisz, tworzysz plan, prowadzisz lekcję i kończysz z estetyczną notatką. Bez chaosu i bez ręcznego przepisywania.
        </p>
        <div class="mt-6 flex flex-wrap gap-3">
          <RouterLink
            to="/register"
            class="rounded-xl bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90"
          >
            Zacznij za darmo
          </RouterLink>
          <RouterLink
            to="/login"
            class="rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted/40"
          >
            Mam już konto
          </RouterLink>
        </div>
      </div>
    </section>
    <footer class="border-t border-border bg-card/30 px-4 py-8 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="text-[10px] sm:text-xs text-muted-foreground">
          &copy; Copyright CoTeach {{ new Date().getFullYear() }}. Wszelkie prawa zastrzeżone.
        </div>
        <div class="flex gap-6 text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">
          <router-link to="/legal?tab=terms" class="hover:text-primary transition-colors">Regulamin</router-link>
          <router-link to="/legal?tab=privacy" class="hover:text-primary transition-colors">RODO</router-link>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase';

const router = useRouter();

onMounted(async () => {
  const { data } = await supabase.auth.getSession();
  if (data?.session) {
    router.replace('/dashboard');
  }
});
</script>
