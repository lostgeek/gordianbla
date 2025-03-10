// const nrdbBaseUrl
//     = process.env.NODE_ENV === 'production'
//       ? 'https://netrunnerdb.com/api/2.0/public'
//       : '/dev_nrdb_api'
const nrdbBaseUrl = 'https://netrunnerdb.com/api/2.0/public'

export interface NrdbCard {
  code: string
  deck_limit: number
  faction_code: string
  faction_cost: number
  pack_code: string
  position: number
  quantity: number
  side_code: string
  stripped_title: string
  title: string
  type_code: string
  uniqueness: boolean
  flavor?: string
  influence_limit?: number
  keywords?: string
  minimum_deck_size?: number
  illustrator?: string
  stripped_text?: string
  text?: string
}

export interface NrdbPack {
  code: string
  cycle_code: string
  date_release: string
  name: string
  position: number
  size: number
}

export const useNrdb = defineStore('nrdbStore', {
  state: () => ({
    cards: [] as Array<NrdbCard>,
    imageUrlTemplate: '',
    packs: [] as Array<NrdbPack>,
  }),
  getters: {
    packsInFormat(nrdb) {
      return {
        eternal: null,
        standard: nrdb.packsInCycles([
          'red-sand',
          'kitara',
          'reign-and-reverie',
          'magnum-opus',
          'ashes',
          'magnum-opus-reprint',
          'system-gateway',
          'system-update-2021',
          'borealis',
          'liberation',
        ]),
        neo: nrdb.packsInCycles([
          'ashes',
          'system-gateway',
          'system-update-2021',
          'borealis',
          'liberation',
        ]),
        startup: nrdb.packsInCycles([
          'system-gateway',
          'system-update-2021',
          'liberation',
        ]),
      }
    },
  },
  actions: {
    packsInCycles(cycleCodes: string[]) {
      return this.packs.filter(p => cycleCodes.includes(p.cycle_code))
    },
    async fetch(reload = false) {
      if (this.cards.length === 0 || reload) {
        const data = await $fetch(
                    `${nrdbBaseUrl}/cards`,
        ) as any

        this.cards = (data?.data ?? [])
        this.imageUrlTemplate = data.imageUrlTemplate
      }
      if (this.packs.length === 0 || reload) {
        const data = await $fetch(
                    `${nrdbBaseUrl}/packs`,
        ) as any

        this.packs = (data?.data ?? [])
      }
    },
  },
})
