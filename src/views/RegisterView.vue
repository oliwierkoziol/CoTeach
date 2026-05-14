<template>
  <div class="min-h-[calc(100vh-64px)] w-full overflow-x-hidden relative grid lg:grid-cols-2 bg-gradient-to-br from-sidebar via-background to-card">
    <!-- Background Decoration -->
    <div class="fixed bottom-0 right-0 bg-[rgba(20,37,136,0.05)] blur-[60px] rounded-full w-[384px] h-[384px] pointer-events-none z-0" />

    <!-- Branding Side -->
    <div class="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-card/70 p-10 lg:flex z-10">
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,oklch(0.74_0.12_195/0.15),transparent_55%)]" />
      <div class="relative">
        <h2 class="font-['Plus_Jakarta_Sans'] mt-4 max-w-sm text-4xl font-extrabold leading-tight text-foreground tracking-tight">
          Załóż konto i od razu planuj lekcje.
        </h2>
      </div>
      <p class="relative font-['Plus_Jakarta_Sans'] text-sm font-medium text-muted-foreground">
        Zarejestruj się i zyskaj więcej czasu na to, co w nauczaniu najważniejsze. Ty prowadź lekcję, my zajmiemy się resztą.
      </p>
    </div>

    <div class="flex items-center justify-center px-4 py-12 sm:px-8 relative z-10">
      <div class="w-full max-w-md">
        <header class="mb-8 lg:text-left text-center">
          <h1 class="font-['Plus_Jakarta_Sans'] font-extrabold text-foreground text-[36px] tracking-[-0.9px] leading-[40px] mb-2">
            Dostęp do platformy
          </h1>
          <p class="font-['Plus_Jakarta_Sans'] text-muted-foreground text-[18px] leading-[28px]">
            Aktualnie rejestracja nowych kont jest ograniczona.
          </p>
        </header>

        <div v-if="registrationSuccess" class="rounded-xl border border-primary/30 bg-card p-10 text-center shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)]">
          <div class="mb-6 flex justify-center">
            <div class="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            </div>
          </div>
          <h2 class="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-foreground mb-4">Sprawdź swoją pocztę!</h2>
          <p class="font-['Plus_Jakarta_Sans'] text-muted-foreground mb-8">
            Wysłaliśmy link aktywacyjny na adres <span class="font-bold text-foreground">{{ registeredEmail }}</span>. 
            Kliknij go, aby potwierdzić konto i zacząć korzystać z CoTeach.
          </p>
          <div class="space-y-4">
            <button
              @click="registrationSuccess = false"
              class="w-full rounded-lg border border-border bg-background py-3 text-sm font-bold text-foreground transition hover:bg-muted"
            >
              Wróć do logowania
            </button>
            <p class="text-[11px] text-muted-foreground">
              Nie widzisz maila? Sprawdź folder Spam lub <router-link to="/login" class="text-primary font-bold">zaloguj się</router-link>, aby wysłać go ponownie.
            </p>
          </div>
        </div>

        <div class="rounded-xl border border-border bg-card p-8 shadow-[0px_12px_32px_0px_rgba(25,28,30,0.06)]">
          <div class="mb-6 flex justify-center text-primary/60">
            <div class="p-4 rounded-full bg-primary/5">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
          </div>
          
          <p class="font-['Plus_Jakarta_Sans'] text-foreground text-[16px] leading-[26px] text-center mb-8">
            Rejestracja została wyłączona. Jeśli jesteś testerem, a nie masz dostępu poiformuj nas mailowo: 
            <a href="mailto:kontakt@coteach.pl" class="text-primary font-bold hover:underline">kontakt@coteach.pl</a>
          </p>

          <router-link 
            to="/login" 
            class="flex items-center justify-center w-full rounded-lg bg-primary py-3.5 text-sm font-bold text-primary-foreground transition hover:opacity-90 shadow-[0px_10px_15px_-3px_rgba(20,37,136,0.2)]"
          >
            Wróć do logowania
          </router-link>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
</script>
