<template>
    <Menubar class="header" :model="items" breakpoint="1200px">
        <template #start>
            <NuxtLink class="headerLink" to="/daily/eternal">Gordian Blade</NuxtLink>
        </template>
        <template #item="{ item, props, hasSubmenu }">
            <NuxtLink v-ripple class="p-ripple p-menuitem-link" v-if="item.route" :to="item.route">
                <span class="p-menuitem-icon" :class="item.icon" />
                <span class="p-menuitem-text">{{ item.label }}</span>
                <Badge v-if="item.badge" :severity="item.badge.severity" :value="item.badge.value" />
            </NuxtLink>
            <a v-else v-ripple class="p-ripple p-menuitem-link" :href="item.url" :target="item.target" v-bind="props.action">
                <svg v-if="item.icon === 'nbn'" class="p-menuitem-icon" :style="{fill: '#ffde00', height: '20px'}" viewBox="0 0 1 1">
                  <use xlink:href="/icons.svg#faction-nbn"></use>
                </svg>
                <span v-else class="p-menuitem-icon" :class="item.icon" />
                <span class="p-menuitem-text">{{ item.label }}</span>
                <Badge v-if="item.badge" :severity="item.badge.severity" :value="item.badge.value" />
                <span v-if="hasSubmenu" class="p-submenu-icon fa-solid fa-caret-down" />
            </a>
        </template>
    </Menubar>
    <Dialog v-model:visible="loginVisible" modal header="" :style="{ width: '25rem' }">
      <template #header>
        <div class="dialogheader">
          <svg :style="{fill: '#ffde00', height: '48px'}" viewBox="0 0 1 1">
            <use xlink:href="/icons.svg#faction-nbn"></use>
          </svg>
          <span>NBN HoloNet Login</span>
        </div>
      </template>
      <div class="logingrid">
          <label for="username">Username</label>
          <InputText id="username" autocomplete="off" v-model="username"  />
          <label for="password">Password</label>
          <Password :feedback="false" id="password" autocomplete="off" v-model="password" />
      </div>
      <template #footer>
          <Button type="button" ref="loginButton" label="Login" severity="warning" @click="() => {loginVisible = false; navigateTo('/holonet')}" :disabled="!finished"></Button>
      </template>
  </Dialog>
</template>

<script setup>
const loginButton = ref();
const loginVisible = ref(false);
const username = ref("");
const password = ref("");
const fullUsername = "TheHoloMan";
const fullPassword = "Y0uActua11yCh3ck3d.C0ngr4t5";
const finished = ref(false)

function startFillUsername() {
  let usernameCount = 0;
  const int = setInterval(() => {
    if (usernameCount > fullUsername.length) {
      clearInterval(int);
      setTimeout(startFillPassword, 700);
      return;
    }
    username.value = fullUsername.slice(0, usernameCount);
    usernameCount++;
  }, 100);
}

function startFillPassword() {
  let passwordCount = 0;
  const int = setInterval(() => {
    if (passwordCount > fullPassword.length) {
      clearInterval(int);
      setTimeout(() => {
        finished.value = true;
      }, 100);
      return;
    }
    password.value = fullPassword.slice(0, passwordCount);
    passwordCount++;
  }, 100);
}

function startLogin() {
  username.value = "";
  password.value = "";
  loginVisible.value = true;
  finished.value = false;
  setTimeout(startFillUsername, 500);
}

const loaded = useState('siteLoaded', () => false);

const user = useUser();

const { data: newestArticle } = await useAsyncData('newestArticle', () => queryContent('news')
    .sort({ publishedAt: -1 })
    .find(),
    { transform: (articles) => articles[0] }); // findOne does not work for some reason

const unreadArticles = computed(() => {
    if(newestArticle.value && newestArticle.value.id > user.newestArticleViewed) {
        return {severity: 'primary', value: "New update!"};
    }
});

const route = useRoute();
const items = ref([
    {
        label: 'Daily Puzzle',
        icon: 'fa-solid fa-calendar',
        items: [
            {
                label: 'Eternal',
                route: '/daily/eternal',
            },
            {
                label: 'Standard',
                route: '/daily/standard',
            },
            {
                label: 'Neo (All-NSG)',
                route: '/daily/neo',
            },
            {
                label: 'Startup',
                route: '/daily/startup',
            },
        ],
    },
    {
        label: 'Rules',
        visible: () => (route.path.startsWith("/daily") || route.path == '/practice'),
        icon: 'fa-solid fa-scale-balanced',
        active: loaded,
        command: showRules,
    },
    {
        label: 'Statistics',
        visible: () => route.path.startsWith("/daily"),
        icon: 'fa-solid fa-chart-simple',
        command: showStatistics,
    },
    {
        label: 'News',
        icon: 'fa-solid fa-newspaper',
        badge: unreadArticles,
        route: '/news',
    },
    {
        label: 'Settings',
        icon: 'fa-solid fa-gears',
        route: '/settings',
    },
    {
        label: 'NBN HoloNet Login',
        icon: 'nbn',
        command: () => {
          if(!route.path.startsWith('/holonet')) {
            startLogin()
          }
        }
    },
    {
        label: 'More',
        icon: 'fa-solid fa-ellipsis',
        class: 'open-left',
        items: [
            {
                label: 'Practice',
                icon: 'fa-solid fa-fw fa-gamepad',
                route: '/practice',
            },
            {
                label: 'RSS Feeds',
                icon: 'fa-solid fa-fw fa-rss',
                route: '/rss',
            },
            {
                label: 'About',
                icon: 'fa-solid fa-fw fa-circle-info',
                route: '/about',
            },
        ],
    },
])
const statisticsVisible = useState('statisticsVisible', () => false);
const rulesVisible = useState('rulesVisible', () => false);

function showStatistics() {
    statisticsVisible.value = true;
}
function showRules() {
    rulesVisible.value = true;
}
</script>

<style lang="scss" scoped>
.headerLink {
    color: var(--text-color);
    text-decoration: none;
    font-family: 'Patua One', system-ui, sans-serif;
    font-size: 2rem;
}
.p-menubar {
    width: 100%;
    margin-bottom: 1rem;
    justify-content: space-between;
}
.p-badge {
    margin-left: .25rem;
}

.header:deep(.open-left .p-submenu-list) {
    right: 0;
    left: initial !important;
}

@media(max-width:1200px) {
    .header:deep(.p-menuitem-icon) {
        // copied from .fa-fw
        text-align: center;
        width: 1.25em;
    }
}

.dialogheader {
  font-size: 120%;
  display: flex;
  align-items: center;
  gap: .75rem;
}

.logingrid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: .75rem;
  align-items: baseline;
  font-size: 1.1rem;

  & label {
    justify-self: end;
  }
  & input {
    grid-column: span 2 / span 2;
  }
}
</style>
