<template>
  <div class="min-h-screen bg-background pt-24 pb-16 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <div class="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
        <!-- Navigation Tabs -->
        <div class="flex border-b border-border bg-muted/30">
          <button
            @click="activeTab = 'terms'"
            :class="activeTab === 'terms' ? 'border-primary text-primary bg-card' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'"
            class="flex-1 py-4 px-6 text-center text-sm font-bold border-b-2 transition-all"
          >
            Regulamin Serwisu
          </button>
          <button
            @click="activeTab = 'privacy'"
            :class="activeTab === 'privacy' ? 'border-primary text-primary bg-card' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'"
            class="flex-1 py-4 px-6 text-center text-sm font-bold border-b-2 transition-all"
          >
            Polityka Prywatności (RODO)
          </button>
        </div>

        <!-- Content Area -->
        <div class="p-8 sm:p-12 prose prose-invert max-w-none">
          <div v-if="activeTab === 'terms'" class="space-y-6">
            <h1 class="text-3xl font-extrabold tracking-tight text-foreground mb-8">Regulamin Serwisu CoTeach</h1>
            
            <section>
              <h2 class="text-xl font-bold text-foreground">§1 Postanowienia ogólne</h2>
              <p class="text-muted-foreground">
                Niniejszy regulamin określa zasady korzystania z platformy CoTeach, dostępnej pod adresem coteach.pl, której celem jest wsparcie nauczycieli w planowaniu lekcji i tworzeniu materiałów dydaktycznych.
              </p>
            </section>

            <section>
              <h2 class="text-xl font-bold text-foreground">§2 Definicje</h2>
              <ul class="list-disc pl-5 text-muted-foreground space-y-2">
                <li><strong>Serwis</strong> – platforma internetowa CoTeach.</li>
                <li><strong>Użytkownik</strong> – każda osoba fizyczna lub organizacja korzystająca z Serwisu.</li>
                <li><strong>Materiały</strong> – wszelkie treści, pliki, prezentacje i quizy generowane za pomocą Serwisu.</li>
              </ul>
            </section>

            <section>
              <h2 class="text-xl font-bold text-foreground">§3 Zasady korzystania</h2>
              <p class="text-muted-foreground">
                Użytkownik zobowiązuje się do korzystania z Serwisu w sposób zgodny z prawem oraz zasadami współżycia społecznego. Zakazane jest dostarczanie treści o charakterze bezprawnym.
              </p>
            </section>

            <section>
              <h2 class="text-xl font-bold text-foreground">§4 Prawa autorskie</h2>
              <p class="text-muted-foreground">
                Wszelkie materiały generowane przez AI w ramach Serwisu są przeznaczone do użytku edukacyjnego. Serwis nie rości sobie praw autorskich do treści wprowadzanych przez Użytkownika.
              </p>
            </section>

            <section>
              <h2 class="text-xl font-bold text-foreground">§5 Odpowiedzialność</h2>
              <p class="text-muted-foreground">
                Serwis dokłada wszelkich starań, aby treści generowane przez AI były poprawne merytorycznie, jednak nie gwarantuje ich bezbłędności. Użytkownik powinien każdorazowo weryfikować materiały przed ich wykorzystaniem na lekcji.
              </p>
            </section>
          </div>

          <div v-else class="space-y-6">
            <h1 class="text-3xl font-extrabold tracking-tight text-foreground mb-8">Klauzula Informacyjna (RODO)</h1>
            
            <section>
              <h2 class="text-xl font-bold text-foreground">1. Administrator Danych</h2>
              <p class="text-muted-foreground">
                Administratorem Państwa danych osobowych jest CoTeach Sp. z o.o. (w organizacji). W sprawach związanych z ochroną danych można kontaktować się pod adresem e-mail: kontakt@coteach.pl.
              </p>
            </section>

            <section>
              <h2 class="text-xl font-bold text-foreground">2. Cel i podstawa przetwarzania</h2>
              <p class="text-muted-foreground">
                Dane są przetwarzane w celu świadczenia usług drogą elektroniczną (Art. 6 ust. 1 lit. b RODO) oraz w celach analitycznych i marketingowych za Państwa zgodą.
              </p>
            </section>

            <section>
              <h2 class="text-xl font-bold text-foreground">3. Zakres danych</h2>
              <p class="text-muted-foreground">
                Przetwarzamy dane podane podczas rejestracji: imię i nazwisko, adres e-mail oraz opcjonalnie nazwę organizacji.
              </p>
            </section>

            <section>
              <h2 class="text-xl font-bold text-foreground">4. Okres przechowywania</h2>
              <p class="text-muted-foreground">
                Dane będą przechowywane przez okres posiadania konta w Serwisie lub do momentu wycofania zgody na ich przetwarzanie.
              </p>
            </section>

            <section>
              <h2 class="text-xl font-bold text-foreground">5. Prawa użytkownika</h2>
              <p class="text-muted-foreground">
                Przysługuje Państwu prawo dostępu do treści swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania oraz prawo do przenoszenia danych.
              </p>
            </section>
          </div>
        </div>
        
        <div class="bg-muted/30 p-6 border-t border-border text-center">
          <router-link to="/register" class="text-sm font-semibold text-primary hover:underline">
            Powrót do rejestracji
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const activeTab = ref('terms');

onMounted(() => {
  if (route.query.tab === 'privacy') {
    activeTab.value = 'privacy';
  }
});
</script>

<style scoped>
.prose h2 {
  margin-top: 2rem;
  margin-bottom: 1rem;
}
.prose p {
  line-height: 1.6;
}
</style>
