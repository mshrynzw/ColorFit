type GsapApi = {
  gsap: typeof import('gsap').default
  ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger
}

let registered = false
let loading: Promise<GsapApi> | null = null

export async function loadGsap(): Promise<GsapApi> {
  if (!loading) {
    loading = Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
      ([{ default: gsap }, { ScrollTrigger }]) => {
        if (!registered) {
          gsap.registerPlugin(ScrollTrigger)
          registered = true
        }
        return { gsap, ScrollTrigger }
      },
    )
  }

  return loading
}
